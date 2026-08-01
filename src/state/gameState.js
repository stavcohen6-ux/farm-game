import {
  CROPS,
  getCrop,
  getGrowthMs,
  getWaterTimeSavedMs,
  getCritterShrineProgress,
  getExpiresAt,
  getMaxStack,
  isDecayDisabled,
} from '../data/crops.js';
import {
  findAlchemyResult,
  getAlchemyRecipeByResultId,
  isAlchemyResultId,
} from '../data/alchemyRecipes.js';
import {
  getShrine,
  getShrineMaxTier,
  SHRINES,
  SHRINE_EPILOGUE_DELAY_MS,
  SHRINE_EPILOGUE_LINE,
  tierAcceptsCrop,
} from '../data/shrines.js';
import { DRAGON_TEMPLE } from '../data/dragonTemple.js';
import {
  DESK_VISITOR,
  getDeskVisitorDelayMs,
  getGiftRarityWeight,
} from '../data/deskVisitor.js';
import {
  PLOT_NAPPER,
  getPlotNapperDelayMs,
  getPlotNapMs,
} from '../data/plotNapper.js';
import {
  BOARD_COLS,
  BOARD_ROWS,
  FARM_PLOTS,
  TOTAL_FARM_PLOTS,
  getLockOrderedPlotIds,
  getPlotLayout,
  getUnlockOrderedPlotIds,
} from '../data/farmLayout.js';

export const GRID_ROWS = BOARD_ROWS;
export const GRID_COLS = BOARD_COLS;
export const TOTAL_PLOTS = TOTAL_FARM_PLOTS;
export const UNLOCKED_PLOTS_AT_START = FARM_PLOTS.filter(
  (plot) => plot.unlockTier === 0,
).length;
export const STARTING_RESEARCH_LEVEL = 1;
// Fixed inventory slot row; also the max number of visual stacks.
export const INVENTORY_SLOT_COUNT = 6;

export function createInitialShrines() {
  return {
    frog: { tier: 0, progress: 0, dragonBonusOfferings: 0 },
    monkey: { tier: 0, progress: 0, dragonBonusOfferings: 0 },
    fox: { tier: 0, progress: 0, dragonBonusOfferings: 0 },
    tiger: { tier: 0, progress: 0, dragonBonusOfferings: 0 },
  };
}

/** Remaining Dragon-bonus offerings on a shrine (0 when none). */
export function getDragonBonusOfferings(state, shrineId) {
  const progress = state.shrines?.[shrineId];
  if (!progress) return 0;
  const remaining = progress.dragonBonusOfferings;
  return typeof remaining === 'number' && remaining > 0 ? remaining : 0;
}

export function createInitialAlchemy() {
  return {
    slotA: null,
    slotB: null,
    resultId: null,
  };
}

export function createInitialDragonTemple() {
  return {
    active: false,
    demand: [], // cropId[] length slotCount while active; empty when resting
    wrath: 0,
    slots: Array(DRAGON_TEMPLE.slotCount).fill(null),
    // null | 'success' | 'failed' — preserved on close; not shown on tile
    lastResult: null,
    burning: false,
    pendingClose: null, // null | 'success' | 'failed'
    // Win shrine reward not yet applied (survives reload / mid-animation refresh)
    pendingReward: false,
    // Hidden chance (0–1) that the next shrine offering starts the temple event
    triggerChance: DRAGON_TEMPLE.defaultTriggerChance,
  };
}

// The single game state object. All mutations must go through the functions
// below — nothing else should modify plots/inventory/shrines directly.
export function createInitialState() {
  const plots = FARM_PLOTS.map((layout) => ({
    id: layout.id,
    locked: layout.unlockTier > 0,
    crop: null,
    flowered: false,
  }));
  return {
    saveVersion: 2,
    plots,
    inventory: {},
    // Harvest grants awaiting fly-to-inventory; unused while crops stay on plots
    pendingHarvests: [],
    researchLevel: STARTING_RESEARCH_LEVEL,
    shrines: createInitialShrines(),
    alchemy: createInitialAlchemy(),
    dragonTemple: createInitialDragonTemple(),
    // Crop ids the player has ever seen ready on a plot (sticky until Reset)
    discoveredCropIds: [],
    // Alchemy result ids successfully mixed at least once (sticky until Reset)
    discoveredAlchemyResultIds: [],
    // Desk fireflies (parked — desk removed; keep shape for later)
    deskVisitors: [],
    deskGiftLand: null, // null | { slotIndex, cropId }
    // Sleeping tanuki on one empty plot: null | { id, kind, appearAt, status, plotId?, wakeAt? }
    plotNapper: null,
    // Player-facing message for the info-band text panel; null = empty
    gameText: null,
    // Shrine completion epilogue: shown only after a successful display
    shrineEpilogueShown: false,
    // Epoch ms when the epilogue may fire; null when not armed
    shrineEpilogueDueAt: null,
  };
}

// Replace the contents of an existing state object with a fresh farm.
export function resetState(state) {
  const fresh = createInitialState();
  state.saveVersion = fresh.saveVersion;
  state.plots = fresh.plots;
  state.inventory = fresh.inventory;
  state.pendingHarvests = fresh.pendingHarvests;
  state.researchLevel = fresh.researchLevel;
  state.shrines = fresh.shrines;
  state.alchemy = fresh.alchemy;
  state.dragonTemple = fresh.dragonTemple;
  state.discoveredCropIds = fresh.discoveredCropIds;
  state.discoveredAlchemyResultIds = fresh.discoveredAlchemyResultIds;
  state.deskVisitors = fresh.deskVisitors;
  state.deskGiftLand = fresh.deskGiftLand;
  state.plotNapper = fresh.plotNapper;
  state.gameText = fresh.gameText;
  state.shrineEpilogueShown = fresh.shrineEpilogueShown;
  state.shrineEpilogueDueAt = fresh.shrineEpilogueDueAt;
}

/** Set the top text panel message. Empty/whitespace clears to null. */
export function setGameText(state, text) {
  if (typeof text !== 'string') {
    state.gameText = null;
    return;
  }
  const trimmed = text.trim();
  state.gameText = trimmed.length > 0 ? trimmed : null;
}

/** Clear the top text panel message. */
export function clearGameText(state) {
  state.gameText = null;
}

export function isCropUnlocked(state, crop) {
  return Boolean(crop) && crop.unlockResearchLevel <= state.researchLevel;
}

// True if the dragon may demand this crop at the current research level:
// plantables must be unlocked; alchemy products need both inputs unlocked.
export function isCropDemandable(state, cropId) {
  const crop = getCrop(cropId);
  if (!crop) return false;
  if (crop.plantable) return isCropUnlocked(state, crop);

  const recipe = getAlchemyRecipeByResultId(cropId);
  if (!recipe) return false;
  return recipe.inputs.every((inputId) => {
    const input = getCrop(inputId);
    return input?.plantable && isCropUnlocked(state, input);
  });
}

export function isShrineMaxed(state, shrineId) {
  const progress = state.shrines?.[shrineId];
  if (!progress) return true;
  return progress.tier >= getShrineMaxTier(shrineId);
}

export function areAllShrinesMaxed(state) {
  return SHRINES.every((shrine) => isShrineMaxed(state, shrine.id));
}

/** Arm delayed epilogue when all shrines just became maxed (once until shown). */
function maybeArmShrineEpilogue(state, now = Date.now()) {
  if (state.shrineEpilogueShown) return;
  if (state.shrineEpilogueDueAt != null) return;
  if (!areAllShrinesMaxed(state)) return;
  state.shrineEpilogueDueAt = now + SHRINE_EPILOGUE_DELAY_MS;
}

/**
 * Fire or cancel a pending shrine epilogue when due.
 * Returns true if state changed (caller should save / refresh game text).
 */
export function maybeShowShrineEpilogue(state, now = Date.now()) {
  const dueAt = state.shrineEpilogueDueAt;
  if (dueAt == null) return false;

  if (typeof dueAt !== 'number' || !Number.isFinite(dueAt)) {
    state.shrineEpilogueDueAt = null;
    return true;
  }

  if (state.shrineEpilogueShown) {
    state.shrineEpilogueDueAt = null;
    return true;
  }

  if (now < dueAt) return false;

  state.shrineEpilogueDueAt = null;
  if (!areAllShrinesMaxed(state)) {
    return true;
  }

  setGameText(state, SHRINE_EPILOGUE_LINE);
  state.shrineEpilogueShown = true;
  return true;
}

