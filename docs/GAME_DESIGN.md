# Farm Game — Design Doc

This doc is the source of truth for decided scope. Sections are filled in
incrementally, one milestone at a time. Nothing here should be invented ahead
of an explicit decision.

## Genre
Cozy, relaxing farming game. Not an action or skill-based game — no
reflexes required. (confirmed)

## Platform
Target is **desktop and mobile** (portrait phone). Every feature must
work well on touch phones: readable targets, no hover-only actions, no
desktop-only gestures. Pointer/mouse remains supported; mobile is not
secondary. (confirmed)

## Core fantasy
"Earn the favor of the old gods and cultivate a legendary farm. Restore
harmony between the land and its guardians." The game should feel peaceful,
thoughtful, and rewarding — the player is slowly nurturing something that
grows over time. (confirmed)

## Visual direction
**Cozy Lofi Grove** feel with **simplified Lofi Ghibli painterly** art
(confirmed) and a deeper moss-stone farm board. Original art language for
this game’s lore — old gods, animal shrines, Dragon Temple, forest harmony.
Do not mimic another game’s UI chrome, character designs, icon sets, or layout.

### Feel
Soft 2D painterly illustration with large, mobile-readable shapes (not
hyper-detailed clutter). Crops, shrines, alchemy, and the Dragon Temple share
one language over time; farm + shrines lead the new lock-in. Surfaces feel
tactile but simple. Sacred grove calm; cool ambient with warm amber accents
on runes and ready crops. Not clay sculpture, not 3D dioramas, not goofy-cute
mascots.

Guardian shrines: slightly humanoid seated animals (calm old-god presence) —
readable torso/limbs, animal heads. Expressions are not goofy-cute mascots.
Guardians face inward toward the farm. Facing check: Frog (top-left) → right;
Monkey (top-right) → left; Fox (bottom-left) → right; Tiger (bottom-right) →
left. Each shrine has a mossy stone pedestal and one warm amber rune. Dress
codes are unique per shrine (no shared cape rule) — e.g. frog leaf vest,
monkey scholar beads/sash, fox traveler scarf + satchel, tiger fortune collar
+ charm tags. Body of the animal stays visible. Icons use true transparency
(no baked checkerboard or solid backdrop). Approved locked copies:
`assets/mood/locked_shrines/` — do not regenerate shrine icons unless art
direction is intentionally revised.

### Palette — Fresh Moss (CSS tokens), farm deepened
- Mint / sage canopy and soft sky-mist for the page atmosphere
- Cream / linen panels with sage-green borders (not heavy wood-brown chrome)
- Deeper chocolate soil on plots; mossy slate stone farm frame with green
  moss patches; locked cool stone slabs (see mood
  `assets/mood/farm_board_lofi_ghibli_mood.png`)
- Honey gold / warm amber for ready-to-harvest and shrine runes
- Ember warmth for active Dragon Temple only
- Gentle moon-lilac reserved for sparse mythic accents (e.g. temple sparks), not plot ready rings

### Materials and chrome
- Stage bands — scenic grove stage (top), then an **info band** (clickable
  Field Notes game-text plank), then a slim bottom dock with Reset only.
  Soften the outer app shell so the grove reads as the place.
- Info band (`#info-band`): below `#grove-stage`, same outer width as the
  grove stage (full app column; `width` / `max-width: 100%`). Holds only
  the game text plank (full width of the band).
- Game text (`#game-text`): painted weathered wood plank
  (`assets/scene/game_text_plank.png`) in the same Fresh Moss watercolor
  language as the grove; faint linen readability wash over the plank; warm
  worn-wood rim (not mint panel chrome). Fixed **two-line** height — line 1
  is the dynamic message (single-line ellipsis); line 2 is the permanent
  title **Field Notes**. Whole plank is a button that opens Field Notes.
- Grove stage (`#grove-stage`): in-game scenic backdrop
  (`assets/scene/grove_clearing.png`) — misty canopy, empty clearing, moss
  foreground; no baked shrine alcoves (icons sit on top). Farm board with
  corner shrine footings sits on a deeper moss ground plane under the Dragon
  Temple
- Farm board: soft moss ground plane (quiet chrome) under the grid; painterly
  mossy-stone frame texture (`farm_frame.png`) and plot textures
  (`plot_soil.png`, full-tile `plot_soil_dry.png` when a plant asks for
  water, `plot_locked.png`) matching shrine / mood art; ready plots
  keep honey glow on dirt; optional soft per-row brightness for depth without
  changing tile size. Mood ref: `assets/mood/farm_board_lofi_ghibli_mood.png`
- Locked farm plots: locked tile texture only — no lock emoji/icon overlay.
  Unlock uses a brief locked-to-soil fade (same textures, no lock icon).
- **Player desk removed** from the live UI (inventory shelf + Mix row gone).
  Desk art (`assets/scene/player_desk.png`) and desk firefly / flowering art
  are **parked** for a later redesign — do not delete. Crops stay on ready
  plots until dragged (plot drag lands in a later milestone).
- Field Notes: opened by clicking the game-text plank (`#game-text`); modal
  still uses `discovery_log.png` book art in the header. No standalone book
  button on the main screen.
- Modals: cream linen inside sage / frame borders (Field Notes, shrine
  detail, reset confirm)
- Shrines: simplified painterly guardian icons on small altars. Each corner
  cell of the 4×4 board is a shrine **footing** (no plot); the figure is
  **larger than a farm tile** and overflows past the farm frame border
  (sits on the farm frame art — no filler tile behind). Main view shows
  figure + a slim **vertical** progress track on the outer side of each
  shrine (left of frog/fox, right of monkey/tiger); name / tier in the
  click detail modal; no hover lift/scale on shrines
- Dragon Temple: simplified Lofi Ghibli painterly roof dragon sitting above a
  1×4 holy farm-style tribute board (`dragon_temple_rest.png` /
  `dragon_temple_awake.png`; locked copies in `assets/mood/locked_shrines/`).
  Same roof stone both states; only the dragon sleeps vs wakes. Four demand
  slots use farm-frame / locked-tile textures with a brighter holy tint.
  Layout reserves meter height above so resting vs active does not reflow the
  farm (no Burn button). Resting: sleeping dragon, faded empty board slots,
  meters space hidden. Active: awake dragon, demand ghost icons on empty
  slots, wrath bar fills above the art (ember timer colors, no numbers);
  when all four slots match the dragon auto-takes the tribute (ember burn,
  no ember card chrome)
- Buttons: moss fills; quiet, not neon

### Icons
One artistic language for crops, shrines, Field Notes (book cutout), and the
Dragon Temple: cozy lofi 2D painterly icons with true transparency (no baked
checkerboard or cream canvas). Soft mist belongs on the scenic backdrop;
cutout icons sit cleanly in the grove. Each crop must be unmistakable at
~64px. Field Notes shrine-value faces (`log_frog.png`, `log_monkey.png`,
`log_fox.png`, `log_tiger.png`) stay emoji-simple. Assets under
`assets/icons/`; scene under `assets/scene/`. Emoji remain as fallback
until an asset exists. Prior Fresh Moss backups:
`assets/mood/archive_fresh_moss/`. Prior crop icon set:
`assets/mood/archive_crops_prealchemy/`. Approved locked icons:
`assets/mood/locked_shrines/` (animal shrines + Dragon Temple). Mood refs
(not in-game UI): `assets/mood/farm_board_lofi_ghibli_mood.png`,
`assets/mood/grove_clearing_lofi_ghibli_mood.png`.

