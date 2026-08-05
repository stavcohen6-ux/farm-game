/** Hard step-lock start FTUE (Fox demo bar + speech bubbles). */

import {
  TUTORIAL_LEFT_PLOT_ID,
  TUTORIAL_RIGHT_PLOT_ID,
} from './farmLayout.js';

export const TUTORIAL_LEFT_PLOT = TUTORIAL_LEFT_PLOT_ID;
export const TUTORIAL_RIGHT_PLOT = TUTORIAL_RIGHT_PLOT_ID;

/** Fox FTUE progress bar max (same UI as normal shrine bars). */
export const TUTORIAL_FOX_PROGRESS_REQUIRED = 5;
/** Wheat offering fills this much of the FTUE Fox bar (once). */
export const TUTORIAL_FOX_WHEAT_PROGRESS = 1;
/** Growth multiplier for FTUE Wheat and Turnip (4× faster ⇒ ms / 4). */
export const TUTORIAL_FAST_GROWTH_DIVISOR = 4;

export const TUTORIAL_STEPS = [
  'tapWheatPlot',
  'pickWheat',
  'growWheat',
  'offerWheat',
  'tapTurnipPlot',
  'pickTurnip',
  'growTurnip',
  'tapWheatPlot2',
  'pickWheat2',
  'growWheat2',
  'waitBothReady',
  'mix',
  'offerRootLoaf',
  'exploreBoard',
  'fieldNotesInvite',
  'done',
];

export const TUTORIAL_STEP_START = 'tapWheatPlot';
export const TUTORIAL_STEP_EXPLORE = 'exploreBoard';
export const TUTORIAL_STEP_FIELD_NOTES = 'fieldNotesInvite';
export const TUTORIAL_STEP_DONE = 'done';

/** Plots unlocked when the Fox FTUE bar completes (explore invite anchor). */
export const TUTORIAL_UNLOCK_PLOT_IDS = [0, 1];

export const TUTORIAL_BUBBLE_LINES = {
  tapWheatPlot: 'Tap this plot to plant.',
  pickWheat: 'Choose Wheat.',
  growWheat: 'Wait for Wheat to ripen.',
  offerWheat: 'Drag ready Wheat to the Fox shrine.',
  tapTurnipPlot: 'Tap this plot to plant Turnip.',
  pickTurnip: 'Choose Turnip.',
  growTurnip: 'Wait for Turnip to ripen. Tap to water if the soil looks dry.',
  growTurnipDry: 'Tap to water your Turnip.',
  tapWheatPlot2: 'Plant Wheat next to your Turnip.',
  pickWheat2: 'Choose Wheat.',
  growWheat2: 'Wait for Wheat to ripen. Tap to water if the soil looks dry.',
  growWheat2Dry: 'Tap to water your Wheat.',
  waitBothReady: 'Wait until both crops are ready.',
  mix: 'Drag one ready crop onto the other.',
  offerRootLoaf: 'Drag the Root Loaf to the Fox shrine.',
  exploreBoard:
    'The Fox thanks you for your offerings and has opened more land. Continue exploring the farm.',
  fieldNotesInvite:
    'Tap here to see all of your discovered crops and for tips on how to play',
};

export function isTutorialStep(step) {
  return typeof step === 'string' && TUTORIAL_STEPS.includes(step);
}

export function isTutorialActive(state) {
  return isTutorialStep(state?.tutorialStep) && state.tutorialStep !== TUTORIAL_STEP_DONE;
}

/** Soft invite after unlock — bubble only; no action gates. */
export function isTutorialExploreInvite(state) {
  return state?.tutorialStep === TUTORIAL_STEP_EXPLORE;
}

/** Soft invite pointing at Field Notes — bubble only; no action gates. */
export function isTutorialFieldNotesInvite(state) {
  return state?.tutorialStep === TUTORIAL_STEP_FIELD_NOTES;
}

/** Free-play suggestion bubbles (dismiss on next tap; not hard-gated). */
export function isTutorialSoftInvite(state) {
  return isTutorialExploreInvite(state) || isTutorialFieldNotesInvite(state);
}

/** True while FTUE still restricts planting / offers / temple / etc. */
export function isTutorialGated(state) {
  return isTutorialActive(state) && !isTutorialSoftInvite(state);
}

