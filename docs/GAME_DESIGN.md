# Farm Game — Design Doc

This doc is the source of truth for decided scope. Sections are filled in
incrementally, one milestone at a time. Nothing here should be invented ahead
of an explicit decision.

## Genre
Cozy, relaxing farming game. Not an action or skill-based game — no
reflexes required. (confirmed)

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
- Stage: three bands — game text (top), scenic grove stage (middle), player
  desk (bottom). Soften the outer app shell so the grove reads as the place;
  desk and grove stay visually separate bands.
- Game text band (`#game-text`): painted weathered wood plank
  (`assets/scene/game_text_plank.png`) in the same Fresh Moss watercolor
  language as the grove and desk; faint linen readability wash over the
  plank; warm worn-wood rim (not mint panel chrome). Own top band — not
  inside `#grove-stage`.
- Grove stage (`#grove-stage`): in-game scenic backdrop
  (`assets/scene/grove_clearing.png`) — misty canopy, empty clearing, moss
  foreground; no baked shrine alcoves (icons sit on top). Farm + corner
  shrines sit on a deeper moss ground plane under the Dragon Temple
- Farm board: soft moss ground plane (quiet chrome) under the grid; painterly
  mossy-stone frame texture (`farm_frame.png`) and plot textures
  (`plot_soil.png`, circular `plot_soil_dry.png` patch when a plant asks for
  water, `plot_locked.png`) matching shrine / mood art; ready plots
  keep honey glow on dirt; optional soft per-row brightness for depth without
  changing tile size. Mood ref: `assets/mood/farm_board_lofi_ghibli_mood.png`
- Locked farm plots: locked tile texture only — no lock emoji/icon overlay.
  Unlock uses a brief locked-to-soil fade (same textures, no lock icon).
- Inventory / alchemy / Discovery Log live on one bottom **player desk**
  (`#player-desk` in `#bottom-dock`): painted watercolor workstation backdrop
  (`assets/scene/player_desk.png`) in the same Fresh Moss language as the
  forest, but a **separate band** with a clear gap from `#grove-stage` — they
  do not touch or share art. Soft mist overlay keeps shelf/slots readable.
  Grove / forest assets and `#grove-stage` styles are not part of the desk
  chrome. Desk outer width matches the grove stage (farm band + grove
  horizontal padding) so it lines up under the forest card.
- **Locked desk art:** `player_desk.png` and the CSS that places it
  (`.player-desk` `background-size` / `background-position` / padding /
  min-height) must not be changed unless explicitly requested. The painted
  Discovery Log book position is calibrated against this lock.
  One approved edit has been made: the painted stone mortar was removed from
  the far-left tabletop so the Mix mortar is the only one on the desk. Canvas
  size and every pixel outside that left patch are unchanged, so the book
  hotspot still matches. Pre-edit backup:
  `assets/mood/archive_desk_with_mortar/player_desk.png`.
- Desk layout: inventory as a top shelf (6 slots); alchemy Mix row centered
  on the work surface; Discovery Log painted into `player_desk.png` on the
  far-right tabletop with a transparent clickable hotspot (`#discovery-log`,
  `aria-label` only — no dock icon, no neon/hover glow; quiet idle visual
  hint over the painted book). Hotspot box is **locked** at
  `right: 4.85rem; bottom: 0; width: 7rem; height: 4.75rem` on
  `.discovery-log-btn` — do not nudge without an explicit ask. No
  main-screen titles for “Alchemy Station” or “Discovery Log” (log title
  remains in the opened modal). Mix is a painted mortar resting between the
  slots: quiet when invalid; soft honey glow and a gentle vertical nudge when
  a valid pair is ready. The desk painting carries the workstation feel.
- Modals: cream linen inside sage / frame borders (Discovery Log, shrine
  detail, reset confirm)
- Shrines: simplified painterly guardian icons on small altars, hugging farm
  corners; main view shows figure + progress bar only (name / tier in the
  click detail modal); no hover lift/scale on shrines
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
One artistic language for crops, shrines, Discovery Log, and the Dragon
Temple: cozy lofi 2D painterly icons with true transparency (no baked
checkerboard or cream canvas). Soft mist belongs on the scenic backdrop;
cutout icons sit cleanly in the grove. Each crop must be unmistakable at
~64px. Discovery Log shrine-value faces (`log_frog.png`, `log_monkey.png`,
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
lift). Farm stays primary; chrome stays quiet.

