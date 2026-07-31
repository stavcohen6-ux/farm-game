/** Shown when there is no event message (`gameText` is null). */
export const DEFAULT_GAME_TEXT = "It's a cozy day for farming.";

/** Permanent second-line title on the game-text plank (and modal title). */
export const FIELD_NOTES_TITLE = 'Field Notes';

/** Render the info-band game text panel from state. Plain text only. */
export function renderGameTextPanel(el, state) {
  if (!el) return;

  let messageEl = el.querySelector('.game-text__message');
  let titleEl = el.querySelector('.game-text__title');

  if (!messageEl) {
    messageEl = document.createElement('span');
    messageEl.className = 'game-text__message';
    messageEl.setAttribute('aria-live', 'polite');
    el.appendChild(messageEl);
  }

  if (!titleEl) {
    titleEl = document.createElement('span');
    titleEl.className = 'game-text__title';
    titleEl.textContent = FIELD_NOTES_TITLE;
    el.appendChild(titleEl);
  }

  messageEl.textContent = state.gameText ?? DEFAULT_GAME_TEXT;
}
