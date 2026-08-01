import { getCrop, getGrowthMs } from '../data/crops.js';
import {
  BOARD_COLS,
  BOARD_ROWS,
  getPlotLayout,
} from '../data/farmLayout.js';
import {
  isReady,
  needsWater,
  hasCritterVisit,
  isPlotNapped,
  getMixBridgeSides,
} from '../state/gameState.js';
import { CROP_DRAG_TYPE, parseCropDragData } from './shrinesPanel.js';
import { wireReadyCropPointerDrag } from './plotPointerDrag.js';
import { wireGrowingPlotUprootHold } from './plotUprootHold.js';
import { setCropIcon, setIcon, UI_ICONS } from './icon.js';
import { setTanukiIcon } from './tanukiNap.js';
import { breathTiming } from './breathTiming.js';

const WATER_SPRINKLE_DROPS = 12;

let suppressPlotClickAfterDrag = false;

// Syncs the plot grid into `container` and wires plot clicks to
// `onPlotClick(plotId)`. Reuses unchanged plot elements so ready-crop
// pulse animations are not restarted on every tick.
//
// `unlockingPlotIds` holds plots that are unlocked in state but still
// showing the locked-to-soil fade. When all of those finish,
// `onUnlockAnimationEnd` is called once.
//
// `wateringPlotIds` holds plots mid watering sprinkle; they keep the dry
// patch until the animation finishes (even if state already marks them watered).
//
// `critterFlyingPlotIds` holds plots mid butterfly-to-shrine flight; the
// perched cue stays hidden while the flyer is in the air.
//
// `tanukiArrivingPlotIds` / `tanukiLeavingPlotIds` hide the in-tile napper
// while the fixed overlay plays arrive / leave.
//
// `uprootingPlotIds` holds plots mid vanish animation after uproot confirm;
// the crop stays in state until the animation finishes.
//
// `mixShinePlotIds` holds plots briefly flashing after a successful on-plot mix.
//
// `onFlowerPlot(plotId, cropId)` — drop a plantable on an empty plot to flower it.
// `onPlotCropDrop({ cropId, fromPlotId, clientX, clientY })` — pointer drag end.
// `onUprootHold(plotId)` — long-press on an occupied plot (confirm separately).
export function renderGrid(
  container,
  state,
  now,
  onPlotClick,
  unlockingPlotIds = new Set(),
  onUnlockAnimationEnd,
  wateringPlotIds = new Set(),
  critterFlyingPlotIds = new Set(),
  onFlowerPlot = null,
  tanukiArrivingPlotIds = new Set(),
  tanukiLeavingPlotIds = new Set(),
  onPlotCropDrop = null,
  onUprootHold = null,
  uprootingPlotIds = new Set(),
  mixShinePlotIds = new Set(),
) {
  container.style.gridTemplateColumns = `repeat(${BOARD_COLS}, var(--tile))`;
  container.style.gridTemplateRows = `repeat(${BOARD_ROWS}, var(--tile))`;

  const existingById = new Map();
  for (const child of container.children) {
    const id = Number(child.dataset.plotId);
    if (!Number.isNaN(id)) existingById.set(id, child);
  }

  const nextEls = [];
  for (const plot of state.plots) {
    const unlocking = unlockingPlotIds.has(plot.id);
    const watering = wateringPlotIds.has(plot.id);
    const critterFlying = critterFlyingPlotIds.has(plot.id);
    const napArriving = tanukiArrivingPlotIds.has(plot.id);
    const napLeaving = tanukiLeavingPlotIds.has(plot.id);
    const uprooting = uprootingPlotIds.has(plot.id);
    const mixShine = mixShinePlotIds.has(plot.id);
    const key = plotKey(
      plot,
      state,
      now,
      unlocking,
      watering,
      critterFlying,
      napArriving,
      napLeaving,
      uprooting,
      wateringPlotIds,
    );
    const existing = existingById.get(plot.id);
    if (existing && existing.dataset.plotKey === key) {
      applyPlotPlacement(existing, plot.id);
      if (key.startsWith('growing:')) {
        updateProgress(existing, plot, now);
      }
      // Shine is not part of plotKey so clearing it does not remount and
      // cut ready-pulse mid-cycle; sync the class on the reused node.
      if (key.startsWith('ready:')) {
        existing.classList.toggle('plot--mix-shine', mixShine);
      }
      nextEls.push(existing);
    } else {
      const el = renderPlot(
        plot,
        state,
        now,
        key,
        unlocking,
        watering,
        critterFlying,
        napArriving,
        napLeaving,
        uprooting,
        mixShine,
        wateringPlotIds,
      );
      if (unlocking && onUnlockAnimationEnd) {
        wireUnlockAnimation(el, plot.id, unlockingPlotIds, onUnlockAnimationEnd);
      }
      nextEls.push(el);
    }
  }

  syncChildren(container, nextEls);

  container.onclick = (event) => {
    if (suppressPlotClickAfterDrag) {
      suppressPlotClickAfterDrag = false;
      return;
    }
    const plotEl = event.target.closest('[data-plot-id]');
    if (!plotEl) return;
    onPlotClick(Number(plotEl.dataset.plotId));
  };

  wireFlowerDrop(container, state, onFlowerPlot);
  wireReadyCropPointerDrag(
    container,
    state,
    now,
    (payload) => {
      suppressPlotClickAfterDrag = true;
      onPlotCropDrop?.(payload);
    },
    onUprootHold,
    uprootingPlotIds,
    wateringPlotIds,
  );
  wireGrowingPlotUprootHold(container, state, now, onUprootHold, uprootingPlotIds);
}