## Core loop
Choose a crop → Plant it → Wait (optional water if the plant asks;
optional critter welcome if a butterfly settles) → Harvest → Collect →
(optional) Flower an empty plot with a plantable (guarantees next butterfly) →
(optional) Mix crops via alchemy → Offer crops to shrines (optional) →
(optional) Desk fireflies may leave a gift on a free inventory slot →
(optional) Dragon Temple event → Plant again.
The farm remains the primary screen.

## Farm
- Grid of 20 total plots, laid out 5 rows by 4 columns.
- 4 plots start unlocked; 16 are visible but locked. (confirmed)
- Fox Shrine unlocks more plots (see Shrines).

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
affinity-based (strong preferred shrine, soft floor elsewhere). Full
per-crop readouts live in the Discovery Log (via `formatShrineValues` /
log face icons `log_{frog|monkey|fox|tiger}.png`). Shrine detail shows an
Accepts line for the active tier’s allowlist (see Shrines).

### Plantable crops (current)

| Crop | Growth | Frog | Monkey | Fox | Tiger | Role |
|------|--------|------|--------|-----|-------|------|
| wheat | 30s | 4 | 2 | 1 | 1 | Frog primary |
| turnip | 60s | 1 | 1 | 4 | 2 | Fox primary |
| blueberry | 120s | 1 | 2 | 5 | 1 | Fox primary, Monkey secondary |
| moonflower | 180s | 2 | 6 | 1 | 2 | Monkey primary |
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
| wheat | 1.0 | 0.40–0.85 | 2 |
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
  and the crop is not yet ready. Cue: circular dry cracked patch
  (`assets/icons/plot_soil_dry.png`) under the crop, soft-masked so edges blend
  into normal `plot_soil.png` (crop icon stays full opacity; no numbers).
- Has critter visit when: not welcomed, `critterVisitAt` is set,
  `now >= critterVisitAt`,   and the crop is not yet ready. Cue: small butterfly on the plot
  (`assets/icons/butterfly.png`; emoji fallback `🦋`).
- Click priority on a growing plot: needing water → water; else waiting
  critter → welcome; else no-op. Ready still harvests; empty still opens the
  picker.
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
  tier-up occurs (then the normal shrine upgrade text applies). If all shrines
  are already maxed, welcome clears the visit with no progress and no message.
- Ignore water or critter → full normal growth / no shrine gift. Offline: if
  still growing and still asking on return, cues wait; if already ready, just
  harvest.

## Harvesting
- One click harvests a ready crop (`harvestAmount`, currently 1). The crop
  flies from the plot to inventory (green tile → grey on land); the inventory
  count updates when it lands, then the tile pulses.
- The decay clock starts at harvest time (`expiresAt = now + decayMs`),
  including while the crop is still in-flight as a pending grant. Skipped
  when `decayDisabled` is true (`expiresAt` stays null).
- Tiger Shrine may grant +1 extra on harvest (see Shrines). The bonus crop
  flies the same way, starting 0.5s after the first flyer, with spark emojis
  (✨) flying outward from each corner (visual only).
- Mid-flight grants are stored as `pendingHarvests` and applied immediately
  on load if the page reloads before a flyer lands (animation may be skipped).
  Expired pending grants spoil on load instead of entering inventory.

## Inventory
- Top shelf on the player desk (`#inventory`) — fixed row of **6**
  always-visible slots (same tile size as farm plots). Empty slots show as
  quiet dashed frames; filled slots show icon + count in the bottom-right
  corner. Shelf width is constant — it does not grow or shrink when crop
  types are added.
- Each crop has a configurable `maxStack` (all 10 for now). Counts above
  `maxStack` split across additional slots of the same crop (e.g. 11 wheat →
  slots of 10 and 1). A grant is rejected when adding it would exceed 6
  stack slots (inventory + in-flight harvests + waiting desk fireflies).
  The crop stays where it was
  (ready plot, alchemy result, or input slot); the inventory panel briefly
  shakes. No game-text message.
