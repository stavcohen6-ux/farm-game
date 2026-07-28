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
    onConfirm();
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
