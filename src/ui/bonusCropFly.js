import { getShrine } from '../data/shrines.js';
import { setIcon, cropIconSrc, UI_ICONS } from './icon.js';

const FLY_MS = 1400;
const ARC_LIFT_PX = 24;
const FLYER_SIZE_PX = 36;
const START_OFFSET_PX = 52;
const TRAIL_COUNT = 4;
const TRAIL_STAGGER_MS = 120;
const TRAIL_SPARK_MS = 700;
const TRAIL_SIZE_PX = 16;
const PLUS_MS = 900;
const PLUS_RISE_PX = 28;

/** Farm-side approach: toward board center into each corner shrine. */
const CORNER_OFFSET = {
  'top-left': { dx: 1, dy: 1 },
  'top-right': { dx: -1, dy: 1 },
  'bottom-left': { dx: 1, dy: -1 },
  'bottom-right': { dx: -1, dy: -1 },
};

// Ghost crop hops a short arc from near the shrine into its icon.
// On arrival: cream/ink +1 pop over the shrine, then onComplete.
export function playHarvestCropFly({
  shrineId,
  targetRect,
  cropId = null,
  icon = '',
  withSparks = false,
  onComplete,
}) {
  if (!targetRect) {
    onComplete?.();
    return;
  }

  const corner = getShrine(shrineId)?.corner ?? 'bottom-right';
  const offset = CORNER_OFFSET[corner] ?? CORNER_OFFSET['bottom-right'];
  const endX = targetRect.left + (targetRect.width - FLYER_SIZE_PX) / 2;
  const endY = targetRect.top + (targetRect.height - FLYER_SIZE_PX) / 2;
  const len = Math.hypot(offset.dx, offset.dy);
  const startX = endX + (offset.dx / len) * START_OFFSET_PX;
  const startY = endY + (offset.dy / len) * START_OFFSET_PX;
  const midX = (startX + endX) / 2;
  const midY = Math.min(startY, endY) - ARC_LIFT_PX;

  const flyer = document.createElement('div');
  flyer.className = 'bonus-crop-fly';
  flyer.setAttribute('aria-hidden', 'true');
  setIcon(flyer, {
    src: cropId ? cropIconSrc(cropId) : null,
    emoji: icon,
    imgClass: 'game-icon game-icon--bonus-fly',
  });
  flyer.style.width = `${FLYER_SIZE_PX}px`;
  flyer.style.height = `${FLYER_SIZE_PX}px`;
  flyer.style.transform = `translate(${startX}px, ${startY}px) scale(0.85)`;
  document.body.appendChild(flyer);

  if (withSparks) {
    spawnSparkTrail({ startX, startY, midX, midY, endX, endY });
  }

  const flight = flyer.animate(
    [
      {
        transform: `translate(${startX}px, ${startY}px) scale(0.85)`,
        opacity: 0.9,
      },
      {
        transform: `translate(${midX}px, ${midY}px) scale(1.12)`,
        opacity: 1,
        offset: 0.45,
      },
      {
        transform: `translate(${endX}px, ${endY}px) scale(0.7)`,
        opacity: 0.35,
      },
    ],
    { duration: FLY_MS, easing: 'ease-out', fill: 'forwards' },
  );

  flight.onfinish = () => {
    flyer.remove();
    spawnPlusOne(targetRect);
    onComplete?.();
  };
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// Quadratic bezier sample for trail sparks along the same arc as the flyer.
function pointOnArc(startX, startY, midX, midY, endX, endY, t) {
  const u = 1 - t;
  return {
    x: u * u * startX + 2 * u * t * midX + t * t * endX,
    y: u * u * startY + 2 * u * t * midY + t * t * endY,
  };
}

function spawnSparkTrail({ startX, startY, midX, midY, endX, endY }) {
  const half = TRAIL_SIZE_PX / 2;

  for (let i = 0; i < TRAIL_COUNT; i++) {
    window.setTimeout(() => {
      const t = (i + 1) / (TRAIL_COUNT + 1);
      const { x, y } = pointOnArc(startX, startY, midX, midY, endX, endY, t);
      const spark = document.createElement('div');
      spark.className = 'bonus-crop-spark';
      spark.setAttribute('aria-hidden', 'true');
      setIcon(spark, {
        src: UI_ICONS.spark,
        emoji: '✨',
        imgClass: 'game-icon game-icon--tiny',
      });
      spark.style.width = `${TRAIL_SIZE_PX}px`;
      spark.style.height = `${TRAIL_SIZE_PX}px`;
      spark.style.transform = `translate(${x - half}px, ${y - half}px) scale(0.6)`;
      document.body.appendChild(spark);

      const driftX = lerp(-8, 8, i / Math.max(1, TRAIL_COUNT - 1));
      const flight = spark.animate(
        [
          {
            transform: `translate(${x - half}px, ${y - half}px) scale(0.6)`,
            opacity: 0.9,
          },
          {
            transform: `translate(${x - half + driftX}px, ${y - half - 14}px) scale(1)`,
            opacity: 0,
          },
        ],
        { duration: TRAIL_SPARK_MS, easing: 'ease-out', fill: 'forwards' },
      );
      flight.onfinish = () => spark.remove();
    }, i * TRAIL_STAGGER_MS);
  }
}

function spawnPlusOne(targetRect) {
  const el = document.createElement('div');
  el.className = 'bonus-crop-plus';
  el.setAttribute('aria-hidden', 'true');
  el.textContent = '+1';
  const x = targetRect.left + targetRect.width / 2;
  const y = targetRect.top + targetRect.height * 0.2;
  el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
  document.body.appendChild(el);

  const flight = el.animate(
    [
      {
        transform: `translate(${x}px, ${y}px) translate(-50%, -50%) scale(0.85)`,
        opacity: 0,
      },
      {
        transform: `translate(${x}px, ${y - PLUS_RISE_PX * 0.35}px) translate(-50%, -50%) scale(1.15)`,
        opacity: 1,
        offset: 0.25,
      },
      {
        transform: `translate(${x}px, ${y - PLUS_RISE_PX}px) translate(-50%, -50%) scale(1)`,
        opacity: 0,
      },
    ],
    { duration: PLUS_MS, easing: 'ease-out', fill: 'forwards' },
  );
  flight.onfinish = () => el.remove();
}