Crop icons use two registers so harvest crops and alchemy mixes stay distinct
at small size (same watercolor technique; prepared or enchanted form, not a
recolored parent crop):
- **Harvest crops** (`plantable: true`): muted natural botanical watercolor;
  close-cropped whole plant with foliage; large clear silhouette.
- **Alchemy mixes** (`plantable: false`): a *changed* form — loaves
  distinguished by shape only (smooth crust, no fruit stuffed in, no deep
  slash marks); roots as prepared forms (tied bundle, halved cut-face, whole
  tapered); enchanted berries / blooms / gourd with jewel saturation and a
  soft glow; jam as a plain jar (no baked text label).

### Motion
Keep existing fly / pulse / urgency feedback. Prefer soft tactile hover
(slight lift or scale) over new flashy effects (except shrines: no hover
lift; shrine art does not pulse or move on tier-up or dragon burn — rising
overlay sparks / fire only). Farm stays primary; chrome stays quiet.

## Core loop
Choose a crop → Plant it → Wait (optional water if the plant asks;
optional critter welcome if a butterfly settles) → Crop stays ready on the
plot → Drag ready crop to a shrine, the Dragon Temple, or an adjacent ready
crop (alchemy mix) → Plant again.
The farm remains the primary screen.

Inventory shelf, desk alchemy Mix row, desk fireflies, and flowering are
**parked** (art kept; not in the live loop).

## Farm
- Board is 4 rows by 4 columns. Corner cells are shrine footings (no plots).
- 12 plantable plots (`src/data/farmLayout.js`). 4 start unlocked (bottom-
  center 2×2); 8 are visible but locked. (confirmed)
- Fox Shrine unlocks more plots (see Shrines). Layout (numbers = Fox unlock
  tier; `0` = start unlocked):

```text
  Frog     4      4     Monkey
    3      2      2       3
    1      0      0       1
   Fox     0      0     Tiger
```

## Crops
6 plantable crop types (`src/data/crops.js`): wheat, turnip, blueberry,
moonflower, golden_pumpkin, sunfruit. Differ by growth duration, rarity, and
research unlock level.

Crop fields: id, name, description, rarity, unlockResearchLevel,
growthTimeSeconds, harvestAmount, shrineValues, plantable, decaySeconds,
decayDisabled, maxStack, icon (emoji fallback; image at
`assets/icons/{id}.png` or `.svg` when present). Plantables also have
optional watering fields (see Watering): `waterRequestChance`,
`waterRequestMinProgress`, `waterRequestMaxProgress`,
`waterTimeSavedSeconds`; and optional critter-visit fields (see Critter
Visits): `critterVisitChance`, `critterVisitMinProgress`,
`critterVisitMaxProgress`, `critterShrineProgress`.

Alchemy products are also crop defs with `plantable: false` (see Alchemy).
They share inventory, shrine offerings, and Dragon Temple matched tributes, but
never appear in the crop picker. Watering and critter fields apply to
plantables only.

`decaySeconds` is how long a crop lasts after its decay clock starts (all
crops currently 60). Convert with `getDecayMs` when comparing to
`expiresAt`. When `decayDisabled` is true, `getDecayMs` returns null, no
`expiresAt` timer is started, and the crop never spoils (including existing
saves that still carry old timers). All crops currently have
`decayDisabled: true`.

`shrineValues` is offering progress per crop per shrine (`frog`, `monkey`,
`fox`, `tiger`) when that crop is on the active tier’s allowlist. Values are
affinity-based (strong preferred shrine, soft floor elsewhere). Discovery Log
readouts (via `formatShrineValues` / log face icons
`log_{frog|monkey|fox|tiger}.png`) list only shrines that accept the crop in
any tier. Shrine detail shows an Accepts line for the active tier’s allowlist
(see Shrines).

### Plantable crops (current)

| Crop | Growth | Frog | Monkey | Fox | Tiger | Role |
|------|--------|------|--------|-----|-------|------|
| wheat | 30s | 3 | 2 | 1 | 1 | Frog primary |
| turnip | 60s | 1 | 1 | 4 | 2 | Fox primary |
| blueberry | 90s | 1 | 2 | 5 | 1 | Fox primary, Monkey secondary |
| moonflower | 150s | 2 | 6 | 1 | 2 | Monkey primary |
| golden_pumpkin | 300s | 2 | 2 | 2 | 7 | Tiger primary |
| sunfruit | 480s | 6 | 2 | 2 | 7 | Frog + Tiger dual primary |

### Watering (plantables)

Optional reward only — never mandatory. No wilt, no penalty for ignoring.

| Crop | Chance | Window (of growth) | Time saved |
|------|--------|--------------------|------------|
| wheat | 0.55 | 0.25–0.70 | 8s |
| turnip | 0.50 | 0.25–0.70 | 12s |
| blueberry | 0.45 | 0.20–0.75 | 25s |
| moonflower | 0.40 | 0.20–0.75 | 35s |
| golden_pumpkin | 0.35 | 0.20–0.80 | 50s |
| sunfruit | 0.30 | 0.20–0.80 | 70s |

- `waterRequestChance` (0–1): on plant, roll once; if hit, this instance will ask.
- `waterRequestMinProgress` / `waterRequestMaxProgress` (0–1): random fraction of
  snapshotted `growthMs` when the ask appears (`waterRequestAt`).
- `waterTimeSavedSeconds`: seconds removed from remaining growth when watered
  (clamped to remaining). Convert with `getWaterTimeSavedMs`.

### Critter Visits (plantables)

Optional reward only — never mandatory. No wilt, no penalty for ignoring.
A butterfly may settle on a growing plant. Welcoming it sends a small
**safe shrine blessing** (progress only) to the neediest **feedable**
non-maxed guardian (see Shrines — critters cannot bypass research gates).
Not an offering: does not spend a crop, does not enter inventory, and does
**not** wake the Dragon (uses `addShrineProgress` only — never `offerCrop`).

| Crop | Chance | Window (of growth) | Shrine progress |
|------|--------|--------------------|-----------------|
| wheat | 0.60 | 0.40–0.85 | 2 |
| turnip | 0.32 | 0.40–0.85 | 2 |
| blueberry | 0.28 | 0.40–0.85 | 2 |
| moonflower | 0.25 | 0.40–0.85 | 3 |
| golden_pumpkin | 0.22 | 0.40–0.85 | 3 |
| sunfruit | 0.20 | 0.40–0.85 | 3 |

On plant, water rolls first. If water hits, this plant never hosts a
critter. If water misses, roll `critterVisitChance` (may get a butterfly or
neither). At most one care cue per plant.

- `critterVisitChance` (0–1): after a water miss, roll once; if hit, this
  instance will host a visit.
- `critterVisitMinProgress` / `critterVisitMaxProgress` (0–1): random fraction
  of snapshotted `growthMs` when the butterfly appears (`critterVisitAt`).
- `critterShrineProgress`: safe progress granted to the chosen shrine on
  welcome.

