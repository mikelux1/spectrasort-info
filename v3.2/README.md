# SpectraSort website — v3.2

**Built 2026-07-28.** v3.1 with the four changes below. Still not deployed;
`v3/`, `v3.1/` and the live root site are all untouched.

## What changed from `v3.1`

| | v3.1 | v3.2 |
|---|---|---|
| Rank demo photos | the app's own cover art (`images/art/subject-*`) | **nine real photographs** from the sim test library, in `images/roll/` |
| Review → Done | one swipe-deck capture | **the pair** — both near-identical dog frames, staged like the App Store shot |
| Analytics | none | **`assets/analytics.js`** — Firebase, lifted from the v3 draft |
| `og-image.png` | root file, still v2 | **new**, built from `_build/og-image.html` |
| `llms.txt` / `sitemap.xml` | root files, still v2.2 | **rewritten** for v3.0, sitting in this folder until promote |

## 1. The rank demo now runs on real photographs

The section's whole argument is about a camera roll, so it should look like one.
Nine photos out of `spectrasort-sim-1k`, cropped square at 360px, 264 KB total:

| File | Role |
|---|---|
| `roll-sunset-jump.jpg` | golden hour — match |
| `roll-coast-golden.jpg` | golden hour — match |
| `roll-city-sunset.jpg` | golden hour — match |
| `roll-dog.jpg` | ranks 1st on taste, **last** on quality (it is charmingly out of focus) |
| `roll-portrait.jpg`, `roll-food.jpg`, `roll-blossom.jpg` | mid-field |
| `roll-icebergs.jpg`, `roll-flatiron.jpg` | rank high on quality, low on taste |

Tiles `0/1/2` are the golden-hour frames and `SEARCH_MATCH` in `assets/site.js`
points at exactly those. Swapping a photo means changing `ART`, `ORDERS` and
`SEARCH_MATCH` together — the orders are indices into `ART`, not filenames.

The dog placing last under **Best Shots** is deliberate. It is the honest
answer, it is visibly true at a glance, and it is the clearest possible
demonstration that "your taste" and "best quality" are two different questions.

> ✅ **Licensing — checked and resolved 2026-07-28.** `spectrasort-sim-1k` was
> built from the **Unsplash Lite Dataset**, which sits in the same parent
> folder with its own `TERMS.md`. Those Terms are stricter than I first
> assumed: the Lite grant covers only *internal* machine-learning use, and
> **section 3.A forbids disclosing, disseminating or publishing any portion of
> the licensed data in any manner.** A marketing page is publishing, so the
> dataset copies could not ship — Lite vs Full made no difference.
>
> All nine were therefore **re-downloaded individually from unsplash.com**
> (`https://unsplash.com/photos/<id>/download`) and re-cropped. Photos obtained
> that way carry the **Unsplash License**, which permits commercial use with no
> attribution required. Framing is identical to the dataset crops and the files
> are slightly sharper, being full-resolution originals.
>
> Provenance and photographer credits: `images/roll/CREDITS.txt`. If these are
> ever regenerated, re-download from unsplash.com — never copy from the dataset
> folder.

## 2. Review → Done shows the pair

Two takes of the same dog seconds apart — 6.8 and 6.7, "Similar 1 of 2" and
"2 of 2" — staged like `appstore-v3.0/composite/04-review.png`.

**The left card is the one behind, and that is not arbitrary.** Each score badge
sits on its own card's *left* edge, so putting the front card on the left buries
the back card's badge and leaves the reader nothing to compare. Right-card-front
is the only arrangement where both scores read. The first attempt got this
backwards and had to be reshot.

The copy gained a paragraph naming the wheel, since the visual now shows it.

## 3. Analytics live in their own module

`assets/analytics.js`, loaded as `<script type="module">`, separate from
`site.js`. If the Firebase CDN is blocked or fails, the page's interactions are
untouched — a single combined module would take the rank demo down with it.

Carried over from `v3/assets/site.js`: `page_view`, `link_click`, `cta_click`,
`outbound_click`, `section_view`, `scroll_depth`. Dropped: the light/dark preview
toggle and the multi-page `.page-hero` helper, neither of which exists here.
Added: `demo_chip_click` (is the rank demo touched, or is it wallpaper?) and
`faq_open`.

