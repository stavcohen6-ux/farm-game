# Farm Game

A simple 2D casual farming game: plant and harvest crops, mix alchemy
recipes, offer to shrines, and run Dragon Temple sacrifice events. Built as
a plain HTML/CSS/JS static site — no build step, no dependencies.

## Play locally

Open `index.html` directly in a browser, or run a local static server:

```bash
npx serve .
# or
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Play on phone (GitHub Pages)

Live URL: https://stavcohen6-ux.github.io/farm-game/

Day-to-day after a push:

1. Wait about a minute for Pages to redeploy.
2. Reload the Safari tab (prefer a normal tab, not an old Home Screen icon).

You should not need to clear Safari History or Website Data on every push.
Cache busting is built into `index.html` (versioned CSS + an import map for
every `src/**/*.js` file).

### One-time phone unblock (only if Safari is stuck on an old build)

1. Delete any Home Screen icon for the game.
2. iOS **Settings → Safari → Advanced → Website Data** → remove `github.io`.
3. Open https://stavcohen6-ux.github.io/farm-game/?v=crafted1
4. Confirm Field Notes shows **Crafted crops** (not Alchemy mixes).

### Keep cache bust automatic on commit

Once per clone:

```bash
git config core.hooksPath .githooks
```

Then normal commits that touch `src/**/*.js` or `style.css` regenerate
`index.html` via `scripts/bust-cache.sh` and stage it. You can also run:

```bash
./scripts/bust-cache.sh
```

## Project docs

- [`docs/GAME_DESIGN.md`](docs/GAME_DESIGN.md) — source of truth for decided
  game scope (farm, crops, alchemy, shrines, Dragon Temple, persistence),
  filled in incrementally.
- `.cursor/rules/farm-game.mdc` — development rules followed while building
  this project.
