import {
  plantCrop,
  flowerPlot,
  harvestPlot,
  waterPlot,
  welcomeCritter,
  welcomeDeskVisitor,
  applyPendingHarvest,
  isReady,
  needsWater,
  hasCritterVisit,
  isPlotNapped,
  reconcileDeskVisitors,
  reconcilePlotNapper,
  clearPlotNapper,
  offerCrop,
  placeAlchemySlot,
  placeAlchemyNextSlot,
  clearAlchemySlot,
  mixAlchemy,
  claimAlchemyResult,
  placeDragonTempleSlot,
  placeDragonTempleNextSlot,
  clearDragonTempleSlot,
  completeDragonTempleBurn,
  finalizeDragonTempleClose,
  claimTempleWinReward,
  tickDragonTemple,
  tickCropDecay,
  getInventoryCount,
  getHeldCropId,
  getDragonBonusOfferings,
  resetState,
} from './state/gameState.js';
import { load, save } from './state/persistence.js';
import { getCrop } from './data/crops.js';
import { DRAGON_TEMPLE } from './data/dragonTemple.js';
import { renderGrid } from './ui/farmGrid.js';
import {
  renderInventory,
  pulseInventoryItem,
  pulseInventorySlot,
  shakeInventoryFull,
} from './ui/inventoryPanel.js';
import { renderShrines } from './ui/shrinesPanel.js';
import { renderAlchemy, updateAlchemyLive } from './ui/alchemyPanel.js';
import {
  playAlchemyMixGrind,
  playAlchemyResultReveal,
} from './ui/alchemyMixRitual.js';
import {
  renderDragonTemple,
  updateDragonTempleLive,
  updateDragonTempleWrath,
} from './ui/dragonTemplePanel.js';
import { renderGameTextPanel } from './ui/gameTextPanel.js';
import { openCropPicker } from './ui/cropPicker.js';
import { openShrineDetail } from './ui/shrineDetail.js';
import { openResetConfirm } from './ui/resetConfirm.js';
import { openDiscoveryLog } from './ui/discoveryLog.js';
import { playHarvestCropFly } from './ui/bonusCropFly.js';
import {
  playTempleRewardSparks,
} from './ui/templeRewardFly.js';
import { playCritterFly } from './ui/critterFly.js';
import { playDeskGiftSparks } from './ui/deskGiftSparks.js';
import { playTanukiArrive, playTanukiLeave } from './ui/tanukiNap.js';
import { findAlchemyResult } from './data/alchemyRecipes.js';

const RENDER_INTERVAL_MS = 1000;
const BONUS_FLY_DELAY_MS = 500;
const WATERING_ANIM_MS = 1625;

const state = load();
let alchemyRitualPlaying = false;
const unlockingPlotIds = new Set();
const wateringPlotIds = new Set();
const critterFlyingPlotIds = new Set();
const deskGiftingVisitorIds = new Set();
const tanukiArrivingPlotIds = new Set();
const tanukiLeavingPlotIds = new Set();
// Shrine ids whose Dragon-bonus glow is deferred until sparks land.
const pendingBlessingVisualShrineIds = new Set();

const appEl = document.getElementById('app');
const boardEl = document.getElementById('farm-board');
const gridEl = document.getElementById('farm-grid');
const inventoryEl = document.getElementById('inventory');
const alchemyEl = document.getElementById('alchemy');
const discoveryLogEl = document.getElementById('discovery-log');
const dragonTempleEl = document.getElementById('dragon-temple');
const gameTextEl = document.getElementById('game-text');
const resetGameEl = document.getElementById('reset-game');

const dragonTempleHandlers = {
  onPlace: handleDragonTemplePlace,
  onPlaceNext: handleDragonTemplePlaceNext,
  onClear: handleDragonTempleClear,
  onBurnComplete: handleDragonTempleBurnComplete,
};

function renderFarm() {
  const now = Date.now();
  renderGrid(
    gridEl,
    state,
    now,
    handlePlotClick,
    unlockingPlotIds,
    handleUnlockAnimationEnd,
    wateringPlotIds,
    critterFlyingPlotIds,
    handleFlowerPlot,
    tanukiArrivingPlotIds,
    tanukiLeavingPlotIds,
  );
}

function renderInventoryPanel() {
  renderInventory(inventoryEl, state, handleDeskVisitorClick);
}

function alchemyHandlers() {
  return {
    onPlace: handleAlchemyPlace,
    onPlaceNext: handleAlchemyPlaceNext,
    onClear: handleAlchemyClear,
    onMix: handleAlchemyMix,
    onClaim: handleAlchemyClaim,
  };
}