**Neediest shrine:** among non-maxed **feedable** shrines (active tier
allowlist has at least one crop obtainable at current `researchLevel` —
same notion as Dragon demand: unlocked plantable, or alchemy whose inputs
are unlocked), lowest effective devotion
`sum(progressRequired for completed tiers) + current progress`, computed
from live `{ tier, progress, dragonBonusOfferings }` (Dragon burns lower this
automatically — do
not store a permanent points-ever-offered counter). Ties: lowest current-bar
fill fraction, then Frog → Monkey → Fox → Tiger. If none are feedable,
welcome clears with no shrine progress.

## Research
- Hidden `researchLevel` starts at 1. Not shown in UI yet.
- Plant only if `unlockResearchLevel <= researchLevel`.
- Monkey Shrine raises research (see Shrines). At start: wheat and turnip only.
- Crop picker lists plantable crops only; locked ones are faded with a
  lock icon on the slice.

## Planting
- Empty unlocked plot → radial pie-slice crop picker around that plot →
  plant immediately. (confirmed)
- Each plantable crop is a slice with its icon (or a lock if not yet
  researched). Hovering an unlocked slice shows growth time in the center
  hub. Click outside the slices (or a locked slice) cancels.
- No seeds. Once unlocked, a crop can always be planted.
- Only `plantable: true` crops can be planted.

## Growth
- Real-time via `plantedAt` vs snapshotted `growthMs` on the planted crop.
- Frog Shrine shortens `growthMs` for crops planted after the upgrade only
  (see Shrines). Formula: `baseGrowthMs / (1 + growthSpeedBonus)`.
- "100% faster" = doubled speed (half duration).
- Planted crop also stores `watered`, `waterRequestAt`, `critterWelcomed`, and
  `critterVisitAt` (see Watering / Critter Visits under Crops). At plant time:
  roll water first; if it misses, roll critter (save-friendly; no per-tick RNG).
  A plant gets water, a butterfly, or neither — never both. **Exception:** a
  flowered plot skips water and always schedules a butterfly (see Flowered
  plots).
- Needs water when: not watered, `waterRequestAt` is set, `now >= waterRequestAt`,
  and the crop is not yet ready. Cue: full-tile dry cracked soil
  (`assets/icons/plot_soil_dry.png`) under the crop, matching the plot’s
  rounded square (crop icon stays full opacity; no numbers).
- Has critter visit when: not welcomed, `critterVisitAt` is set,
  `now >= critterVisitAt`,   and the crop is not yet ready. Cue: small butterfly on the plot
  (`assets/icons/butterfly.png`; emoji fallback `🦋`).
- Short-tap priority on a growing plot: needing water → water; else waiting
  critter → welcome; else no-op. Ready short-tap does nothing (drag to move;
  long-press to uproot — see Uproot). Empty still opens the picker.
- Click a needing-water plot → soft rain sprinkle (~1.625s) falling top-to-bottom
  over the dry patch using water-drop sprites (`assets/icons/water_drop.png`),
  then the patch clears and soil reads as normal brown (or ready honey-glow if
  watering finished growth immediately). Shortens remaining growth by
  `waterTimeSavedSeconds` (clamped), sets `watered: true`.
- Click a waiting-critter plot → apply and save `critterShrineProgress`
  immediately (so a mid-flight quit keeps the points), set
  `critterWelcomed: true`, then butterfly flies to the neediest shrine
  at a constant gentle speed (nearer plots arrive sooner). Shrine progress
  bar updates when it lands (no shrine pulse). No game-text message unless a
  tier-up occurs (then the normal shrine upgrade text applies, and rising
  overlay sparks play on that shrine when the butterfly lands — shrine art
  stays still). If all shrines are already maxed, welcome clears the visit
  with no progress and no message.
- Ignore water or critter → full normal growth / no shrine gift. Offline: if
  still growing and still asking on return, cues wait; if already ready, the
  crop sits ready for drag / uproot as usual.

## Harvesting / moving ready crops
Ready crops stay on the plot. Clicking a ready plot does nothing.
Drag a ready crop to:
- a **shrine** — consumes the crop from the plot; Tiger bonus may apply
  (extra same-crop progress + fly VFX from plot to shrine; not on mix/temple)
- the **Dragon Temple** — fills a matching demand slot from the plot
- an **adjacent ready crop** (up/down/left/right only) — if the pair matches
  a recipe, mix immediately: source plot clears, result sits ready on the
  target plot; invalid pairs snap back with no change. After every successful
  mix (not discovery-only), the target plot shines brightly for ~1.5s.
- Idle hint: when two orthogonally adjacent ready crops match a recipe, a
  dual-tone moss seam appears on the shared plot edge (darker core, soft
  lighter outer edge; no badges or second ring). The seam gently compresses
  and expands along the edge with a soft moss glow. Seam hides while a ready
  crop is being dragged; valid drop targets still use the moss drag-over
  outline.

To discard a ready crop instead of offering or mixing, long-press to
**Uproot** (see Uproot).

Legacy `harvestPlot` / fly-to-inventory path is unused in the live UI.

## Uproot
Players can clear an unwanted crop from the farm without offering it.

- **Who:** Any occupied unlocked plot — growing plantables, ready plantables,
  and ready alchemy-mix results. Locked, napped, or mid-animation plots are
  ignored.
- **Gesture:** Press and hold on the plot (~500ms). If the pointer moves past
  the existing ready-crop drag threshold (~8px), cancel the hold; ready crops
  keep press-and-move drag as today.
- **Confirm:** Plot-anchored overlay with a swipe track labeled **Uproot**
  (track only — no panel chrome). Swipe **right → left** across the track to
  confirm (about 80% of the track). A looping light/shimmer runs right → left
  to hint the gesture. Incomplete swipe snaps back. Tap/press anywhere outside
  the track closes with no uproot. No Cancel/Uproot buttons, no tool mode, no
  trash dock. Subtle hold progress ring on the plot while long-pressing.
- **On confirm:** Plant shrinks into the tile center over ~1s, then the plot
  clears and becomes plantable. Free. No inventory grant, no wrath, no
  shrine/temple progress, discovery unchanged. Dismiss (tap outside the
  track) leaves the crop as-is. Mid-vanish plots are ignored like other
  mid-animation plots.
- **Care cues:** Short tap still waters / welcomes first. Long-press is still
  allowed so a plant can be cleared without waiting out growth.
- Copy uses **Uproot** (not delete / sell / trash).

## Inventory
**Parked:** the inventory shelf UI is removed with the player desk. State may
still carry an empty `inventory` object for migration. Crop holding is
on-plot until plot drag ships.

## Field Notes
Opened by clicking the game-text plank in the info band (`#game-text` /
`src/ui/discoveryLog.js`). Permanent second line on the plank is titled
**Field Notes** (`aria-label` matches). Opens a centered modal (click outside
to close). Reset control sits at the bottom of this modal (opens the existing
reset confirm).

- Modal header: book cutout (`discovery_log.png`) above the title
  **Field Notes** (closed leather-bound journal/tome with a leather strap,
  soft moss accents; simplified shapes for small size; same art language as
  shrines / Dragon Temple), then a progress line **Discoveries N / M**.
  `M` is every crop entry in `CROPS` (plantables + alchemy products);
  `N` is the unique discovered union. No locked silhouettes; undiscovered
  content appears only as remaining count in that progress line.
