import { setIcon, UI_ICONS } from './icon.js';

const SPARK_MS_REGULAR = 1100;
const SPARK_MS_DISCOVERY = 1320;
const SPARK_SIZE_REGULAR = 18;
const SPARK_SIZE_DISCOVERY = 20;
const STAGGER_REGULAR = 70;
const STAGGER_DISCOVERY = 55;
const RING_MS = 900;
const CHIP_MS = 1400;
const RESULT_POP_MS = 480;

const REGULAR_DIRS = [
  { startX: -0.06, dx: -0.35, dy: -1.35 },
  { startX: 0.06, dx: 0.35, dy: -1.35 },
  { startX: -0.22, dx: -0.75, dy: -1.15 },
  { startX: 0.22, dx: 0.75, dy: -1.15 },
  { startX: -0.12, dx: -0.55, dy: -1.55 },
  { startX: 0.12, dx: 0.55, dy: -1.55 },
  { startX: -0.28, dx: -1.05, dy: -0.85 },
  { startX: 0.28, dx: 1.05, dy: -0.85 },
];

const DISCOVERY_DIRS = [
  { startX: -0.05, dx: -0.25, dy: -1.7 },
  { startX: 0.05, dx: 0.25, dy: -1.7 },
  { startX: -0.18, dx: -0.65, dy: -1.55 },
  { startX: 0.18, dx: 0.65, dy: -1.55 },
  { startX: -0.32, dx: -1.05, dy: -1.35 },
  { startX: 0.32, dx: 1.05, dy: -1.35 },
  { startX: -0.12, dx: -0.45, dy: -1.9 },
  { startX: 0.12, dx: 0.45, dy: -1.9 },
  { startX: -0.4, dx: -1.25, dy: -1.0 },
  { startX: 0.4, dx: 1.25, dy: -1.0 },
  { startX: -0.22, dx: -0.9, dy: -1.75 },
  { startX: 0.22, dx: 0.9, dy: -1.75 },
  { startX: -0.08, dx: -0.7, dy: -1.45 },
  { startX: 0.08, dx: 0.7, dy: -1.45 },
];

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function spawnSparks(plotEl, { discovery }) {
  const rect = plotEl.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return;

  const dirs = discovery ? DISCOVERY_DIRS : REGULAR_DIRS;
  const size = discovery ? SPARK_SIZE_DISCOVERY : SPARK_SIZE_REGULAR;
  const half = size / 2;
  const originX = rect.left + rect.width * 0.5;
  const originY = rect.top + rect.height * 0.52;
  const travel = Math.min(rect.width, rect.height) * (discovery ? 1.05 : 0.85);
  const duration = discovery ? SPARK_MS_DISCOVERY : SPARK_MS_REGULAR;
  const stagger = discovery ? STAGGER_DISCOVERY : STAGGER_REGULAR;

  dirs.forEach((dir, i) => {
    const ox = originX + dir.startX * rect.width;
    const oy = originY + ((i % 3) - 1) * 2;
    const spark = document.createElement('div');
    spark.className = discovery ? 'mix-fx-spark mix-fx-spark--discovery' : 'mix-fx-spark';
    spark.setAttribute('aria-hidden', 'true');
    setIcon(spark, {
      src: UI_ICONS.spark,
      emoji: '✨',
      imgClass: 'game-icon game-icon--tiny',
    });
    spark.style.width = `${size}px`;
    spark.style.height = `${size}px`;
    spark.style.left = `${ox - half}px`;
    spark.style.top = `${oy - half}px`;
    spark.style.opacity = '0';
    document.body.appendChild(spark);

    const tx = dir.dx * travel;
    const ty = dir.dy * travel;
    const flight = spark.animate(
      [
        { transform: 'translate(0, 0) scale(0.35)', opacity: 0 },
        {
          transform: `translate(${tx * 0.3}px, ${ty * 0.3}px) scale(1.08)`,
          opacity: 1,
          offset: 0.26,
        },
        {
          transform: `translate(${tx}px, ${ty}px) scale(0.4)`,
          opacity: 0,
        },
      ],
      {
        duration,
        delay: i * stagger,
        easing: 'ease-out',
        fill: 'forwards',
      },
    );
    flight.onfinish = () => spark.remove();
  });
}

function playDiscoveryRing(plotEl) {
  const rect = plotEl.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return;

  const ring = document.createElement('div');
  ring.className = 'mix-fx-ring';
  ring.setAttribute('aria-hidden', 'true');
  const size = Math.min(rect.width, rect.height) * 0.42;
  ring.style.width = `${size}px`;
  ring.style.height = `${size}px`;
  ring.style.left = `${rect.left + rect.width / 2}px`;
  ring.style.top = `${rect.top + rect.height / 2}px`;
  document.body.appendChild(ring);

  const flight = ring.animate(
    [
      { opacity: 0.95, transform: 'translate(-50%, -50%) scale(0.55)' },
      { opacity: 0.7, transform: 'translate(-50%, -50%) scale(1.35)', offset: 0.4 },
      { opacity: 0, transform: 'translate(-50%, -50%) scale(2.05)' },
    ],
    { duration: RING_MS, easing: 'ease-out', fill: 'forwards' },
  );
  flight.onfinish = () => ring.remove();
}

function playDiscoveryChip(plotEl) {
  const rect = plotEl.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return;

  const chip = document.createElement('div');
  chip.className = 'mix-fx-chip';
  chip.textContent = 'New discovery';
  chip.setAttribute('aria-hidden', 'true');
  chip.style.left = `${rect.left + rect.width / 2}px`;
  chip.style.top = `${rect.top - 4}px`;
  document.body.appendChild(chip);

  const flight = chip.animate(
    [
      { opacity: 0, transform: 'translate(-50%, -100%) translateY(0.45rem) scale(0.92)' },
      {
        opacity: 1,
        transform: 'translate(-50%, -100%) translateY(0) scale(1)',
        offset: 0.22,
      },
      {
        opacity: 1,
        transform: 'translate(-50%, -100%) translateY(0) scale(1)',
        offset: 0.72,
      },
      { opacity: 0, transform: 'translate(-50%, -100%) translateY(-0.35rem) scale(1)' },
    ],
    { duration: CHIP_MS, delay: 120, easing: 'ease-out', fill: 'forwards' },
  );
  flight.onfinish = () => chip.remove();
}

function playResultPop(plotEl) {
  const icon = plotEl.querySelector('.plot__icon');
  if (!icon) return;
  icon.classList.add('plot__icon--mix-appear');
  const onEnd = (event) => {
    if (event.animationName !== 'mix-result-appear') return;
    icon.removeEventListener('animationend', onEnd);
    icon.classList.remove('plot__icon--mix-appear');
  };
  icon.addEventListener('animationend', onEnd);
  window.setTimeout(() => {
    icon.classList.remove('plot__icon--mix-appear');
  }, RESULT_POP_MS + 80);
}

/**
 * Juicy on-plot mix VFX after a successful mix render.
 * Regular: spark puff + result pop (honey wash is CSS via plot--mix-shine).
 * Discovery: brighter wash class + expanding ring + parchment chip + more sparks.
 */
export function playMixEffects({ plotEl, discovery = false }) {
  if (!plotEl) return;

  if (!prefersReducedMotion()) {
    spawnSparks(plotEl, { discovery });
    playResultPop(plotEl);
    if (discovery) {
      playDiscoveryRing(plotEl);
      playDiscoveryChip(plotEl);
    }
  } else if (discovery) {
    playDiscoveryChip(plotEl);
  }
}
