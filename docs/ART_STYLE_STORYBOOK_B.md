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

Live shrine icons will eventually be **two PNGs** stacked in the game (Wave 0
mocks the pair only — no game DOM yet). Idle breathe is **off for now**; keep
layers separate so a later CSS-only breathe can target the figure.

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

---

## Wave scope note

**Wave 0 (this pass):** archive live art, write this bible, layered fox pair +
static mock HTML (idle breathe deferred). Live `assets/icons|scene|opening`
working trees are **not** replaced yet. No game DOM changes.
