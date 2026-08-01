/** Start-of-game contextual tips for the Field Notes plank. */

import { SHRINE_EPILOGUE_LINE } from './shrines.js';

export const TUTORIAL_FLAG_KEYS = [
  'welcome',
  'firstReady',
  'firstOffer',
  'mixInvite',
  'firstMix',
];

export const TUTORIAL_LINES = {
  welcome: 'Tap an empty plot to plant.',
  firstReady: 'Drag a ready crop to a shrine.',
  firstOffer: "Offerings earn the guardians' favor.",
  mixInvite: 'Ready crops side by side can mix into something new.',
  firstMix: 'Mixing ready crops creates something new.',
};

/** Exact Dragon / epilogue lines that block tutorial tips from overwriting. */
const CRITICAL_GAME_TEXT_EXACT = new Set([
  'Dragon awakens! Offer crops or face its wrath.',
  "The Dragon's wrath fades - you got lucky.",
  SHRINE_EPILOGUE_LINE,
]);

export function isTutorialGameText(text) {
  if (typeof text !== 'string') return false;
  return TUTORIAL_FLAG_KEYS.some((key) => TUTORIAL_LINES[key] === text);
}

/**
 * True for Dragon wake/win/lose, shrine upgraded, and epilogue.
 * Shrine reject is not critical — tips may overwrite it.
 */
export function isCriticalGameText(text) {
  if (typeof text !== 'string' || text === '') return false;
  if (CRITICAL_GAME_TEXT_EXACT.has(text)) return true;
  if (text.startsWith('The Dragon blesses your ') && text.endsWith(' Shrine.')) {
    return true;
  }
  if (text.startsWith('The Dragon burnt your ') && text.endsWith(' Shrine.')) {
    return true;
  }
  // e.g. "Frog Shrine upgraded"
  if (text.endsWith(' upgraded')) return true;
  return false;
}
