const SWIPE_COMPLETE_RATIO = 0.8;

// Confirm before wiping progress. Game tick keeps running while open.
export function openResetConfirm(onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'reset-confirm-overlay';

  const modal = document.createElement('div');
  modal.className = 'reset-confirm';

  const message = document.createElement('p');
  message.className = 'reset-confirm__message';
  message.textContent =
    'Are you sure you want to reset? This clears all progress.';
  modal.appendChild(message);

  const actions = document.createElement('div');
  actions.className = 'reset-confirm__actions';

  const noBtn = document.createElement('button');
  noBtn.type = 'button';
  noBtn.className = 'reset-confirm__btn';
  noBtn.textContent = 'No';
  noBtn.addEventListener('click', () => close());

  const yesBtn = document.createElement('button');
  yesBtn.type = 'button';
  yesBtn.className = 'reset-confirm__btn reset-confirm__btn--yes';
  yesBtn.textContent = 'Yes';
  yesBtn.addEventListener('click', () => {
    close();
    openResetSwipeConfirm(onConfirm);
  });

  actions.appendChild(noBtn);
  actions.appendChild(yesBtn);
  modal.appendChild(actions);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });

  function close() {
    overlay.remove();
  }
}

// Second step: swipe left over Reset. Tap outside cancels without wiping.
function openResetSwipeConfirm(onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'reset-confirm-overlay';

  const modal = document.createElement('div');
  modal.className = 'reset-swipe-confirm';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-label', 'Swipe left to reset');

  const track = document.createElement('div');
  track.className = 'reset-swipe-confirm__track';
  track.setAttribute('role', 'slider');
  track.setAttribute('aria-valuemin', '0');
  track.setAttribute('aria-valuemax', '100');
  track.setAttribute('aria-valuenow', '0');
  track.setAttribute('aria-label', 'Swipe right to left over Reset');
  track.style.touchAction = 'none';

  const fill = document.createElement('div');
  fill.className = 'reset-swipe-confirm__fill';
  fill.setAttribute('aria-hidden', 'true');

  const shimmer = document.createElement('div');
  shimmer.className = 'reset-swipe-confirm__shimmer';
  shimmer.setAttribute('aria-hidden', 'true');

  const label = document.createElement('span');
  label.className = 'reset-swipe-confirm__label';
  label.textContent = 'Reset';

  const thumb = document.createElement('div');
  thumb.className = 'reset-swipe-confirm__thumb';
  thumb.setAttribute('aria-hidden', 'true');

  track.appendChild(fill);
  track.appendChild(shimmer);
  track.appendChild(label);
  track.appendChild(thumb);
  modal.appendChild(track);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
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
    track.classList.add('reset-swipe-confirm__track--dragging');
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

  // Tap anywhere outside the track dismisses without resetting.
  overlay.addEventListener('pointerdown', (event) => {
    if (event.target.closest('.reset-swipe-confirm__track')) return;
    close();
  });

  function finishSwipe(trackEl, thumbEl, fillEl) {
    swiping = false;
    trackEl.classList.remove('reset-swipe-confirm__track--dragging');
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
