// Static crop definitions. Growth time is stored in seconds; convert with
// getGrowthMs when comparing against plantedAt timestamps.
// shrineValues is how much one crop contributes when offered to each shrine.
// plantable crops appear in the crop picker; alchemy products do not.
// Plantables may define optional watering fields (chance, progress window,
// time saved) and optional critter-visit fields (chance, progress window,
// safe shrine progress); see docs/GAME_DESIGN.md.
//
// Alchemy shrine values follow the economy rules in docs/GAME_DESIGN.md:
//   sum[s] = parentA[s] + parentB[s]
//   normal mix: sum + 1 on every shrine
//   apex gift:  sum + 3 on the dedicated shrine, sum + 0 elsewhere

export const CROPS = [
  {
    id: 'wheat',
    name: 'Wheat',
    description: 'A humble grain that represents the beginning of every great farm.',
    rarity: 'common',
    unlockResearchLevel: 1,
    growthTimeSeconds: 30,
    harvestAmount: 1,
    shrineValues: { frog: 4, monkey: 2, fox: 1, tiger: 1 },
    plantable: true,
    waterRequestChance: 0.55,
    waterRequestMinProgress: 0.25,
    waterRequestMaxProgress: 0.7,
    waterTimeSavedSeconds: 8,
    critterVisitChance: 1,
    critterVisitMinProgress: 0.4,
    critterVisitMaxProgress: 0.85,
    critterShrineProgress: 2,
    decaySeconds: 60,
    decayDisabled: true,
    maxStack: 10,
    icon: '🌾',
  },
  {
    id: 'turnip',
    name: 'Turnip',
    description: 'A hardy root crop that grows well in quiet soil.',
    rarity: 'common',
    unlockResearchLevel: 1,
    growthTimeSeconds: 60,
    harvestAmount: 1,
    shrineValues: { frog: 1, monkey: 1, fox: 4, tiger: 2 },
    plantable: true,
    waterRequestChance: 0.5,
    waterRequestMinProgress: 0.25,
    waterRequestMaxProgress: 0.7,
    waterTimeSavedSeconds: 12,
    critterVisitChance: 0.32,
    critterVisitMinProgress: 0.4,
    critterVisitMaxProgress: 0.85,
    critterShrineProgress: 2,
    decaySeconds: 60,
    decayDisabled: true,
    maxStack: 10,
    icon: '🥬',
  },
  {
    id: 'blueberry',
    name: 'Blueberry',
    description: 'A sweet woodland berry found near places touched by nature.',
    rarity: 'uncommon',
    unlockResearchLevel: 2,
    growthTimeSeconds: 120,
    harvestAmount: 1,
    shrineValues: { frog: 1, monkey: 2, fox: 5, tiger: 1 },
    plantable: true,
    waterRequestChance: 0.45,
    waterRequestMinProgress: 0.2,
    waterRequestMaxProgress: 0.75,
    waterTimeSavedSeconds: 25,
    critterVisitChance: 0.28,
    critterVisitMinProgress: 0.4,
    critterVisitMaxProgress: 0.85,
    critterShrineProgress: 2,
    decaySeconds: 60,
    decayDisabled: true,
    maxStack: 10,
    icon: '🫐',
  },
  {
    id: 'moonflower',
    name: 'Moonflower',
    description: 'A mysterious flower that blooms beneath the moonlight.',
    rarity: 'rare',
    unlockResearchLevel: 3,
    growthTimeSeconds: 180,
    harvestAmount: 1,
    shrineValues: { frog: 2, monkey: 6, fox: 1, tiger: 2 },
    plantable: true,
    waterRequestChance: 0.4,
    waterRequestMinProgress: 0.2,
    waterRequestMaxProgress: 0.75,
    waterTimeSavedSeconds: 35,
    critterVisitChance: 0.25,
    critterVisitMinProgress: 0.4,
    critterVisitMaxProgress: 0.85,
    critterShrineProgress: 3,
    decaySeconds: 60,
    decayDisabled: true,
    maxStack: 10,
    icon: '🪷',
  },
  {
    id: 'golden_pumpkin',
    name: 'Golden Pumpkin',
    description: 'A rare pumpkin with golden flesh said to appear on blessed farms.',
    rarity: 'epic',
    unlockResearchLevel: 4,
    growthTimeSeconds: 300,
    harvestAmount: 1,
    shrineValues: { frog: 2, monkey: 2, fox: 2, tiger: 7 },
    plantable: true,
    waterRequestChance: 0.35,
    waterRequestMinProgress: 0.2,
    waterRequestMaxProgress: 0.8,
    waterTimeSavedSeconds: 50,
    critterVisitChance: 0.22,
    critterVisitMinProgress: 0.4,
    critterVisitMaxProgress: 0.85,
    critterShrineProgress: 3,
    decaySeconds: 60,
    decayDisabled: true,
    maxStack: 10,
    icon: '🎃',
  },
  {
    id: 'sunfruit',
    name: 'Sunfruit',
    description: 'A radiant fruit carrying the warmth of ancient sunlight.',
    rarity: 'legendary',
    unlockResearchLevel: 4,
    growthTimeSeconds: 480,
    harvestAmount: 1,
    shrineValues: { frog: 6, monkey: 2, fox: 2, tiger: 7 },
    plantable: true,
    waterRequestChance: 0.3,
    waterRequestMinProgress: 0.2,
    waterRequestMaxProgress: 0.8,
    waterTimeSavedSeconds: 70,
    critterVisitChance: 0.2,
    critterVisitMinProgress: 0.4,
    critterVisitMaxProgress: 0.85,
    critterShrineProgress: 3,
    decaySeconds: 60,
    decayDisabled: true,
    maxStack: 10,
    icon: '🥭',
  },
  {
    id: 'harvest_tonic',
    name: 'Harvest Tonic',
    description: 'A blended tonic of grain and root, offered to the gods.',
    shrineValues: { frog: 6, monkey: 4, fox: 6, tiger: 4 },
    plantable: false,
    decaySeconds: 60,
    decayDisabled: true,
    maxStack: 10,
    icon: '🥃',
  },
  {
    id: 'forest_bread',
    name: 'Forest Bread',
    description: 'Warm bread mixed from wheat and woodland berries.',
    shrineValues: { frog: 6, monkey: 5, fox: 7, tiger: 3 },
    plantable: false,
    decaySeconds: 60,
    decayDisabled: true,
    maxStack: 10,
    icon: '🍞',
  },
  {
    id: 'moonlit_grain',
    name: 'Moonlit Grain',
    description: 'Grain touched by moonflower, soft and pale as dawn.',
    shrineValues: { frog: 7, monkey: 9, fox: 3, tiger: 4 },
    plantable: false,
    decaySeconds: 60,
    decayDisabled: true,
    maxStack: 10,
    icon: '🥞',
  },
  {
    id: 'golden_champignon',
    name: 'Golden Champignon',
    description: 'A golden mushroom blended from wheat and pumpkin.',
    shrineValues: { frog: 7, monkey: 5, fox: 4, tiger: 9 },
    plantable: false,
    decaySeconds: 60,
    decayDisabled: true,
    maxStack: 10,
    icon: '🍄‍🟫',
  },
  {
    id: 'sunblessed_shroom',
    name: 'Sunblessed Shroom',
    description: 'A sun-warmed mushroom mixed from wheat and sunfruit. Frog apex gift.',
    shrineValues: { frog: 13, monkey: 4, fox: 3, tiger: 8 },
    plantable: false,
    decaySeconds: 60,
    decayDisabled: true,
    maxStack: 10,
    icon: '🍄',
  },
  {
    id: 'wildroot_mix',
    name: 'Wildroot Mix',
    description: 'A rustic blend of turnip and woodland berries. Fox apex gift.',
    shrineValues: { frog: 2, monkey: 3, fox: 12, tiger: 3 },
    plantable: false,
    decaySeconds: 60,
    decayDisabled: true,
    maxStack: 10,
    icon: '🫚',
  },
  {
    id: 'moonroot_essence',
    name: 'Moonroot Essence',
    description: 'Root essence steeped with moonflower petals.',
    shrineValues: { frog: 4, monkey: 8, fox: 6, tiger: 5 },
    plantable: false,
    decaySeconds: 60,
    decayDisabled: true,
    maxStack: 10,
    icon: '🫘',
  },
  {
    id: 'harvest_root',
    name: 'Harvest Root',
    description: 'A hearty root mixed from turnip and golden pumpkin.',
    shrineValues: { frog: 4, monkey: 4, fox: 7, tiger: 10 },
    plantable: false,
    decaySeconds: 60,
    decayDisabled: true,
    maxStack: 10,
    icon: '🌿',
  },
  {
    id: 'sunroot_essence',
    name: 'Sunroot Essence',
    description: 'Root essence infused with radiant sunfruit.',
    shrineValues: { frog: 8, monkey: 4, fox: 7, tiger: 10 },
    plantable: false,
    decaySeconds: 60,
    decayDisabled: true,
    maxStack: 10,
    icon: '🍀',
  },
  {
    id: 'mystic_berry',
    name: 'Mystic Berry',
    description: 'A berry touched by moonflower, deep and mysterious. Monkey apex gift.',
    shrineValues: { frog: 3, monkey: 11, fox: 6, tiger: 3 },
    plantable: false,
    decaySeconds: 60,
    decayDisabled: true,
    maxStack: 10,
    icon: '🍇',
  },
  {
    id: 'enchanted_jam',
    name: 'Enchanted Jam',
    description: 'Sweet jam of blueberries and golden pumpkin.',
    shrineValues: { frog: 4, monkey: 5, fox: 8, tiger: 9 },
    plantable: false,
    decaySeconds: 60,
    decayDisabled: true,
    maxStack: 10,
    icon: '🍯',
  },
  {
    id: 'radiant_berry',
    name: 'Radiant Berry',
    description: 'A glowing berry mixed from blueberry and sunfruit.',
    shrineValues: { frog: 8, monkey: 5, fox: 8, tiger: 9 },
    plantable: false,
    decaySeconds: 60,
    decayDisabled: true,
    maxStack: 10,
    icon: '🍓',
  },
  {
    id: 'celestial_seed',
    name: 'Celestial Seed',
    description: 'A seed of moonflower and golden pumpkin, lit from within.',
    shrineValues: { frog: 5, monkey: 9, fox: 4, tiger: 10 },
    plantable: false,
    decaySeconds: 60,
    decayDisabled: true,
    maxStack: 10,
    icon: '🥜',
  },
  {
    id: 'solar_bloom',
    name: 'Solar Bloom',
    description: 'A bloom of moonflower warmed by sunfruit.',
    shrineValues: { frog: 9, monkey: 9, fox: 4, tiger: 10 },
    plantable: false,
    decaySeconds: 60,
    decayDisabled: true,
    maxStack: 10,
    icon: '🌻',
  },
  {
    id: 'divine_harvest',
    name: 'Divine Harvest',
    description: 'A sacred blend of golden pumpkin and sunfruit. Tiger apex gift.',
    shrineValues: { frog: 8, monkey: 4, fox: 4, tiger: 17 },
    plantable: false,
    decaySeconds: 60,
    decayDisabled: true,
    maxStack: 10,
    icon: '🪻',
  },
];