/** Drop a pending epilogue wait if shrines are no longer all maxed. */
function clearShrineEpilogueDueIfNeeded(state) {
  if (state.shrineEpilogueDueAt == null) return;
  if (areAllShrinesMaxed(state)) return;
  state.shrineEpilogueDueAt = null;
}

// Active unfinished tier def, or null when missing / maxed.
export function getActiveShrineTier(state, shrineId) {
  if (isShrineMaxed(state, shrineId)) return null;
  const shrine = getShrine(shrineId);
  const progress = state.shrines?.[shrineId];
  if (!shrine || !progress) return null;
  return shrine.tiers[progress.tier] ?? null;
}

// Non-maxed shrine whose active allowlist has at least one obtainable crop.
export function isShrineFeedable(state, shrineId) {
  const tier = getActiveShrineTier(state, shrineId);
  if (!tier) return false;
  return (tier.acceptedCropIds ?? []).some((cropId) =>
    isCropDemandable(state, cropId),
  );
}

function formatAcceptedCropNames(tier) {
  const names = (tier?.acceptedCropIds ?? [])
    .map((id) => getCrop(id)?.name)
    .filter(Boolean);
  if (names.length === 0) return 'a different crop';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} or ${names[1]}`;
  return `${names.slice(0, -1).join(', ')}, or ${names[names.length - 1]}`;
}

function shrineShortName(shrine) {
  return shrine.name.replace(/\s+Shrine$/, '');
}

// Active blessing for a completed tier (tier 1 → tiers[0]). Null at tier 0.
export function getActiveBlessing(state, shrineId) {
  const progress = state.shrines?.[shrineId];
  const shrine = getShrine(shrineId);
  if (!progress || !shrine || progress.tier <= 0) return null;
  return shrine.tiers[progress.tier - 1] ?? null;
}

export function getFrogGrowthMs(crop, state) {
  const baseMs = getGrowthMs(crop);
  const blessing = getActiveBlessing(state, 'frog');
  const bonus = blessing?.growthSpeedBonus ?? 0;
  return baseMs / (1 + bonus);
}

function getPlantedGrowthMs(cell) {
  if (typeof cell.crop.growthMs === 'number') return cell.crop.growthMs;
  const crop = getCrop(cell.crop.cropId);
  return crop ? getGrowthMs(crop) : 0;
}

export function isReady(cell, now) {
  if (!cell.crop) return false;
  const crop = getCrop(cell.crop.cropId);
  if (!crop) return false;
  return now - cell.crop.plantedAt >= getPlantedGrowthMs(cell);
}

/** Orthogonal 4-neighbor adjacency on the farm grid (no diagonals). */
export function areAdjacentPlots(plotIdA, plotIdB) {
  if (
    typeof plotIdA !== 'number' ||
    typeof plotIdB !== 'number' ||
    plotIdA === plotIdB
  ) {
    return false;
  }
  const layoutA = getPlotLayout(plotIdA);
  const layoutB = getPlotLayout(plotIdB);
  if (!layoutA || !layoutB) return false;
  const rowA = layoutA.row;
  const colA = layoutA.col;
  const rowB = layoutB.row;
  const colB = layoutB.col;
  return Math.abs(rowA - rowB) + Math.abs(colA - colB) === 1;
}

/**
 * Idle mix-hint edges owned by this plot (east/south only so each shared
 * seam is drawn once). Empty unless this plot and that neighbor are both
 * ready and match an alchemy recipe.
 */
export function getMixBridgeSides(state, plotId, now = Date.now()) {
  const plot = state.plots.find((p) => p.id === plotId);
  if (!plot?.crop || plot.locked || !isReady(plot, now)) return [];
  if (isPlotNapped(state, plotId)) return [];

  const layout = getPlotLayout(plotId);
  if (!layout) return [];

  const sides = [];
  for (const [side, dRow, dCol] of [
    ['e', 0, 1],
    ['s', 1, 0],
  ]) {
    const neighborLayout = FARM_PLOTS.find(
      (p) => p.row === layout.row + dRow && p.col === layout.col + dCol,
    );
    if (!neighborLayout) continue;
    const neighbor = state.plots.find((p) => p.id === neighborLayout.id);
    if (!neighbor?.crop || neighbor.locked || !isReady(neighbor, now)) continue;
    if (isPlotNapped(state, neighbor.id)) continue;
    if (!findAlchemyResult(plot.crop.cropId, neighbor.crop.cropId)) continue;
    sides.push(side);
  }
  return sides;
}

/**
 * Remove a ready crop from a plot. Does not touch inventory.
 * Returns `{ cropId, plotId }` or null.
 */
export function takeReadyCropFromPlot(state, plotId, now = Date.now()) {
  const plot = state.plots.find((p) => p.id === plotId);
  if (!plot?.crop || !isReady(plot, now)) return null;
  const { cropId } = plot.crop;
  if (!getCrop(cropId)) {
    plot.crop = null;
    plot.flowered = false;
    return null;
  }
  plot.crop = null;
  plot.flowered = false;
  return { cropId, plotId };
}

/**
 * Clear any crop from a plot (growing or ready). Free discard — no inventory,
 * wrath, shrine/temple progress, or discovery changes.
 */
export function uprootCrop(state, plotId) {
  const plot = state.plots.find((p) => p.id === plotId);
  if (!plot?.crop || plot.locked) return false;
  if (isPlotNapped(state, plotId)) return false;
  plot.crop = null;
  plot.flowered = false;
  return true;
}

/** Place a crop on a plot as already-ready (alchemy result / temple return). */
export function placeReadyCropOnPlot(state, plotId, cropId, now = Date.now()) {
  const plot = state.plots.find((p) => p.id === plotId);
  if (!plot || plot.locked || plot.crop) return false;
  if (isPlotNapped(state, plotId)) return false;
  if (!getCrop(cropId)) return false;

  plot.crop = {
    cropId,
    plantedAt: now - 1,
    growthMs: 1,
    watered: true,
    waterRequestAt: null,
    critterWelcomed: true,
    critterVisitAt: null,
  };
  plot.flowered = false;
  markCropDiscovered(state, cropId);
  return true;
}

function findEmptyUnlockedPlotId(state) {
  for (const plot of state.plots) {
    if (plot.locked || plot.crop) continue;
    if (isPlotNapped(state, plot.id)) continue;
    return plot.id;
  }
  return null;
}

/** Return a held temple crop onto an empty farm plot (desk-less sink). */
function returnCropToFarm(state, cropId) {
  if (!getCrop(cropId)) return false;
  const plotId = findEmptyUnlockedPlotId(state);
  if (plotId == null) return false;
  return placeReadyCropOnPlot(state, plotId, cropId);
}

/**
 * Mix two adjacent ready crops in place. Result sits on `toPlotId`;
 * `fromPlotId` is cleared. Returns `{ resultId, fromPlotId, toPlotId }` or null.
 */
export function mixAdjacentReadyPlots(state, fromPlotId, toPlotId, now = Date.now()) {
  if (!areAdjacentPlots(fromPlotId, toPlotId)) return null;

  const from = state.plots.find((p) => p.id === fromPlotId);
  const to = state.plots.find((p) => p.id === toPlotId);
  if (!from?.crop || !to?.crop) return null;
  if (!isReady(from, now) || !isReady(to, now)) return null;

  const resultId = findAlchemyResult(from.crop.cropId, to.crop.cropId);
  if (!resultId) return null;

  from.crop = null;
  from.flowered = false;
  to.crop = null;
  to.flowered = false;
  placeReadyCropOnPlot(state, toPlotId, resultId, now);
  markAlchemyRecipeDiscovered(state, resultId);
  return { resultId, fromPlotId, toPlotId };
}

// True when a growing plant is currently asking for optional water.
export function needsWater(cell, now = Date.now()) {
  if (!cell?.crop) return false;
  if (cell.crop.watered) return false;
  if (typeof cell.crop.waterRequestAt !== 'number') return false;
  if (isReady(cell, now)) return false;
  return now >= cell.crop.waterRequestAt;
}

// True when a growing plant has a waiting critter visit.
export function hasCritterVisit(cell, now = Date.now()) {
  if (!cell?.crop) return false;
  if (cell.crop.critterWelcomed) return false;
  if (typeof cell.crop.critterVisitAt !== 'number') return false;
  if (isReady(cell, now)) return false;
  return now >= cell.crop.critterVisitAt;
}

function rollProgressWindow(minRaw, maxRaw) {
  const min = Math.min(1, Math.max(0, minRaw ?? 0));
  const max = Math.min(1, Math.max(0, maxRaw ?? 1));
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  return lo + Math.random() * (hi - lo);
}

function rollWaterRequest(crop, plantedAt, growthMs) {
  const chance = crop.waterRequestChance ?? 0;
  if (!(chance > 0) || Math.random() >= chance) {
    return { watered: false, waterRequestAt: null };
  }
  const t = rollProgressWindow(
    crop.waterRequestMinProgress,
    crop.waterRequestMaxProgress,
  );
  return {
    watered: false,
    waterRequestAt: plantedAt + growthMs * t,
  };
}

function rollCritterVisit(crop, plantedAt, growthMs) {
  const chance = crop.critterVisitChance ?? 0;
  if (!(chance > 0) || Math.random() >= chance) {
    return { critterWelcomed: false, critterVisitAt: null };
  }
  return forceCritterVisit(crop, plantedAt, growthMs);
}

// Always schedule a butterfly visit (flowered plots; ignores chance).
function forceCritterVisit(crop, plantedAt, growthMs) {
  const t = rollProgressWindow(
    crop.critterVisitMinProgress,
    crop.critterVisitMaxProgress,
  );
  return {
    critterWelcomed: false,
    critterVisitAt: plantedAt + growthMs * t,
  };
}

// Flowering is parked (no inventory). Keep for a later redesign.
export function flowerPlot(_state, _plotId, _cropId) {
  return false;
}

export function plantCrop(state, plotId, cropId) {
  const plot = state.plots.find((p) => p.id === plotId);
  if (!plot || plot.locked || plot.crop) return;
  if (isPlotNapped(state, plotId)) return;

  const crop = getCrop(cropId);
  if (!crop?.plantable || !isCropUnlocked(state, crop)) return;

  const plantedAt = Date.now();
  const growthMs = getFrogGrowthMs(crop, state);

  let water;
  let critter;
  if (plot.flowered) {
    // Flowered: guaranteed butterfly, no water on this plant.
    water = { watered: false, waterRequestAt: null };
    critter = forceCritterVisit(crop, plantedAt, growthMs);
  } else {
    // Water first; butterfly only if water missed (never both on one plant).
    water = rollWaterRequest(crop, plantedAt, growthMs);
    critter =
      water.waterRequestAt != null
        ? { critterWelcomed: false, critterVisitAt: null }
        : rollCritterVisit(crop, plantedAt, growthMs);
  }

  plot.crop = {
    cropId,
    plantedAt,
    growthMs,
    watered: water.watered,
    waterRequestAt: water.waterRequestAt,
    critterWelcomed: critter.critterWelcomed,
    critterVisitAt: critter.critterVisitAt,
  };

  addDragonTempleWrath(state, DRAGON_TEMPLE.wrathPerPlant);
}

// Optional water: shortens remaining growth by crop.waterTimeSavedSeconds.
// Returns true if watered. Ignoring needs-water has no penalty.
export function waterPlot(state, plotId, now = Date.now()) {
  const plot = state.plots.find((p) => p.id === plotId);
  if (!plot || !needsWater(plot, now)) return false;

  const crop = getCrop(plot.crop.cropId);
  if (!crop) return false;

  const elapsed = Math.max(0, now - plot.crop.plantedAt);
  const growthMs = getPlantedGrowthMs(plot);
  const remaining = Math.max(0, growthMs - elapsed);
  const savedMs = Math.min(getWaterTimeSavedMs(crop), remaining);
  plot.crop.growthMs = elapsed + (remaining - savedMs);
  plot.crop.watered = true;
  return true;
}

// Effective devotion still on the board (burns lower this automatically).
export function getShrineDevotion(state, shrineId) {
  const shrine = getShrine(shrineId);
  const progress = state.shrines?.[shrineId];
  if (!shrine || !progress) return 0;

  let devotion = typeof progress.progress === 'number' ? progress.progress : 0;
  const completed = Math.max(0, Math.min(progress.tier, shrine.tiers.length));
  for (let i = 0; i < completed; i++) {
    devotion += shrine.tiers[i]?.progressRequired ?? 0;
  }
  return devotion;
}

function getCurrentBarFraction(state, shrineId) {
  if (isShrineMaxed(state, shrineId)) return 1;
  const shrine = getShrine(shrineId);
  const progress = state.shrines?.[shrineId];
  const next = shrine?.tiers[progress?.tier];
  if (!next || !(next.progressRequired > 0)) return 0;
  return Math.max(0, progress.progress) / next.progressRequired;
}

// Non-maxed feedable shrine with lowest devotion; ties → emptier bar, then
// SHRINES order. Critters must not assist shrines the player cannot feed yet.
export function pickNeediestShrine(state) {
  let bestId = null;
  let bestDevotion = Infinity;
  let bestFrac = Infinity;

  for (const shrine of SHRINES) {
    const id = shrine.id;
    if (!isShrineFeedable(state, id)) continue;

    const devotion = getShrineDevotion(state, id);
    const frac = getCurrentBarFraction(state, id);
    if (
      bestId === null ||
      devotion < bestDevotion ||
      (devotion === bestDevotion && frac < bestFrac)
    ) {
      bestId = id;
      bestDevotion = devotion;
      bestFrac = frac;
    }
  }

  return bestId;
}

// Welcome a waiting critter: safe shrine progress, never wakes the Dragon.
// Returns `{ shrineId, unlockedPlotIds, tiersGained }` (shrineId null if none
// feedable), or null if there was no visit to welcome.
export function welcomeCritter(state, plotId, now = Date.now()) {
  const plot = state.plots.find((p) => p.id === plotId);
  if (!plot || !hasCritterVisit(plot, now)) return null;

  plot.crop.critterWelcomed = true;

  const shrineId = pickNeediestShrine(state);
  if (!shrineId) {
    return { shrineId: null, unlockedPlotIds: [], tiersGained: 0 };
  }

  const crop = getCrop(plot.crop.cropId);
  const amount = getCritterShrineProgress(crop);
  const result =
    amount > 0 ? addShrineProgress(state, shrineId, amount) : false;

  if (!result) {
    return { shrineId: null, unlockedPlotIds: [], tiersGained: 0 };
  }

  return {
    shrineId,
    unlockedPlotIds: result.unlockedPlotIds ?? [],
    tiersGained: result.tiersGained ?? 0,
  };
}

// Harvests a ready plot: clears the crop and enqueues pending inventory grants.
// Inventory is updated when each grant is applied (on fly land, or flush on load).
// Returns `{ cropId, plotId, bonus, pendingIds }` on success, or null on failure.
export function harvestPlot(state, plotId) {
  const plot = state.plots.find((p) => p.id === plotId);
  if (!plot || !plot.crop || !isReady(plot, Date.now())) return null;

  const crop = getCrop(plot.crop.cropId);
  if (!crop) {
    plot.crop = null;
    plot.flowered = false;
    return null;
  }

  const { cropId } = plot.crop;

  const tigerBlessing = getActiveBlessing(state, 'tiger');
  const chance = tigerBlessing?.bonusHarvestChance ?? 0;
  const bonus = chance > 0 && Math.random() < chance;
  const grantAmount = crop.harvestAmount + (bonus ? 1 : 0);
  if (!canAcceptCrop(state, cropId, grantAmount)) return null;

  plot.crop = null;
  plot.flowered = false;

  const pendingIds = [enqueuePendingHarvest(state, cropId, crop.harvestAmount)];
  if (bonus) {
    pendingIds.push(enqueuePendingHarvest(state, cropId, 1));
  }

  maybeSchedulePlotNapperFromHarvest(state);

  return { cropId, plotId, bonus, pendingIds };
}

// Applies one pending harvest grant into inventory. Returns cropId, or null.
export function applyPendingHarvest(state, pendingId) {
  tickCropDecay(state);
  const list = state.pendingHarvests;
  if (!Array.isArray(list)) return null;

  const index = list.findIndex((entry) => entry.id === pendingId);
  if (index < 0) return null;

  const entry = list[index];
  list.splice(index, 1);

  const now = Date.now();
  const crop = getCrop(entry.cropId);
  if (
    !isDecayDisabled(crop) &&
    typeof entry.expiresAt === 'number' &&
    entry.expiresAt <= now
  ) {
    return null;
  }

  const expiresAt =
    typeof entry.expiresAt === 'number'
      ? entry.expiresAt
      : getExpiresAt(crop, now);
  // Force-add: capacity was reserved when the harvest was enqueued.
  forceAddToInventory(state, entry.cropId, entry.amount, expiresAt);
  return entry.cropId;
}

// Applies all pending harvests (e.g. on load). Returns true if any were applied.
export function flushPendingHarvests(state) {
  const list = state.pendingHarvests;
  if (!Array.isArray(list) || list.length === 0) return false;

  const now = Date.now();
  for (const entry of list) {
    const crop = getCrop(entry.cropId);
    if (
      !isDecayDisabled(crop) &&
      typeof entry.expiresAt === 'number' &&
      entry.expiresAt <= now
    ) {
      continue;
    }
    const expiresAt =
      typeof entry.expiresAt === 'number'
        ? entry.expiresAt
        : getExpiresAt(crop, now);
    forceAddToInventory(state, entry.cropId, entry.amount, expiresAt);
  }
  state.pendingHarvests = [];
  return true;
}

function createPendingHarvestId() {
  return `ph-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function enqueuePendingHarvest(state, cropId, amount) {
  if (!Array.isArray(state.pendingHarvests)) {
    state.pendingHarvests = [];
  }
  const crop = getCrop(cropId);
  const id = createPendingHarvestId();
  state.pendingHarvests.push({
    id,
    cropId,
    amount,
    expiresAt: getExpiresAt(crop),
  });
  return id;
}

