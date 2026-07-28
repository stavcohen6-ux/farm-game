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
- Desk layout: inventory as a top shelf (6 slots); alchemy Mix row centered
  on the work surface; Discovery Log painted into `player_desk.png` on the
  far-right tabletop with a transparent clickable hotspot (`#discovery-log`,
  `aria-label` only — no dock icon, no neon/hover glow; quiet idle visual
  hint over the painted book). Hotspot box is **locked** at
  `right: 4.85rem; bottom: 0; width: 7rem; height: 4.75rem` on
  `.discovery-log-btn` — do not nudge without an explicit ask. No
  main-screen titles for “Alchemy Station” or “Discovery Log” (log title
  remains in the opened modal). Mix wakes to full moss when a valid pair is
  ready; quiet otherwise. The desk painting carries the workstation feel.
- Modals: cream linen inside sage / frame borders (Discovery Log, shrine
  detail, reset confirm)
- Shrines: simplified painterly guardian icons on small altars, hugging farm
  corners; main view shows figure + progress bar only (name / tier in the
  click detail modal); no hover lift/scale on shrines
- Dragon Temple: simplified Lofi Ghibli painterly shrine above the farm
  (`dragon_temple_rest.png` / `dragon_temple_awake.png`; locked copies in
  `assets/mood/locked_shrines/`). Same shrine body both states; only the
  dragon sleeps vs wakes. Front wall niches hold DOM crop slots. Layout
  always reserves meter height above and Burn height below so resting vs
  active does not reflow the farm. Resting: sleeping dragon, faded niches
  (no Drop), meters/Burn space hidden. Active: awake dragon, Drop on slots,
  time bar depletes and progress bar fills above the art (no numbers), Burn
  below (no ember card chrome)
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
`assets/mood/archive_fresh_moss/`. Approved locked icons:
`assets/mood/locked_shrines/` (animal shrines + Dragon Temple). Mood refs
(not in-game UI): `assets/mood/farm_board_lofi_ghibli_mood.png`,
`assets/mood/grove_clearing_lofi_ghibli_mood.png`.

### Motion
Keep existing fly / pulse / urgency feedback. Prefer soft tactile hover
(slight lift or scale) over new flashy effects (except shrines: no hover
lift). Farm stays primary; chrome stays quiet.

## Core loop
Choose a crop → Plant it → Wait (optional water if the plant asks;
optional critter welcome if a butterfly settles) → Harvest → Collect →
(optional) Flower an empty plot with a plantable (guarantees next butterfly) →
(optional) Mix crops via alchemy → Offer crops to shrines (optional) →
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
They share inventory, shrine offerings, and Dragon Temple sacrifices, but
never appear in the crop picker. Watering and critter fields apply to
plantables only.

`decaySeconds` is how long a crop lasts after its decay clock starts (all
crops currently 60). Convert with `getDecayMs` when comparing to
`expiresAt`. When `decayDisabled` is true, `getDecayMs` returns null, no
`expiresAt` timer is started, and the crop never spoils (including existing
saves that still carry old timers). All crops currently have
`decayDisabled: true`.

`shrineValues` is offering progress per crop per shrine (`frog`, `monkey`,
`fox`, `tiger`). Values are affinity-based (strong preferred shrine, soft
floor elsewhere). Full per-crop readouts live in the Discovery Log (via
`formatShrineValues` / log face icons `log_{frog|monkey|fox|tiger}.png`).
Shrine detail shows a short Prefers line for strong plantables (see Shrines).

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
**safe shrine blessing** (progress only) to the neediest non-maxed guardian.
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

**Neediest shrine:** among non-maxed shrines, lowest effective devotion
`sum(progressRequired for completed tiers) + current progress`, computed
from live `{ tier, progress }` (Dragon burns lower this automatically — do
not store a permanent points-ever-offered counter). Ties: lowest current-bar
fill fraction, then Frog → Monkey → Fox → Tiger.

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
  bar updates when it lands (no shrine pulse).
  Game text: `A butterfly carries a blessing to the {Frog|Monkey|Fox|Tiger}.`
  If a tier-up occurs from the gift, the normal shrine upgrade text wins. If
  all shrines are already maxed, welcome clears the visit and shows
  `The guardians rest — the grove is already content.` (no progress).
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
  stack slots (inventory + in-flight harvests). The crop stays where it was
  (ready plot, alchemy result, or input slot); the inventory panel briefly
  shakes. No game-text message.
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
- Untitled work surface centered on the desk (no separate station icon).
  Two input slots + Mix button (input mode). Mix is the primary action
  between the slots; quiet when invalid, full moss when a valid pair is ready.
