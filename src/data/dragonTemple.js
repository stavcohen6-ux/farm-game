// Dragon Temple event config. Tunables for the timed sacrifice challenge.
// See docs/GAME_DESIGN.md → Dragon Temple.
export const DRAGON_TEMPLE = {
  slotCount: 5, // sacrifice slots that must be filled before Burn
  pointsPerBurn: 5, // progress added each successful Burn
  progressRequired: 15, // progress needed to win the event (3 burns × 5)
  durationMs: 90 * 1000, // countdown length when the event starts
  burnPulseMs: 1200, // half of ready-crop pulse (2.4s); one fire pulse
  burnPulseCount: 3, // fire pulses before slotted crops disappear
  resultRevealMs: 500, // show granted bar points before win/lose close
  rewardProgress: 10, // shrine progress granted after a successful win prize
  rewardSparkCount: 4, // spark emojis that fly temple → shrine
  rewardSparkIcon: '✨',
  rewardPulseCount: 2, // animal-icon pulses before progress is applied
  // Hidden chance that a shrine offering wakes the dragon (0–1)
  defaultTriggerChance: 0.1,
  // Added to triggerChance after a missed offering roll, per shrine (capped at 1)
  shrineTriggerChanceIncrease: {
    frog: 0.05,
    monkey: 0.05,
    fox: 0.05,
    tiger: 0.05,
  },
};