The Firebase web config is public by design — it ships to every browser that
loads the site. It is not a secret.

## 4. og-image, llms.txt, sitemap.xml

- **`og-image.png`** (1200×630) — built from **`_build/og-image.html`**, which
  carries the regeneration command in a comment at the top. Headline plus a
  filmstrip of the roll photos with the top three ringed in amber and scored,
  the rest greyed — the ranking claim, legible at thumbnail size. `_build/` is
  a source folder and is **excluded at promote time**.
- **`llms.txt`** — full rewrite. The live one still describes v2.2: $7.99, iOS
  16, the old Bookmarked/Custom/Taste profile model, and "Premium unlocks
  save/share/delete" — which is now free for everyone. The new one describes
  the Toolbox, Studio, Discover, the review flow, $19.99 once, five free sorts
  a week, and the Recently-Deleted caveat.
- **`sitemap.xml`** — four URLs. The old one pointed at `/privacy.html` and
  `/terms.html`; the footer links to the directory forms, so those are what is
  listed, with `zh-Hans` alternates. `robots.txt` needs no change.

Both files live **in this folder**, not at the root, on purpose: promoting them
early would advertise a v3 page that is not live yet.

## Carried over from v3.1 (still true)

- **Dark screenshots.** Concept C is a `#0B0B0E` design and `images/shots/` are
  already the ASC dark captures. Light ones would have fought the page.
- **Screenshot cropping.** Captures are 800×1738 with the iOS status bar removed
  in CSS (`.screen-card img { margin-top:-12.1212% }`), so re-exporting is a
  straight file swap. **`height:auto` on that rule is load-bearing** — the
  `width`/`height` attributes on the `<img>` are presentational hints that
  otherwise pin the height and silently defeat the crop.
- Captures whose lower half is dead weight use `.capped` + a per-instance
  `--cap` and fade into `--fade-to`: toolbox 560, taste-nature 500, findsubject
  430 (cuts the iOS keyboard, which was half the frame), studio 500,
  likethis/review-grid 400.
- **Copy decisions.** AI leads and privacy closes, both carried. No
  gigabytes-freed receipt anywhere — the page says "Recently Deleted" and names
  the 30 days. A storage FAQ carries the keyword without repositioning the app
  as a cleaner. Dedupe stays one of six tools; per Mike, no dedupe pivot.
- **Open question:** the app's UI is Fraunces italic, this site is Space Grotesk
  because that is what Concept C chose. Easy to flip if the site should match
  the app.

## Preview

```
python3 -m http.server 8742          # from spectrasort-info/
open http://127.0.0.1:8742/v3.2/index.html
```

`file://` works for layout, but Google Fonts won't load and `analytics.js` will
fail its CORS check — use the server for anything real.

## Status — SHIPPED 2026-07-28

- [x] **Photo licensing resolved** — re-downloaded from unsplash.com, see above.
- [x] **Promoted to the repo root and pushed live** (commit `7906d6e`).
      `index.html`, `og-image.png`, `llms.txt`, `sitemap.xml` and the `assets/`
      + `images/` trees now sit at the root and are what spectrasort.app serves.
      `_build/` and this README were deliberately left behind, and **this
      `v3.2/` folder is not committed** — it stays local so the live site has
      no duplicate copy of itself at `/v3.2/`.
- [ ] **Pricing check** — the page says $19.99 once + 5 free sorts a week, which
      matches the shipping build. If the weekly meter is dropped (Block 2 of the
      roadmap proposal), the Pricing section and two FAQ answers change.
- [ ] **CN version** — separate pass, strings not translated here.
- [ ] **Open question, carried:** the app's UI is Fraunces italic, this site is
      Space Grotesk. Still easy to flip.

## Why this matters

The live root still serves **$7.99** and the word "subscription" five times
while the App Store sells **$19.99 once**. Web referral is 41% of downloads —
the single biggest source — and it lands on wrong pricing. Shipping any correct
version beats the status quo.
