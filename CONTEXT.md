# Asana — Project Context

## What it is

A Sanskrit yoga pose memory app built as a static single-page application (no build step, no framework). Users practice recalling Sanskrit names for yoga poses through a spaced repetition quiz system that adapts question difficulty as mastery grows.

Live at: https://kaiusher.github.io/asana-quiz (GitHub Pages)
Repo: https://github.com/KaiUsher/asana-quiz

---

## File structure

```
index.html                    — single HTML file, all screens declared in markup
manifest.json                 — PWA manifest (name, icons, display mode, scope)
sw.js                         — service worker (cache-first, session-safe update flow)
icons/
  icon-192.png                — PWA icon 192×192 (PersonSimpleTaiChi, ember on cream)
  icon-512.png                — PWA icon 512×512
css/styles.css                — all styles
js/
  poses.js                    — POSES array (58 poses)
  insights.js                 — INSIGHTS array + recency tracking
  srs.js                      — SM-2 spaced repetition logic
  streak.js                   — daily streak tracking
  quiz.js                     — session building, question types, scoring
  icons.js                    — Phosphor SVG icon constants, SLIDES, STREAK_MILESTONE_COPY
  utils.js                    — qs, qsa, showScreen, fuzzyMatch, levenshtein
  onboarding.js               — onboarding carousel (state + render)
  overlay.js                  — pose card overlay (state + render)
  render-home.js              — home screen rendering
  render-glossary-stats.js    — glossary + stats screens
  render-quiz.js              — quiz question setup, startQuiz, handleContinue
  render-results.js           — result/insight/mastery-summary/milestone + end-flow queue
  app.js                      — entry point: app state, event listeners, SW registration
```

All JS is loaded as native ES modules via a single `<script type="module" src="js/app.js">` in index.html. Module imports handle dependency ordering.

---

## Pose library (58 poses)

Categories and counts:
- **Standing** (19): Tadasana, Virabhadrasana I/II/III, Trikonasana, Utthita Parsvakonasana, Vrikshasana, Utkatasana, Uttanasana, Ardha Chandrasana, Garudasana, Viparita Virabhadrasana, Prasarita Padottanasana, Natarajasana, Parsvottanasana, Parivrtta Trikonasana, Anjaneyasana, Parivrtta Parsvakonasana, Parighasana
- **Seated** (11): Dandasana, Paschimottanasana, Sukhasana, Padmasana, Baddha Konasana, Navasana, Virasana, Janu Sirsasana, Gomukhasana, Upavistha Konasana, Marichyasana
- **Supine** (7): Savasana, Ananda Balasana, Setu Bandha Sarvangasana, Supta Baddha Konasana, Matsyasana, Supta Virasana, Supta Padangusthasana
- **Prone** (5): Bhujangasana, Urdhva Mukha Svanasana, Balasana, Salabhasana, Dhanurasana
- **Backbend** (2): Urdhva Dhanurasana, Ustrasana
- **Inversion** (7): Adho Mukha Svanasana, Sirsasana, Sarvangasana, Halasana, Adho Mukha Vrksasana, Pincha Mayurasana, Viparita Karani
- **Twist** (1): Ardha Matsyendrasana
- **Arm Balance** (3): Bakasana, Vasisthasana, Chaturanga Dandasana
- **Hip Opener** (3): Hanumanasana, Malasana, Eka Pada Rajakapotasana

Each pose has: `id`, `english`, `sanskrit`, `category`, `pronunciation` (syllable-dot format with stressed syllable capitalised), `description` (shown on card back), optional `aliases`.

---

## SRS system (srs.js)

SM-2 spaced repetition adapted for mobile sessions. Stored in `localStorage` under `asana_srs_v2`.

Per-card data: `interval`, `easeFactor` (starts 2.5), `repetitions`, `nextReview`, `totalCorrect`, `totalSeen`, `level` (1–3), `mastered`.

**Level progression** (one-way, no regression):
- Level 1 → Level 2 on first correct answer
- Level 2 → Level 3 on next correct
- Level 3 → `mastered: true` on next correct

**Scheduling:** correct answers extend interval (1 day → 6 days → interval × easeFactor); incorrect answers reset to 1 day. easeFactor increases by 0.1 on correct, decreases by 0.2 on incorrect (min 1.3).

Key functions: `getLevel(id)`, `isNew(id)`, `isDue(id)`, `isMastered(id)`, `updateCard(id, grade)`, `getStats()`.

**Data safety:** Never rename or bump these localStorage keys without a migration function. The `Object.assign({}, defaults, stored)` pattern in `getCardData()` handles new fields gracefully — always preserve it.

---

## Question types

Five types, gated by SRS level:

```js
// _questionTypeForLevel(level):
level 1:  80% multiple-choice, 20% flashcard
level 2:  25% multiple-choice, 75% flashcard
level 3:  12% multiple-choice, 23% flashcard, 34.5% tile-build, 30.5% type-english
```

