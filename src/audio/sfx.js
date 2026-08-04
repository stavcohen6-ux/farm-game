// Short one-shot SFX for gameplay feedback.
// Prefers preloaded Web Audio buffers for low latency; falls back to HTMLAudio.

const VOLUME = 0.45;
const AUDIO_DIR = 'assets/audio';

const FOOTSTEP_CARPET = `${AUDIO_DIR}/footstep_carpet_001.ogg`;
const FOOTSTEP_GRASS = `${AUDIO_DIR}/footstep_grass_001.ogg`;

const IMPACT_BELL = `${AUDIO_DIR}/impactBell_heavy_000.ogg`;

const IMPACT_MINING = [
  `${AUDIO_DIR}/impactMining_001.ogg`,
  `${AUDIO_DIR}/impactMining_002.ogg`,
  `${AUDIO_DIR}/impactMining_003.ogg`,
  `${AUDIO_DIR}/impactMining_004.ogg`,
];

const BOOK_FLIP_OPEN = `${AUDIO_DIR}/bookFlip2.ogg`;
const THRUSTER_FIRE = `${AUDIO_DIR}/thrusterFire_000.ogg`;

const ALL_CLIPS = [
  FOOTSTEP_CARPET,
  FOOTSTEP_GRASS,
  IMPACT_BELL,
  ...IMPACT_MINING,
  BOOK_FLIP_OPEN,
  THRUSTER_FIRE,
];

/** @type {AudioContext | null} */
let audioCtx = null;
/** @type {Map<string, AudioBuffer>} */
const buffers = new Map();
/** @type {Promise<void> | null} */
let preloadPromise = null;

function pickRandom(clips) {
  if (!clips.length) return null;
  return clips[Math.floor(Math.random() * clips.length)];
}

function getAudioContext() {
  if (audioCtx) return audioCtx;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  audioCtx = new Ctx();
  return audioCtx;
}

/** Resume the shared AudioContext after a user gesture (unlocks autoplay). */
export function unlockSfx() {
  const ctx = getAudioContext();
  if (!ctx || ctx.state !== 'suspended') return;
  ctx.resume().catch(() => {});
}

function playHtmlFallback(src) {
  const audio = new Audio(src);
  audio.volume = VOLUME;
  const playResult = audio.play();
  if (playResult && typeof playResult.catch === 'function') {
    playResult.catch(() => {});
  }
}

function startBufferSource(ctx, buffer) {
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  gain.gain.value = VOLUME;
  source.buffer = buffer;
  source.connect(gain);
  gain.connect(ctx.destination);
  source.start(0);
}

function playFromBuffer(src, buffer) {
  const ctx = getAudioContext();
  if (!ctx) {
    playHtmlFallback(src);
    return;
  }
  // Never start while suspended — Chrome queues the node silently and may
  // audibly play it only later when the context resumes (e.g. window restore).
  if (ctx.state === 'suspended') {
    ctx
      .resume()
      .then(() => {
        if (ctx.state !== 'running') {
          playHtmlFallback(src);
          return;
        }
        startBufferSource(ctx, buffer);
      })
      .catch(() => {
        playHtmlFallback(src);
      });
    return;
  }
  startBufferSource(ctx, buffer);
}

function playSfx(src) {
  if (!src) return;
  const buffer = buffers.get(src);
  if (buffer) {
    playFromBuffer(src, buffer);
    return;
  }
  playHtmlFallback(src);
}

async function loadBuffer(src) {
  if (buffers.has(src)) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const res = await fetch(src);
    if (!res.ok) return;
    const data = await res.arrayBuffer();
    const buffer = await ctx.decodeAudioData(data.slice(0));
    buffers.set(src, buffer);
  } catch {
    // Leave unloaded; playSfx will use HTMLAudio fallback.
  }
}

/**
 * Fetch + decode all one-shot clips into memory. Idempotent.
 * @returns {Promise<void>}
 */
export function preloadSfx() {
  if (preloadPromise) return preloadPromise;
  preloadPromise = Promise.all(ALL_CLIPS.map(loadBuffer)).then(() => {});
  return preloadPromise;
}

/** Plant a crop. */
export function playPlantSfx(cropId) {
  playSfx(FOOTSTEP_CARPET);
}

/** Mix/craft a crop. */
export function playMixSfx(resultId) {
  playSfx(FOOTSTEP_GRASS);
}

/** Shrine tier-up. */
export function playShrineUpgradeSfx() {
  playSfx(IMPACT_BELL);
}

/** Crop placed into a dragon temple slot — random mining impact. */
export function playDragonSlotSfx() {
  playSfx(pickRandom(IMPACT_MINING));
}

/** Discovery log opened. */
export function playDiscoveryOpenSfx() {
  playSfx(BOOK_FLIP_OPEN);
}

/** Dragon temple event ended (win or lose). */
export function playDragonEventEndSfx() {
  playSfx(THRUSTER_FIRE);
}