- Discovered items are the union of crops that have been **ready on a plot**
  and successfully mixed alchemy results. Empty copy when none: “Grow,
  offer, and mix crops to fill your log” (progress still shows `0 / M`).
- Two sections when there is at least one discovery: **Harvested crops**
  (`plantable: true`) then **Crafted crops** (`plantable: false`). Omit a
  section if it has no discovered rows. Order within each section follows
  `CROPS`. No separate Recipes section.
- Each row shows a larger crop icon, name, description (from crop data),
  and full shrine-value readout with emoji-sized log face icons
  (`log_frog.png`, `log_monkey.png`, `log_fox.png`, `log_tiger.png`) plus
  amounts.
- Alchemy mix rows also show a **Created by:** origin line with input crop
  icons and `+` between them (once that mix is discovered). Harvested crops
  omit origin — the section heading is enough.
- Preferred shrine(s): among that row’s four values, emphasize every shrine
  tied for the maximum amount with a quiet honey chip (soft honey
  background/border, amber/bold amount). Teaches affinity by reading the
  numbers; no tutorial copy on the chips (start-of-game plank tips are
  separate — see Game text panel).
- Sticky after Reset only (and survives offer/spoil of held crops when those
  return). State: `discoveredCropIds: string[]` (marked when a crop becomes
  **ready on a plot** via `markReadyCropsDiscovered`);
  `discoveredAlchemyResultIds: string[]` result id keys (marked in
  `mixAlchemy` on first successful Mix). Both lists survive reload;
  cleared only by the full-game Reset button.

## Alchemy
Desk Mix UI remains **parked**. Live mixing is **on-plot**: drag one ready
crop onto an orthogonally adjacent ready crop. Recipes in
`src/data/alchemyRecipes.js` (order-independent). Instant mix; no Mix button.
Result is ready on the drop target plot; source plot empties. Matching ready
pairs show a dual-tone shared-edge moss accent while idle (see Harvesting).

### Recipes (current)
| Inputs | Result | Icon |
|--------|--------|------|
| wheat + turnip | Root Loaf | 🥖 |
| wheat + blueberry | Forest Bread | 🍞 |
| wheat + moonflower | Moonlit Loaf | 🥖 |
| wheat + golden pumpkin | Golden Loaf | 🍞 |
| wheat + sunfruit | Sunbread | 🍞 |
| turnip + blueberry | Wildroot | 🫚 |
| turnip + moonflower | Moonroot | 🫘 |
| turnip + golden pumpkin | Golden Root | 🌿 |
| turnip + sunfruit | Sunroot | 🍀 |
| blueberry + moonflower | Moonberry | 🫐 |
| blueberry + golden pumpkin | Enchanted Jam | 🍯 |
| blueberry + sunfruit | Sunberry | 🍓 |
| moonflower + golden pumpkin | Golden Bloom | 🌼 |
| moonflower + sunfruit | Solar Bloom | 🌻 |
| golden pumpkin + sunfruit | Solar Gourd | 🎃 |

### Alchemy shrine values
For each shrine `s`, `sum[s] = parentA[s] + parentB[s]`, then:

| Kind | Target shrine | Other shrines |
|------|---------------|---------------|
| Normal mix (11 recipes) | `sum + 1` | `sum + 1` |
| Apex gift (4 recipes) | `sum + 3` | `sum + 0` |

Apex gifts are dedicated offerings (best-in-slot for one god). Each shrine’s
apex includes that shrine’s strongest plantable crop(s).

| Shrine | Apex product | Inputs |
|--------|--------------|--------|
| Fox | Wildroot | turnip + blueberry |
| Monkey | Moonberry | blueberry + moonflower |
| Frog | Sunbread | wheat + sunfruit |
| Tiger | Solar Gourd | golden pumpkin + sunfruit |

| Result | Frog | Monkey | Fox | Tiger | Notes |
|--------|------|--------|-----|-------|-------|
| root_loaf | 5 | 4 | 6 | 4 | normal |
| forest_bread | 5 | 5 | 7 | 3 | normal |
| moonlit_loaf | 6 | 9 | 3 | 4 | normal |
| golden_loaf | 6 | 5 | 4 | 9 | normal |
| sunbread | 12 | 4 | 3 | 8 | Frog apex |
| wildroot | 2 | 3 | 12 | 3 | Fox apex |
| moonroot | 4 | 8 | 6 | 5 | normal |
| golden_root | 4 | 4 | 7 | 10 | normal |
| sunroot | 8 | 4 | 7 | 10 | normal |
| moonberry | 3 | 11 | 6 | 3 | Monkey apex |
| enchanted_jam | 4 | 5 | 8 | 9 | normal |
| sunberry | 8 | 5 | 8 | 9 | normal |
| golden_bloom | 5 | 9 | 4 | 10 | normal |
| solar_bloom | 9 | 9 | 4 | 10 | normal |
| solar_gourd | 8 | 4 | 4 | 17 | Tiger apex |

### Alchemy products
- `root_loaf`, `forest_bread`, `moonlit_loaf`, `golden_loaf`,
  `sunbread`, `wildroot`, `moonroot`, `golden_root`,
  `sunroot`, `moonberry`, `enchanted_jam`, `sunberry`,
  `golden_bloom`, `solar_bloom`, `solar_gourd`
- `plantable: false`, `decaySeconds` currently 60, `decayDisabled: true`,
  `shrineValues` as above
- Offer to shrines, or match the Dragon Temple demand when it wakes

## Shrines
Core progression. Four corner gods; offer crops to restore blessings.
Data: `src/data/shrines.js`.

| Corner | Shrine | Theme |
|--------|--------|-------|
| Top-left | Frog | Growth |
| Top-right | Monkey | Research |
| Bottom-left | Fox | Expansion |
| Bottom-right | Tiger | Fortune |

On the main screen, shrines flank the farm left and right (Frog/Fox on
the left, Monkey/Tiger on the right), close to the grid — not in separate
bands far above/below.

Corner cards show icon, name, next/max tier name, and active-tier progress.

### Offerings and progression
- Drag one inventory crop onto a shrine. Only crops on the **active tier’s
  allowlist** (`acceptedCropIds`) are accepted; others are rejected for now
  (not value 0 — locked until a later tier lists them) with short game text
  (e.g. `The Frog shrine wants a different offering now.`).
- An accepted offering adds that crop’s `shrineValues[shrineId]` to progress;
  `progressRequired` per tier is data-driven (escalating; see Tiers).
  Overflow carries to the next tier. Dragon bonus multiplier still applies.
- Starts at tier 0 (no blessing). Completing a bar unlocks the next tier and
  applies that blessing immediately. Same-shrine tiers replace earlier ones;
  different shrines stack. On tier-up, rising overlay sparks climb the shrine
  icon (shrine art does not pulse or move); multi-tier overflow in one grant
  plays the VFX once.
- Maxed shrines reject offerings.
- Mid/late Frog / Fox / Tiger tiers demand researched crops, so Monkey is a
  natural progression gate. Every alchemy mix appears on at least one tier.

