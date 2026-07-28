import { getCrop } from '../data/crops.js';
import { findAlchemyResult } from '../data/alchemyRecipes.js';
import { getHeldCropId, getHeldExpiresAt } from '../state/gameState.js';
import { CROP_DRAG_TYPE, CROP_DRAG_PREFIX } from './shrinesPanel.js';
import { applyDecayUrgencyClass, appendWiltMark } from './decayUrgency.js';
import { setCropIcon } from './icon.js';

function parseCropDragData(raw) {
  if (!raw || !raw.startsWith(CROP_DRAG_PREFIX)) return null;
  return raw.slice(CROP_DRAG_PREFIX.length);
}

function renderSlot(slotEl, held, slotKey, onClear, onPlace, now) {
  slotEl.className = 'alchemy__slot';
  slotEl.textContent = '';

  const cropId = getHeldCropId(held);
  if (cropId) {
    const crop = getCrop(cropId);
    slotEl.classList.add('alchemy__slot--filled');
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
  mix.textContent = 'Mix';
  const canMix = Boolean(
    findAlchemyResult(
      getHeldCropId(alchemy?.slotA ?? null),
      getHeldCropId(alchemy?.slotB ?? null),
    ),
  );
  mix.disabled = !canMix;
  if (!canMix) {
    mix.classList.add('alchemy__mix--faded');
  }
  mix.onclick = () => onMix();

  row.appendChild(slotA);
  row.appendChild(mix);
  row.appendChild(slotB);
  container.appendChild(row);
}
