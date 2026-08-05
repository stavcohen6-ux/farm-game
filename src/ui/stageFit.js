// Keeps the main stage inside the viewport without scrolling by sizing
// --tile / --shrine-figure from available width and height.

const INFO_FALLBACK_PX = 76;
const MIN_TILE_PX = 36;
const MAX_TILE_PX = 92;
const MIN_SHRINE_PX = 44;
const MAX_SHRINE_PX = 140;
const DRAGON_ASPECT = 2.35; // display aspect (cover-crops source 1495×790 until Soft B redraw)
const SHRINE_BAR_WIDTH = 8;
const SHRINE_BAR_GAP = 4.5; // ~0.28rem
const BOARD_BORDER = 6; // 3px × 2
const TEMPLE_METERS_H = 22; // ~1.35rem
const TEMPLE_INNER_GAP = 4; // ~0.25rem between temple stacks
const APP_GAP = 6; // ~0.35rem grove ↔ info-band
const GROVE_GAP_DEFAULT = 8; // ~0.5rem temple ↔ farm
const GROVE_GAP_TIGHT = 4;
const GROVE_PAD_Y_TOP = 6; // ~0.375rem
const GROVE_PAD_Y_BOTTOM = 8; // ~0.5rem
const FIT_SLACK_PX = 6;

function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}

function plotGapFor(tile) {
  return Math.max(4, Math.round(tile * 0.12));
}

function framePadFor(tile) {
  return Math.max(8, Math.round(tile * 0.2));
}

function boardInnerFor(tile) {
  return 4 * tile + 3 * plotGapFor(tile) + 2 * framePadFor(tile);
}

function shrineFor(tile, availW) {
  return clamp(
    Math.floor(tile * 1.32),
    Math.max(MIN_SHRINE_PX, Math.floor(tile * 1.15)),
    Math.min(MAX_SHRINE_PX, Math.floor(tile * 1.45), Math.floor(availW * 0.34)),
  );
}

function nudgesFor(tile) {
  return {
    top: Math.max(8, Math.round(tile * 0.22)),
    bottom: Math.max(8, Math.round(tile * 0.22)),
  };
}

// Horizontal pad so corner shrines + outer progress bars stay on-screen.
function sidePadFor(tile, shrine) {
  const shrineCol = shrine + 6;
  const framePad = framePadFor(tile);
  const overhang = Math.max(
    0,
    (shrineCol - tile) / 2 + SHRINE_BAR_WIDTH + SHRINE_BAR_GAP - framePad,
  );
  return Math.max(8, Math.ceil(overhang + BOARD_BORDER / 2 + 2));
}

function topOverhangFor(tile, shrine, nudgeTop) {
  return Math.max(0, (shrine - tile) / 2 + nudgeTop - framePadFor(tile));
}

function bottomOverhangFor(tile, shrine, nudgeBottom) {
  return Math.max(0, (shrine - tile) / 2 + nudgeBottom - framePadFor(tile));
}

function estimateTempleH(boardInner, tile) {
  const figureH = boardInner / DRAGON_ASPECT;
  const tributeH = 2 * framePadFor(tile) + tile + BOARD_BORDER;
  return (
    TEMPLE_METERS_H +
    TEMPLE_INNER_GAP +
    figureH +
    TEMPLE_INNER_GAP +
    tributeH
  );
}

/** Prefer a width-scaled measurement when the temple has already painted. */
function templeHFor(boardInner, tile, measuredTempleH, measuredTempleW) {
  const estimate = estimateTempleH(boardInner, tile);
  if (!(measuredTempleH > 0) || !(measuredTempleW > 0)) return estimate;
  const scaled = measuredTempleH * (boardInner / measuredTempleW);
  return Math.max(estimate, scaled);
}

