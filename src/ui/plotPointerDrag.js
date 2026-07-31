import { getCrop } from '../data/crops.js';
import { areAdjacentPlots, isReady } from '../state/gameState.js';
import { findAlchemyResult } from '../data/alchemyRecipes.js';
import { setCropIcon } from './icon.js';
import {
  UPROOT_HOLD_MS,
  UPROOT_MOVE_THRESHOLD_PX,
  showUprootHoldRing,
  clearUprootHoldRing,
  suppressNextClick,
} from './plotUprootHold.js';

export const DRAG_THRESHOLD_PX = UPROOT_MOVE_THRESHOLD_PX;

let session = null;

/**
 * Pointer drag for ready crops (mouse + touch). Replaces HTML5 DnD for plots.
 * `onDrop` receives `{ cropId, fromPlotId, clientX, clientY }`.
 * `onLongPress(plotId)` fires after a still hold (~500ms) instead of drag.
 */
export function wireReadyCropPointerDrag(
  container,
  state,
  now,
  onDrop,
  onLongPress = null,
) {
  for (const el of container.querySelectorAll('[data-plot-id]')) {
    const plotId = Number(el.dataset.plotId);
    const plot = state.plots.find((p) => p.id === plotId);
    const ready = Boolean(plot?.crop && isReady(plot, now));

    el.classList.remove('plot--drag-over', 'plot--dragging');
    el.draggable = false;
    el.ondragstart = null;
    el.ondragend = null;
    el.ondragover = null;
    el.ondragleave = null;
    el.ondrop = null;

    if (!ready) {
      el.onpointerdown = null;
      continue;
    }

    const cropId = plot.crop.cropId;
    el.style.touchAction = 'none';
    el.onpointerdown = (event) => {
      if (event.button != null && event.button !== 0) return;
      beginDrag(
        event,
        el,
        { plotId, cropId },
        container,
        state,
        now,
        onDrop,
        onLongPress,
      );
    };
  }
}

function beginDrag(
  event,
  sourceEl,
  drag,
  container,
  state,
  now,
  onDrop,
  onLongPress,
) {
  if (session) endDrag(false);

  session = {
    drag,
    sourceEl,
    container,
    state,
    now,
    onDrop,
    onLongPress,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    moved: false,
    longPressed: false,
    holdTimer: null,
    ghost: null,
    highlighted: null,
  };

  sourceEl.setPointerCapture(event.pointerId);
  sourceEl.addEventListener('pointermove', onPointerMove);
  sourceEl.addEventListener('pointerup', onPointerUp);
  sourceEl.addEventListener('pointercancel', onPointerCancel);
  event.preventDefault();

  if (onLongPress) {
    showUprootHoldRing(sourceEl);
    session.holdTimer = window.setTimeout(() => {
      if (!session || session.moved || session.longPressed) return;
      session.longPressed = true;
      clearHoldTimer();
      clearUprootHoldRing(session.sourceEl);
    }, UPROOT_HOLD_MS);
  }
}

function clearHoldTimer() {
  if (!session?.holdTimer) return;
  window.clearTimeout(session.holdTimer);
  session.holdTimer = null;
}

function onPointerMove(event) {
  if (!session || event.pointerId !== session.pointerId) return;
  if (session.longPressed) return;
  const dx = event.clientX - session.startX;
  const dy = event.clientY - session.startY;
  if (!session.moved) {
    if (dx * dx + dy * dy < DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) return;
    session.moved = true;
    clearHoldTimer();
    clearUprootHoldRing(session.sourceEl);
    session.sourceEl.classList.add('plot--dragging');
    session.ghost = createGhost(session.drag.cropId, session.sourceEl);
  }
  moveGhost(session.ghost, event.clientX, event.clientY);
  updateHighlight(event.clientX, event.clientY);
}

function onPointerUp(event) {
  if (!session || event.pointerId !== session.pointerId) return;
  const { moved, longPressed, drag, onDrop, onLongPress } = session;
  const x = event.clientX;
  const y = event.clientY;
  const plotId = drag.plotId;
  endDrag(true);
  if (longPressed) {
    suppressNextClick();
    onLongPress?.(plotId);
    return;
  }
  if (moved) {
    suppressNextClick();
    onDrop?.({ cropId: drag.cropId, fromPlotId: drag.plotId, clientX: x, clientY: y });
  }
}

function onPointerCancel(event) {
  if (!session || event.pointerId !== session.pointerId) return;
  endDrag(true);
}

function endDrag(release) {
  if (!session) return;
  const { sourceEl, pointerId, ghost, highlighted, container } = session;
  clearHoldTimer();
  clearUprootHoldRing(sourceEl);
  sourceEl.removeEventListener('pointermove', onPointerMove);
  sourceEl.removeEventListener('pointerup', onPointerUp);
  sourceEl.removeEventListener('pointercancel', onPointerCancel);
  if (release) {
    try {
      sourceEl.releasePointerCapture(pointerId);
    } catch {
      /* already released */
    }
  }
  sourceEl.classList.remove('plot--dragging');
  ghost?.remove();
  clearHighlight(highlighted, container);
  session = null;
}

