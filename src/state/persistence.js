import {
  createInitialState,
  createInitialShrines,
  createInitialAlchemy,
  createInitialDragonTemple,
  createInitialTutorialSeen,
  completeDragonTempleBurn,
  finalizeDragonTempleClose,
  claimTempleWinReward,
  tickDragonTemple,
  tickCropDecay,
  markCropDiscovered,
  markReadyCropsDiscovered,
  maybeShowShrineEpilogue,
  collectHeldCropIds,
  reconcilePlotNapper,
  isReady,
  STARTING_RESEARCH_LEVEL,
  TOTAL_PLOTS,
  INVENTORY_SLOT_COUNT,
} from './gameState.js';
import { getCrop, getExpiresAt } from '../data/crops.js';
import { isAlchemyResultId } from '../data/alchemyRecipes.js';
import { DRAGON_TEMPLE } from '../data/dragonTemple.js';
import { TUTORIAL_FLAG_KEYS } from '../data/tutorial.js';

const STORAGE_KEY = 'farm-game-state';
const SAVE_VERSION = 2;

export function save(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clear() {
  localStorage.removeItem(STORAGE_KEY);
}

function migrateHeldSlot(held, now) {
  if (!held) return null;
  if (typeof held === 'string') {
    const crop = getCrop(held);
    if (!crop) return null;
    return { cropId: held, expiresAt: getExpiresAt(crop, now) };
  }
  if (typeof held === 'object' && typeof held.cropId === 'string') {
    if (typeof held.expiresAt === 'number' || held.expiresAt === null) {
      return { cropId: held.cropId, expiresAt: held.expiresAt };
    }
  }
  return null;
}

function normalizeDeskVisitors(parsed) {
  if (!Array.isArray(parsed.deskVisitors)) {
    parsed.deskVisitors = [];
    return true;
  }

  const next = [];
  const usedSlots = new Set();
  for (const raw of parsed.deskVisitors) {
    if (!raw || typeof raw !== 'object') continue;
    if (typeof raw.id !== 'string' || !raw.id) continue;
    if (raw.kind !== 'firefly') continue;
    if (typeof raw.appearAt !== 'number') continue;
    if (raw.status !== 'approaching' && raw.status !== 'waiting') continue;
    const entry = {
      id: raw.id,
      kind: 'firefly',
      appearAt: raw.appearAt,
      status: raw.status,
    };
    if (raw.status === 'waiting') {
      const slot = raw.slotIndex;
      if (
        typeof slot === 'number' &&
        Number.isInteger(slot) &&
        slot >= 0 &&
        slot < INVENTORY_SLOT_COUNT &&
        !usedSlots.has(slot)
      ) {
        entry.slotIndex = slot;
        usedSlots.add(slot);
      }
    }
    next.push(entry);
  }

  let dirty = next.length !== parsed.deskVisitors.length;
  parsed.deskVisitors = next;

  if (parsed.deskGiftLand != null) {
    parsed.deskGiftLand = null;
    dirty = true;
  }

  return dirty;
}

function normalizePlotNapper(parsed) {
  const raw = parsed.plotNapper;
  if (raw == null) {
    if (parsed.plotNapper !== null) {
      parsed.plotNapper = null;
      return true;
    }
    return false;
  }

  if (!raw || typeof raw !== 'object') {
    parsed.plotNapper = null;
    return true;
  }
  if (typeof raw.id !== 'string' || !raw.id) {
    parsed.plotNapper = null;
    return true;
  }
  if (raw.kind !== 'tanuki') {
    parsed.plotNapper = null;
    return true;
  }
  if (typeof raw.appearAt !== 'number') {
    parsed.plotNapper = null;
    return true;
  }

  // Mid-animation wake on load: clear — no retroactive leave animation.
  if (raw.status === 'waking') {
    parsed.plotNapper = null;
    return true;
  }

  if (raw.status === 'approaching') {
    parsed.plotNapper = {
      id: raw.id,
      kind: 'tanuki',
      appearAt: raw.appearAt,
      status: 'approaching',
    };
    return false;
  }

  if (raw.status === 'sleeping') {
    if (typeof raw.plotId !== 'number' || typeof raw.wakeAt !== 'number') {
      parsed.plotNapper = null;
      return true;
    }
    const plot = Array.isArray(parsed.plots)
      ? parsed.plots.find((p) => p?.id === raw.plotId)
      : null;
    if (!plot || plot.locked || plot.crop || plot.flowered) {
      parsed.plotNapper = null;
      return true;
    }
    parsed.plotNapper = {
      id: raw.id,
      kind: 'tanuki',
      appearAt: raw.appearAt,
      status: 'sleeping',
      plotId: raw.plotId,
      wakeAt: raw.wakeAt,
    };
    return false;
  }

  parsed.plotNapper = null;
  return true;
}

function batchSortKey(expiresAt) {
  return typeof expiresAt === 'number' ? expiresAt : Infinity;
}

// Legacy planted crops: no retroactive water asks or critter visits.
// Missing plot.flowered / plot.vined → false. Ready crops clear vines.
function normalizePlantedCropWater(parsed) {
  let dirty = false;
  if (!Array.isArray(parsed.plots)) return dirty;
  const now = Date.now();
  for (const plot of parsed.plots) {
    if (!plot || typeof plot !== 'object') continue;
    if (plot.flowered !== true && plot.flowered !== false) {
      plot.flowered = false;
      dirty = true;
    }
    if (plot.vined !== true && plot.vined !== false) {
      plot.vined = false;
      dirty = true;
    }
    const crop = plot.crop;
    if (!crop || typeof crop !== 'object') continue;
    if (crop.watered !== true && crop.watered !== false) {
      crop.watered = false;
      dirty = true;
    }
    if (typeof crop.waterRequestAt !== 'number') {
      if (crop.waterRequestAt !== null) {
        crop.waterRequestAt = null;
        dirty = true;
      }
    }
    if (crop.critterWelcomed !== true && crop.critterWelcomed !== false) {
      crop.critterWelcomed = false;
      dirty = true;
    }
    if (typeof crop.critterVisitAt !== 'number') {
      if (crop.critterVisitAt !== null) {
        crop.critterVisitAt = null;
        dirty = true;
      }
    }
    // Ready crop sits on clean soil.
    if (plot.vined && isReady(plot, now)) {
      plot.vined = false;
      dirty = true;
    }
  }
  return dirty;
}

function normalizeInventory(parsed, now) {
  if (!parsed.inventory || typeof parsed.inventory !== 'object') {
    parsed.inventory = {};
    return;
  }

  const next = {};
  for (const [cropId, value] of Object.entries(parsed.inventory)) {
    const crop = getCrop(cropId);
    if (!crop) continue;

    // Legacy: cropId → count number
    if (typeof value === 'number' && value > 0) {
      next[cropId] = [
        { amount: value, expiresAt: getExpiresAt(crop, now) },
      ];
      continue;
    }

    if (!Array.isArray(value)) continue;

    const batches = [];
    for (const batch of value) {
      if (!batch || typeof batch.amount !== 'number' || batch.amount <= 0) {
        continue;
      }
      if (typeof batch.expiresAt === 'number' || batch.expiresAt === null) {
        batches.push({ amount: batch.amount, expiresAt: batch.expiresAt });
      }
    }
    if (batches.length === 0) continue;
    batches.sort(
      (a, b) => batchSortKey(a.expiresAt) - batchSortKey(b.expiresAt),
    );
    next[cropId] = batches;
  }
  parsed.inventory = next;
}

function normalizePendingHarvests(parsed, now) {
  if (!Array.isArray(parsed.pendingHarvests)) {
    parsed.pendingHarvests = [];
    return;
  }

  parsed.pendingHarvests = parsed.pendingHarvests
    .filter(
      (entry) =>
        entry &&
        typeof entry.id === 'string' &&
        typeof entry.cropId === 'string' &&
        typeof entry.amount === 'number' &&
        entry.amount > 0 &&
        getCrop(entry.cropId),
    )
    .map((entry) => {
      if (typeof entry.expiresAt === 'number' || entry.expiresAt === null) {
        return entry;
      }
      const crop = getCrop(entry.cropId);
      return {
        ...entry,
        expiresAt: getExpiresAt(crop, now),
      };
    });
}

function normalizeAlchemy(parsed, now) {
  if (!parsed.alchemy || typeof parsed.alchemy !== 'object') {
    parsed.alchemy = createInitialAlchemy();
    return;
  }

  const defaults = createInitialAlchemy();
  parsed.alchemy = {
    slotA: migrateHeldSlot(parsed.alchemy.slotA ?? defaults.slotA, now),
    slotB: migrateHeldSlot(parsed.alchemy.slotB ?? defaults.slotB, now),
    resultId:
      typeof parsed.alchemy.resultId === 'string'
        ? parsed.alchemy.resultId
        : defaults.resultId,
  };
}

function normalizeDragonTempleDemand(raw, discoveredCropIds) {
  const count = DRAGON_TEMPLE.slotCount;
  const pool = (
    Array.isArray(discoveredCropIds) ? discoveredCropIds : []
  ).filter((id) => typeof id === 'string' && getCrop(id));

  let demand = Array.isArray(raw.demand)
    ? raw.demand
        .slice(0, count)
        .filter((id) => typeof id === 'string' && getCrop(id))
    : [];

  while (demand.length < count) {
    if (pool.length === 0) break;
    demand.push(pool[Math.floor(Math.random() * pool.length)]);
  }

  if (demand.length < count) {
    return null;
  }
  return demand.slice(0, count);
}

function normalizeDragonTemple(parsed, now) {
  const defaults = createInitialDragonTemple();
  if (!parsed.dragonTemple || typeof parsed.dragonTemple !== 'object') {
    parsed.dragonTemple = defaults;
    return true;
  }

  const raw = parsed.dragonTemple;
  const slots = Array.isArray(raw.slots)
    ? raw.slots.slice(0, DRAGON_TEMPLE.slotCount)
    : [];
  while (slots.length < DRAGON_TEMPLE.slotCount) {
    slots.push(null);
  }

  const migratedSlots = slots.map((slot) => migrateHeldSlot(slot, now));

  const lastResult =
    raw.lastResult === 'success' || raw.lastResult === 'failed'
      ? raw.lastResult
      : null;

  const pendingClose =
    raw.pendingClose === 'success' || raw.pendingClose === 'failed'
      ? raw.pendingClose
      : null;

  const pendingReward = Boolean(raw.pendingReward);

  const triggerChance =
    typeof raw.triggerChance === 'number' &&
    Number.isFinite(raw.triggerChance)
      ? Math.min(1, Math.max(0, raw.triggerChance))
      : DRAGON_TEMPLE.defaultTriggerChance;

  if (!raw.active) {
    parsed.dragonTemple = {
      ...createInitialDragonTemple(),
      lastResult,
      pendingReward,
      triggerChance,
    };
    return (
      raw.endsAt != null ||
      raw.progress != null ||
      (Array.isArray(raw.demand) && raw.demand.length > 0)
    );
  }

  const demand = normalizeDragonTempleDemand(raw, parsed.discoveredCropIds);
  if (!demand) {
    // Legacy timer events / corrupt demand — close without penalty.
    parsed.dragonTemple = {
      ...createInitialDragonTemple(),
      lastResult,
      pendingReward,
      triggerChance,
    };
    return true;
  }

  const wrath =
    typeof raw.wrath === 'number' && Number.isFinite(raw.wrath)
      ? Math.min(DRAGON_TEMPLE.wrathMax, Math.max(0, raw.wrath))
      : 0;

  parsed.dragonTemple = {
    active: true,
    demand,
    wrath,
    slots: migratedSlots,
    lastResult,
    burning: Boolean(raw.burning),
    pendingClose,
    pendingReward,
    triggerChance,
  };
  return (
    raw.endsAt != null ||
    raw.progress != null ||
    typeof raw.wrath !== 'number'
  );
}

function normalizeShrines(parsed) {
  if (!parsed.shrines || typeof parsed.shrines !== 'object') {
    parsed.shrines = createInitialShrines();
    return true;
  }

  let dirty = false;
  const defaults = createInitialShrines();
  for (const shrineId of Object.keys(defaults)) {
    if (!parsed.shrines[shrineId]) {
      parsed.shrines[shrineId] = { ...defaults[shrineId] };
      dirty = true;
      continue;
    }

    const shrine = parsed.shrines[shrineId];
    const remaining = shrine.dragonBonusOfferings;
    if (
      typeof remaining !== 'number' ||
      !Number.isFinite(remaining) ||
      remaining < 0
    ) {
      shrine.dragonBonusOfferings = 0;
      dirty = true;
    } else if (!Number.isInteger(remaining)) {
      shrine.dragonBonusOfferings = Math.floor(remaining);
      dirty = true;
    }
  }
  return dirty;
}

export function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return createInitialState();

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.plots) || parsed.plots.length !== TOTAL_PLOTS) {
      return createInitialState();
    }
    if (typeof parsed.researchLevel !== 'number') {
      parsed.researchLevel = STARTING_RESEARCH_LEVEL;
    }

    const now = Date.now();
    let dirty = false;

    // Desk-less farm: wipe inventory / desk alchemy / fireflies / active temple.
    if (migrateToPlotHeldCrops(parsed)) {
      dirty = true;
    }

    if (normalizeShrines(parsed)) {
      dirty = true;
    }
    if (normalizePlantedCropWater(parsed)) {
      dirty = true;
    }
    normalizeInventory(parsed, now);
    normalizePendingHarvests(parsed, now);
    normalizeAlchemy(parsed, now);

    if (normalizeDiscoveredCrops(parsed)) {
      dirty = true;
    }
    if (normalizeDiscoveredAlchemyRecipes(parsed)) {
      dirty = true;
    }
    if (normalizeDragonTemple(parsed, now)) {
      dirty = true;
    }
    if (normalizeDeskVisitors(parsed)) {
      dirty = true;
    }
    if (normalizePlotNapper(parsed)) {
      dirty = true;
    }

    if (typeof parsed.gameText !== 'string' || parsed.gameText.trim() === '') {
      parsed.gameText = null;
    } else {
      parsed.gameText = parsed.gameText.trim();
    }

    if (parsed.shrineEpilogueShown !== true) {
      if (parsed.shrineEpilogueShown !== false) {
        dirty = true;
      }
      parsed.shrineEpilogueShown = false;
    }

    if (
      typeof parsed.shrineEpilogueDueAt !== 'number' ||
      !Number.isFinite(parsed.shrineEpilogueDueAt)
    ) {
      if (parsed.shrineEpilogueDueAt != null) {
        dirty = true;
      }
      parsed.shrineEpilogueDueAt = null;
    }

    if (normalizeTutorialSeen(parsed)) {
      dirty = true;
    }

    // Catch up perishable crops after offline time.
    const spoiled = tickCropDecay(parsed, Date.now());
    if (Object.keys(spoiled).length > 0) {
      dirty = true;
    }
    // Place, wake, or drop tanuki napper after offline time.
    const napperResult = reconcilePlotNapper(parsed, Date.now());
    if (napperResult.changed) {
      dirty = true;
    }
    // Offline catch-up may leave status 'waking' with no UI to finish — clear it.
    if (parsed.plotNapper?.status === 'waking') {
      parsed.plotNapper = null;
      dirty = true;
    }
    // Snap-finish mid-animation burns / pending reveals so reload cannot soft-lock.
    if (parsed.dragonTemple?.burning) {
      completeDragonTempleBurn(parsed, Date.now());
      dirty = true;
    }
    if (parsed.dragonTemple?.pendingClose) {
      finalizeDragonTempleClose(parsed);
      dirty = true;
    }
    if (parsed.dragonTemple?.pendingReward) {
      claimTempleWinReward(parsed);
      dirty = true;
    }
    if (tickDragonTemple(parsed, Date.now())) {
      dirty = true;
    }
    if (markReadyCropsDiscovered(parsed, Date.now())) {
      dirty = true;
    }
    if (maybeShowShrineEpilogue(parsed, Date.now())) {
      dirty = true;
    }
    if (dirty) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }

    return parsed;
  } catch {
    return createInitialState();
  }
}