export function isTutorialComplete(state) {
  return state?.tutorialStep === TUTORIAL_STEP_DONE;
}

/** Bubble copy for the current step (dry-soil variants when needing water). */
export function getTutorialBubbleText(state, now = Date.now()) {
  const step = state?.tutorialStep;
  if (!isTutorialStep(step) || step === TUTORIAL_STEP_DONE) return '';

  if (step === 'growTurnip' && plotNeedsWater(state, TUTORIAL_RIGHT_PLOT, now)) {
    return TUTORIAL_BUBBLE_LINES.growTurnipDry;
  }
  if (step === 'growWheat2' && plotNeedsWater(state, TUTORIAL_LEFT_PLOT, now)) {
    return TUTORIAL_BUBBLE_LINES.growWheat2Dry;
  }
  return TUTORIAL_BUBBLE_LINES[step] ?? '';
}

function plotNeedsWater(state, plotId, now) {
  const plot = state?.plots?.find((p) => p.id === plotId);
  if (!plot?.crop) return false;
  if (plot.crop.watered) return false;
  if (typeof plot.crop.waterRequestAt !== 'number') return false;
  const growthMs =
    typeof plot.crop.growthMs === 'number' ? plot.crop.growthMs : 0;
  const ready = now - plot.crop.plantedAt >= growthMs;
  if (ready) return false;
  return now >= plot.crop.waterRequestAt;
}

/**
 * Crops the player may select on the FTUE plant wheel.
 * Returns null when not in a pick step (use normal unlock rules).
 * @returns {null | { allow: Set<string>, lockVisible: Set<string> }}
 */
export function getTutorialPlantMask(state) {
  if (!isTutorialActive(state)) return null;
  switch (state.tutorialStep) {
    case 'pickWheat':
    case 'pickWheat2':
    case 'tapWheatPlot':
    case 'tapWheatPlot2':
      return {
        allow: new Set(['wheat']),
        lockVisible: new Set(['turnip']),
      };
    case 'pickTurnip':
    case 'tapTurnipPlot':
      return {
        allow: new Set(['turnip']),
        lockVisible: new Set(['wheat']),
      };
    default:
      return null;
  }
}

/** True if this crop may be planted during the current FTUE pick/tap step. */
export function isTutorialCropPlantable(state, cropId) {
  const mask = getTutorialPlantMask(state);
  if (!mask) return true;
  return mask.allow.has(cropId);
}

/**
 * Effective unlock for the crop picker during FTUE.
 * Research-locked crops stay locked; FTUE mask can also lock Wheat/Turnip.
 */
export function isTutorialPickerCropUnlocked(state, crop, researchUnlocked) {
  if (!researchUnlocked) return false;
  const mask = getTutorialPlantMask(state);
  if (!mask) return true;
  if (mask.allow.has(crop.id)) return true;
  // Show as locked (visible) when in lockVisible or any other plantable.
  return false;
}

export function getTutorialTargetPlotIds(state) {
  if (!isTutorialActive(state)) return [];
  switch (state.tutorialStep) {
    case 'tapWheatPlot':
    case 'pickWheat':
    case 'growWheat':
    case 'offerWheat':
    case 'tapWheatPlot2':
    case 'pickWheat2':
    case 'growWheat2':
      return [TUTORIAL_LEFT_PLOT];
    case 'tapTurnipPlot':
    case 'pickTurnip':
    case 'growTurnip':
      return [TUTORIAL_RIGHT_PLOT];
    case 'waitBothReady':
    case 'mix':
      return [TUTORIAL_LEFT_PLOT, TUTORIAL_RIGHT_PLOT];
    case 'offerRootLoaf':
      return findRootLoafPlotIds(state);
    default:
      return [];
  }
}

function findRootLoafPlotIds(state) {
  const ids = [];
  for (const id of [TUTORIAL_LEFT_PLOT, TUTORIAL_RIGHT_PLOT]) {
    const plot = state.plots?.find((p) => p.id === id);
    if (plot?.crop?.cropId === 'root_loaf') ids.push(id);
  }
  return ids;
}

export function isTutorialFoxTarget(state) {
  return (
    isTutorialActive(state) &&
    (state.tutorialStep === 'offerWheat' ||
      state.tutorialStep === 'offerRootLoaf')
  );
}
