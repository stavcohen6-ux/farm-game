// Keeps the main stage inside the viewport without scrolling by sizing
// --tile / --shrine-figure from available width and height.

const TEMPLE_RESERVE_RATIO = 0.22;
const INFO_FALLBACK_PX = 76;
const MIN_TILE_PX = 34;
const MAX_TILE_PX = 64;
const MIN_SHRINE_PX = 52;
const MAX_SHRINE_PX = 120;

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
    const boardChrome = 36; // farm frame padding + borders approx
    const plotGaps = 24; // 3 gaps × ~8px
    const farmBudgetH =
      availH - infoH - padY - grovePad - availH * TEMPLE_RESERVE_RATIO;
    const shrineColGuess = Math.min(
      MAX_SHRINE_PX,
      Math.max(MIN_SHRINE_PX, availW * 0.2),
    );
    const farmBudgetW = availW - 2 * shrineColGuess - 28;

    const tileFromH = (farmBudgetH - boardChrome - plotGaps) / 4;
    const tileFromW = (farmBudgetW - boardChrome - plotGaps) / 4;
    const tile = clamp(
      Math.floor(Math.min(tileFromH, tileFromW, MAX_TILE_PX)),
      MIN_TILE_PX,
      MAX_TILE_PX,
    );
    const shrine = clamp(
      Math.floor(tile * 1.85),
      MIN_SHRINE_PX,
      Math.min(MAX_SHRINE_PX, Math.floor(availW * 0.28)),
    );

    appEl.style.setProperty('--tile', `${tile}px`);
    appEl.style.setProperty('--tile-font', `${Math.max(0.95, tile / 42)}rem`);
    appEl.style.setProperty('--shrine-figure', `${shrine}px`);
    appEl.style.setProperty('--shrine-col', `${shrine + 8}px`);
    appEl.style.setProperty('--plot-gap', `${Math.max(4, Math.round(tile * 0.12))}px`);
    appEl.style.setProperty(
      '--frame-pad',
      `${Math.max(8, Math.round(tile * 0.22))}px`,
    );
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
