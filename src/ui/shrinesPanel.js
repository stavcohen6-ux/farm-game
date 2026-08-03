import { getShrine } from '../data/shrines.js';
import {
  canOfferCropToShrine,
  getDragonBonusOfferings,
  isShrineMaxed,
  isTutorialActive,
  isTutorialFoxTarget,
  getTutorialFoxProgress,
} from '../state/gameState.js';
import { setIcon, shrineIconSrc } from './icon.js';

const CROP_DRAG_TYPE = 'text/plain';
const CROP_DRAG_PREFIX = 'farm-crop:';

/** In-flight HTML5 crop drag (getData is unreliable during dragover). */
let activeCropDrag = null;

export { CROP_DRAG_TYPE, CROP_DRAG_PREFIX };

/** @param {{ cropId: string, plotId?: number|null }} opts */
export function encodeCropDrag({ cropId, plotId = null }) {
  if (plotId == null) return `${CROP_DRAG_PREFIX}${cropId}`;
  return `${CROP_DRAG_PREFIX}${cropId}|plot:${plotId}`;
}

/** @returns {{ cropId: string, plotId: number|null } | null} */
export function parseCropDragData(raw) {
  if (!raw || !raw.startsWith(CROP_DRAG_PREFIX)) return null;
  const rest = raw.slice(CROP_DRAG_PREFIX.length);
  const sep = rest.lastIndexOf('|plot:');
  if (sep < 0) {
    return rest ? { cropId: rest, plotId: null } : null;
  }
  const cropId = rest.slice(0, sep);
  const plotId = Number(rest.slice(sep + 6));
  if (!cropId || !Number.isInteger(plotId)) return null;
  return { cropId, plotId };
}

/** @param {{ cropId: string, plotId?: number|null } | null} drag */
export function setActiveCropDrag(drag) {
  activeCropDrag = drag
    ? { cropId: drag.cropId, plotId: drag.plotId ?? null }
    : null;
}

// Renders the four corner shrines and wires click + drop targets for offerings.
// pendingBlessingVisualShrineIds: hide glow until temple sparks land.
export function renderShrines(
  boardEl,
  state,
  onOffer,
  onShrineClick,
  pendingBlessingVisualShrineIds = null,
) {
  for (const shrine of [
    getShrine('frog'),
    getShrine('monkey'),
    getShrine('fox'),
    getShrine('tiger'),
  ]) {
    if (!shrine) continue;
    const container = boardEl.querySelector(`#shrine-${shrine.id}`);
    if (!container) continue;
    renderShrine(
      container,
      shrine,
      state,
      onOffer,
      onShrineClick,
      pendingBlessingVisualShrineIds,
    );
  }
}

function renderShrine(
  container,
  shrine,
  state,
  onOffer,
  onShrineClick,
  pendingBlessingVisualShrineIds,
) {
  const progress = state.shrines[shrine.id];
  const maxed = isShrineMaxed(state, shrine.id);
  const currentTier = progress.tier;
  const nextTierDef = shrine.tiers[currentTier];

  const tutorialFox = getTutorialFoxProgress(state);
  const useTutorialBar = shrine.id === 'fox' && tutorialFox;
  const required = useTutorialBar
    ? tutorialFox.progressRequired
    : maxed
      ? 1
      : nextTierDef.progressRequired;
  const current = useTutorialBar
    ? tutorialFox.progress
    : maxed
      ? 1
      : progress.progress;
  const percent = useTutorialBar
    ? Math.min(100, (current / required) * 100)
    : maxed
      ? 100
      : Math.min(100, (current / required) * 100);

  container.className = `shrine shrine--${shrine.corner} shrine--${shrine.id}`;
  if (maxed && !useTutorialBar) {
    container.classList.add('shrine--maxed');
  }
  if (isTutorialActive(state) && shrine.id !== 'fox') {
    container.classList.add('shrine--tutorial-inactive');
  }
  if (isTutorialFoxTarget(state) && shrine.id === 'fox') {
    container.classList.add('shrine--tutorial-target');
  }
  const showBlessingGlow =
    !isTutorialActive(state) &&
    getDragonBonusOfferings(state, shrine.id) > 0 &&
    !pendingBlessingVisualShrineIds?.has(shrine.id);
  if (showBlessingGlow) {
    container.classList.add('shrine--dragon-blessed');
  }

  let figure = container.querySelector(':scope > .shrine__figure');
  let icon = figure?.querySelector(':scope > .shrine__icon');
  let fill = container.querySelector(':scope > .shrine__plaque .shrine__progress-fill');

  if (!figure || !icon || !fill) {
    container.replaceChildren();

    figure = document.createElement('div');
    figure.className = 'shrine__figure';

    icon = document.createElement('div');
    icon.className = 'shrine__icon';
    figure.appendChild(icon);
    container.appendChild(figure);

    const plaque = document.createElement('div');
    plaque.className = 'shrine__plaque';

    const track = document.createElement('div');
    track.className = 'shrine__progress-track';
    fill = document.createElement('div');
    fill.className = 'shrine__progress-fill';
    track.appendChild(fill);
    plaque.appendChild(track);

    container.appendChild(plaque);
  }

  setIcon(icon, {
    src: shrineIconSrc(shrine.id),
    emoji: shrine.icon,
    alt: shrine.name,
    imgClass: 'game-icon game-icon--shrine-object',
  });
  fill.style.height = `${percent}%`;

  let suppressClick = false;
  container.onclick = () => {
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    onShrineClick(shrine.id);
  };

  if (maxed && !useTutorialBar) {
    container.ondragover = null;
    container.ondrop = null;
    container.ondragleave = null;
    return;
  }

  container.ondragover = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    const cropId = activeCropDrag?.cropId;
    if (
      cropId &&
      canOfferCropToShrine(state, shrine.id, cropId)
    ) {
      container.classList.add('shrine--drag-over');
    } else {
      container.classList.remove('shrine--drag-over');
    }
  };

  container.ondragleave = () => {
    container.classList.remove('shrine--drag-over');
  };

  container.ondrop = (event) => {
    event.preventDefault();
    container.classList.remove('shrine--drag-over');
    const drag = parseCropDragData(event.dataTransfer.getData(CROP_DRAG_TYPE));
    setActiveCropDrag(null);
    if (!drag) return;
    suppressClick = true;
    onOffer(shrine.id, drag.cropId, drag.plotId);
  };
}