// Held crop in an alchemy/temple slot: `{ cropId, expiresAt }` (or legacy string).
export function getHeldCropId(held) {
  if (!held) return null;
  if (typeof held === 'string') return held;
  return typeof held.cropId === 'string' ? held.cropId : null;
}

export function getHeldExpiresAt(held) {
  if (!held || typeof held !== 'object') return null;
  return typeof held.expiresAt === 'number' ? held.expiresAt : null;
}

export function getInventoryCount(state, cropId) {
  const batches = state.inventory[cropId];
  if (!Array.isArray(batches)) return 0;
  let total = 0;
  for (const batch of batches) {
    if (typeof batch?.amount === 'number' && batch.amount > 0) {
      total += batch.amount;
    }
  }
  return total;
}

// Visual inventory stacks for one crop (FIFO fill up to maxStack).
// Each entry: `{ cropId, count, expiresAt }`.
export function getInventoryStacksForCrop(state, cropId) {
  const crop = getCrop(cropId);
  if (!crop) return [];
  const maxStack = getMaxStack(crop);
  const batches = state.inventory[cropId];
  if (!Array.isArray(batches) || batches.length === 0) return [];

  const stacks = [];
  let stackCount = 0;
  let stackExpiresAt = null;

  function pushStack() {
    if (stackCount <= 0) return;
    stacks.push({ cropId, count: stackCount, expiresAt: stackExpiresAt });
    stackCount = 0;
    stackExpiresAt = null;
  }

  for (const batch of batches) {
    let remaining = typeof batch?.amount === 'number' ? batch.amount : 0;
    const batchExpires =
      typeof batch?.expiresAt === 'number' ? batch.expiresAt : null;
    while (remaining > 0) {
      if (stackCount === 0) {
        stackExpiresAt = batchExpires;
      }
      const space = maxStack - stackCount;
      const take = Math.min(space, remaining);
      stackCount += take;
      remaining -= take;
      if (stackCount >= maxStack) {
        pushStack();
      }
    }
  }
  pushStack();
  return stacks;
}

