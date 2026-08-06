/**
 * FTUE speech bubble anchored to a target element. No dismiss control —
 * advances when tutorial step changes. Exception: soft invites
 * (`exploreBoard`, `fieldNotesInvite`) dismiss on the next tap.
 */

import {
  getTutorialBubbleText,
  isTutorialActive,
  isTutorialSoftInvite,
  isTutorialFoxTarget,
  getTutorialTargetPlotIds,
} from '../state/gameState.js';
import {
  TUTORIAL_LEFT_PLOT,
  TUTORIAL_RIGHT_PLOT,
  TUTORIAL_UNLOCK_PLOT_IDS,
  TUTORIAL_STEP_FIELD_NOTES,
} from '../data/tutorial.js';

let bubbleEl = null;
let inviteDismissWired = false;
let inviteDismissHandler = null;
let inviteDismissTimer = 0;

function ensureBubble() {
  if (bubbleEl) return bubbleEl;
  bubbleEl = document.createElement('div');
  bubbleEl.className = 'tutorial-bubble';
  bubbleEl.setAttribute('role', 'status');
  bubbleEl.setAttribute('aria-live', 'polite');
  document.body.appendChild(bubbleEl);
  return bubbleEl;
}

function clearInviteDismiss() {
  if (inviteDismissTimer) {
    window.clearTimeout(inviteDismissTimer);
    inviteDismissTimer = 0;
  }
  if (inviteDismissHandler) {
    document.removeEventListener('pointerdown', inviteDismissHandler, true);
    document.removeEventListener('click', inviteDismissHandler, true);
    inviteDismissHandler = null;
  }
  if (bubbleEl) {
    bubbleEl.classList.remove('tutorial-bubble--dismissable');
  }
  inviteDismissWired = false;
}

function wireInviteDismiss(onInviteDismiss) {
  if (inviteDismissWired || typeof onInviteDismiss !== 'function') return;
  inviteDismissWired = true;
  // Wait out the prior gesture and give time to read / avoid accidental
  // dismiss (e.g. crop wheel open), then arm click-anywhere.
  inviteDismissTimer = window.setTimeout(() => {
    inviteDismissTimer = 0;
    const handler = () => {
      clearInviteDismiss();
      onInviteDismiss();
    };
    inviteDismissHandler = handler;
    if (bubbleEl) {
      bubbleEl.classList.add('tutorial-bubble--dismissable');
    }
    // Capture so plot/shrine handlers cannot swallow the dismiss.
    document.addEventListener('pointerdown', handler, true);
    document.addEventListener('click', handler, true);
  }, 3000);
}

export function teardownTutorialBubble() {
  clearInviteDismiss();
  if (bubbleEl) {
    bubbleEl.remove();
    bubbleEl = null;
  }
  if (resizeWired) {
    window.removeEventListener('resize', onResize);
    resizeWired = false;
  }
}

let resizeWired = false;
let resizeCtx = null;

function onResize() {
  if (resizeCtx?.state) {
    renderTutorialBubble(resizeCtx.state, resizeCtx);
  }
}

function isOpeningVisible() {
  const root = document.getElementById('opening-screen');
  return Boolean(root && !root.hidden);
}

function midPointAnchor(a, b) {
  return {
    getBoundingClientRect() {
      const ra = a.getBoundingClientRect();
      const rb = b.getBoundingClientRect();
      return {
        left: (ra.left + rb.left) / 2,
        top: Math.min(ra.top, rb.top),
        width: (ra.width + rb.width) / 2,
        height: ra.height,
        right: 0,
        bottom: Math.max(ra.bottom, rb.bottom),
        x: (ra.left + rb.left) / 2,
        y: Math.min(ra.top, rb.top),
      };
    },
  };
}

/**
 * @param {object} state
 * @param {{
 *   boardEl: HTMLElement,
 *   gridEl: HTMLElement,
 *   now?: number,
 *   onInviteDismiss?: () => void,
 * }} ctx
 */
