/**
 * Hard step-lock FTUE flow: advances, gates, Fox demo bar, desync repair.
 */

import { getGrowthMs } from '../data/crops.js';
import { findAlchemyResult } from '../data/alchemyRecipes.js';
import {
  TUTORIAL_LEFT_PLOT,
  TUTORIAL_RIGHT_PLOT,
  TUTORIAL_FOX_PROGRESS_REQUIRED,
  TUTORIAL_FOX_WHEAT_PROGRESS,
  TUTORIAL_FAST_GROWTH_DIVISOR,
  TUTORIAL_STEP_START,
  TUTORIAL_STEP_EXPLORE,
  TUTORIAL_STEP_FIELD_NOTES,
  TUTORIAL_STEP_DONE,
  TUTORIAL_UNLOCK_PLOT_IDS,
  isTutorialActive,
  isTutorialExploreInvite,
  isTutorialFieldNotesInvite,
  isTutorialSoftInvite,
  isTutorialGated,
  isTutorialStep,
  isTutorialCropPlantable,
} from '../data/tutorial.js';

export {
  isTutorialActive,
  isTutorialComplete,
  isTutorialExploreInvite,
  isTutorialFieldNotesInvite,
  isTutorialSoftInvite,
  isTutorialGated,
  getTutorialBubbleText,
  getTutorialTargetPlotIds,
  isTutorialFoxTarget,
  getTutorialPlantMask,
  isTutorialPickerCropUnlocked,
  isTutorialCropPlantable,
  TUTORIAL_FOX_PROGRESS_REQUIRED,
  TUTORIAL_STEP_DONE,
  TUTORIAL_STEP_START,
  TUTORIAL_STEP_EXPLORE,
  TUTORIAL_STEP_FIELD_NOTES,
} from '../data/tutorial.js';

function plotById(state, plotId) {
  return state.plots?.find((p) => p.id === plotId) ?? null;
}

function cropReady(plot, now) {
  if (!plot?.crop) return false;
  const growthMs =
    typeof plot.crop.growthMs === 'number' ? plot.crop.growthMs : 0;
  return now - plot.crop.plantedAt >= growthMs;
}

function cropGrowing(plot, now) {
  return Boolean(plot?.crop) && !cropReady(plot, now);
}

export function setTutorialStep(state, step) {
  if (!isTutorialStep(step)) return;
  state.tutorialStep = step;
}

/** Fox bar fill while gated FTUE is active (demo max 5). */
export function getTutorialFoxProgress(state) {
  if (!isTutorialGated(state)) return null;
  const progress = state.tutorialFoxWheatOffered
    ? TUTORIAL_FOX_WHEAT_PROGRESS
    : 0;
  return {
    progress,
    progressRequired: TUTORIAL_FOX_PROGRESS_REQUIRED,
  };
}

export function forceWaterRequest(plantedAt, growthMs) {
  const t = 0.35 + Math.random() * 0.25;
  return {
    watered: false,
    waterRequestAt: plantedAt + growthMs * t,
  };
}

/** Growth ms for an FTUE plant (4× on wheat + turnip during FTUE). */
export function getTutorialPlantGrowthMs(state, cropId, baseGrowthMs) {
  if (!isTutorialGated(state)) return baseGrowthMs;
  const step = state.tutorialStep;
  if (
    (cropId === 'wheat' &&
      (step === 'pickWheat' ||
        step === 'tapWheatPlot' ||
        step === 'pickWheat2' ||
        step === 'tapWheatPlot2')) ||
    (cropId === 'turnip' &&
      (step === 'pickTurnip' || step === 'tapTurnipPlot'))
  ) {
    return Math.max(1, Math.floor(baseGrowthMs / TUTORIAL_FAST_GROWTH_DIVISOR));
  }
  return baseGrowthMs;
}

export function canTutorialOpenPicker(state, plotId) {
  if (!isTutorialGated(state)) return true;
  const step = state.tutorialStep;
  if (
    (step === 'tapWheatPlot' || step === 'pickWheat') &&
    plotId === TUTORIAL_LEFT_PLOT
  ) {
    return true;
  }
  if (
    (step === 'tapTurnipPlot' || step === 'pickTurnip') &&
    plotId === TUTORIAL_RIGHT_PLOT
  ) {
    return true;
  }
  if (
    (step === 'tapWheatPlot2' || step === 'pickWheat2') &&
    plotId === TUTORIAL_LEFT_PLOT
  ) {
    return true;
  }
  return false;
}