- Drag inventory crops into an empty slot, or anywhere on the alchemy
  board (fills the first open slot left to right). If both slots are
  full or a result is waiting to claim, the drop is ignored.
- Input slots store `{ cropId, expiresAt }` (decay continues while held).
  Filled slots show the same urgency tints as inventory.
- Click a filled slot to return that crop to inventory (keeps `expiresAt`).
- Mix is faded/disabled until the pair matches a recipe. No invalid-mix popup.
- Mix / Burn / spend actions sweep expired crops first so an exact-second
  expiry cannot be consumed.
- On Mix: inputs are consumed; slots and Mix hide; result appears in the center
  with icon and name.
- Click the result to add it to inventory; board resets to empty slots.
  Alchemy result decay starts only when claimed into inventory (unclaimed
  result is untinted).

### Recipes (current)
| Inputs | Result | Icon |
|--------|--------|------|
| wheat + turnip | Harvest Tonic | 🥃 |
| wheat + blueberry | Forest Bread | 🍞 |
| wheat + moonflower | Moonlit Grain | 🥞 |
| wheat + golden pumpkin | Golden Champignon | 🍄‍🟫 |
| wheat + sunfruit | Sunblessed Shroom | 🍄 |
| turnip + blueberry | Wildroot Mix | 🫚 |
| turnip + moonflower | Moonroot Essence | 🫘 |
| turnip + golden pumpkin | Harvest Root | 🌿 |
| turnip + sunfruit | Sunroot Essence | 🍀 |
| blueberry + moonflower | Mystic Berry | 🍇 |
| blueberry + golden pumpkin | Enchanted Jam | 🍯 |
| blueberry + sunfruit | Radiant Berry | 🍓 |
| moonflower + golden pumpkin | Celestial Seed | 🥜 |
| moonflower + sunfruit | Solar Bloom | 🌻 |
| golden pumpkin + sunfruit | Divine Harvest | 🪻 |

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
| Fox | Wildroot Mix | turnip + blueberry |
| Monkey | Mystic Berry | blueberry + moonflower |
| Frog | Sunblessed Shroom | wheat + sunfruit |
| Tiger | Divine Harvest | golden pumpkin + sunfruit |

| Result | Frog | Monkey | Fox | Tiger | Notes |
|--------|------|--------|-----|-------|-------|
| harvest_tonic | 6 | 4 | 6 | 4 | normal |
| forest_bread | 6 | 5 | 7 | 3 | normal |
| moonlit_grain | 7 | 9 | 3 | 4 | normal |
| golden_champignon | 7 | 5 | 4 | 9 | normal |
| sunblessed_shroom | 13 | 4 | 3 | 8 | Frog apex |
| wildroot_mix | 2 | 3 | 12 | 3 | Fox apex |
| moonroot_essence | 4 | 8 | 6 | 5 | normal |
| harvest_root | 4 | 4 | 7 | 10 | normal |
| sunroot_essence | 8 | 4 | 7 | 10 | normal |
| mystic_berry | 3 | 11 | 6 | 3 | Monkey apex |
| enchanted_jam | 4 | 5 | 8 | 9 | normal |
| radiant_berry | 8 | 5 | 8 | 9 | normal |
| celestial_seed | 5 | 9 | 4 | 10 | normal |
| solar_bloom | 9 | 9 | 4 | 10 | normal |
| divine_harvest | 8 | 4 | 4 | 17 | Tiger apex |

### Alchemy products
- `harvest_tonic`, `forest_bread`, `moonlit_grain`, `golden_champignon`,
  `sunblessed_shroom`, `wildroot_mix`, `moonroot_essence`, `harvest_root`,
  `sunroot_essence`, `mystic_berry`, `enchanted_jam`, `radiant_berry`,
  `celestial_seed`, `solar_bloom`, `divine_harvest`
