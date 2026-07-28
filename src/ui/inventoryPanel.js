import { getCrop } from '../data/crops.js';
import {
  getInventoryStacks,
  INVENTORY_SLOT_COUNT,
} from '../state/gameState.js';
import { CROP_DRAG_TYPE, CROP_DRAG_PREFIX } from './shrinesPanel.js';
import { applyDecayUrgencyClass, appendWiltMark } from './decayUrgency.js';
import { setCropIcon } from './icon.js';

// Fixed row of inventory slots (empty frames always visible).
// Filled slots are stacks (up to maxStack); same crop can occupy multiple slots.
export function renderInventory(container, state) {
  container.innerHTML = '';
  const now = Date.now();

  const stacks = getInventoryStacks(state)
    .filter((stack) => stack.count > 0)
    .slice(0, INVENTORY_SLOT_COUNT);

  const list = document.createElement('ul');
  list.className = 'inventory__list';

  for (let i = 0; i < INVENTORY_SLOT_COUNT; i += 1) {
    const stack = stacks[i];
    const item = document.createElement('li');

    if (!stack) {
      item.className = 'inventory__item inventory__item--empty';
      item.setAttribute('aria-hidden', 'true');
      list.appendChild(item);
      continue;
    }

    const { cropId, count, expiresAt } = stack;
    const crop = getCrop(cropId);
    if (!crop) {
      item.className = 'inventory__item inventory__item--empty';
      item.setAttribute('aria-hidden', 'true');
      list.appendChild(item);
      continue;
    }

    item.className = 'inventory__item';
    item.dataset.cropId = cropId;
    item.draggable = true;

    const urgency = applyDecayUrgencyClass(item, cropId, expiresAt, now);

    const icon = document.createElement('span');
    icon.className = 'inventory__icon';
    setCropIcon(icon, crop);

    const countEl = document.createElement('span');
    countEl.className = 'inventory__count';
    countEl.textContent = String(count);

    item.appendChild(icon);
    item.appendChild(countEl);
    appendWiltMark(item, urgency);

    item.ondragstart = (event) => {
      event.dataTransfer.setData(CROP_DRAG_TYPE, `${CROP_DRAG_PREFIX}${cropId}`);
      event.dataTransfer.effectAllowed = 'move';
      item.classList.add('inventory__item--dragging');
    };

    item.ondragend = () => {
      item.classList.remove('inventory__item--dragging');
    };

    list.appendChild(item);
  }

  container.appendChild(list);
}

// Briefly pulses the last stack tile for a crop after a regular crop gain.
export function pulseInventoryItem(container, cropId) {
  const items = container.querySelectorAll(`[data-crop-id="${cropId}"]`);
  const item = items[items.length - 1];
  if (!item) return;

  item.classList.remove('inventory__item--received');
  // Force reflow so re-adding the class restarts the animation.
  void item.offsetWidth;
  item.classList.add('inventory__item--received');

  item.addEventListener(
    'animationend',
    () => {
      item.classList.remove('inventory__item--received');
    },
    { once: true },
  );
}

// Brief panel shake when a crop cannot enter inventory (capacity full).
export function shakeInventoryFull(container) {
  if (!container) return;

  container.classList.remove('inventory--full-shake');
  void container.offsetWidth;
  container.classList.add('inventory--full-shake');

  container.addEventListener(
    'animationend',
    () => {
      container.classList.remove('inventory--full-shake');
    },
    { once: true },
  );
}
