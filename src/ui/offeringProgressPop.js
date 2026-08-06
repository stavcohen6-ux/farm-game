import { logShrineIconSrc } from './icon.js';

const CHIP_MS = 780;
const CHIP_RISE_PX = 22;
const BAR_TICK_MS = 420;

/**
 * Quiet honey/parchment +N chip for shrine offering progress.
 * Anchors farm-inward between the progress track and figure (never past the
 * outer screen edge). Distinct from Tiger fortune cream/ink +1 on the figure.
 *
 * @param {{
 *   trackEl: Element | null,
 *   iconEl: Element | null,
 *   amount: number,
 *   shrineId: string,
 * }} opts
 */
export function playOfferingProgressPop({
  trackEl,
  iconEl,
  amount,
  shrineId,
}) {
  if (!trackEl || !iconEl) return;
  if (typeof amount !== 'number' || amount <= 0) return;

  tickTrack(trackEl);
  spawnChip(trackEl, iconEl, amount, shrineId);
}

function tickTrack(trackEl) {
  trackEl.classList.add('offering-progress-tick');
  window.setTimeout(() => {
    trackEl.classList.remove('offering-progress-tick');
  }, BAR_TICK_MS);
}

function spawnChip(trackEl, iconEl, amount, shrineId) {
  const rect = trackEl.getBoundingClientRect();
  const iconRect = iconEl.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return;

  const el = document.createElement('div');
  el.className = 'offering-progress-chip';
  el.setAttribute('aria-hidden', 'true');

  const faceSrc = logShrineIconSrc(shrineId);
  if (faceSrc) {
    const face = document.createElement('img');
    face.className = 'offering-progress-chip__face';
    face.src = faceSrc;
    face.alt = '';
    el.appendChild(face);
  }

  const amt = document.createElement('span');
  amt.className = 'offering-progress-chip__amt';
  amt.textContent = `+${amount}`;
  el.appendChild(amt);

  document.body.appendChild(el);

  // Farm-inward: mid-gap between track and figure.
  const barCenterX = rect.left + rect.width / 2;
  const figureCenterX = iconRect.left + iconRect.width / 2;
  const inwardSign = figureCenterX >= barCenterX ? 1 : -1;
  const x =
    inwardSign > 0
      ? (rect.right + iconRect.left) / 2
      : (iconRect.right + rect.left) / 2;
  const y = rect.top + rect.height * 0.35;

  const flight = el.animate(
    [
      {
        transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(0.88)`,
        opacity: 0,
      },
      {
        transform: `translate(${x}px, ${y - CHIP_RISE_PX * 0.4}px) translate(-50%, -50%) scale(1.04)`,
        opacity: 1,
        offset: 0.22,
      },
      {
        transform: `translate(${x}px, ${y - CHIP_RISE_PX}px) translate(-50%, -50%) scale(1)`,
        opacity: 0,
      },
    ],
    { duration: CHIP_MS, easing: 'ease-out', fill: 'forwards' },
  );
  flight.onfinish = () => el.remove();
}
