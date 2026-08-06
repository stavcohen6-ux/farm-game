/** Plank label and Discovery Log modal title. */
export const DISCOVERY_LOG_TITLE = 'Discovery Log';

/** Ensure the info-band plank shows the Discovery Log label. */
export function renderGameTextPanel(el) {
  if (!el) return;

  let labelEl = el.querySelector('.game-text__label');
  if (!labelEl) {
    labelEl = document.createElement('span');
    labelEl.className = 'game-text__label';
    el.replaceChildren(labelEl);
  }
  labelEl.textContent = DISCOVERY_LOG_TITLE;
}
