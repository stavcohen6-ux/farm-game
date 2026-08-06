import { setIcon, UI_ICONS, logShrineIconSrc } from './icon.js';

const SPARK_COUNT = 12;
const SPARK_MS = 2480;
const STAGGER_MS = 200;
const SPARK_SIZE_PX = 20;
const RISE_EXTRA_PX = 28;
const JITTER_PX = 14;

// Offering chip is 780ms / 22px rise; Tier up chip is 2× slower.
const TIER_CHIP_MS = 1560;
const TIER_CHIP_RISE_PX = 44;

// Rising sparks over a shrine icon (shrine art stays still). Plays once per
// call even if multiple tiers were gained in one grant.
// Optional honey/parchment "Tier up!" chip (same look as offering +N).
export function playShrineTierUp({ shrineEl, showTierChip = true, onComplete }) {
  const iconEl = shrineEl?.querySelector('.shrine__icon');
  if (!iconEl) {
    onComplete?.();
    return;
  }

  if (showTierChip) {
    playTierUpChip(shrineEl, iconEl);
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

function playTierUpChip(shrineEl, iconEl) {
  const shrineId = shrineEl?.id?.replace(/^shrine-/, '') ?? '';
  const iconRect = iconEl.getBoundingClientRect();
  if (iconRect.width <= 0 || iconRect.height <= 0) return;

  const x = iconRect.left + iconRect.width / 2;
  const y = iconRect.top - 4;

  const el = document.createElement('div');
  el.className = 'offering-progress-chip';
  el.setAttribute('aria-hidden', 'true');

  const faceSrc = logShrineIconSrc(shrineId);
  if (faceSrc) {
    const face = document.createElement('img');
    face.className = 'offering-progress-chip__face';
    face.src = faceSrc;
    face.alt = '';
    el.appendChild(face);
  }

  const amt = document.createElement('span');
  amt.className = 'offering-progress-chip__amt';
  amt.textContent = 'Tier up!';
  el.appendChild(amt);

  document.body.appendChild(el);

  const flight = el.animate(
    [
      {
        transform: `translate(${x}px, ${y}px) translate(-50%, -100%) scale(0.88)`,
        opacity: 0,
      },
      {
        transform: `translate(${x}px, ${y - TIER_CHIP_RISE_PX * 0.4}px) translate(-50%, -100%) scale(1.04)`,
        opacity: 1,
        offset: 0.22,
      },
      {
        transform: `translate(${x}px, ${y - TIER_CHIP_RISE_PX}px) translate(-50%, -100%) scale(1)`,
        opacity: 0,
      },
    ],
    { duration: TIER_CHIP_MS, easing: 'ease-out', fill: 'forwards' },
  );
  flight.onfinish = () => el.remove();
}
