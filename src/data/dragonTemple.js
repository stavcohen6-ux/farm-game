// Dragon Temple event config. Matched tribute + plant-fueled wrath.
// See docs/GAME_DESIGN.md → Dragon Temple.
export const DRAGON_TEMPLE = {
  slotCount: 4, // demand board slots; auto-burn when all match
  maxSameCropInDemand: 2, // max copies of one crop in a demand (relax if pool too small)
  wrathMax: 8, // wrath at or above this loses the event
  wrathPerPlant: 1, // added per successful plant while awake
  wrathPerShrineOffer: 3, // added when offering to an animal shrine while awake
  burnPulseMs: 1200, // one rising-flame wave (also timing pulse length)
  burnPulseCount: 3, // flame waves before slotted crops disappear
  // Rising fire.png icons per burning slot (left / drift / delay / size)
  burnFlames: [
    { left: '28%', dx: '-7px', delayMs: 0, sizePx: 52 },
    { left: '50%', dx: '5px', delayMs: 180, sizePx: 60 },
    { left: '72%', dx: '9px', delayMs: 320, sizePx: 50 },
    { left: '40%', dx: '-11px', delayMs: 520, sizePx: 48 },
  ],
  resultRevealMs: 500, // pause after burn before win close
  // Win prize: next N offerings to the blessed shrine grant multiplied points
  rewardBonusOfferings: 1,
  rewardProgressMultiplier: 2, // 100% bonus = double offering progress
  rewardSparkCount: 4, // spark emojis that fly temple → shrine
  rewardSparkIcon: '✨',
  // First-time soft tip after a real win blessing lands on a shrine
  blessingTipText:
    "This shrine glows with the Dragon's blessing. Your next offering here counts double.",
  // Hidden chance that a shrine offering wakes the dragon (0–1)
  defaultTriggerChance: 0,
  // Added to triggerChance after a missed offering roll, per shrine (capped at 1)
  shrineTriggerChanceIncrease: {
    frog: 0.05,
    monkey: 0.05,
    fox: 0.05,
    tiger: 0.05,
  },
};