- Waiting fireflies occupy shelf tiles after crop stacks (not empty frames);
  see Desk visitors (fireflies). Only truly free dashed frames accept new
  crop grants.
- Stored as FIFO batches per crop: `{ [cropId]: [{ amount, expiresAt }, …] }`.
  UI fills slots left-to-right from visual stacks of up to `maxStack`.
  Spending / dragging always takes from the oldest batch first.
- Inventory crops are perishable unless `decayDisabled` is true. When
  `expiresAt` is reached, that batch disappears (wall-clock, including
  offline). Decay is on top of shrine / alchemy / temple sinks — not a
  replacement for them.
- Urgency UI (no countdown numbers): normal → soft amber wash in the last
  ~25% of life → stronger wash + small wilt mark in the last ~10%. Each
  filled inventory slot’s urgency uses the oldest unit in that stack. Same
  tints on filled alchemy and Dragon Temple input slots. Spoiled crops
  disappear with no game-text notice.
- Drag to a slot: the oldest unit leaves; its tint travels with it; the
  inventory stacks retint from the new oldest units left. Return from a slot
  (unconsumed): same `expiresAt` re-enters inventory; stack urgency updates
  from FIFO fill again.
- Includes harvested crops and claimed alchemy results.
- Receiving a crop briefly pulses its stack slot (after the harvest fly
  lands; the last slot for that crop).
- Items are draggable; one crop per drop onto a shrine, alchemy board
  (empty slot or anywhere on the board), the active Dragon Temple
  (empty slot or anywhere on the temple tile), or an empty unlocked farm
  plot that is not already flowered (**plantable crops only** — flowers
  that plot; see Flowered plots). Empty inventory frames are
  not drop targets.
- No hover tooltips on inventory tiles (keeps drag-and-drop uncluttered).

## Discovery Log
Painted into the player desk backdrop on the far-right tabletop
(`assets/scene/player_desk.png`), clear of the centered Mix row. Clickable
via a transparent hotspot (`#discovery-log` / `src/ui/discoveryLog.js`) —
no separate dock icon, no neon/hover glow; quiet idle visual hint over the
painted book. Hotspot geometry is **locked** (`.discovery-log-btn`:
`right: 4.85rem; bottom: 0; width: 7rem; height: 4.75rem`) together with
desk backdrop placement — do not move unless explicitly requested. Opens a
centered modal (click outside to close).

- No visible “Discovery Log” label on the main screen; hotspot uses
  `aria-label="Discovery Log"`.
- Modal header: book cutout (`discovery_log.png`) above the title
  **Discovery Log** (closed leather-bound journal/tome with a leather strap,
  soft moss accents; simplified shapes for small size; same art language as
  shrines / Dragon Temple), then a progress line **Discoveries N / M**.
  `M` is every crop entry in `CROPS` (plantables + alchemy products);
  `N` is the unique discovered union. No locked silhouettes; undiscovered
  content appears only as remaining count in that progress line.
- Discovered items are the union of ever-received crops and successfully
  mixed alchemy results. Empty copy when none: “Harvest crops or mix
  alchemy to fill your log” (progress still shows `0 / M`).
- Two sections when there is at least one discovery: **Harvested crops**
  (`plantable: true`) then **Alchemy mixes** (`plantable: false`). Omit a
  section if it has no discovered rows. Order within each section follows
  `CROPS`. No separate Recipes section.
- Each row shows a larger crop icon, name, description (from crop data),
  soft rarity label when `rarity` exists (plantables only today), and full
  shrine-value readout with emoji-sized log face icons (`log_frog.png`,
  `log_monkey.png`, `log_fox.png`, `log_tiger.png`) plus amounts.
- Alchemy mix rows also show a **Created by:** origin line with input crop
  icons and `+` between them (once that mix is discovered). Harvested crops
  omit origin — the section heading is enough.
- Preferred shrine(s): among that row’s four values, emphasize every shrine
  tied for the maximum amount with a quiet honey chip (soft honey
  background/border, amber/bold amount). Teaches affinity by reading the
  numbers; no tutorial copy.
