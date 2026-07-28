import { getCrop, getGrowthMs } from '../data/crops.js';
import {
  GRID_ROWS,
  GRID_COLS,
  isReady,
  needsWater,
  hasCritterVisit,
} from '../state/gameState.js';
import { CROP_DRAG_TYPE, CROP_DRAG_PREFIX } from './shrinesPanel.js';
import { setCropIcon, setIcon, UI_ICONS } from './icon.js';

const WATER_SPRINKLE_DROPS = 12;

function parseCropDragData(raw) {
  if (!raw || !raw.startsWith(CROP_DRAG_PREFIX)) return null;
  return raw.slice(CROP_DRAG_PREFIX.length);
}

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
// `onFlowerPlot(plotId, cropId)` — drop a plantable on an empty plot to flower it.
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
) {
  container.style.gridTemplateColumns = `repeat(${GRID_COLS}, 1fr)`;
  container.style.gridTemplateRows = `repeat(${GRID_ROWS}, 1fr)`;

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
    const key = plotKey(plot, now, unlocking, watering, critterFlying);
    const existing = existingById.get(plot.id);
    if (existing && existing.dataset.plotKey === key) {
      existing.dataset.row = String(Math.floor(plot.id / GRID_COLS));
      if (key.startsWith('growing:')) {
        updateProgress(existing, plot, now);
      }
      nextEls.push(existing);
    } else {
      const el = renderPlot(plot, now, key, unlocking, watering, critterFlying);
      if (unlocking && onUnlockAnimationEnd) {
        wireUnlockAnimation(el, plot.id, unlockingPlotIds, onUnlockAnimationEnd);
      }
      nextEls.push(el);
    }
  }

  // Rebuild child order only when needed; replaceChanged keeps ready icons
  // that were reused above.
  syncChildren(container, nextEls);

  // Assigning onclick (rather than addEventListener) keeps this idempotent
  // across re-renders without accumulating duplicate listeners.
  container.onclick = (event) => {
    const plotEl = event.target.closest('[data-plot-id]');
    if (!plotEl) return;
    onPlotClick(Number(plotEl.dataset.plotId));
  };

  wireFlowerDrop(container, state, onFlowerPlot);
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
    const cropId = parseCropDragData(
      event.dataTransfer.getData(CROP_DRAG_TYPE),
    );
    if (!cropId) return;
    onFlowerPlot(Number(plotEl.dataset.plotId), cropId);
  };
}

function flowerDropTarget(event, state) {
  const plotEl = event.target.closest?.('[data-plot-id]');
  if (!plotEl || !containerContains(event.currentTarget, plotEl)) return null;
  const plotId = Number(plotEl.dataset.plotId);
  const plot = state.plots.find((p) => p.id === plotId);
  if (!plot || plot.locked || plot.crop || plot.flowered) return null;
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

function plotKey(plot, now, unlocking, watering, critterFlying) {
  const flower = plot.flowered ? 'flowered' : 'plain';
  if (plot.locked || unlocking) return unlocking ? 'unlocking' : 'locked';
  if (!plot.crop) return `empty:${flower}`;
  const crop = getCrop(plot.crop.cropId);
  if (!crop) return `empty:${flower}`;
  if (watering) return `growing:${crop.id}:watering:${flower}`;
  if (critterFlying) return `growing:${crop.id}:critter-fly:${flower}`;
  const ready = isReady(plot, now);
  if (ready) return `ready:${crop.id}:${flower}`;
  const thirsty = needsWater(plot, now);
  const critter = hasCritterVisit(plot, now);
  const watered = plot.crop.watered === true;
  const soil = thirsty ? 'thirsty' : watered ? 'watered' : 'dry';
  return `growing:${crop.id}:${soil}:${critter ? 'critter' : 'alone'}:${flower}`;
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

function renderPlot(plot, now, key, unlocking, watering, critterFlying) {
  const el = document.createElement('div');
  el.dataset.plotId = plot.id;
  el.dataset.plotKey = key;
  el.dataset.row = String(Math.floor(plot.id / GRID_COLS));
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
  }

  if (!plot.crop) {
    el.classList.add('plot--empty');
    return el;
  }

  const crop = getCrop(plot.crop.cropId);
  if (!crop) {
    el.classList.add('plot--empty');
    return el;
  }

  // Mid-water: keep dry patch + sprinkle; defer ready styling until anim ends.
  const ready = !watering && !critterFlying && isReady(plot, now);
  const thirsty = watering || (!ready && needsWater(plot, now));
  const critter = !critterFlying && !ready && hasCritterVisit(plot, now);
  el.classList.add(ready ? 'plot--ready' : 'plot--growing');
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
