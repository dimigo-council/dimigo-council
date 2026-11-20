# Figma Design Rules (Dimigo Council)

Rules for keeping every screen in the Dimigo Council file consistent with DIMI UI KIT.
If a rule and the kit disagree, the kit wins. Fix the rule, or add what's missing to the kit. Don't override locally.

---

## 1. Tokens only

- Every spacing, radius, color and text value is bound to a kit variable or style. **No typed numbers** inside a screen.
- If no token fits, don't pick a value "close enough". Add a token to the kit, or change the design to use one that exists.
- Exception: canvas positions (x/y of screens and sections) can't be bound. Use the fixed numbers in §3.

**Spacing scale:** `2 · 6 · 8 · 12 · 16 · 20 · 24 · 28 · 32 · 36 · 40 · 48 · 64 · 72 · 80`
**Radius scale:** `4 · 6 · 8 · 12 · 14` (10 is a placeholder, don't use it)

---

## 2. Strokes (borders)

### Alignment: which one to use

| Alignment | Use for | Why |
|---|---|---|
| **Inside** (default) | Every frame, card, input, button, table, row, panel, anything with auto layout | The box stays exactly its layout size, so a 1px border never changes width or alignment or gets clipped by a parent with *Clip content* |
| **Center** | Vector paths only: icons, open lines, arrows, chart lines | Open paths can only take center strokes, and icon strokes stay symmetric on the pixel grid |
| **Outside** | Things *around* an element that must not shrink it: focus rings, selection outlines, the separator ring on overlapping avatars | The element's content keeps its size. The ring sits around it |

- If you're not sure, use **Inside**.
- Never use an outside stroke on an element inside a frame that clips content. The stroke gets cut off.
- Never use a center stroke on a frame. It puts half a pixel outside the box, so edges land on half pixels and look blurry.
- Keep **"Include strokes in layout" off.** Strokes never change spacing.

### Weight

- Default **1px**. Use **2px** only for state (focus, selected, error emphasis).
- No 0.5px or 1.5px.

### Color

- `line` = dividers and quiet borders (cards, table rows, sections).
- `outline` = interactive borders (inputs, outlined buttons, chips).
- State colors (`neg`, `accent`, …) only when the border communicates a state.

### Dividers

- To separate rows, put a **single-side Inside stroke** on the row (bottom only, using per-side weights) or use the kit Divider. Don't draw separate rectangles or lines.
- Never stack two borders: two bordered cards with gap 0 produce a 2px seam. Use one container border plus internal dividers instead.
- The last row in a bordered container has no bottom divider. The container border already closes it.

---

## 3. Canvas and screen layout

### Organization

- Page `PC` holds all desktop screens.
- One **Section per audience**: `공통` (landing, sign-in, sign-up, terms), `학생회` and `학생`. Never mix council and student screens.
- Inside an audience section, each **feature is its own sub-section**, named after the feature (e.g. `활동`, `설문`, `질문과 건의`). Sub-sections are stacked top to bottom.
- Inside a feature sub-section, the flow runs left to right (e.g. 공지 목록 → 공지 상세 → 공지 작성). State screens stack below their main screen.
- Never put loose text (labels, notes) directly in a section or sub-section. The sub-section name is the label.

### Spacing between things on the canvas

| Between | Distance |
|---|---|
| Screens in the same flow (horizontal) | **120** |
| States/variants of the same screen (stacked below it: empty, error, loading, modal open) | **80** |
| Feature sub-section edge and its screens (sub-section padding) | **160** |
| Feature sub-sections inside an audience section (vertical) | **240** |
| Audience section edge and its sub-sections (section padding) | **160** |
| Audience sections (vertical, all at x 0) | **400** |

- Align screens in a row by **top edge**. Align sub-sections by **left edge**.
- Every sub-section in an audience section has the **same width** (the widest one's).
- Every x/y and section size on the canvas is a whole number on the 8 grid. When stacking, round screen heights up to a multiple of 8.

### Screen frames

- PC screen width **1440**. Height **hugs content** with a min height of **900** (one viewport).
- Every screen is `TopNav` + `Body` + `Footer`. Every `Body` has the same settings:

  | Property | Value |
  |---|---|
  | Auto layout | Vertical, top / center, no wrap |
  | Padding | Top **40** (`Spacing/800`), bottom **80** (`Spacing/1000`), left/right 0 |
  | Gap | **24** (`Spacing/550`) |
  | Sizing | Fill width, hug height, min height **828** (900 − 72 TopNav) |
  | Appearance | No fill, stroke or effect. Radius 0. Clip content off |

- Body children are fixed **1200** wide frames, centered by the Body's auto layout, so the side margins come from centering and don't need a padding token.
- Name frames `Area / Page / State`, e.g. `학생 / 공지 목록 / Empty`.

---

## 4. Spacing inside a screen

Pick the gap by **what it separates**, not by what looks right. Closer relationship = smaller gap.

| Relationship | Gap |
|---|---|
| Inside a component (icon ↔ label, label ↔ helper text) | 2–8 |
| Related items in a group (form fields, list items, buttons in a bar) | 8–16 |
| Groups inside a section (field groups, card grids) | 20–32 |
| Sections of a page (header ↔ content ↔ footer areas) | 40–48 |
| Page-level (TopNav ↔ page title, page edges) | Fixed by `Body` (§3): 40 top, 80 bottom, 24 between Body children |

- One flat gap across related **and** unrelated items is wrong. Nest related items in their own frame with a smaller gap.
  - Exception: the Body's direct children (breadcrumb, page heading, content) all use the Body's 24 gap. Don't change the Body to separate them. Change spacing inside the children instead.
- Padding ≥ the gap between its children. A card whose children are 16 apart has at least 16 padding.
- Card/panel padding is symmetric: same left/right, same top/bottom.

---

## 5. Auto layout

- **Everything is auto layout.** No free-positioned children except deliberate overlaps (badges on avatars, floating elements), which use *absolute position* inside an auto layout parent.
- Sizing:
  - **Hug** for components and text-driven things (buttons, chips, badges).
  - **Fill** for anything that should stretch with its container (rows, inputs, content columns).
  - **Fixed** only for the screen width, the content column, table column widths, and icon sizes.
- Rows with a label + control (checkbox, toggle, heading + action) are vertically **centered**.
- Table-like rows use **fixed column widths** (or fixed-width slot frames) so columns line up regardless of content.
- `Space between` frames keep their gap **unbound**. A bound gap reflows to MIN in the desktop app.
- Text layers are *Auto height* with *Fill* width inside layouts. Never fixed height.

---

## 6. Radius

- Nested corners: **inner radius = outer radius − padding** (min 4). If the padding is larger than the outer radius, the inner element takes its own size-based radius.
- By element size:
  - Badge, small chip, checkbox: **4–6**
  - Button, input, chip: **8**
  - Card, panel, dropdown menu: **12**
  - Modal, large surface: **14**
- Full pill shapes only where the kit component already uses one.
- Screens, sections and full-width bars have radius **0**.

---

## 7. Typography

- Only kit text styles (`Display`, `Title`, `Headline`, `Body`, `Callout`, `Footnote`, `Caption`, `Paragraph`). Never set font size or weight by hand.
- One `Title` per screen (the page title). `Headline` for section headings. `Body` for content. `Footnote`/`Caption` for meta (dates, counts, helper text).
- Hierarchy comes from **Strong / Regular / Weak**, not from extra sizes or colors.
- Text color: `g1` primary, `g2` secondary, `g3` tertiary/disabled. Don't use the accent color for plain text.
- Long text uses `Paragraph/*`, not `Body/*`.

---

## 8. Color

- Surfaces: `bg` page, `bg2`/`bg3` for raised or grouped areas. Use `fill1–3` for subtle component fills, not new grays.
- One accent action per view. Everything else is neutral.
- State colors (`pos`, `warn`, `neg`, `info`) only for state, never as decoration. Text on a tinted background uses the matching `*T` token.

---

## 9. Components and icons

- Use a kit component before making a local one. If you need a variant the kit doesn't have, add it to the kit.
- Set variants explicitly when inserting (`Disabled = false`, etc.) and turn off unused `Leading`/`Trailing` slots.
- Detaching an instance is not allowed. If you have to, the component is missing something. Fix the kit.
- Icons: **16** inline with small text, **20** in buttons and rows, **24** standalone/nav. Icons take their label's color.
- If a shared element changes, edit the **master**, never the instances one by one.

---

## 10. Style

- No decorative subtitles, icon tiles, gradients or loud accents ("AI template look").
- Empty states: one line of text + at most one action.
- Prefer whitespace and dividers over boxes in boxes. Maximum **two levels** of bordered containers.

---

## Review checklist

Before calling a screen done:

- [ ] Every value bound to a token. No raw numbers in the inspector.
- [ ] All frame strokes **Inside**, 1px, `line` or `outline`.
- [ ] No double borders. Last row has no divider.
- [ ] Screen is in the right Section, row-aligned, 120 from its neighbors.
- [ ] Gaps follow the relationship table. Related items are nested.
- [ ] Inner radius ≤ outer radius − padding.
- [ ] Only kit text styles. One `Title` per screen.
- [ ] No detached instances. No placeholder slots left on.
- [ ] Checked in the desktop app, not just the server screenshot.