- Sticky after offering, spoiling, emptying inventory, or Reset only.
  State: `discoveredCropIds: string[]` (marked in `forceAddToInventory`);
  `discoveredAlchemyResultIds: string[]` result id keys (marked in
  `mixAlchemy` on first successful Mix). Both lists survive reload;
  cleared only by the full-game Reset button.

## Alchemy
Work surface on the player desk below the inventory shelf
(`src/ui/alchemyPanel.js`). Recipes in `src/data/alchemyRecipes.js`
(order-independent). Distinct from inventory: `#alchemy`, separate slots and
state (`state.alchemy`).

### Board
- Sits on the desk work row under the inventory shelf (shelf-on-top layout).
- Untitled work surface centered on the desk (no station title, no station
  tile). Two input slots + Mix (input mode). Mix is the primary action
  between the slots, drawn as a painted mortar and pestle
  (`assets/icons/mortar.png`) sitting on the desk rather than a labelled
  button — no text, no border, no fill. Its base lines up with the slot
  bottoms and it stands `4.8rem` tall, matching the painted Discovery Log
  book. The button's layout box stays `var(--tile)` tall and only the art
  overflows upward, so desk height and the book hotspot never move.
- Drag inventory crops into an empty slot, or anywhere on the alchemy
  board (fills the first open slot left to right). If both slots are
  full or a result is waiting to claim, the drop is ignored.
- Input slots store `{ cropId, expiresAt }` (decay continues while held).
  Filled slots show the same urgency tints as inventory.
- Click a filled slot to return that crop to inventory (keeps `expiresAt`).
- Mix is disabled until the pair matches a recipe: the mortar sits faded and
  desaturated (`.alchemy__mix--faded`). A valid pair wakes it
  (`.alchemy__mix--ready`) with a soft honey glow under it and a gentle
  vertical nudge (same family as the plot butterfly bob — no scale pulse).
  Perishable ticks refresh slot urgency in place (`updateAlchemyLive`) so the
  ready animation is not restarted every second — same idea as the Dragon
  Temple ready-edge. No invalid-mix popup.
- Mix / Burn / spend actions sweep expired crops first so an exact-second
  expiry cannot be consumed.
- On Mix: brief **ritual** (visual only, no game text) — pestle grind on the
  mortar (~340ms) with a soft spark puff, then inputs are consumed; slots and
  Mix hide; result appears in the center with icon and name (soft rise-in) and
  sparks arc from the mortar into the claim. Fail stays silent (faded mortar).
- Click the result to add it to inventory; board resets to empty slots.
  Alchemy result decay starts only when claimed into inventory (unclaimed
  result is untinted).

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
| root_loaf | 6 | 4 | 6 | 4 | normal |
| forest_bread | 6 | 5 | 7 | 3 | normal |
| moonlit_loaf | 7 | 9 | 3 | 4 | normal |
| golden_loaf | 7 | 5 | 4 | 9 | normal |
| sunbread | 13 | 4 | 3 | 8 | Frog apex |
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
  (e.g. `The Frog wants Wheat or Root Loaf right now.`).
- An accepted offering adds that crop’s `shrineValues[shrineId]` to progress;
  `progressRequired` per tier is data-driven (escalating; see Tiers).
  Overflow carries to the next tier. Dragon bonus multiplier still applies.
- Starts at tier 0 (no blessing). Completing a bar unlocks the next tier and
  applies that blessing immediately. Same-shrine tiers replace earlier ones;
  different shrines stack.
- Maxed shrines reject offerings.
- Mid/late Frog / Fox / Tiger tiers demand researched crops, so Monkey is a
  natural progression gate. Every alchemy mix appears on at least one tier.

### Detail window
Click shrine → centered modal (click outside to close). Below the title, an
**Accepts:** line lists icons for the **active** tier’s allowlist (omitted
when maxed). Then lists every tier: name, effect text, that tier’s accepted
crop icons, progress bar. Active = live `n / required`; completed = full
"Complete"; future = faded "Locked" (accepts still shown). Maxed = all
Complete.

### Tiers
Progress required escalates within each shrine (medium pacing; total 491).
Each tier lists `acceptedCropIds`.