- `plantable: false`, `decaySeconds` currently 60, `decayDisabled: true`,
  `shrineValues` as above
- Offer to shrines or sacrifice at the Dragon Temple like any inventory crop

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
- Drag one inventory crop onto a shrine (any crop → any shrine).
- Adds that crop’s `shrineValues[shrineId]` to progress; `progressRequired`
  per tier is data-driven (escalating; see Tiers). Overflow carries to
  the next tier.
- Starts at tier 0 (no blessing). Completing a bar unlocks the next tier and
  applies that blessing immediately. Same-shrine tiers replace earlier ones;
  different shrines stack.
- Maxed shrines reject offerings.

### Detail window
Click shrine → centered modal (click outside to close). Below the title, a
Prefers line lists icons of strong plantable crops for that shrine (value
greater than 3, up to 2, sorted by affinity). Then lists every tier: name,
effect text, progress bar. Active = live `n / required`; completed = full
"Complete"; future = faded "Locked". Maxed = all Complete.

### Tiers
Progress required escalates within each shrine (medium pacing; total 491).

**Frog — Growth** (15 / 25 / 40 / 55 = 135; apex: Sunblessed Shroom)
1. Sleeping Frog — 25% faster growth
2. Rainkeeper Frog — 50% faster
3. Ancient River Frog — 75% faster
4. Spirit Frog — 100% faster

**Monkey — Research** (`researchLevel = 1 + bonus`; 12 / 24 / 40 = 76;
apex: Mystic Berry)
1. Curious Monkey — +1 → level 2
2. Clever Monkey — +2 → level 3
3. Wise Monkey — +3 → level 4

**Fox — Expansion** (`plotsToUnlock` per tier, currently 4; unlocks highest
locked plot ids first; 15 / 25 / 35 / 50 = 125; apex: Wildroot Mix)
1. Forest Fox — Unlock more land
2. Valley Fox — Grow your farmland
3. Mountain Fox — Even more land unlocked
4. Guardian Fox — Final land expansion

**Tiger — Fortune** (+1 crop chance on harvest; 20 / 30 / 45 / 60 = 155;
apex: Divine Harvest)
1. Young Tiger — 25%
2. Hunting Tiger — 50%
3. Golden Tiger — 75%
4. Spirit Tiger — 100%

Bonus crop flies from the harvested plot to inventory 0.5s after the base
harvest flyer, with corner sparks; count updates on land.

## Dragon Temple
Timed sacrifice event above the farm plot grid (not including shrines).
Not part of shrine progression — a separate challenge on the main screen.

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
| `slotCount` | Sacrifice slots per burn | 5 |
| `pointsPerBurn` | Progress gained on each Burn | 5 |
| `progressRequired` | Progress needed to win | 15 |
| `durationMs` | Event countdown length | 90 seconds |
| `burnPulseMs` | Length of one fire pulse | 1.2s (half ready-crop pulse) |
| `burnPulseCount` | Fire pulses before crops clear | 3 |
| `resultRevealMs` | Pause after points hit the bar before win/lose close | 500ms |
| `rewardProgress` | Shrine progress from a win prize | 10 |
| `rewardSparkCount` | Sparks that fly temple → shrine | 4 |
| `rewardSparkIcon` | Spark emoji | ✨ |
| `rewardPulseCount` | Animal-icon pulses before points | 2 |
| `defaultTriggerChance` | Starting / post-event offering wake chance | 10% (0.1) |
| `shrineTriggerChanceIncrease` | Per-shrine chance added after a missed roll | 5% (0.05) each |

Three successful Burns fill the bar at current values (`3 × 5 = 15`).
Crop identity does not affect temple progress (commons are intended fodder;
apex gifts belong on shrines). Total burn animation ≈
`burnPulseMs × burnPulseCount` (currently 3.6s per Burn).

### Layout
- Lives inside `#grove-stage` below the game text panel and above
  `#farm-board` with the same order of spacing as shrines ↔ farm
  (`#app` / grove column gap ≈ 1rem).