### Detail window
Click shrine → centered modal (click outside to close). Reset control sits at the
bottom of this modal (opens the existing reset confirm). Below the title, an
**Accepts:** line lists icons for the **active** tier’s allowlist (omitted
when maxed). Then lists every tier by name and effect text. Only the **active**
tier also shows its Accepts icons and live progress (`n / required`). Completed
and future tiers omit Accepts and progress (future tiers stay faded). When
maxed, every tier is name + effect only.

### Tiers
Progress required escalates within each shrine (medium pacing; total 474).
Each tier lists `acceptedCropIds`.

**Frog — Growth** (12 / 24 / 40 / 52 = 128; apex: Sunbread)
1. Sleeping Frog — 25% faster crop growth — wheat, root_loaf
2. Rainkeeper Frog — 50% faster crop growth — wheat, turnip, root_loaf
3. Ancient River Frog — 75% faster crop growth — blueberry, forest_bread, moonlit_loaf
4. Spirit Frog — 100% faster crop growth — sunfruit, sunbread, sunroot, sunberry,
   solar_bloom

**Monkey — Research** (`researchLevel = 1 + bonus`; 12 / 24 / 40 = 76;
apex: Moonberry)
1. Curious Monkey — Discover more crops to grow. — wheat, turnip, root_loaf
2. Clever Monkey — Unlock rarer crops. — blueberry, forest_bread, wildroot
3. Wise Monkey — Unlock more unique crops. — moonflower, moonlit_loaf,
   moonroot, moonberry

**Fox — Expansion** (`plotsToUnlock` 2 / 2 / 2 / 2; unlock order from
`farmLayout.js` by unlock tier — see Farm sketch; 12 / 24 / 36 / 50 = 122;
apex: Wildroot)
1. Forest Fox — Open more farming plots (2) — turnip, root_loaf
2. Valley Fox — Still more plots (2) — blueberry, forest_bread, wildroot
3. Mountain Fox — Even more plots (2) — moonflower, moonroot, moonberry
4. Guardian Fox — Last plots unlocked (2) — golden_pumpkin,
   golden_root, enchanted_jam, sunberry

**Tiger — Fortune** (+1 offering chance when dragging a ready crop to a
shrine; 14 / 30 / 44 / 60 = 148; apex: Solar Gourd)
1. Young Tiger — 25% for a bonus crop — wheat, turnip
2. Hunting Tiger — 50% for a bonus crop — blueberry, forest_bread, wildroot
3. Golden Tiger — 75% for a bonus crop — moonflower, moonlit_loaf, moonroot,
   moonberry
4. Spirit Tiger — 100% for a bonus crop — golden_pumpkin, sunfruit, golden_loaf,
   golden_bloom, solar_gourd

Bonus: a second same-type offering applies immediately; a spark-fly VFX
arcs from the (now empty) plot to the shrine. No bonus on mix or temple.

## Dragon Temple
Matched-tribute challenge above the farm plot grid (not including shrines).
Not part of shrine progression — a separate challenge on the main screen.
No wall-clock timer; lose via plant-fueled wrath.

| Layer | Path |
|-------|------|
| Config | `src/data/dragonTemple.js` |
| State / mutators | `src/state/gameState.js` |
| Persistence | `src/state/persistence.js` |
| UI | `src/ui/dragonTemplePanel.js`, `src/ui/templeRewardFly.js` |
| Mount | `#dragon-temple` in `index.html` |

### Config (data-driven, current values)
| Key | Meaning | Current |
|-----|---------|---------|
| `slotCount` | Demand board slots to match before auto-burn | 4 |
| `wrathMax` | Wrath at or above this loses the event | 8 |
| `wrathPerPlant` | Wrath added per successful plant while awake | 1 |
| `wrathPerShrineOffer` | Wrath added when offering to an animal shrine while awake | 3 |
| `burnPulseMs` | Length of one ember-wash fire pulse | 1.2s |
| `burnPulseCount` | Fire pulses before crops clear | 3 |
| `resultRevealMs` | Pause after burn before win close | 500ms |
| `rewardBonusOfferings` | Bonus offerings granted by a win prize | 3 |
| `rewardProgressMultiplier` | Progress multiplier while bonus offerings remain | 2 (100% bonus) |
| `rewardSparkCount` | Sparks that fly temple → shrine | 4 |
| `rewardSparkIcon` | Spark emoji | ✨ |
| `defaultTriggerChance` | Starting / post-event offering wake chance | 10% (0.1) |
| `shrineTriggerChanceIncrease` | Per-shrine chance added after a missed roll | 5% (0.05) each |

One matched auto-burn calms the dragon (no multi-round progress points). Each
board slot asks for a specific discovered crop; slots are equal steps (rarity
does not weight the tribute). Total burn animation ≈
`burnPulseMs × burnPulseCount` (currently 3.6s).

### Layout
- Lives inside `#grove-stage` directly above `#farm-board` with a small
  gap between the temple tribute row and the farm board. Info band (Field Notes
  game-text plank) sits below the grove stage.
- Object width matches a 4-plot farm row including frame padding (shrines not
  counted). Soft drop-shadow on the roof figure like corner shrines.
- Stack: wrath meter above → roof-only dragon PNG → 1×4 holy farm-style
  board with four crop slots (`farm_frame` / `plot_locked` textures, brighter
  tint). No Burn button. No niche overlay.
- Meter height is always reserved so resting vs active does not reflow the
  farm or shrines.
- Resting: sleeping dragon; four faded empty board slots (not interactive);
  meters reserved but hidden.
- Active: awake dragon; board slots show demand ghost icons; wrath meter
  visible. No whole-object hover lift. Players do not click the dragon.

### Resting vs active
- Resting: sleeping figure; faded board slots only. Click / double-click does
  nothing (event is not player-started).
- Active: awake figure; wrath bar (fills toward `wrathMax`, ember timer-bar
  colors, no numbers) above the art; demand slots on the tribute board.
- After a win: game text panel shows
  `The Dragon blesses your grove.`
- After a loss: game text panel shows
  `The Dragon burnt your {animal} shrine.` (animal from the shrine name
  without trailing ` Shrine`, e.g. Frog / Fox / Monkey / Tiger).
  If no shrine has progress to burn:
  `The Dragon's wrath fades - you got lucky.`
- `lastResult` is still stored (`null` | `'success'` | `'failed'`) but no
  longer drives tile copy.

### Trigger (shrine offerings)
The dragon grows angry when players give offerings to the shrines. Chance is
hidden (`triggerChance`, never shown in UI) and persists across refresh/reload.

- After a **player** crop drop onto a shrine only (`offerCrop`):
  - If the temple is already `active` → offering still resolves, then add
    `wrathPerShrineOffer` wrath (may immediately lose if wrath hits max). No
    wake roll and no chance increase.
  - Else roll `Math.random() < triggerChance`.
  - Hit → start the event immediately with a **demand** of `slotCount` crop
    ids, reset `triggerChance` to `defaultTriggerChance`, and set the game
    text panel to:
    `Dragon awakens! Offer crops or face its wrath.`
    (overwrites a same-offering shrine upgrade message if both occur).
  - Miss → add that shrine’s `shrineTriggerChanceIncrease` value, capped at 100%.
- Temple win blessing does **not** roll or increase the chance.
- Chance caps at 100% (`1.0`).