export function onTutorialPickerOpened(state, plotId) {
  if (!isTutorialGated(state)) return;
  if (
    state.tutorialStep === 'tapWheatPlot' &&
    plotId === TUTORIAL_LEFT_PLOT
  ) {
    setTutorialStep(state, 'pickWheat');
  } else if (
    state.tutorialStep === 'tapTurnipPlot' &&
    plotId === TUTORIAL_RIGHT_PLOT
  ) {
    setTutorialStep(state, 'pickTurnip');
  } else if (
    state.tutorialStep === 'tapWheatPlot2' &&
    plotId === TUTORIAL_LEFT_PLOT
  ) {
    setTutorialStep(state, 'pickWheat2');
  }
}

export function onTutorialPlanted(state, plotId, cropId) {
  if (!isTutorialGated(state)) return;
  if (
    state.tutorialStep === 'pickWheat' &&
    plotId === TUTORIAL_LEFT_PLOT &&
    cropId === 'wheat'
  ) {
    setTutorialStep(state, 'growWheat');
  } else if (
    state.tutorialStep === 'pickTurnip' &&
    plotId === TUTORIAL_RIGHT_PLOT &&
    cropId === 'turnip'
  ) {
    setTutorialStep(state, 'growTurnip');
  } else if (
    state.tutorialStep === 'pickWheat2' &&
    plotId === TUTORIAL_LEFT_PLOT &&
    cropId === 'wheat'
  ) {
    setTutorialStep(state, 'growWheat2');
  }
}

/**
 * Advance grow / wait steps when crops become ready.
 * Returns true if step changed.
 */
export function tickTutorial(state, now = Date.now()) {
  if (!isTutorialGated(state)) return false;
  const before = state.tutorialStep;
  repairTutorialState(state, now);

  const left = plotById(state, TUTORIAL_LEFT_PLOT);
  const right = plotById(state, TUTORIAL_RIGHT_PLOT);

  if (state.tutorialStep === 'growWheat' && cropReady(left, now)) {
    setTutorialStep(state, 'offerWheat');
  } else if (state.tutorialStep === 'growTurnip' && cropReady(right, now)) {
    setTutorialStep(state, 'tapWheatPlot2');
  } else if (state.tutorialStep === 'growWheat2') {
    if (cropReady(left, now) && cropReady(right, now)) {
      setTutorialStep(state, 'mix');
    } else if (cropReady(left, now) || cropReady(right, now)) {
      setTutorialStep(state, 'waitBothReady');
    }
  } else if (state.tutorialStep === 'waitBothReady') {
    if (cropReady(left, now) && cropReady(right, now)) {
      setTutorialStep(state, 'mix');
    }
  }

  return state.tutorialStep !== before;
}

export function canTutorialUproot(state) {
  return !isTutorialGated(state);
}

export function canTutorialOffer(state, shrineId, cropId) {
  if (!isTutorialGated(state)) return true;
  if (shrineId !== 'fox') return false;
  if (state.tutorialStep === 'offerWheat') {
    return cropId === 'wheat' && !state.tutorialFoxWheatOffered;
  }
  if (state.tutorialStep === 'offerRootLoaf') {
    return cropId === 'root_loaf' && state.tutorialFoxWheatOffered;
  }
  return false;
}

export function canTutorialDragReadyCrop(state, plotId, cropId) {
  if (!isTutorialGated(state)) return true;
  const step = state.tutorialStep;
  if (step === 'offerWheat') {
    return plotId === TUTORIAL_LEFT_PLOT && cropId === 'wheat';
  }
  if (step === 'mix') {
    return (
      (plotId === TUTORIAL_LEFT_PLOT || plotId === TUTORIAL_RIGHT_PLOT) &&
      (cropId === 'wheat' || cropId === 'turnip')
    );
  }
  if (step === 'offerRootLoaf') {
    return cropId === 'root_loaf';
  }
  return false;
}

/** On-plot mix is only allowed on the FTUE mix step between the two starter plots. */
export function canTutorialMix(state, fromPlotId, toPlotId) {
  if (!isTutorialGated(state)) return true;
  if (state.tutorialStep !== 'mix') return false;
  return (
    (fromPlotId === TUTORIAL_LEFT_PLOT && toPlotId === TUTORIAL_RIGHT_PLOT) ||
    (fromPlotId === TUTORIAL_RIGHT_PLOT && toPlotId === TUTORIAL_LEFT_PLOT)
  );
}

