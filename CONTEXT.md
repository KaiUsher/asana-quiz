# Asana — Project Context

## What it is

A Sanskrit yoga pose memory app built as a static single-page application (no build step, no framework). Users practice recalling Sanskrit names for yoga poses through a spaced repetition quiz system that adapts question difficulty as mastery grows.

Live at: https://kaiusher.github.io/asana-quiz (GitHub Pages)
Repo: https://github.com/KaiUsher/asana-quiz

---

## File structure

```
index.html          — single HTML file, all screens declared in markup
css/styles.css      — all styles
js/poses.js         — POSES array (53 poses, loaded first)
js/insights.js      — INSIGHTS array + recency tracking
js/srs.js           — SM-2 spaced repetition logic
js/streak.js        — daily streak tracking
js/quiz.js          — session building, question types, scoring
js/app.js           — all DOM rendering and event handling
```

Scripts load in order: poses → insights → srs → streak → quiz → app.

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

Each pose has: `id`, `english`, `sanskrit`, `category`, `pronunciation` (syllable-dot format with stressed syllable capitalised), optional `aliases`.

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

Five screens declared in HTML, shown/hidden via `.active` class:

- **Home** (`screen-home`) — mastery fraction + progress bar (mastered/practicing layers), streak row, Begin Practice button, settings panel (category pills only), footer links to glossary and how-it-works
- **Quiz** (`screen-quiz`) — progress bar, question card, options area (varies by type), feedback bar with continue button
- **Insight** (`screen-insight`) — Sanskrit root, meaning, rule line, explanation, pose chips, continue button
- **Result** (`screen-result`) — score, streak, message, dot grid (check/X per question), Practice again / Return home
- **Glossary** (`screen-glossary`) — hint text, poses grouped by category with mastered tick; each row opens the pose card overlay

**Pose card overlay** (not a screen, fixed overlay):
- Nav row: ← BACK → (arrows populated with Phosphor caret SVGs)
- Card: category badge (top), Sanskrit name + pronunciation (middle group, vertically centred), rule line, English name, mastery pip dots (bottom)
- Fixed `min-height: 380px`, `max-width: 360px` to prevent height jumping between cards
- Navigation: prev/next buttons + touch swipe (50px threshold), loops
- Body scroll locked (`overflow: hidden`) while open

---

## Onboarding

Four slides shown on first visit (key `asana_onboarding_seen`):
1. Plant icon — "Questions that grow with you" — explains question type progression
2. Clock icon — "It learns with you" — explains SRS spacing
3. Lightbulb icon — "Pause and reflect" — explains insight cards
4. Flame icon — "Building mastery" — explains the progress bar

Accessible again via "How it works" footer link.

---

## Visual design

Font stack: Cormorant Garamond (serif, for Sanskrit/headings) + Jost (sans, for UI).

CSS custom properties (approximate values):
- `--cream`: warm off-white background
- `--charcoal`: near-black text
- `--ash`: muted mid-grey
- `--mid`: light border/divider colour
- `--ember`: warm orange-red (#c4632e approx) — primary accent, correct states, fills
- `--success`: green — mastered states
- `--success-bg`: light green background

No JavaScript framework. No build step. All icons are inline Phosphor SVGs stored as JS constants in app.js.

---

## Known issues / things flagged in analysis

### UX / gamification gaps

### UX / gamification gaps
- **No mastery moment** — when a pose is first mastered, nothing happens. A brief card between questions would create emotional reward.
- **Streak is underbuilt** — `longestStreak` is stored but never displayed; no milestone acknowledgements; no pull to return tomorrow.
- **Sessions become repetitive at high mastery** — tile-build and type-english dominate; matching-pairs may not trigger if few poses are at level 2+.
- **Home screen stat is passive** — no category-level breakdown, no trajectory, no framing around the goal.
- **Result screen is minimal** — dots are good but no "you struggled most with..." summary; "Practice again" restarts a general session rather than targeting weaknesses.
- **Glossary and practice loop are disconnected** — overdue poses aren't flagged in the glossary; no shortcut from a glossary category to a focused session.
- **No temporal feedback** — no "you've been practicing for X weeks," no week-on-week accuracy trend despite the data existing.

---

## Planned features (not yet built)

### Mastery moment
A full-screen interstitial shown the first time a pose is mastered, between questions. Same pattern as the insight screen.

**Trigger:** In `recordAnswer()` in `quiz.js`, check `isMastered(id)` before calling `updateCard()`, then after. If the state flipped, push the pose ID to `session.newlyMastered`. Multiple can queue up in one session.

**Flow position:** `handleContinue()` currently does: advance → complete? → retries? → insight? → next question. Mastery slots in before insight: advance → complete? → retries? → **mastery?** → insight? → next question.

**Layout (screen-mastery):** Three filled pip dots labelled "Mastered" → Sanskrit name (large Cormorant Garamond) → pronunciation (muted) → rule line → English name → one line of copy from a fixed pool → Continue button.

**Copy pool approach:** Short, past-tense, personal lines (`'Committed to memory.'`, `'This one is yours now.'`, `'Filed away.'`) — same quiet tone as CORRECT_COPY.

**Open question before building:** Does the mastery screen need a category badge? Pure silence vs. the copy pool?

**Files to touch:** `js/quiz.js` (session.newlyMastered, shiftMasteryMoment()), `js/app.js` (renderMastery(), handleContinue() update, continue button), `index.html` (screen-mastery div), `css/styles.css` (styles).

---

## Decisions made / conventions to follow

- **No build step** — keep it plain HTML/CSS/JS, deployable to GitHub Pages by push
- **No frameworks** — vanilla DOM manipulation throughout
- **Inline SVGs** — all Phosphor icons stored as template literal constants in app.js
- **localStorage only** — no backend, no accounts
- **SRS is silent** — the user never sees intervals, ease factors, or scheduling details
- **Retries are invisible** — no visual distinction between retry questions and regular questions
- **Progress bar always moves forward** — denominator grows dynamically, never shrinks
- **`:focus-visible` only** — no sticky focus states on mobile tap (global `button:focus { outline: none }`)
- **`input.blur()` + `window.scrollTo({top:0})`** after type-english submission on mobile
- **min-height: 61px** on tile-build answer container to prevent layout shift
