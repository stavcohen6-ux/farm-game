import { getCrop } from '../data/crops.js';
import { DRAGON_TEMPLE } from '../data/dragonTemple.js';
import { getHeldCropId, getHeldExpiresAt } from '../state/gameState.js';
import { CROP_DRAG_TYPE, parseCropDragData } from './shrinesPanel.js';
import { applyDecayUrgencyClass, appendWiltMark } from './decayUrgency.js';
import { setCropIcon, setIcon, UI_ICONS } from './icon.js';

function burnTotalMs() {
  return DRAGON_TEMPLE.burnPulseMs * DRAGON_TEMPLE.burnPulseCount;
}

function wrathFillPercent(temple) {
  const max = DRAGON_TEMPLE.wrathMax || 1;
  const current = temple?.wrath ?? 0;
  return Math.min(100, (current / max) * 100);
}

function setBarFill(fillEl, percent) {
  if (!fillEl) return;
  fillEl.style.width = `${percent}%`;
}

// Updates only the wrath bar fill so a burning spark animation is not restarted.
export function updateDragonTempleWrath(container, state) {
  const fill = container.querySelector('.dragon-temple__timer-fill');
  if (!fill || !state.dragonTemple?.active) return;
  setBarFill(fill, wrathFillPercent(state.dragonTemple));
}

// Updates wrath (and filled-slot decay tints) without rebuilding the board, so
// ready-edge / spark animations are not restarted. Returns false if the DOM is
// out of sync with state (caller should full-render).
export function updateDragonTempleLive(container, state) {
  updateDragonTempleWrath(container, state);
  const temple = state.dragonTemple;
  if (!temple?.active || temple.burning || temple.pendingClose) return true;

  const slotEls = container.querySelectorAll('.dragon-temple__slot');
  if (slotEls.length !== DRAGON_TEMPLE.slotCount) return false;

  const now = Date.now();
  for (let i = 0; i < slotEls.length; i++) {
    const held = temple.slots[i];
    const cropId = getHeldCropId(held);
    const slotEl = slotEls[i];
    const shownFilled = slotEl.classList.contains('dragon-temple__slot--filled');
    if (Boolean(cropId) !== shownFilled) return false;
    if (!cropId) continue;

    slotEl.querySelector('.crop-decay__wilt')?.remove();
    const urgency = applyDecayUrgencyClass(
      slotEl,
      cropId,
      getHeldExpiresAt(held),
      now,
    );
    appendWiltMark(slotEl, urgency);
  }
  return true;
}

function demandCropAt(temple, slotIndex) {
  const demand = temple?.demand;
  if (!Array.isArray(demand)) return null;
  return demand[slotIndex] ?? null;
}

