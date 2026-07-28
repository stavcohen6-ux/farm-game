import {
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
  isAlchemyResultId,
} from '../data/alchemyRecipes.js';
import { getShrine, getShrineMaxTier, SHRINES } from '../data/shrines.js';
import { DRAGON_TEMPLE } from '../data/dragonTemple.js';

export const GRID_ROWS = 5;
export const GRID_COLS = 4;
export const TOTAL_PLOTS = GRID_ROWS * GRID_COLS;
export const UNLOCKED_PLOTS_AT_START = 4;
export const STARTING_RESEARCH_LEVEL = 1;
// Fixed inventory slot row; also the max number of visual stacks.
export const INVENTORY_SLOT_COUNT = 6;

export function createInitialShrines() {
  return {
    frog: { tier: 0, progress: 0 },
    monkey: { tier: 0, progress: 0 },
    fox: { tier: 0, progress: 0 },
    tiger: { tier: 0, progress: 0 },
  };
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
    endsAt: null,
    progress: 0,
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
  const plots = [];
  for (let id = 0; id < TOTAL_PLOTS; id++) {
    plots.push({
      id,
      locked: id < TOTAL_PLOTS - UNLOCKED_PLOTS_AT_START,
      crop: null,
      flowered: false,
    });
  }
  return {
    plots,
    inventory: {},
    // Harvest grants awaiting fly-to-inventory; flushed on load if interrupted
    pendingHarvests: [],
    researchLevel: STARTING_RESEARCH_LEVEL,
    shrines: createInitialShrines(),
    alchemy: createInitialAlchemy(),
    dragonTemple: createInitialDragonTemple(),
    // Crop ids the player has ever received into inventory (sticky until Reset)
    discoveredCropIds: [],
    // Alchemy result ids successfully mixed at least once (sticky until Reset)
    discoveredAlchemyResultIds: [],
    // Player-facing message for the top text panel; null = empty
    gameText: null,
  };
}