// All inventory stack tiles in crop-id order (FIFO stacks within each crop).
export function getInventoryStacks(state) {
  const stacks = [];
  for (const cropId of Object.keys(state.inventory ?? {})) {
    if (!getCrop(cropId)) continue;
    stacks.push(...getInventoryStacksForCrop(state, cropId));
  }
  return stacks;
}

function batchSortKey(expiresAt) {
  return typeof expiresAt === 'number' ? expiresAt : Infinity;
}

function tilesForCount(count, maxStack) {
  if (count <= 0 || maxStack <= 0) return 0;
  return Math.ceil(count / maxStack);
}

// Inventory counts plus in-flight pending harvest amounts, per cropId.
function getReservedCropCounts(state) {
  const totals = {};
  for (const cropId of Object.keys(state.inventory ?? {})) {
    const count = getInventoryCount(state, cropId);
    if (count > 0) totals[cropId] = count;
  }
  for (const entry of state.pendingHarvests ?? []) {
    if (!entry?.cropId || !(entry.amount > 0)) continue;
    totals[entry.cropId] = (totals[entry.cropId] || 0) + entry.amount;
  }
  return totals;
}

function tileCountForTotals(totals) {
  let tiles = 0;
  for (const [cropId, count] of Object.entries(totals)) {
    tiles += tilesForCount(count, getMaxStack(getCrop(cropId)));
  }
  return tiles;
}

function forceAddToInventory(state, cropId, amount, expiresAt) {
  if (!state.inventory[cropId]) {
    state.inventory[cropId] = [];
  }
  const batches = state.inventory[cropId];
  const existing = batches.find((batch) => batch.expiresAt === expiresAt);
  if (existing) {
    existing.amount += amount;
  } else {
    batches.push({ amount, expiresAt });
    batches.sort((a, b) => batchSortKey(a.expiresAt) - batchSortKey(b.expiresAt));
  }
  markCropDiscovered(state, cropId);
}

// Sticky discovery: once seen (ready on a plot, or formerly inventory), stays until Reset.
export function markCropDiscovered(state, cropId) {
  if (!getCrop(cropId)) return;
  if (!Array.isArray(state.discoveredCropIds)) {
    state.discoveredCropIds = [];
  }
  if (!state.discoveredCropIds.includes(cropId)) {
    state.discoveredCropIds.push(cropId);
  }
}

/** Mark plantables/alchemy products that are ready on plots as discovered. */
export function markReadyCropsDiscovered(state, now = Date.now()) {
  let changed = false;
  for (const plot of state.plots) {
    if (!plot?.crop || !isReady(plot, now)) continue;
    const before = state.discoveredCropIds?.length ?? 0;
    markCropDiscovered(state, plot.crop.cropId);
    if ((state.discoveredCropIds?.length ?? 0) > before) changed = true;
  }
  return changed;
}

// Sticky alchemy recipe discovery: once mixed, stays until full Reset.
export function markAlchemyRecipeDiscovered(state, resultId) {
  if (!isAlchemyResultId(resultId)) return;
  if (!Array.isArray(state.discoveredAlchemyResultIds)) {
    state.discoveredAlchemyResultIds = [];
  }
  if (!state.discoveredAlchemyResultIds.includes(resultId)) {
    state.discoveredAlchemyResultIds.push(resultId);
  }
}

// Crop ids currently sitting in inventory, board slots, or on plots (for save migration).
export function collectHeldCropIds(state) {
  const ids = new Set();
  for (const cropId of Object.keys(state.inventory || {})) {
    if (getInventoryCount(state, cropId) > 0) ids.add(cropId);
  }
  for (const slot of ['slotA', 'slotB']) {
    const id = getHeldCropId(state.alchemy?.[slot]);
    if (id) ids.add(id);
  }
  if (Array.isArray(state.dragonTemple?.slots)) {
    for (const slot of state.dragonTemple.slots) {
      const id = getHeldCropId(slot);
      if (id) ids.add(id);
    }
  }
  for (const plot of state.plots || []) {
    const cropId = plot?.crop?.cropId;
    if (cropId) ids.add(cropId);
  }
  return [...ids];
}

function addToInventory(state, cropId, amount = 1, expiresAt) {
  if (!canAcceptCrop(state, cropId, amount)) {
    return false;
  }
  const crop = getCrop(cropId);
  const expiry =
    typeof expiresAt === 'number' ? expiresAt : getExpiresAt(crop);
  forceAddToInventory(state, cropId, amount, expiry);
  return true;
}

// Removes one unit (oldest batch). Returns `{ cropId, expiresAt }` or null.
function takeFromInventory(state, cropId) {
  const batches = state.inventory[cropId];
  if (!Array.isArray(batches) || batches.length === 0) return null;

  const batch = batches[0];
  const expiresAt = batch.expiresAt;
  batch.amount -= 1;
  if (batch.amount <= 0) {
    batches.shift();
  }
  if (batches.length === 0) {
    delete state.inventory[cropId];
  }
  return { cropId, expiresAt };
}

function recordSpoil(spoiled, cropId, amount) {
  if (!cropId || amount <= 0) return;
  spoiled[cropId] = (spoiled[cropId] || 0) + amount;
}

function cropCanSpoil(cropId) {
  return !isDecayDisabled(getCrop(cropId));
}