export function getCrop(cropId) {
  return CROPS.find((crop) => crop.id === cropId);
}

export function getMaxStack(crop) {
  return crop?.maxStack ?? 10;
}

export function getGrowthMs(crop) {
  return crop.growthTimeSeconds * 1000;
}

export function getWaterTimeSavedMs(crop) {
  const seconds = crop?.waterTimeSavedSeconds;
  if (typeof seconds !== 'number' || seconds <= 0) return 0;
  return seconds * 1000;
}

export function getCritterShrineProgress(crop) {
  const amount = crop?.critterShrineProgress;
  if (typeof amount !== 'number' || amount <= 0) return 0;
  return amount;
}

export function isDecayDisabled(crop) {
  return crop?.decayDisabled === true;
}

export function getDecayMs(crop) {
  if (isDecayDisabled(crop)) return null;
  return (crop?.decaySeconds ?? 60) * 1000;
}

// Wall-clock expiry, or null when the crop does not decay.
export function getExpiresAt(crop, now = Date.now()) {
  const ms = getDecayMs(crop);
  return typeof ms === 'number' ? now + ms : null;
}

// Compact shrine offering readout (emoji fallback), e.g. "🐸4  🐵2  🦊1  🐯1".
// Discovery Log prefers log_* face PNGs via logShrineIconSrc.
export function formatShrineValues(crop) {
  const values = crop?.shrineValues;
  if (!values) return '';
  return `🐸${values.frog}  🐵${values.monkey}  🦊${values.fox}  🐯${values.tiger}`;
}

const PREFERRED_MIN_VALUE = 3;
const PREFERRED_MAX = 2;

// Plantables a shrine prefers for its detail "Prefers:" line.
// Only values above PREFERRED_MIN_VALUE; up to PREFERRED_MAX; CROPS order breaks ties.
export function getPreferredPlantables(shrineId) {
  return CROPS.filter(
    (crop) =>
      crop.plantable &&
      typeof crop.shrineValues?.[shrineId] === 'number' &&
      crop.shrineValues[shrineId] > PREFERRED_MIN_VALUE,
  )
    .sort((a, b) => b.shrineValues[shrineId] - a.shrineValues[shrineId])
    .slice(0, PREFERRED_MAX);
}

// Remaining life fraction → UI urgency. Uses the crop's full decay window.
export function getDecayUrgency(expiresAt, decayMs, now = Date.now()) {
  if (typeof expiresAt !== 'number' || typeof decayMs !== 'number' || decayMs <= 0) {
    return 'none';
  }
  const remaining = expiresAt - now;
  if (remaining <= 0) return 'critical';
  const fraction = remaining / decayMs;
  if (fraction <= 0.1) return 'critical';
  if (fraction <= 0.25) return 'warn';
  return 'none';
}
