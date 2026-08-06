// Static crop definitions. Growth time is stored in seconds; convert with
// getGrowthMs when comparing against plantedAt timestamps.
// shrineValues is how much one crop contributes when offered to each shrine.
// plantable crops appear in the crop picker; alchemy products do not.
// Plantables may define optional watering fields (chance, progress window)
// and optional critter-visit fields (chance, progress window, safe shrine
// progress); watering time-save is a global fraction of base growth — see
// docs/GAME_DESIGN.md.
//
// Alchemy shrine values follow the economy rules in docs/GAME_DESIGN.md:
//   sum[s] = parentA[s] + parentB[s]
//   normal mix: sum + 1 on every shrine
//   apex gift:  sum + 3 on the dedicated shrine, sum + 0 elsewhere

import { SHRINES, shrineAcceptsCrop } from './shrines.js';

export const CROPS = [
  {
    id: 'wheat',
    name: 'Wheat',
    description: 'A humble grain that represents the beginning of every great farm.',
    rarity: 'common',
    unlockResearchLevel: 1,
    growthTimeSeconds: 30,
    harvestAmount: 1,
    shrineValues: { frog: 3, monkey: 2, fox: 1, tiger: 1 },
    plantable: true,
    waterRequestChance: 0.55,
    waterRequestMinProgress: 0.25,
    waterRequestMaxProgress: 0.7,
    critterVisitChance: 0.6,
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
    growthTimeSeconds: 90,
    harvestAmount: 1,
    shrineValues: { frog: 1, monkey: 2, fox: 5, tiger: 1 },
    plantable: true,
    waterRequestChance: 0.45,
    waterRequestMinProgress: 0.2,
    waterRequestMaxProgress: 0.75,
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
    growthTimeSeconds: 150,
    harvestAmount: 1,
    shrineValues: { frog: 2, monkey: 6, fox: 1, tiger: 2 },
    plantable: true,
    waterRequestChance: 0.4,
    waterRequestMinProgress: 0.2,
    waterRequestMaxProgress: 0.75,
    critterVisitChance: 0.25,
    critterVisitMinProgress: 0.4,
    critterVisitMaxProgress: 0.85,
    critterShrineProgress: 2,
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
    shrineValues: { frog: 2, monkey: 2, fox: 2, tiger: 6 },
    plantable: true,
    waterRequestChance: 0.35,
    waterRequestMinProgress: 0.2,
    waterRequestMaxProgress: 0.8,
    critterVisitChance: 0.22,
    critterVisitMinProgress: 0.4,
    critterVisitMaxProgress: 0.85,
    critterShrineProgress: 2,
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
    shrineValues: { frog: 6, monkey: 2, fox: 2, tiger: 6 },
    plantable: true,
    waterRequestChance: 0.3,
    waterRequestMinProgress: 0.2,
    waterRequestMaxProgress: 0.8,
    critterVisitChance: 0.2,
    critterVisitMinProgress: 0.4,
    critterVisitMaxProgress: 0.85,
    critterShrineProgress: 2,
    decaySeconds: 60,
    decayDisabled: true,
    maxStack: 10,
    icon: '🥭',
  },
  {
    id: 'root_loaf',
    name: 'Root Loaf',
    description: 'A rustic wheat loaf made hearty with sweet turnip root.',
    shrineValues: { frog: 5, monkey: 4, fox: 6, tiger: 4 },
    plantable: false,
    decaySeconds: 60,
    decayDisabled: true,
    maxStack: 10,
    icon: '🥖',
  },
  {
    id: 'forest_bread',
    name: 'Forest Bread',
    description: 'Warm wheat bread studded with sweet woodland blueberries.',
    shrineValues: { frog: 5, monkey: 5, fox: 7, tiger: 3 },
    plantable: false,
    decaySeconds: 60,
    decayDisabled: true,
    maxStack: 10,
    icon: '🍞',
  },
  {
    id: 'moonlit_loaf',
    name: 'Moonlit Loaf',
    description: 'A pale wheat loaf scented with moonflower petals.',
    shrineValues: { frog: 6, monkey: 9, fox: 3, tiger: 4 },
    plantable: false,
    decaySeconds: 60,
    decayDisabled: true,
    maxStack: 10,
    icon: '🥖',
  },
  {
    id: 'golden_loaf',
    name: 'Golden Loaf',
    description: 'A rich wheat loaf baked with sweet golden pumpkin.',
    shrineValues: { frog: 6, monkey: 5, fox: 4, tiger: 9 },
    plantable: false,
    decaySeconds: 60,
    decayDisabled: true,
    maxStack: 10,
    icon: '🍞',
  },
  {
    id: 'sunbread',
    name: 'Sunbread',
    description: 'A radiant wheat bread warmed by the juice of sunfruit. Frog apex gift.',
    shrineValues: { frog: 12, monkey: 4, fox: 3, tiger: 8 },
    plantable: false,
    decaySeconds: 60,
    decayDisabled: true,
    maxStack: 10,
    icon: '🍞',
  },
  {
    id: 'wildroot',
    name: 'Wildroot',
    description: 'A hardy turnip root transformed by wild blueberry sweetness. Fox apex gift.',
    shrineValues: { frog: 2, monkey: 3, fox: 12, tiger: 3 },
    plantable: false,
    decaySeconds: 60,
    decayDisabled: true,
    maxStack: 10,
    icon: '🫚',
  },
  {
    id: 'moonroot',
    name: 'Moonroot',
    description: 'A turnip root steeped in the cool glow of moonflower petals.',
    shrineValues: { frog: 4, monkey: 8, fox: 6, tiger: 5 },
    plantable: false,
    decaySeconds: 60,
    decayDisabled: true,
    maxStack: 10,
    icon: '🫘',
  },
  {
    id: 'golden_root',
    name: 'Golden Root',
    description: 'A sturdy turnip root enriched with golden pumpkin flesh.',
    shrineValues: { frog: 4, monkey: 4, fox: 7, tiger: 10 },
    plantable: false,
    decaySeconds: 60,
    decayDisabled: true,
    maxStack: 10,
    icon: '🌿',
  },
  {
    id: 'sunroot',
    name: 'Sunroot',
    description: 'A turnip root infused with the warmth of radiant sunfruit.',
    shrineValues: { frog: 8, monkey: 4, fox: 7, tiger: 10 },
    plantable: false,
    decaySeconds: 60,
    decayDisabled: true,
    maxStack: 10,
    icon: '🍀',
  },
  {
    id: 'moonberry',
    name: 'Moonberry',
    description: 'A blueberry transformed by the quiet magic of moonflower. Monkey apex gift.',
    shrineValues: { frog: 3, monkey: 10, fox: 6, tiger: 3 },
    plantable: false,
    decaySeconds: 60,
    decayDisabled: true,
    maxStack: 10,
    icon: '🫐',
  },
  {
    id: 'enchanted_jam',
    name: 'Enchanted Jam',
    description: 'A sweet preserve of blueberries and golden pumpkin.',
    shrineValues: { frog: 4, monkey: 5, fox: 8, tiger: 9 },
    plantable: false,
    decaySeconds: 60,
    decayDisabled: true,
    maxStack: 10,
    icon: '🍯',
  },
  {
    id: 'sunberry',
    name: 'Sunberry',
    description: 'A plump blueberry glowing with the warmth of sunfruit.',
    shrineValues: { frog: 8, monkey: 5, fox: 8, tiger: 9 },
    plantable: false,
    decaySeconds: 60,
    decayDisabled: true,
    maxStack: 10,
    icon: '🍓',
  },
  {
    id: 'golden_bloom',
    name: 'Golden Bloom',
    description: 'A moonflower bloom with petals turned gold by pumpkin magic.',
    shrineValues: { frog: 5, monkey: 9, fox: 4, tiger: 10 },
    plantable: false,
    decaySeconds: 60,
    decayDisabled: true,
    maxStack: 10,
    icon: '🌼',
  },
  {
    id: 'solar_bloom',
    name: 'Solar Bloom',
    description: 'A moonflower bloom opened and warmed by radiant sunfruit.',
    shrineValues: { frog: 9, monkey: 9, fox: 4, tiger: 10 },
    plantable: false,
    decaySeconds: 60,
    decayDisabled: true,
    maxStack: 10,
    icon: '🌻',
  },
  {
    id: 'solar_gourd',
    name: 'Solar Gourd',
    description: 'A golden pumpkin blazing with the ancient warmth of sunfruit. Tiger apex gift.',
    shrineValues: { frog: 8, monkey: 4, fox: 4, tiger: 13 },
    plantable: false,
    decaySeconds: 60,
    decayDisabled: true,
    maxStack: 10,
    icon: '🎃',
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

// Fraction of base growth time removed when watering (ignores Frog buffs).
export const WATER_TIME_SAVED_FRACTION = 0.2;

export function getWaterTimeSavedMs(crop) {
  if (!crop || typeof crop.growthTimeSeconds !== 'number') return 0;
  return getGrowthMs(crop) * WATER_TIME_SAVED_FRACTION;
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
// Only includes shrines that accept the crop in any tier.
// Discovery Log prefers log_* face PNGs via logShrineIconSrc.
export function formatShrineValues(crop) {
  const values = crop?.shrineValues;
  if (!values) return '';
  return SHRINES.filter((shrine) => shrineAcceptsCrop(shrine, crop.id))
    .map((shrine) => `${shrine.icon}${values[shrine.id] ?? 0}`)
    .join('  ');
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