export function canTutorialTemple(state) {
  return !isTutorialGated(state);
}

export function canTutorialOpenShrineDetail(state) {
  return !isTutorialGated(state);
}

/**
 * Apply FTUE Fox offering (wheat once or root loaf finish).
 * Caller must already have validated and removed the crop from the plot.
 * Returns `{ completed, unlockedPlotIds }` or null if rejected.
 */
export function applyTutorialFoxOffer(state, cropId) {
  if (!isTutorialGated(state)) return null;

  if (
    state.tutorialStep === 'offerWheat' &&
    cropId === 'wheat' &&
    !state.tutorialFoxWheatOffered
  ) {
    state.tutorialFoxWheatOffered = true;
    setTutorialStep(state, 'tapTurnipPlot');
    return { completed: false, unlockedPlotIds: [], tiersGained: 0 };
  }

  if (
    state.tutorialStep === 'offerRootLoaf' &&
    cropId === 'root_loaf' &&
    state.tutorialFoxWheatOffered
  ) {
    const unlockedPlotIds = completeTutorial(state);
    return { completed: true, unlockedPlotIds, tiersGained: 0 };
  }

  return null;
}

/** Unlock upper starter plots, open explore invite, reset Fox shrine to free-play. */
export function completeTutorial(state) {
  const unlockedPlotIds = [];
  const byId = new Map(state.plots.map((p) => [p.id, p]));
  for (const plotId of TUTORIAL_UNLOCK_PLOT_IDS) {
    const plot = byId.get(plotId);
    if (!plot) continue;
    if (plot.locked) {
      plot.locked = false;
      unlockedPlotIds.push(plotId);
    }
  }
  state.tutorialStep = TUTORIAL_STEP_EXPLORE;
  state.tutorialFoxWheatOffered = true;
  if (state.shrines?.fox) {
    state.shrines.fox.tier = 0;
    state.shrines.fox.progress = 0;
  }
  return unlockedPlotIds;
}

/** Dismiss the post-unlock explore bubble → Field Notes suggestion. */
export function dismissTutorialExploreInvite(state) {
  if (!isTutorialExploreInvite(state)) return false;
  setTutorialStep(state, TUTORIAL_STEP_FIELD_NOTES);
  return true;
}

/** Dismiss the Field Notes suggestion into done (any tap; opening log optional). */
export function dismissTutorialFieldNotesInvite(state) {
  if (!isTutorialFieldNotesInvite(state)) return false;
  setTutorialStep(state, TUTORIAL_STEP_DONE);
  return true;
}

/** Dismiss whichever soft invite bubble is showing. */
export function dismissTutorialSoftInvite(state) {
  if (dismissTutorialExploreInvite(state)) return true;
  return dismissTutorialFieldNotesInvite(state);
}

export function onTutorialMixed(state) {
  if (!isTutorialGated(state)) return;
  if (state.tutorialStep === 'mix') {
    setTutorialStep(state, 'offerRootLoaf');
  }
}

/**
 * Repair FTUE step vs board. Safe to call often.
 * Returns true if something changed.
 */
