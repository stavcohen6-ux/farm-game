// Renders crop/UI icons as images when an asset path exists, else emoji text.
// Keeps emoji as fallback so missing assets never break the UI.

const ICON_BASE = 'assets/icons';

// Soft Storybook Cutout PNGs (fox B).
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

/** Soft B composite (How to Play / single-image consumers). */
export function shrineIconSrc(shrineId) {
  if (!shrineId) return null;
  return `${ICON_BASE}/shrine_${shrineId}.png`;
}

export function shrineFigureSrc(shrineId) {
  if (!shrineId) return null;
  return `${ICON_BASE}/shrine_${shrineId}_figure.png`;
}

export function shrinePedestalSrc(shrineId) {
  if (!shrineId) return null;
  return `${ICON_BASE}/shrine_${shrineId}_pedestal.png`;
}

/** Farm-board layered shrine URLs (for opening-screen preload). */
export function listShrineLayerSrcs() {
  const ids = ['frog', 'monkey', 'fox', 'tiger'];
  return ids.flatMap((id) => [
    shrinePedestalSrc(id),
    shrineFigureSrc(id),
    shrineIconSrc(id),
  ]);
}

// Compact Discovery Log shrine-value faces (emoji-sized).
export function logShrineIconSrc(shrineId) {
  if (!shrineId) return null;
  return `${ICON_BASE}/log_${shrineId}.png`;
}

export const UI_ICONS = {
  discoveryLog: `${ICON_BASE}/discovery_log.png`,
  // Query bust after Soft Storybook B temple promote.
  dragonRest: `${ICON_BASE}/dragon_temple_rest.png?v=softb`,
  dragonAwake: `${ICON_BASE}/dragon_temple_awake.png?v=softb`,
  dragonFaceRest: `${ICON_BASE}/log_dragon_rest.png`,
  dragonFaceAwake: `${ICON_BASE}/log_dragon_awake.png?v=softb`,
  fire: `${ICON_BASE}/fire.png`,
  mortar: `${ICON_BASE}/mortar.png`,
  harvest: `${ICON_BASE}/harvest.png`,
  spark: `${ICON_BASE}/spark.png`,
  lock: `${ICON_BASE}/lock.svg`,
  wilt: `${ICON_BASE}/wilt.svg`,
  waterDrop: `${ICON_BASE}/water_drop.png`,
  butterfly: `${ICON_BASE}/butterfly.png`,
  firefly: `${ICON_BASE}/firefly.png`,
  tanukiSleep: `${ICON_BASE}/tanuki_sleep.png`,
};

/**
 * Stack Soft B pedestal + figure inside a shrine icon container.
 * Reuses existing layer imgs when srcs are unchanged.
 * @param {HTMLElement} container
 * @param {{ shrineId: string, name?: string, emoji?: string }} opts
 */
export function setLayeredShrineIcon(container, { shrineId, name = '', emoji = '' } = {}) {
  const pedestalSrc = shrinePedestalSrc(shrineId);
  const figureSrc = shrineFigureSrc(shrineId);
  if (!pedestalSrc || !figureSrc) {
    setIcon(container, {
      src: shrineIconSrc(shrineId),
      emoji,
      alt: name,
      imgClass: 'game-icon game-icon--shrine-object',
    });
    return;
  }

  const existing = container.querySelectorAll(':scope > img.shrine__layer');
  if (
    existing.length === 2 &&
    existing[0].getAttribute('src') === pedestalSrc &&
    existing[1].getAttribute('src') === figureSrc
  ) {
    existing[0].alt = '';
    existing[1].alt = name;
    return;
  }

  container.replaceChildren();

  const pedestal = document.createElement('img');
  pedestal.src = pedestalSrc;
  pedestal.alt = '';
  pedestal.draggable = false;
  pedestal.className = 'shrine__layer shrine__layer--pedestal';
  pedestal.setAttribute('aria-hidden', 'true');

  const figure = document.createElement('img');
  figure.src = figureSrc;
  figure.alt = name;
  figure.draggable = false;
  figure.className = 'shrine__layer shrine__layer--figure';

  container.append(pedestal, figure);
}

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
