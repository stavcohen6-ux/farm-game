import { CROPS, getCrop } from '../data/crops.js';
import { getAlchemyRecipeByResultId } from '../data/alchemyRecipes.js';
import { SHRINES, shrineAcceptsCrop } from '../data/shrines.js';
import { bindCropTip, hideCropTip } from './cropTip.js';
import { FIELD_NOTES_TITLE } from './gameTextPanel.js';
import { logShrineIconSrc, setCropIcon, setIcon, UI_ICONS } from './icon.js';

// Opens a modal listing discovered crops with shrine values and origin.
// `onReset` — optional; when set, shows Reset at the bottom of the log.
export function openDiscoveryLog(state, onReset = null) {
  const overlay = document.createElement('div');
  overlay.className = 'discovery-log-overlay';

  const modal = document.createElement('div');
  modal.className = 'discovery-log';

  const header = document.createElement('div');
  header.className = 'discovery-log__header';

  const figure = document.createElement('div');
  figure.className = 'discovery-log__figure';
  setIcon(figure, {
    src: UI_ICONS.discoveryLog,
    emoji: '📖',
    alt: FIELD_NOTES_TITLE,
    imgClass: 'game-icon game-icon--discovery-log',
  });
  header.appendChild(figure);

  const title = document.createElement('h2');
  title.className = 'discovery-log__title';
  title.textContent = FIELD_NOTES_TITLE;
  header.appendChild(title);

  const discoveredCrops = new Set(
    Array.isArray(state.discoveredCropIds) ? state.discoveredCropIds : [],
  );
  const discoveredRecipes = new Set(
    Array.isArray(state.discoveredAlchemyResultIds)
      ? state.discoveredAlchemyResultIds
      : [],
  );

  const entryIds = new Set(discoveredCrops);
  for (const resultId of discoveredRecipes) {
    entryIds.add(resultId);
  }

  const entries = CROPS.filter((crop) => entryIds.has(crop.id));
  const found = entries.length;
  const total = CROPS.length;

  const progress = document.createElement('p');
  progress.className = 'discovery-log__progress';
  progress.textContent = `Discoveries ${found} / ${total}`;
  header.appendChild(progress);

  modal.appendChild(header);

  if (entries.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'discovery-log__empty';
    empty.textContent = 'Grow, offer, and mix crops to fill your log';
    modal.appendChild(empty);
  } else {
    const plantables = entries.filter((crop) => crop.plantable);
    const mixes = entries.filter((crop) => !crop.plantable);

    if (plantables.length > 0) {
      modal.appendChild(
        renderSection('Harvested crops', plantables, discoveredRecipes),
      );
    }
    if (mixes.length > 0) {
      modal.appendChild(
        renderSection('Crafted crops', mixes, discoveredRecipes),
      );
    }
  }

  if (typeof onReset === 'function') {
    const footer = document.createElement('div');
    footer.className = 'discovery-log__footer';
    const resetBtn = document.createElement('button');
    resetBtn.type = 'button';
    resetBtn.className = 'reset-game';
    resetBtn.textContent = 'Reset Game';
    resetBtn.addEventListener('click', (event) => {
      event.stopPropagation();
      close();
      onReset();
    });
    footer.appendChild(resetBtn);
    modal.appendChild(footer);
  }

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

function renderSection(titleText, crops, discoveredRecipes) {
  const section = document.createElement('section');
  section.className = 'discovery-log__section';

  const heading = document.createElement('h3');
  heading.className = 'discovery-log__section-title';
  heading.textContent = titleText;
  section.appendChild(heading);

  const list = document.createElement('ul');
  list.className = 'discovery-log__list';
  for (const crop of crops) {
    list.appendChild(renderCropRow(crop, discoveredRecipes.has(crop.id)));
  }
  section.appendChild(list);
  return section;
}

function renderCropRow(crop, recipeDiscovered) {
  const item = document.createElement('li');
  item.className = 'discovery-log__row';

  const icon = document.createElement('span');
  icon.className = 'discovery-log__icon';
  setCropIcon(icon, crop);

  const info = document.createElement('span');
  info.className = 'discovery-log__info';

  const name = document.createElement('span');
  name.className = 'discovery-log__name';
  name.textContent = crop.name;
  info.appendChild(name);

  if (crop.description) {
    const description = document.createElement('span');
    description.className = 'discovery-log__description';
    description.textContent = crop.description;
    info.appendChild(description);
  }

  const shrines = document.createElement('span');
  shrines.className = 'discovery-log__shrines';
  renderShrineValues(shrines, crop);
  info.appendChild(shrines);

  const origin = renderOrigin(crop, recipeDiscovered);
  if (origin) info.appendChild(origin);

  item.appendChild(icon);
  item.appendChild(info);
  return item;
}

function renderOrigin(crop, recipeDiscovered) {
  // Harvested crops sit under their own section — no origin line needed.
  if (crop.plantable) return null;
  if (!recipeDiscovered) return null;

  const recipe = getAlchemyRecipeByResultId(crop.id);
  if (!recipe) return null;

  const origin = document.createElement('span');
  origin.className = 'discovery-log__origin';

  const label = document.createElement('span');
  label.className = 'discovery-log__origin-label';
  label.textContent = 'Created by:';
  origin.appendChild(label);

  const ingredients = document.createElement('span');
  ingredients.className = 'discovery-log__origin-ingredients';

  const [inputA, inputB] = recipe.inputs;
  ingredients.appendChild(recipeIcon(inputA));
  ingredients.appendChild(recipeOp('+'));
  ingredients.appendChild(recipeIcon(inputB));
  origin.appendChild(ingredients);
  return origin;
}

function renderShrineValues(container, crop) {
  const values = crop?.shrineValues;
  if (!values) return;

  const accepting = SHRINES.filter((shrine) =>
    shrineAcceptsCrop(shrine, crop.id),
  );
  if (accepting.length === 0) return;

  let maxValue = -Infinity;
  for (const shrine of accepting) {
    const amount = values[shrine.id] ?? 0;
    if (amount > maxValue) maxValue = amount;
  }

  for (const shrine of accepting) {
    const amount = values[shrine.id] ?? 0;
    const entry = document.createElement('span');
    entry.className = 'discovery-log__shrine-value';
    if (amount === maxValue) {
      entry.classList.add('discovery-log__shrine-value--preferred');
    }

    const icon = document.createElement('span');
    icon.className = 'discovery-log__shrine-icon';
    setIcon(icon, {
      src: logShrineIconSrc(shrine.id),
      emoji: shrine.icon,
      alt: shrine.name,
      imgClass: 'game-icon game-icon--log-shrine',
    });

    const amountEl = document.createElement('span');
    amountEl.className = 'discovery-log__shrine-amount';
    amountEl.textContent = String(amount);

    entry.appendChild(icon);
    entry.appendChild(amountEl);
    container.appendChild(entry);
  }
}

function recipeIcon(cropId) {
  const crop = getCrop(cropId);
  const icon = document.createElement('span');
  icon.className = 'discovery-log__origin-icon';
  setCropIcon(icon, crop, 'game-icon game-icon--log-ingredient');
  if (crop?.name) bindCropTip(icon, crop.name);
  return icon;
}

function recipeOp(symbol) {
  const op = document.createElement('span');
  op.className = 'discovery-log__recipe-op';
  op.textContent = symbol;
  return op;
}