function applyPlotPlacement(el, plotId) {
  const layout = getPlotLayout(plotId);
  if (!layout) return;
  el.style.gridRow = String(layout.row + 1);
  el.style.gridColumn = String(layout.col + 1);
}

function wireFlowerDrop(container, state, onFlowerPlot) {
  if (!onFlowerPlot) {
    container.ondragover = null;
    container.ondragleave = null;
    container.ondrop = null;
    return;
  }

  container.ondragover = (event) => {
    const plotEl = flowerDropTarget(event, state);
    if (!plotEl) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    clearFlowerDragOver(container);
    plotEl.classList.add('plot--drag-over');
  };

  container.ondragleave = (event) => {
    if (event.target !== container && container.contains(event.relatedTarget)) {
      return;
    }
    clearFlowerDragOver(container);
  };

  container.ondrop = (event) => {
    event.preventDefault();
    clearFlowerDragOver(container);
    const plotEl = flowerDropTarget(event, state);
    if (!plotEl) return;
    const drag = parseCropDragData(
      event.dataTransfer.getData(CROP_DRAG_TYPE),
    );
    if (!drag) return;
    onFlowerPlot(Number(plotEl.dataset.plotId), drag.cropId);
  };
}

function flowerDropTarget(event, state) {
  const plotEl = event.target.closest?.('[data-plot-id]');
  if (!plotEl || !containerContains(event.currentTarget, plotEl)) return null;
  const plotId = Number(plotEl.dataset.plotId);
  const plot = state.plots.find((p) => p.id === plotId);
  if (!plot || plot.locked || plot.crop || plot.flowered) return null;
  if (isPlotNapped(state, plotId)) return null;
  return plotEl;
}

function containerContains(container, el) {
  return container === el || container.contains(el);
}

function clearFlowerDragOver(container) {
  for (const el of container.querySelectorAll('.plot--drag-over')) {
    el.classList.remove('plot--drag-over');
  }
}

function plotKey(
  plot,
  state,
  now,
  unlocking,
  watering,
  critterFlying,
  napArriving,
  napLeaving,
  uprooting,
  wateringPlotIds = new Set(),
) {
  const flower = plot.flowered ? 'flowered' : 'plain';
  const vine = plot.vined ? 'vined' : 'clean';
  if (plot.locked || unlocking) return unlocking ? 'unlocking' : 'locked';
  if (!plot.crop) {
    let nap = '';
    if (isPlotNapped(state, plot.id)) {
      if (napArriving) nap = ':nap-arrive';
      else if (napLeaving) nap = ':nap-leave';
      else nap = `:nap:${state.plotNapper?.status ?? 'sleeping'}`;
    }
    return `empty:${flower}:${vine}${nap}`;
  }
  const crop = getCrop(plot.crop.cropId);
  if (!crop) return `empty:${flower}:${vine}`;
  if (uprooting) return `uprooting:${crop.id}:${flower}:${vine}`;
  // Stable mid-rain key: ignore flower/vine so land-care churn cannot remount
  // and kill the sprinkle CSS animation.
  if (watering) return `growing:${crop.id}:watering`;
  if (critterFlying) return `growing:${crop.id}:critter-fly:${flower}:${vine}`;
  const ready = isReady(plot, now);
  if (ready) {
    const mix = getMixBridgeSides(
      state,
      plot.id,
      now,
      wateringPlotIds,
    ).join('');
    return `ready:${crop.id}:${flower}:mix:${mix}`;
  }
  const thirsty = needsWater(plot, now);
  const critter = hasCritterVisit(plot, now);
  const watered = plot.crop.watered === true;
  const soil = thirsty ? 'thirsty' : watered ? 'watered' : 'dry';
  return `growing:${crop.id}:${soil}:${critter ? 'critter' : 'alone'}:${flower}:${vine}`;
}

