// Opening / title screen: forest journey art, preload, soft Play gate.
import { startBackgroundMusic } from '../audio/backgroundMusic.js';
import { preloadSfx, unlockSfx } from '../audio/sfx.js';
import {
  listCropIconSrcs,
  shrineIconSrc,
  UI_ICONS,
} from './icon.js';

export const OPENING_SCENE_SRC = 'assets/opening/opening_journey.png';

const MIN_READY_MS = 300;
const PRELOAD_TIMEOUT_MS = 20000;
const FADE_MS = 480;

// Must finish (load + decode) before Play enables. Opening journey/title/play
// art is already in the opening DOM and must not block this gate.
const GAME_CRITICAL_ASSETS = [
  'assets/scene/grove_clearing.png',
  'assets/scene/game_text_plank.png',
  'assets/icons/farm_frame.png',
  'assets/icons/plot_soil.png',
  'assets/icons/plot_soil_dry.png',
  'assets/icons/plot_locked.png',
  'assets/icons/plot_soil_flowered.png',
  'assets/icons/plot_soil_vined.png',
  UI_ICONS.dragonRest,
  UI_ICONS.dragonAwake,
  UI_ICONS.dragonFaceRest,
  UI_ICONS.dragonFaceAwake,
  UI_ICONS.discoveryLog,
  UI_ICONS.fire,
  UI_ICONS.spark,
  UI_ICONS.lock,
  UI_ICONS.wilt,
  UI_ICONS.waterDrop,
  UI_ICONS.butterfly,
  UI_ICONS.tanukiSleep,
  shrineIconSrc('frog'),
  shrineIconSrc('monkey'),
  shrineIconSrc('fox'),
  shrineIconSrc('tiger'),
  ...listCropIconSrcs(),
];

function preloadImage(src) {
  return new Promise((resolve) => {
    if (!src) {
      resolve();
      return;
    }
    const img = new Image();
    const finish = () => resolve();
    img.onerror = finish;
    img.onload = () => {
      if (typeof img.decode === 'function') {
        img.decode().then(finish, finish);
      } else {
        finish();
      }
    };
    img.src = src;
    // Cached images may already be complete before handlers attach.
    if (img.complete && img.naturalWidth > 0) {
      img.onload = null;
      if (typeof img.decode === 'function') {
        img.decode().then(finish, finish);
      } else {
        finish();
      }
    }
  });
}

function preloadAll(srcs) {
  return Promise.all(srcs.map(preloadImage));
}

/**
 * Mount opening-screen behavior.
 * @param {{ onEnter: () => void, onWarm?: () => void }} opts
 *   onWarm — first grove render while still gated (before Play enables)
 *   onEnter — after Play reveals the main game
 * @returns {{ show: () => void }}
 */
export function installOpeningScreen({ onEnter, onWarm }) {
  const root = document.getElementById('opening-screen');
  const playBtn = document.getElementById('opening-play');
  const appEl = document.getElementById('app');
  const sceneImg = root?.querySelector('.opening-screen__scene-img');

  if (!root || !playBtn || !appEl) {
    if (typeof onWarm === 'function') onWarm();
    onEnter();
    return { show() {} };
  }

  if (sceneImg && !sceneImg.getAttribute('src')) {
    sceneImg.src = OPENING_SCENE_SRC;
  }

  let ready = false;
  let entering = false;
  let preloadGen = 0;
  let warmed = false;
  let musicGestureArmed = false;

  function setPlayReady(isReady) {
    ready = isReady;
    playBtn.disabled = !isReady;
    playBtn.classList.toggle('opening-screen__play--ready', isReady);
    playBtn.setAttribute('aria-busy', isReady ? 'false' : 'true');
  }

  function warmGrove() {
    if (warmed) return;
    warmed = true;
    if (typeof onWarm === 'function') onWarm();
  }

  function startPreload() {
    const gen = ++preloadGen;
    setPlayReady(false);
    const startedAt = Date.now();
    preloadSfx();

    const preload = Promise.race([
      preloadAll(GAME_CRITICAL_ASSETS),
      new Promise((resolve) => setTimeout(resolve, PRELOAD_TIMEOUT_MS)),
    ]);

    preload.then(() => {
      if (gen !== preloadGen) return;
      warmGrove();
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

  function armMusicGestureFallback() {
    if (musicGestureArmed) return;
    musicGestureArmed = true;
    const retry = () => {
      root.removeEventListener('pointerdown', retry);
      musicGestureArmed = false;
      unlockSfx();
      startBackgroundMusic();
    };
    root.addEventListener('pointerdown', retry);
  }

  function tryStartMusic() {
    unlockSfx();
    startBackgroundMusic().then((ok) => {
      if (!ok) armMusicGestureFallback();
    });
  }

  function show() {
    entering = false;
    warmed = false;
    root.hidden = false;
    root.classList.remove('opening-screen--leaving');
    root.setAttribute('aria-hidden', 'false');
    appEl.classList.add('app--gated');
    startPreload();
    tryStartMusic();
  }

  playBtn.addEventListener('click', () => {
    unlockSfx();
    dismiss();
  });

  // Cold boot: screen is already in the DOM; start preload.
  show();

  return { show };
}