- Object width matches the plot grid only (shrines not counted). Transparent
  stage (no ember card chrome); soft drop-shadow on the figure like corner
  shrines.
- Stack: meters (time + progress) above the art → shrine figure with crop
  slots overlaid on the front-wall niches → Burn button below.
- Meter height and Burn height are always reserved so resting vs active does
  not reflow the farm or shrines.
- Resting: sleeping dragon; five faded empty niches (no “Drop”, not
  interactive); meters and Burn reserved but hidden.
- Active: awake dragon; niches interactive with “Drop”; meters visible; Burn
  visible below. No whole-object hover lift.

### Resting vs active
- Resting: sleeping figure; faded wall slots only. Click / double-click does
  nothing (event is not player-started).
- Active: awake figure; time bar (depletes over `durationMs`, no numbers) and
  progress bar (fills on burns, no numbers) above the art; crop slots; Burn
  button below.
- After a win: game text panel shows
  `Congratulations - the Dragon has given you its blessing`.
- After a loss: game text panel shows
  `You didn't make enough sacrifices - the Dragon burnt one of your shrines.`
  and, when a shrine was burnt, a second line:
  `Your {animal} shrine has been burnt` (no trailing period; animal from the
  shrine name without trailing ` Shrine`, e.g. Frog / Fox / Monkey / Tiger).
  If no shrine has progress, only the first line is shown.
- `lastResult` is still stored (`null` | `'success'` | `'failed'`) but no
  longer drives tile copy.

### Trigger (shrine offerings)
The dragon grows angry when players give offerings to the shrines. Chance is
hidden (`triggerChance`, never shown in UI) and persists across refresh/reload.

- After a **player** crop drop onto a shrine only (`offerCrop`):
  - If the temple is already `active` → no roll and no chance increase.
  - Else roll `Math.random() < triggerChance`.
  - Hit → start the event immediately, reset `triggerChance` to
    `defaultTriggerChance`, and set the game text panel to:
    `The Dragon awakens in anger` / `Make sacrifices to gain its favor or suffer its wrath!`
    (overwrites a same-offering shrine upgrade message if both occur).
  - Miss → add that shrine’s `shrineTriggerChanceIncrease` value, capped at 100%.
- Temple win shrine reward progress does **not** roll or increase the chance.
- Chance caps at 100% (`1.0`).

### Event flow
- Triggered by the offering anger roll above (not by interacting with the temple).
- Timer starts when the event opens; a time bar above the art depletes over
  `durationMs` (no numeric countdown).
- Progress bar above the art fills on each completed Burn (no numbers); win
  when `progress >= progressRequired`.
- Any inventory crop is valid (plantable and alchemy products).
- Drop onto an empty niche slot, or anywhere on the active temple tile (fills
  the first open slot left to right). If all slots are full, the drop is
  ignored. One crop leaves inventory on place; slots store
  `{ cropId, expiresAt }` and keep decaying (same urgency tints as
  inventory). While `burning`, slotted crops are not removed by decay (they
  are about to be consumed).
- Click a filled slot to return that crop to inventory (same as alchemy;
  keeps `expiresAt`).
- Burn is faded/disabled until all slots are filled; disabled hover keeps
  the default cursor (not `not-allowed`). Burn sweeps expired slots first.
- On Burn: slots stay filled and locked with a 🔥 fire pulse on each crop
  (`burnPulseCount` pulses at `burnPulseMs` each). Progress bar is **unchanged**
  until the fire ends. While burning, crops cannot be removed or replaced;
  Burn stays disabled/faded; temple drops are ignored.
- After the fire animation ends: slotted crops are consumed (cleared, not
  returned) and `pointsPerBurn` is always added to the bar (visible
  immediately). Then:
  - If progress reaches `progressRequired` → win (including when the timer
    already expired mid-burn)
  - Else if the timer already expired → lose
  - Else → empty slots for another round
- Before win/lose close, keep the active temple UI for `resultRevealMs`
  (500ms) so the updated bar is visible, then close. Mid-burn timeout that
  still loses still shows the granted points first.
- Closing (win or lose) returns any leftover non-burning slotted crops to
  inventory.
