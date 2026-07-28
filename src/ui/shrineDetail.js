import { getShrine } from '../data/shrines.js';
import { getPreferredPlantables } from '../data/crops.js';
import { isShrineMaxed } from '../state/gameState.js';
import { setCropIcon, setIcon, shrineIconSrc } from './icon.js';

// Shows a centered modal listing every tier for a shrine: name, effect,
// and progress (Complete / live / Locked). Click outside to close.
export function openShrineDetail(state, shrineId) {
  const shrine = getShrine(shrineId);
  const progress = state.shrines?.[shrineId];
  if (!shrine || !progress) return;

  const maxed = isShrineMaxed(state, shrineId);

  const overlay = document.createElement('div');
  overlay.className = 'shrine-detail-overlay';

  const modal = document.createElement('div');
  modal.className = 'shrine-detail';

  const title = document.createElement('h2');
  title.className = 'shrine-detail__title';
  const titleIcon = document.createElement('span');
  titleIcon.className = 'shrine-detail__title-icon';
  setIcon(titleIcon, {
    src: shrineIconSrc(shrine.id),
    emoji: shrine.icon,
    alt: '',
    imgClass: 'game-icon game-icon--shrine-detail',
  });
  title.appendChild(titleIcon);
  title.append(` ${shrine.name} — ${shrine.theme}`);
  modal.appendChild(title);

  const preferred = getPreferredPlantables(shrineId);
  if (preferred.length > 0) {
    const prefers = document.createElement('p');
    prefers.className = 'shrine-detail__prefers';
    prefers.append('Prefers: ');
    preferred.forEach((crop, index) => {
      if (index > 0) prefers.append(' ');
      const icon = document.createElement('span');
      icon.className = 'shrine-detail__prefers-icon';
      setCropIcon(icon, crop, 'game-icon game-icon--inline');
      prefers.appendChild(icon);
    });
    modal.appendChild(prefers);
  }

  const list = document.createElement('div');
  list.className = 'shrine-detail__list';

  shrine.tiers.forEach((tier, index) => {
    list.appendChild(renderTierRow(tier, index, progress, maxed));
  });

  modal.appendChild(list);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });

  function close() {
    overlay.remove();
  }
}

function renderTierRow(tier, index, progress, maxed) {
  let status;
  if (index < progress.tier) {
    status = 'completed';
  } else if (index === progress.tier && !maxed) {
    status = 'active';
  } else {
    status = 'locked';
  }

  const row = document.createElement('div');
  row.className = `shrine-detail__tier shrine-detail__tier--${status}`;

  const name = document.createElement('div');
  name.className = 'shrine-detail__tier-name';
  name.textContent = tier.name;
  row.appendChild(name);

  const effect = document.createElement('div');
  effect.className = 'shrine-detail__tier-effect';
  effect.textContent = tier.tooltip;
  row.appendChild(effect);

  const track = document.createElement('div');
  track.className = 'shrine-detail__progress-track';
  const fill = document.createElement('div');
  fill.className = 'shrine-detail__progress-fill';

  let percent = 0;
  let labelText = 'Locked';
  if (status === 'completed') {
    percent = 100;
    labelText = 'Complete';
  } else if (status === 'active') {
    percent = Math.min(100, (progress.progress / tier.progressRequired) * 100);
    labelText = `${progress.progress} / ${tier.progressRequired}`;
  }

  fill.style.width = `${percent}%`;
  track.appendChild(fill);
  row.appendChild(track);

  const label = document.createElement('div');
  label.className = 'shrine-detail__progress-label';
  label.textContent = labelText;
  row.appendChild(label);

  return row;
}
