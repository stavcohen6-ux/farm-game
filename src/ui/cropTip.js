// Shared fixed-position crop name tip (shrine accepts, discovery log origin).
// Mouse: hover to show. Touch/pen: tap to pin until tap again or tap elsewhere.

let cropTipEl = null;
let pinnedEl = null;

function ensureCropTip() {
  if (cropTipEl) return cropTipEl;
  cropTipEl = document.createElement('div');
  cropTipEl.className = 'crop-tip';
  cropTipEl.hidden = true;
  document.body.appendChild(cropTipEl);
  return cropTipEl;
}

function onDocPointerDown(event) {
  if (pinnedEl && pinnedEl.contains(event.target)) return;
  hideCropTip();
}

function setPinned(el) {
  if (!pinnedEl) {
    document.addEventListener('pointerdown', onDocPointerDown, true);
  }
  pinnedEl = el;
}

function clearPinned() {
  if (!pinnedEl) return;
  document.removeEventListener('pointerdown', onDocPointerDown, true);
  pinnedEl = null;
}

export function showCropTip(anchor, name, { large = false, small = false } = {}) {
  const tip = ensureCropTip();
  tip.textContent = name;
  tip.classList.toggle('crop-tip--large', large);
  tip.classList.toggle('crop-tip--small', small);
  tip.hidden = false;
  const rect = anchor.getBoundingClientRect();
  tip.style.left = `${rect.left + rect.width / 2}px`;
  tip.style.top = `${rect.top - 6}px`;
}

export function hideCropTip() {
  clearPinned();
  if (cropTipEl) cropTipEl.hidden = true;
}

/** Pin tip until tap again on the same anchor or tap elsewhere. */
export function pinCropTip(anchor, name, options = {}) {
  if (pinnedEl === anchor) {
    hideCropTip();
    return;
  }
  showCropTip(anchor, name, options);
  setPinned(anchor);
}

function isTouchLike(event) {
  return event.pointerType === 'touch' || event.pointerType === 'pen';
}

export function bindCropTip(el, name, options = {}) {
  el.addEventListener('pointerenter', (event) => {
    if (event.pointerType !== 'mouse') return;
    showCropTip(el, name, options);
  });
  el.addEventListener('pointerleave', (event) => {
    if (event.pointerType !== 'mouse') return;
    hideCropTip();
  });
  el.addEventListener('pointerup', (event) => {
    if (!isTouchLike(event)) return;
    pinCropTip(el, name, options);
  });
}