// Drop expired inventory batches, slot crops, and pending harvests.
// Returns `{ [cropId]: amount }` for crops that spoiled (may be empty).
export function tickCropDecay(state, now = Date.now()) {
  const spoiled = {};

  for (const cropId of Object.keys(state.inventory ?? {})) {
    const batches = state.inventory[cropId];
    if (!Array.isArray(batches)) {
      delete state.inventory[cropId];
      continue;
    }
    const canSpoil = cropCanSpoil(cropId);
    const kept = [];
    for (const batch of batches) {
      if (
        canSpoil &&
        typeof batch?.expiresAt === 'number' &&
        batch.expiresAt <= now &&
        typeof batch.amount === 'number'
      ) {
        recordSpoil(spoiled, cropId, batch.amount);
      } else if (typeof batch?.amount === 'number' && batch.amount > 0) {
        kept.push(batch);
      }
    }
    if (kept.length === 0) {
      delete state.inventory[cropId];
    } else {
      state.inventory[cropId] = kept;
    }
  }

  if (state.alchemy) {
    for (const slot of ['slotA', 'slotB']) {
      const held = state.alchemy[slot];
      const cropId = getHeldCropId(held);
      const expiresAt = getHeldExpiresAt(held);
      if (
        cropId &&
        cropCanSpoil(cropId) &&
        typeof expiresAt === 'number' &&
        expiresAt <= now
      ) {
        recordSpoil(spoiled, cropId, 1);
        state.alchemy[slot] = null;
      }
    }
  }

  if (Array.isArray(state.dragonTemple?.slots) && !state.dragonTemple.burning) {
    for (let i = 0; i < state.dragonTemple.slots.length; i++) {
      const held = state.dragonTemple.slots[i];
      const cropId = getHeldCropId(held);
      const expiresAt = getHeldExpiresAt(held);
      if (
        cropId &&
        cropCanSpoil(cropId) &&
        typeof expiresAt === 'number' &&
        expiresAt <= now
      ) {
        recordSpoil(spoiled, cropId, 1);
        state.dragonTemple.slots[i] = null;
      }
    }
  }

  if (Array.isArray(state.pendingHarvests)) {
    const kept = [];
    for (const entry of state.pendingHarvests) {
      if (
        cropCanSpoil(entry?.cropId) &&
        typeof entry?.expiresAt === 'number' &&
        entry.expiresAt <= now
      ) {
        recordSpoil(spoiled, entry.cropId, entry.amount);
      } else {
        kept.push(entry);
      }
    }
    state.pendingHarvests = kept;
  }

  return spoiled;
}

export function countWaitingDeskVisitors(state) {
  if (!Array.isArray(state.deskVisitors)) return 0;
  let n = 0;
  for (const visitor of state.deskVisitors) {
    if (visitor?.status === 'waiting') n += 1;
  }
  return n;
}

function getFreeInventorySlotCount(state) {
  const cropTiles = tileCountForTotals(getReservedCropCounts(state));
  return INVENTORY_SLOT_COUNT - cropTiles - countWaitingDeskVisitors(state);
}

// True if adding `amount` of cropId keeps reserved stack slots ≤ max.
// Waiting desk fireflies each reserve one shelf tile.
function canAcceptCrop(state, cropId, amount = 1) {
  if (!(amount > 0)) return false;
  const totals = getReservedCropCounts(state);
  totals[cropId] = (totals[cropId] || 0) + amount;
  return (
    tileCountForTotals(totals) + countWaitingDeskVisitors(state) <=
    INVENTORY_SLOT_COUNT
  );
}

// Unlock next fox-expanded plots in sketch tier order (2 per Fox tier).
function unlockPlots(state, count) {
  const byId = new Map(state.plots.map((plot) => [plot.id, plot]));
  const unlockedPlotIds = [];
  for (const plotId of getUnlockOrderedPlotIds()) {
    if (unlockedPlotIds.length >= count) break;
    const plot = byId.get(plotId);
    if (!plot || !plot.locked) continue;
    plot.locked = false;
    unlockedPlotIds.push(plot.id);
  }
  return unlockedPlotIds;
}

// Re-lock fox-expanded plots in reverse unlock order.
function lockPlots(state, count) {
  const byId = new Map(state.plots.map((plot) => [plot.id, plot]));
  const lockedPlotIds = [];
  for (const plotId of getLockOrderedPlotIds()) {
    if (lockedPlotIds.length >= count) break;
    const plot = byId.get(plotId);
    if (!plot || plot.locked) continue;
    plot.locked = true;
    plot.crop = null;
    plot.flowered = false;
    lockedPlotIds.push(plot.id);
  }
  if (
    state.plotNapper &&
    typeof state.plotNapper.plotId === 'number' &&
    lockedPlotIds.includes(state.plotNapper.plotId)
  ) {
    state.plotNapper = null;
  }
  return lockedPlotIds;
}

function applyTierBlessing(state, shrineId, tierIndex) {
  const shrine = getShrine(shrineId);
  const tier = shrine?.tiers[tierIndex];
  if (!tier) return [];

  if (typeof tier.researchBonus === 'number') {
    state.researchLevel = STARTING_RESEARCH_LEVEL + tier.researchBonus;
  }

  if (typeof tier.plotsToUnlock === 'number') {
    return unlockPlots(state, tier.plotsToUnlock);
  }

  return [];
}

// Adds shrine progress (same tier-up / blessing rules as offerings).
// Returns `{ unlockedPlotIds, tiersGained }` or false if the shrine is maxed /
// missing.
export function addShrineProgress(state, shrineId, amount) {
  if (isShrineMaxed(state, shrineId)) return false;
  if (typeof amount !== 'number' || amount <= 0) return false;

  const shrine = getShrine(shrineId);
  const progress = state.shrines[shrineId];
  if (!shrine || !progress) return false;

  progress.progress += amount;

  const tierBefore = progress.tier;
  const unlockedPlotIds = [];
  while (!isShrineMaxed(state, shrineId)) {
    const nextTier = shrine.tiers[progress.tier];
    if (!nextTier || progress.progress < nextTier.progressRequired) break;

    progress.progress -= nextTier.progressRequired;
    progress.tier += 1;
    unlockedPlotIds.push(
      ...applyTierBlessing(state, shrineId, progress.tier - 1),
    );
  }

  if (isShrineMaxed(state, shrineId)) {
    progress.progress = 0;
    progress.dragonBonusOfferings = 0;
  }

  const tiersGained = progress.tier - tierBefore;

  if (tiersGained > 0) {
    const tier = shrine.tiers[progress.tier - 1];
    if (tier?.tooltip) {
      setGameText(
        state,
        `${shrine.name} upgraded — ${tier.tooltip}`,
      );
    }
    maybeArmShrineEpilogue(state);
  }

  return { unlockedPlotIds, tiersGained };
}

