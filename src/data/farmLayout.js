// Spatial layout for the corner-cut farm board.
// Board is 4×4 cells; corners are shrine footings (no plots).
// Numbers in the sketch = unlockTier (0 = start unlocked).
//
//   Frog     4      4     Monkey
//     3      2      2       3
//     1      0      0       1
//    Fox     0      0     Tiger

export const BOARD_ROWS = 4;
export const BOARD_COLS = 4;

/** @type {{ id: number, row: number, col: number, unlockTier: number }[]} */
export const FARM_PLOTS = [
  { id: 0, row: 2, col: 1, unlockTier: 0 },
  { id: 1, row: 2, col: 2, unlockTier: 0 },
  { id: 2, row: 3, col: 1, unlockTier: 0 },
  { id: 3, row: 3, col: 2, unlockTier: 0 },
  { id: 4, row: 2, col: 0, unlockTier: 1 },
  { id: 5, row: 2, col: 3, unlockTier: 1 },
  { id: 6, row: 1, col: 1, unlockTier: 2 },
  { id: 7, row: 1, col: 2, unlockTier: 2 },
  { id: 8, row: 1, col: 0, unlockTier: 3 },
  { id: 9, row: 1, col: 3, unlockTier: 3 },
  { id: 10, row: 0, col: 1, unlockTier: 4 },
  { id: 11, row: 0, col: 2, unlockTier: 4 },
];

export const TOTAL_FARM_PLOTS = FARM_PLOTS.length;

const byId = new Map(FARM_PLOTS.map((plot) => [plot.id, plot]));

export function getPlotLayout(plotId) {
  return byId.get(plotId) ?? null;
}

/** Plot ids sorted by unlock tier ascending, then id (Fox unlock order). */
export function getUnlockOrderedPlotIds() {
  return FARM_PLOTS.filter((plot) => plot.unlockTier > 0)
    .slice()
    .sort((a, b) => {
      if (a.unlockTier !== b.unlockTier) return a.unlockTier - b.unlockTier;
      return a.id - b.id;
    })
    .map((plot) => plot.id);
}

/** Reverse of unlock order (Dragon burn re-lock). */
export function getLockOrderedPlotIds() {
  return getUnlockOrderedPlotIds().slice().reverse();
}
