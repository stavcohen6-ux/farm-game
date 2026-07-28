import { setIcon, UI_ICONS } from './icon.js';

const FLY_SPEED_PX_PER_SEC = 95;
const FLY_MIN_MS = 700;
const ARC_LIFT_PX = 56;
const FLYER_SIZE_PX = 28;

function dist(ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  return Math.hypot(dx, dy);
}

// Soft flutter from a plot to a shrine icon, then calls onComplete.
// Duration scales with arc path length at a constant gentle speed.
export function playCritterFly({ sourceRect, targetRect, onComplete }) {
  if (!sourceRect || !targetRect) {
    onComplete?.();
    return;
  }

  const flyer = document.createElement('div');
  flyer.className = 'critter-fly';
  flyer.setAttribute('aria-hidden', 'true');
  setIcon(flyer, {
    src: UI_ICONS.butterfly,
    emoji: '🦋',
    imgClass: 'game-icon game-icon--critter-fly',
  });

  const startX = sourceRect.left + (sourceRect.width - FLYER_SIZE_PX) / 2;
  const startY = sourceRect.top + sourceRect.height * 0.15;
  const endX = targetRect.left + (targetRect.width - FLYER_SIZE_PX) / 2;
  const endY = targetRect.top + (targetRect.height - FLYER_SIZE_PX) / 2;
  const midX = (startX + endX) / 2;
  const midY = Math.min(startY, endY) - ARC_LIFT_PX;

  const pathLength =
    dist(startX, startY, midX, midY) + dist(midX, midY, endX, endY);
  const duration = Math.max(
    FLY_MIN_MS,
    (pathLength / FLY_SPEED_PX_PER_SEC) * 1000,
  );

  flyer.style.width = `${FLYER_SIZE_PX}px`;
  flyer.style.height = `${FLYER_SIZE_PX}px`;
  flyer.style.transform = `translate(${startX}px, ${startY}px)`;
  document.body.appendChild(flyer);

  const flight = flyer.animate(
    [
      { transform: `translate(${startX}px, ${startY}px) scale(1)`, opacity: 1 },
      {
        transform: `translate(${midX}px, ${midY}px) scale(1.08)`,
        opacity: 1,
        offset: 0.45,
      },
      { transform: `translate(${endX}px, ${endY}px) scale(0.9)`, opacity: 0.85 },
    ],
    { duration, easing: 'linear', fill: 'forwards' },
  );

  flight.onfinish = () => {
    flyer.remove();
    onComplete?.();
  };
}