function renderAlchemyPanel() {
  if (alchemyRitualPlaying) return;
  renderAlchemy(alchemyEl, state, alchemyHandlers());
}

function render() {
  renderFarm();
  renderGameTextPanel(gameTextEl, state);
  renderDragonTemple(dragonTempleEl, state, dragonTempleHandlers);
  renderInventoryPanel();
  renderAlchemyPanel();
  renderShrines(
    boardEl,
    state,
    handleOffer,
    handleShrineClick,
    pendingBlessingVisualShrineIds,
  );
}

// Keep #app scroll stable across harvest renders (avoids jump during fly).
function renderPreservingScroll() {
  const top = appEl?.scrollTop ?? 0;
  const left = appEl?.scrollLeft ?? 0;
  render();
  if (appEl) {
    appEl.scrollTop = top;
    appEl.scrollLeft = left;
  }
}

function handleFlowerPlot(plotId, cropId) {
  if (!flowerPlot(state, plotId, cropId)) return;
  save(state);
  render();
}

function handlePlotClick(plotId) {
  const plot = state.plots.find((p) => p.id === plotId);
  if (!plot || plot.locked || unlockingPlotIds.has(plotId)) return;
  if (wateringPlotIds.has(plotId)) return;
  if (critterFlyingPlotIds.has(plotId)) return;
  if (tanukiArrivingPlotIds.has(plotId)) return;
  if (tanukiLeavingPlotIds.has(plotId)) return;
  if (isPlotNapped(state, plotId)) return;

  if (!plot.crop) {
    const plotEl = gridEl.querySelector(`[data-plot-id="${plotId}"]`);
    if (!plotEl) return;
    openCropPicker(state, plotEl, (cropId) => {
      plantCrop(state, plotId, cropId);
      save(state);
      render();
    });
    return;
  }

  if (isReady(plot, Date.now())) {
    const plotEl = gridEl.querySelector(`[data-plot-id="${plotId}"]`);
    const sourceRect = plotEl?.getBoundingClientRect();
    const result = harvestPlot(state, plotId);
    if (!result) {
      shakeInventoryFull(inventoryEl);
      return;
    }

    save(state);
    renderPreservingScroll();

    const crop = getCrop(result.cropId);
    const icon = crop?.icon ?? '';
    const [basePendingId, bonusPendingId] = result.pendingIds;

    playHarvestCropFly({
      sourceRect,
      targetRect: getHarvestFlyTargetRect(result.cropId),
      cropId: result.cropId,
      icon,
      onComplete: () => settlePendingHarvest(basePendingId),
    });

    if (result.bonus && bonusPendingId) {
      window.setTimeout(() => {
        playHarvestCropFly({
          sourceRect,
          targetRect: getHarvestFlyTargetRect(result.cropId),
          cropId: result.cropId,
          icon,
          withSparks: true,
          onComplete: () => settlePendingHarvest(bonusPendingId),
        });
      }, BONUS_FLY_DELAY_MS);
    }
    return;
  }

  if (needsWater(plot, Date.now())) {
    wateringPlotIds.add(plotId);
    if (!waterPlot(state, plotId)) {
      wateringPlotIds.delete(plotId);
      return;
    }
    save(state);
    render();
    window.setTimeout(() => {
      if (!wateringPlotIds.has(plotId)) return;
      wateringPlotIds.delete(plotId);
      render();
    }, WATERING_ANIM_MS);
    return;
  }

  if (hasCritterVisit(plot, Date.now())) {
    const plotEl = gridEl.querySelector(`[data-plot-id="${plotId}"]`);
    const sourceRect = plotEl?.getBoundingClientRect();
    critterFlyingPlotIds.add(plotId);

    const result = welcomeCritter(state, plotId);
    if (!result) {
      critterFlyingPlotIds.delete(plotId);
      return;
    }

    for (const unlockedId of result.unlockedPlotIds) {
      unlockingPlotIds.add(unlockedId);
    }

    save(state);
    // Points are already in state/save; keep shrine bars visually stale until land.
    renderFarm();
    renderGameTextPanel(gameTextEl, state);

    const shrineId = result.shrineId;
    const targetIconEl = shrineId
      ? boardEl.querySelector(`#shrine-${shrineId} .shrine__icon`)
      : null;
    const targetRect = targetIconEl?.getBoundingClientRect();

    playCritterFly({
      sourceRect,
      targetRect,
      onComplete: () => {
        critterFlyingPlotIds.delete(plotId);
        render();
      },
    });
  }
}

// Existing inventory tile if present; otherwise the inventory panel center.
function getHarvestFlyTargetRect(cropId) {
  const tile =
    getInventoryCount(state, cropId) > 0
      ? inventoryEl.querySelector(`[data-crop-id="${cropId}"]`)
      : null;
  const el = tile ?? inventoryEl;
  return el.getBoundingClientRect();
}

