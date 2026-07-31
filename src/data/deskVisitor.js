// Desk visitor (fireflies) config. Tunables for offering trigger, delay, gifts.
// See docs/GAME_DESIGN.md → Desk visitors (fireflies).

export const DESK_VISITOR = {
  // Chance a successful shrine offering schedules a firefly (0–1)
  offerChance: 0.2,
  // Appear delay after schedule (inclusive random range, seconds)
  delayMinSeconds: 15,
  delayMaxSeconds: 25,
  // Weight per crop rarity when picking a gift among unlocked plantables
  giftRarityWeights: {
    common: 1,
    uncommon: 1,
    rare: 1,
    epic: 1,
    legendary: 1,
  },
};

export function getDeskVisitorDelayMs() {
  const min = DESK_VISITOR.delayMinSeconds;
  const max = DESK_VISITOR.delayMaxSeconds;
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  const seconds = lo + Math.random() * (hi - lo);
  return seconds * 1000;
}

export function getGiftRarityWeight(rarity) {
  const weights = DESK_VISITOR.giftRarityWeights ?? {};
  const w = weights[rarity];
  return typeof w === 'number' && w > 0 ? w : 0;
}