### Demand generation
- Pool = `discoveredCropIds` that are currently obtainable at `researchLevel`
  (plantables with `unlockResearchLevel <= researchLevel`; alchemy products
  only if both recipe inputs are unlocked plantables). Sticky discovery is
  unchanged — locked discoveries stay in the Discovery Log but are excluded
  from demand until research is restored. Ignores current inventory ownership
  (no inventory bias).
- Length = `slotCount` (4). Repeats allowed (needed early when few discoveries).
- **Jealous echo (required):** at least one slot is the crop that was just
  offered to the shrine that woke the dragon (even if that crop is no longer
  obtainable).
- Remaining slots: uniform random from the pool with replacement.
- If the filtered pool is empty, fall back to currently unlocked plantables
  (always at least wheat and turnip at research 1). If that is also empty,
  fall back to the echo crop alone.

### Event flow
- Triggered by the offering anger roll above (not by interacting with the temple).
- Wrath starts at 0. No wall-clock timer.
- Empty board slots show a faded ghost icon of the demanded crop.
- Drop onto a board slot only accepts the matching `cropId`. Drop anywhere on
  the active temple fills the first empty slot that demands that crop. Wrong
  crops are ignored. One crop leaves inventory on place; slots store
  `{ cropId, expiresAt }` and keep decaying (same urgency tints as
  inventory). While `burning`, slotted crops are not removed by decay.
- Click a filled board slot to return that crop to inventory (same as alchemy;
  keeps `expiresAt`) until auto-burn starts.
- Filled matched slots show a looping bright fire-edge highlight traveling
  around the border (ready to burn). It stays while the crop remains in the
  slot and escalates when auto-burn starts (hotter, faster, thicker trail).
- When the last matching crop is placed (all board slots correct), the impatient
  dragon auto-takes the tribute: burn starts immediately (no Burn button;
  players do not touch the dragon). Place sweeps expired slots first.
- On burn: slots stay filled and locked. The ready fire-edge escalates;
  each slot pulses an ember wash `burnPulseCount` times at `burnPulseMs`
  each; the crop icon chars and fades. While burning, crops cannot be removed or
  replaced; temple drops are ignored; plant/offer wrath is not applied.
- After the burn animation ends: slotted crops are consumed (cleared, not
  returned) and the event wins (`pendingClose: 'success'`).
- Before win close, keep the active temple UI for `resultRevealMs` (500ms),
  then close.
- Closing (win or lose) returns any leftover non-burning slotted crops to
  inventory.
- After a win (temple already back to resting): a shrine blessing of
  `rewardBonusOfferings` (3) doubled-progress offerings is applied immediately
  and flagged via `pendingReward` until claimed. Uses stack if the same shrine
  is blessed again before they are spent. Then ~4 spark emojis (✨) fly from the
  temple to the chosen shrine (visual only). Prefer a non-maxed shrine; if every
  shrine is maxed, fly to any random shrine and stop (no blessing granted).
- When the target is not maxed: sparks disappear on arrival and a thin amber
  outline appears on the shrine figure (CSS `drop-shadow` following the PNG
  alpha; no bloom, progress bar unchanged). The outline lasts while
  `dragonBonusOfferings > 0` and clears when the uses are spent, the shrine is
  maxed, or that shrine is burned. No icon pulse. The player can keep farming
  during the fly.
- While `dragonBonusOfferings > 0` on a shrine, each successful **player** crop
  offering to that shrine (`offerCrop` only) grants
  `shrineValues × rewardProgressMultiplier` progress and consumes one use.
  Critter gifts and other `addShrineProgress` paths are unaffected and do not
  consume uses.

### Wrath (lose condition)
While active and not burning / pending close:
- Each successful **plant** (`plantCrop`) adds `wrathPerPlant`.
- Offering to an animal shrine adds `wrathPerShrineOffer`.
- Watering, uproot, critter welcome, alchemy mix, inventory moves, harvest,
  and temple slotting add **no** wrath. AFK adds none. Crops already growing
  when the dragon wakes do not add wrath until the player plants anew.
- When `wrath >= wrathMax` → lose immediately: apply shrine-burn penalty,
  close temple to rest, set lose game text.
- Wrath meter uses the same ember fill colors as the former timer bar; fill
  grows with wrath (does not deplete with time).

### Lose shrine burn
On lose: pick one random shrine that has progress (`tier > 0` or
`progress > 0`). Drop it by one tier and clear its current progress bar
(`progress = 0`). Also clear that shrine’s remaining `dragonBonusOfferings`
(if any). If already at tier 0 with bar progress only, stay at
tier 0 and clear the bar. The player can offer again from the new tier’s
bar. If none have progress, skip the burn (message line 1 only).
UI: when a shrine is burned from plant or offer wrath, rising fire overlays
climb that shrine icon once (same timing as tier-up sparks; shrine art stays
still). Lucky lose (nothing to burn) and load/tick catch-up skip the VFX.
Per-shrine revoke (only the lost tier’s blessing):
- Frog — growth speed blessing steps down one tier (live via
  `getActiveBlessing`); at tier 0, new plants use base growth. Crops
  already growing keep their baked `growthMs`.
- Fox — re-lock the lost tier’s `plotsToUnlock` plots (2 / 2 / 2 / 2;
  reverse of unlock order from `farmLayout.js`).
  Destroy crops on those re-locked plots (not returned to inventory).
  Tier-0 bar clear locks nothing.
- Tiger — bonus harvest chance steps down one tier (live blessing); at
  tier 0 returns to 0%.
- Monkey — `researchLevel` syncs to the new active tier
  (`STARTING_RESEARCH_LEVEL + researchBonus`, or starting level 1 at
  tier 0). Crops already on the board stay and can finish/harvest;
  planting still checks research.
- If the page reloads mid-burn / mid-reveal / mid-spark on a win, load
  snap-finishes the event and claims `pendingReward` so the blessing is
  not lost (spark animation may be skipped; glow shows from remaining
  uses). Lose penalties apply on wrath max (including load if still
  active at/over max; fire overlay is skipped on that catch-up path).

### State
`dragonTemple: { active, demand, wrath, slots, lastResult, burning,
pendingClose, pendingReward, triggerChance }`
- `active` — event open or resting
- `demand` — `cropId[]` length `slotCount` while active; empty when resting
- `wrath` — 0…`wrathMax` while active; 0 when resting
- `slots` — array of `{ cropId, expiresAt }` or `null` (length `slotCount`)
- `lastResult` — `null` | `'success'` | `'failed'` (preserved across close
  and across starting a new event; not shown on the resting tile)
- `burning` — ember burn animation in progress after auto-burn (demand matched)
- `pendingClose` — `null` | `'success'` after burn, while waiting
  `resultRevealMs` before close
- `pendingReward` — win shrine blessing not yet applied; preserved across close
  and claimed on load if still set
- `triggerChance` — hidden 0–1 chance the next shrine offering wakes the
  dragon; reset to `defaultTriggerChance` when an event starts; preserved
  across close and reload

### Tick / persistence
- Main loop ticks every 1s: while active, updates wrath fill and filled-slot
  decay tints in place (does not rebuild the board, so the ready-edge trail
  keeps looping). Full temple re-render only when slot contents change (e.g.
  spoil). While burning, only refreshes the wrath fill (does not restart the
  burn animation).
