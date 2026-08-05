// Ambient looping BGM. Starts when asked; native loop, no fades.
// Pauses while the page is hidden (minimized / backgrounded / tab switch).
// Mute preference persists in localStorage (survives refresh and Reset).

const SRC = 'assets/audio/farm_background_music.mp3';
const VOLUME = 0.35;
const MUTE_STORAGE_KEY = 'farm-game-music-muted';

let audio = null;
let started = false;
let muted = readStoredMuted();

function readStoredMuted() {
  try {
    return localStorage.getItem(MUTE_STORAGE_KEY) === '1';
  } catch {
    return false;
  }
}

function writeStoredMuted(value) {
  try {
    localStorage.setItem(MUTE_STORAGE_KEY, value ? '1' : '0');
  } catch {
    // Ignore quota / private-mode failures.
  }
}

function ensureAudio() {
  if (audio) return audio;
  audio = new Audio(SRC);
  audio.loop = true;
  audio.volume = VOLUME;
  audio.preload = 'auto';
  return audio;
}

function playIfAllowed() {
  if (!started || !audio || muted) return;
  if (document.visibilityState === 'hidden') return;
  const playResult = audio.play();
  if (playResult && typeof playResult.catch === 'function') {
    playResult.catch(() => {});
  }
}

function syncVisibilityPlayback() {
  if (!started || !audio) return;
  if (document.visibilityState === 'hidden' || muted) {
    audio.pause();
    return;
  }
  playIfAllowed();
}

document.addEventListener('visibilitychange', syncVisibilityPlayback);

export function isMusicMuted() {
  return muted;
}

/**
 * Mute or unmute background music. Persists preference.
 * @param {boolean} nextMuted
 */
export function setMusicMuted(nextMuted) {
  muted = Boolean(nextMuted);
  writeStoredMuted(muted);
  if (!audio) return;
  if (muted) {
    audio.pause();
    return;
  }
  playIfAllowed();
}

/**
 * Begin looping background music. Idempotent once playback has started.
 * Respects mute preference (marks started but stays paused while muted).
 * @returns {Promise<boolean>} true if started (or already started), false if blocked/failed
 */
export function startBackgroundMusic() {
  if (started) return Promise.resolve(true);

  const el = ensureAudio();

  if (muted) {
    started = true;
    el.pause();
    return Promise.resolve(true);
  }

  const playResult = el.play();
  if (!playResult || typeof playResult.then !== 'function') {
    started = true;
    if (document.visibilityState === 'hidden') el.pause();
    return Promise.resolve(true);
  }

  return playResult
    .then(() => {
      started = true;
      if (document.visibilityState === 'hidden' || muted) el.pause();
      return true;
    })
    .catch(() => false);
}
