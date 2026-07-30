# SpectraSort website — v3.3-video

**Built 2026-07-29.** A copy of `v3.2` (which is byte-identical to the live root)
with **three static captures replaced by real screen loops** cut from the v3.0
device footage. Not deployed. `v3/`, `v3.1/`, `v3.2/` and the live root are
untouched.

Videos come from
`../../spectrasort/4-branding and promo/Video intro/v3.0-cut/out/`, built by the
`promo-cut` skill on the `web` profile (660×1344, 30fps, silent, CRF 30).

## What changed

| Section | v3.2 | v3.3-video |
|---|---|---|
| Hero (`#top`) | `images/shots/toolbox.jpg` | **`video/web-hero.mp4`** — 6.9s, 403 KB |
| Find a Subject (`#find-subject`) | `images/shots/findsubject.jpg` | **`video/web-find-subject.mp4`** — 4.2s, 124 KB |
| Review → Done (`#done`) | `.stack-pair`, two stills | **`video/web-review-swipe.mp4`** — 3.5s, 56 KB |

Plus: three poster JPEGs in `images/shots/`, one CSS rule, one JS block, and a
`<link rel=preload>` for the hero poster. **588 KB of video total.**

Two further changes came out of review, both about the **bottom fade**, and one new
component:

| | v3.2 | v3.3-video |
|---|---|---|
| `.screen-card.capped` fade height | hard-wired **110px** | **`var(--fade-h, 70px)`** |
| Find a Subject cap | `--cap:430px` | **`--cap:470px`** |
| Your Taste (`#taste`) | one still, `taste-nature.jpg` | **`.taste-fan`** — three profiles fanned |

## The fade was eating a button

The "Find this subject" bar occupies card **y 373–408**. At `--cap:430px` the 110px
fade began at **y 320**, so the whole button sat 50–80% darkened and read as a
rendering bug. Measured off the real frame, not eyeballed.

No fade height fixes that — at cap 430 the button is inside the bottom 110px
whatever the gradient does. **The cap had to move.** 470 lifts the fade clear of
the button and lets one dim keyboard row bleed off beneath it, which is honest:
you did just type.

Separately, 110px was **20% of a 560px card**, and it cost legibility everywhere —
the Toolbox's last row of tool descriptions was barely readable in the hero.
**70px** keeps the bleed-off without the tax, and `--fade-h` is now tunable per
instance. Rule of thumb: `--cap` is for content that must not be dimmed at all;
`--fade-h` is only for softening the cut.

## `.taste-fan` — three profiles, not one

Staged like ASC screenshot `02-yourtaste.png`: **Nature Explorer** in front,
**Portrait Creative** and **Pet Whisperer** angled back and clipped by the frame.
One screenshot could not make this section's actual argument — that the profile is
*yours*, and a different library produces a different one. Three named, visibly
different profiles say it with no extra copy.

**The geometry is the whole trick.** A profile's name is centred in its card, so a
side card only earns its place if enough of it shows to read that name. The ASC
composite achieves this with a canvas **2.56×** the front card's width
(1320 / 515). The first attempt here used 1.6× — the names fell underneath the
front card and it degenerated into two anonymous dark slivers. Front card is now
**39%** of a 520px fan, reproducing 2.56 exactly.

These three cards are **not `capped`**, deliberately: at 39% width they are ~416px
tall, shorter than any cap worth setting, so a cap clips nothing — but the fade
still fired and greyed out "Sort photos by your taste" on all three. Same defect
as the old Find a Subject cap. A fade hides a cut; there is no cut here.

Below 560px there is no width left to hold 2.56, so the side cards are hidden
rather than shipped unreadable, and the front card takes the full slot.

## Frame width — the thing that had to be fixed

**The loops are 660×1344.** That is exactly half of a 1320×2868 device capture
minus its 180px status bar (1320×2688, aspect 55:112), which makes the side crop
**zero**. It has to be zero, because each loop sits in the same card as — and on
the same page as — 800×1738 stills of the same screens, and those stills keep the
full frame width.

