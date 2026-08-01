import { hideCropTip } from './cropTip.js';
import { setIcon, UI_ICONS } from './icon.js';

const ASLEEP_BODY =
  'The dragon is asleep. Offering crops to animal shrines can wake the dragon. When it wakes, fill its four slots before its wrath meter grows too high.';

const AWAKE_BODY =
  "The dragon wants the four matching crops on the board below. Drag ready crops onto matching slots. Planting or offering crops to shrines raises the dragon's wrath meter. Calm it to earn a blessing. Let wrath peak and it'll burn one of your shrines.";

const OVERLAY_CLASS = 'dragon-temple-detail-overlay';

// Shows a centered explainer for the Dragon Temple. Copy switches on whether
// the dragon is awake. Click outside to close.
export function openDragonTempleDetail(state) {
  document.querySelector(`.${OVERLAY_CLASS}`)?.remove();

  const active = Boolean(state.dragonTemple?.active);

  const overlay = document.createElement('div');
  overlay.className = OVERLAY_CLASS;

  const modal = document.createElement('div');
  modal.className = 'dragon-temple-detail';

  const title = document.createElement('h2');
  title.className = 'dragon-temple-detail__title';
  const titleIcon = document.createElement('span');
  titleIcon.className = 'dragon-temple-detail__title-icon';
  setIcon(titleIcon, {
    src: active ? UI_ICONS.dragonAwake : UI_ICONS.dragonRest,
    emoji: '🐲',
    alt: '',
    imgClass: 'game-icon game-icon--temple-detail',
  });
  title.appendChild(titleIcon);
  title.append(active ? ' Dragon Temple — Awake' : ' Dragon Temple — Asleep');
  modal.appendChild(title);

  const body = document.createElement('p');
  body.className = 'dragon-temple-detail__body';
  body.textContent = active ? AWAKE_BODY : ASLEEP_BODY;
  modal.appendChild(body);

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) close();
  });

  function close() {
    hideCropTip();
    overlay.remove();
  }
}
