import {
  plantCrop,
  waterPlot,
  welcomeCritter,
  pickNeediestShrine,
  isReady,
  needsWater,
  hasCritterVisit,
  isPlotNapped,
  reconcilePlotNapper,
  clearPlotNapper,
  offerCrop,
  applyPendingTigerBonus,
  mixAdjacentReadyPlots,
  placeDragonTempleSlot,
  placeDragonTempleNextSlot,
  completeDragonTempleBurn,
  finalizeDragonTempleClose,
  claimTempleWinReward,
  tickDragonTemple,
  tickCropDecay,
  getDragonBonusOfferings,
  markReadyCropsDiscovered,
  maybeShowShrineEpilogue,
  maybeArmShrineEpilogue,
  clearShrineEpiloguePendingUi,
  resetState,
  uprootCrop,
  isTutorialActive,
  isTutorialGated,
  dismissTutorialSoftInvite,
  armDragonBlessingTip,
  dismissDragonBlessingTip,
  canTutorialOpenPicker,
  onTutorialPickerOpened,
  canTutorialUproot,
  canTutorialOpenShrineDetail,
  canTutorialTemple,
  tickTutorial,
} from './state/gameState.js';
import { load, save } from './state/persistence.js';
import { getCrop } from './data/crops.js';
import { DRAGON_TEMPLE } from './data/dragonTemple.js';
import { renderGrid } from './ui/farmGrid.js';
import { renderShrines } from './ui/shrinesPanel.js';
import {
  renderDragonTemple,
  suppressNextDragonTempleFigureClick,
  updateDragonTempleLive,
  updateDragonTempleWrath,
} from './ui/dragonTemplePanel.js';
import { openDragonTempleDetail } from './ui/dragonTempleDetail.js';
import { renderGameTextPanel } from './ui/gameTextPanel.js';
import { openCropPicker } from './ui/cropPicker.js';
import { openShrineDetail } from './ui/shrineDetail.js';
import { openResetConfirm } from './ui/resetConfirm.js';
import { openUprootConfirm } from './ui/uprootConfirm.js';
import { openDiscoveryLog } from './ui/discoveryLog.js';
import { playHarvestCropFly } from './ui/bonusCropFly.js';
import { playOfferingProgressPop } from './ui/offeringProgressPop.js';
import {
  playTempleRewardSparks,
} from './ui/templeRewardFly.js';
import { playCritterFly } from './ui/critterFly.js';
import { playShrineTierUp } from './ui/shrineTierUp.js';
import {
  closeShrineEpilogue,
  tryOpenShrineEpilogue,
} from './ui/shrineEpilogue.js';
import { playShrineBurn } from './ui/shrineBurn.js';
import { playTanukiArrive, playTanukiLeave } from './ui/tanukiNap.js';
import { resolvePlotCropDrop } from './ui/plotPointerDrag.js';
import { pinCropTip } from './ui/cropTip.js';
import { installStageFit } from './ui/stageFit.js';
import { installOpeningScreen } from './ui/openingScreen.js';
import { renderTutorialBubble } from './ui/tutorialBubble.js';
import { renderDragonBlessingTip } from './ui/dragonBlessingTip.js';
import { playMixEffects } from './ui/mixEffects.js';
import {
  playPlantSfx,
  playMixSfx,
  playShrineUpgradeSfx,
  playDragonSlotSfx,
  playDragonEventStartSfx,
  playDragonEventEndSfx,
  playDiscoveryOpenSfx,
  unlockSfx,
} from './audio/sfx.js';

const RENDER_INTERVAL_MS = 1000;
const WATERING_ANIM_MS = 1625;
const UPROOT_ANIM_MS = 1000;
const MIX_SHINE_MS = 1500;

