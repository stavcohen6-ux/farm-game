# Soft Storybook B — Art Style Bible

Canonical art direction for the Soft Storybook Cutouts B pass.

**Hero lock (only):** `mocks/storybook-cutouts/fox-shrine-b.png`  
Do **not** use Mock C (`fox-shrine-c.png`) or monkey-C geometry as style
targets. C is kept for comparison only.

Gameplay facing, dress codes, and shrine placement still follow
`docs/GAME_DESIGN.md`. This bible defines rendering language and layered
shrine production rules for Storybook B.

---

## Never-delete / archive policy

- **Never delete any existing artwork** — live, mood, mocks, parked desk
  (`assets/scene/player_desk.png` and related firefly / flowering art),
  backups, or prior archives. Keep everything forever.
- Before replacing live working art, **archive first**. The pre–Storybook B
  live snapshot is:
  `assets/mood/archive_live_pre_storybook_b/`
  (`icons/`, `scene/`, `opening/` mirrors of the live trees at archive time).
- Do **not** modify files inside an archive after the copy is made.
- New mocks and layered pairs are additive; leave older mocks in place.

---

## Style lock (from fox B hero)

Soft storybook cutouts — calm old-god presence, not goofy-cute mascots.

| Rule | Requirement |
|------|-------------|
| Shading | **2–3 value** only (base + 1–2 darker flats). Soft, readable planes — not busy gradients. |
| Rim | Thin **cream rim** on upper / lit silhouette edges so cutouts pop on the grove. |
| Silhouette | Large, mobile-readable shapes; clear torso/limbs + animal head. |
| Palette accents | **Fresh Moss** greens + **honey amber** rune / warm accents. |
| Transparency | True alpha cutouts — no baked checkerboard or solid backdrop. |
| Geometry | Soft organic curves. **Reject faceted / low-poly** planes (the monkey-C look). |

### Reject explicitly

- Faceted “low-poly” stone or fur planes (monkey-C / geometric C)
- Hyper-detailed painterly clutter (old live painterly lock — different pass)
- Goofy-cute mascot faces; shared cape dress across guardians
- Baked cream sticker outline as the whole-style identity (optional soft cream
  *rim light* is fine; a thick sticker stroke is not the B lock)

---

## Dress codes + facing (from GAME_DESIGN)

Guardians are slightly humanoid seated animals. Body of the animal stays
visible. Each shrine has a mossy stone pedestal and **one** warm amber rune.

**Facing (inward toward the farm):**

| Shrine | Board corner | Faces |
|--------|--------------|-------|
| Frog | top-left | right |
| Monkey | top-right | left |
| Fox | bottom-left | right |
| Tiger | bottom-right | left |

**Dress codes (unique per shrine — no shared cape rule):**

| Shrine | Dress |
|--------|-------|
| Frog | leaf vest |
| Monkey | scholar beads / sash |
| Fox | traveler scarf + satchel |
| Tiger | fortune collar + charm tags |

Fox B hero reference: teal traveler scarf, dark satchel, honey-amber pedestal
diamond — match that soft B language when redrawing other guardians.

---

## Layered shrine rules (idle breathe deferred)

Live farm-board shrines are **two PNGs** stacked in the game
(`shrine_{id}_pedestal.png` under `shrine_{id}_figure.png`, one hit target).
Soft B composites also live as `shrine_{id}.png` for single-image UI. Idle
breathe is **off for now**; keep layers separate so a later CSS-only breathe
can target the figure.

### Layers

1. **Pedestal** — mossy stone base + amber rune; static.
2. **Figure** — guardian only (paws / sit contact included with the figure);
   this is the layer that may breathe later if re-enabled.

### Shared canvas alignment

- Figure and pedestal share the **same canvas size** and the **same
  composition registration** (same origin, same sit position).
- When stacked 1:1, the composite matches the locked hero pose (flush sit).
- Do not crop each layer to tight bounds with different offsets — keep empty
  transparent padding so CSS/`img` stacking aligns without per-asset math.

### Flush sit

- Figure contact (paws / seat) sits **flush** on the pedestal’s mossy top —
  no floating gap, no sunk overlap that clips the stone top.
- Pedestal moss top stays readable under the figure when layered.

### Idle breathe (optional, deferred)

- Not shown in Wave 0 mocks (motion removed).
- If re-enabled later: animate **figure only** (subtle scale from sit origin;
  no `translateY` — lift reads as floating). Pedestal stays still.
- Respect `prefers-reduced-motion: reduce` — no breathing motion when set.
- Keep blessing / buff `filter` on the icon child; breathe `transform` on a
  parent wrapper so rim and motion do not fight on one node.

### Canonical Wave 0 fox pair

| File | Role |
|------|------|
| `mocks/storybook-cutouts/layered/fox-figure.png` | Fox figure only |
| `mocks/storybook-cutouts/layered/fox-pedestal.png` | Matching pedestal |
| `mocks/storybook-cutouts/layered/fox-composite-preview.png` | Static stacked preview (optional) |

Hero lock remains `mocks/storybook-cutouts/fox-shrine-b.png` for style.
Layered files are the production-shaped redo of that shrine.