function settlePendingHarvest(pendingId) {
  const cropId = applyPendingHarvest(state, pendingId);
  if (!cropId) return;
  save(state);
  renderPreservingScroll();
  pulseInventoryItem(inventoryEl, cropId);
}

function handleUnlockAnimationEnd() {
  renderFarm();
}

function handleOffer(shrineId, cropId) {
  const result = offerCrop(state, shrineId, cropId);
  if (!result) {
    // Allowlist rejects set game text; re-render so the message shows.
    save(state);
    render();
    return;
  }

  for (const plotId of result.unlockedPlotIds) {
    unlockingPlotIds.add(plotId);
  }

  save(state);
  render();
}

function handleDeskVisitorClick(visitorId) {
  if (!visitorId || deskGiftingVisitorIds.has(visitorId)) return;

  const item = inventoryEl.querySelector(
    `[data-desk-visitor-id="${visitorId}"]`,
  );
  if (!item) return;

  deskGiftingVisitorIds.add(visitorId);
  // Sparks while firefly still occupies the slot; gift lands on complete.
  playDeskGiftSparks({
    targetEl: item,
    onComplete: () => {
      const result = welcomeDeskVisitor(state, visitorId);
      deskGiftingVisitorIds.delete(visitorId);
      save(state);
      render();
      if (typeof result?.slotIndex === 'number') {
        pulseInventorySlot(inventoryEl, result.slotIndex);
      } else if (result?.cropId) {
        pulseInventoryItem(inventoryEl, result.cropId);
      }
    },
  });
}

function handleShrineClick(shrineId) {
  openShrineDetail(state, shrineId);
}

function handleAlchemyPlace(slot, cropId) {
  if (!placeAlchemySlot(state, slot, cropId)) return;
  save(state);
  render();
}

function handleAlchemyPlaceNext(cropId) {
  if (!placeAlchemyNextSlot(state, cropId)) return;
  save(state);
  render();
}

function handleAlchemyClear(slot) {
  const cropId = getHeldCropId(state.alchemy?.[slot]);
  if (!clearAlchemySlot(state, slot)) {
    if (cropId) shakeInventoryFull(inventoryEl);
    return;
  }
  save(state);
  render();
  if (cropId) pulseInventoryItem(inventoryEl, cropId);
}

function alchemyPairCanMix() {
  return Boolean(
    findAlchemyResult(
      getHeldCropId(state.alchemy?.slotA ?? null),
      getHeldCropId(state.alchemy?.slotB ?? null),
    ),
  );
}

function handleAlchemyMix() {
  if (alchemyRitualPlaying) return;
  if (!alchemyPairCanMix()) return;

  alchemyRitualPlaying = true;
  playAlchemyMixGrind(alchemyEl, {
    onGrindDone: ({ fromRect }) => {
      if (!mixAlchemy(state)) {
        alchemyRitualPlaying = false;
        render();
        return;
      }
      save(state);
      alchemyRitualPlaying = false;
      renderAlchemyPanel();
      playAlchemyResultReveal(alchemyEl, { fromRect });
    },
  });
}

function handleAlchemyClaim() {
  const cropId = state.alchemy?.resultId;
  if (!claimAlchemyResult(state)) {
    if (cropId) shakeInventoryFull(inventoryEl);
    return;
  }
  save(state);
  render();
  if (cropId) pulseInventoryItem(inventoryEl, cropId);
}

function handleDragonTemplePlace(slotIndex, cropId) {
  if (!placeDragonTempleSlot(state, slotIndex, cropId)) return;
  save(state);
  render();
}

function handleDragonTemplePlaceNext(cropId) {
  if (!placeDragonTempleNextSlot(state, cropId)) return;
  save(state);
  render();
}

function handleDragonTempleClear(slotIndex) {
  const cropId = getHeldCropId(state.dragonTemple?.slots?.[slotIndex]);
  if (!clearDragonTempleSlot(state, slotIndex)) {
    if (cropId) shakeInventoryFull(inventoryEl);
    return;
  }
  save(state);
  render();
  if (cropId) pulseInventoryItem(inventoryEl, cropId);
}

function handleDragonTempleBurnComplete() {
  if (!completeDragonTempleBurn(state)) return;
  save(state);
  render();

  const outcome = state.dragonTemple?.pendingClose;
  if (!outcome) return;

  window.setTimeout(() => {
    if (state.dragonTemple?.pendingClose !== outcome) return;
    if (!finalizeDragonTempleClose(state)) return;
    save(state);
    render();
    if (outcome === 'success') playTempleWinPrize();
  }, DRAGON_TEMPLE.resultRevealMs);
}

