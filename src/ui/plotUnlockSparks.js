import { setIcon, UI_ICONS } from './icon.js';

const SPARK_MS = 1440;
const SPARK_SIZE_PX = 22;
const STAGGER_MS = 95;

/**
 * Rise from near the bottom of the tile, drifting outward.
 * startX = horizontal offset across the tile; dx/dy = travel direction.
 * Alternating L/R order so neighbors don't pile up.
 */
const SPARK_DIRS = [
  { startX: -0.08, dx: -0.2, dy: -1.9 },
  { startX: 0.08, dx: 0.2, dy: -1.9 },
  { startX: -0.22, dx: -0.55, dy: -1.75 },
  { startX: 0.22, dx: 0.55, dy: -1.75 },
  { startX: -0.38, dx: -0.95, dy: -1.55 },
  { startX: 0.38, dx: 0.95, dy: -1.55 },
  { startX: -0.12, dx: -0.75, dy: -2.05 },
  { startX: 0.12, dx: 0.75, dy: -2.05 },
  { startX: -0.3, dx: -1.15, dy: -1.15 },
  { startX: 0.3, dx: 1.15, dy: -1.15 },
];

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Soft cutout spark pop over an unlocking plot (locked→soil fade stays separate).
export function playPlotUnlockSparks({ plotEl }) {
  if (!plotEl || prefersReducedMotion()) return;

  const rect = plotEl.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return;

  const half = SPARK_SIZE_PX / 2;
  const originY = rect.top + rect.height * 0.88;
  const travel = Math.min(rect.width, rect.height) * 0.95;

  SPARK_DIRS.forEach((dir, i) => {
    const ox = rect.left + rect.width * (0.5 + dir.startX);
    const oy = originY + ((i % 3) - 1) * 3;
    const spark = document.createElement('div');
    spark.className = 'plot-unlock-spark';
    spark.setAttribute('aria-hidden', 'true');
    setIcon(spark, {
      src: UI_ICONS.spark,
      emoji: '✨',
      imgClass: 'game-icon game-icon--tiny',
    });
    spark.style.width = `${SPARK_SIZE_PX}px`;
    spark.style.height = `${SPARK_SIZE_PX}px`;
    spark.style.left = `${ox - half}px`;
    spark.style.top = `${oy - half}px`;
    // Stay invisible during WAAPI delay (otherwise they sit opaque at spawn).
    spark.style.opacity = '0';
    document.body.appendChild(spark);

    const tx = dir.dx * travel;
    const ty = dir.dy * travel;
    const flight = spark.animate(
      [
        { transform: 'translate(0, 0) scale(0.4)', opacity: 0 },
        {
          transform: `translate(${tx * 0.28}px, ${ty * 0.28}px) scale(1.05)`,
          opacity: 1,
          offset: 0.28,
        },
        {
          transform: `translate(${tx}px, ${ty}px) scale(0.45)`,
          opacity: 0,
        },
      ],
      {
        duration: SPARK_MS,
        delay: i * STAGGER_MS,
        easing: 'ease-out',
        fill: 'forwards',
      },
    );
    flight.onfinish = () => spark.remove();
  });
}
