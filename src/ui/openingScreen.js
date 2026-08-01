// Opening / title screen: forest journey art, preload, soft Play gate.
import { shrineIconSrc, UI_ICONS } from './icon.js';

export const OPENING_SCENE_SRC = 'assets/opening/opening_journey.png';

const MIN_READY_MS = 450;
const PRELOAD_TIMEOUT_MS = 10000;
const FADE_MS = 480;

const CRITICAL_ASSETS = [
  OPENING_SCENE_SRC,
  'assets/opening/opening_title.png',
  'assets/opening/opening_play.png',
  'assets/scene/grove_clearing.png',
  'assets/scene/game_text_plank.png',
  'assets/icons/farm_frame.png',
  'assets/icons/plot_soil.png',
  'assets/icons/plot_soil_dry.png',
  'assets/icons/plot_locked.png',
  'assets/icons/plot_soil_flowered.png',
  UI_ICONS.dragonRest,
  UI_ICONS.dragonAwake,
  UI_ICONS.discoveryLog,
  shrineIconSrc('frog'),
  shrineIconSrc('monkey'),
  shrineIconSrc('fox'),
  shrineIconSrc('tiger'),
];

function preloadImage(src) {
  return new Promise((resolve) => {
    if (!src) {
      resolve();
      return;
    }
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

function preloadAll(srcs) {
  return Promise.all(srcs.map(preloadImage));
}

/**
 * Mount opening-screen behavior.
 * @param {{ onEnter: () => void }} opts — called when Play reveals the main game
 * @returns {{ show: () => void }}
 */
export function installOpeningScreen({ onEnter }) {
  const root = document.getElementById('opening-screen');
  const playBtn = document.getElementById('opening-play');
  const appEl = document.getElementById('app');
  const sceneImg = root?.querySelector('.opening-screen__scene-img');

  if (!root || !playBtn || !appEl) {
    onEnter();
    return { show() {} };
  }

  if (sceneImg && !sceneImg.getAttribute('src')) {
    sceneImg.src = OPENING_SCENE_SRC;
  }

  let ready = false;
  let entering = false;
  let preloadGen = 0;

  function setPlayReady(isReady) {
    ready = isReady;
    playBtn.disabled = !isReady;
    playBtn.classList.toggle('opening-screen__play--ready', isReady);
    playBtn.setAttribute('aria-busy', isReady ? 'false' : 'true');
  }

  function startPreload() {
    const gen = ++preloadGen;
    setPlayReady(false);
    const startedAt = Date.now();

    const preload = Promise.race([
      preloadAll(CRITICAL_ASSETS),
      new Promise((resolve) => setTimeout(resolve, PRELOAD_TIMEOUT_MS)),
    ]);

    preload.then(() => {
      if (gen !== preloadGen) return;
      const wait = Math.max(0, MIN_READY_MS - (Date.now() - startedAt));
      setTimeout(() => {
        if (gen !== preloadGen) return;
        setPlayReady(true);
      }, wait);
    });
  }

  function dismiss() {
    if (!ready || entering) return;
    entering = true;
    setPlayReady(false);
    root.classList.add('opening-screen--leaving');
    appEl.classList.remove('app--gated');

    window.setTimeout(() => {
      root.hidden = true;
      root.classList.remove('opening-screen--leaving');
      root.setAttribute('aria-hidden', 'true');
      entering = false;
      onEnter();
    }, FADE_MS);
  }

  function show() {
    entering = false;
    root.hidden = false;
    root.classList.remove('opening-screen--leaving');
    root.setAttribute('aria-hidden', 'false');
    appEl.classList.add('app--gated');
    startPreload();
  }

  playBtn.addEventListener('click', dismiss);

  // Cold boot: screen is already in the DOM; start preload.
  show();

  return { show };
}
