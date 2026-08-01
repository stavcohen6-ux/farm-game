const SWIPE_COMPLETE_RATIO = 0.8;

// Plot-anchored swipe confirm before clearing a crop. Game tick keeps running.
export function openUprootConfirm(plotEl, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'uproot-confirm-overlay';

  const modal = document.createElement('div');
  modal.className = 'uproot-confirm';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-label', 'Swipe left to uproot');

  const track = document.createElement('div');
  track.className = 'uproot-confirm__track';
  track.setAttribute('role', 'slider');
  track.setAttribute('aria-valuemin', '0');
  track.setAttribute('aria-valuemax', '100');
  track.setAttribute('aria-valuenow', '0');
  track.setAttribute('aria-label', 'Swipe right to left over Uproot');
  track.style.touchAction = 'none';

  const fill = document.createElement('div');
  fill.className = 'uproot-confirm__fill';
  fill.setAttribute('aria-hidden', 'true');

  const shimmer = document.createElement('div');
  shimmer.className = 'uproot-confirm__shimmer';
  shimmer.setAttribute('aria-hidden', 'true');

  const label = document.createElement('span');
  label.className = 'uproot-confirm__label';
  label.textContent = 'Uproot';

  const thumb = document.createElement('div');
  thumb.className = 'uproot-confirm__thumb';
  thumb.setAttribute('aria-hidden', 'true');

  track.appendChild(fill);
  track.appendChild(shimmer);
  track.appendChild(label);
  track.appendChild(thumb);
  modal.appendChild(track);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  positionModal(modal, plotEl);
  resetThumb(track, thumb, fill);
  window.getSelection()?.removeAllRanges();

  let swiping = false;
  let startX = 0;
  let travel = 0;
  let completed = false;

  track.addEventListener('pointerdown', (event) => {
    if (event.button != null && event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    swiping = true;
    travel = 0;
    startX = event.clientX;
    track.classList.add('uproot-confirm__track--dragging');
    track.setPointerCapture(event.pointerId);
  });

  track.addEventListener('pointermove', (event) => {
    if (!swiping || completed) return;
    // Right → left only: positive travel is leftward distance.
    travel = Math.max(0, startX - event.clientX);
    const maxTravel = swipeMax(track, thumb);
    const clamped = Math.min(travel, maxTravel);
    applySwipe(track, thumb, fill, clamped, maxTravel);
  });

  track.addEventListener('pointerup', (event) => {
    if (!swiping) return;
    event.stopPropagation();
    finishSwipe(track, thumb, fill);
  });

  track.addEventListener('pointercancel', () => {
    if (!swiping) return;
    finishSwipe(track, thumb, fill);
  });

  // Tap anywhere outside the track dismisses without uprooting.
  overlay.addEventListener('pointerdown', (event) => {
    if (event.target.closest('.uproot-confirm__track')) return;
    close();
  });

  function finishSwipe(trackEl, thumbEl, fillEl) {
    swiping = false;
    trackEl.classList.remove('uproot-confirm__track--dragging');
    const maxTravel = swipeMax(trackEl, thumbEl);
    if (travel >= maxTravel * SWIPE_COMPLETE_RATIO) {
      completed = true;
      applySwipe(trackEl, thumbEl, fillEl, maxTravel, maxTravel);
      close();
      onConfirm();
      return;
    }
    travel = 0;
    resetThumb(trackEl, thumbEl, fillEl);
  }

  function close() {
    overlay.remove();
  }
}

function swipeMax(track, thumb) {
  return Math.max(0, track.clientWidth - thumb.offsetWidth - 8);
}

function applySwipe(track, thumb, fill, travel, maxTravel) {
  const ratio = maxTravel > 0 ? travel / maxTravel : 0;
  // Thumb starts on the right; moves left as travel increases.
  thumb.style.transform = `translateX(${-travel}px)`;
  fill.style.width = `${Math.min(100, ratio * 100)}%`;
  track.setAttribute('aria-valuenow', String(Math.round(ratio * 100)));
}

function resetThumb(track, thumb, fill) {
  thumb.style.transform = 'translateX(0)';
  fill.style.width = '0%';
  track.setAttribute('aria-valuenow', '0');
}

function positionModal(modal, plotEl) {
  if (!plotEl) return;
  const rect = plotEl.getBoundingClientRect();
  const width = modal.offsetWidth || 240;
  const height = modal.offsetHeight || 80;
  const margin = 8;
  let left = rect.left + rect.width / 2 - width / 2;
  let top = rect.top + rect.height / 2 - height / 2;

  left = Math.min(
    Math.max(margin, left),
    window.innerWidth - width - margin,
  );
  top = Math.min(
    Math.max(margin, top),
    window.innerHeight - height - margin,
  );

  modal.style.left = `${left}px`;
  modal.style.top = `${top}px`;
}
