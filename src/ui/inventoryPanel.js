import { getCrop } from '../data/crops.js';
import {
  getInventoryStacks,
  getWaitingDeskVisitors,
  takeDeskGiftLand,
  INVENTORY_SLOT_COUNT,
} from '../state/gameState.js';
import { CROP_DRAG_TYPE, encodeCropDrag, setActiveCropDrag } from './shrinesPanel.js';
import { applyDecayUrgencyClass, appendWiltMark } from './decayUrgency.js';
import { setCropIcon, setIcon, UI_ICONS } from './icon.js';

// Fixed row of inventory slots. Waiting fireflies own stable slotIndex;
// crop stacks pack into the remaining frames (gift pin forces clicked slot).
export function renderInventory(container, state, onWelcomeDeskVisitor) {
  container.innerHTML = '';
  const now = Date.now();
  const shelf = buildShelfSlots(state);

  const list = document.createElement('ul');
  list.className = 'inventory__list';

  for (let i = 0; i < INVENTORY_SLOT_COUNT; i += 1) {
    const item = document.createElement('li');
    item.dataset.slotIndex = String(i);
    const cell = shelf[i];

    if (cell?.type === 'firefly') {
      appendFireflySlot(item, cell.visitor, onWelcomeDeskVisitor);
    } else if (cell?.type === 'stack') {
      appendCropStack(item, cell.stack, now);
    } else {
      item.className = 'inventory__item inventory__item--empty';
      item.setAttribute('aria-hidden', 'true');
    }

    list.appendChild(item);
  }

  container.appendChild(list);
}

function buildShelfSlots(state) {
  const slots = Array(INVENTORY_SLOT_COUNT).fill(null);
  const waiting = getWaitingDeskVisitors(state);

  for (const visitor of waiting) {
    const i = visitor.slotIndex;
    if (
      typeof i === 'number' &&
      i >= 0 &&
      i < INVENTORY_SLOT_COUNT &&
      !slots[i]
    ) {
      slots[i] = { type: 'firefly', visitor };
    }
  }

  let stacks = getInventoryStacks(state).filter((stack) => stack.count > 0);

  const pin = takeDeskGiftLand(state);
  if (
    pin &&
    typeof pin.slotIndex === 'number' &&
    pin.slotIndex >= 0 &&
    pin.slotIndex < INVENTORY_SLOT_COUNT &&
    !slots[pin.slotIndex]
  ) {
    let giftIndex = -1;
    for (let s = stacks.length - 1; s >= 0; s -= 1) {
      if (stacks[s].cropId === pin.cropId) {
        giftIndex = s;
        break;
      }
    }
    if (giftIndex >= 0) {
      slots[pin.slotIndex] = { type: 'stack', stack: stacks[giftIndex] };
      stacks = stacks.filter((_, s) => s !== giftIndex);
    }
  }

  for (let i = 0; i < INVENTORY_SLOT_COUNT; i += 1) {
    if (slots[i]) continue;
    if (stacks.length === 0) break;
    slots[i] = { type: 'stack', stack: stacks.shift() };
  }

  return slots;
}

function appendCropStack(item, stack, now) {
  const { cropId, count, expiresAt } = stack;
  const crop = getCrop(cropId);
  if (!crop) {
    item.className = 'inventory__item inventory__item--empty';
    item.setAttribute('aria-hidden', 'true');
    return;
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
    event.dataTransfer.setData(
      CROP_DRAG_TYPE,
      encodeCropDrag({ cropId }),
    );
    event.dataTransfer.effectAllowed = 'move';
    setActiveCropDrag({ cropId });
    item.classList.add('inventory__item--dragging');
  };

  item.ondragend = () => {
    setActiveCropDrag(null);
    item.classList.remove('inventory__item--dragging');
  };
}

function appendFireflySlot(item, visitor, onWelcomeDeskVisitor) {
  item.className = 'inventory__item inventory__item--firefly';
  item.dataset.deskVisitorId = visitor.id;
  item.setAttribute('role', 'button');
  item.setAttribute('aria-label', 'Welcome fireflies');
  item.draggable = false;
  item.title = 'Fireflies — click to receive a gift';

  const icon = document.createElement('span');
  icon.className = 'inventory__icon inventory__icon--firefly';
  const bob = fireflyBobTiming(visitor.id);
  icon.style.animationDuration = `${bob.durationSec}s`;
  // Negative delay phases the loop so re-renders keep a stable offset.
  icon.style.animationDelay = `${bob.delaySec}s`;
  setIcon(icon, {
    src: UI_ICONS.firefly,
    emoji: '✨',
    alt: 'Fireflies',
    imgClass: 'game-icon game-icon--firefly',
  });
  item.appendChild(icon);

  if (typeof onWelcomeDeskVisitor === 'function') {
    item.onclick = () => onWelcomeDeskVisitor(visitor.id);
  }
}

// Stable per-visitor bob speed; wall-clock phase so 1s inventory rebuilds don't hitch.
function fireflyBobTiming(visitorId) {
  const id = typeof visitorId === 'string' ? visitorId : '';
  let hash = 2166136261;
  for (let i = 0; i < id.length; i += 1) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  hash >>>= 0;
  const durationSec = 2.4 + (hash % 800) / 1000; // 2.4–3.19s
  const phaseOffsetSec = ((hash >>> 8) % 1000) / 1000 * durationSec;
  const delaySec = -((Date.now() / 1000 + phaseOffsetSec) % durationSec);
  return { durationSec, delaySec };
}

// Briefly pulses a shelf tile by slot index (desk gift land).
export function pulseInventorySlot(container, slotIndex) {
  if (!container || typeof slotIndex !== 'number') return;
  const item = container.querySelector(`[data-slot-index="${slotIndex}"]`);
  if (!item || item.classList.contains('inventory__item--empty')) return;

  item.classList.remove('inventory__item--received');
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
