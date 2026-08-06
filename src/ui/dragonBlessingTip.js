/**
 * Soft speech bubble for the first Dragon Temple win blessing.
 * Reuses tutorial-bubble styles; dismiss on next tap after a short arm delay.
 */

import { DRAGON_TEMPLE } from '../data/dragonTemple.js';
import {
  isDragonBlessingTipActive,
  isTutorialActive,
} from '../state/gameState.js';

let bubbleEl = null;
let dismissWired = false;
let dismissHandler = null;
let dismissTimer = 0;
let resizeWired = false;
let resizeCtx = null;

function ensureBubble() {
  if (bubbleEl) return bubbleEl;
  bubbleEl = document.createElement('div');
  bubbleEl.className = 'tutorial-bubble';
  bubbleEl.setAttribute('role', 'status');
  bubbleEl.setAttribute('aria-live', 'polite');
  document.body.appendChild(bubbleEl);
  return bubbleEl;
}

function clearDismiss() {
  if (dismissTimer) {
    window.clearTimeout(dismissTimer);
    dismissTimer = 0;
  }
  if (dismissHandler) {
    document.removeEventListener('pointerdown', dismissHandler, true);
    document.removeEventListener('click', dismissHandler, true);
    dismissHandler = null;
  }
  if (bubbleEl) {
    bubbleEl.classList.remove('tutorial-bubble--dismissable');
  }
  dismissWired = false;
}

function wireDismiss(onDismiss) {
  if (dismissWired || typeof onDismiss !== 'function') return;
  dismissWired = true;
  dismissTimer = window.setTimeout(() => {
    dismissTimer = 0;
    const handler = () => {
      clearDismiss();
      onDismiss();
    };
    dismissHandler = handler;
    if (bubbleEl) {
      bubbleEl.classList.add('tutorial-bubble--dismissable');
    }
    document.addEventListener('pointerdown', handler, true);
    document.addEventListener('click', handler, true);
  }, 3000);
}

function isOpeningVisible() {
  const root = document.getElementById('opening-screen');
  return Boolean(root && !root.hidden);
}

function onResize() {
  if (resizeCtx?.state) {
    renderDragonBlessingTip(resizeCtx.state, resizeCtx);
  }
}

export function teardownDragonBlessingTip() {
  clearDismiss();
  if (bubbleEl) {
    bubbleEl.remove();
    bubbleEl = null;
  }
  if (resizeWired) {
    window.removeEventListener('resize', onResize);
    resizeWired = false;
  }
  resizeCtx = null;
}

/**
 * @param {object} state
 * @param {{
 *   boardEl: HTMLElement,
 *   onDismiss?: () => void,
 * }} ctx
 */
export function renderDragonBlessingTip(state, ctx) {
  resizeCtx = { state, ...ctx };
  if (!resizeWired) {
    window.addEventListener('resize', onResize);
    resizeWired = true;
  }

  const el = ensureBubble();
  // Yield to FTUE bubbles; hide under the opening screen.
  if (
    !isDragonBlessingTipActive(state) ||
    isTutorialActive(state) ||
    isOpeningVisible()
  ) {
    clearDismiss();
    el.classList.remove('is-on', 'is-below');
    el.textContent = '';
    return;
  }

  const shrineId = state.dragonBlessingTipShrineId;
  const anchor = ctx.boardEl?.querySelector(`#shrine-${shrineId}`) ?? null;
  if (!anchor) {
    clearDismiss();
    el.classList.remove('is-on', 'is-below');
    el.textContent = '';
    return;
  }

  el.textContent = DRAGON_TEMPLE.blessingTipText;

  const r = anchor.getBoundingClientRect();
  const anchorX = r.left + r.width / 2;
  let y = r.top;
  let below = false;
  if (y < 64) {
    below = true;
    y = r.bottom;
  }

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
    const tailInset = 14;
    const maxTail = half - tailInset;
    const clampedTail = Math.min(Math.max(tailOffset, -maxTail), maxTail);

    el.style.left = `${clampedX}px`;
    el.style.setProperty(
      '--tutorial-tail-x',
      `calc(50% + ${clampedTail}px)`,
    );
  }

  wireDismiss(ctx.onDismiss);
}
