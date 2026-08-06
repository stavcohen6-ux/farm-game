/**
 * One-time centered popup when all shrines stand complete.
 * Not dismissible for SHRINE_EPILOGUE_DISMISS_LOCK_MS, then tap anywhere.
 */

import {
  SHRINES,
  SHRINE_EPILOGUE_DISMISS_LOCK_MS,
  SHRINE_EPILOGUE_LINE,
} from '../data/shrines.js';
import { logShrineIconSrc, setIcon, UI_ICONS } from './icon.js';

const SPARK_COUNT = 34;
const SPARK_MS = 2200;
const SPARK_SIZE_PX = 22;
const DIST_MIN_PX = 110;
const DIST_MAX_PX = 210;

let overlayEl = null;
let lockTimer = 0;
let dismissHandler = null;
let canDismiss = false;
let onCloseCallback = null;

function isOpeningVisible() {
  const root = document.getElementById('opening-screen');
  return Boolean(root && !root.hidden);
}

function clearDismiss() {
  if (lockTimer) {
    window.clearTimeout(lockTimer);
    lockTimer = 0;
  }
  if (dismissHandler) {
    if (overlayEl) {
      overlayEl.removeEventListener('pointerdown', dismissHandler);
      overlayEl.removeEventListener('click', dismissHandler);
    }
    dismissHandler = null;
  }
  canDismiss = false;
  if (overlayEl) {
    overlayEl.classList.remove('shrine-epilogue-overlay--dismissable');
  }
}

function cornerClass(corner) {
  if (corner === 'top-left') return 'shrine-epilogue__face--tl';
  if (corner === 'top-right') return 'shrine-epilogue__face--tr';
  if (corner === 'bottom-left') return 'shrine-epilogue__face--bl';
  if (corner === 'bottom-right') return 'shrine-epilogue__face--br';
  return '';
}

function playOpenSparkBurst(cardEl) {
  if (!cardEl || !overlayEl) return;

  const overlayRect = overlayEl.getBoundingClientRect();
  const cardRect = cardEl.getBoundingClientRect();
  const originX = cardRect.left + cardRect.width / 2 - overlayRect.left;
  const originY = cardRect.top + cardRect.height / 2 - overlayRect.top;
  const half = SPARK_SIZE_PX / 2;

  for (let i = 0; i < SPARK_COUNT; i++) {
    const angle =
      (i / SPARK_COUNT) * Math.PI * 2 + (Math.random() - 0.5) * 0.22;
    const dist = DIST_MIN_PX + Math.random() * (DIST_MAX_PX - DIST_MIN_PX);
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    const duration = SPARK_MS * (0.85 + Math.random() * 0.3);
    const delay = Math.random() * 90;

    const spark = document.createElement('div');
    spark.className = 'shrine-epilogue-spark';
    spark.setAttribute('aria-hidden', 'true');
    spark.style.width = `${SPARK_SIZE_PX}px`;
    spark.style.height = `${SPARK_SIZE_PX}px`;
    spark.style.left = `${originX - half}px`;
    spark.style.top = `${originY - half}px`;
    setIcon(spark, {
      src: UI_ICONS.spark,
      emoji: '✨',
      imgClass: 'game-icon game-icon--tiny',
    });
    overlayEl.appendChild(spark);

    const flight = spark.animate(
      [
        {
          transform: 'translate(0, 0) scale(0.55)',
          opacity: 0,
        },
        {
          transform: `translate(${dx * 0.35}px, ${dy * 0.35}px) scale(1.05)`,
          opacity: 1,
          offset: 0.18,
        },
        {
          transform: `translate(${dx}px, ${dy}px) scale(0.45)`,
          opacity: 0,
        },
      ],
      {
        duration,
        delay,
        easing: 'ease-out',
        fill: 'forwards',
      },
    );

    flight.onfinish = () => spark.remove();
  }
}

/**
 * Close and remove the epilogue overlay if open.
 * @param {{ skipOnClose?: boolean }} [opts]
 */
export function closeShrineEpilogue(opts = {}) {
  const onClose = onCloseCallback;
  onCloseCallback = null;
  clearDismiss();
  if (overlayEl) {
    overlayEl.remove();
    overlayEl = null;
  }
  if (!opts.skipOnClose && typeof onClose === 'function') {
    onClose();
  }
}

/**
 * @param {{ onClose?: () => void }} [opts]
 * @returns {boolean} true if opened (or already open)
 */
export function openShrineEpilogue(opts = {}) {
  if (isOpeningVisible()) return false;
  if (overlayEl) return true;

  const overlay = document.createElement('div');
  overlay.className = 'shrine-epilogue-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-live', 'polite');

  const card = document.createElement('div');
  card.className = 'shrine-epilogue';

  for (const shrine of SHRINES) {
    const src = logShrineIconSrc(shrine.id);
    if (!src) continue;
    const face = document.createElement('img');
    face.className = `shrine-epilogue__face ${cornerClass(shrine.corner)}`;
    face.src = src;
    face.alt = '';
    face.setAttribute('aria-hidden', 'true');
    card.appendChild(face);
  }

  const text = document.createElement('p');
  text.className = 'shrine-epilogue__text';
  text.textContent = SHRINE_EPILOGUE_LINE;
  card.appendChild(text);

  overlay.appendChild(card);
  onCloseCallback = typeof opts.onClose === 'function' ? opts.onClose : null;
  document.body.appendChild(overlay);
  overlayEl = overlay;

  requestAnimationFrame(() => {
    if (overlayEl === overlay) playOpenSparkBurst(card);
  });

  lockTimer = window.setTimeout(() => {
    lockTimer = 0;
    canDismiss = true;
    overlay.classList.add('shrine-epilogue-overlay--dismissable');
    const handler = () => {
      if (!canDismiss) return;
      closeShrineEpilogue();
    };
    dismissHandler = handler;
    overlay.addEventListener('pointerdown', handler);
    overlay.addEventListener('click', handler);
  }, SHRINE_EPILOGUE_DISMISS_LOCK_MS);

  return true;
}

/** Open if pending and not under the opening screen. */
export function tryOpenShrineEpilogue(state, opts = {}) {
  if (!state?.shrineEpiloguePendingUi) return false;
  return openShrineEpilogue(opts);
}
