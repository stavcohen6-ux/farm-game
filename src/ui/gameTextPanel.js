/** Shown when there is no event message (`gameText` is null). */
export const DEFAULT_GAME_TEXT = "It's a cozy day for farming.";

/** Render the info-band game text panel from state. Plain text only. */
export function renderGameTextPanel(el, state) {
  if (!el) return;
  el.textContent = state.gameText ?? DEFAULT_GAME_TEXT;
}
