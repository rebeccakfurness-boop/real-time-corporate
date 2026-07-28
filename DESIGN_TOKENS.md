# Realtime design tokens (Corporate arm)

Source of truth for brand colour, type, and icon rules. Tokens live in
`tailwind.config.ts` (scales, type scale) and `src/app/globals.css` (CSS custom
properties, light/dark). Fonts load via `next/font/google` in `src/app/layout.tsx`.

## Colour

Three scales, each a full 50–900 run so hover/border/disabled states are consistent:

- **`primary`** (Primary Deep) — brand primary. Base = `primary-500` (`#4C5BD4`).
- **`neutral`** — backgrounds, borders, text.
- **`teal`** — reserved accent. **Cap at one accent moment per screen, maximum. Never a
  primary CTA colour.** If you're reaching for teal on a chart series or a status colour,
  use `primary` or `neutral` instead — that's almost always the right call in Corporate.

Only 50/100/200/500/900 (neutral) and 100/500/700 (teal) were specified in the brief;
the remaining steps are linearly interpolated in RGB space between those anchors (see
`git log` for the generating script if you need to re-derive them from different anchors).

### Two deliberate deviations from a literal reading of the brief

1. **`--muted-foreground` is `neutral-600` (`#566070`), not the literal `neutral-500`
   "Muted" swatch (`#6F7A8A`).** `neutral-500` on the background is 4.06:1 — below AA
   (4.5:1) for normal text, and the brief itself scopes that swatch to "large text/UI
   only." `--muted-foreground` is used at caption size throughout the app (table cells,
   labels, timestamps), so it needs to hold at every size. `neutral-500` is still
   available directly as `text-neutral-500` for the large-text/UI contexts the brief
   describes (icon glyphs, larger badge labels, chart axis ticks).
2. **The generic UI `--accent` token (hover/selected state on menu items, select
   options) stays a light primary tint (`primary-100`/`primary-700`), not teal.** Wiring
   the reserved accent colour into every dropdown hover state would blow past "one
   accent moment per screen" on any page with more than one interactive menu. Teal is
   only ever applied deliberately, component-by-component, via the `teal-*` Tailwind
   classes directly.

Flag it if you'd rather either of these followed the literal swatch instead — both are
easy to change in `globals.css` (`--muted-foreground`) or in a specific component's
classes (`--accent` is a single line in the same file).

### Approved contrast pairings

Enforced by `pnpm check:contrast` (`scripts/check-color-contrast.mjs`) — run it after
touching any hex value in this file. It checks the *approved pairing list* below, not
arbitrary className combinations in JSX; see "Scope of this check" underneath.

| Foreground | Background | Ratio | Constraint |
| --- | --- | --- | --- |
| `#141C2E` | `#F6F7FB` | 15.9:1 | All text sizes (AAA) |
| `#6F7A8A` | `#F6F7FB` | 4.1:1 | Large text / UI only, not small copy |
| `#4C5BD4` | `#F6F7FB` | 5.2:1 | All text sizes |
| `#FFFFFF` | `#4C5BD4` | 5.6:1 | All text sizes |
| `#FFFFFF` | `#7A8BFF` | 3.0:1 | Large text only (Schools-arm base; Corporate hover states only, large text) |
| `#141C2E` | `#22D3C5` | 9.1:1 | All text sizes |

#### Scope of this check

This script validates the six named pairings above meet their declared ratio — it's a
regression guard on the *token values themselves*, so an edit to a hex later can't
silently break an approved pairing. It does **not** scan JSX for arbitrary
`text-x` + `bg-y` combinations a component might use — that would need a custom
AST-based ESLint rule inspecting `className` strings, which wasn't built this pass.
Component authors: check new foreground/background combinations against this table by
hand (or via the same `contrastRatio()` helper) until/unless that stricter rule exists.

### Dark mode (extrapolated, not specified in the brief)

The brief is Corporate-light-mode-focused. Dark mode leans into the *dark end of the
Primary Deep scale itself* (background = `primary-900`, card = `primary-800`) rather
than a generic gray dark theme, since the brief names those two steps "Dark UI accents"
/ "Dark backgrounds" in the Primary Deep table — treated as an instruction, not a
coincidence. Flag if a different dark-mode treatment was intended.

## Typography

- **Display — `font-display` (Fraunces)**: H1–H4, hero/editorial moments (report titles,
  board summary headlines, marketing headlines).
- **Body — `font-sans` (Inter)**: all UI text, buttons, labels, tables, forms, nav.

> The brief specifies "Fruances" — no published font matches that spelling. **Fraunces**
> (Google Fonts, Untitled Type Foundry) is used instead: same name family, a soft
> editorial display serif consistent with the described role, freely licensed. Confirm
> this is the intended typeface, or point to the actual Fruances font files if it's a
> specific commercial license — swapping the `next/font/google` import for
> `next/font/local` is a small change once files are available.

### Type scale (`tailwind.config.ts` → `fontSize`)

| Token | Size | Use |
| --- | --- | --- |
| `text-h1` | 56px | Page-level hero headings |
| `text-h2` | 40px | Section headings |
| `text-h3` | 28px | Card/subsection headings |
| `text-h4` | 20px | Minor headings, emphasis |
| `text-body` | 16px | Default body copy (also Tailwind's default `text-base`) |
| `text-caption` | 13px | Labels, timestamps, fine print |

Plain `<h1>`–`<h4>` tags pick up the display font and matching size by default (see the
base layer in `globals.css`) — use the utility classes only when you need a heading-style
look on a non-heading element, or a different size than the semantic default.

## Icons

Existing icon set (`lucide-react`) already matches the brand spec by default: 24px grid,
2px stroke, rounded caps/joins, outline style. No library change needed — see the icon
audit notes for the couple of places that were overriding these defaults.

- Outline by default; filled/solid only for active/selected state.
- One colour per icon — no gradients on functional UI icons.
- Teal on an icon: same restraint rule as colour generally — one featured icon per set,
  maximum.

## Logo

Not part of this token pass — see the follow-up pass for the mark component, favicon,
and app-icon assets.
