// Plot-anchored confirm before clearing a crop. Game tick keeps running.
export function openUprootConfirm(plotEl, onConfirm) {
  const overlay = document.createElement('div');
  overlay.className = 'uproot-confirm-overlay';

  const modal = document.createElement('div');
  modal.className = 'uproot-confirm';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-label', 'Uproot crop');

  const message = document.createElement('p');
  message.className = 'uproot-confirm__message';
  message.textContent = 'Uproot?';
  modal.appendChild(message);

  const actions = document.createElement('div');
  actions.className = 'uproot-confirm__actions';

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'uproot-confirm__btn';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', () => close());

  const uprootBtn = document.createElement('button');
  uprootBtn.type = 'button';
  uprootBtn.className = 'uproot-confirm__btn uproot-confirm__btn--yes';
  uprootBtn.textContent = 'Uproot';
  uprootBtn.addEventListener('click', () => {
    close();
    onConfirm();
  });

  actions.appendChild(cancelBtn);
  actions.appendChild(uprootBtn);
  modal.appendChild(actions);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  positionModal(modal, plotEl);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });

  function close() {
    overlay.remove();
  }
}

function positionModal(modal, plotEl) {
  if (!plotEl) return;
  const rect = plotEl.getBoundingClientRect();
  // Measure after attach; fall back if still zero.
  const width = modal.offsetWidth || 220;
  const height = modal.offsetHeight || 120;
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
