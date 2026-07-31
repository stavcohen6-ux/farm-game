import { isReady, isPlotNapped } from '../state/gameState.js';

export const UPROOT_HOLD_MS = 500;
export const UPROOT_MOVE_THRESHOLD_PX = 8;

/**
 * Long-press on growing (non-ready) occupied plots. Ready plots use the
 * hold path inside plotPointerDrag so drag and uproot share one gesture.
 */
export function wireGrowingPlotUprootHold(container, state, now, onUprootHold) {
  for (const el of container.querySelectorAll('[data-plot-id]')) {
    const plotId = Number(el.dataset.plotId);
    const plot = state.plots.find((p) => p.id === plotId);
    const ready = Boolean(plot?.crop && isReady(plot, now));
    const canHold =
      Boolean(onUprootHold) &&
      Boolean(plot?.crop) &&
      !plot.locked &&
      !ready &&
      !isPlotNapped(state, plotId);

    if (!canHold) {
      if (!ready) {
        el.onpointerdown = null;
        el.style.touchAction = '';
      }
      continue;
    }

    el.style.touchAction = 'none';
    el.onpointerdown = (event) => {
      if (event.button != null && event.button !== 0) return;
      beginGrowingHold(event, el, plotId, onUprootHold);
    };
  }
}

export function showUprootHoldRing(el) {
  if (!el) return;
  el.classList.add('plot--uproot-hold');
  if (el.querySelector('.plot__uproot-ring')) return;
  const ring = document.createElement('span');
  ring.className = 'plot__uproot-ring';
  ring.setAttribute('aria-hidden', 'true');
  el.appendChild(ring);
}

export function clearUprootHoldRing(el) {
  if (!el) return;
  el.classList.remove('plot--uproot-hold');
  el.querySelector('.plot__uproot-ring')?.remove();
}

export function suppressNextClick() {
  const swallow = (event) => {
    event.preventDefault();
    event.stopPropagation();
    document.removeEventListener('click', swallow, true);
  };
  document.addEventListener('click', swallow, true);
  window.setTimeout(() => {
    document.removeEventListener('click', swallow, true);
  }, 400);
}

function beginGrowingHold(event, el, plotId, onUprootHold) {
  const pointerId = event.pointerId;
  const startX = event.clientX;
  const startY = event.clientY;
  let moved = false;
  let fired = false;

  showUprootHoldRing(el);
  el.setPointerCapture(pointerId);

  const timer = window.setTimeout(() => {
    if (moved || fired) return;
    fired = true;
    clearUprootHoldRing(el);
  }, UPROOT_HOLD_MS);

  function onMove(e) {
    if (e.pointerId !== pointerId || moved || fired) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (dx * dx + dy * dy < UPROOT_MOVE_THRESHOLD_PX * UPROOT_MOVE_THRESHOLD_PX) {
      return;
    }
    moved = true;
    teardown();
  }

  function onUp(e) {
    if (e.pointerId !== pointerId) return;
    const shouldUproot = fired && !moved;
    teardown();
    if (shouldUproot) {
      suppressNextClick();
      onUprootHold?.(plotId);
    }
  }

  function teardown() {
    window.clearTimeout(timer);
    clearUprootHoldRing(el);
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerup', onUp);
    el.removeEventListener('pointercancel', onUp);
    try {
      el.releasePointerCapture(pointerId);
    } catch {
      /* already released */
    }
  }

  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerup', onUp);
  el.addEventListener('pointercancel', onUp);
}