// Replace the contents of an existing state object with a fresh farm.
export function resetState(state) {
  const fresh = createInitialState();
  state.plots = fresh.plots;
  state.inventory = fresh.inventory;
  state.pendingHarvests = fresh.pendingHarvests;
  state.researchLevel = fresh.researchLevel;
  state.shrines = fresh.shrines;
  state.alchemy = fresh.alchemy;
  state.dragonTemple = fresh.dragonTemple;
  state.discoveredCropIds = fresh.discoveredCropIds;
  state.discoveredAlchemyResultIds = fresh.discoveredAlchemyResultIds;
  state.gameText = fresh.gameText;
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

export function isShrineMaxed(state, shrineId) {
  const progress = state.shrines?.[shrineId];
  if (!progress) return true;
  return progress.tier >= getShrineMaxTier(shrineId);
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

// Spend a plantable on an empty unlocked plot to flower it (next plant
// gets a guaranteed butterfly). Returns true on success.
export function flowerPlot(state, plotId, cropId) {
  tickCropDecay(state);
  const plot = state.plots.find((p) => p.id === plotId);
  if (!plot || plot.locked || plot.crop || plot.flowered) return false;

  const crop = getCrop(cropId);
  if (!crop?.plantable) return false;
  if (!takeFromInventory(state, cropId)) return false;

  plot.flowered = true;
  return true;
}

export function plantCrop(state, plotId, cropId) {
  const plot = state.plots.find((p) => p.id === plotId);
  if (!plot || plot.locked || plot.crop) return;

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

// Non-maxed shrine with lowest devotion; ties → emptier bar, then SHRINES order.
export function pickNeediestShrine(state) {
  let bestId = null;
  let bestDevotion = Infinity;
  let bestFrac = Infinity;

  for (const shrine of SHRINES) {
    const id = shrine.id;
    if (isShrineMaxed(state, id)) continue;

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
// Returns `{ shrineId, unlockedPlotIds }` (shrineId null if all maxed), or null.
export function welcomeCritter(state, plotId, now = Date.now()) {
  const plot = state.plots.find((p) => p.id === plotId);
  if (!plot || !hasCritterVisit(plot, now)) return null;

  plot.crop.critterWelcomed = true;

  const shrineId = pickNeediestShrine(state);
  if (!shrineId) {
    setGameText(
      state,
      'The guardians rest — the grove is already content.',
    );
    return { shrineId: null, unlockedPlotIds: [] };
  }

  const crop = getCrop(plot.crop.cropId);
  const amount = getCritterShrineProgress(crop);
  const tierBefore = state.shrines[shrineId]?.tier ?? 0;
  const result =
    amount > 0 ? addShrineProgress(state, shrineId, amount) : false;

  if (!result) {
    setGameText(
      state,
      'The guardians rest — the grove is already content.',
    );
    return { shrineId: null, unlockedPlotIds: [] };
  }

  if ((state.shrines[shrineId]?.tier ?? 0) === tierBefore) {
    setGameText(
      state,
      `A butterfly carries a blessing to the ${shrineAnimalName(shrineId)}.`,
    );
  }

  return { shrineId, unlockedPlotIds: result.unlockedPlotIds ?? [] };
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

// Sticky discovery: once seen in inventory, stays until full Reset.
export function markCropDiscovered(state, cropId) {
  if (!getCrop(cropId)) return;
  if (!Array.isArray(state.discoveredCropIds)) {
    state.discoveredCropIds = [];
  }
  if (!state.discoveredCropIds.includes(cropId)) {
    state.discoveredCropIds.push(cropId);
  }
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

// Crop ids currently sitting in inventory or board slots (for save migration).
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

// True if adding `amount` of cropId keeps reserved stack slots ≤ max.
function canAcceptCrop(state, cropId, amount = 1) {
  if (!(amount > 0)) return false;
  const totals = getReservedCropCounts(state);
  totals[cropId] = (totals[cropId] || 0) + amount;
  return tileCountForTotals(totals) <= INVENTORY_SLOT_COUNT;
}

function unlockPlots(state, count) {
  const locked = state.plots
    .filter((plot) => plot.locked)
    .sort((a, b) => b.id - a.id);

  const unlockedPlotIds = [];
  for (let i = 0; i < count && i < locked.length; i++) {
    locked[i].locked = false;
    unlockedPlotIds.push(locked[i].id);
  }
  return unlockedPlotIds;
}

// Re-lock fox-expanded plots (lowest ids first), reversing unlockPlots order.
function lockPlots(state, count) {
  const firstExpandableId = TOTAL_PLOTS - UNLOCKED_PLOTS_AT_START;
  const unlocked = state.plots
    .filter((plot) => !plot.locked && plot.id < firstExpandableId)
    .sort((a, b) => a.id - b.id);

  const lockedPlotIds = [];
  for (let i = 0; i < count && i < unlocked.length; i++) {
    unlocked[i].locked = true;
    unlocked[i].crop = null;
    unlocked[i].flowered = false;
    lockedPlotIds.push(unlocked[i].id);
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
// Returns `{ unlockedPlotIds }` or false if the shrine is maxed / missing.
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
  }

  if (progress.tier > tierBefore) {
    const tier = shrine.tiers[progress.tier - 1];
    if (tier?.tooltip) {
      setGameText(
        state,
        `Congratulations - your ${shrine.name} has been upgraded\n${tier.tooltip}`,
      );
    }
  }

  return { unlockedPlotIds };
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

  return true;
}

const TEMPLE_LOSE_LINE =
  "You didn't make enough sacrifices - the Dragon burnt one of your shrines.";

// Pick and burn one shrine with progress; set lose game text.
// Returns burnt shrineId, or null if none had progress.
export function applyDragonTempleLosePenalty(state) {
  const shrineId = pickBurnableShrine(state);
  if (!shrineId) {
    setGameText(state, TEMPLE_LOSE_LINE);
    return null;
  }

  burnShrine(state, shrineId);
  setGameText(
    state,
    `${TEMPLE_LOSE_LINE}\nYour ${shrineAnimalName(shrineId)} shrine has been burnt`,
  );
  return shrineId;
}

export function offerCrop(state, shrineId, cropId) {
  tickCropDecay(state);
  if (isShrineMaxed(state, shrineId)) return false;

  const crop = getCrop(cropId);
  if (!crop) return false;

  const amount = crop.shrineValues?.[shrineId];
  if (typeof amount !== 'number' || amount <= 0) {
    return false;
  }

  if (!takeFromInventory(state, cropId)) return false;

  const result = addShrineProgress(state, shrineId, amount);
  maybeTriggerDragonTempleFromOffering(state, shrineId);
  return result;
}

function maybeTriggerDragonTempleFromOffering(state, shrineId) {
  if (!state.dragonTemple) {
    state.dragonTemple = createInitialDragonTemple();
  }
  const temple = state.dragonTemple;
  if (temple.active) return;

  if (typeof temple.triggerChance !== 'number') {
    temple.triggerChance = DRAGON_TEMPLE.defaultTriggerChance;
  }

  if (Math.random() < temple.triggerChance) {
    if (startDragonTempleEvent(state)) {
      setGameText(
        state,
        'The Dragon awakens in anger\nMake sacrifices to gain its favor or suffer its wrath!',
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

function returnDragonTempleSlotsToInventory(state) {
  const temple = state.dragonTemple;
  if (!temple?.slots) return;

  for (let i = 0; i < temple.slots.length; i++) {
    const held = temple.slots[i];
    const cropId = getHeldCropId(held);
    if (!cropId) continue;
    const expiresAt = getHeldExpiresAt(held);
    const crop = getCrop(cropId);
    const expiry =
      typeof expiresAt === 'number' ? expiresAt : getExpiresAt(crop);
    // Force return — these crops were already owned before the event.
    forceAddToInventory(state, cropId, 1, expiry);
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
  returnDragonTempleSlotsToInventory(state);
  state.dragonTemple.active = false;
  state.dragonTemple.endsAt = null;
  state.dragonTemple.progress = 0;
  state.dragonTemple.slots = Array(DRAGON_TEMPLE.slotCount).fill(null);
  state.dragonTemple.lastResult = lastResult;
  state.dragonTemple.burning = false;
  state.dragonTemple.pendingClose = null;
  state.dragonTemple.pendingReward = pendingReward;
}

export function startDragonTempleEvent(state, now = Date.now()) {
  if (!state.dragonTemple) {
    state.dragonTemple = createInitialDragonTemple();
  }
  if (state.dragonTemple.active) return false;

  state.dragonTemple.active = true;
  state.dragonTemple.endsAt = now + DRAGON_TEMPLE.durationMs;
  state.dragonTemple.progress = 0;
  state.dragonTemple.slots = Array(DRAGON_TEMPLE.slotCount).fill(null);
  state.dragonTemple.burning = false;
  state.dragonTemple.pendingClose = null;
  state.dragonTemple.triggerChance = DRAGON_TEMPLE.defaultTriggerChance;
  return true;
}

export function placeDragonTempleSlot(state, slotIndex, cropId) {
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

  const taken = takeFromInventory(state, cropId);
  if (!taken) return false;

  temple.slots[slotIndex] = {
    cropId: taken.cropId,
    expiresAt: taken.expiresAt,
  };
  return true;
}

export function placeDragonTempleNextSlot(state, cropId) {
  const temple = state.dragonTemple;
  if (!temple?.active || temple.burning || temple.pendingClose) return false;
  const slotIndex = temple.slots.findIndex((slot) => !slot);
  if (slotIndex < 0) return false;
  return placeDragonTempleSlot(state, slotIndex, cropId);
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

  const expiresAt = getHeldExpiresAt(held);
  if (!addToInventory(state, cropId, 1, expiresAt ?? undefined)) return false;
  temple.slots[slotIndex] = null;
  return true;
}

export function burnDragonTemple(state) {
  tickCropDecay(state);
  const temple = state.dragonTemple;
  if (!temple?.active || temple.burning || temple.pendingClose) return false;
  if (temple.slots.length !== DRAGON_TEMPLE.slotCount) return false;
  if (temple.slots.some((slot) => !getHeldCropId(slot))) return false;

  // Progress is applied when the fire animation finishes.
  temple.burning = true;
  return true;
}

// After fire animation: apply points, clear slots, set pendingClose for reveal.
// Does not close the event — call finalizeDragonTempleClose after resultRevealMs.
export function completeDragonTempleBurn(state, now = Date.now()) {
  const temple = state.dragonTemple;
  if (!temple?.active || !temple.burning) return false;

  const timerExpired =
    temple.pendingClose === 'failed' ||
    (temple.endsAt != null && now >= temple.endsAt);

  temple.slots = Array(DRAGON_TEMPLE.slotCount).fill(null);
  temple.burning = false;
  temple.progress += DRAGON_TEMPLE.pointsPerBurn;

  if (temple.progress >= DRAGON_TEMPLE.progressRequired) {
    temple.pendingClose = 'success';
  } else if (timerExpired) {
    temple.pendingClose = 'failed';
  } else {
    temple.pendingClose = null;
  }
  return true;
}

// Close after the progress bar has been shown (win or lose).
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
      'Congratulations - the Dragon has given you its blessing',
    );
  } else {
    applyDragonTempleLosePenalty(state);
  }
  closeDragonTempleEvent(state);
  return true;
}

// Apply the pending win shrine reward immediately (no animation).
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

  const result = addShrineProgress(
    state,
    shrineId,
    DRAGON_TEMPLE.rewardProgress,
  );
  if (!result) return false;
  return { shrineId, unlockedPlotIds: result.unlockedPlotIds, maxed: false };
}

// Returns true if the event was closed due to timeout.
export function tickDragonTemple(state, now = Date.now()) {
  const temple = state.dragonTemple;
  if (!temple?.active || temple.endsAt == null) return false;
  if (now < temple.endsAt) return false;

  // Waiting for post-burn result reveal — do not close yet.
  if (temple.pendingClose && !temple.burning) return false;

  if (temple.burning) {
    temple.pendingClose = 'failed';
    return false;
  }

  temple.lastResult = 'failed';
  applyDragonTempleLosePenalty(state);
  closeDragonTempleEvent(state);
  return true;
}