The first pass used the `web` profile's old 640×1386. That is a *narrower* aspect
than the source, so `compute_geometry` silently took **39px off each side** (3%
per edge, 6% overall). Next to the stills it read as a zoom, and it clipped
edge-anchored UI the stills show:

| Section | clipped in the 640×1386 cut |
|---|---|
| Hero | tool tiles flush to both card edges; bottom-row descriptions lost |
| Find a Subject | the 4th template tile ("Street") cut in half; "Find this subject" bisected |
| Review → Done | "Undo" cut off right, the "Discard" chip cut off left |

`_cmp/index.html` is a throwaway three-way comparison — **the still it replaces /
the 640×1386 cut / the 660×1344 re-render** — each in an identical `.screen-card`
at the real 318px slot width and real `--cap`, so the frame is the only variable.
Delete `_cmp/` before promoting.

The superseded renders are archived at
`../../spectrasort/4-branding and promo/Video intro/v3.0-cut/out/_archive/pre-fullwidth-2026-07-29/`.

The `web` profile in `promocut.py` is now 660×1344 permanently, with a comment
saying why the numbers must not be rounded.

## Why only these three

Each is a section whose **copy claims a motion a still cannot show**:

- the hero says the app *ranks* a library — that's a before/after
- Find a Subject argues you *type* a phrase and a grid *fills*; the old still had
  "Dogs at beach" already typed, which is the one thing the section isn't claiming
- Review → Done says "roll between them without leaving the photo" — a gesture,
  which `.stack-pair` was faking with a CSS rotation

The other captures (taste, like-this, discover, studio, privacy) argue about a
**state**, which a still shows perfectly well. And three autoplaying loops on one
page is already the ceiling before the page reads as noisy.

## How the loops behave

Markup carries **no `autoplay`**. Playback is driven from `assets/site.js`
(bottom of the IIFE, `video.screen-loop`), matching how the rank demo and the
dedupe stack already gate themselves:

- `prefers-reduced-motion: reduce` → **never played.** The poster is the entire
  experience, and each poster is a legible, informative frame — not a black one.
- otherwise → **play on entering view, pause on leaving**, so at most one loop is
  ever decoding.

Every poster is **frame 1 of its own video**, so poster → first frame is
pixel-identical and there is nothing to cross-fade.

## The one CSS rule

```css
.screen-card video { width:100%; height:auto; display:block; margin-top:0; }
```

`margin-top:0` is load-bearing. `.screen-card img` pulls `-12.1212%` to crop the
status bar off the raw 800×1734 screenshots. These videos are **already**
status-bar-cropped (`crop_top:180` on a 1320×2868 capture), so inheriting that
pull would slice a second time, into the app UI.

## The hero and largest-contentful-paint

The old hero `<img>` carried `fetchpriority="high"`. A `<video>` poster cannot, so
the same job is done from `<head>`:

```html
<link rel="preload" as="image" href="images/shots/hero-poster.jpg" fetchpriority="high">
```

The hero video is `preload="metadata"`; the other two are `preload="none"`.

## Verified

- Geometry measured live: all three render **318×648** in the 320px slot, card
  heights **560 / 470 / 650**, computed `margin-top: 0px`. ✓
- Content framing checked frame-by-frame inside each real cap. At `--cap:560px`
  the hero's "Nature Explorer" title *and* its description are fully legible, and
  the grid shows its header plus three scored rows. At `--cap:470px` the "Find
  this subject" bar is fully lit and one dim keyboard row bleeds off below it. ✓
- `web-review-swipe.mp4`'s **loop seam is clean**: the last frame is `13/1708`,
  score 6.8, "Similar 1 of 2" — the same state as frame 1. Picking one of a
  Similar pair returns the wheel to the other, so the cut closes where it opened.
  The green "Picked" flash at 3.3–3.4s is the app's own confirmation animation,
  not a screen transition. ✓
- `site.js` finds all three loops; `play()` is accepted with no media error. ✓

