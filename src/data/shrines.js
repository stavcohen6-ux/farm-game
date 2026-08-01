// Static shrine definitions. Progress requirements, accepted crops, and
// blessing values are data-driven so they can be tuned without changing
// game logic.

export const SHRINES = [
  {
    id: 'frog',
    name: 'Frog Shrine',
    icon: '🐸',
    theme: 'Growth',
    corner: 'top-left',
    tiers: [
      {
        name: 'Sleeping Frog',
        progressRequired: 15,
        acceptedCropIds: ['wheat', 'root_loaf'],
        growthSpeedBonus: 0.25,
        tooltip: '25% faster crop growth',
      },
      {
        name: 'Rainkeeper Frog',
        progressRequired: 25,
        acceptedCropIds: ['wheat', 'turnip', 'root_loaf'],
        growthSpeedBonus: 0.5,
        tooltip: '50% faster crop growth',
      },
      {
        name: 'Ancient River Frog',
        progressRequired: 40,
        acceptedCropIds: ['blueberry', 'forest_bread', 'moonlit_loaf'],
        growthSpeedBonus: 0.75,
        tooltip: '75% faster crop growth',
      },
      {
        name: 'Spirit Frog',
        progressRequired: 55,
        acceptedCropIds: [
          'sunfruit',
          'sunbread',
          'sunroot',
          'sunberry',
          'solar_bloom',
        ],
        growthSpeedBonus: 1,
        tooltip: '100% faster crop growth',
      },
    ],
  },
  {
    id: 'monkey',
    name: 'Monkey Shrine',
    icon: '🐵',
    theme: 'Research',
    corner: 'top-right',
    tiers: [
      {
        name: 'Curious Monkey',
        progressRequired: 12,
        acceptedCropIds: ['wheat', 'turnip', 'root_loaf'],
        researchBonus: 1,
        tooltip: 'Discover more crops to grow',
      },
      {
        name: 'Clever Monkey',
        progressRequired: 24,
        acceptedCropIds: ['blueberry', 'forest_bread', 'wildroot'],
        researchBonus: 2,
        tooltip: 'Unlock rarer crops',
      },
      {
        name: 'Wise Monkey',
        progressRequired: 40,
        acceptedCropIds: [
          'moonflower',
          'moonlit_loaf',
          'moonroot',
          'moonberry',
        ],
        researchBonus: 3,
        tooltip: 'Unlock more unique crops',
      },
    ],
  },
  {
    id: 'fox',
    name: 'Fox Shrine',
    icon: '🦊',
    theme: 'Expansion',
    corner: 'bottom-left',
    tiers: [
      {
        name: 'Forest Fox',
        progressRequired: 15,
        acceptedCropIds: ['turnip', 'root_loaf'],
        plotsToUnlock: 2,
        tooltip: 'Open more farming plots',
      },
      {
        name: 'Valley Fox',
        progressRequired: 25,
        acceptedCropIds: ['blueberry', 'forest_bread', 'wildroot'],
        plotsToUnlock: 2,
        tooltip: 'Still more plots',
      },
      {
        name: 'Mountain Fox',
        progressRequired: 35,
        acceptedCropIds: ['moonflower', 'moonroot', 'moonberry'],
        plotsToUnlock: 2,
        tooltip: 'Even more plots',
      },
      {
        name: 'Guardian Fox',
        progressRequired: 50,
        acceptedCropIds: [
          'golden_pumpkin',
          'golden_root',
          'enchanted_jam',
          'sunberry',
        ],
        plotsToUnlock: 2,
        tooltip: 'Last plots unlocked',
      },
    ],
  },
  {
    id: 'tiger',
    name: 'Tiger Shrine',
    icon: '🐯',
    theme: 'Fortune',
    corner: 'bottom-right',
    tiers: [
      {
        name: 'Young Tiger',
        progressRequired: 20,
        acceptedCropIds: ['wheat', 'turnip'],
        bonusHarvestChance: 0.25,
        tooltip: '25% for a bonus crop',
      },
      {
        name: 'Hunting Tiger',
        progressRequired: 30,
        acceptedCropIds: ['blueberry', 'forest_bread', 'wildroot'],
        bonusHarvestChance: 0.5,
        tooltip: '50% for a bonus crop',
      },
      {
        name: 'Golden Tiger',
        progressRequired: 45,
        acceptedCropIds: [
          'moonflower',
          'moonlit_loaf',
          'moonroot',
          'moonberry',
        ],
        bonusHarvestChance: 0.75,
        tooltip: '75% for a bonus crop',
      },
      {
        name: 'Spirit Tiger',
        progressRequired: 60,
        acceptedCropIds: [
          'golden_pumpkin',
          'sunfruit',
          'golden_loaf',
          'golden_bloom',
          'solar_gourd',
        ],
        bonusHarvestChance: 1,
        tooltip: '100% for a bonus crop',
      },
    ],
  },
];

/** Delay after first all-maxed before the epilogue game-text line. */
export const SHRINE_EPILOGUE_DELAY_MS = 6000;

/** Game-text line when all shrines are maxed (once per successful display). */
export const SHRINE_EPILOGUE_LINE =
  'Every shrine stands complete. The forest rests.';

export function getShrine(shrineId) {
  return SHRINES.find((shrine) => shrine.id === shrineId);
}

export function getShrineMaxTier(shrineId) {
  const shrine = getShrine(shrineId);
  return shrine ? shrine.tiers.length : 0;
}

export function tierAcceptsCrop(tier, cropId) {
  return Boolean(tier?.acceptedCropIds?.includes(cropId));
}

export function shrineAcceptsCrop(shrine, cropId) {
  return (shrine?.tiers ?? []).some((tier) => tierAcceptsCrop(tier, cropId));
}