- No wall-clock timeout lose.
- Mid-event state (`demand`, `wrath`, slots, burning, pendingReward) is saved.
  `triggerChance` is always saved (resting and active).
- On load, legacy timer events without a valid `demand` close without penalty.
  If `burning` → snap-finish the burn (set pending success close). If
  `pendingClose` is set → finalize close (win sets `pendingReward`). If
  `pendingReward` → claim shrine blessing immediately. If `active` and
  `wrath >= wrathMax` (and not mid-burn/reveal) → resolve as a loss and save.

## Screens
Main farm in a scenic grove stage + info band (Field Notes game-text plank) +
Dragon Temple. Overlays: radial crop picker (anchored to the clicked plot),
uproot confirm (anchored to the held plot), shrine detail, Field Notes modal,
reset confirm. No separate menus. Reset is at the bottom of Field Notes.

### Layout (current)
- Target: desktop and portrait phone (see **Platform** — every feature must
  work well on touch). Main screen (grove + temple + farm + shrines + text
  plank) fits in `100dvh` **without vertical scrolling**; tile/shrine sizes
  scale via `stageFit.js`.
- Bands: scenic grove stage on top (`#grove-stage` holds Dragon Temple above
  the framed 4×4 farm board with a small temple↔farm gap; corner cells are
  shrine footings with oversized figures overflowing the frame and slim
  vertical outer progress tracks (left of frog/fox, right of monkey/tiger);
  board width drives nearly full phone width);
  info band below (`#info-band`: two-line
  game-text plank with permanent **Field Notes** title; click opens the
  modal). No bottom Reset dock.
- Farm stays primary inside the grove. Dragon Temple height is reserved for
  the active dock even while resting so the clearing does not jump.
- Ready crops stay on plots; click does nothing. Drag with **pointer events**
  (mouse + touch) to shrines / temple / adjacent ready crops to mix.
  Long-press (mouse + touch) opens Uproot confirm on occupied plots.
- **Reset** lives at the bottom of the Field Notes modal (confirm overlay
  unchanged).

## Game text panel
HUD message area for explaining what is going on.

- Location: fills the info band below the scenic grove stage. Chrome is
  always visible. Whole plank is clickable and opens Field Notes.
- Painted plank backdrop (`assets/scene/game_text_plank.png`) with a faint
  linen readability wash and warm wood rim; ink text with a soft light
  shadow for legibility. Fixed **two-line** height.
- Line 1: dynamic message (single-line ellipsis). Line 2: permanent title
  **Field Notes** (slightly quieter than the message). Never grows or
  shrinks. No scroller. Text is centered in the tile. Font size `0.875rem`
  (title `0.75rem`).
- Default when `gameText` is `null` (startup, reset, or after clear):
  `It's a cozy day for farming.`
  (UI fallback in `gameTextPanel.js`; state stays `null`). New text replaces
  current text. Code can clear it (`clearGameText`) to restore the default.
  No player dismiss control yet.
- Plain text only (no HTML) in the message line.
- Persists with save/load.

Triggers:
- Shrine tier-up (any path through `addShrineProgress`, including offerings
  and critter welcome gifts):
  `{shrine name} upgraded`. If one grant jumps multiple
  tiers, only the highest tier reached is shown. UI also plays rising
  overlay sparks on that shrine (once per grant; shrine art stays still).
  Critter path: sparks when the butterfly lands.
- Shrine completion epilogue: when a tier-up leaves all four shrines maxed
  and the epilogue has not yet been successfully displayed this playthrough,
  arm `shrineEpilogueDueAt` (`now + SHRINE_EPILOGUE_DELAY_MS`, currently
  6000). The upgrade line above still shows first. When due (1s tick or
  load catch-up): if all shrines are still maxed, set
  `Every shrine stands complete. The forest rests.` and set
  `shrineEpilogueShown`. If shrines are no longer all maxed at due time
  (e.g. Dragon burn in the wait), clear `dueAt` only — do not set
  `shown`; a later all-maxed can arm again. `shown` is set only when the
  epilogue text is actually written. Dragon burn clears a pending `dueAt`
  immediately when shrines drop below all-maxed.
- Dragon Temple wake: `Dragon awakens! Offer crops or face its wrath.`
- Dragon Temple win: `The Dragon blesses your grove.`
- Dragon Temple lose with burn:
  `The Dragon burnt your {Frog|Monkey|Fox|Tiger} shrine.`
  UI also plays rising fire overlays on that shrine (once; shrine art stays
  still). Plant and offer wrath paths only — load/tick catch-up skips VFX.
- Dragon Temple lose with nothing to burn:
  `The Dragon's wrath fades - you got lucky.`
- Critter welcome and desk firefly welcome do not set game text (except when
  a critter gift causes a shrine tier-up, via `addShrineProgress` above).
- Tanuki nap arrival, sleep, and departure do not set game text.
- Start tutorial (contextual plank tips only — no modal, no spotlight, no
  forced actions, no player dismiss). Sticky `tutorialSeen` flags until
  Reset. Copy in `src/data/tutorial.js`. Each tip sets `gameText` and its
  flag only when the line is actually written. Dragon wake / win / lose,
  shrine upgraded, and epilogue always win: if one of those is showing, a
  tutorial tip does not overwrite it and leaves its flag false so it can
  fire later. Shrine reject is not critical — tips may overwrite it. No
  Monkey / research unlock tip (tier-up line + planter wheel are enough).

  | When | Game text | Flag |
  |------|-----------|------|
  | Fresh state / Reset (`createInitialState`) | `Tap an empty plot to plant.` | `welcome` (set true with the line) |
  | First crop reaches ready on a plot | `Drag a ready crop to a shrine.` | `firstReady` |
  | First successful shrine offer | `Offerings earn the guardians' favor.` | `firstOffer` |
  | After first offer, when any valid recipe pair is ready on the board (not necessarily adjacent) | `Ready crops side by side can mix into something new.` | `mixInvite` (skipped if `firstMix` already true) |
  | First successful adjacent mix | `Mixing ready crops creates something new.` | `firstMix` |

API (`src/state/gameState.js`): `setGameText(state, text)`,
`clearGameText(state)`, `maybeShowShrineEpilogue(state, now)`,
`maybeShowTutorialTip(state, flagKey)`, `maybeShowMixInviteTip(state, now)`,
`createInitialTutorialSeen()`.
UI: `src/ui/gameTextPanel.js`. Delay / line constants:
`SHRINE_EPILOGUE_DELAY_MS`, `SHRINE_EPILOGUE_LINE` in `src/data/shrines.js`.
Tutorial: `TUTORIAL_LINES`, `TUTORIAL_FLAG_KEYS` in `src/data/tutorial.js`.

## Flowered plots (land care)
**Parked** (no inventory to spend). Flowered soil art
(`assets/icons/plot_soil_flowered.png`) kept for later. `flowerPlot` is a
no-op in the live build.

## Desk visitors (fireflies)
**Parked** with the desk. Config (`src/data/deskVisitor.js`) and
`assets/icons/firefly.png` kept for later. Scheduling is a no-op.

## Plot visitors (tanuki nap)

Pure-flavor visitor on the farm grid — fully separate from plot butterflies and
desk fireflies. Config in `src/data/plotNapper.js`. Single pose:
`assets/icons/tanuki_sleep.png` (emoji fallback `🦝`). The tanuki is only ever
shown curled asleep — it has no walk or stretch pose.