/** Strip desk/inventory mode once; safe to re-run (idempotent when version >= 2). */
function migrateToPlotHeldCrops(parsed) {
  if (parsed.saveVersion === SAVE_VERSION) return false;

  parsed.inventory = {};
  parsed.pendingHarvests = [];
  parsed.alchemy = createInitialAlchemy();
  parsed.deskVisitors = [];
  parsed.deskGiftLand = null;
  // Discard any in-progress temple tribute (no inventory to return to).
  parsed.dragonTemple = createInitialDragonTemple();
  if (Array.isArray(parsed.plots)) {
    for (const plot of parsed.plots) {
      if (plot) plot.flowered = false;
    }
  }
  parsed.saveVersion = SAVE_VERSION;
  return true;
}

/**
 * Normalize sticky tutorial flags.
 * Missing object on an existing save → all true (skip tips for returning players).
 * Partial / invalid keys are repaired; unknown keys dropped.
 */
function normalizeTutorialSeen(parsed) {
  const raw = parsed.tutorialSeen;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    // Existing saves without tutorial state: do not re-teach mid-run.
    const seen = createInitialTutorialSeen();
    for (const key of TUTORIAL_FLAG_KEYS) {
      seen[key] = true;
    }
    parsed.tutorialSeen = seen;
    return true;
  }

  let dirty = false;
  const normalized = createInitialTutorialSeen();
  for (const key of TUTORIAL_FLAG_KEYS) {
    if (raw[key] === true) {
      normalized[key] = true;
    } else if (raw[key] !== false) {
      dirty = true;
    }
  }
  for (const key of Object.keys(raw)) {
    if (!TUTORIAL_FLAG_KEYS.includes(key)) {
      dirty = true;
      break;
    }
  }
  parsed.tutorialSeen = normalized;
  return dirty;
}

function normalizeDiscoveredCrops(parsed) {
  if (!Array.isArray(parsed.discoveredCropIds)) {
    // Legacy saves: seed from crops currently held so the log is not empty.
    parsed.discoveredCropIds = [];
    for (const cropId of collectHeldCropIds(parsed)) {
      markCropDiscovered(parsed, cropId);
    }
    return true;
  }

  parsed.discoveredCropIds = parsed.discoveredCropIds.filter(
    (cropId) => typeof cropId === 'string' && getCrop(cropId),
  );
  return false;
}

function normalizeDiscoveredAlchemyRecipes(parsed) {
  if (!Array.isArray(parsed.discoveredAlchemyResultIds)) {
    parsed.discoveredAlchemyResultIds = [];
    return true;
  }

  parsed.discoveredAlchemyResultIds = parsed.discoveredAlchemyResultIds.filter(
    (resultId) => typeof resultId === 'string' && isAlchemyResultId(resultId),
  );
  return false;
}