const state = load();
const unlockingPlotIds = new Set();
const wateringPlotIds = new Set();
const critterFlyingPlotIds = new Set();
const tanukiArrivingPlotIds = new Set();
const tanukiLeavingPlotIds = new Set();
const uprootingPlotIds = new Set();
const mixShinePlotIds = new Set();
const mixDiscoveryShinePlotIds = new Set();
// Shrine ids whose Dragon-bonus glow is deferred until sparks land.
const pendingBlessingVisualShrineIds = new Set();
// In-flight shrine upgrade spark bursts (arm epilogue after the last one).
let shrineTierUpVfxPending = 0;

const appEl = document.getElementById('app');
const boardEl = document.getElementById('farm-board');
const gridEl = document.getElementById('farm-grid');
const dragonTempleEl = document.getElementById('dragon-temple');
const gameTextEl = document.getElementById('game-text');

installStageFit(appEl);

const dragonTempleHandlers = {
  onPlace: handleDragonTemplePlace,
  onPlaceNext: handleDragonTemplePlaceNext,
  onBurnComplete: handleDragonTempleBurnComplete,
  onFigureClick: handleDragonTempleFigureClick,
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
    mixShinePlotIds,
    mixDiscoveryShinePlotIds,
  );
}

function render() {
  const now = Date.now();
  renderFarm();
  renderGameTextPanel(gameTextEl);
  renderDragonTemple(dragonTempleEl, state, dragonTempleHandlers);
  renderShrines(
    boardEl,
    state,
    handleOffer,
    handleShrineClick,
    pendingBlessingVisualShrineIds,
  );
  if (isTutorialGated(state)) {
    dragonTempleEl?.classList.add('dragon-temple--tutorial-inactive');
  } else {
    dragonTempleEl?.classList.remove('dragon-temple--tutorial-inactive');
  }
  renderTutorialBubble(state, tutorialBubbleCtx(now));
  renderDragonBlessingTip(state, dragonBlessingTipCtx());
}

function showPlotCropName(plotId) {
  const plot = state.plots.find((p) => p.id === plotId);
  if (!plot?.crop) return;
  const crop = getCrop(plot.crop.cropId);
  if (!crop?.name) return;
  const plotEl = gridEl.querySelector(`[data-plot-id="${plotId}"]`);
  if (!plotEl) return;
  pinCropTip(plotEl, crop.name, { small: true });
}

function handleTutorialInviteDismiss() {
  if (!dismissTutorialSoftInvite(state)) return;
  save(state);
  render();
}

function handleDragonBlessingTipDismiss() {
  if (!dismissDragonBlessingTip(state)) return;
  save(state);
  render();
}

function tutorialBubbleCtx(now = Date.now()) {
  return {
    boardEl,
    gridEl,
    now,
    onInviteDismiss: handleTutorialInviteDismiss,
  };
}

function dragonBlessingTipCtx() {
  return {
    boardEl,
    onDismiss: handleDragonBlessingTipDismiss,
  };
}

function playTrackedShrineTierUp({ shrineEl, showTierChip = true }) {
  shrineTierUpVfxPending += 1;
  playShrineTierUp({
    shrineEl,
    showTierChip,
    onComplete: () => {
      shrineTierUpVfxPending = Math.max(0, shrineTierUpVfxPending - 1);
      if (shrineTierUpVfxPending > 0) return;
      maybeArmShrineEpilogue(state);
      if (state.shrineEpilogueDueAt != null) {
        save(state);
      }
    },
  });
}

function handleShrineEpilogueClose() {
  if (!clearShrineEpiloguePendingUi(state)) return;
  save(state);
}

