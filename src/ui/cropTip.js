// Shared fixed-position crop name tip (shrine accepts, discovery log origin).

let cropTipEl = null;

function ensureCropTip() {
  if (cropTipEl) return cropTipEl;
  cropTipEl = document.createElement('div');
  cropTipEl.className = 'crop-tip';
  cropTipEl.hidden = true;
  document.body.appendChild(cropTipEl);
  return cropTipEl;
}

export function showCropTip(anchor, name) {
  const tip = ensureCropTip();
  tip.textContent = name;
  tip.hidden = false;
  const rect = anchor.getBoundingClientRect();
  tip.style.left = `${rect.left + rect.width / 2}px`;
  tip.style.top = `${rect.bottom + 6}px`;
}

export function hideCropTip() {
  if (cropTipEl) cropTipEl.hidden = true;
}

export function bindCropTip(el, name) {
  el.addEventListener('pointerenter', () => showCropTip(el, name));
  el.addEventListener('pointerleave', hideCropTip);
}
