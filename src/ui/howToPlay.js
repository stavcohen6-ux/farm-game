import { cropIconSrc, setIcon, shrineIconSrc, UI_ICONS } from './icon.js';

const HOW_TO_PLAY_STEPS = [
  {
    src: cropIconSrc('wheat'),
    emoji: '🌾',
    title: 'Plant',
    body: 'Tap a plot and pick a crop.',
  },
  {
    src: UI_ICONS.waterDrop,
    emoji: '💧',
    title: 'Water',
    body: 'Dry soil? Tap to water and make plants grow a bit faster.',
  },
  {
    src: shrineIconSrc('fox'),
    emoji: '🦊',
    title: 'Offer',
    body: 'Drag a ready crop to a shrine. Give enough offerings to a shrine to receive its blessing.',
  },
  {
    src: UI_ICONS.mortar,
    emoji: '⚗️',
    title: 'Mix',
    body: 'Drag ready crops to neighboring crops to create new crops.',
  },
  {
    src: UI_ICONS.discoveryLog,
    emoji: '📖',
    title: 'Field Notes',
    body: 'Your discoveries live here.',
  },
  {
    src: UI_ICONS.dragonAwake,
    emoji: '🏯',
    title: 'Dragon Temple',
    body: 'When it wakes, fill its slots before wrath bar fills.',
  },
];

const UPROOT_NOTE = 'Hold a crop, then swipe to clear the plot.';

/**
 * Fill `container` with the How to Play view (Back + illustrated steps).
 * @param {HTMLElement} container
 * @param {{ onBack: () => void }} opts
 */
export function renderHowToPlay(container, { onBack }) {
  container.replaceChildren();
  container.className = 'how-to-play';

  const header = document.createElement('div');
  header.className = 'how-to-play__header';

  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'reset-game how-to-play__back';
  backBtn.textContent = 'Back';
  backBtn.addEventListener('click', (event) => {
    event.stopPropagation();
    onBack();
  });
  header.appendChild(backBtn);

  const title = document.createElement('h2');
  title.className = 'how-to-play__title';
  title.textContent = 'How to Play';
  header.appendChild(title);

  container.appendChild(header);

  const list = document.createElement('ul');
  list.className = 'how-to-play__list';

  for (const step of HOW_TO_PLAY_STEPS) {
    const item = document.createElement('li');
    item.className = 'how-to-play__step';

    const icon = document.createElement('span');
    icon.className = 'how-to-play__icon';
    setIcon(icon, {
      src: step.src,
      emoji: step.emoji,
      alt: step.title,
      imgClass: 'game-icon game-icon--how-to-play',
    });
    item.appendChild(icon);

    const text = document.createElement('span');
    text.className = 'how-to-play__text';

    const stepTitle = document.createElement('span');
    stepTitle.className = 'how-to-play__step-title';
    stepTitle.textContent = step.title;
    text.appendChild(stepTitle);

    const body = document.createElement('span');
    body.className = 'how-to-play__step-body';
    body.textContent = step.body;
    text.appendChild(body);

    item.appendChild(text);
    list.appendChild(item);
  }

  container.appendChild(list);

  const uproot = document.createElement('p');
  uproot.className = 'how-to-play__uproot';
  const uprootLabel = document.createElement('strong');
  uprootLabel.textContent = 'Uproot';
  uproot.appendChild(uprootLabel);
  uproot.appendChild(document.createTextNode(` — ${UPROOT_NOTE}`));
  container.appendChild(uproot);
}