// Prefer a random non-maxed shrine; if all are maxed, any random shrine.
export function pickTempleRewardShrine(state) {
  const ids = SHRINES.map((s) => s.id);
  const open = ids.filter((id) => !isShrineMaxed(state, id));
  const pool = open.length > 0 ? open : ids;
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

function shrineHasProgress(state, shrineId) {
  const progress = state.shrines?.[shrineId];
  if (!progress) return false;
  return progress.tier > 0 || progress.progress > 0;
}

// Random shrine among those with progress; null if none.
export function pickBurnableShrine(state) {
  const pool = SHRINES.map((s) => s.id).filter((id) =>
    shrineHasProgress(state, id),
  );
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

function shrineAnimalName(shrineId) {
  const shrine = getShrine(shrineId);
  if (!shrine?.name) return 'shrine';
  return shrine.name.replace(/ Shrine$/, '');
}

// Drop one shrine tier (or clear bar progress at tier 0) and revoke that tier's buffs.
export function burnShrine(state, shrineId) {
  const progress = state.shrines?.[shrineId];
  if (!progress) return false;

  const shrine = getShrine(shrineId);
  const tierBefore = progress.tier;

  if (progress.tier > 0) {
    progress.tier -= 1;
  }
  progress.progress = 0;
  // Dragon burn clears any remaining win-prize bonus offerings on this shrine.
  progress.dragonBonusOfferings = 0;

  if (tierBefore > 0 && shrineId === 'fox') {
    const lostTier = shrine?.tiers[tierBefore - 1];
    if (typeof lostTier?.plotsToUnlock === 'number') {
      lockPlots(state, lostTier.plotsToUnlock);
    }
  }

  if (shrineId === 'monkey') {
    if (progress.tier === 0) {
      state.researchLevel = STARTING_RESEARCH_LEVEL;
    } else {
      const activeTier = shrine?.tiers[progress.tier - 1];
      state.researchLevel =
        STARTING_RESEARCH_LEVEL + (activeTier?.researchBonus ?? 0);
    }
  }

  clearShrineEpilogueDueIfNeeded(state);
  return true;
}

const TEMPLE_LOSE_NO_BURN_LINE =
  "The Dragon's wrath fades - you got lucky.";

// Pick and burn one shrine with progress; set lose game text.
// Returns burnt shrineId, or null if none had progress.
export function applyDragonTempleLosePenalty(state) {
  const shrineId = pickBurnableShrine(state);
  if (!shrineId) {
    setGameText(state, TEMPLE_LOSE_NO_BURN_LINE);
    return null;
  }

  burnShrine(state, shrineId);
  setGameText(
    state,
    `The Dragon burnt your ${shrineAnimalName(shrineId)} shrine.`,
  );
  return shrineId;
}

function buildDragonTempleDemand(state, echoCropId) {
  const discovered = Array.isArray(state.discoveredCropIds)
    ? state.discoveredCropIds
    : [];
  let pool = discovered.filter((id) => isCropDemandable(state, id));

  if (pool.length === 0) {
    pool = CROPS.filter(
      (crop) => crop.plantable && isCropUnlocked(state, crop),
    ).map((crop) => crop.id);
  }

  const echo =
    typeof echoCropId === 'string' && getCrop(echoCropId) ? echoCropId : null;
  const effectivePool =
    pool.length > 0 ? pool : echo ? [echo] : [];

  const count = DRAGON_TEMPLE.slotCount;
  if (effectivePool.length === 0) {
    return Array(count).fill(null);
  }

  const demand = [];
  const echoIndex = echo
    ? Math.floor(Math.random() * count)
    : -1;

  for (let i = 0; i < count; i++) {
    if (i === echoIndex) {
      demand.push(echo);
    } else {
      demand.push(
        effectivePool[Math.floor(Math.random() * effectivePool.length)],
      );
    }
  }

  // Guarantee jealous echo even if random fill somehow missed (echoIndex path).
  if (echo && !demand.includes(echo)) {
    demand[0] = echo;
  }
  return demand;
}

function templeAcceptsWrath(temple) {
  return Boolean(
    temple?.active && !temple.burning && !temple.pendingClose,
  );
}

// Adds wrath while the temple is awake. Returns true if the event was lost.
export function addDragonTempleWrath(state, amount) {
  if (!state.dragonTemple) {
    state.dragonTemple = createInitialDragonTemple();
  }
  const temple = state.dragonTemple;
  if (!templeAcceptsWrath(temple)) return false;
  if (typeof amount !== 'number' || !(amount > 0)) return false;

  temple.wrath = Math.min(
    DRAGON_TEMPLE.wrathMax,
    (temple.wrath ?? 0) + amount,
  );

  if (temple.wrath < DRAGON_TEMPLE.wrathMax) return false;

  temple.lastResult = 'failed';
  applyDragonTempleLosePenalty(state);
  closeDragonTempleEvent(state);
  return true;
}

export function offerCrop(state, shrineId, cropId, sourcePlotId = null) {
  tickCropDecay(state);
  if (isShrineMaxed(state, shrineId)) return false;

  const shrine = getShrine(shrineId);
  const crop = getCrop(cropId);
  if (!shrine || !crop) return false;

  const activeTier = getActiveShrineTier(state, shrineId);
  if (!activeTier || !tierAcceptsCrop(activeTier, cropId)) {
    setGameText(
      state,
      `The ${shrineShortName(shrine)} wants ${formatAcceptedCropNames(activeTier)} right now.`,
    );
    return false;
  }

  const baseAmount = crop.shrineValues?.[shrineId];
  if (typeof baseAmount !== 'number' || baseAmount <= 0) {
    return false;
  }

  if (!state.dragonTemple) {
    state.dragonTemple = createInitialDragonTemple();
  }
  const templeWasActive = Boolean(state.dragonTemple.active);

  if (sourcePlotId != null) {
    const taken = takeReadyCropFromPlot(state, sourcePlotId);
    if (!taken || taken.cropId !== cropId) return false;
    maybeSchedulePlotNapperFromHarvest(state);
  } else if (!takeFromInventory(state, cropId)) {
    return false;
  }

  const tigerBlessing = getActiveBlessing(state, 'tiger');
  const chance = tigerBlessing?.bonusHarvestChance ?? 0;
  const bonus =
    sourcePlotId != null && chance > 0 && Math.random() < chance;

  const unlockedPlotIds = [];
  let tiersGained = 0;
  const first = applyOfferingProgress(state, shrineId, cropId, baseAmount);
  if (first) {
    unlockedPlotIds.push(...first.unlockedPlotIds);
    tiersGained += first.tiersGained ?? 0;
  }

  if (bonus && !isShrineMaxed(state, shrineId)) {
    const second = applyOfferingProgress(state, shrineId, cropId, baseAmount);
    if (second) {
      unlockedPlotIds.push(...second.unlockedPlotIds);
      tiersGained += second.tiersGained ?? 0;
    }
  }

  if (templeWasActive) {
    addDragonTempleWrath(state, DRAGON_TEMPLE.wrathPerShrineOffer);
  } else {
    maybeTriggerDragonTempleFromOffering(state, shrineId, cropId);
  }
  maybeScheduleDeskVisitorFromOffering(state);
  return {
    unlockedPlotIds,
    tiersGained,
    bonus,
    cropId,
    plotId: sourcePlotId,
  };
}

/** Apply one offering's progress (and one Dragon-bonus use if any). */
function applyOfferingProgress(state, shrineId, cropId, baseAmount) {
  const progress = state.shrines[shrineId];
  const bonusUses = getDragonBonusOfferings(state, shrineId);
  const multiplier =
    bonusUses > 0 ? DRAGON_TEMPLE.rewardProgressMultiplier : 1;
  const amount = baseAmount * multiplier;

  if (bonusUses > 0 && progress) {
    progress.dragonBonusOfferings = bonusUses - 1;
  }

  return addShrineProgress(state, shrineId, amount);
}

function maybeTriggerDragonTempleFromOffering(state, shrineId, cropId) {
  if (!state.dragonTemple) {
    state.dragonTemple = createInitialDragonTemple();
  }
  const temple = state.dragonTemple;
  if (temple.active) return;

  if (typeof temple.triggerChance !== 'number') {
    temple.triggerChance = DRAGON_TEMPLE.defaultTriggerChance;
  }

  if (Math.random() < temple.triggerChance) {
    if (startDragonTempleEvent(state, cropId)) {
      setGameText(
        state,
        'Dragon awakens! Offer crops or face its wrath.',
      );
    }
    return;
  }

  const increase =
    DRAGON_TEMPLE.shrineTriggerChanceIncrease[shrineId] ?? 0;
  temple.triggerChance = Math.min(1, temple.triggerChance + increase);
}

export function placeAlchemySlot(state, slot, cropId) {
  tickCropDecay(state);
  if (slot !== 'slotA' && slot !== 'slotB') return false;
  if (!state.alchemy || state.alchemy.resultId) return false;
  if (state.alchemy[slot]) return false;
  if (!getCrop(cropId)) return false;

  const taken = takeFromInventory(state, cropId);
  if (!taken) return false;

  state.alchemy[slot] = {
    cropId: taken.cropId,
    expiresAt: taken.expiresAt,
  };
  return true;
}

export function placeAlchemyNextSlot(state, cropId) {
  if (!state.alchemy || state.alchemy.resultId) return false;
  const slot = !state.alchemy.slotA
    ? 'slotA'
    : !state.alchemy.slotB
      ? 'slotB'
      : null;
  if (!slot) return false;
  return placeAlchemySlot(state, slot, cropId);
}

export function clearAlchemySlot(state, slot) {
  tickCropDecay(state);
  if (slot !== 'slotA' && slot !== 'slotB') return false;
  if (!state.alchemy || state.alchemy.resultId) return false;

  const held = state.alchemy[slot];
  const cropId = getHeldCropId(held);
  if (!cropId) return false;

  const expiresAt = getHeldExpiresAt(held);
  if (!addToInventory(state, cropId, 1, expiresAt ?? undefined)) return false;
  state.alchemy[slot] = null;
  return true;
}

export function mixAlchemy(state) {
  tickCropDecay(state);
  if (!state.alchemy || state.alchemy.resultId) return false;

  const idA = getHeldCropId(state.alchemy.slotA);
  const idB = getHeldCropId(state.alchemy.slotB);
  const resultId = findAlchemyResult(idA, idB);
  if (!resultId) return false;

  markAlchemyRecipeDiscovered(state, resultId);
  state.alchemy.slotA = null;
  state.alchemy.slotB = null;
  state.alchemy.resultId = resultId;
  return true;
}

export function claimAlchemyResult(state) {
  tickCropDecay(state);
  if (!state.alchemy?.resultId) return false;

  if (!addToInventory(state, state.alchemy.resultId)) return false;
  state.alchemy = createInitialAlchemy();
  return true;
}

function returnDragonTempleSlotsToFarm(state) {
  const temple = state.dragonTemple;
  if (!temple?.slots) return;

  for (let i = 0; i < temple.slots.length; i++) {
    const held = temple.slots[i];
    const cropId = getHeldCropId(held);
    if (!cropId) continue;
    returnCropToFarm(state, cropId);
    temple.slots[i] = null;
  }
}

export function closeDragonTempleEvent(state) {
  if (!state.dragonTemple) {
    state.dragonTemple = createInitialDragonTemple();
    return;
  }
  const lastResult = state.dragonTemple.lastResult ?? null;
  const pendingReward = Boolean(state.dragonTemple.pendingReward);
  returnDragonTempleSlotsToFarm(state);
  state.dragonTemple.active = false;
  state.dragonTemple.demand = [];
  state.dragonTemple.wrath = 0;
  state.dragonTemple.slots = Array(DRAGON_TEMPLE.slotCount).fill(null);
  state.dragonTemple.lastResult = lastResult;
  state.dragonTemple.burning = false;
  state.dragonTemple.pendingClose = null;
  state.dragonTemple.pendingReward = pendingReward;
}

export function startDragonTempleEvent(state, echoCropId) {
  if (!state.dragonTemple) {
    state.dragonTemple = createInitialDragonTemple();
  }
  if (state.dragonTemple.active) return false;

  const demand = buildDragonTempleDemand(state, echoCropId);
  if (demand.some((id) => !id)) return false;

  state.dragonTemple.active = true;
  state.dragonTemple.demand = demand;
  state.dragonTemple.wrath = 0;
  state.dragonTemple.slots = Array(DRAGON_TEMPLE.slotCount).fill(null);
  state.dragonTemple.burning = false;
  state.dragonTemple.pendingClose = null;
  state.dragonTemple.triggerChance = DRAGON_TEMPLE.defaultTriggerChance;
  return true;
}

function demandCropAt(temple, slotIndex) {
  const demand = temple?.demand;
  if (!Array.isArray(demand)) return null;
  return demand[slotIndex] ?? null;
}

export function placeDragonTempleSlot(state, slotIndex, cropId, sourcePlotId = null) {
  tickCropDecay(state);
  const temple = state.dragonTemple;
  if (!temple?.active || temple.burning || temple.pendingClose) return false;
  if (
    typeof slotIndex !== 'number' ||
    slotIndex < 0 ||
    slotIndex >= temple.slots.length
  ) {
    return false;
  }
  if (temple.slots[slotIndex]) return false;
  if (!getCrop(cropId)) return false;
  if (demandCropAt(temple, slotIndex) !== cropId) return false;

  let expiresAt = null;
  if (sourcePlotId != null) {
    const taken = takeReadyCropFromPlot(state, sourcePlotId);
    if (!taken || taken.cropId !== cropId) return false;
    maybeSchedulePlotNapperFromHarvest(state);
  } else {
    const taken = takeFromInventory(state, cropId);
    if (!taken) return false;
    expiresAt = taken.expiresAt;
  }

  temple.slots[slotIndex] = {
    cropId,
    expiresAt,
  };

  // Impatient dragon: claim the tribute the moment every board slot matches.
  if (templeDemandMatched(temple)) {
    temple.burning = true;
  }
  return true;
}

export function placeDragonTempleNextSlot(state, cropId, sourcePlotId = null) {
  const temple = state.dragonTemple;
  if (!temple?.active || temple.burning || temple.pendingClose) return false;
  const slotIndex = temple.slots.findIndex(
    (slot, i) => !slot && demandCropAt(temple, i) === cropId,
  );
  if (slotIndex < 0) return false;
  return placeDragonTempleSlot(state, slotIndex, cropId, sourcePlotId);
}

export function clearDragonTempleSlot(state, slotIndex) {
  tickCropDecay(state);
  const temple = state.dragonTemple;
  if (!temple?.active || temple.burning || temple.pendingClose) return false;
  if (
    typeof slotIndex !== 'number' ||
    slotIndex < 0 ||
    slotIndex >= temple.slots.length
  ) {
    return false;
  }

  const held = temple.slots[slotIndex];
  const cropId = getHeldCropId(held);
  if (!cropId) return false;

  if (!returnCropToFarm(state, cropId)) return false;
  temple.slots[slotIndex] = null;
  return true;
}

function templeDemandMatched(temple) {
  if (!temple?.slots || !Array.isArray(temple.demand)) return false;
  if (temple.slots.length !== DRAGON_TEMPLE.slotCount) return false;
  if (temple.demand.length !== DRAGON_TEMPLE.slotCount) return false;
  return temple.slots.every(
    (slot, i) => getHeldCropId(slot) === temple.demand[i],
  );
}

export function burnDragonTemple(state) {
  tickCropDecay(state);
  const temple = state.dragonTemple;
  if (!temple?.active || temple.burning || temple.pendingClose) return false;
  if (!templeDemandMatched(temple)) return false;

  // Win is applied when the fire animation finishes.
  // Prefer auto-burn via placeDragonTempleSlot; this remains for explicit starts.
  temple.burning = true;
  return true;
}

// After fire animation: clear slots and set pendingClose for reveal.
// Does not close the event — call finalizeDragonTempleClose after resultRevealMs.
export function completeDragonTempleBurn(state) {
  const temple = state.dragonTemple;
  if (!temple?.active || !temple.burning) return false;

  temple.slots = Array(DRAGON_TEMPLE.slotCount).fill(null);
  temple.burning = false;
  temple.pendingClose = 'success';
  return true;
}

// Close after Burn result has been shown (win) or after wrath lose paths.
export function finalizeDragonTempleClose(state) {
  const temple = state.dragonTemple;
  if (!temple?.active || !temple.pendingClose) return false;

  const result = temple.pendingClose;
  temple.lastResult = result;
  temple.pendingClose = null;
  if (result === 'success') {
    temple.pendingReward = true;
    setGameText(
      state,
      'The Dragon blesses your grove.',
    );
  } else {
    applyDragonTempleLosePenalty(state);
  }
  closeDragonTempleEvent(state);
  return true;
}

// Apply the pending win shrine reward immediately (no animation).
// Grants bonus offering uses (stacks on re-win); does not add shrine progress.
// Returns { shrineId, unlockedPlotIds, maxed } or false.
export function claimTempleWinReward(state) {
  const temple = state.dragonTemple;
  if (!temple?.pendingReward) return false;

  temple.pendingReward = false;
  const shrineId = pickTempleRewardShrine(state);
  if (!shrineId) return false;

  if (isShrineMaxed(state, shrineId)) {
    return { shrineId, unlockedPlotIds: [], maxed: true };
  }

  const progress = state.shrines[shrineId];
  if (!progress) return false;

  const current = getDragonBonusOfferings(state, shrineId);
  progress.dragonBonusOfferings =
    current + DRAGON_TEMPLE.rewardBonusOfferings;
  return { shrineId, unlockedPlotIds: [], maxed: false };
}

// Resolve wrath overflow on load if somehow still active at/over max.
// Returns true if the event was closed as a loss.
export function tickDragonTemple(state) {
  const temple = state.dragonTemple;
  if (!temple?.active) return false;
  if (temple.burning || temple.pendingClose) return false;
  if ((temple.wrath ?? 0) < DRAGON_TEMPLE.wrathMax) return false;

  temple.lastResult = 'failed';
  applyDragonTempleLosePenalty(state);
  closeDragonTempleEvent(state);
  return true;
}

function createDeskVisitorId() {
  return `dv-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function ensureDeskVisitors(state) {
  if (!Array.isArray(state.deskVisitors)) {
    state.deskVisitors = [];
  }
  return state.deskVisitors;
}

// Desk fireflies parked (desk removed). Keep API for a later redesign.
export function maybeScheduleDeskVisitorFromOffering(_state, _now = Date.now()) {
  return false;
}

export function getWaitingDeskVisitors(state) {
  if (!Array.isArray(state.deskVisitors)) return [];
  return state.deskVisitors.filter((v) => v?.status === 'waiting');
}

// Take and clear the one-shot gift pin (used by inventory render).
export function takeDeskGiftLand(state) {
  const pin = state.deskGiftLand ?? null;
  state.deskGiftLand = null;
  return pin;
}

function isValidShelfSlotIndex(slotIndex) {
  return (
    typeof slotIndex === 'number' &&
    Number.isInteger(slotIndex) &&
    slotIndex >= 0 &&
    slotIndex < INVENTORY_SLOT_COUNT
  );
}

// Lowest shelf index free of waiting fireflies and packed crop stacks.
function pickFreeShelfSlotIndex(state) {
  const occupied = Array(INVENTORY_SLOT_COUNT).fill(false);
  const claimed = new Set();

  for (const visitor of getWaitingDeskVisitors(state)) {
    if (!isValidShelfSlotIndex(visitor.slotIndex)) continue;
    if (claimed.has(visitor.slotIndex)) continue;
    claimed.add(visitor.slotIndex);
    occupied[visitor.slotIndex] = true;
  }

  const stackCount = getInventoryStacks(state).filter(
    (stack) => stack.count > 0,
  ).length;
  let remaining = Math.min(
    stackCount,
    INVENTORY_SLOT_COUNT - claimed.size,
  );
  for (let i = 0; i < INVENTORY_SLOT_COUNT && remaining > 0; i += 1) {
    if (occupied[i]) continue;
    occupied[i] = true;
    remaining -= 1;
  }

  for (let i = 0; i < INVENTORY_SLOT_COUNT; i += 1) {
    if (!occupied[i]) return i;
  }
  return null;
}

function assignWaitingSlotIndex(state, visitor) {
  const slotIndex = pickFreeShelfSlotIndex(state);
  if (slotIndex == null) return false;
  visitor.slotIndex = slotIndex;
  return true;
}

// Promote approaching fireflies to waiting (or lose them if no free slot).
// Also drop excess waiting visitors if capacity was somehow exceeded.
// Returns true if any visitor changed.
export function reconcileDeskVisitors(state, now = Date.now()) {
  const list = ensureDeskVisitors(state);
  if (list.length === 0) return false;

  let changed = false;

  // Drop waiting visitors that no longer fit (crop tiles + waiting > max).
  while (getFreeInventorySlotCount(state) < 0) {
    const waitIndex = list.findIndex((v) => v?.status === 'waiting');
    if (waitIndex < 0) break;
    list.splice(waitIndex, 1);
    changed = true;
  }

  // Repair missing / duplicate slot indices on waiting fireflies.
  const usedSlots = new Set();
  for (const visitor of list) {
    if (visitor?.status !== 'waiting') continue;
    if (
      isValidShelfSlotIndex(visitor.slotIndex) &&
      !usedSlots.has(visitor.slotIndex)
    ) {
      usedSlots.add(visitor.slotIndex);
      continue;
    }
    delete visitor.slotIndex;
    changed = true;
  }
  for (const visitor of list) {
    if (visitor?.status !== 'waiting') continue;
    if (isValidShelfSlotIndex(visitor.slotIndex)) continue;
    if (!assignWaitingSlotIndex(state, visitor)) {
      const index = list.indexOf(visitor);
      if (index >= 0) list.splice(index, 1);
    }
    changed = true;
  }

  const ready = list
    .filter(
      (v) =>
        v?.status === 'approaching' &&
        typeof v.appearAt === 'number' &&
        now >= v.appearAt,
    )
    .sort((a, b) => a.appearAt - b.appearAt);

  for (const visitor of ready) {
    if (
      getFreeInventorySlotCount(state) > 0 &&
      assignWaitingSlotIndex(state, visitor)
    ) {
      visitor.status = 'waiting';
    } else {
      const index = list.indexOf(visitor);
      if (index >= 0) list.splice(index, 1);
    }
    changed = true;
  }
  return changed;
}

function pickDeskGiftCropId(state) {
  const candidates = [];
  for (const crop of CROPS) {
    if (!crop?.plantable) continue;
    if (!isCropUnlocked(state, crop)) continue;
    const weight = getGiftRarityWeight(crop.rarity);
    if (!(weight > 0)) continue;
    candidates.push({ cropId: crop.id, weight });
  }
  if (candidates.length === 0) return null;

  // Prefer gifts that need a new shelf tile so the firefly slot stays filled.
  const needingTile = candidates.filter(({ cropId }) => {
    const crop = getCrop(cropId);
    const current = getInventoryCount(state, cropId);
    const maxStack = getMaxStack(crop);
    return tilesForCount(current + 1, maxStack) > tilesForCount(current, maxStack);
  });
  const pool = needingTile.length > 0 ? needingTile : candidates;

  let total = 0;
  for (const entry of pool) total += entry.weight;
  let roll = Math.random() * total;
  for (const entry of pool) {
    roll -= entry.weight;
    if (roll < 0) return entry.cropId;
  }
  return pool[pool.length - 1].cropId;
}

// Click a waiting firefly: reservation becomes a gifted crop (atomic).
// Returns `{ cropId, slotIndex }` or null.
export function welcomeDeskVisitor(state, visitorId, now = Date.now()) {
  tickCropDecay(state, now);
  const list = ensureDeskVisitors(state);
  const index = list.findIndex(
    (v) => v?.id === visitorId && v.status === 'waiting',
  );
  if (index < 0) return null;

  const visitor = list[index];
  const slotIndex = isValidShelfSlotIndex(visitor.slotIndex)
    ? visitor.slotIndex
    : null;

  const cropId = pickDeskGiftCropId(state);
  if (!cropId) {
    list.splice(index, 1);
    state.deskGiftLand = null;
    return null;
  }

  // Drop reservation first, then force-add so the same tile becomes the crop.
  list.splice(index, 1);
  const crop = getCrop(cropId);
  forceAddToInventory(state, cropId, 1, getExpiresAt(crop, now));

  if (slotIndex != null) {
    state.deskGiftLand = { slotIndex, cropId };
  } else {
    state.deskGiftLand = null;
  }

  return { cropId, slotIndex };
}

function createPlotNapperId() {
  return `pn-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function countUnlockedPlots(state) {
  if (!Array.isArray(state.plots)) return 0;
  return state.plots.filter((plot) => plot && !plot.locked).length;
}

function listEligibleNapPlots(state) {
  if (!Array.isArray(state.plots)) return [];
  return state.plots.filter(
    (plot) =>
      plot &&
      !plot.locked &&
      !plot.crop &&
      !plot.flowered,
  );
}

/** True when a sleeping (or waking) tanuki occupies this plot. */
export function isPlotNapped(state, plotId) {
  const napper = state.plotNapper;
  if (!napper) return false;
  if (napper.status !== 'sleeping' && napper.status !== 'waking') return false;
  return napper.plotId === plotId;
}

export function clearPlotNapper(state) {
  state.plotNapper = null;
}

// After a harvest: maybe schedule a tanuki (does not pick a plot yet).
export function maybeSchedulePlotNapperFromHarvest(state, now = Date.now()) {
  if (state.plotNapper) return false;
  const minUnlocked = PLOT_NAPPER.minUnlockedPlots ?? 0;
  if (countUnlockedPlots(state) < minUnlocked) return false;

  const chance = PLOT_NAPPER.harvestChance ?? 0;
  if (!(chance > 0) || Math.random() >= chance) return false;

  state.plotNapper = {
    id: createPlotNapperId(),
    kind: 'tanuki',
    appearAt: now + getPlotNapperDelayMs(),
    status: 'approaching',
  };
  return true;
}

// Promote approaching tanuki to sleeping (or lose it), then sleeping → waking.
// Returns `{ changed, arrivedPlotId }` — arrivedPlotId set when a nap begins.
export function reconcilePlotNapper(state, now = Date.now()) {
  const napper = state.plotNapper;
  if (!napper) return { changed: false, arrivedPlotId: null };

  let changed = false;
  let arrivedPlotId = null;

  if (napper.status === 'approaching') {
    if (typeof napper.appearAt !== 'number' || now < napper.appearAt) {
      return { changed: false, arrivedPlotId: null };
    }

    const eligible = listEligibleNapPlots(state);
    if (eligible.length < 2) {
      state.plotNapper = null;
      return { changed: true, arrivedPlotId: null };
    }

    const pick = eligible[Math.floor(Math.random() * eligible.length)];
    napper.status = 'sleeping';
    napper.plotId = pick.id;
    napper.wakeAt = now + getPlotNapMs();
    changed = true;
    arrivedPlotId = pick.id;
    return { changed, arrivedPlotId };
  }

  if (napper.status === 'sleeping') {
    // Plot no longer valid (planted / flowered / locked) → drop silently.
    const plot = state.plots.find((p) => p.id === napper.plotId);
    if (
      !plot ||
      plot.locked ||
      plot.crop ||
      plot.flowered ||
      typeof napper.wakeAt !== 'number'
    ) {
      state.plotNapper = null;
      return { changed: true, arrivedPlotId: null };
    }

    if (now >= napper.wakeAt) {
      napper.status = 'waking';
      changed = true;
    }
  }

  return { changed, arrivedPlotId };
}


