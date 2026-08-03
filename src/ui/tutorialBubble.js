/**
 * FTUE speech bubble anchored to a target element. No dismiss control —
 * advances when tutorial step changes.
 */

import {
  getTutorialBubbleText,
  isTutorialActive,
  isTutorialFoxTarget,
  getTutorialTargetPlotIds,
} from '../state/gameState.js';
import { TUTORIAL_LEFT_PLOT, TUTORIAL_RIGHT_PLOT } from '../data/tutorial.js';

let bubbleEl = null;

function ensureBubble() {
  if (bubbleEl) return bubbleEl;
  bubbleEl = document.createElement('div');
  bubbleEl.className = 'tutorial-bubble';
  bubbleEl.setAttribute('role', 'status');
  bubbleEl.setAttribute('aria-live', 'polite');
  document.body.appendChild(bubbleEl);
  return bubbleEl;
}

export function teardownTutorialBubble() {
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

/**
 * @param {object} state
 * @param {{
 *   boardEl: HTMLElement,
 *   gridEl: HTMLElement,
 *   now?: number,
 * }} ctx
 */
export function renderTutorialBubble(state, ctx) {
  resizeCtx = { state, ...ctx };
  if (!resizeWired) {
    window.addEventListener('resize', onResize);
    resizeWired = true;
  }
  const el = ensureBubble();
  if (!isTutorialActive(state)) {
    el.classList.remove('is-on', 'is-below');
    el.textContent = '';
    return;
  }

  const now = ctx.now ?? Date.now();
  const text = getTutorialBubbleText(state, now);
  if (!text) {
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
  const x = r.left + r.width / 2;
  let y = r.top;
  let below = false;
  if (y < 64) {
    below = true;
    y = r.bottom;
  }

  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  el.classList.toggle('is-below', below);
  el.classList.add('is-on');
}

function resolveAnchorEl(state, { boardEl, gridEl }) {
  const step = state.tutorialStep;
  if (isTutorialFoxTarget(state)) {
    return boardEl?.querySelector('#shrine-fox') ?? null;
  }
  if (step === 'mix') {
    const left = gridEl?.querySelector(`[data-plot-id="${TUTORIAL_LEFT_PLOT}"]`);
    const right = gridEl?.querySelector(`[data-plot-id="${TUTORIAL_RIGHT_PLOT}"]`);
    if (left && right) {
      return {
        getBoundingClientRect() {
          const a = left.getBoundingClientRect();
          const b = right.getBoundingClientRect();
          return {
            left: (a.left + b.left) / 2,
            top: Math.min(a.top, b.top),
            width: (a.width + b.width) / 2,
            height: a.height,
            right: 0,
            bottom: Math.max(a.bottom, b.bottom),
            x: (a.left + b.left) / 2,
            y: Math.min(a.top, b.top),
          };
        },
      };
    }
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
