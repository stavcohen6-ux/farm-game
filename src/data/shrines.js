// Static shrine definitions. Progress requirements and blessing values are
// data-driven so they can be tuned without changing game logic.

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
        growthSpeedBonus: 0.25,
        tooltip: 'Crops grow 25% faster',
      },
      {
        name: 'Rainkeeper Frog',
        progressRequired: 25,
        growthSpeedBonus: 0.5,
        tooltip: 'Crops grow 50% faster',
      },
      {
        name: 'Ancient River Frog',
        progressRequired: 40,
        growthSpeedBonus: 0.75,
        tooltip: 'Crops grow 75% faster',
      },
      {
        name: 'Spirit Frog',
        progressRequired: 55,
        growthSpeedBonus: 1,
        tooltip: 'Crops grow 100% faster',
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
        researchBonus: 1,
        tooltip: 'Research Level +1',
      },
      {
        name: 'Clever Monkey',
        progressRequired: 24,
        researchBonus: 2,
        tooltip: 'Research Level +2',
      },
      {
        name: 'Wise Monkey',
        progressRequired: 40,
        researchBonus: 3,
        tooltip: 'Research Level +3',
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
        plotsToUnlock: 4,
        tooltip: 'Unlock more land',
      },
      {
        name: 'Valley Fox',
        progressRequired: 25,
        plotsToUnlock: 4,
        tooltip: 'Grow your farmland',
      },
      {
        name: 'Mountain Fox',
        progressRequired: 35,
        plotsToUnlock: 4,
        tooltip: 'Even more land unlocked',
      },
      {
        name: 'Guardian Fox',
        progressRequired: 50,
        plotsToUnlock: 4,
        tooltip: 'Final land expansion',
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
        bonusHarvestChance: 0.25,
        tooltip: '25% bonus crop chance',
      },
      {
        name: 'Hunting Tiger',
        progressRequired: 30,
        bonusHarvestChance: 0.5,
        tooltip: '50% bonus crop chance',
      },
      {
        name: 'Golden Tiger',
        progressRequired: 45,
        bonusHarvestChance: 0.75,
        tooltip: '75% bonus crop chance',
      },
      {
        name: 'Spirit Tiger',
        progressRequired: 60,
        bonusHarvestChance: 1,
        tooltip: '100% bonus crop chance',
      },
    ],
  },
];

export function getShrine(shrineId) {
  return SHRINES.find((shrine) => shrine.id === shrineId);
}

export function getShrineMaxTier(shrineId) {
  const shrine = getShrine(shrineId);
  return shrine ? shrine.tiers.length : 0;
}