**Frog — Growth** (15 / 25 / 40 / 55 = 135; apex: Sunbread)
1. Sleeping Frog — +25% growth — wheat, root_loaf
2. Rainkeeper Frog — +50% growth — wheat, turnip, root_loaf
3. Ancient River Frog — +75% growth — blueberry, forest_bread, moonlit_loaf
4. Spirit Frog — +100% growth — sunfruit, sunbread, sunroot, sunberry,
   solar_bloom

**Monkey — Research** (`researchLevel = 1 + bonus`; 12 / 24 / 40 = 76;
apex: Moonberry)
1. Curious Monkey — Research Level +1 → level 2 — wheat, turnip, root_loaf
2. Clever Monkey — Research Level +2 → level 3 — blueberry, forest_bread,
   wildroot
3. Wise Monkey — Research Level +3 → level 4 — moonflower, moonlit_loaf,
   moonroot, moonberry

**Fox — Expansion** (`plotsToUnlock` per tier, currently 4; unlocks highest
locked plot ids first; 15 / 25 / 35 / 50 = 125; apex: Wildroot)
1. Forest Fox — More land — turnip, root_loaf
2. Valley Fox — More land — blueberry, forest_bread, wildroot
3. Mountain Fox — More land — moonflower, moonroot, moonberry
4. Guardian Fox — Final land unlock — golden_pumpkin, golden_root,
   enchanted_jam, sunberry

**Tiger — Fortune** (+1 crop chance on harvest; 20 / 30 / 45 / 60 = 155;
apex: Solar Gourd)
1. Young Tiger — +25% bonus crops — wheat, turnip
2. Hunting Tiger — +50% bonus crops — blueberry, forest_bread, wildroot
3. Golden Tiger — +75% bonus crops — moonflower, moonlit_loaf, moonroot,
   moonberry
4. Spirit Tiger — +100% bonus crops — golden_pumpkin, sunfruit, golden_loaf,
   golden_bloom, solar_gourd

Bonus crop flies from the harvested plot to inventory 0.5s after the base
harvest flyer, with corner sparks; count updates on land.

## Dragon Temple
Matched-tribute challenge above the farm plot grid (not including shrines).
Not part of shrine progression — a separate challenge on the main screen.
No wall-clock timer; lose via harvest-fueled wrath.

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
| `wrathPerHarvest` | Wrath added per successful plot harvest | 1 |
| `wrathPerShrineOffer` | Wrath added when offering to an animal shrine while awake | 3 |
| `burnPulseMs` | Length of one ember-wash pulse | 1.2s (half ready-crop pulse) |
| `burnPulseCount` | Ember-wash pulses before crops clear | 3 |
| `burnEmberCount` | Rising ember dots per burning slot | 3 |
| `burnEmberMs` | Duration of one ember rise (once each) | 1400ms |
| `resultRevealMs` | Pause after burn before win close | 500ms |
| `rewardBonusOfferings` | Bonus offerings granted by a win prize | 5 |
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
- Lives inside `#grove-stage` below the game text panel and directly above
  `#farm-board` (tight grove gap so the tribute board reads flush on the farm).
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
- On burn: slots stay filled and locked. The ready fire-edge escalates; an
  inner ember wash pulses `burnPulseCount` times at `burnPulseMs` each; the
  crop icon chars and fades; `burnEmberCount` ember dots rise once each
  (staggered across the burn). While burning, crops cannot be removed or
  replaced; temple drops are ignored; harvest/offer wrath is not applied.
- After the burn animation ends: slotted crops are consumed (cleared, not
  returned) and the event wins (`pendingClose: 'success'`).
- Before win close, keep the active temple UI for `resultRevealMs` (500ms),
  then close.
- Closing (win or lose) returns any leftover non-burning slotted crops to
  inventory.
- After a win (temple already back to resting): a shrine blessing of
  `rewardBonusOfferings` (5) doubled-progress offerings is applied immediately
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
- Each successful **plot harvest** (`harvestPlot`) adds `wrathPerHarvest`.
  Tiger bonus extra crop from the same harvest does **not** add extra wrath
  (one harvest action = one tick).
