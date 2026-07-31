import { getCrop } from '../data/crops.js';
import { findAlchemyResult } from '../data/alchemyRecipes.js';
import { getHeldCropId, getHeldExpiresAt } from '../state/gameState.js';
import { CROP_DRAG_TYPE, CROP_DRAG_PREFIX } from './shrinesPanel.js';
import { applyDecayUrgencyClass, appendWiltMark } from './decayUrgency.js';
import { setCropIcon, setIcon, UI_ICONS } from './icon.js';

function parseCropDragData(raw) {
  if (!raw || !raw.startsWith(CROP_DRAG_PREFIX)) return null;
  return raw.slice(CROP_DRAG_PREFIX.length);
}

function renderSlot(slotEl, held, slotKey, onClear, onPlace, now) {
  slotEl.className = 'alchemy__slot';
  slotEl.textContent = '';
  slotEl.removeAttribute('data-crop-id');

  const cropId = getHeldCropId(held);
  if (cropId) {
    const crop = getCrop(cropId);
    slotEl.classList.add('alchemy__slot--filled');
    slotEl.dataset.cropId = cropId;
    const urgency = applyDecayUrgencyClass(
      slotEl,
      cropId,
      getHeldExpiresAt(held),
      now,
    );
    const icon = document.createElement('span');
    icon.className = 'alchemy__slot-icon';
    if (crop) {
      setCropIcon(icon, crop);
    } else {
      icon.textContent = cropId;
    }
    slotEl.appendChild(icon);
    appendWiltMark(slotEl, urgency);
    slotEl.title = crop
      ? `${crop.name} — click to return to inventory`
      : 'Click to return to inventory';
    slotEl.onclick = () => onClear(slotKey);
    slotEl.ondragover = null;
    slotEl.ondragleave = null;
    slotEl.ondrop = null;
    return;
  }

  slotEl.classList.add('alchemy__slot--empty');
  slotEl.textContent = 'Drop';
  slotEl.title = '';
  slotEl.onclick = null;

  slotEl.ondragover = (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = 'move';
    slotEl.classList.add('alchemy__slot--drag-over');
  };

  slotEl.ondragleave = () => {
    slotEl.classList.remove('alchemy__slot--drag-over');
  };

  slotEl.ondrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    slotEl.classList.remove('alchemy__slot--drag-over');
    const cropIdFromDrag = parseCropDragData(
      event.dataTransfer.getData(CROP_DRAG_TYPE),
    );
    if (!cropIdFromDrag) return;
    onPlace(slotKey, cropIdFromDrag);
  };
}

function wireAlchemyDropTarget(container, onPlaceNext) {
  container.ondragover = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    container.classList.add('alchemy--drag-over');
  };

  container.ondragleave = (event) => {
    if (container.contains(event.relatedTarget)) return;
    container.classList.remove('alchemy--drag-over');
  };

  container.ondrop = (event) => {
    event.preventDefault();
    container.classList.remove('alchemy--drag-over');
    const cropIdFromDrag = parseCropDragData(
      event.dataTransfer.getData(CROP_DRAG_TYPE),
    );
    if (!cropIdFromDrag) return;
    onPlaceNext(cropIdFromDrag);
  };
}

function applyMixReadyState(mix, canMix) {
  mix.disabled = !canMix;
  mix.classList.toggle('alchemy__mix--ready', canMix);
  mix.classList.toggle('alchemy__mix--faded', !canMix);
  mix.title = canMix ? 'Mix' : '';
}

function canMixFromAlchemy(alchemy) {
  return Boolean(
    findAlchemyResult(
      getHeldCropId(alchemy?.slotA ?? null),
      getHeldCropId(alchemy?.slotB ?? null),
    ),
  );
}

/**
 * Refresh perishable tints without rebuilding the board, so the Mix ready
 * animation is not restarted (same idea as updateDragonTempleLive).
 * Returns false when the DOM shape no longer matches state (caller should
 * full-render).
 */
export function updateAlchemyLive(container, state) {
  const alchemy = state.alchemy;
  const now = Date.now();

  if (alchemy?.resultId) {
    const result = container.querySelector(':scope > .alchemy__result');
    if (!result) return false;
    // Unclaimed result has no decay tint to refresh.
    return true;
  }

  const row = container.querySelector(':scope > .alchemy__row');
  if (!row) return false;
  const slots = row.querySelectorAll(':scope > .alchemy__slot');
  const mix = row.querySelector(':scope > .alchemy__mix');
  if (slots.length !== 2 || !mix) return false;

  const helds = [alchemy?.slotA ?? null, alchemy?.slotB ?? null];
  for (let i = 0; i < 2; i += 1) {
    const slotEl = slots[i];
    const cropId = getHeldCropId(helds[i]);
    const shownId = slotEl.dataset.cropId || '';
    const filled = slotEl.classList.contains('alchemy__slot--filled');
    if (Boolean(cropId) !== filled) return false;
    if ((cropId || '') !== shownId) return false;
    if (!cropId) continue;

    slotEl.querySelector('.crop-decay__wilt')?.remove();
    const urgency = applyDecayUrgencyClass(
      slotEl,
      cropId,
      getHeldExpiresAt(helds[i]),
      now,
    );
    appendWiltMark(slotEl, urgency);
  }

  applyMixReadyState(mix, canMixFromAlchemy(alchemy));
  return true;
}

// Renders the alchemy board: two input slots + Mix, or a claimable result.
export function renderAlchemy(container, state, handlers) {
  const { onPlace, onPlaceNext, onClear, onMix, onClaim } = handlers;
  const alchemy = state.alchemy;
  const now = Date.now();
  container.innerHTML = '';
  container.ondragover = null;
  container.ondragleave = null;
  container.ondrop = null;
  container.classList.remove('alchemy--drag-over');

  if (alchemy?.resultId) {
    const crop = getCrop(alchemy.resultId);
    const result = document.createElement('button');
    result.type = 'button';
    result.className = 'alchemy__result';
    if (crop) {
      const resultIcon = document.createElement('span');
      setCropIcon(resultIcon, crop, 'game-icon game-icon--inline');
      result.appendChild(resultIcon);
      result.append(` ${crop.name}`);
    } else {
      result.textContent = alchemy.resultId;
    }
    result.title = 'Click to add to inventory';
    result.onclick = () => onClaim();
    container.appendChild(result);
    return;
  }

  wireAlchemyDropTarget(container, onPlaceNext);

  const row = document.createElement('div');
  row.className = 'alchemy__row';

  const slotA = document.createElement('div');
  const slotB = document.createElement('div');
  renderSlot(slotA, alchemy?.slotA ?? null, 'slotA', onClear, onPlace, now);
  renderSlot(slotB, alchemy?.slotB ?? null, 'slotB', onClear, onPlace, now);

  const mix = document.createElement('button');
  mix.type = 'button';
  mix.className = 'alchemy__mix';
  // Wrapper holds the static drop-shadow; the img alone nudges so the
  // filtered bitmap is not redrawn every frame.
  const art = document.createElement('span');
  art.className = 'alchemy__mix-art';
  setIcon(art, {
    src: UI_ICONS.mortar,
    emoji: '⚗️',
    alt: '',
    imgClass: 'game-icon game-icon--mix',
  });
  mix.appendChild(art);
  mix.setAttribute('aria-label', 'Mix');
  applyMixReadyState(mix, canMixFromAlchemy(alchemy));
  mix.onclick = () => onMix();

  row.appendChild(slotA);
  row.appendChild(mix);
  row.appendChild(slotB);
  container.appendChild(row);
}