- **Playback confirmed.** After a foreground hard-reload the loops reported
  `readyState: 4` with natural size `660x1344`, and `web-find-subject.mp4` advanced
  to `t=0.95` on its own. The play-in-view / pause-out-of-view gate also proved out:
  the hero sat paused at `t=0` while off-screen, and `web-review-swipe.mp4` — which
  was never scrolled into view — had `readyState: 0`, i.e. `preload="none"` meant it
  was never even fetched. ✓
- The `.taste-fan` clears its caption by 36px and contains **zero** `.capped`
  elements, so nothing in it is dimmed. ✓

**Caveat on verifying this yourself through tooling:** Chrome will not fetch or
decode media in a background tab, and the Chrome MCP tab is always
`visibilityState: "hidden"` — videos there report `readyState: 0` with no `.mp4`
request ever hitting the server, and `await video.play()` freezes the renderer
outright. Judge playback in a real foreground window.

## Viewing it

```bash
cd /Users/mike/dev3/spectrasort-info && python3 -m http.server 8899
open -a "Google Chrome" "http://localhost:8899/v3.3-video/index.html"
```

`file://` also works, with one harmless casualty: `assets/analytics.js` is
`type="module"` and is blocked by CORS over `file://`. It is loaded separately
from `site.js` precisely so it can never take the page's interactions down, so
the loops and the rank demo still run.

## Reverting any one swap

The v3.2 stills are all still in `images/shots/` — `toolbox.jpg`,
`findsubject.jpg`, `review-swipe.jpg`, `review-swipe-b.jpg` — and the
`.stack-pair` rules are still in `assets/site.css`. Each swap is one contiguous
block in `index.html`, commented with what it replaced and why.

## If this promotes to root

1. Copy `video/` and the three `*-poster.jpg` files up.
2. Take `index.html`, `assets/site.css`, `assets/site.js` from here.
3. Nothing else moves — `llms.txt`, `sitemap.xml`, `og-image.png` are unchanged
   from v3.2.
4. GitHub Pages serves `.mp4` with correct `Content-Type` and honours Range
   requests, so no config is needed.

## Copy pass (2026-07-29)

Mike: *"reduce all body text / subtitles by 1/2. they're too verbose. get to the
point faster."* Plus: the Your Taste caption read "Three libraries, three profiles.
Yours is built from your own picks." and confused people — *"what 3 libs?"*

**Body copy: 825 → 535 words (35% shorter). Em-dashes: 36 → 16.**
New caption: **"Your taste profile learns what you pick, then sorts your photos
that way."**

Headlines and eyebrows were left alone — already terse. Two passes: a marketing
rewrite against `.claude/rules/writing-tone.md`, then a second tightening pass that
leans on the fact the FAQ directly below restates every detail, so body copy can be
the headline layer and the FAQ the detail layer.

**Why 35% and not 50%.** Only five paragraphs are still ≥20 words, and each is
load-bearing: the hero pitch, the search-phrase examples, Scenes + Timeline,
Studio's four controls, and the privacy claim. Getting to a literal 413 words means
either dropping a required fact or cutting the **`.trip-row`** — the four-cell
"a trip, start to finish" strip in `#done`, 43 words, which largely restates the
three `#done` paragraphs beside it. That is a content decision, not a copy edit,
so it is left for Mike.

Overridden from the marketing pass, deliberately:
- It injected "$19.99" into `#pricing .fine`; `.price-big` states it in 40pt directly
  above, so that was redundant.
- It dropped "near-instantly" from the `#privacy` "Once" stat to save one word. That
  phrase is the entire point of the stat — kept, and the sentence shortened elsewhere.
- It cut "Corroborated by Apple's own App Privacy label." **This one is a real loss** —
  third-party corroboration, not reassurance. Accepted for length; worth restoring as
  a small link rather than body copy if Mike wants it back.

## Second copy review (2026-07-29, 18 items)

**Body copy now 825 → 387 words (53% shorter).** It cleared the 50% target not by
thinning sentences further but by deleting whole redundant blocks.