function syncChildren(container, nextEls) {
  // Replace only changed slots so reused ready-plot nodes stay attached
  // and their pulse animations keep running.
  for (let i = 0; i < nextEls.length; i++) {
    const next = nextEls[i];
    const current = container.children[i];
    if (current === next) continue;
    if (current) {
      container.replaceChild(next, current);
    } else {
      container.appendChild(next);
    }
  }
  while (container.children.length > nextEls.length) {
    container.removeChild(container.lastChild);
  }
}

function updateProgress(el, plot, now) {
  const crop = getCrop(plot.crop.cropId);
  if (!crop) return;
  const fill = el.querySelector('.plot__progress-fill');
  if (!fill) return;
  const elapsed = now - plot.crop.plantedAt;
  const growthMs =
    typeof plot.crop.growthMs === 'number'
      ? plot.crop.growthMs
      : getGrowthMs(crop);
  const percent = Math.min(100, (elapsed / growthMs) * 100);
  fill.style.width = `${percent}%`;
}

function wireUnlockAnimation(el, plotId, unlockingPlotIds, onUnlockAnimationEnd) {
  function onEnd(event) {
    if (event.animationName !== 'plot-unlock-fade') return;
    el.removeEventListener('animationend', onEnd);
    if (!unlockingPlotIds.has(plotId)) return;
    unlockingPlotIds.delete(plotId);
    if (unlockingPlotIds.size === 0) {
      onUnlockAnimationEnd();
    }
  }
  el.addEventListener('animationend', onEnd);
}

function appendVineOverlay(el) {
  const vines = document.createElement('span');
  vines.className = 'plot__vines';
  vines.setAttribute('aria-hidden', 'true');
  el.appendChild(vines);
}

function appendWaterSprinkle(el) {
  const sprinkle = document.createElement('span');
  sprinkle.className = 'plot__water-sprinkle';
  sprinkle.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < WATER_SPRINKLE_DROPS; i++) {
    const drop = document.createElement('span');
    drop.className = 'plot__water-sprinkle-drop';
    setIcon(drop, {
      src: UI_ICONS.waterDrop,
      emoji: '💧',
      imgClass: 'game-icon game-icon--water-drop',
    });
    sprinkle.appendChild(drop);
  }
  el.appendChild(sprinkle);
}

function appendCritterCue(el) {
  const cue = document.createElement('span');
  cue.className = 'plot__critter';
  cue.setAttribute('aria-hidden', 'true');
  setIcon(cue, {
    src: UI_ICONS.butterfly,
    emoji: '🦋',
    imgClass: 'game-icon game-icon--critter',
  });
  el.appendChild(cue);
}

// Stable per-napper breath speed; wall-clock phase so 1s grid rebuilds don't hitch.
function napperBreathTiming(visitorId) {
  return breathTiming(visitorId, 3.4, 0.6); // 3.4–3.99s
}

function appendNapperCue(el, napper) {
  const cue = document.createElement('span');
  cue.className = 'plot__napper';
  cue.setAttribute('aria-hidden', 'true');
  const breath = napperBreathTiming(napper?.id);
  cue.style.animationDuration = `${breath.durationSec}s`;
  cue.style.animationDelay = `${breath.delaySec}s`;
  setTanukiIcon(cue, 'game-icon game-icon--napper');
  el.appendChild(cue);

  const zzz = document.createElement('span');
  zzz.className = 'plot__napper-zzz';
  zzz.setAttribute('aria-hidden', 'true');
  zzz.textContent = 'z';
  zzz.style.animationDuration = '4s';
  zzz.style.animationDelay = `${breath.delaySec * 0.5}s`;
  el.appendChild(zzz);
}

