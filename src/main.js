import {
  plantCrop,
  flowerPlot,
  harvestPlot,
  waterPlot,
  welcomeCritter,
  applyPendingHarvest,
  isReady,
  needsWater,
  hasCritterVisit,
  offerCrop,
  placeAlchemySlot,
  placeAlchemyNextSlot,
  clearAlchemySlot,
  mixAlchemy,
  claimAlchemyResult,
  placeDragonTempleSlot,
  placeDragonTempleNextSlot,
  clearDragonTempleSlot,
  burnDragonTemple,
  completeDragonTempleBurn,
  finalizeDragonTempleClose,
  claimTempleWinReward,
  tickDragonTemple,
  tickCropDecay,
  getInventoryCount,
  getHeldCropId,
  resetState,
} from './state/gameState.js';
import { load, save } from './state/persistence.js';
import { getCrop } from './data/crops.js';
import { DRAGON_TEMPLE } from './data/dragonTemple.js';
import { renderGrid } from './ui/farmGrid.js';
import {
  renderInventory,
  pulseInventoryItem,
  shakeInventoryFull,
} from './ui/inventoryPanel.js';
import { renderShrines } from './ui/shrinesPanel.js';
import { renderAlchemy } from './ui/alchemyPanel.js';
import {
  renderDragonTemple,
  updateDragonTempleTimer,
} from './ui/dragonTemplePanel.js';
import { renderGameTextPanel } from './ui/gameTextPanel.js';
import { openCropPicker } from './ui/cropPicker.js';
import { openShrineDetail } from './ui/shrineDetail.js';
import { openResetConfirm } from './ui/resetConfirm.js';
import { openDiscoveryLog } from './ui/discoveryLog.js';
import { playHarvestCropFly } from './ui/bonusCropFly.js';
import {
  playTempleRewardSparks,
  pulseShrineIcon,
} from './ui/templeRewardFly.js';
import { playCritterFly } from './ui/critterFly.js';

const RENDER_INTERVAL_MS = 1000;
const BONUS_FLY_DELAY_MS = 500;
const WATERING_ANIM_MS = 1625;

const state = load();
const unlockingPlotIds = new Set();
const wateringPlotIds = new Set();
const critterFlyingPlotIds = new Set();

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
  onBurn: handleDragonTempleBurn,
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
  );
}

function render() {
  renderFarm();
  renderGameTextPanel(gameTextEl, state);
  renderDragonTemple(dragonTempleEl, state, dragonTempleHandlers);
  renderInventory(inventoryEl, state);
  renderAlchemy(alchemyEl, state, {
    onPlace: handleAlchemyPlace,
    onPlaceNext: handleAlchemyPlaceNext,
    onClear: handleAlchemyClear,
    onMix: handleAlchemyMix,
    onClaim: handleAlchemyClaim,
  });
  renderShrines(boardEl, state, handleOffer, handleShrineClick);
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
  if (!result) return;

  for (const plotId of result.unlockedPlotIds) {
    unlockingPlotIds.add(plotId);
  }

  save(state);
  render();
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

function handleAlchemyMix() {
  if (!mixAlchemy(state)) return;
  save(state);
  render();
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

function handleDragonTempleBurn() {
  if (!burnDragonTemple(state)) return;
  save(state);
  render();
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
  // Grant shrine progress immediately so a refresh mid-animation cannot lose it.
  const claim = claimTempleWinReward(state);
  if (!claim) return;

  for (const plotId of claim.unlockedPlotIds) {
    unlockingPlotIds.add(plotId);
  }

  save(state);
  render();

  const { shrineId, maxed } = claim;
  const shrineEl = boardEl.querySelector(`#shrine-${shrineId}`);
  const iconEl = shrineEl?.querySelector('.shrine__icon');
  if (!iconEl) return;

  playTempleRewardSparks({
    sourceEl: dragonTempleEl,
    targetIconEl: iconEl,
    onComplete: () => {
      if (maxed) return;

      // Icon may have been rebuilt by an intervening render.
      const pulseTarget =
        boardEl.querySelector(`#shrine-${shrineId} .shrine__icon`) ?? iconEl;

      pulseShrineIcon(pulseTarget, () => {
        // Progress already applied in claimTempleWinReward; pulse is visual only.
        render();
      });
    },
  });
}

function tick() {
  const now = Date.now();
  const spoiled = tickCropDecay(state, now);
  if (Object.keys(spoiled).length > 0) {
    save(state);
  }

  if (tickDragonTemple(state, now)) {
    save(state);
    render();
    return;
  }

  renderFarm();
  // Refresh perishable UI every tick so urgency tints track wall-clock time.
  renderInventory(inventoryEl, state);
  renderAlchemy(alchemyEl, state, {
    onPlace: handleAlchemyPlace,
    onPlaceNext: handleAlchemyPlaceNext,
    onClear: handleAlchemyClear,
    onMix: handleAlchemyMix,
    onClaim: handleAlchemyClaim,
  });
  if (state.dragonTemple?.active) {
    if (state.dragonTemple.burning) {
      updateDragonTempleTimer(dragonTempleEl, state);
    } else {
      renderDragonTemple(dragonTempleEl, state, dragonTempleHandlers);
    }
  }
}

function handleResetGame() {
  openResetConfirm(() => {
    resetState(state);
    unlockingPlotIds.clear();
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