function layoutFor(tile, availW, groveGap, measuredTempleH, measuredTempleW) {
  const plotGap = plotGapFor(tile);
  const framePad = framePadFor(tile);
  const boardInner = boardInnerFor(tile);
  const boardOuter = boardInner + BOARD_BORDER;
  const shrine = shrineFor(tile, availW);
  const sidePad = sidePadFor(tile, shrine);
  const nudges = nudgesFor(tile);
  const topOver = topOverhangFor(tile, shrine, nudges.top);
  const bottomOver = bottomOverhangFor(tile, shrine, nudges.bottom);
  const templeH = templeHFor(
    boardInner,
    tile,
    measuredTempleH,
    measuredTempleW,
  );
  // Top overhang eats the temple↔farm gap first; remainder needs extra height.
  const topExtra = Math.max(0, topOver - groveGap);

  const widthNeeded = boardOuter + 2 * sidePad;
  const heightNeeded =
    APP_GAP +
    GROVE_PAD_Y_TOP +
    GROVE_PAD_Y_BOTTOM +
    templeH +
    groveGap +
    boardOuter +
    bottomOver +
    topExtra +
    FIT_SLACK_PX;

  return {
    tile,
    plotGap,
    framePad,
    boardInner,
    boardOuter,
    shrine,
    sidePad,
    nudges,
    templeH,
    widthNeeded,
    heightNeeded,
    groveGap,
  };
}

function pickLayout(availW, availH, infoH, measuredTempleH, measuredTempleW) {
  const heightBudget = availH - infoH;
  for (const groveGap of [GROVE_GAP_DEFAULT, GROVE_GAP_TIGHT]) {
    for (let tile = MAX_TILE_PX; tile >= MIN_TILE_PX; tile--) {
      const layout = layoutFor(
        tile,
        availW,
        groveGap,
        measuredTempleH,
        measuredTempleW,
      );
      if (
        layout.widthNeeded <= availW &&
        layout.heightNeeded <= heightBudget
      ) {
        return layout;
      }
    }
  }
  // Last resort: minimum tile, tight gap (may still clip on tiny viewports).
  return layoutFor(
    MIN_TILE_PX,
    availW,
    GROVE_GAP_TIGHT,
    measuredTempleH,
    measuredTempleW,
  );
}

export function installStageFit(appEl) {
  if (!appEl) return () => {};

  let lastKey = '';

  const apply = () => {
    const info = document.getElementById('info-band');
    const temple = document.getElementById('dragon-temple');

    const cs = getComputedStyle(appEl);
    const padL = parseFloat(cs.paddingLeft) || 0;
    const padR = parseFloat(cs.paddingRight) || 0;
    const padT = parseFloat(cs.paddingTop) || 0;
    const padB = parseFloat(cs.paddingBottom) || 0;
    const availW = appEl.clientWidth - padL - padR;
    const availH = appEl.clientHeight - padT - padB;
    if (availW < 40 || availH < 80) return;

    const infoH = info?.offsetHeight || INFO_FALLBACK_PX;
    const measuredTempleH = temple?.offsetHeight || 0;
    const measuredTempleW = temple?.clientWidth || 0;
    const layout = pickLayout(
      availW,
      availH,
      infoH,
      measuredTempleH,
      measuredTempleW,
    );

    const key = [
      layout.tile,
      layout.shrine,
      layout.plotGap,
      layout.framePad,
      layout.sidePad,
      layout.nudges.top,
      layout.nudges.bottom,
      layout.groveGap,
    ].join(':');
    if (key === lastKey) return;
    lastKey = key;

    appEl.style.setProperty('--tile', `${layout.tile}px`);
    appEl.style.setProperty(
      '--tile-font',
      `${Math.max(0.85, layout.tile / 42)}rem`,
    );
    appEl.style.setProperty('--shrine-figure', `${layout.shrine}px`);
    appEl.style.setProperty('--shrine-col', `${layout.shrine + 6}px`);
    appEl.style.setProperty('--plot-gap', `${layout.plotGap}px`);
    appEl.style.setProperty('--frame-pad', `${layout.framePad}px`);
    appEl.style.setProperty('--grove-pad-x', `${layout.sidePad}px`);
    appEl.style.setProperty('--grove-gap', `${layout.groveGap}px`);
    appEl.style.setProperty(
      '--shrine-nudge-top',
      `${layout.nudges.top}px`,
    );
    appEl.style.setProperty(
      '--shrine-nudge-bottom',
      `${layout.nudges.bottom}px`,
    );
  };

  apply();
  const ro = new ResizeObserver(apply);
  ro.observe(appEl);
  const info = document.getElementById('info-band');
  const temple = document.getElementById('dragon-temple');
  if (info) ro.observe(info);
  if (temple) ro.observe(temple);
  window.addEventListener('orientationchange', apply);
  window.addEventListener('resize', apply);

  return () => {
    ro.disconnect();
    window.removeEventListener('orientationchange', apply);
    window.removeEventListener('resize', apply);
  };
}