- Offering to an animal shrine adds `wrathPerShrineOffer`.
- Planting, watering, critter welcome, alchemy mix, inventory moves, and
  temple slotting add **no** wrath. AFK adds none.
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
Per-shrine revoke (only the lost tier’s blessing):
- Frog — growth speed blessing steps down one tier (live via
  `getActiveBlessing`); at tier 0, new plants use base growth. Crops
  already growing keep their baked `growthMs`.
- Fox — re-lock the lost tier’s `plotsToUnlock` plots (currently 4;
  lowest unlocked expandable plot ids first, reversing unlock order).
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
  active at/over max).

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
Main farm in a scenic grove stage + game text panel + Dragon Temple +
player desk (inventory shelf, alchemy work surface, Discovery Log book).
Overlays: radial crop picker (anchored to the clicked plot), shrine detail,
Discovery Log modal, reset confirm. No separate menus. Reset control sits
below the player desk in the bottom dock.

### Layout (current)
- Target: desktop web. Portrait / mobile fit is deferred.
- Three bands: game text panel at the top (flush with the grove card); scenic
  grove stage in the middle (`#grove-stage` holds Dragon Temple above the
  plot grid with shrines hugging farm corners); player desk
  (`#player-desk` in `#bottom-dock`) below as a **separate** watercolor
  workstation band (`assets/scene/player_desk.png`) — clear gap from the
  grove; outer width matches `#grove-stage` (shared `--grove-outer-width`);
  forest art / `#grove-stage` styles unchanged by desk chrome. Desk:
  inventory shelf on top (fixed 6-slot row, centered on the painted ledge);
  alchemy Mix row centered on the work surface; Discovery Log painted into
  the desk art with a clickable hotspot (desk art + hotspot geometry
  locked — see Visual Style / Discovery Log). Reset below the desk.
- Farm stays primary inside the grove. Dragon Temple height is reserved for
  the active dock even while resting so the clearing does not jump.

## Game text panel
Top HUD message area for explaining what is going on.

- Location: above the scenic grove stage (Dragon Temple + farm), width flush
  with the painted grove card below it (`--grove-outer-width` minus the
  shrine-column overlap). Chrome is always visible.
- Painted plank backdrop (`assets/scene/game_text_plank.png`) with a faint
  linen readability wash and warm wood rim; ink text with a soft light
  shadow for legibility. Fixed one-line height unchanged.
- Fixed height for **one** readable line; never grows or shrinks. No
  scroller — overflow is clipped with ellipsis. Text is centered in the tile.
  Font size `0.875rem`.
- Default when `gameText` is `null` (startup, reset, or after clear):
  `It's a cozy day for farming.`
  (UI fallback in `gameTextPanel.js`; state stays `null`). New text replaces
  current text. Code can clear it (`clearGameText`) to restore the default.
  No player dismiss control yet.
- Plain text only (no HTML). One line only (no embedded newlines).
- Persists with save/load.

Triggers:
- Shrine tier-up (any path through `addShrineProgress`, including offerings,
  Dragon Temple win rewards, and critter welcome gifts):
  `{shrine name} upgraded — {tier tooltip}`. If one grant jumps multiple
  tiers, only the highest tier reached is shown.
- Dragon Temple wake: `Dragon awakens! Offer crops or face its wrath.`
- Dragon Temple win: `The Dragon blesses your grove.`
- Dragon Temple lose with burn:
  `The Dragon burnt your {Frog|Monkey|Fox|Tiger} shrine.`
- Dragon Temple lose with nothing to burn:
  `The Dragon's wrath fades - you got lucky.`
- Critter welcome and desk firefly welcome do not set game text (except when
  a critter gift causes a shrine tier-up, via `addShrineProgress` above).
- Tanuki nap arrival, sleep, and departure do not set game text.

API (`src/state/gameState.js`): `setGameText(state, text)`,
`clearGameText(state)`. UI: `src/ui/gameTextPanel.js`.

## Flowered plots (land care)

Optional sink + personalization. Spend a harvested plantable on empty soil to
bless the next plant with a guaranteed butterfly (no water on that plant).

- Drag a **plantable** inventory crop onto an **empty unlocked** plot that is
  not already flowered. Alchemy products (`plantable: false`) are rejected.
