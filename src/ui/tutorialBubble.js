/**
 * FTUE speech bubble anchored to a target element. No dismiss control —
 * advances when tutorial step changes. Exception: exploreBoard dismisses
 * on the next tap after unlock.
 */

import {
  getTutorialBubbleText,
  isTutorialActive,
  isTutorialExploreInvite,
  isTutorialFoxTarget,
  getTutorialTargetPlotIds,
} from '../state/gameState.js';
import {
  TUTORIAL_LEFT_PLOT,
  TUTORIAL_RIGHT_PLOT,
  TUTORIAL_UNLOCK_PLOT_IDS,
} from '../data/tutorial.js';

let bubbleEl = null;
let exploreDismissWired = false;
let exploreDismissHandler = null;
let exploreDismissTimer = 0;

function ensureBubble() {
  if (bubbleEl) return bubbleEl;
  bubbleEl = document.createElement('div');
  bubbleEl.className = 'tutorial-bubble';
  bubbleEl.setAttribute('role', 'status');
  bubbleEl.setAttribute('aria-live', 'polite');
  document.body.appendChild(bubbleEl);
  return bubbleEl;
}

function clearExploreDismiss() {
  if (exploreDismissTimer) {
    window.clearTimeout(exploreDismissTimer);
    exploreDismissTimer = 0;
  }
  if (exploreDismissHandler) {
    document.removeEventListener('pointerdown', exploreDismissHandler, true);
    document.removeEventListener('click', exploreDismissHandler, true);
    exploreDismissHandler = null;
  }
  if (bubbleEl) {
    bubbleEl.classList.remove('tutorial-bubble--dismissable');
  }
  exploreDismissWired = false;
}

function wireExploreDismiss(onExploreDismiss) {
  if (exploreDismissWired || typeof onExploreDismiss !== 'function') return;
  exploreDismissWired = true;
  // Wait out the Root Loaf drop gesture, then arm capture-phase dismiss.
  exploreDismissTimer = window.setTimeout(() => {
    exploreDismissTimer = 0;
    const handler = () => {
      clearExploreDismiss();
      onExploreDismiss();
    };
    exploreDismissHandler = handler;
    if (bubbleEl) {
      bubbleEl.classList.add('tutorial-bubble--dismissable');
    }
    // Capture so plot/shrine handlers cannot swallow the dismiss.
    document.addEventListener('pointerdown', handler, true);
    document.addEventListener('click', handler, true);
  }, 280);
}

export function teardownTutorialBubble() {
  clearExploreDismiss();
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
 *   onExploreDismiss?: () => void,
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
    clearExploreDismiss();
    el.classList.remove('is-on', 'is-below');
    el.textContent = '';
    return;
  }

  const now = ctx.now ?? Date.now();
  const text = getTutorialBubbleText(state, now);
  if (!text) {
    clearExploreDismiss();
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
  if (boardRect) {
    const pad = 8;
    const half = el.offsetWidth / 2;
    const minX = boardRect.left + pad + half;
    const maxX = boardRect.right - pad - half;
    const clampedX =
      maxX >= minX
        ? Math.min(Math.max(anchorX, minX), maxX)
        : (boardRect.left + boardRect.right) / 2;
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

  if (isTutorialExploreInvite(state)) {
    wireExploreDismiss(ctx.onExploreDismiss);
  } else {
    clearExploreDismiss();
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
