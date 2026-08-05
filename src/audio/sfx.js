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
/** @type {Map<string, ArrayBuffer>} */
const rawClips = new Map();
/** @type {Map<string, AudioBuffer>} */
const buffers = new Map();
/** @type {Promise<void> | null} */
let preloadPromise = null;
/** @type {Promise<void> | null} */
let decodePromise = null;

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

async function decodePendingClips() {
  const ctx = audioCtx;
  if (!ctx) return;
  const pending = [...rawClips.entries()];
  await Promise.all(
    pending.map(async ([src, data]) => {
      if (buffers.has(src)) {
        rawClips.delete(src);
        return;
      }
      try {
        const buffer = await ctx.decodeAudioData(data.slice(0));
        buffers.set(src, buffer);
        rawClips.delete(src);
      } catch {
        // Leave unloaded; playSfx will use HTMLAudio fallback.
      }
    }),
  );
}

function kickDecode() {
  if (decodePromise) return decodePromise;
  decodePromise = decodePendingClips().finally(() => {
    decodePromise = null;
  });
  return decodePromise;
}

/**
 * Create/resume the shared AudioContext after a user gesture, then decode
 * any prefetched clips. Safe to call repeatedly.
 */
export function unlockSfx() {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (ctx.state === 'running') {
    kickDecode();
    return;
  }

  ctx
    .resume()
    .then(() => {
      kickDecode();
    })
    .catch(() => {});
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
  // Never start unless running — Chrome queues BufferSources silently while
  // suspended/interrupted and may only play them on later window restore.
  if (ctx.state === 'running') {
    startBufferSource(ctx, buffer);
    return;
  }
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

async function fetchClip(src) {
  if (rawClips.has(src) || buffers.has(src)) return;
  try {
    const res = await fetch(src);
    if (!res.ok) return;
    rawClips.set(src, await res.arrayBuffer());
  } catch {
    // Leave unloaded; playSfx will use HTMLAudio fallback.
  }
}

/**
 * Prefetch clip bytes into memory without creating an AudioContext. Idempotent.
 * @returns {Promise<void>}
 */
export function preloadSfx() {
  if (preloadPromise) return preloadPromise;
  preloadPromise = Promise.all(ALL_CLIPS.map(fetchClip)).then(() => {});
  return preloadPromise;
}

// Resume after tab focus only if a context already exists (do not create one).
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible' || !audioCtx) return;
  unlockSfx();
});

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

/** Dragon temple burn — win crop flames or lose shrine fire. */
export function playDragonEventEndSfx() {
  playSfx(THRUSTER_FIRE);
}