- After a win (temple already back to resting): shrine `rewardProgress` is
  applied immediately and flagged via `pendingReward` until claimed. Then ~4
  spark emojis (✨) fly from the temple to the chosen shrine (visual only).
  Prefer a non-maxed shrine; if every shrine is maxed, fly to any random shrine
  and stop (no pulse; no progress was added).
- When the target is not maxed: sparks disappear on arrival, the shrine’s
  animal emoji pulses twice at `burnPulseMs` (progress was already granted).
  The player can keep farming during fly/pulse.
- On lose: pick one random shrine that has progress (`tier > 0` or
  `progress > 0`). Drop it by one tier and clear its current progress bar
  (`progress = 0`). If already at tier 0 with bar progress only, stay at
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
  snap-finishes the event and claims `pendingReward` so shrine progress is
  not lost (spark animation may be skipped). Lose penalties apply on the
  same lose close paths used after timeout / reveal (including load).

### State
`dragonTemple: { active, endsAt, progress, slots, lastResult, burning,
pendingClose, pendingReward, triggerChance }`
- `active` — event open or resting
- `endsAt` — `Date.now()` deadline while active; `null` when resting
- `progress` — points toward `progressRequired` this event
- `slots` — array of `{ cropId, expiresAt }` or `null` (length `slotCount`)
- `lastResult` — `null` | `'success'` | `'failed'` (preserved across close
  and across starting a new event; not shown on the resting tile)
- `burning` — fire animation in progress after Burn
- `pendingClose` — `null` | `'success'` | `'failed'` after points are applied,
  while waiting `resultRevealMs` before close (also used as a mid-burn timer
  fail flag until the fire ends)
- `pendingReward` — win shrine reward not yet applied; preserved across close
  and claimed on load if still set
- `triggerChance` — hidden 0–1 chance the next shrine offering wakes the
  dragon; reset to `defaultTriggerChance` when an event starts; preserved
  across close and reload

### Tick / persistence
- Main loop ticks every 1s: updates the time-bar fill while active; while
  burning, only refreshes that fill (does not restart the fire animation).
- On timeout while not burning and no pending reveal → lose close. On timeout
  while burning → mark timer-expired (`pendingClose: 'failed'`) and wait for
  the fire to end; final win vs lose is decided after points are applied.
- Mid-event state (slots, progress, `endsAt`, burning, pendingReward) is saved.
  `triggerChance` is always saved (resting and active).
- On load, if `burning` → snap-finish the burn (apply points, set pending
  close). If `pendingClose` is set → finalize close (win sets `pendingReward`).
  If `pendingReward` → claim shrine reward immediately. If `active` and
  `endsAt` already passed (and not mid-burn/reveal) → resolve as a loss
  and save.

## Screens
Main farm in a scenic grove stage + game text panel + Dragon Temple +
player desk (inventory shelf, alchemy work surface, Discovery Log book).
Overlays: radial crop picker (anchored to the clicked plot), shrine detail,
Discovery Log modal, reset confirm. No separate menus. Reset control sits
below the player desk in the bottom dock.

### Layout (current)
- Target: desktop web. Portrait / mobile fit is deferred.
- Three bands: game text panel at the top (full farm-board width); scenic
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

- Location: above the scenic grove stage (Dragon Temple + farm), width
  matches the farm board (grid + shrines). Chrome is always visible.
- Fixed height for three readable lines; never grows or shrinks. Longer text
  scrolls inside the panel (`overflow-y: auto`). Text is centered in the tile.
- Default when `gameText` is `null` (startup, reset, or after clear):
  `It's a cozy day in the forest.` / `A perfect day for farming.`
  (UI fallback in `gameTextPanel.js`; state stays `null`). New text replaces
  current text. Code can clear it (`clearGameText`) to restore the default.
  No player dismiss control yet.
- Plain text only (no HTML).
- Persists with save/load.

Triggers:
- Shrine tier-up (any path through `addShrineProgress`, including offerings,
  Dragon Temple win rewards, and critter welcome gifts):
  `Congratulations - your {shrine name} has been upgraded` plus a second
  line with that tier’s `tooltip`. If one grant jumps multiple tiers, only
  the highest tier reached is shown.
