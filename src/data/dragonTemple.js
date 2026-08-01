// Dragon Temple event config. Matched tribute + plant-fueled wrath.
// See docs/GAME_DESIGN.md → Dragon Temple.
export const DRAGON_TEMPLE = {
  slotCount: 4, // demand board slots; auto-burn when all match
  wrathMax: 8, // wrath at or above this loses the event
  wrathPerPlant: 1, // added per successful plant while awake
  wrathPerShrineOffer: 3, // added when offering to an animal shrine while awake
  burnPulseMs: 1200, // half of ready-crop pulse (2.4s); one fire pulse
  burnPulseCount: 3, // fire pulses before slotted crops disappear
  burnEmberCount: 3, // rising ember dots per burning slot
  burnEmberMs: 1400, // one ember rise, played once per dot
  resultRevealMs: 500, // pause after burn before win close
  // Win prize: next N offerings to the blessed shrine grant multiplied points
  rewardBonusOfferings: 3,
  rewardProgressMultiplier: 2, // 100% bonus = double offering progress
  rewardSparkCount: 4, // spark emojis that fly temple → shrine
  rewardSparkIcon: '✨',
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