export function renderTutorialBubble(state, ctx) {
  resizeCtx = { state, ...ctx };
  if (!resizeWired) {
    window.addEventListener('resize', onResize);
    resizeWired = true;
  }
  const el = ensureBubble();
  // Grove warms under the title screen; keep FTUE bubbles off until Play.
  if (!isTutorialActive(state) || isOpeningVisible()) {
    clearInviteDismiss();
    el.classList.remove('is-on', 'is-below');
    el.textContent = '';
    return;
  }

  const now = ctx.now ?? Date.now();
  const text = getTutorialBubbleText(state, now);
  if (!text) {
    clearInviteDismiss();
    el.classList.remove('is-on', 'is-below');
    el.textContent = '';
    return;
  }

  el.textContent = text;
  const anchor = resolveAnchorEl(state, ctx);
  if (!anchor) {
    el.classList.remove('is-on', 'is-below');
    return;
  }

  const r = anchor.getBoundingClientRect();
  const anchorX = r.left + r.width / 2;
  let y = r.top;
  let below = false;
  if (y < 64) {
    below = true;
    y = r.bottom;
  }

  // Position first so we can measure width for horizontal clamping.
  el.style.left = `${anchorX}px`;
  el.style.top = `${y}px`;
  el.style.setProperty('--tutorial-tail-x', '50%');
  el.classList.toggle('is-below', below);
  el.classList.add('is-on');

  const boardRect = ctx.boardEl?.getBoundingClientRect();
  // Discovery Log invite sits on the info band — clamp to the viewport plank,
  // not the farm board (board clamp would push the bubble off-target).
  const clampRect =
    state.tutorialStep === TUTORIAL_STEP_FIELD_NOTES
      ? document.getElementById('info-band')?.getBoundingClientRect() ??
        anchor.getBoundingClientRect()
      : boardRect;
  if (clampRect) {
    const pad = 8;
    const half = el.offsetWidth / 2;
    const minX = clampRect.left + pad + half;
    const maxX = clampRect.right - pad - half;
    const clampedX =
      maxX >= minX
        ? Math.min(Math.max(anchorX, minX), maxX)
        : (clampRect.left + clampRect.right) / 2;
    const tailOffset = anchorX - clampedX;
    // Keep connector diamond inside the bubble (inset from corners).
    const tailInset = 14;
    const maxTail = half - tailInset;
    const clampedTail = Math.min(Math.max(tailOffset, -maxTail), maxTail);

    el.style.left = `${clampedX}px`;
    el.style.setProperty(
      '--tutorial-tail-x',
      `calc(50% + ${clampedTail}px)`,
    );
  }

  if (isTutorialSoftInvite(state)) {
    wireInviteDismiss(ctx.onInviteDismiss);
  } else {
    clearInviteDismiss();
  }
}

function resolveAnchorEl(state, { boardEl, gridEl }) {
  const step = state.tutorialStep;
  if (isTutorialFoxTarget(state)) {
    return boardEl?.querySelector('#shrine-fox') ?? null;
  }
  if (step === 'mix') {
    const left = gridEl?.querySelector(`[data-plot-id="${TUTORIAL_LEFT_PLOT}"]`);
    const right = gridEl?.querySelector(`[data-plot-id="${TUTORIAL_RIGHT_PLOT}"]`);
    if (left && right) return midPointAnchor(left, right);
  }
  if (step === 'exploreBoard') {
    const [idA, idB] = TUTORIAL_UNLOCK_PLOT_IDS;
    const a = gridEl?.querySelector(`[data-plot-id="${idA}"]`);
    const b = gridEl?.querySelector(`[data-plot-id="${idB}"]`);
    if (a && b) return midPointAnchor(a, b);
    return a ?? b ?? null;
  }
  if (step === TUTORIAL_STEP_FIELD_NOTES) {
    return document.getElementById('game-text');
  }
  if (step === 'pickWheat' || step === 'pickWheat2') {
    const slice = document.querySelector(
      '.crop-picker__slice--unlocked[aria-label^="Wheat"]',
    );
    if (slice) return slice;
  }
  if (step === 'pickTurnip') {
    const slice = document.querySelector(
      '.crop-picker__slice--unlocked[aria-label^="Turnip"]',
    );
    if (slice) return slice;
  }

  const targets = getTutorialTargetPlotIds(state);
  const plotId = targets[0];
  if (plotId == null) return null;
  return gridEl?.querySelector(`[data-plot-id="${plotId}"]`) ?? null;
}