- Consumes one unit from inventory (FIFO). Plot sets `flowered: true`.
- Visual: flowered soil texture `assets/icons/plot_soil_flowered.png` (new
  asset only — does not replace `plot_soil.png`). Yellow/cream blooms + green
  leaves cluster from the top-left down the left edge (stop before the bottom);
  bottom strip and top-right stay clear soil for the growth bar and butterfly
  cue. Center stays open for crops.
- Next plant on that plot: skip water roll; **force** a butterfly visit using
  that crop’s `critterVisitMinProgress` / `critterVisitMaxProgress` window.
  Welcome still optional; still uses `addShrineProgress` only — **never**
  `offerCrop`, so flowering / welcoming **never wakes the Dragon**.
- Flowering does not grant shrine progress by itself.
- Clears `flowered` when that plant is successfully harvested, or when the
  plot is re-locked (Fox burn destroys crop and clears care).
- Already-flowered empty plots reject further flower drops until cleared.
- Ignore-safe: never flowering is fine; base farm loop unchanged.

## Desk visitors (fireflies)

Optional fate gift on the inventory shelf — fully separate from plot butterfly
care. Config in `src/data/deskVisitor.js`. Cue icon: `assets/icons/firefly.png`
(watercolor firefly with a bright glowing abdomen; emoji fallback `✨`).

**Trigger:** after a successful player shrine offering (`offerCrop`), roll
hidden `offerChance` (default **0.20**). Independent of Dragon
`triggerChance`. Hit → enqueue a firefly with
`appearAt = now + random(delayMinSeconds, delayMaxSeconds)` (default
**15–25** seconds). Further offerings can schedule more fireflies while
others are still approaching (queue allowed).

**Arrival:** when `now >= appearAt`, try to claim one free shelf tile
(not used by a crop stack, pending harvest reservation, or another waiting
firefly). Free tile → status `waiting` with a stable `slotIndex` (lowest free
index under the shelf layout). No free tile → firefly is **lost** (removed;
no gift). Does not wait for space later. Oldest `appearAt` first.

**Shelf layout:** waiting fireflies sit at their `slotIndex`. Crop stacks pack
left-to-right into the remaining frames. Fireflies do not slide when other
visitors are welcomed.

**Slot reservation:** a waiting firefly **occupies** its shelf tile. That
slot is not empty and cannot receive harvests, alchemy claims, temple
returns, or other crop grants. Capacity counts +1 tile per waiting firefly.
Timeline for one slot — never free: firefly sitting → sparkles on click
(reservation held) → gifted crop in **that same** clicked slot.

**Welcome:** click the firefly tile → sparks → 1 researched plantable gift
(weighted by configurable `giftRarityWeights`; all rarities **1** for now =
uniform among unlocked plantables) → reservation becomes the crop atomically,
pinned to the clicked `slotIndex` via one-shot `deskGiftLand`. No game-text
message. No shrine progress; does not wake the Dragon. Prefer gifts that need
a new stack tile when possible so the shelf tile stays filled.

**State:** `deskVisitors: { id, kind: 'firefly', appearAt,
status: 'approaching' | 'waiting', slotIndex? }[]`. Approaching do not
reserve tiles / have no `slotIndex`. `deskGiftLand` is transient
(`null | { slotIndex, cropId }`) and is not persisted across reload.

## Plot visitors (tanuki nap)

Pure-flavor visitor on the farm grid — fully separate from plot butterflies and
desk fireflies. Config in `src/data/plotNapper.js`. Single pose:
`assets/icons/tanuki_sleep.png` (emoji fallback `🦝`). The tanuki is only ever
shown curled asleep — it has no walk or stretch pose.

**Trigger:** after a successful harvest (`harvestPlot`), roll hidden
`harvestChance` (default **0.15**). No-ops if a napper already exists or
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
- Discovery: `discoveredCropIds: string[]`,
  `discoveredAlchemyResultIds: string[]` — sticky until full Reset
- State: `researchLevel`,
  `shrines: { [id]: { tier, progress, dragonBonusOfferings } }`, `alchemy`,
  `dragonTemple`, `pendingHarvests`, `deskVisitors`, `deskGiftLand`,
  `plotNapper`,
  `discoveredCropIds`,
  `discoveredAlchemyResultIds`, `gameText`
