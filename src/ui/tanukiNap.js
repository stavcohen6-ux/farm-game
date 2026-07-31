import { setIcon, UI_ICONS } from './icon.js';

const TANUKI_EMOJI = '🦝';
// Mirrors the rendered size of .plot__napper (1.7em of 1.7rem).
const VISITOR_SIZE_PX = 46;
// Appear and leave are exact time-reverses of each other.
const FADE_MS = 480;
// Matches .plot__napper's `top: 52%` so the handoff to the idle cue is exact.
const TILE_ANCHOR_Y = 0.52;

function setTanukiIcon(container, imgClass = 'game-icon game-icon--napper') {
  setIcon(container, {
    src: UI_ICONS.tanukiSleep,
    emoji: TANUKI_EMOJI,
    alt: 'Tanuki',
    imgClass,
  });
  const img = container.querySelector('img');
  if (img) {
    img.onerror = () => {
      setIcon(container, {
        emoji: TANUKI_EMOJI,
        alt: 'Tanuki',
        imgClass,
      });
    };
  }
}

// Fixed overlay so the 1s grid re-render cannot restart the animation.
function makeVisitor() {
  const visitor = document.createElement('div');
  visitor.className = 'tanuki-visitor';
  visitor.setAttribute('aria-hidden', 'true');
  visitor.style.width = `${VISITOR_SIZE_PX}px`;
  visitor.style.height = `${VISITOR_SIZE_PX}px`;
  setTanukiIcon(visitor, 'game-icon game-icon--tanuki-visitor');
  return visitor;
}

function tileAnchor(rect) {
  return {
    x: rect.left + (rect.width - VISITOR_SIZE_PX) / 2,
    y: rect.top + rect.height * TILE_ANCHOR_Y - VISITOR_SIZE_PX / 2,
  };
}

// Settle into the tile centre from nothing — no travel, no pose change.
export function playTanukiArrive({ targetRect, onComplete }) {
  if (!targetRect) {
    onComplete?.();
    return;
  }

  const { x, y } = tileAnchor(targetRect);
  const visitor = makeVisitor();
  visitor.style.transform = `translate(${x}px, ${y}px) scale(0.6)`;
  document.body.appendChild(visitor);

  const appear = visitor.animate(
    [
      { transform: `translate(${x}px, ${y}px) scale(0.6)`, opacity: 0, offset: 0 },
      { transform: `translate(${x}px, ${y}px) scale(0.94)`, opacity: 0.9, offset: 0.7 },
      { transform: `translate(${x}px, ${y}px) scale(1)`, opacity: 1, offset: 1 },
    ],
    { duration: FADE_MS, easing: 'ease-out', fill: 'forwards' },
  );

  appear.onfinish = () => {
    visitor.remove();
    onComplete?.();
  };
}

// Fade out in place at the tile centre.
export function playTanukiLeave({ sourceRect, onComplete }) {
  if (!sourceRect) {
    onComplete?.();
    return;
  }

  const { x, y } = tileAnchor(sourceRect);
  const visitor = makeVisitor();
  visitor.style.transform = `translate(${x}px, ${y}px)`;
  document.body.appendChild(visitor);

  const vanish = visitor.animate(
    [
      { transform: `translate(${x}px, ${y}px) scale(1)`, opacity: 1, offset: 0 },
      { transform: `translate(${x}px, ${y}px) scale(0.94)`, opacity: 0.9, offset: 0.3 },
      { transform: `translate(${x}px, ${y}px) scale(0.6)`, opacity: 0, offset: 1 },
    ],
    { duration: FADE_MS, easing: 'ease-in', fill: 'forwards' },
  );

  vanish.onfinish = () => {
    visitor.remove();
    onComplete?.();
  };
}

export { setTanukiIcon };