function createGhost(cropId, sourceEl) {
  const crop = getCrop(cropId);
  const rect = sourceEl.getBoundingClientRect();
  const ghost = document.createElement('div');
  ghost.className = 'plot-drag-ghost';
  ghost.setAttribute('aria-hidden', 'true');
  ghost.style.width = `${rect.width}px`;
  ghost.style.height = `${rect.height}px`;
  const icon = document.createElement('span');
  icon.className = 'plot-drag-ghost__icon';
  if (crop) setCropIcon(icon, crop);
  ghost.appendChild(icon);
  document.body.appendChild(ghost);
  moveGhost(ghost, rect.left + rect.width / 2, rect.top + rect.height / 2);
  return ghost;
}

function moveGhost(ghost, clientX, clientY) {
  if (!ghost) return;
  const w = ghost.offsetWidth;
  const h = ghost.offsetHeight;
  ghost.style.transform = `translate(${clientX - w / 2}px, ${clientY - h / 2}px)`;
}

function updateHighlight(clientX, clientY) {
  if (!session) return;
  const prev = session.highlighted;
  const next = resolveHighlightEl(clientX, clientY, session);
  if (prev === next) return;
  clearHighlight(prev, session.container);
  if (next) next.classList.add(highlightClass(next));
  session.highlighted = next;
}

function clearHighlight(el, container) {
  if (el) {
    el.classList.remove('plot--drag-over', 'shrine--drag-over', 'dragon-temple__slot--drag-over', 'dragon-temple--drag-over');
  }
  if (container) {
    for (const node of container.querySelectorAll('.plot--drag-over')) {
      node.classList.remove('plot--drag-over');
    }
  }
}

function highlightClass(el) {
  if (el.classList.contains('plot')) return 'plot--drag-over';
  if (el.classList.contains('shrine')) return 'shrine--drag-over';
  if (el.classList.contains('dragon-temple__slot')) {
    return 'dragon-temple__slot--drag-over';
  }
  return 'dragon-temple--drag-over';
}

function resolveHighlightEl(clientX, clientY, sess) {
  const target = hitTestDrop(clientX, clientY, sess);
  if (!target) return null;
  if (target.type === 'mix') {
    return sess.container.querySelector(`[data-plot-id="${target.toPlotId}"]`);
  }
  if (target.type === 'shrine') {
    return document.getElementById(`shrine-${target.shrineId}`);
  }
  if (target.type === 'temple-slot') {
    return document.querySelector(
      `.dragon-temple__slot[data-slot-index="${target.slotIndex}"]`,
    );
  }
  if (target.type === 'temple') {
    return document.getElementById('dragon-temple');
  }
  return null;
}

/** Shared hit-test used by highlight + drop. */
export function hitTestDrop(clientX, clientY, sess) {
  const ghost = sess?.ghost;
  if (ghost) ghost.style.visibility = 'hidden';
  const el = document.elementFromPoint(clientX, clientY);
  if (ghost) ghost.style.visibility = '';
  if (!el) return null;

  const fromPlotId = sess.drag.plotId;
  const cropId = sess.drag.cropId;

  const plotEl = el.closest?.('#farm-grid [data-plot-id]');
  if (plotEl) {
    const toPlotId = Number(plotEl.dataset.plotId);
    if (toPlotId === fromPlotId) return null;
    if (!areAdjacentPlots(fromPlotId, toPlotId)) return null;
    const toPlot = sess.state.plots.find((p) => p.id === toPlotId);
    if (!toPlot?.crop || !isReady(toPlot, sess.now)) return null;
    if (!findAlchemyResult(cropId, toPlot.crop.cropId)) return null;
    return { type: 'mix', toPlotId };
  }

  const shrineEl = el.closest?.('.shrine[id^="shrine-"]');
  if (shrineEl && !shrineEl.classList.contains('shrine--maxed')) {
    const shrineId = shrineEl.id.slice('shrine-'.length);
    if (shrineId) return { type: 'shrine', shrineId };
  }

  const slotEl = el.closest?.('.dragon-temple__slot[data-slot-index]');
  if (slotEl) {
    const slotIndex = Number(slotEl.dataset.slotIndex);
    if (Number.isInteger(slotIndex)) {
      return { type: 'temple-slot', slotIndex };
    }
  }

  const templeEl = el.closest?.('#dragon-temple.dragon-temple--active');
  if (templeEl) return { type: 'temple' };

  return null;
}

export function resolvePlotCropDrop(payload, state, now) {
  const sess = {
    drag: { plotId: payload.fromPlotId, cropId: payload.cropId },
    state,
    now,
    ghost: null,
  };
  return hitTestDrop(payload.clientX, payload.clientY, sess);
}
