import { CROPS } from '../data/crops.js';
import {
  isCropUnlocked,
  getFrogGrowthMs,
  isTutorialPickerCropUnlocked,
} from '../state/gameState.js';
import { setCropIcon, setIcon, UI_ICONS } from './icon.js';

const WHEEL_SIZE = 180;
const CX = 90;
const CY = 90;
const R_OUT = 88;
const R_IN = 34;
const R_ICON = (R_OUT + R_IN) / 2;
const NS = 'http://www.w3.org/2000/svg';

// Thin SVG donut picker: large icons in each wedge, growth time in the hub.
export function openCropPicker(state, plotEl, onSelect) {
  const overlay = document.createElement('div');
  overlay.className = 'crop-picker-overlay';

  const wheel = document.createElement('div');
  wheel.className = 'crop-picker';
  wheel.setAttribute('role', 'menu');
  wheel.setAttribute('aria-label', 'Choose a crop to plant');

  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('class', 'crop-picker__disc');
  svg.setAttribute('viewBox', `0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`);
  svg.setAttribute('width', String(WHEEL_SIZE));
  svg.setAttribute('height', String(WHEEL_SIZE));
  svg.setAttribute('aria-hidden', 'true');
  wheel.appendChild(svg);

  const hub = document.createElement('div');
  hub.className = 'crop-picker__hub';
  const hubTime = document.createElement('span');
  hubTime.className = 'crop-picker__hub-time';
  hub.appendChild(hubTime);

  const plantables = CROPS.filter((c) => c.plantable);
  const sliceAngle = 360 / plantables.length;

  for (let i = 0; i < plantables.length; i++) {
    const crop = plantables[i];
    const researchUnlocked = isCropUnlocked(state, crop);
    const unlocked = isTutorialPickerCropUnlocked(
      state,
      crop,
      researchUnlocked,
    );
    const timeLabel = unlocked
      ? formatDuration(getFrogGrowthMs(crop, state))
      : null;

    const startDeg = -90 + i * sliceAngle;
    const endDeg = startDeg + sliceAngle;
    const midDeg = startDeg + sliceAngle / 2;

    const path = document.createElementNS(NS, 'path');
    path.setAttribute('d', donutSlicePath(CX, CY, R_OUT, R_IN, startDeg, endDeg));
    path.setAttribute('class', 'crop-picker__slice');
    path.setAttribute(
      'aria-label',
      unlocked ? `${crop.name}, ${timeLabel}` : `${crop.name}, locked`,
    );

    if (unlocked) {
      path.classList.add('crop-picker__slice--unlocked');
      path.setAttribute('role', 'menuitem');
      path.setAttribute('tabindex', '0');

      const showPreview = () => {
        hubTime.textContent = timeLabel;
        path.classList.add('crop-picker__slice--hover');
      };
      const clearPreview = () => {
        hubTime.textContent = '';
        path.classList.remove('crop-picker__slice--hover');
      };

      path.addEventListener('pointerenter', showPreview);
      path.addEventListener('focus', showPreview);
      path.addEventListener('pointerleave', clearPreview);
      path.addEventListener('blur', clearPreview);
      path.addEventListener('click', (event) => {
        event.stopPropagation();
        close();
        onSelect(crop.id);
      });
    } else {
      path.classList.add('crop-picker__slice--locked');
    }

    svg.appendChild(path);

    const iconPos = polar(CX, CY, R_ICON, midDeg);
    const icon = document.createElement('span');
    icon.className = 'crop-picker__icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.style.left = `${iconPos.x}px`;
    icon.style.top = `${iconPos.y}px`;
    if (!unlocked) {
      icon.classList.add('crop-picker__icon--locked');
      setIcon(icon, {
        src: UI_ICONS.lock,
        emoji: '🔒',
        imgClass: 'game-icon',
      });
    } else {
      setCropIcon(icon, crop);
    }
    wheel.appendChild(icon);
  }

  wheel.appendChild(hub);
  overlay.appendChild(wheel);
  document.body.appendChild(overlay);
  positionWheel(wheel, plotEl);

  overlay.addEventListener('click', (event) => {
    if (event.target.closest('.crop-picker__slice--unlocked')) return;
    close();
  });

  function close() {
    overlay.remove();
  }
}

function polar(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function donutSlicePath(cx, cy, rOut, rIn, startDeg, endDeg) {
  const sweep = endDeg - startDeg;
  const large = sweep > 180 ? 1 : 0;
  const outerStart = polar(cx, cy, rOut, startDeg);
  const outerEnd = polar(cx, cy, rOut, endDeg);
  const innerEnd = polar(cx, cy, rIn, endDeg);
  const innerStart = polar(cx, cy, rIn, startDeg);

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${rOut} ${rOut} 0 ${large} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${rIn} ${rIn} 0 ${large} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
}

function positionWheel(wheel, plotEl) {
  const rect = plotEl.getBoundingClientRect();
  const half = WHEEL_SIZE / 2;
  let left = rect.left + rect.width / 2 - half;
  let top = rect.top + rect.height / 2 - half;

  const margin = 8;
  left = Math.min(
    Math.max(margin, left),
    window.innerWidth - WHEEL_SIZE - margin,
  );
  top = Math.min(
    Math.max(margin, top),
    window.innerHeight - WHEEL_SIZE - margin,
  );

  wheel.style.left = `${left}px`;
  wheel.style.top = `${top}px`;
}

function formatDuration(ms) {
  const seconds = ms / 1000;
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  return `${hours}h`;
}
