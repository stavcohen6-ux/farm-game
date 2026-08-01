// Ambient looping BGM. Starts when asked; native loop, no fades.

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
    return Promise.resolve(true);
  }

  return playResult
    .then(() => {
      started = true;
      return true;
    })
    .catch(() => false);
}
