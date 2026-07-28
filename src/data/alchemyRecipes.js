// Order-independent alchemy recipes. Inputs are normalized as sorted ids.
export const ALCHEMY_RECIPES = [
  { inputs: ['wheat', 'turnip'], resultId: 'harvest_tonic' },
  { inputs: ['blueberry', 'wheat'], resultId: 'forest_bread' },
  { inputs: ['moonflower', 'wheat'], resultId: 'moonlit_grain' },
  { inputs: ['golden_pumpkin', 'wheat'], resultId: 'golden_champignon' },
  { inputs: ['sunfruit', 'wheat'], resultId: 'sunblessed_shroom' },
  { inputs: ['blueberry', 'turnip'], resultId: 'wildroot_mix' },
  { inputs: ['moonflower', 'turnip'], resultId: 'moonroot_essence' },
  { inputs: ['golden_pumpkin', 'turnip'], resultId: 'harvest_root' },
  { inputs: ['sunfruit', 'turnip'], resultId: 'sunroot_essence' },
  { inputs: ['blueberry', 'moonflower'], resultId: 'mystic_berry' },
  { inputs: ['blueberry', 'golden_pumpkin'], resultId: 'enchanted_jam' },
  { inputs: ['blueberry', 'sunfruit'], resultId: 'radiant_berry' },
  { inputs: ['golden_pumpkin', 'moonflower'], resultId: 'celestial_seed' },
  { inputs: ['moonflower', 'sunfruit'], resultId: 'solar_bloom' },
  { inputs: ['golden_pumpkin', 'sunfruit'], resultId: 'divine_harvest' },
];

function recipeKey(cropIdA, cropIdB) {
  return [cropIdA, cropIdB].sort().join('+');
}

const RECIPE_BY_KEY = new Map(
  ALCHEMY_RECIPES.map((recipe) => [
    recipeKey(recipe.inputs[0], recipe.inputs[1]),
    recipe.resultId,
  ]),
);

export function findAlchemyResult(cropIdA, cropIdB) {
  if (!cropIdA || !cropIdB) return null;
  return RECIPE_BY_KEY.get(recipeKey(cropIdA, cropIdB)) ?? null;
}

const RECIPE_BY_RESULT = new Map(
  ALCHEMY_RECIPES.map((recipe) => [recipe.resultId, recipe]),
);

export function isAlchemyResultId(resultId) {
  return RECIPE_BY_RESULT.has(resultId);
}

export function getAlchemyRecipeByResultId(resultId) {
  return RECIPE_BY_RESULT.get(resultId) ?? null;
}
