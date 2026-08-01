import {
  plantCrop,
  waterPlot,
  welcomeCritter,
  isReady,
  needsWater,
  hasCritterVisit,
  isPlotNapped,
  reconcilePlotNapper,
  clearPlotNapper,
  offerCrop,
  mixAdjacentReadyPlots,
  placeDragonTempleSlot,
  placeDragonTempleNextSlot,
  clearDragonTempleSlot,
  completeDragonTempleBurn,
  finalizeDragonTempleClose,
  claimTempleWinReward,
  tickDragonTemple,
  tickCropDecay,
  getDragonBonusOfferings,
  markReadyCropsDiscovered,
  maybeShowShrineEpilogue,
  resetState,
  uprootCrop,
} from './state/gameState.js';
import { load, save } from './state/persistence.js';
import { getCrop } from './data/crops.js';
import { DRAGON_TEMPLE } from './data/dragonTemple.js';
import { renderGrid } from './ui/farmGrid.js';
import { renderShrines } from './ui/shrinesPanel.js';
import {
  renderDragonTemple,
  updateDragonTempleLive,
  updateDragonTempleWrath,
} from './ui/dragonTemplePanel.js';
import { renderGameTextPanel } from './ui/gameTextPanel.js';
import { openCropPicker } from './ui/cropPicker.js';
import { openShrineDetail } from './ui/shrineDetail.js';
import { openResetConfirm } from './ui/resetConfirm.js';
import { openUprootConfirm } from './ui/uprootConfirm.js';
import { openDiscoveryLog } from './ui/discoveryLog.js';
import { playHarvestCropFly } from './ui/bonusCropFly.js';
import {
  playTempleRewardSparks,
} from './ui/templeRewardFly.js';
import { playCritterFly } from './ui/critterFly.js';
import { playShrineTierUp } from './ui/shrineTierUp.js';
import { playTanukiArrive, playTanukiLeave } from './ui/tanukiNap.js';
import { resolvePlotCropDrop } from './ui/plotPointerDrag.js';
import { installStageFit } from './ui/stageFit.js';

const RENDER_INTERVAL_MS = 1000;
const WATERING_ANIM_MS = 1625;
const UPROOT_ANIM_MS = 1000;

const state = load();
const unlockingPlotIds = new Set();
const wateringPlotIds = new Set();
const critterFlyingPlotIds = new Set();
const tanukiArrivingPlotIds = new Set();
const tanukiLeavingPlotIds = new Set();
const uprootingPlotIds = new Set();
// Shrine ids whose Dragon-bonus glow is deferred until sparks land.
const pendingBlessingVisualShrineIds = new Set();

const appEl = document.getElementById('app');
const boardEl = document.getElementById('farm-board');
const gridEl = document.getElementById('farm-grid');
const dragonTempleEl = document.getElementById('dragon-temple');
const gameTextEl = document.getElementById('game-text');

installStageFit(appEl);

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
    null, // flowering parked
    tanukiArrivingPlotIds,
    tanukiLeavingPlotIds,
    handlePlotCropDrop,
    handleUprootHold,
    uprootingPlotIds,
  );
}

function render() {
  renderFarm();
  renderGameTextPanel(gameTextEl, state);
  renderDragonTemple(dragonTempleEl, state, dragonTempleHandlers);
  renderShrines(
    boardEl,
    state,
    handleOffer,
    handleShrineClick,
    pendingBlessingVisualShrineIds,
  );
}

function handlePlotClick(plotId) {
  const plot = state.plots.find((p) => p.id === plotId);
  if (!plot || plot.locked || unlockingPlotIds.has(plotId)) return;
  if (wateringPlotIds.has(plotId)) return;
  if (critterFlyingPlotIds.has(plotId)) return;
  if (tanukiArrivingPlotIds.has(plotId)) return;
  if (tanukiLeavingPlotIds.has(plotId)) return;
  if (uprootingPlotIds.has(plotId)) return;
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

  // Ready crops are dragged; click is a no-op.
  if (isReady(plot, Date.now())) return;

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
        if ((result.tiersGained ?? 0) > 0 && shrineId) {
          const shrineEl = boardEl.querySelector(`#shrine-${shrineId}`);
          playShrineTierUp({ shrineEl });
        }
        render();
      },
    });
  }
}

