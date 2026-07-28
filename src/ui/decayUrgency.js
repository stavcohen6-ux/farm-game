import { getCrop, getDecayMs, getDecayUrgency } from '../data/crops.js';
import { setIcon, UI_ICONS } from './icon.js';

// Applies shared warn/critical classes from an expiresAt timestamp.
// Returns the urgency level used.
export function applyDecayUrgencyClass(el, cropId, expiresAt, now = Date.now()) {
  el.classList.remove('crop-decay--warn', 'crop-decay--critical');
  const crop = getCrop(cropId);
  const urgency = getDecayUrgency(expiresAt, getDecayMs(crop), now);
  if (urgency === 'warn') el.classList.add('crop-decay--warn');
  if (urgency === 'critical') el.classList.add('crop-decay--critical');
  return urgency;
}

export function appendWiltMark(el, urgency) {
  if (urgency !== 'critical') return;
  const wilt = document.createElement('span');
  wilt.className = 'crop-decay__wilt';
  setIcon(wilt, { src: UI_ICONS.wilt, emoji: '🥀', imgClass: 'game-icon game-icon--tiny' });
  wilt.setAttribute('aria-hidden', 'true');
  el.appendChild(wilt);
}
