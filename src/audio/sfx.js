// Short one-shot SFX for gameplay feedback.

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