function handleUprootHold(plotId) {
  const plot = state.plots.find((p) => p.id === plotId);
  if (!plot?.crop || plot.locked || unlockingPlotIds.has(plotId)) return;
  if (wateringPlotIds.has(plotId)) return;
  if (critterFlyingPlotIds.has(plotId)) return;
  if (tanukiArrivingPlotIds.has(plotId)) return;
  if (tanukiLeavingPlotIds.has(plotId)) return;
  if (uprootingPlotIds.has(plotId)) return;
  if (isPlotNapped(state, plotId)) return;

  const plotEl = gridEl.querySelector(`[data-plot-id="${plotId}"]`);
  openUprootConfirm(plotEl, () => {
    if (!plot.crop || uprootingPlotIds.has(plotId)) return;
    uprootingPlotIds.add(plotId);
    renderFarm();
    window.setTimeout(() => {
      if (!uprootingPlotIds.has(plotId)) return;
      uprootingPlotIds.delete(plotId);
      if (!uprootCrop(state, plotId)) {
        render();
        return;
      }
      save(state);
      render();
    }, UPROOT_ANIM_MS);
  });
}

function handleUnlockAnimationEnd() {
  renderFarm();
}

function handleMixReadyPlots(fromPlotId, toPlotId) {
  if (!mixAdjacentReadyPlots(state, fromPlotId, toPlotId)) return;
  save(state);
  render();
}

function handlePlotCropDrop(payload) {
  const target = resolvePlotCropDrop(payload, state, Date.now());
  if (!target) return;

  if (target.type === 'mix') {
    handleMixReadyPlots(payload.fromPlotId, target.toPlotId);
    return;
  }
  if (target.type === 'shrine') {
    handleOffer(target.shrineId, payload.cropId, payload.fromPlotId);
    return;
  }
  if (target.type === 'temple-slot') {
    handleDragonTemplePlace(
      target.slotIndex,
      payload.cropId,
      payload.fromPlotId,
    );
    return;
  }
  if (target.type === 'temple') {
    handleDragonTemplePlaceNext(payload.cropId, payload.fromPlotId);
  }
}

function handleOffer(shrineId, cropId, plotId = null) {
  const plotEl =
    plotId != null
      ? gridEl.querySelector(`[data-plot-id="${plotId}"]`)
      : null;
  const sourceRect = plotEl?.getBoundingClientRect() ?? null;

  const result = offerCrop(state, shrineId, cropId, plotId);
  if (!result) {
    // Allowlist rejects set game text; re-render so the message shows.
    save(state);
    render();
    return;
  }

  for (const unlockedId of result.unlockedPlotIds) {
    unlockingPlotIds.add(unlockedId);
  }

  save(state);
  render();

  if ((result.tiersGained ?? 0) > 0) {
    const shrineEl = boardEl.querySelector(`#shrine-${shrineId}`);
    playShrineTierUp({ shrineEl });
  }

  if (result.bonus) {
    const shrineIconEl = boardEl.querySelector(
      `#shrine-${shrineId} .shrine__icon`,
    );
    const crop = getCrop(result.cropId);
    playHarvestCropFly({
      sourceRect,
      targetRect: shrineIconEl?.getBoundingClientRect() ?? null,
      cropId: result.cropId,
      icon: crop?.icon ?? '',
      withSparks: true,
    });
  }
}

function handleShrineClick(shrineId) {
  openShrineDetail(state, shrineId);
}

function handleDragonTemplePlace(slotIndex, cropId, plotId = null) {
  if (!placeDragonTempleSlot(state, slotIndex, cropId, plotId)) return;
  save(state);
  render();
}

function handleDragonTemplePlaceNext(cropId, plotId = null) {
  if (!placeDragonTempleNextSlot(state, cropId, plotId)) return;
  save(state);
  render();
}

function handleDragonTempleClear(slotIndex) {
  if (!clearDragonTempleSlot(state, slotIndex)) return;
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
  const claim = claimTempleWinReward(state);
  if (!claim) return;

  for (const plotId of claim.unlockedPlotIds) {
    unlockingPlotIds.add(plotId);
  }

  save(state);

  const { shrineId, maxed } = claim;
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

  if (markReadyCropsDiscovered(state, now)) {
    dirty = true;
  }

  const napperResult = reconcilePlotNapper(state, now);
  if (napperResult.changed) {
    dirty = true;
  }

  if (maybeShowShrineEpilogue(state, now)) {
    dirty = true;
    renderGameTextPanel(gameTextEl, state);
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
  if (state.dragonTemple?.active) {
    if (state.dragonTemple.burning) {
      updateDragonTempleWrath(dragonTempleEl, state);
    } else if (!updateDragonTempleLive(dragonTempleEl, state)) {
      renderDragonTemple(dragonTempleEl, state, dragonTempleHandlers);
    }
  }
}

function handleResetGame() {
  openResetConfirm(() => {
    resetState(state);
    unlockingPlotIds.clear();
    tanukiArrivingPlotIds.clear();
    tanukiLeavingPlotIds.clear();
    uprootingPlotIds.clear();
    save(state);
    render();
  });
}

function handleDiscoveryLog() {
  openDiscoveryLog(state, handleResetGame);
}

if (gameTextEl) {
  gameTextEl.onclick = handleDiscoveryLog;
}

render();
setInterval(tick, RENDER_INTERVAL_MS);