function renderSlot(
  slotEl,
  held,
  slotIndex,
  demandCropId,
  onClear,
  onPlace,
  burning,
  now,
  interactive,
) {
  slotEl.className = 'dragon-temple__slot';
  slotEl.textContent = '';
  slotEl.ondragover = null;
  slotEl.ondragleave = null;
  slotEl.ondrop = null;
  slotEl.onclick = null;

  const cropId = getHeldCropId(held);
  if (cropId) {
    const crop = getCrop(cropId);
    slotEl.classList.add('dragon-temple__slot--filled');
    if (burning) {
      slotEl.classList.add('dragon-temple__slot--burning');
    }

    const ready = document.createElement('span');
    ready.className = 'dragon-temple__slot-ready';
    if (burning) {
      ready.classList.add('dragon-temple__slot-ready--burning');
    }
    ready.setAttribute('aria-hidden', 'true');
    const glow = document.createElement('span');
    glow.className =
      'dragon-temple__slot-ready-spin dragon-temple__slot-ready-spin--glow';
    const spin = document.createElement('span');
    spin.className = 'dragon-temple__slot-ready-spin';
    ready.appendChild(glow);
    ready.appendChild(spin);
    slotEl.appendChild(ready);

    const icon = document.createElement('span');
    icon.className = 'dragon-temple__slot-icon';
    if (crop) {
      setCropIcon(icon, crop);
    } else {
      icon.textContent = cropId;
    }
    slotEl.appendChild(icon);

    if (!burning) {
      const urgency = applyDecayUrgencyClass(
        slotEl,
        cropId,
        getHeldExpiresAt(held),
        now,
      );
      appendWiltMark(slotEl, urgency);
    }

    if (burning) {
      const { burnParticleCount } = DRAGON_TEMPLE;
      // Short within-wave stagger so squares don’t rise as a rigid grid.
      const staggerMs = 70;
      const dxValues = ['5px', '-4px', '3px', '-6px', '2px', '-3px', '6px', '-5px', '4px'];
      for (let i = 0; i < burnParticleCount; i++) {
        const spark = document.createElement('span');
        spark.className = 'dragon-temple__spark';
        spark.style.animationDelay = `${i * staggerMs}ms`;
        // Spread through the crop band (avoid edges): ~25% … ~75%.
        const leftPct =
          burnParticleCount === 1
            ? 50
            : 25 + (i / (burnParticleCount - 1)) * 50;
        spark.style.left = `${leftPct}%`;
        spark.style.setProperty(
          '--spark-dx',
          dxValues[i % dxValues.length],
        );
        spark.setAttribute('aria-hidden', 'true');
        slotEl.appendChild(spark);
      }
    }

    slotEl.title = burning
      ? 'Burning…'
      : crop
        ? `${crop.name} — click to return to farm`
        : 'Click to return to farm';
    slotEl.onclick = burning || !interactive ? null : () => onClear(slotIndex);
    return;
  }

  slotEl.classList.add('dragon-temple__slot--empty');
  if (!interactive) {
    slotEl.classList.add('dragon-temple__slot--faded');
    slotEl.title = '';
    return;
  }

  const demandCrop = demandCropId ? getCrop(demandCropId) : null;
  if (demandCrop) {
    slotEl.classList.add('dragon-temple__slot--demand');
    const ghost = document.createElement('span');
    ghost.className = 'dragon-temple__slot-icon dragon-temple__slot-icon--ghost';
    setCropIcon(ghost, demandCrop);
    slotEl.appendChild(ghost);
    slotEl.title = `Needs ${demandCrop.name}`;
  } else {
    slotEl.textContent = 'Drop';
    slotEl.title = '';
  }

  if (burning) {
    return;
  }

  slotEl.ondragover = (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'move';
    slotEl.classList.add('dragon-temple__slot--drag-over');
  };

  slotEl.ondragleave = () => {
    slotEl.classList.remove('dragon-temple__slot--drag-over');
  };

  slotEl.ondrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    slotEl.classList.remove('dragon-temple__slot--drag-over');
    const drag = parseCropDragData(
      event.dataTransfer.getData(CROP_DRAG_TYPE),
    );
    if (!drag) return;
    onPlace(slotIndex, drag.cropId, drag.plotId);
  };
}

function wireTempleDropTarget(container, onPlaceNext) {
  container.ondragover = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    container.classList.add('dragon-temple--drag-over');
  };

  container.ondragleave = (event) => {
    if (container.contains(event.relatedTarget)) return;
    container.classList.remove('dragon-temple--drag-over');
  };

  container.ondrop = (event) => {
    event.preventDefault();
    container.classList.remove('dragon-temple--drag-over');
    const drag = parseCropDragData(
      event.dataTransfer.getData(CROP_DRAG_TYPE),
    );
    if (!drag) return;
    onPlaceNext(drag.cropId, drag.plotId);
  };
}