function tryShowShrineEpiloguePopup() {
  tryOpenShrineEpilogue(state, { onClose: handleShrineEpilogueClose });
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
    if (!canTutorialOpenPicker(state, plotId)) return;
    const plotEl = gridEl.querySelector(`[data-plot-id="${plotId}"]`);
    if (!plotEl) return;
    onTutorialPickerOpened(state, plotId);
    openCropPicker(state, plotEl, (cropId) => {
      const plantResult = plantCrop(state, plotId, cropId);
      const planted = state.plots.find((p) => p.id === plotId);
      if (planted?.crop?.cropId === cropId) {
        playPlantSfx(cropId);
      }
      save(state);
      render();
      if (plantResult?.burnedShrineId) {
        playDragonEventEndSfx();
        const shrineEl = boardEl.querySelector(
          `#shrine-${plantResult.burnedShrineId}`,
        );
        playShrineBurn({ shrineEl });
      }
    });
    renderTutorialBubble(state, tutorialBubbleCtx());
    return;
  }

  // Ready crops: short-click shows name; drag to offer / mix / temple.
  if (isReady(plot, Date.now())) {
    showPlotCropName(plotId);
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
      const watered = state.plots.find((p) => p.id === plotId);
      if (watered?.vined && watered.crop && isReady(watered, Date.now())) {
        watered.vined = false;
        save(state);
      }
      render();
    }, WATERING_ANIM_MS);
    return;
  }

  if (hasCritterVisit(plot, Date.now())) {
    const plotEl = gridEl.querySelector(`[data-plot-id="${plotId}"]`);
    const cueEl = plotEl?.querySelector('.plot__critter');
    const sourceRect =
      cueEl?.getBoundingClientRect() ?? plotEl?.getBoundingClientRect();

    const shrineId = pickNeediestShrine(state);
    const targetIconEl = shrineId
      ? boardEl.querySelector(`#shrine-${shrineId} .shrine__icon`)
      : null;
    const targetRect = targetIconEl?.getBoundingClientRect();

    critterFlyingPlotIds.add(plotId);
    // Flyer first so the perched cue never vanishes for a frame.
    playCritterFly({
      sourceRect,
      targetRect,
      onComplete: () => {
        critterFlyingPlotIds.delete(plotId);
        const result = welcomeCritter(state, plotId);
        if (result) {
          for (const unlockedId of result.unlockedPlotIds) {
            unlockingPlotIds.add(unlockedId);
          }
          save(state);
          if ((result.tiersGained ?? 0) > 0 && result.shrineId) {
            playShrineUpgradeSfx();
            const shrineEl = boardEl.querySelector(
              `#shrine-${result.shrineId}`,
            );
            playTrackedShrineTierUp({ shrineEl });
          }
        }
        render();
      },
    });
    renderFarm();
    return;
  }

  showPlotCropName(plotId);
}