Removed outright: `#find-subject` P2, `#dedupe` P2, `#done` P2 and P3, `#studio` P2,
the `#pricing` `.fine` line, the **privacy `Once / Zero / Six` stats row**, and the
**"Will SpectraSort delete my photos?" FAQ** (both the visible `<details>` and its
JSON-LD twin).

Why the privacy stats row went rather than getting a better summary: it collided
with all three of its neighbours. "Zero uploads" restated the band's own headline
*"Nothing leaves your phone."*, "Six one-tap tools" restated the whole Toolbox
section, and "Once" restated the FAQ's speed answer.

Other changes:
- `#why` — *"Finding is step one of three"* was a riddle at the top of a paragraph.
  It is now an eyebrow **directly above the three boxes it describes**: "Every sort
  is three steps".
- `#tools Find a Subject` — example changed to **"hot air balloons"**. The cover art
  is a magnifier over a hot-air-balloon photo; the copy said "dogs at the beach".
- `#taste` — "the top of the pile" assumed context a skimmer does not have → "What
  it picks starts to look like what you'd have picked yourself."
- `#like-this` — was about statues while both screenshots show a **golden
  retriever**. Now about dogs. Also dropped its privacy aside; privacy is its own
  section's job.
- `#discover` — "runs year to month to day" → "takes you through your days, months
  and years".
- `.trip-row` — four trip-narrative cells → **three stages: Sort / Review / Batch
  Process**, one line each. CSS grid 4 → 3 columns.
- `#privacy` — "The models ship pre-trained and never learn from your library" is
  jargon → "Your photos are never uploaded anywhere." Same fix applied to the FAQ
  twin of that claim.
- `#dedupe` — "a repeated moment costs one decision instead of ten" was clinical →
  "you pick the one you like and move on".
- **FAQ speed** — the word "slow" is now absent from the entire page (verified: 0
  occurrences). Replaced with the already-shipped ASC claim: **"up to 100 photos a
  second on recent iPhones"** (matches `asc-metadata-v3.0-draft-r3.md`, and the app
  itself reports live `photos/sec indexed`).
- **FAQ storage** — the "you freed 4.2 GB" essay is gone. Now: photos go to Recently
  Deleted, and the storage comes back when you empty that album yourself or after 30
  days.
- Closing CTA — dropped "Free for five sorts a week."

All edits were applied by script with `count == 1` guards on every anchor, so a
partial or duplicated replacement aborts instead of landing silently. Both JSON-LD
blocks re-validated as parseable JSON; HTML tag balance re-checked.

## Third copy review (2026-07-29)

**Body copy now 825 → 354 words (57% shorter).**

- `#why` P1 → "Your phone finds "beach". SpectraSort tells you which of the matches
  are worth keeping." Positive framing: says what the app does, not what the phone
  can't.