function playTempleWinPrize() {
  // Grant blessing uses immediately so a refresh mid-animation cannot lose them.
  const claim = claimTempleWinReward(state);
  if (!claim) return;

  for (const plotId of claim.unlockedPlotIds) {
    unlockingPlotIds.add(plotId);
  }

  save(state);

  const { shrineId, maxed } = claim;
  // Defer glow only for a fresh blessing; keep an existing glow while stacking.
  if (
    !maxed &&
    getDragonBonusOfferings(state, shrineId) <=
      DRAGON_TEMPLE.rewardBonusOfferings
  ) {
    pendingBlessingVisualShrineIds.add(shrineId);
  }
  render();

  const shrineEl = boardEl.querySelector(`#shrine-${shrineId}`);
  const iconEl = shrineEl?.querySelector('.shrine__icon');
  if (!iconEl) {
    pendingBlessingVisualShrineIds.delete(shrineId);
    render();
    return;
  }

  playTempleRewardSparks({
    sourceEl: dragonTempleEl,
    targetIconEl: iconEl,
    onComplete: () => {
      pendingBlessingVisualShrineIds.delete(shrineId);
      render();
    },
  });
}

function beginTanukiArrive(plotId) {
  if (tanukiArrivingPlotIds.has(plotId) || tanukiLeavingPlotIds.has(plotId)) {
    return;
  }
  tanukiArrivingPlotIds.add(plotId);
  renderFarm();

  const plotEl = gridEl.querySelector(`[data-plot-id="${plotId}"]`);
  const targetRect = plotEl?.getBoundingClientRect();

  playTanukiArrive({
    targetRect,
    onComplete: () => {
      tanukiArrivingPlotIds.delete(plotId);
      renderFarm();
    },
  });
}

function beginTanukiLeave(plotId) {
  if (tanukiLeavingPlotIds.has(plotId)) return;
  tanukiLeavingPlotIds.add(plotId);
  renderFarm();

  const plotEl = gridEl.querySelector(`[data-plot-id="${plotId}"]`);
  const sourceRect = plotEl?.getBoundingClientRect();

  playTanukiLeave({
    sourceRect,
    onComplete: () => {
      tanukiLeavingPlotIds.delete(plotId);
      clearPlotNapper(state);
      save(state);
      renderFarm();
    },
  });
}

function tick() {
  const now = Date.now();
  const spoiled = tickCropDecay(state, now);
  let dirty = Object.keys(spoiled).length > 0;

  if (reconcileDeskVisitors(state, now)) {
    dirty = true;
  }

  const napperResult = reconcilePlotNapper(state, now);
  if (napperResult.changed) {
    dirty = true;
  }

  if (dirty) {
    save(state);
  }

  if (napperResult.arrivedPlotId != null) {
    beginTanukiArrive(napperResult.arrivedPlotId);
  } else if (
    state.plotNapper?.status === 'waking' &&
    typeof state.plotNapper.plotId === 'number' &&
    !tanukiLeavingPlotIds.has(state.plotNapper.plotId)
  ) {
    beginTanukiLeave(state.plotNapper.plotId);
  }

  if (tickDragonTemple(state)) {
    save(state);
    render();
    return;
  }

  renderFarm();
  // Refresh perishable UI every tick so urgency tints track wall-clock time.
  renderInventoryPanel();
  // In-place alchemy update keeps the Mix ready animation running (same
  // pattern as updateDragonTempleLive for the temple ready-edge).
  // Skip while the Mix ritual owns the board DOM.
  if (!alchemyRitualPlaying) {
    if (!updateAlchemyLive(alchemyEl, state)) {
      renderAlchemyPanel();
    }
  }
  if (state.dragonTemple?.active) {
    if (state.dragonTemple.burning) {
      updateDragonTempleWrath(dragonTempleEl, state);
    } else if (!updateDragonTempleLive(dragonTempleEl, state)) {
      // Slot set changed (e.g. spoil) — rebuild; otherwise keep edge animation.
      renderDragonTemple(dragonTempleEl, state, dragonTempleHandlers);
    }
  }
}

function handleResetGame() {
  openResetConfirm(() => {
    alchemyRitualPlaying = false;
    resetState(state);
    unlockingPlotIds.clear();
    deskGiftingVisitorIds.clear();
    tanukiArrivingPlotIds.clear();
    tanukiLeavingPlotIds.clear();
    save(state);
    render();
  });
}

function handleDiscoveryLog() {
  openDiscoveryLog(state);
}

resetGameEl.onclick = handleResetGame;
discoveryLogEl.onclick = handleDiscoveryLog;

render();
setInterval(tick, RENDER_INTERVAL_MS);
