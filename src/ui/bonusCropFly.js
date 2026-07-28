import { setIcon, cropIconSrc, UI_ICONS } from './icon.js';

const FLY_MS = 700;
const LAND_MS = 180;
const ARC_LIFT_PX = 48;
const BONUS_SPARK_MS = 1000;
const BONUS_SPARK_DISTANCE_PX = 50;
const BONUS_SPARK_SIZE_PX = 20;

// Spawns a crop tile that arcs from `sourceRect` to the center of
// `targetRect`, softens on arrival, then calls `onComplete`.
// When `withSparks` is true, four sparks fly outward from the flyer corners.
export function playHarvestCropFly({
  sourceRect,
  targetRect,
  cropId = null,
  icon = '',
  withSparks = false,
  onComplete,
}) {
  if (!sourceRect || !targetRect) {
    onComplete?.();
    return;
  }

  const flyer = document.createElement('div');
  flyer.className = 'bonus-crop-fly';
  flyer.setAttribute('aria-hidden', 'true');

  const iconEl = document.createElement('span');
  iconEl.className = 'bonus-crop-fly__icon';
  setIcon(iconEl, {
    src: cropId ? cropIconSrc(cropId) : null,
    emoji: icon,
    imgClass: 'game-icon',
  });
  flyer.appendChild(iconEl);

  const startX = sourceRect.left;
  const startY = sourceRect.top;
  const endX = targetRect.left + (targetRect.width - sourceRect.width) / 2;
  const endY = targetRect.top + (targetRect.height - sourceRect.height) / 2;
  const midX = (startX + endX) / 2;
  const midY = Math.min(startY, endY) - ARC_LIFT_PX;

  flyer.style.width = `${sourceRect.width}px`;
  flyer.style.height = `${sourceRect.height}px`;
  flyer.style.transform = `translate(${startX}px, ${startY}px)`;

  document.body.appendChild(flyer);

  if (withSparks) {
    spawnBonusCornerSparks(flyer, sourceRect.width, sourceRect.height);
  }

  const flight = flyer.animate(
    [
      { transform: `translate(${startX}px, ${startY}px)` },
      { transform: `translate(${midX}px, ${midY}px)`, offset: 0.45 },
      { transform: `translate(${endX}px, ${endY}px)` },
    ],
    { duration: FLY_MS, easing: 'ease-out', fill: 'forwards' },
  );

  flight.onfinish = () => {
    flyer.style.transform = `translate(${endX}px, ${endY}px)`;
    flyer.classList.add('bonus-crop-fly--landed');

    window.setTimeout(() => {
      flyer.remove();
      onComplete?.();
    }, LAND_MS);
  };
}

function spawnBonusCornerSparks(flyer, width, height) {
  const half = BONUS_SPARK_SIZE_PX / 2;
  const corners = [
    { x: 0, y: 0, dx: -1, dy: -1 },
    { x: width, y: 0, dx: 1, dy: -1 },
    { x: 0, y: height, dx: -1, dy: 1 },
    { x: width, y: height, dx: 1, dy: 1 },
  ];

  for (const corner of corners) {
    const spark = document.createElement('div');
    spark.className = 'bonus-crop-spark';
    spark.setAttribute('aria-hidden', 'true');
    setIcon(spark, { src: UI_ICONS.spark, emoji: '✨', imgClass: 'game-icon game-icon--tiny' });
    spark.style.width = `${BONUS_SPARK_SIZE_PX}px`;
    spark.style.height = `${BONUS_SPARK_SIZE_PX}px`;
    spark.style.left = `${corner.x - half}px`;
    spark.style.top = `${corner.y - half}px`;
    flyer.appendChild(spark);

    const flight = spark.animate(
      [
        { transform: 'translate(0, 0)', opacity: 1 },
        {
          transform: `translate(${corner.dx * BONUS_SPARK_DISTANCE_PX}px, ${corner.dy * BONUS_SPARK_DISTANCE_PX}px)`,
          opacity: 0,
        },
      ],
      { duration: BONUS_SPARK_MS, easing: 'ease-out', fill: 'forwards' },
    );

    flight.onfinish = () => {
      spark.remove();
    };
  }
}