export function repairTutorialState(state, now = Date.now()) {
  if (!isTutorialGated(state)) return false;
  let changed = false;

  // Sync fox wheat flag vs step
  if (state.tutorialFoxWheatOffered && state.tutorialStep === 'offerWheat') {
    setTutorialStep(state, 'tapTurnipPlot');
    changed = true;
  }
  if (
    !state.tutorialFoxWheatOffered &&
    state.tutorialStep === 'offerRootLoaf'
  ) {
    setTutorialStep(state, 'offerWheat');
    changed = true;
  }

  const left = plotById(state, TUTORIAL_LEFT_PLOT);
  const right = plotById(state, TUTORIAL_RIGHT_PLOT);
  const step = state.tutorialStep;

  if (step === 'offerWheat') {
    if (!left?.crop) {
      setTutorialStep(state, 'tapWheatPlot');
      changed = true;
    } else if (left.crop.cropId !== 'wheat') {
      left.crop = null;
      setTutorialStep(state, 'tapWheatPlot');
      changed = true;
    } else if (cropGrowing(left, now)) {
      setTutorialStep(state, 'growWheat');
      changed = true;
    }
  } else if (step === 'growWheat') {
    if (!left?.crop || left.crop.cropId !== 'wheat') {
      setTutorialStep(state, 'tapWheatPlot');
      changed = true;
    }
  } else if (step === 'offerRootLoaf') {
    const hasLoaf =
      left?.crop?.cropId === 'root_loaf' || right?.crop?.cropId === 'root_loaf';
    if (!hasLoaf) {
      if (
        cropReady(left, now) &&
        cropReady(right, now) &&
        findAlchemyResult(left.crop.cropId, right.crop.cropId)
      ) {
        setTutorialStep(state, 'mix');
      } else {
        repairFromBoard(state, now);
      }
      changed = true;
    }
  } else if (step === 'mix' || step === 'waitBothReady') {
    if (!left?.crop || !right?.crop) {
      repairFromBoard(state, now);
      changed = true;
    }
  } else if (step === 'growTurnip') {
    if (!right?.crop || right.crop.cropId !== 'turnip') {
      setTutorialStep(state, 'tapTurnipPlot');
      changed = true;
    }
  } else if (step === 'growWheat2') {
    if (!left?.crop || left.crop.cropId !== 'wheat') {
      setTutorialStep(state, 'tapWheatPlot2');
      changed = true;
    }
  }

  return changed;
}

function repairFromBoard(state, now) {
  const left = plotById(state, TUTORIAL_LEFT_PLOT);
  const right = plotById(state, TUTORIAL_RIGHT_PLOT);

  if (!state.tutorialFoxWheatOffered) {
    if (!left?.crop) setTutorialStep(state, 'tapWheatPlot');
    else if (left.crop.cropId === 'wheat' && cropGrowing(left, now)) {
      setTutorialStep(state, 'growWheat');
    } else if (left.crop.cropId === 'wheat' && cropReady(left, now)) {
      setTutorialStep(state, 'offerWheat');
    } else setTutorialStep(state, 'tapWheatPlot');
    return;
  }

  // After wheat offered
  if (left?.crop?.cropId === 'root_loaf' || right?.crop?.cropId === 'root_loaf') {
    setTutorialStep(state, 'offerRootLoaf');
    return;
  }
  if (
    cropReady(left, now) &&
    cropReady(right, now) &&
    findAlchemyResult(left?.crop?.cropId, right?.crop?.cropId)
  ) {
    setTutorialStep(state, 'mix');
    return;
  }
  if (!right?.crop) {
    setTutorialStep(state, 'tapTurnipPlot');
    return;
  }
  if (right.crop.cropId === 'turnip' && cropGrowing(right, now)) {
    setTutorialStep(state, 'growTurnip');
    return;
  }
  if (!left?.crop) {
    setTutorialStep(state, 'tapWheatPlot2');
    return;
  }
  if (left.crop.cropId === 'wheat' && cropGrowing(left, now)) {
    setTutorialStep(state, 'growWheat2');
    return;
  }
  setTutorialStep(state, 'waitBothReady');
}

/** Whether planting this crop on this plot is allowed in FTUE. */
export function canTutorialPlant(state, plotId, cropId) {
  if (!isTutorialGated(state)) return true;
  if (!isTutorialCropPlantable(state, cropId)) return false;
  const step = state.tutorialStep;
  if (
    (step === 'pickWheat' || step === 'tapWheatPlot') &&
    plotId === TUTORIAL_LEFT_PLOT &&
    cropId === 'wheat'
  ) {
    return true;
  }
  if (
    (step === 'pickTurnip' || step === 'tapTurnipPlot') &&
    plotId === TUTORIAL_RIGHT_PLOT &&
    cropId === 'turnip'
  ) {
    return true;
  }
  if (
    (step === 'pickWheat2' || step === 'tapWheatPlot2') &&
    plotId === TUTORIAL_LEFT_PLOT &&
    cropId === 'wheat'
  ) {
    return true;
  }
  return false;
}

export function shouldForceTutorialWater(state, cropId) {
  if (!isTutorialGated(state)) return false;
  // One forced cue on every FTUE plant of wheat/turnip
  return cropId === 'wheat' || cropId === 'turnip';
}

export function getBaseGrowthMsForCrop(crop) {
  return getGrowthMs(crop);
}

export function shouldSuppressDragonDuringTutorial(state) {
  return isTutorialGated(state);
}

export function shouldSuppressPlotNapperDuringTutorial(state) {
  return isTutorialGated(state);
}