### Wave 1 layered shrines — LOCKED mocks

Approved Soft B sibling pairs (figure + pedestal + composite preview) for
frog / monkey / fox / tiger live under
`mocks/storybook-cutouts/layered/shrine_{id}_*`.

**Do not change these mockups unless explicitly asked.** See
`mocks/storybook-cutouts/layered/README.md`. **Live promoted** — figure +
pedestal copied into `assets/icons/`; farm-board DOM stacks them.

### Wave 2 board / FX / Field Notes faces — LOCKED mocks

Approved Soft B mocks live under `mocks/storybook-cutouts/wave2/`:

- Board: `farm_frame`, `plot_soil`, `plot_soil_dry`, `plot_locked`,
  `plot_soil_vined` (+ parked `plot_soil_flowered`)
- FX/UI: `water_drop`, `butterfly`, `spark`, `fire`, `harvest`, `discovery_log`
- Field Notes faces: `log_frog`, `log_monkey`, `log_fox`, `log_tiger`
  (face-only simple icons for small UI)

Rejected / prior passes kept forever:
`wave2_pass1/`, `wave2_pass2_pre_face_fire/`.

**Do not change these mockups unless explicitly asked.** See
`mocks/storybook-cutouts/wave2/README.md`. **Live promoted** into `assets/icons/`.

### Wave 3 plantable crops — LOCKED mocks

Approved Soft B single-layer cutouts under `mocks/storybook-cutouts/crops/`:

- `wheat`, `turnip`, `blueberry`, `moonflower`, `golden_pumpkin`, `sunfruit`

Style refs: `fox-shrine-b.png` + `layered/` only — do not use live
`assets/icons` as style references. True transparency; readable at ~64px.
Alchemy mixes not in this wave. Prior pass kept: `crops_pass1/`.
Earlier Style 1 wheat mock (`mocks/storybook-cutouts/wheat.png`) kept.

**Do not change these mockups unless explicitly asked.** See
`mocks/storybook-cutouts/crops/README.md`. **Live promoted** into `assets/icons/`.

### Crafted crops — LOCKED mocks

Approved Soft B single-layer cutouts under `mocks/storybook-cutouts/crafts/`:

- Loaves: `root_loaf`, `forest_bread`, `moonlit_loaf`, `golden_loaf`,
  `sunbread`
- Roots: `wildroot`, `moonroot`, `golden_root`, `sunroot`
- Berries / jam / blooms / gourd: `moonberry`, `enchanted_jam`, `sunberry`,
  `golden_bloom`, `solar_bloom`, `solar_gourd`

Composition from live `assets/icons` craft subjects (with approved notes:
`moonroot` = closed onion; `sunroot` = simplified artichoke;
`moonlit_loaf` = normal croissant colors); style from locked Wave 3
`crops/` Soft B (+ fox-shrine-b / layered). Prior passes kept under
`crafts_pass1/`, `crafts_pass2_*`.

**Do not change these mockups unless explicitly asked.** See
`mocks/storybook-cutouts/crafts/README.md`. **Live promoted** into `assets/icons/`.

### Wave 4 — Temple / tanuki / opening / scene — LOCKED mocks

Approved Soft B setpiece mocks under `mocks/storybook-cutouts/wave4/`:

- Temple: `dragon_temple_rest`, `dragon_temple_awake`, `log_dragon_rest`,
  `log_dragon_awake` (sleep base → open-eye sibling; Soft B flats, not
  hyper-detailed scales; log faces match wave2 Soft B log-icon language)
- Tanuki: `tanuki_sleep` (in-game); walk/stretch parked under
  `wave4_aside_unused_tanuki/`
- Opening: `opening_title`, `opening_play`, `opening_journey` (journey =
  Soft B path background only — no animals)
- Scene: `game_text_plank` (light Soft B chrome, no moss;
  `grove_clearing` skipped — live already cohesive)

Style refs: fox-shrine-b + layered shrines only. Live paths = composition
refs only. Parked `player_desk` untouched. Prior passes kept under
`wave4_pass*` / aside folders.

**Do not change these mockups unless explicitly asked.** See
`mocks/storybook-cutouts/wave4/README.md`. **Live promoted** into
`assets/icons/`, `assets/opening/`, and `assets/scene/game_text_plank.png`
(`grove_clearing` and parked desk left as-is).

Crafted Soft B crops remain locked under `crafts/` (prior Soft B pass).

---

## Wave scope note

**Wave 0:** archive live art, write this bible, layered fox pair + static mock
HTML (idle breathe deferred).

**Wave 1–4 + crafts:** Soft B mocks locked, then **promoted to live** working
paths (`assets/icons|opening|scene` as mapped). Farm-board shrines use layered
DOM. Pre–Soft B revert snapshot remains
`assets/mood/archive_live_pre_storybook_b/` (do not modify).

**Wave 5 (pending approval):** Soft B mocks under
`mocks/storybook-cutouts/wave5/` — `mortar`, crop-picker `lock` PNG,
`grove_clearing`. Mocks only until approved; live paths unchanged. Remaining
pre–Soft B leftovers after Wave 5: `firefly`, other SVGs, parked desk /
tanuki walk-stretch.
