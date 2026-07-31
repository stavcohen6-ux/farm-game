// Order-independent alchemy recipes. Inputs are normalized as sorted ids.
export const ALCHEMY_RECIPES = [
  { inputs: ['wheat', 'turnip'], resultId: 'root_loaf' },
  { inputs: ['blueberry', 'wheat'], resultId: 'forest_bread' },
  { inputs: ['moonflower', 'wheat'], resultId: 'moonlit_loaf' },
  { inputs: ['golden_pumpkin', 'wheat'], resultId: 'golden_loaf' },
  { inputs: ['sunfruit', 'wheat'], resultId: 'sunbread' },
  { inputs: ['blueberry', 'turnip'], resultId: 'wildroot' },
  { inputs: ['moonflower', 'turnip'], resultId: 'moonroot' },
  { inputs: ['golden_pumpkin', 'turnip'], resultId: 'golden_root' },
  { inputs: ['sunfruit', 'turnip'], resultId: 'sunroot' },
  { inputs: ['blueberry', 'moonflower'], resultId: 'moonberry' },
  { inputs: ['blueberry', 'golden_pumpkin'], resultId: 'enchanted_jam' },
  { inputs: ['blueberry', 'sunfruit'], resultId: 'sunberry' },
  { inputs: ['golden_pumpkin', 'moonflower'], resultId: 'golden_bloom' },
  { inputs: ['moonflower', 'sunfruit'], resultId: 'solar_bloom' },
  { inputs: ['golden_pumpkin', 'sunfruit'], resultId: 'solar_gourd' },
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
