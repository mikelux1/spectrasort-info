# SpectraSort website — v3.1

**Built 2026-07-27.** A rebuild of the `v3/` draft in the **Concept C** design
language, folded down to a **single page**, with the research corrections from
the 2026-07-26 sweep applied to the copy.

Not deployed. `v3/` and the live root site are both untouched.

## What changed from `v3/`

| | v3 draft | v3.1 |
|---|---|---|
| Pages | 4 (`index` / `tools` / `discover` / `studio`) | **1**, anchor-linked |
| Design language | 墨与月 — Fraunces italic + Inter + JetBrains Mono, light/dark toggle | **Concept C** — Space Grotesk + Inter, **dark only** |
| Hero | Static Toolbox screenshot | Same, capped; the **live rank demo** moved to its own section where it makes an argument instead of posing as a screenshot |
| Positioning | "Find your best photos. However you look for them." (discovery-first) | **"Your best photos. Surfaced."** — ranking-led, per Concept C's moat framing |
| Placeholders | 3 video slots + a dashed proof bar | **None.** Placeholders read as broken on a live site |

## Answering the screenshot question: dark

Concept C is a dark design (`#0B0B0E`), and `images/shots/` are already the
**ASC dark captures**. They drop straight in — no re-shoot needed, and light
screenshots would have fought the page.

## The design system (from Concept C)

- **Palette** — bg `#0B0B0E`, raised `#141318`, card `#1A1920`, text `#F4F2ED` /
  `#A8A4AE` / `#6E6A76`. Spectral gradient `#6B7FBC → #C77FB4 → #E8A96A`.
- **Type** — Space Grotesk 500/600/700 (display), Inter 400/500/600 (text).
  Body 17px, h1 `clamp(42px, 6.6vw, 80px)`, eyebrows 13px / .14em / uppercase.
- **Radius** 22px sections, 30px screen cards, 999px buttons.
- Scroll-reveal (`.rv`), the dedupe stack collapse, the sticky mobile CTA and
  the rank demo are all carried over. All respect `prefers-reduced-motion`.

**Open question for Mike:** the app's own UI is Fraunces italic; this site is
Space Grotesk, because that's what Concept C chose. It reads as deliberate
contrast (the serif lives inside the phone frames) but it is a real divergence
from `v3/`. Easy to flip if you'd rather the site match the app.

## Screenshot cropping — how it works

Every capture is 800×1738 with an iOS status bar on top.

- The bar is removed in CSS (`.screen-card img { margin-top:-12.1212% }`), so
  re-exporting new captures is a straight file swap.
- **`height:auto` on that rule is load-bearing.** The `width`/`height`
  attributes on the `<img>` (kept for layout stability) are presentational hints
  that otherwise pin the height and silently defeat the crop.
- Captures whose lower half is dead weight get `.capped` with a per-instance
  `--cap`, and bleed off behind a fade into `--fade-to`:

| Capture | `--cap` | Why |
|---|---|---|
| `toolbox` (hero) | 560px | keeps the headline above the fold |
| `taste-nature` | 500px | ends after the learning toggle |
| `findsubject` | 430px | **cuts the iOS keyboard**, which was half the frame |
| `studio` | 500px | ends after the quality radar |
| `likethis` / `review-grid` | 400px | drops an empty band; keeps the pair symmetric |

Sections with the raised background carry `class="rise"`, which sets
`--fade-to: #141318` so the fades land on the right colour.

## Copy: what the research changed

- **AI leads, privacy closes — both carried.** The app ranks #10 for
  "ai photo picker" and #10 for "photo picker" and nowhere else, so AI stays in
  the title/meta/eyebrow. On-device is a full section, three FAQ answers and a
  hero chip — the trust closer, not a replacement.
- **No GB-freed receipt, anywhere.** iOS deletions go to Recently Deleted, so a
  "you freed 4.2 GB" number is false when shown — it's the category's #1 fraud
  accusation in 1★ reviews. The Dedupe section and the storage FAQ both say
  "Recently Deleted" and name the 30 days.
- **New FAQ: "Does it free up storage?"** — carries the keyword ("free up
  storage" beats "free up space") without repositioning the app as a cleaner.
- **Dedupe stays one of six tools.** Per Mike, 2026-07-27: no dedupe pivot. The
  word "duplicate photos" appears in the meta keywords, the tool card and the
  Dedupe section — search surface only, identity unchanged.
- Voice per `.claude/rules/writing-tone.md`: terse headers, outcome before
  mechanic, no reassurance lines.

## Assets

Everything is copied from `v3/` — **no new art was generated.**

- `images/shots/` — the v3.0 ASC dark captures, 800px JPEG.
- `images/art/` — real in-app artwork. The six `cover-*.jpg` are the Toolbox
  cards; nine `subject-*` / `profile-versatile` feed the rank demo;
  `subject-sunset.jpg` is the dedupe stack (matching its "same sunset" headline).
- 15 files are unused spares (`quality-1..5`, `paywall`, `bestshots`,
  `location-map`, `taste-pets/portrait`, `review-swipe-b`, `profile-*`). Left in
  place — they're small and useful if sections get rearranged.

## Preview

```
python3 -m http.server 8742          # from spectrasort-info/
open http://127.0.0.1:8742/v3.1/index.html
```

`file://` works too, but the Google Fonts request won't.

## Before this can go live

- [ ] **Analytics** — `assets/site.js` has no Firebase snippet yet. Lift it from
      `v3/assets/site.js` at promote time.
- [ ] **New `og-image.png`** — the root one is still v2 (old pricing/screens).
- [ ] **`llms.txt` / `sitemap.xml`** — written for the v2 page set; the v3 draft's
      `tools`/`discover`/`studio` pages never shipped, and this version has no
      subpages at all, so both need a rewrite.
- [ ] **Promote** — move `v3.1/index.html` to the repo root and merge
      `v3.1/assets` + `v3.1/images` into the root. Relative paths make it a clean
      move. `/privacy` and `/terms` already live at the root.
- [ ] **Pricing check** — the page says $19.99 once + 5 free sorts a week, which
      matches the shipping build. If the weekly meter is dropped (Block 2 of the
      roadmap proposal), the Pricing section and two FAQ answers change.
- [ ] **CN version** — separate pass, strings not translated here.

## Why this matters

The live root site still serves **$7.99** and the word "subscription" five times
while the App Store sells **$19.99 once**. Web referral is 41% of downloads —
the single biggest source — and it lands on wrong pricing. Shipping any correct
version beats the status quo.
