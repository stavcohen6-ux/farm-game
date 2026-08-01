import { setIcon, UI_ICONS } from './icon.js';

const SPARK_COUNT = 12;
const SPARK_MS = 2480;
const STAGGER_MS = 200;
const SPARK_SIZE_PX = 20;
const RISE_EXTRA_PX = 28;
const JITTER_PX = 14;

// Rising sparks over a shrine icon (shrine art stays still). Plays once per
// call even if multiple tiers were gained in one grant.
export function playShrineTierUp({ shrineEl, onComplete }) {
  const iconEl = shrineEl?.querySelector('.shrine__icon');
  if (!iconEl) {
    onComplete?.();
    return;
  }

  const rect = iconEl.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.bottom - SPARK_SIZE_PX / 2;
  const risePx = rect.height + RISE_EXTRA_PX;
  const half = SPARK_SIZE_PX / 2;

  let remaining = SPARK_COUNT;

  for (let i = 0; i < SPARK_COUNT; i++) {
    window.setTimeout(() => {
      const spark = document.createElement('div');
      spark.className = 'shrine-tier-spark';
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

      const jitter =
        (i - (SPARK_COUNT - 1) / 2) * (JITTER_PX / 2) +
        (Math.random() * 2 - 1) * 4;

      const flight = spark.animate(
        [
          { transform: 'translate(0, 0) scale(0.85)', opacity: 0.95 },
          {
            transform: `translate(${jitter * 0.4}px, ${-risePx * 0.45}px) scale(1)`,
            opacity: 1,
            offset: 0.35,
          },
          {
            transform: `translate(${jitter}px, ${-risePx}px) scale(0.55)`,
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
    }, i * STAGGER_MS);
  }
}
