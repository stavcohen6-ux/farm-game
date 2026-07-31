// Keeps the main stage inside the viewport without scrolling by sizing
// --tile / --shrine-figure from available width and height.

const TEMPLE_RESERVE_RATIO = 0.2;
const INFO_FALLBACK_PX = 76;
const MIN_TILE_PX = 44;
const MAX_TILE_PX = 92;
const MIN_SHRINE_PX = 56;
const MAX_SHRINE_PX = 140;
const SHRINE_OVERFLOW_PAD_PX = 10;

export function installStageFit(appEl) {
  if (!appEl) return () => {};

  const apply = () => {
    const info = document.getElementById('info-band');
    const availW = appEl.clientWidth;
    const availH = appEl.clientHeight;
    if (availW < 40 || availH < 80) return;

    const infoH = info?.offsetHeight || INFO_FALLBACK_PX;
    const padY = 12;
    const grovePad = 20;
    const boardChrome = 28; // farm frame padding + borders approx
    const plotGaps = 24; // 3 gaps × ~8px
    const farmBudgetH =
      availH - infoH - padY - grovePad - availH * TEMPLE_RESERVE_RATIO;
    // Board is 4 columns only; leave a little side room so oversized corner
    // shrines can overhang the frame without clipping the viewport.
    const farmBudgetW = availW - 2 * SHRINE_OVERFLOW_PAD_PX - 12;

    const tileFromH = (farmBudgetH - boardChrome - plotGaps) / 4;
    const tileFromW = (farmBudgetW - boardChrome - plotGaps) / 4;
    const tile = clamp(
      Math.floor(Math.min(tileFromH, tileFromW, MAX_TILE_PX)),
      MIN_TILE_PX,
      MAX_TILE_PX,
    );
    const plotGap = Math.max(4, Math.round(tile * 0.12));
    const framePad = Math.max(8, Math.round(tile * 0.2));
    // Shrine figure larger than a plot tile; footing stays on the corner cell
    // while the figure reads past the farm border.
    const shrine = clamp(
      Math.floor(tile * 1.48),
      Math.max(MIN_SHRINE_PX, Math.floor(tile * 1.2)),
      Math.min(MAX_SHRINE_PX, Math.floor(tile * 1.6), Math.floor(availW * 0.34)),
    );
    const grovePadX = Math.max(
      12,
      Math.ceil((shrine - tile) * 0.55) + 8,
    );

    appEl.style.setProperty('--tile', `${tile}px`);
    appEl.style.setProperty('--tile-font', `${Math.max(0.95, tile / 42)}rem`);
    appEl.style.setProperty('--shrine-figure', `${shrine}px`);
    appEl.style.setProperty('--shrine-col', `${shrine + 6}px`);
    appEl.style.setProperty('--plot-gap', `${plotGap}px`);
    appEl.style.setProperty('--frame-pad', `${framePad}px`);
    appEl.style.setProperty('--grove-pad-x', `${grovePadX}px`);
  };

  apply();
  const ro = new ResizeObserver(apply);
  ro.observe(appEl);
  window.addEventListener('orientationchange', apply);
  window.addEventListener('resize', apply);

  return () => {
    ro.disconnect();
    window.removeEventListener('orientationchange', apply);
    window.removeEventListener('resize', apply);
  };
}

function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}
