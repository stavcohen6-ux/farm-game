// Renders crop/UI icons as images when an asset path exists, else emoji text.
// Keeps emoji as fallback so missing assets never break the UI.

const ICON_BASE = 'assets/icons';

// Richer illustrated PNGs (Cozy Lofi Grove / Fresh Moss).
const PNG_CROPS = new Set([
  'wheat',
  'turnip',
  'blueberry',
  'moonflower',
  'golden_pumpkin',
  'sunfruit',
  'root_loaf',
  'forest_bread',
  'moonlit_loaf',
  'golden_loaf',
  'sunbread',
  'wildroot',
  'moonroot',
  'golden_root',
  'sunroot',
  'moonberry',
  'enchanted_jam',
  'sunberry',
  'golden_bloom',
  'solar_bloom',
  'solar_gourd',
]);

export function cropIconSrc(cropId) {
  if (!cropId) return null;
  const ext = PNG_CROPS.has(cropId) ? 'png' : 'svg';
  return `${ICON_BASE}/${cropId}.${ext}`;
}

/** All illustrated crop icon URLs (for opening-screen preload). */
export function listCropIconSrcs() {
  return [...PNG_CROPS].map((id) => cropIconSrc(id)).filter(Boolean);
}

export function shrineIconSrc(shrineId) {
  if (!shrineId) return null;
  return `${ICON_BASE}/shrine_${shrineId}.png`;
}

// Compact Discovery Log shrine-value faces (emoji-sized).
export function logShrineIconSrc(shrineId) {
  if (!shrineId) return null;
  return `${ICON_BASE}/log_${shrineId}.png`;
}

export const UI_ICONS = {
  discoveryLog: `${ICON_BASE}/discovery_log.png`,
  // Query bust so rest/awake roof cutouts aren't stuck behind old full-temple caches.
  dragonRest: `${ICON_BASE}/dragon_temple_rest.png?v=roof2`,
  dragonAwake: `${ICON_BASE}/dragon_temple_awake.png?v=roof2`,
  fire: `${ICON_BASE}/fire.png`,
  mortar: `${ICON_BASE}/mortar.png`,
  harvest: `${ICON_BASE}/harvest.png`,
  spark: `${ICON_BASE}/spark.png`,
  lock: `${ICON_BASE}/lock.svg`,
  wilt: `${ICON_BASE}/wilt.svg`,
  waterDrop: `${ICON_BASE}/water_drop.png`,
  butterfly: `${ICON_BASE}/butterfly.png`,
  firefly: `${ICON_BASE}/firefly.png`,
  // Tanuki nap poses (emoji fallback until painted PNGs land)
  tanukiSleep: `${ICON_BASE}/tanuki_sleep.png`,
};

/**
 * Fill a container with an icon image (preferred) or emoji fallback.
 * Reuses an existing <img> when `src` is unchanged so large PNGs are not
 * re-decoded on every UI refresh.
 * @param {HTMLElement} container
 * @param {{ src?: string|null, emoji?: string, alt?: string, imgClass?: string }} opts
 */
export function setIcon(container, { src = null, emoji = '', alt = '', imgClass = 'game-icon' } = {}) {
  if (src) {
    const existing = container.firstElementChild;
    if (
      existing?.tagName === 'IMG' &&
      existing.getAttribute('src') === src &&
      container.childElementCount === 1
    ) {
      existing.alt = alt;
      existing.draggable = false;
      existing.className = imgClass;
      return;
    }
    container.replaceChildren();
    const img = document.createElement('img');
    img.src = src;
    img.alt = alt;
    img.draggable = false;
    img.className = imgClass;
    container.appendChild(img);
    return;
  }
  container.replaceChildren();
  if (emoji) {
    container.textContent = emoji;
  }
}

/** Convenience: set crop icon from a crop def (or id + emoji). */
export function setCropIcon(container, crop, imgClass = 'game-icon') {
  if (!crop) {
    container.replaceChildren();
    return;
  }
  setIcon(container, {
    src: cropIconSrc(crop.id),
    emoji: crop.icon,
    alt: crop.name ?? '',
    imgClass,
  });
}