- Critter welcome (no tier-up): `A butterfly carries a blessing to the
  {Frog|Monkey|Fox|Tiger}.`
- Critter welcome when all shrines maxed:
  `The guardians rest — the grove is already content.`

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

## Entities
- Plot: `{ id, locked, crop, flowered }` — `flowered` is boolean (default false)
- Planted crop: `{ cropId, plantedAt, growthMs, watered, waterRequestAt,
  critterWelcomed, critterVisitAt }` — `waterRequestAt` / `critterVisitAt` are
  absolute timestamps or `null` if this plant never asks / never hosts a visit
- Crop def: see Crops
- Inventory: `{ [cropId]: [{ amount, expiresAt }, …] }` (FIFO batches)
- Pending harvest: `{ id, cropId, amount, expiresAt }` (in-flight grant until
  fly lands; decay clock already running)
- Alchemy: `{ slotA, slotB, resultId }` — input slots are
  `{ cropId, expiresAt }` or null; `resultId` is a bare crop id or null
- Dragon Temple: `{ active, endsAt, progress, slots, lastResult, burning,
  pendingClose, pendingReward }` — `slots` are `{ cropId, expiresAt }` or null
- Game text: `gameText` (`null` | string) — top panel message
- Discovery: `discoveredCropIds: string[]`,
  `discoveredAlchemyResultIds: string[]` — sticky until full Reset
- State: `researchLevel`, `shrines: { [id]: { tier, progress } }`, `alchemy`,
  `dragonTemple`, `pendingHarvests`, `discoveredCropIds`,
  `discoveredAlchemyResultIds`, `gameText`
- Shrine def: `{ id, name, icon, theme, corner, tiers[] }`
- Tier: `name`, `progressRequired`, `tooltip` (effect text), plus blessing
  field (`growthSpeedBonus` | `researchBonus` | `plotsToUnlock` |
  `bonusHarvestChance`)
- Alchemy recipe: `{ inputs: [id, id], resultId }` (order-independent)
- Dragon Temple config: `slotCount`, `pointsPerBurn`, `progressRequired`,
  `durationMs`, `burnPulseMs`, `burnPulseCount`, `resultRevealMs`,
  `rewardProgress`, `rewardSparkCount`, `rewardSparkIcon`, `rewardPulseCount`

## Persistence
`localStorage` JSON after plant / harvest / water / critter welcome / flower plot /
offer /
alchemy / temple actions (and when crops spoil on the 1s tick). Missing
planted-crop `watered` backfilled to `false`; missing / invalid
`waterRequestAt` backfilled to `null` (no retroactive water asks on legacy
plants). Missing `critterWelcomed` backfilled to `false`; missing / invalid
`critterVisitAt` backfilled to `null` (no retroactive visits on legacy plants).
Missing plot `flowered` backfilled to `false`. Missing `shrines` backfilled to tier 0;
missing `alchemy` backfilled to empty board; missing `dragonTemple` backfilled
to resting (`lastResult` preserved when present); missing `pendingHarvests`
backfilled to `[]`; missing `discoveredCropIds` seeded from currently held
crops (inventory + alchemy / temple slots); missing
`discoveredAlchemyResultIds` backfilled to `[]` (no recipe backfill);
missing or invalid `gameText`
backfilled to `null`.
Legacy inventory counts (`cropId → number`) migrate to one fresh batch each
(`expiresAt = now + decayMs`, or `null` when `decayDisabled`). Legacy bare
slot crop-id strings migrate the same way. On load: run decay catch-up first,
then apply any remaining
pending harvest grants (fly animation may be skipped). If an active temple
event was mid-burn on load, the burn snap-finishes (points applied). If a
pending win/lose reveal was in progress, it finalizes immediately. If already
expired otherwise, it resolves as a loss and is saved.
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
- Additional critter types (e.g. fireflies); player-chosen shrine destination.

## Out of scope (current)
- Seeds, full recipe book (always-on catalog), research UI, mobile layout /
  DnD polish,
  shrine hover tooltips (replaced by detail window).
- Vine plot care (deferred).
- Critter growth time-save, Tiger-like +1 from critters, inventory butterflies,
  waking the Dragon from critter welcome.
  Alchemy products as plot-care spend.