- **multiple-choice** — 4 options, en→sa or sa→en direction (random)
- **flashcard** — flip to reveal, self-grade: "Got it" (correct) or "Still learning" (hard)
- **tile-build** — tap word tiles to assemble the Sanskrit name; per-tile green/red feedback on submit
- **type-english** — shown Sanskrit, type the English name; fuzzy matching with Levenshtein (distance ≤ 1)
- **matching-pairs** — match 4 English names to their Sanskrit; injected once per session if 4+ level-2 poses available

---

## Session structure (quiz.js)

`buildSession(categoryFilter, sessionLength)` — default length 10.

Priority order: due poses → new poses → learned poses. Matching-pairs question injected at a random position.

**Retry queue:** after the main session ends, up to 3 most-recent incorrect answers (with a `pose`) are appended as multiple-choice questions with `isRetry: true`. Retries count toward score and appear in result dots but do not update SRS.

**Progress bar:** denominator is `mainTotal + Math.min(incorrectsSoFar, 3)`, recalculated live — always moves forward, reaches exactly 100% on the final question.

**Insight cards:** one Sanskrit root explainer shown at the session midpoint. Recency-tracked (won't repeat within last 3 sessions). Eligible insights are those whose `poseIds` overlap with the current session's poses.

**Newly mastered tracking:** `session.newlyMastered` array collects pose IDs that transition from `mastered: false` → `true` during the session (checked in `recordAnswer()`). `getNewlyMasteredPoses()` maps these to full pose objects.

**`isSessionActive()`** — returns true while questions exist and session is not complete. Used by the PWA update flow to defer reloads mid-session.

---

## End-session flow

After the last question, `endFlow` is built as a queue of render functions:

1. **Mastery Summary** (`screen-mastery-summary`) — shown if any poses were newly mastered this session. Swipeable cards (one per pose), pip animation on third pip, counter if multiple.
2. **Streak Milestone** (`screen-streak-milestone`) — shown if an unacknowledged streak milestone was reached ([1, 3, 7, 14, 30, 50, 100] days).
3. **Home** — the registered home renderer is called when the queue is exhausted.

`advanceEndFlow()` and the `endFlow` queue live in `render-results.js`. `setHomeRenderer(fn)` is called once at startup (from `app.js`) so `advanceEndFlow` can return home without importing `app.js`.

---

## Insight cards (insights.js)

15 insight cards covering Sanskrit roots:

| ID | Root | Poses covered |
|---|---|---|
| ardha | Ardha (half) | ardha-chandrasana, ardha-matsyendrasana |
| adho-urdhva | Adho & Urdhva (down/up) | adho-mukha, urdhva-mukha, urdhva-dhanurasana, adho-mukha-vrksasana |
| vira | Vira (hero/warrior) | virabhadrasana I/II/III, virasana |
| bala | Bala (child/young) | balasana, ananda-balasana |
| svana-mukha | Svana & Mukha (dog/face) | adho-mukha, urdhva-mukha, gomukhasana |
| asana | Āsana (seat/posture) | all 52 -asana poses |
| baddha-bandha | Baddha/Bandha (bound/lock) | baddha-konasana, setu-bandha, supta-baddha-konasana |
| danda | Danda (staff) | dandasana, chaturanga-dandasana |
| anga | Anga (limb/body) | chaturanga-dandasana, sarvangasana |
| mythic-names | Mythic names | warriors, garudasana, hanumanasana, natarajasana, marichyasana |
| pada | Pada (foot/leg) | prasarita-padottanasana, eka-pada-rajakapotasana, supta-padangusthasana |
| parsva | Parsva (side/flank) | parsvakonasana, parsvottanasana |
| animal-names | Animal names | matsyasana, bhujangasana, salabhasana, bakasana, garudasana, pincha-mayurasana |
| vrksa | Vrksa (tree) | vrikshasana, adho-mukha-vrksasana |
| viparita | Viparita (inverted/reversed) | viparita-virabhadrasana, viparita-karani |

---

## Screens and UI

Eight screens declared in HTML, shown/hidden via `.active` class:

- **Home** (`screen-home`) — mastery fraction + progress bar (mastered/practicing layers), streak row, Begin Practice button, settings panel (category pills + session length), footer links to glossary and how-it-works. Mastery block is tappable → Stats.
- **Quiz** (`screen-quiz`) — progress bar, question card, options area (varies by type), feedback bar with continue button
- **Insight** (`screen-insight`) — Sanskrit root, meaning, rule line, explanation, pose chips, continue button
- **Result** (`screen-result`) — score, streak, dot grid (check/X per question), Practice again / Return home
- **Mastery Summary** (`screen-mastery-summary`) — newly mastered pose cards, swipeable, pip animation, continue button
- **Streak Milestone** (`screen-streak-milestone`) — streak celebration, milestone copy, continue button
- **Glossary** (`screen-glossary`) — poses grouped by category with mastered tick; each row opens the pose card overlay
- **Stats** (`screen-stats`) — mastery overview bar, weakest poses, streak, accuracy, mastery by category

**Pose card overlay** (not a screen, fixed overlay):
- Nav row: ← BACK → (arrows populated with Phosphor caret SVGs)
- Card: category badge (top), Sanskrit name + pronunciation (middle group), rule line, English name, mastery pip dots (bottom), flip hint
- Card flip: tap to flip (if pose has description); back face shows Sanskrit name + description in Cormorant italic
- 3D flip via `transform-style: preserve-3d` / `backface-visibility: hidden` / `rotateY(180deg)` on `.flipped`
- Instant navigation (no flicker): `transition: none` + double rAF to re-enable flip transition after nav
- Opacity must NOT be animated on `.pose-card` itself in Safari — collapses the 3D context
- Fixed `min-height: 380px`, `max-width: 360px` to prevent height jumping between cards
- Navigation: prev/next buttons + touch swipe (50px threshold), loops
- Body scroll locked (`overflow: hidden`) while open

---

## PWA

The app is a fully installable PWA (Add to Home Screen on iOS, install prompt on Android).

**manifest.json** — `display: standalone`, `start_url` and `scope` both `/asana-quiz/`, cream background/theme colour, 192px and 512px icons.

**sw.js** — cache-first serving from `FILES_TO_CACHE`. Update flow:
- New SW installs silently alongside the running SW (no `skipWaiting` in install)
- Page detects `updatefound` → checks `isSessionActive()`
- If not mid-session: fades in the update overlay, sends `SKIP_WAITING` after 300ms
- If mid-session: stores worker in `_pendingWorker`, applied at next `renderHome()` call
- `controllerchange` only triggers `window.location.reload()` when `_swReloadReady` is true (prevents first-install reload)

**IMPORTANT — on every deployment:** bump `CACHE_NAME` in `sw.js` (format: `asana-quiz-YYYYMMDD`, currently `asana-quiz-20260403`). Without this change, already-installed instances won't detect the update. Also ensure `FILES_TO_CACHE` lists all JS module files — adding a new module without adding it here will cause offline failures.

**Update overlay** (`#update-overlay`) — fixed fullscreen, `opacity: 0 / pointer-events: none` by default. Shows "Updating" in Cormorant Garamond italic, `--mid` colour, fades in over 300ms when an update is applying.

**iOS storage note:** the homescreen PWA and Safari have separate localStorage. Students should add to homescreen before building up progress, not after.

---

## Onboarding

Four slides shown on first visit (key `asana_onboarding_seen`):
1. Plant icon — "Questions that grow with you" — explains question type progression
2. Clock icon — "It learns with you" — explains SRS spacing
3. Lightbulb icon — "Pause and reflect" — explains insight cards
4. Brain icon — "Building mastery" — explains the progress bar

Accessible again via "How it works" footer link.

---

## Visual design

Font stack: Cormorant Garamond (serif, for Sanskrit/headings/overlay text) + Jost (sans, for UI).

CSS custom properties:
- `--light: #faf7f2` — page background
- `--cream: #f5f0e8` — card background
- `--charcoal: #1c1a18` — primary text
- `--ash: #8a8278` — muted text
- `--mid: #e8e0d4` — borders, dividers, very subtle text
- `--ember: #c4632e` — primary accent, correct states, icon colour
- `--success: #4a7a5c` — mastered states
- `--success-bg: #eef4f0` — mastered background

No JavaScript framework. No build step. All icons are inline Phosphor SVGs stored as JS constants in `js/icons.js`.

---

## Decisions made / conventions to follow

- **No build step** — keep it plain HTML/CSS/JS, deployable to GitHub Pages by push
- **No frameworks** — vanilla DOM manipulation throughout
- **Inline SVGs** — all Phosphor icons stored as template literal constants in `js/icons.js`
- **localStorage only** — no backend, no accounts
- **Data retention is a hard constraint** — never rename localStorage keys without a migration; never drop the `Object.assign({}, defaults, stored)` pattern in `getCardData()`
- **SRS is silent** — the user never sees intervals, ease factors, or scheduling details
- **Retries are invisible** — no visual distinction between retry questions and regular questions
- **Progress bar always moves forward** — denominator grows dynamically, never shrinks
- **`:focus-visible` only** — no sticky focus states on mobile tap (global `button:focus { outline: none }`)
- **`input.blur()` + `window.scrollTo({top:0})`** after type-english submission on mobile
- **min-height: 61px** on tile-build answer container to prevent layout shift
- **`100dvh` alongside `100vh`** — both set on `body` and `.screen` to fix mobile Safari scroll caused by address bar height