function handleUprootHold(plotId) {
  if (!canTutorialUproot(state)) return;
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
  const mixResult = mixAdjacentReadyPlots(state, fromPlotId, toPlotId);
  if (!mixResult) return;
  playMixSfx(mixResult.resultId);
  mixShinePlotIds.add(toPlotId);
  if (mixResult.isNewDiscovery) {
    mixDiscoveryShinePlotIds.add(toPlotId);
  }
  save(state);
  render();
  const plotEl = gridEl?.querySelector(`[data-plot-id="${toPlotId}"]`);
  playMixEffects({
    plotEl,
    discovery: mixResult.isNewDiscovery,
  });
  window.setTimeout(() => {
    if (!mixShinePlotIds.has(toPlotId)) return;
    mixShinePlotIds.delete(toPlotId);
    mixDiscoveryShinePlotIds.delete(toPlotId);
    render();
  }, MIX_SHINE_MS);
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
  const result = offerCrop(state, shrineId, cropId, plotId);
  if (!result) {
    // Allowlist rejects set game text / may tick decay; refresh farm + text
    // only — skip shrine/temple remounts (progress and temple unchanged).
    save(state);
    renderFarm();
    renderGameTextPanel(gameTextEl);
    return;
  }

  for (const unlockedId of result.unlockedPlotIds) {
    unlockingPlotIds.add(unlockedId);
  }
  if (result.flushedTigerBonus) {
    for (const unlockedId of result.flushedTigerBonus.unlockedPlotIds) {
      unlockingPlotIds.add(unlockedId);
    }
  }

  save(state);
  render();

  if (result.flushedTigerBonus) {
    playOfferingProgressAtShrine(
      result.flushedTigerBonus.shrineId,
      result.flushedTigerBonus.progressAmount,
    );
  }
  playOfferingProgressAtShrine(shrineId, result.progressAmount);

  if (result.flushedTigerBonus?.tiersGained > 0) {
    playShrineUpgradeSfx();
    const flushedEl = boardEl.querySelector(
      `#shrine-${result.flushedTigerBonus.shrineId}`,
    );
    playTrackedShrineTierUp({ shrineEl: flushedEl });
  }

  if ((result.tiersGained ?? 0) > 0) {
    playShrineUpgradeSfx();
    const shrineEl = boardEl.querySelector(`#shrine-${shrineId}`);
    playTrackedShrineTierUp({ shrineEl });
  } else if (result.tutorialCompleted) {
    // FTUE Fox demo finish: sparks only (no Tier up chip / upgrade SFX).
    const shrineEl = boardEl.querySelector(`#shrine-${shrineId}`);
    playTrackedShrineTierUp({ shrineEl, showTierChip: false });
  }

  if (result.burnedShrineId) {
    playDragonEventEndSfx();
    const burnedEl = boardEl.querySelector(
      `#shrine-${result.burnedShrineId}`,
    );
    playShrineBurn({ shrineEl: burnedEl });
  }

  if (result.dragonWoke) {
    playDragonEventStartSfx();
  }

  if (result.bonus) {
    const shrineIconEl = boardEl.querySelector(
      `#shrine-${shrineId} .shrine__icon`,
    );
    const crop = getCrop(result.cropId);
    playHarvestCropFly({
      shrineId,
      targetRect: shrineIconEl?.getBoundingClientRect() ?? null,
      cropId: result.cropId,
      icon: crop?.icon ?? '',
      withSparks: true,
      onComplete: () => {
        const pending = state.pendingTigerBonus;
        // Stale fly after a newer offer flushed/replaced this pending.
        if (
          !pending ||
          pending.shrineId !== shrineId ||
          pending.cropId !== result.cropId
        ) {
          save(state);
          render();
          return;
        }
        const bonusResult = applyPendingTigerBonus(state);
        if (!bonusResult) {
          save(state);
          render();
          return;
        }
        for (const unlockedId of bonusResult.unlockedPlotIds) {
          unlockingPlotIds.add(unlockedId);
        }
        save(state);
        render();
        playOfferingProgressAtShrine(
          shrineId,
          bonusResult.progressAmount,
        );
        if ((bonusResult.tiersGained ?? 0) > 0) {
          playShrineUpgradeSfx();
          const shrineEl = boardEl.querySelector(`#shrine-${shrineId}`);
          playTrackedShrineTierUp({ shrineEl });
        }
      },
    });
  }
}

function playOfferingProgressAtShrine(shrineId, amount) {
  if (typeof amount !== 'number' || amount <= 0) return;
  const shrineEl = boardEl.querySelector(`#shrine-${shrineId}`);
  playOfferingProgressPop({
    trackEl: shrineEl?.querySelector('.shrine__progress-track') ?? null,
    iconEl: shrineEl?.querySelector('.shrine__icon') ?? null,
    amount,
    shrineId,
  });
}

function handleShrineClick(shrineId) {
  if (!canTutorialOpenShrineDetail(state)) return;
  openShrineDetail(state, shrineId);
}

function handleDragonTempleFigureClick() {
  if (!canTutorialTemple(state)) return;
  openDragonTempleDetail(state);
}

function handleDragonTemplePlace(slotIndex, cropId, plotId = null) {
  if (!canTutorialTemple(state)) return;
  if (!placeDragonTempleSlot(state, slotIndex, cropId, plotId)) return;
  playDragonSlotSfx();
  // Win burn SFX with the rising flames, not after they finish.
  if (state.dragonTemple?.burning) {
    playDragonEventEndSfx();
  }
  suppressNextDragonTempleFigureClick();
  save(state);
  render();
}