**Trigger:** after a successful harvest (`harvestPlot`) — currently
dormant while ready crops stay on plots; returns with plot-offer drag —
roll hidden `harvestChance` (default **0.15**). No-ops if a napper already exists or
unlocked plots < `minUnlockedPlots` (default **8**). Hit → schedule
`plotNapper` with `appearAt = now + random(delayMinSeconds, delayMaxSeconds)`
(default **8–20** seconds), status `approaching`. Does **not** pick a plot yet.
At most one tanuki farm-wide.

**Arrival:** when `now >= appearAt`, list eligible plots: unlocked, empty
(`!crop`), not flowered. If fewer than **2** eligible, visitor is **lost**
(cleared; no animation, no message, no retry — never take the last free empty
plot). Else pick one at random → status `sleeping`, set `plotId`,
`wakeAt = now + random(napMinSeconds, napMaxSeconds)` (default **90–150**
seconds). UI fades the sleeping tanuki in at the tile centre (**480 ms**, grows
from its base, no travel), then idle breathing + zzz on the tile.

**Occupation:** while sleeping or waking, the plot cannot be planted or
flowered (`isPlotNapped`). Clicks do nothing. No wake button, no reward, no
game text. Fox re-lock of that plot clears the napper.

**Departure:** when `now >= wakeAt`, status → `waking`. UI fades the sleeping
tanuki out in place at the tile centre (**480 ms**, the exact time-reverse of
the appear); on finish,
`clearPlotNapper`. On load, a `waking` napper is cleared outright (no
retroactive leave animation).

**State:** `plotNapper: null | { id, kind: 'tanuki', appearAt,
status: 'approaching' | 'sleeping' | 'waking', plotId?, wakeAt? }`.

## Entities
- Plot: `{ id, locked, crop, flowered }` — `flowered` is boolean (default false)
- Planted crop: `{ cropId, plantedAt, growthMs, watered, waterRequestAt,
  critterWelcomed, critterVisitAt }` — `waterRequestAt` / `critterVisitAt` are
  absolute timestamps or `null` if this plant never asks / never hosts a visit
- Crop def: see Crops
- Inventory: `{ [cropId]: [{ amount, expiresAt }, …] }` (FIFO batches)
- Pending harvest: `{ id, cropId, amount, expiresAt }` (in-flight grant until
  fly lands; decay clock already running)
- Desk visitor: `{ id, kind: 'firefly', appearAt, status, slotIndex? }` —
  see Desk visitors
- Desk gift pin: `deskGiftLand` (`null` | `{ slotIndex, cropId }`) — transient
- Plot napper: `plotNapper` (`null` | tanuki visitor) — see Plot visitors
- Alchemy: `{ slotA, slotB, resultId }` — input slots are
  `{ cropId, expiresAt }` or null; `resultId` is a bare crop id or null
- Dragon Temple: `{ active, demand, wrath, slots, lastResult, burning,
  pendingClose, pendingReward, triggerChance }` — `demand` is `cropId[]`;
  `slots` are `{ cropId, expiresAt }` or null
- Game text: `gameText` (`null` | string) — top panel message
- Shrine epilogue: `shrineEpilogueShown` (boolean, sticky until Reset; true
  only after the epilogue line was displayed), `shrineEpilogueDueAt`
  (`null` | epoch ms while a wait is armed)
- Tutorial: `tutorialSeen: { welcome, firstReady, firstOffer, firstMix }`
  (booleans, sticky until Reset; each true only after that tip was written)
- Discovery: `discoveredCropIds: string[]`,
  `discoveredAlchemyResultIds: string[]` — sticky until full Reset
- State: `researchLevel`,
  `shrines: { [id]: { tier, progress, dragonBonusOfferings } }`, `alchemy`,
  `dragonTemple`, `pendingHarvests`, `deskVisitors`, `deskGiftLand`,
  `plotNapper`,
  `discoveredCropIds`,
  `discoveredAlchemyResultIds`, `gameText`,
  `shrineEpilogueShown`, `shrineEpilogueDueAt`, `tutorialSeen`
- Shrine def: `{ id, name, icon, theme, corner, tiers[] }`
- Tier: `name`, `progressRequired`, `acceptedCropIds`, `tooltip` (effect
  text), plus blessing field (`growthSpeedBonus` | `researchBonus` |
  `plotsToUnlock` | `bonusHarvestChance`)
- Alchemy recipe: `{ inputs: [id, id], resultId }` (order-independent)
- Dragon Temple config: `slotCount`, `wrathMax`, `wrathPerPlant`,
  `wrathPerShrineOffer`, `burnPulseMs`, `burnPulseCount`,
  `resultRevealMs`, `rewardBonusOfferings`,
  `rewardProgressMultiplier`, `rewardSparkCount`,
  `rewardSparkIcon`, `defaultTriggerChance`,
  `shrineTriggerChanceIncrease`

## Persistence
`localStorage` JSON (`saveVersion: 2` = desk-less / plot-held crops). After
plant / water / critter welcome / offer / temple actions / Reset, and on the
1s tick when crops spoil, a tanuki napper arrives/wakes/is lost, a pending
shrine epilogue is due, or a start-tutorial tip is written. Missing
`tutorialSeen` on load is filled with all flags true so returning players
are not re-taught mid-run; fresh games and Reset use `createInitialState`
(welcome tip + remaining flags false).

On load for `saveVersion < 2` (or missing): wipe `inventory`,
`pendingHarvests`, desk alchemy slots, desk visitors, clear `flowered` flags,
and reset any active Dragon Temple (slots discarded — no inventory return).
Then run the usual normalizers. Ready crops on plots are marked discovered
(`markReadyCropsDiscovered`). Missing `discoveredCropIds` seeded from crops
currently on plots / held slots; missing `discoveredAlchemyResultIds`
backfilled to `[]`. Missing or invalid `gameText` backfilled to `null`.
Missing or invalid `shrineEpilogueShown` → `false`; invalid
`shrineEpilogueDueAt` → `null`. On load, `maybeShowShrineEpilogue` runs so
a due wait past its time can fire (or cancel) immediately.
Plot count must match `TOTAL_PLOTS` (12) or the save is replaced.

No server. Player can wipe progress via Reset (confirm required). On Yes,
state is replaced with a fresh `createInitialState()` (including an empty
Field Notes log) and saved. Confirm overlay does not pause timers or
animations; No or click outside dismisses and play continues.

## Design principles
- Cozy over complicated; farm stays primary; smallest complete version first.
- Progression values stay data-driven.

## Future vision (not yet built)
- More alchemy recipes, research UI, deeper progression.
- Vine plot care (second land-care look / perk; mechanic TBD).
- Additional plot critter types; player-chosen shrine destination for
  butterflies.

## Out of scope (current)
- Seeds, full recipe book (always-on catalog), research UI,
  shrine hover tooltips (replaced by detail window).
- Vine plot care (deferred).
- Critter growth time-save, Tiger-like +1 from critters, inventory butterflies,
  waking the Dragon from critter or firefly welcome.
  Alchemy products as plot-care spend.
- Tanuki early wake / shoo, nap rewards, or game text for nap arrival/leave.
