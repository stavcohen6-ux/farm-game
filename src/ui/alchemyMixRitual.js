import { setIcon, UI_ICONS } from './icon.js';

const GRIND_MS = 340;
const SPARK_MS = 420;
const SPARK_SIZE_PX = 16;
const PUFF_DISTANCE_PX = 28;

function spawnSparkAt(x, y, dx, dy, durationMs, onDone) {
  const spark = document.createElement('div');
  spark.className = 'alchemy-mix-spark';
  spark.setAttribute('aria-hidden', 'true');
  setIcon(spark, {
    src: UI_ICONS.spark,
    emoji: '✨',
    imgClass: 'game-icon game-icon--tiny',
  });
  const half = SPARK_SIZE_PX / 2;
  spark.style.width = `${SPARK_SIZE_PX}px`;
  spark.style.height = `${SPARK_SIZE_PX}px`;
  spark.style.left = `${x - half}px`;
  spark.style.top = `${y - half}px`;
  document.body.appendChild(spark);

  const flight = spark.animate(
    [
      { transform: 'translate(0, 0) scale(1)', opacity: 0.95 },
      {
        transform: `translate(${dx}px, ${dy}px) scale(0.55)`,
        opacity: 0,
      },
    ],
    { duration: durationMs, easing: 'ease-out', fill: 'forwards' },
  );

  flight.onfinish = () => {
    spark.remove();
    onDone?.();
  };
}

function mortarOrigin(mixBtn) {
  const art = mixBtn.querySelector('.alchemy__mix-art') ?? mixBtn;
  const rect = art.getBoundingClientRect();
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height * 0.42,
    rect,
  };
}

function puffFromMortar(mixBtn) {
  const { x, y } = mortarOrigin(mixBtn);
  const dirs = [
    { dx: -1, dy: -0.85 },
    { dx: 1, dy: -0.85 },
    { dx: -0.55, dy: -1.15 },
    { dx: 0.55, dy: -1.15 },
    { dx: 0, dy: -1.25 },
  ];
  for (const dir of dirs) {
    spawnSparkAt(
      x,
      y,
      dir.dx * PUFF_DISTANCE_PX,
      dir.dy * PUFF_DISTANCE_PX,
      SPARK_MS,
    );
  }
}

function sparksIntoClaim(fromRect, resultEl, onComplete) {
  const to = resultEl.getBoundingClientRect();
  const toX = to.left + to.width / 2;
  const toY = to.top + to.height / 2;
  const fromX = fromRect.left + fromRect.width / 2;
  const fromY = fromRect.top + fromRect.height * 0.42;

  const starts = [
    { x: fromX - 10, y: fromY - 6 },
    { x: fromX + 10, y: fromY - 6 },
    { x: fromX, y: fromY - 14 },
    { x: fromX - 6, y: fromY + 4 },
  ];

  let remaining = starts.length;
  const doneOne = () => {
    remaining -= 1;
    if (remaining <= 0) onComplete?.();
  };

  for (const start of starts) {
    spawnSparkAt(
      start.x,
      start.y,
      toX - start.x,
      toY - start.y,
      SPARK_MS,
      doneOne,
    );
  }
}

/**
 * Pestle grind on the Mix mortar, then calls onGrindDone with the mortar
 * rect so the caller can commit Mix and reveal the claim with inbound sparks.
 */
export function playAlchemyMixGrind(container, { onGrindDone }) {
  const mix = container.querySelector(':scope > .alchemy__row > .alchemy__mix');
  const row = container.querySelector(':scope > .alchemy__row');
  if (!mix || !row) {
    onGrindDone?.({ fromRect: null });
    return;
  }

  const { rect } = mortarOrigin(mix);
  mix.disabled = true;
  mix.classList.remove('alchemy__mix--ready');
  mix.classList.add('alchemy__mix--grinding');
  row.classList.add('alchemy__row--ritual');
  puffFromMortar(mix);

  window.setTimeout(() => {
    onGrindDone?.({ fromRect: rect });
  }, GRIND_MS);
}

/** Soft claim appear + sparks flying from the mortar into the result. */
export function playAlchemyResultReveal(container, { fromRect }, onComplete) {
  const result = container.querySelector(':scope > .alchemy__result');
  if (!result) {
    onComplete?.();
    return;
  }

  result.classList.add('alchemy__result--appear');

  if (!fromRect) {
    onComplete?.();
    return;
  }

  sparksIntoClaim(fromRect, result, onComplete);
}
