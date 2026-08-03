// Short one-shot SFX for gameplay feedback. Crop plant/mix variants are
// stable per crop id (hash → clip); other events pick a fixed or random clip.

const VOLUME = 0.45;
const AUDIO_DIR = 'assets/audio';

const FOOTSTEP_CARPET = [
  `${AUDIO_DIR}/footstep_carpet_001.ogg`,
  `${AUDIO_DIR}/footstep_carpet_002.ogg`,
  `${AUDIO_DIR}/footstep_carpet_003.ogg`,
  `${AUDIO_DIR}/footstep_carpet_004.ogg`,
];

const FOOTSTEP_GRASS = [
  `${AUDIO_DIR}/footstep_grass_001.ogg`,
  `${AUDIO_DIR}/footstep_grass_002.ogg`,
];

const IMPACT_BELL = `${AUDIO_DIR}/impactBell_heavy_000.ogg`;

const IMPACT_MINING = [
  `${AUDIO_DIR}/impactMining_001.ogg`,
  `${AUDIO_DIR}/impactMining_002.ogg`,
  `${AUDIO_DIR}/impactMining_003.ogg`,
  `${AUDIO_DIR}/impactMining_004.ogg`,
];

const BOOK_FLIP_OPEN = `${AUDIO_DIR}/bookFlip2.ogg`;
const BOOK_FLIP_CLOSE = `${AUDIO_DIR}/bookFlip1.ogg`;
const THRUSTER_FIRE = `${AUDIO_DIR}/thrusterFire_000.ogg`;

function hashCropId(cropId) {
  let hash = 0;
  const text = String(cropId ?? '');
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pickStable(cropId, clips) {
  if (!clips.length) return null;
  return clips[hashCropId(cropId) % clips.length];
}

function pickRandom(clips) {
  if (!clips.length) return null;
  return clips[Math.floor(Math.random() * clips.length)];
}

function playSfx(src) {
  if (!src) return;
  const audio = new Audio(src);
  audio.volume = VOLUME;
  const playResult = audio.play();
  if (playResult && typeof playResult.catch === 'function') {
    playResult.catch(() => {});
  }
}

/** Plant a crop — stable footstep_carpet variant per crop id. */
export function playPlantSfx(cropId) {
  playSfx(pickStable(cropId, FOOTSTEP_CARPET));
}

/** Mix/craft a crop — stable footstep_grass variant per result id. */
export function playMixSfx(resultId) {
  playSfx(pickStable(resultId, FOOTSTEP_GRASS));
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

/** Discovery log closed. */
export function playDiscoveryCloseSfx() {
  playSfx(BOOK_FLIP_CLOSE);
}

/** Dragon temple event ended (win or lose). */
export function playDragonEventEndSfx() {
  playSfx(THRUSTER_FIRE);
}
