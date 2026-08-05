import { DRAGON_TEMPLE } from '../data/dragonTemple.js';
import { setIcon, UI_ICONS } from './icon.js';

const FLY_MS = 4200; // slightly slower than the tiger bonus hop (1400ms)
const ARC_LIFT_PX = 48;
const STAGGER_MS = 80;
const SPARK_SIZE_PX = 28;

// Spawns sparks that arc from the temple to a shrine icon.
// Calls onComplete after the last spark lands (and is removed).
export function playTempleRewardSparks({
  sourceEl,
  targetIconEl,
  onComplete,
}) {
  if (!sourceEl || !targetIconEl) {
    onComplete?.();
    return;
  }

  const sourceRect = sourceEl.getBoundingClientRect();
  const targetRect = targetIconEl.getBoundingClientRect();
  const count = DRAGON_TEMPLE.rewardSparkCount;

  if (count <= 0) {
    onComplete?.();
    return;
  }

  let remaining = count;

  for (let i = 0; i < count; i++) {
    const startOffsetX = (i - (count - 1) / 2) * 10;
    const startOffsetY = (i % 2 === 0 ? -1 : 1) * 6;

    window.setTimeout(() => {
      flySpark({
        startX: sourceRect.left + sourceRect.width / 2 - SPARK_SIZE_PX / 2 + startOffsetX,
        startY: sourceRect.top + sourceRect.height / 2 - SPARK_SIZE_PX / 2 + startOffsetY,
        endX: targetRect.left + (targetRect.width - SPARK_SIZE_PX) / 2,
        endY: targetRect.top + (targetRect.height - SPARK_SIZE_PX) / 2,
        onLand: () => {
          remaining -= 1;
          if (remaining <= 0) onComplete?.();
        },
      });
    }, i * STAGGER_MS);
  }
}

function flySpark({ startX, startY, endX, endY, onLand }) {
  const flyer = document.createElement('div');
  flyer.className = 'temple-reward-spark';
  flyer.setAttribute('aria-hidden', 'true');
  setIcon(flyer, {
    src: UI_ICONS.spark,
    emoji: DRAGON_TEMPLE.rewardSparkIcon,
    imgClass: 'game-icon',
  });
  flyer.style.width = `${SPARK_SIZE_PX}px`;
  flyer.style.height = `${SPARK_SIZE_PX}px`;
  flyer.style.transform = `translate(${startX}px, ${startY}px)`;
  document.body.appendChild(flyer);

  const midX = (startX + endX) / 2;
  const midY = Math.min(startY, endY) - ARC_LIFT_PX;

  const flight = flyer.animate(
    [
      { transform: `translate(${startX}px, ${startY}px)`, opacity: 1 },
      { transform: `translate(${midX}px, ${midY}px)`, opacity: 1, offset: 0.45 },
      { transform: `translate(${endX}px, ${endY}px)`, opacity: 0.85 },
    ],
    { duration: FLY_MS, easing: 'ease-out', fill: 'forwards' },
  );

  flight.onfinish = () => {
    flyer.remove();
    onLand?.();
  };
}