- `#why` Finish stat → "Search apps stop here." deleted. Page-wide instruction: stop
  denigrating the alternative at every turn. (The FAQ's "How is this different from
  Apple Photos or Google Photos?" stays — that is a question users actually ask.)
- `#tools Find a Subject` → 'such as "hot air balloons"'.
- `#taste` P1 → names the mechanism before the outcome: "The app builds a
  personalized profile around your taste."
- `#like-this` → "Pick one photo and get back others like it, ranked most similar
  first." Generic; the dog/statue specifics are gone. Its `.shot-cap` deleted.
- `#discover` → "Sort any slice." deleted.
- `#done` P1 → "Or let Autopick choose." → "Use the wheel to compare similar photos."
- **`.trip-row` deleted entirely** (the three Sort / Review / Batch Process tiles).
- `#studio` → "Seven quality axes to adjust. Up to three subjects. A balance wheel to
  trade subject match against quality. Bookmark as customized sort profiles."
- `#privacy` → "on Apple's Neural Engine" dropped from the band; it is jargon there
  and two FAQ answers still carry it.
- **Privacy band crop `object-position: center 38%` → `45%`.** 38% deliberately
  pulled the focal point UP off the padlock; that clipped the lock's lower body. The
  padlock's centre sits at ~50% of the 800×1733 source, so 45% lands the whole lock
  in the visible slice. Comment in `site.css` updated to record the reversal.

## ⚠ BLOCKED — the rank-demo photo set

Mike asked to re-tell the demo around "beach" and to source photos from
`/Volumes/t7-2tb/spectrasort-demo-datasets/spectrasort-sim-1k`.

**That dataset cannot be published.** Its filenames are Unsplash photo IDs, and it
derives from the Unsplash Research Dataset sitting beside it. `TERMS.md`:

- **§2.A** — the Lite Dataset licence covers only "internally use the Commercial
  Licensed Data to train machine learning models or algorithms for your internal
  business purposes."
- **§3.A** — "You must not, without Unsplash's written permission: **disclose,
  deliver, disseminate, or publish any portion of the Licensed Data in any manner**."
- **§3.B** — no redistribution, in whole or in part.

Publishing them on spectrasort.app is squarely §3.A. So the demo still shows the old
`"golden hour"` chip and its mixed photo set. Only one of the nine existing photos
(`roll-coast-golden.jpg`) reads as a beach, so the beach story cannot be told with
what is already here.

**The compliant route:** the dataset filenames *are* Unsplash photo IDs, so each maps
to `https://unsplash.com/photos/<id>`, where the same image is available under the
**Unsplash License** — free for commercial use, publishing allowed, no attribution
required. Using the dataset internally to pick IDs and then obtaining the files from
unsplash.com is fine; it is the redistribution of dataset bytes that is not.

**CORRECTION (2026-07-29 night): there is no live-site exposure.** An earlier pass
of this README claimed the nine existing `images/roll/*.jpg` had the same §3.A problem,
reading `v3.2/README.md`'s "nine photos out of `spectrasort-sim-1k`" as a statement of
where the bytes came from. It was a statement of *which photos were chosen*.
`images/roll/CREDITS.txt` — tracked and live — documents that all nine were downloaded
individually from `unsplash.com/photos/<id>/download` under the **Unsplash License**,
lists each photo id and photographer, and carries its own warning never to re-source
them from the dataset for exactly the §3.A reason. The live site is clean, and that
file is the template for how any future demo set should be sourced.

## Fourth review (2026-07-29) — `#why` removed, three-step summary relocated

- **`#why` ("Why not just search?") deleted entirely** — headline, both paragraphs,
  and the interactive rank demo.
- **The Find / Rank / Finish row moved to a new `#how` section directly above
  `#pricing`**, acting as the summary before the price. Given `class="rise"` so it
  shares the raised band with pricing and the two read as one block.
- `.stat` fill changed `--bg-rise` → `--bg-card`. Necessary, not cosmetic: on a
  `rise` section the cards were the exact colour of their own background and
  disappeared. `.stats` is now used only by `#how`, so the change is local in effect.
- **95 lines of dead rank-demo JS removed** from `site.js` (ART / SCORES / ORDERS /
  `applyMode`). Its CSS (`.demo-phone`, `.rank-grid`, `.rank-tile`, `.dchip`,
  `.rank-caption`) is left in `site.css` so restoring it is markup + that block.

**Body copy 778 → 324 words (58% shorter).**

### This resolved the Unsplash blocker for this branch
The rank demo was the only consumer of `images/roll/*.jpg` — the nine
Unsplash-Research-Dataset photos that TERMS.md §3.A forbids publishing. With the demo
gone they were unreferenced, so **`v3.3-video/images/roll/` has been deleted.** This
branch now ships no Licensed Data.

Copies remain in `v3.2/images/roll/` and on the live root, so nothing is
unrecoverable — **and the live-site exposure still stands and still needs a
decision.** See the previous section.

### One consequence worth a decision
`#why` carried the site's sharpest positioning line — *"Search shows you matches.
SpectraSort shows you your best."* That argument now appears **only in the `<meta
name="description">`**, not anywhere a visitor reads. The meta tag is still accurate,
so nothing is broken, but the page no longer makes the case for *why ranking beats
search* in its own words. If that should live on somewhere, the `#how` summary
directly above pricing is the natural host.

## Fifth review (2026-07-29) — review loop opens on the grid; pricing hierarchy reversed

### `web-review-swipe.mp4` — 3.5s → 5.3s, now opens on the ranked grid

The section's first line is **"Best rise to the top"**, but the old cut opened
mid-deck, so nothing on screen justified it. The loop now opens on the Review grid
with its scores descending — **8.4 / 7.5 / 7.4**, then 7.4 / 7.3 / 7.2, down to 6.8 —
holds ~1.7s, visibly begins the tap-zoom, then cuts to the Weimaraner deck.

Timings audited at 0.05s before cutting: grid is clean **10.55–13.77**, the tap
dissolve runs 13.82–13.90, fullscreen settles at 13.92. The grid shot ends at
**13.86** so the first couple of dissolve frames are included — it reads as tapping
in rather than as a jump. Going further would flash photo `11/1708` for a tenth of a
second before the deck cut, which is a glitch, not a transition. Grid runs at 0.7×
(static, so the slowdown is invisible and buys time to actually read a descending
column of scores); the deck stays at 1.0× because a slowed gesture reads as broken.

Two side effects worth knowing:
- **The poster is now the ranked grid**, since posters are frame 1. That is a
  strictly better still for `prefers-reduced-motion` users than the old deck frame.
- **This loop no longer closes where it opens.** `web-hero.mp4` still does; this one
  ends on the deck and restarts on the grid. Deliberate — a hard cut between two
  obviously different screens reads as the demo starting over, and matching the
  copy's order (grid first, then swipe) matters more here than an invisible seam.

Superseded render archived to `out/_archive/pre-grid-open-2026-07-29/`.
Video total now 664 KB.

### Pricing hierarchy reversed

The 124px `$19.99. Once.` was the hero with the CTA tucked underneath — which sells
the number rather than the app. Now: **big gradient "Start free" button**, with the
price as one supporting line beneath it (`$19.99 once.` bolded inside it).

New `.cta-xl` modifier (24px/52px padding, 23px type, with a smaller mobile step) and
a `.price-line` rule. The old `.price-big`, `.price-big .once`, `.pricing-hero .sub`
and `.pricing-hero .fine` rules were **deleted** — verified nothing else on the page
used them.

### Open question for Mike
The `#done` caption still reads *"Two takes, seconds apart. 6.8 and 6.7, one
decision."* It is still true, but it was written when the loop opened on the deck;
now it describes only the second half of a shot that opens on a 12-photo grid. Left
as-is rather than rewritten unasked.

## Sixth review (2026-07-29)

- `#done` `.shot-cap` ("Two takes, seconds apart…") **deleted**. The only `.shot-cap`
  left on the page is the Your Taste one.
- `web-review-swipe.mp4` grid beat **lengthened**: in-point 12.60 → **11.60**, rate
  0.7 → 0.85. Grid now reads for ~2.7s (was ~1.8s). Total 5.3s → **6.17s**, video
  total 668 KB.

### The greyhound thumbnail cannot be revealed — needs a re-shoot

Mike asked for the grid to scroll up so the greyhound's own thumbnail is clearly
visible before we tap into it. **That does not exist in the footage**, for three
independent reasons:

1. **The grid never scrolls.** It is pixel-static for its entire life — verified
   10.32→13.77 at 0.05s intervals, and again across 10.3–13.0 at 0.3s.
2. **The greyhound is the "×2" Similar stack in row 5, and row 5 sits behind the
   app's own Autopick / Batch Process bar.** It is occluded by UI, not merely outside
   the crop, so no pan, crop or `crop_align` change in post can uncover it. You can
   see the clipped ×2 badge at the bottom of the current loop.
3. **By the time the grid comes back (24.4s) the greyhound has been picked** and left
   the queue — that grid shows 6.9 / 6.8 / 6.7 in row 4 and no ×2 stack.

The other raw captures don't help: `v3-2-sort-batch.MP4` is a different library
(basset hounds, 6.5 / 6.4 / 6.2) and also never scrolls, and it contains a Control
Center pull.

**The only real fix is ~3 seconds of fresh device capture:** open this library's
Review grid, scroll down slightly so the ×2 greyhound stack sits mid-screen, then tap
into it. Drop it in `v3-videos-raw/` and this EDL recuts against it in one pass. The
constraint is recorded in the EDL's `grid` shot note so it isn't rediscovered later.

## Seventh review (2026-07-29 night) — review loop re-shot

Mike supplied `ScreenRecording_07-29-2026 22-00-59_1.MP4` (8.1s, 1320×2868, 60fps)
specifically to fix the greyhound-continuity problem. It does.

**`web-review-swipe.mp4` rebuilt from that take alone — 5.73s, 143 KB.** Video total
676 KB.

Now: the Review grid **already scrolled**, with the greyhound's own **"×2" Similar
stack top-left and ring-selected** → the tap into it → the wheel rolling **1 of 2 →
2 of 2** → the pick → settling back. The loop taps into the exact photo it then
swipes, which the previous take could not do at all.

**One continuous shot, no cuts.** It is a single range (0.10 → 5.50) with an internal
speed ramp, so the tap dissolve plays naturally rather than being faked with an edit.
The 0.85× ramp covers only the static grid (shot time 0 → 1.69s); everything from the
dissolve onward runs 1.0×, because a slowed gesture reads as broken. Grid reads for
~2.0s, gesture for ~3.7s.

Edges audited at 0.03s before cutting: grid clean **0.02–1.79**, dissolve **1.82**,
fullscreen settled **1.85**; wheel reaches "2 of 2" ~3.4–4.5; pick lands 4.52–4.62;
settles back to `16/1708` "Similar 1 of 2" from **4.72**, clean to ~5.55. Out at
**5.50** — the next event is a "Kept" transition at 5.62 that would cut mid-animation.

### ⚠ Tradeoff Mike should decide on
**Every tile in this grid reads 6.2.** Scrolling down to where the greyhound lives
lands in a flat stretch of a 1708-photo ranking, so the grid no longer *demonstrates*
"Best rise to the top" — it shows a ranked grid with no visible gradient. The previous
take's grid opened on **8.4 / 7.5 / 7.4 … 6.8**, which did.

Two ways to have both, neither free:
- **Prepend ~1.2s of the old take's grid top** so the descending scores land first,
  then cut to this one. Cost: a jump cut between two takes (both read "To review
  1708 / 0 / 0 / 0", so the state is consistent — it just isn't one continuous
  recording).
- **Re-shoot once more**, scrolling from the top of the grid down to the greyhound in
  a single motion. That gives descending scores *and* continuity in one take, and
  would be the ideal version of this shot.

Shipped as-is for now — continuity was the explicit ask, and the copy still makes the
ranking claim.

## PROMOTED TO ROOT — live 2026-07-29 night

Commit `952e6a4`, pushed to `origin/main`. GitHub Pages serves the root, so
spectrasort.app now runs this version.

Final tweak before promoting: **"Your best photos. Surfaced." → "Found."**, applied to
the `<h1>`, `<title>`, `og:title` and `twitter:title`.

`og:image:alt` was **deliberately left** saying "surfaced" — it describes
`og-image.png`, which still renders the word. Changing the alt would make it
misdescribe the actual image. **`og-image.png` needs regenerating** from
`v3.2/_build/og-image.html` (a static graphic, so it belongs to the other session);
until then link previews on social will read "Surfaced." while the page reads "Found."

Promoted: `index.html`, `assets/site.css`, `assets/site.js`, the three `video/*.mp4`,
the three `images/shots/*-poster.jpg`. `llms.txt`, `sitemap.xml` and `og-image.png`
were already current. `images/roll/` was left in place — properly licensed, and there
if the rank demo ever comes back. The `v3*/` folders including this one are untracked,
so they stay local and are not published.
