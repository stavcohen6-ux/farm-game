import {
  createInitialState,
  createInitialShrines,
  createInitialAlchemy,
  createInitialDragonTemple,
  completeDragonTempleBurn,
  finalizeDragonTempleClose,
  claimTempleWinReward,
  tickDragonTemple,
  flushPendingHarvests,
  tickCropDecay,
  markCropDiscovered,
  collectHeldCropIds,
  STARTING_RESEARCH_LEVEL,
  TOTAL_PLOTS,
} from './gameState.js';
import { getCrop, getExpiresAt } from '../data/crops.js';
import { isAlchemyResultId } from '../data/alchemyRecipes.js';
import { DRAGON_TEMPLE } from '../data/dragonTemple.js';

const STORAGE_KEY = 'farm-game-state';

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

function batchSortKey(expiresAt) {
  return typeof expiresAt === 'number' ? expiresAt : Infinity;
}

// Legacy planted crops: no retroactive water asks or critter visits.
// Missing plot.flowered → false.
function normalizePlantedCropWater(parsed) {
  let dirty = false;
  if (!Array.isArray(parsed.plots)) return dirty;
  for (const plot of parsed.plots) {
    if (!plot || typeof plot !== 'object') continue;
    if (plot.flowered !== true && plot.flowered !== false) {
      plot.flowered = false;
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

function normalizeDragonTemple(parsed, now) {
  const defaults = createInitialDragonTemple();
  if (!parsed.dragonTemple || typeof parsed.dragonTemple !== 'object') {
    parsed.dragonTemple = defaults;
    return;
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
    return;
  }

  parsed.dragonTemple = {
    active: true,
    endsAt: typeof raw.endsAt === 'number' ? raw.endsAt : null,
    progress: typeof raw.progress === 'number' ? raw.progress : 0,
    slots: migratedSlots,
    lastResult,
    burning: Boolean(raw.burning),
    pendingClose,
    pendingReward,
    triggerChance,
  };
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
    if (!parsed.shrines || typeof parsed.shrines !== 'object') {
      parsed.shrines = createInitialShrines();
    } else {
      const defaults = createInitialShrines();
      for (const shrineId of Object.keys(defaults)) {
        if (!parsed.shrines[shrineId]) {
          parsed.shrines[shrineId] = defaults[shrineId];
        }
      }
    }

    const now = Date.now();
    let dirty = false;
    if (normalizePlantedCropWater(parsed)) {
      dirty = true;
    }
    normalizeInventory(parsed, now);
    normalizePendingHarvests(parsed, now);
    normalizeAlchemy(parsed, now);
    normalizeDragonTemple(parsed, now);

    if (normalizeDiscoveredCrops(parsed)) {
      dirty = true;
    }
    if (normalizeDiscoveredAlchemyRecipes(parsed)) {
      dirty = true;
    }

    if (typeof parsed.gameText !== 'string' || parsed.gameText.trim() === '') {
      parsed.gameText = null;
    } else {
      parsed.gameText = parsed.gameText.trim();
    }

    // Catch up perishable crops (including mid-flight grants) after offline time.
    const spoiled = tickCropDecay(parsed, Date.now());
    if (Object.keys(spoiled).length > 0) {
      dirty = true;
    }
    // Apply remaining mid-flight harvest grants so reload cannot lose fresh crops.
    if (flushPendingHarvests(parsed)) {
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
    if (dirty) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }

    return parsed;
  } catch {
    return createInitialState();
  }
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
