import { setIcon, UI_ICONS } from './icon.js';

const SPARK_MS = 700;
const SPARK_DISTANCE_PX = 36;
const SPARK_SIZE_PX = 18;

// Burst of sparks from an inventory firefly tile, then onComplete.
export function playDeskGiftSparks({ targetEl, onComplete }) {
  if (!targetEl) {
    onComplete?.();
    return;
  }

  const rect = targetEl.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;

  const corners = [
    { dx: -1, dy: -1 },
    { dx: 1, dy: -1 },
    { dx: -1, dy: 1 },
    { dx: 1, dy: 1 },
  ];

  let remaining = corners.length;
  const half = SPARK_SIZE_PX / 2;

  for (const corner of corners) {
    const spark = document.createElement('div');
    spark.className = 'desk-gift-spark';
    spark.setAttribute('aria-hidden', 'true');
    setIcon(spark, {
      src: UI_ICONS.spark,
      emoji: '✨',
      imgClass: 'game-icon game-icon--tiny',
    });
    spark.style.width = `${SPARK_SIZE_PX}px`;
    spark.style.height = `${SPARK_SIZE_PX}px`;
    spark.style.left = `${originX - half}px`;
    spark.style.top = `${originY - half}px`;
    document.body.appendChild(spark);

    const flight = spark.animate(
      [
        { transform: 'translate(0, 0) scale(1)', opacity: 1 },
        {
          transform: `translate(${corner.dx * SPARK_DISTANCE_PX}px, ${corner.dy * SPARK_DISTANCE_PX}px) scale(0.6)`,
          opacity: 0,
        },
      ],
      { duration: SPARK_MS, easing: 'ease-out', fill: 'forwards' },
    );

    flight.onfinish = () => {
      spark.remove();
      remaining -= 1;
      if (remaining <= 0) onComplete?.();
    };
  }
}
