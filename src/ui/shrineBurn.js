import { setIcon, UI_ICONS } from './icon.js';

const FLAME_COUNT = 12;
const FLAME_MS = 2480;
const STAGGER_MS = 200;
const FLAME_SIZE_PX = 44;
const RISE_EXTRA_PX = 28;
const JITTER_PX = 14;

// Rising fire overlays over a shrine icon (shrine art stays still). Used when
// the Dragon burns a shrine on temple lose.
export function playShrineBurn({ shrineEl, onComplete }) {
  const iconEl = shrineEl?.querySelector('.shrine__icon');
  if (!iconEl) {
    onComplete?.();
    return;
  }

  const rect = iconEl.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.bottom - FLAME_SIZE_PX / 2;
  const risePx = rect.height + RISE_EXTRA_PX;
  const half = FLAME_SIZE_PX / 2;

  let remaining = FLAME_COUNT;

  for (let i = 0; i < FLAME_COUNT; i++) {
    window.setTimeout(() => {
      const flame = document.createElement('div');
      flame.className = 'shrine-burn-flame';
      flame.setAttribute('aria-hidden', 'true');
      setIcon(flame, {
        src: UI_ICONS.fire,
        emoji: '🔥',
        imgClass: 'game-icon',
      });
      flame.style.width = `${FLAME_SIZE_PX}px`;
      flame.style.height = `${FLAME_SIZE_PX}px`;
      flame.style.left = `${originX - half}px`;
      flame.style.top = `${originY - half}px`;
      document.body.appendChild(flame);

      const jitter =
        (i - (FLAME_COUNT - 1) / 2) * (JITTER_PX / 2) +
        (Math.random() * 2 - 1) * 4;

      const flight = flame.animate(
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
        { duration: FLAME_MS, easing: 'ease-out', fill: 'forwards' },
      );

      flight.onfinish = () => {
        flame.remove();
        remaining -= 1;
        if (remaining <= 0) onComplete?.();
      };
    }, i * STAGGER_MS);
  }
}
