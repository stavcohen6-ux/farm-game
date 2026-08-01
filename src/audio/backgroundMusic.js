// Ambient looping BGM. Starts when asked; native loop, no fades.
// Pauses while the page is hidden (minimized / backgrounded / tab switch).

const SRC = 'assets/audio/farm_background_music.mp3';
const VOLUME = 0.35;

let audio = null;
let started = false;

function ensureAudio() {
  if (audio) return audio;
  audio = new Audio(SRC);
  audio.loop = true;
  audio.volume = VOLUME;
  audio.preload = 'auto';
  return audio;
}

function syncVisibilityPlayback() {
  if (!started || !audio) return;
  if (document.visibilityState === 'hidden') {
    audio.pause();
    return;
  }
  const playResult = audio.play();
  if (playResult && typeof playResult.catch === 'function') {
    playResult.catch(() => {});
  }
}

document.addEventListener('visibilitychange', syncVisibilityPlayback);

/**
 * Begin looping background music. Idempotent once playback has started.
 * @returns {Promise<boolean>} true if playing (or already started), false if blocked/failed
 */
export function startBackgroundMusic() {
  if (started) return Promise.resolve(true);

  const el = ensureAudio();
  const playResult = el.play();
  if (!playResult || typeof playResult.then !== 'function') {
    started = true;
    if (document.visibilityState === 'hidden') el.pause();
    return Promise.resolve(true);
  }

  return playResult
    .then(() => {
      started = true;
      if (document.visibilityState === 'hidden') el.pause();
      return true;
    })
    .catch(() => false);
}
