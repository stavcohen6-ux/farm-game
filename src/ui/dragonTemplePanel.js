import { getCrop } from '../data/crops.js';
import { DRAGON_TEMPLE } from '../data/dragonTemple.js';
import { getHeldCropId, getHeldExpiresAt } from '../state/gameState.js';
import { CROP_DRAG_TYPE, CROP_DRAG_PREFIX } from './shrinesPanel.js';
import { applyDecayUrgencyClass, appendWiltMark } from './decayUrgency.js';
import { setCropIcon, setIcon, UI_ICONS } from './icon.js';

function parseCropDragData(raw) {
  if (!raw || !raw.startsWith(CROP_DRAG_PREFIX)) return null;
  return raw.slice(CROP_DRAG_PREFIX.length);
}

function timerFillPercent(temple, now = Date.now()) {
  const msRemaining = Math.max(0, (temple.endsAt ?? now) - now);
  const duration = DRAGON_TEMPLE.durationMs || 1;
  return Math.min(100, (msRemaining / duration) * 100);
}

function progressFillPercent(temple) {
  const required = DRAGON_TEMPLE.progressRequired || 1;
  const current = temple.progress ?? 0;
  return Math.min(100, (current / required) * 100);
}

function setBarFill(fillEl, percent) {
  if (!fillEl) return;
  fillEl.style.width = `${percent}%`;
}

// Updates only the time bar fill so a burning fire animation is not restarted.
export function updateDragonTempleTimer(container, state) {
  const fill = container.querySelector('.dragon-temple__timer-fill');
  if (!fill || !state.dragonTemple?.active) return;
  setBarFill(fill, timerFillPercent(state.dragonTemple));
}

function renderSlot(slotEl, held, slotIndex, onClear, onPlace, burning, now, interactive) {
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
      const fire = document.createElement('span');
      fire.className = 'dragon-temple__fire';
      setIcon(fire, { src: UI_ICONS.fire, emoji: '🔥', imgClass: 'game-icon' });
      fire.setAttribute('aria-hidden', 'true');
      slotEl.appendChild(fire);
    }

    slotEl.title = burning
      ? 'Burning…'
      : crop
        ? `${crop.name} — click to return to inventory`
        : 'Click to return to inventory';
    slotEl.onclick = burning || !interactive ? null : () => onClear(slotIndex);
    return;
  }

  slotEl.classList.add('dragon-temple__slot--empty');
  if (!interactive) {
    slotEl.classList.add('dragon-temple__slot--faded');
    slotEl.title = '';
    return;
  }

  slotEl.textContent = 'Drop';
  slotEl.title = '';

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
    const cropIdFromDrag = parseCropDragData(
      event.dataTransfer.getData(CROP_DRAG_TYPE),
    );
    if (!cropIdFromDrag) return;
    onPlace(slotIndex, cropIdFromDrag);
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
    const cropIdFromDrag = parseCropDragData(
      event.dataTransfer.getData(CROP_DRAG_TYPE),
    );
    if (!cropIdFromDrag) return;
    onPlaceNext(cropIdFromDrag);
  };
}

function buildMeters(temple, active) {
  const meters = document.createElement('div');
  meters.className = 'dragon-temple__meters';
  if (!active) {
    meters.classList.add('dragon-temple__meters--placeholder');
    meters.setAttribute('aria-hidden', 'true');
  }

  const timerTrack = document.createElement('div');
  timerTrack.className = 'dragon-temple__timer-track';
  timerTrack.title = active ? 'Time remaining' : '';
  const timerFill = document.createElement('div');
  timerFill.className = 'dragon-temple__timer-fill';
  setBarFill(timerFill, active ? timerFillPercent(temple) : 100);
  timerTrack.appendChild(timerFill);
  meters.appendChild(timerTrack);

  const progressTrack = document.createElement('div');
  progressTrack.className = 'dragon-temple__progress-track';
  progressTrack.title = active ? 'Sacrifice progress' : '';
  const progressFill = document.createElement('div');
  progressFill.className = 'dragon-temple__progress-fill';
  setBarFill(progressFill, active ? progressFillPercent(temple) : 0);
  progressTrack.appendChild(progressFill);
  meters.appendChild(progressTrack);

  return meters;
}

function buildSlotsRow(temple, handlers, burning, now, interactive) {
  const { onClear, onPlace } = handlers;
  const slotsRow = document.createElement('div');
  slotsRow.className = 'dragon-temple__slots';
  const slots = temple.slots ?? [];
  for (let i = 0; i < DRAGON_TEMPLE.slotCount; i++) {
    const slotEl = document.createElement('div');
    renderSlot(
      slotEl,
      interactive ? slots[i] ?? null : null,
      i,
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

function wireBurnFires(slotsRow, onBurnComplete) {
  const fires = slotsRow.querySelectorAll('.dragon-temple__fire');
  const firstFire = fires[0];
  if (firstFire) {
    firstFire.style.animationDuration = `${DRAGON_TEMPLE.burnPulseMs}ms`;
    firstFire.style.animationIterationCount = String(DRAGON_TEMPLE.burnPulseCount);
    firstFire.addEventListener(
      'animationend',
      () => {
        onBurnComplete();
      },
      { once: true },
    );
  }
  for (let i = 1; i < fires.length; i++) {
    fires[i].style.animationDuration = `${DRAGON_TEMPLE.burnPulseMs}ms`;
    fires[i].style.animationIterationCount = String(DRAGON_TEMPLE.burnPulseCount);
  }
}

function buildBurnSlot(temple, active, burning, onBurn) {
  const burnSlot = document.createElement('div');
  burnSlot.className = 'dragon-temple__burn-slot';
  if (!active) {
    burnSlot.classList.add('dragon-temple__burn-slot--placeholder');
    burnSlot.setAttribute('aria-hidden', 'true');
    const ghost = document.createElement('button');
    ghost.type = 'button';
    ghost.className = 'dragon-temple__burn';
    ghost.textContent = 'Burn';
    ghost.disabled = true;
    burnSlot.appendChild(ghost);
    return burnSlot;
  }

  const slots = temple.slots ?? [];
  const burn = document.createElement('button');
  burn.type = 'button';
  burn.className = 'dragon-temple__burn';
  burn.textContent = 'Burn';
  const canBurn =
    !burning &&
    slots.length === DRAGON_TEMPLE.slotCount &&
    slots.every((slot) => getHeldCropId(slot));
  burn.disabled = !canBurn;
  if (!canBurn) {
    burn.classList.add('dragon-temple__burn--faded');
  }
  burn.onclick = () => onBurn();
  burnSlot.appendChild(burn);
  return burnSlot;
}

// Renders the Dragon Temple: meters above, figure + wall slots, Burn below.
export function renderDragonTemple(container, state, handlers) {
  const { onBurn, onBurnComplete } = handlers;
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

  const slotsRow = buildSlotsRow(temple, handlers, burning, now, active);
  stage.appendChild(slotsRow);
  container.appendChild(stage);

  if (active && burning) {
    wireBurnFires(slotsRow, onBurnComplete);
  }

  if (active && !burning && !temple.pendingClose) {
    wireTempleDropTarget(container, handlers.onPlaceNext);
  }

  container.appendChild(buildBurnSlot(temple, active, burning, onBurn));
}