function renderPlot(
  plot,
  state,
  now,
  key,
  unlocking,
  watering,
  critterFlying,
  napArriving,
  napLeaving,
  uprooting,
  mixShine,
  wateringPlotIds = new Set(),
) {
  const el = document.createElement('div');
  el.dataset.plotId = plot.id;
  el.dataset.plotKey = key;
  applyPlotPlacement(el, plot.id);
  el.className = 'plot';

  // Unlocking: soil base + fading locked overlay (no lock icon).
  if (unlocking) {
    el.classList.add('plot--unlocking');
    return el;
  }

  // Locked tiles: texture only, no lock emoji/icon overlay (GAME_DESIGN.md).
  if (plot.locked) {
    el.classList.add('plot--locked');
    return el;
  }

  if (plot.flowered) {
    el.classList.add('plot--flowered');
  } else if (plot.vined) {
    // Ready crops clear vines in state; guard so ready never shows vine soil.
    const readyForSoil =
      plot.crop && !watering && !critterFlying && isReady(plot, now);
    if (!readyForSoil) {
      el.classList.add('plot--vined');
      appendVineOverlay(el);
    }
  }

  const napped = isPlotNapped(state, plot.id);

  if (!plot.crop) {
    el.classList.add('plot--empty');
    if (napped) {
      el.classList.add('plot--napped');
      if (!napArriving && !napLeaving) {
        appendNapperCue(el, state.plotNapper);
      }
    }
    return el;
  }

  const crop = getCrop(plot.crop.cropId);
  if (!crop) {
    el.classList.add('plot--empty');
    return el;
  }

  // Mid-uproot: icon only, shrinks into tile center (no cues / ready chrome).
  if (uprooting) {
    el.classList.add('plot--uprooting');
    const icon = document.createElement('span');
    icon.className = 'plot__icon';
    setCropIcon(icon, crop);
    el.appendChild(icon);
    return el;
  }

  // Mid-water: keep dry patch + sprinkle; defer ready styling until anim ends.
  const ready = !watering && !critterFlying && isReady(plot, now);
  const thirsty = watering || (!ready && needsWater(plot, now));
  const critter = !critterFlying && !ready && hasCritterVisit(plot, now);
  el.classList.add(ready ? 'plot--ready' : 'plot--growing');
  if (ready && mixShine) {
    el.classList.add('plot--mix-shine');
  }
  if (thirsty) {
    el.classList.add('plot--needs-water');
  }
  if (critter) {
    el.classList.add('plot--has-critter');
  }
  if (watering) {
    el.classList.add('plot--watering');
  }
  if (critterFlying) {
    el.classList.add('plot--critter-flying');
  }
  if (thirsty) {
    const dryPatch = document.createElement('span');
    dryPatch.className = 'plot__dry-patch';
    dryPatch.setAttribute('aria-hidden', 'true');
    el.appendChild(dryPatch);
  }

  const icon = document.createElement('span');
  icon.className = 'plot__icon';
  setCropIcon(icon, crop);
  el.appendChild(icon);

  if (critter) {
    appendCritterCue(el);
  }

  if (watering) {
    appendWaterSprinkle(el);
  }

  if (ready) {
    appendMixBridges(
      el,
      getMixBridgeSides(state, plot.id, now, wateringPlotIds),
    );
  }

  if (!ready) {
    const elapsed = now - plot.crop.plantedAt;
    const growthMs =
      typeof plot.crop.growthMs === 'number'
        ? plot.crop.growthMs
        : getGrowthMs(crop);
    const percent = Math.min(100, (elapsed / growthMs) * 100);
    const track = document.createElement('div');
    track.className = 'plot__progress-track';
    const fill = document.createElement('div');
    fill.className = 'plot__progress-fill';
    fill.style.width = `${percent}%`;
    track.appendChild(fill);
    el.appendChild(track);
  }

  return el;
}

function appendMixBridges(el, sides) {
  for (const side of sides) {
    const bridge = document.createElement('span');
    bridge.className = `plot__mix-bridge plot__mix-bridge--${side}`;
    bridge.setAttribute('aria-hidden', 'true');
    el.appendChild(bridge);
  }
}
