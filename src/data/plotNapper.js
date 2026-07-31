// Plot napper (tanuki) config. Tunables for harvest trigger, delay, nap length.
// See docs/GAME_DESIGN.md → Plot visitors (tanuki nap).

export const PLOT_NAPPER = {
  // Chance a successful harvest schedules a tanuki (0–1)
  harvestChance: 0.15,
  // Appear delay after schedule (inclusive random range, seconds)
  delayMinSeconds: 8,
  delayMaxSeconds: 20,
  // Nap duration once sleeping (inclusive random range, seconds)
  napMinSeconds: 90,
  napMaxSeconds: 150,
  // Do not schedule until the farm has at least this many unlocked plots
  minUnlockedPlots: 8,
};

export function getPlotNapperDelayMs() {
  const min = PLOT_NAPPER.delayMinSeconds;
  const max = PLOT_NAPPER.delayMaxSeconds;
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  const seconds = lo + Math.random() * (hi - lo);
  return seconds * 1000;
}

export function getPlotNapMs() {
  const min = PLOT_NAPPER.napMinSeconds;
  const max = PLOT_NAPPER.napMaxSeconds;
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  const seconds = lo + Math.random() * (hi - lo);
  return seconds * 1000;
}