- Shrine def: `{ id, name, icon, theme, corner, tiers[] }`
- Tier: `name`, `progressRequired`, `acceptedCropIds`, `tooltip` (effect
  text), plus blessing field (`growthSpeedBonus` | `researchBonus` |
  `plotsToUnlock` | `bonusHarvestChance`)
- Alchemy recipe: `{ inputs: [id, id], resultId }` (order-independent)
- Dragon Temple config: `slotCount`, `wrathMax`, `wrathPerHarvest`,
  `wrathPerShrineOffer`, `burnPulseMs`, `burnPulseCount`, `burnEmberCount`,
  `burnEmberMs`, `resultRevealMs`, `rewardBonusOfferings`,
  `rewardProgressMultiplier`, `rewardSparkCount`,
  `rewardSparkIcon`, `defaultTriggerChance`,
  `shrineTriggerChanceIncrease`

## Persistence
`localStorage` JSON after plant / harvest / water / critter welcome / flower plot /
offer (may also schedule desk fireflies) / desk firefly welcome /
alchemy / temple actions (and when crops spoil, fireflies arrive/are lost,
or a tanuki napper arrives/wakes/is lost on the 1s tick). Missing
planted-crop `watered` backfilled to `false`; missing / invalid
`waterRequestAt` backfilled to `null` (no retroactive water asks on legacy
plants). Missing `critterWelcomed` backfilled to `false`; missing / invalid
`critterVisitAt` backfilled to `null` (no retroactive visits on legacy plants).
Missing plot `flowered` backfilled to `false`. Missing `shrines` backfilled to tier 0;
missing / invalid shrine `dragonBonusOfferings` backfilled to `0`;
missing `alchemy` backfilled to empty board; missing `dragonTemple` backfilled
to resting (`lastResult` preserved when present); missing `pendingHarvests`
backfilled to `[]`; missing `discoveredCropIds` seeded from currently held
crops (inventory + alchemy / temple slots); missing
`discoveredAlchemyResultIds` backfilled to `[]` (no recipe backfill);
missing `deskVisitors` backfilled to `[]` (invalid entries dropped);
missing / invalid `plotNapper` backfilled to `null` (`waking` cleared on load);
missing or invalid `gameText`
backfilled to `null`.
Legacy inventory counts (`cropId → number`) migrate to one fresh batch each
(`expiresAt = now + decayMs`, or `null` when `decayDisabled`). Legacy bare
slot crop-id strings migrate the same way. On load: run decay catch-up first,
then apply any remaining
pending harvest grants (fly animation may be skipped), then reconcile desk
fireflies (place waiting or lose if shelf full), then reconcile plot napper
(place sleeping, advance to wake, or lose; `waking` cleared with no leave anim).
If an active temple
event was mid-burn on load, the burn snap-finishes as a win pending close. If a
pending win reveal was in progress, it finalizes immediately. Legacy timer
events without a valid `demand` close without penalty. If still active with
`wrath >= wrathMax`, it resolves as a loss and is saved.
No server. Player can wipe progress via Reset (confirm required). On Yes,
state is replaced with a fresh `createInitialState()` (including an empty
Discovery Log) and saved. Confirm overlay does not pause timers or
animations; No or click outside dismisses and play continues.

## Design principles
- Cozy over complicated; farm stays primary; smallest complete version first.
- Progression values stay data-driven.

## Future vision (not yet built)
- More alchemy recipes, research UI, deeper progression, portrait / mobile
  layout (e.g. ~1080×1920) and better mobile DnD.
- Vine plot care (second land-care look / perk; mechanic TBD).
- Additional plot critter types; player-chosen shrine destination for
  butterflies.

## Out of scope (current)
- Seeds, full recipe book (always-on catalog), research UI, mobile layout /
  DnD polish,
  shrine hover tooltips (replaced by detail window).
- Vine plot care (deferred).
- Critter growth time-save, Tiger-like +1 from critters, inventory butterflies,
  waking the Dragon from critter or firefly welcome.
  Alchemy products as plot-care spend.
- Tanuki early wake / shoo, nap rewards, or game text for nap arrival/leave.