function buildMeters(temple, active) {
  const meters = document.createElement('div');
  meters.className = 'dragon-temple__meters';
  if (!active) {
    meters.classList.add('dragon-temple__meters--placeholder');
    meters.setAttribute('aria-hidden', 'true');
  }

  // Reuse timer track/fill classes so wrath keeps the ember timer colors.
  const wrathTrack = document.createElement('div');
  wrathTrack.className = 'dragon-temple__timer-track';
  wrathTrack.title = active ? "Dragon's wrath" : '';
  const wrathFill = document.createElement('div');
  wrathFill.className = 'dragon-temple__timer-fill';
  setBarFill(wrathFill, active ? wrathFillPercent(temple) : 0);
  wrathTrack.appendChild(wrathFill);
  meters.appendChild(wrathTrack);

  return meters;
}

function buildSlotsRow(temple, handlers, burning, now, interactive) {
  const { onClear, onPlace } = handlers;
  const slotsRow = document.createElement('div');
  slotsRow.className = 'dragon-temple__slots';
  const slots = temple.slots ?? [];
  for (let i = 0; i < DRAGON_TEMPLE.slotCount; i++) {
    const slotEl = document.createElement('div');
    slotEl.dataset.slotIndex = String(i);
    renderSlot(
      slotEl,
      interactive ? slots[i] ?? null : null,
      i,
      interactive ? demandCropAt(temple, i) : null,
      onClear,
      onPlace,
      burning,
      now,
      interactive,
    );
    slotsRow.appendChild(slotEl);
  }
  return slotsRow;
}

function wireBurnSparks(slotsRow, onBurnComplete) {
  const sparks = slotsRow.querySelectorAll('.dragon-temple__spark');
  const { burnPulseMs, burnPulseCount } = DRAGON_TEMPLE;
  sparks.forEach((spark, index) => {
    spark.style.animationDuration = `${burnPulseMs}ms`;
    spark.style.animationIterationCount = String(burnPulseCount);
    if (index === 0) {
      spark.addEventListener(
        'animationend',
        () => {
          onBurnComplete();
        },
        { once: true },
      );
    }
  });

  const burnMs = burnTotalMs();
  slotsRow.querySelectorAll('.dragon-temple__slot--burning .dragon-temple__slot-icon')
    .forEach((icon) => {
      icon.style.animationDuration = `${burnMs}ms`;
    });
}

// Renders the Dragon Temple: wrath meter, roof dragon, 1×4 holy farm board.
// When demand is fully matched, place handlers auto-start burn (no Burn button).
export function renderDragonTemple(container, state, handlers) {
  const { onBurnComplete } = handlers;
  const temple = state.dragonTemple;
  const active = Boolean(temple?.active);
  const burning = Boolean(temple?.burning);
  const now = Date.now();

  container.className = 'dragon-temple';
  if (active) {
    container.classList.add('dragon-temple--active');
  }
  if (burning) {
    container.classList.add('dragon-temple--burning');
  }
  container.innerHTML = '';
  container.ondragover = null;
  container.ondragleave = null;
  container.ondrop = null;
  container.title = '';
  container.ondblclick = null;

  container.appendChild(buildMeters(temple, active));

  const stage = document.createElement('div');
  stage.className = 'dragon-temple__stage';

  const figure = document.createElement('div');
  figure.className = 'dragon-temple__figure';
  setIcon(figure, {
    src: active ? UI_ICONS.dragonAwake : UI_ICONS.dragonRest,
    emoji: '🐲',
    alt: active ? 'Dragon Temple (awake)' : 'Dragon Temple (sleeping)',
    imgClass: 'game-icon game-icon--temple-object',
  });
  stage.appendChild(figure);
  container.appendChild(stage);

  const board = document.createElement('div');
  board.className = 'dragon-temple__board';
  const slotsRow = buildSlotsRow(temple, handlers, burning, now, active);
  board.appendChild(slotsRow);
  container.appendChild(board);

  if (active && burning) {
    wireBurnSparks(slotsRow, onBurnComplete);
  }

  if (active && !burning && !temple.pendingClose) {
    wireTempleDropTarget(container, handlers.onPlaceNext);
  }
}
