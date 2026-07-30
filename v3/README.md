# SpectraSort website — v3 draft

A ground-up rewrite of the site for the **v3.0 app** (3-tab redesign: Toolbox /
Discover / Studio; new pricing). Built self-contained in this `v3/` folder so the
live site at the repo root stays untouched until we promote it.

**Rev 3 (2026-07-17):** real screenshots landed + copy aligned to ASC metadata r3.
- **Screenshots throughout** — the v3.0 ASC dark captures
  (`4-branding and promo/appstore-v3.0/screenshots-dark/`) web-compressed into
  `images/shots/` (800px JPEG). Shown **borderless** (`.screen-card` — rounded
  card + hairline ring, no phone chrome); the 160px status bar is cropped in
  CSS, same technique as the ASC composite pipeline. Square/wide detail crops
  use `object-fit: cover` + per-instance `object-position` inline styles.
- **Organize → Discover** everywhere (page renamed `discover.html`); Scenes
  listed first (left/default panel), Scenes = trips / themes / series.
- **Swipe map corrected** to right Pick · down Keep · left Discard (code-verified
  in r3); Similar-wheel line added.
- **"radar" retired** per r3 — it's "Quality focus" / "seven quality axes".
- Home hero → discovery-first ("Find your best photos. However you look for
  them."); Your Taste section now a 3-screen fan of real learned profiles
  (Portrait Creative / Nature Explorer / Pet Whisperer); privacy section wears
  the ASC padlock art.
- `prefers-reduced-motion` respected (also required for headless-Chrome section
  captures — smooth-scroll breaks them).

**Rev 2 (2026-07-13):** copy re-grounded against the actual v3.0 build — real
tool names (Dedupe, Photos of a location), real tier/toggle/bucket labels, the
index-once speed story, iOS 18.5, weight-wheel mechanics, Taste/Custom/
Bookmarked profiles — plus real in-app artwork throughout. Cross-verified
against the r9 working tree (4.24.48): Studio gate copy, Batch Process strings,
and the 5-sorts/week model all match.

## Preview

- **Full fidelity (theme toggle + analytics work):** a local server is the way.
  `python3 -m http.server 8731` from the repo root, then open
  `http://127.0.0.1:8731/v3/index.html`.
- **Quick look (visual only):** `open -a "Google Chrome" v3/index.html` — renders
  fine, but the `Theme` footer toggle and analytics won't run over `file://`.

## Sitemap

| File | Page | Job |
|---|---|---|
| `index.html` | Home | The promise + the 3-pillar overview. Flow (grid + swipe), Your Taste fan, Fast/Private, Pricing, FAQ. |
| `tools.html` | Toolbox | 6 cover-art cards (app order, anchor-linked) + a deep section per tool. |
| `discover.html` | Discover | Scenes + Timeline (the two panels, Scenes first) + the sort-any-slice loop. |
| `studio.html` | Studio | Quality focus (7 axes), weight wheel, subjects (×3), profiles. |
| `assets/site.css` | — | Shared design system (墨与月 + 光谱). Edit tokens once, all pages update. |
| `assets/site.js` | — | Shared Firebase analytics + preview theme toggle. |
| `images/art/` | — | Real in-app artwork, web-compressed (see below). |
| `images/shots/` | — | The v3.0 ASC dark screenshots, web-compressed (see below). |

## Positioning

- **Spine: one engine, three ways in** — *discovery tools* (Toolbox), *library
  browsing* (Discover), *taste & profile management* (Studio). You never have
  to learn all three to start.
- **Hero:** "Find your best photos. However you look for them." — discovery-first
  per the r3 North Star; the pillar cards carry the three-tab story.
- **Speed story (per Mike, 2026-07-13):** the throughput claims only apply to the
  one-time index; after that sorts are nearly instantaneous. Stats block is now
  **Once / Instant / Never** — no photos-per-second numbers anywhere.
- **Pricing:** free = 5 sorts/week; **$19.99 once** unlimited; save/share/delete
  free for everyone. "The limit is on sorts, not actions." Existing-buyer
  reassurance lives in the FAQ, not a pricing card.

## Multichannel use (website = master copy deck)

Each section is written to be lifted whole into other channels:

| Asset / section | App Store | TikTok / Reels | Reddit / forums |
|---|---|---|---|
| Hero line + 3 pillars | description intro | — | post intro |
| Swipe-deck loop (#flow video) | app preview footage | primary hook clip | — |
| Scene→Sort→grid loop (discover) | app preview footage | second hook clip | demo gif |
| Five-step dial loop (Best Shots) | screenshot caption | detail clip | — |
| Once / Instant / Never | "what's new" angle | text overlay | perf claims (honest) |
| Pricing section + FAQ | — | — | the anti-subscription story |
| "Built by an indie dev who uses it daily" | — | — | lead with this |
| Privacy FAQ answers | App Privacy notes | — | first comment reply |

Voice rules: `.claude/rules/writing-tone.md` (terse headers, outcome first,
mechanism named, no reassurance lines on public surfaces).

## Real artwork already in place (`images/art/`, ~1.4 MB total)

- `cover-{taste,best,subject,image,dedupe,place}.jpg` — the 6 tool-card covers
  (from Assets.xcassets) on the Toolbox grid cards.
- `quality-1..5.jpg` — the five tier arts (Best Shots strip).
- `subject-*.jpg` (8) — template arts: Pets, Nature, Portrait, Street, Sunset,
  Food, Architecture, Night (Find a Subject strip).
- `profile-{nature,portrait,night,versatile}.jpg` — homepage Your Taste collage.

Sources: `4-branding and promo/generated-images/v8-art-selects/` + the app asset
catalog. Recompress cmd is in git history if art gets re-selected.

## Screenshots in place (`images/shots/`, ~2.9 MB total)

Source: `4-branding and promo/appstore-v3.0/screenshots-dark/` (the ASC set,
dark mode, 1320×2868) → cropped nothing, resampled to 800px wide, JPEG q82.
Status bar is removed **in CSS** (`.screen-card img { margin-top: -12.1212% }`),
so re-exporting from new captures is a straight swap.

| File | Screen |
|---|---|
| `toolbox.jpg` | Toolbox tab, 6 tool cards (home hero) |
| `taste-nature/-portrait/-pets.jpg` | Your Taste — Nature Explorer / Portrait Creative / Pet Whisperer (home fan; nature also crops on tools page) |
| `review-grid.jpg` / `review-swipe.jpg` (+`-b`) | Review grid + single-photo swipe (home flow pair) |
| `likethis.jpg` | Like This Photo sheet (tools crop) |
| `bestshots.jpg` | Best Shots sheet (tools crop) |
| `findsubject.jpg` | Find a Subject, "Dogs at beach" typed (tools crop) |
| `location-map.jpg` | Select Location map (tools crop) |
| `discover-scenes.jpg` / `discover-timeline.jpg` | Discover panels |
| `studio.jpg` | Studio tab (full on studio page + 3 detail crops) |
| `privacy-art.jpg` | Padlock-on-photo-stack art (home private section) |
| `paywall.jpg` | Premium paywall (unused — cards do that job) |

## Remaining placeholders (video / missing capture)

1. **Dedupe square** (tools page) — no ASC capture exists; needs the three
   switches or the stacks-only grid.
2. **Scene → Sort → grid loop** (discover page) — ~5s video. *Second TikTok hook.*
3. Optional upgrades later: swipe-deck loop, Best Shots dial-stepping loop,
   weight-wheel turn loop (statics are in place for all three).

Video specs: H.264 mp4, muted, autoplay-loop, ~1080px long edge, 3–6s.

## Still to do before this can go live

- [ ] Dedupe capture + the Scene→Sort loop above.
- [ ] New `og-image.png` (current one is v2 — old pricing/screens).
- [ ] Refresh `llms.txt` and `sitemap.xml` for the new pages/pricing
      (`organize.html` never shipped, so no redirect needed — but re-check at
      promote time).
- [ ] Tool names re-verified against the shipping build at release (currently
      matched to 4.24.69 / ASC metadata r3).
- [ ] Promote: move `v3/*.html` → repo root, merge `v3/assets` + `v3/images` →
      root. (Relative paths make this a near-clean move.)
- [ ] CN version follows later (separate pass; strings not translated here).

## Design system notes

- Fonts: Fraunces (italic serif, headings) · Inter (body) · JetBrains Mono
  (eyebrows/labels). Dark = 墨 (ink), light = 月 (moon); prism (deep/rose/amber)
  used sparingly — stat words, accents, the single amber aperture.
- The `.shot-ph` / `.media-ph` / `.tool-media` placeholder styling is
  intentionally on-brand so the draft reads as finished before real imagery lands.