function handleDragonTemplePlaceNext(cropId, plotId = null) {
  if (!canTutorialTemple(state)) return;
  if (!placeDragonTempleNextSlot(state, cropId, plotId)) return;
  playDragonSlotSfx();
  if (state.dragonTemple?.burning) {
    playDragonEventEndSfx();
  }
  suppressNextDragonTempleFigureClick();
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
    if (outcome === 'success') {
      playTempleWinPrize();
      return;
    }
    save(state);
    render();
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
    if (!maxed) {
      armDragonBlessingTip(state, shrineId);
      save(state);
    }
    render();
    return;
  }

  playTempleRewardSparks({
    sourceEl: dragonTempleEl,
    targetIconEl: iconEl,
    onComplete: () => {
      pendingBlessingVisualShrineIds.delete(shrineId);
      if (!maxed) {
        armDragonBlessingTip(state, shrineId);
        save(state);
      }
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

  if (tickTutorial(state, now)) {
    dirty = true;
  }

  if (markReadyCropsDiscovered(state, now)) {
    dirty = true;
  }

  const napperResult = reconcilePlotNapper(state, now);
  if (napperResult.changed) {
    dirty = true;
  }

  if (maybeShowShrineEpilogue(state, now)) {
    dirty = true;
  }

  tryShowShrineEpiloguePopup();

  if (dirty) {
    save(state);
    renderGameTextPanel(gameTextEl);
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
  renderTutorialBubble(state, tutorialBubbleCtx(now));
  renderDragonBlessingTip(state, dragonBlessingTipCtx());
  if (isTutorialActive(state)) {
    renderShrines(
      boardEl,
      state,
      handleOffer,
      handleShrineClick,
      pendingBlessingVisualShrineIds,
    );
  }
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
    closeShrineEpilogue({ skipOnClose: true });
    resetState(state);
    unlockingPlotIds.clear();
    wateringPlotIds.clear();
    critterFlyingPlotIds.clear();
    tanukiArrivingPlotIds.clear();
    tanukiLeavingPlotIds.clear();
    uprootingPlotIds.clear();
    mixShinePlotIds.clear();
    mixDiscoveryShinePlotIds.clear();
    pendingBlessingVisualShrineIds.clear();
    shrineTierUpVfxPending = 0;
    save(state);
    groveWarmed = false;
    opening.show();
    render();
  });
}

// :active ends on pointerup (before click), so a class + short delay makes
// the plank press readable before Discovery Log covers it.
const GAME_TEXT_PRESS_MS = 140;

function handleDiscoveryLog() {
  if (gameTextEl?.dataset.opening === '1') return;
  // Fire SFX in the click gesture (not after the press delay) so Chrome can
  // unlock / resume the AudioContext.
  unlockSfx();
  playDiscoveryOpenSfx();
  if (!gameTextEl) {
    openDiscoveryLog(state, handleResetGame);
    return;
  }
  gameTextEl.dataset.opening = '1';
  gameTextEl.classList.add('game-text--pressed');
  window.setTimeout(() => {
    gameTextEl.classList.remove('game-text--pressed');
    delete gameTextEl.dataset.opening;
    openDiscoveryLog(state, handleResetGame);
  }, GAME_TEXT_PRESS_MS);
}

if (gameTextEl) {
  gameTextEl.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    gameTextEl.classList.add('game-text--pressed');
  });
  gameTextEl.addEventListener('pointercancel', () => {
    if (gameTextEl.dataset.opening === '1') return;
    gameTextEl.classList.remove('game-text--pressed');
  });
  gameTextEl.addEventListener('pointerleave', () => {
    if (gameTextEl.dataset.opening === '1') return;
    gameTextEl.classList.remove('game-text--pressed');
  });
  gameTextEl.onclick = handleDiscoveryLog;
}

let gameStarted = false;
let groveWarmed = false;

const opening = installOpeningScreen({
  onWarm() {
    render();
    groveWarmed = true;
  },
  onEnter() {
    if (!groveWarmed) {
      render();
      groveWarmed = true;
    }
    if (!gameStarted) {
      gameStarted = true;
      setInterval(tick, RENDER_INTERVAL_MS);
    }
    tryShowShrineEpiloguePopup();
  },
});
