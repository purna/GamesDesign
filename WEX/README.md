# ESCG Student Induction Quiz

A client-side, offline-first PWA that delivers the **East Sussex College Group
Student Induction** programme (2026–27) for **Level 3 / T-Level Digital, Media
and Computing students** as a self-paced online experience.

Students pick their **level** (currently **Level 3** — Level 2 and Level 1
are disabled while content is being prepared), then their **year** (Year 1 or
Year 2), and continue straight to a brief
**tutorial** before reaching the **module selection** panel. They work through
**11 modules (A–K)**. Each module follows a short **Learn → Quiz** loop
mirroring the in-class induction sessions. Each module ships with **three
randomised quiz variants (A, B, C)**. The app also keeps a light-touch progress
record keyed by email + level + year when email is collected, or by level + year otherwise.

## Tech Stack

- **HTML5** single-page shell (`index.html`)
- **Vanilla JavaScript (ES6+)** — modularized into `js/*.js`, loaded as plain
  script tags (no bundler)
- **CSS3** — custom-property-based theming with light/dark mode, no CSS
  framework
- **PWA** — installable via `manifest.webmanifest`, service worker caches the
  app shell
- **Firebase JS SDK v9** (compat mode, optional) — Google sign-in, Auth, and
  Firestore sync for results
- **Sortable.js 1.15.0** — drag-order quiz questions
- **No build step required** — serve the folder over HTTP(S) with any static
  server

## Levels

The current Level 3 content is enabled. Level 2 and Level 1 buttons are
disabled in the UI while their content is being prepared. When new levels
are added, enable them in `js/app.js` → `app.renderLevelPicker` and drop
the corresponding data into `data/` and source decks into `_induction/`.

The college email step is controlled by `app.config.REQUIRE_EMAIL` in
`js/app.js` (default: `false`). Set it to `true` to collect and validate
a college email plus consent before continuing.

## Tracks (A / B)

Each year ships **two parallel tracks** — `y1a/` and `y1b/` for Year 1,
`y2a/` and `y2b/` for Year 2. Tracks cover the same modules with the
same A–K mapping, but the wording, examples and slide ordering can
differ. This is intended for split-room delivery: a teacher running
two groups side-by-side can give each group a different track, or you
can use the tracks as alternative forms when re-running induction for
students who missed the first run.

The **track a student is on is chosen once per (level, year), stable
for that student across every visit, and persisted in `localStorage`**
under the key `inductionTrack:{level}:{year}` (e.g.
`inductionTrack:l3:y1` = `a` or `b`). The choice is made on the
student's first visit by hashing their email (so the same email
always lands on the same track on a fresh device), and is then
remembered for every subsequent session. If the key is missing
(e.g. cleared localStorage), the hash is re-applied — same email
always gets the same track.

To change a student's track, clear that key in their browser's
localStorage and reload. To bulk-reset all students' track choices,
remove the `inductionTrack:*` keys (the rest of their progress is in
separate keys and will not be affected).

## User flow

1. **Sign-in / intake** — student picks a **Level** (Level 3 only; Level 2
   and Level 1 are disabled), then a **Year** (Year 1 or Year 2 — hidden for
   single-year levels). If `app.config.REQUIRE_EMAIL` is enabled, they also
   type their college email and tick a consent box.
2. **Tutorial** — a brief how-to screen explains the Learn → Quiz loop and
   navigation.
3. **Module grid** — 11 cards (A–K) for the chosen level + year, with Learn
   / Quiz buttons and completion badges.
4. **Learn** — 4–8 short slides per module with optional multiple-choice,
   fill-in-the-blank and drag-drop exercises.
5. **Quiz** — 6–10 questions, mix of scored / multi-select / insert /
   drag-order, 80 % pass mark, optional 5-minute timer. Each module has
   three randomised variants (**A, B, C**) — the app picks one at the start
   of each attempt.
6. **Review** — score + per-question review; attempt saved to localStorage
   and pushed to Firestore (if Firebase is configured).

## Modules

The module list and titles come from the Level 3 induction decks in
`_induction/l3/y1/` and `_induction/l3/y2/`. A–K are mapped 1:1 to those
PowerPoints.

| ID | Module                                  | Y1 in one line                                                          | Y2 in one line                                              |
| -- | --------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------- |
| A  | Welcome, Belonging & Support            | Settling in, study programme, support services, enrichment              | Welcome back — final year, where you're headed              |
| B  | Confidence & Attendance                 | School → college, the long fuse, attendance case                        | Year 1 → Year 2, the final fuse, Year-2 attendance case     |
| C  | Health & Safety                         | Introduction, basics, subject-specific, noticing & reporting            | Year-2 refresher, familiarity is the risk                  |
| D  | Students' Voice & Student Rep Elections | How student voice works, Rep / Governor roles, election                  | Year-2 view of student voice, leadership roles             |
| E  | Respect, Relationships & College Values | PROUD values, British Values, Equality Act 2010, behaviour standards    | Same content, framed as accountability & consistency        |
| F  | Staying Safe at College                 | Safeguarding, Prevent, online safety, AI & data, reporting              | Year-2 risk profile (FMP, placement, UCAS)                 |
| G  | Looking After Myself (Wellbeing)        | Mental health, stress, sleep, money, support, looking out for others    | Same — Year 2 asks more of you                             |
| H  | How to Use Navigate                     | Skills assessment, next destination, careers, logging, reflection       | Same — refresh and audit your evidence                     |
| I  | Professional Behaviour & Personal Strengths | Standard, attendance, employability, strengths with evidence         | Standard didn't reset, references, application-ready       |
| J  | Work Experience                         | Why it matters, block vs flexible, dates, finding a placement           | Second, sharper placement — same process, higher bar        |
| K  | Progression Opportunities & Setting Goals | Where Level 3 leads, evidence, three horizons, write one goal          | Final year — calendar, deadlines, one dated application goal|

See **`SOURCE_OF_TRUTH.md`** for the full module-by-module map, the data
schemas, the configuration model, and the authoring checklist.

## Project Structure

```
induction/
├── README.md                              ← this file
├── SOURCE_OF_TRUTH.md                     ← authoritative design + authoring docs
├── index.html                             ← single-page shell (all screens live here)
├── styles.css                             ← all styling + light/dark theme tokens
├── sw.js                                  ← service worker (dynamic cache for app shell + data)
├── manifest.webmanifest                   ← PWA manifest
│
├── data/                                  ← induction content (JSON)
│   ├── y1a/  ← L3 Year 1 track A (all 11 modules × {learn, quiz A/B/C})
│   ├── y1b/  ← L3 Year 1 track B (parallel wording/examples for split-room delivery)
│   ├── y2a/  ← L3 Year 2 track A
│   ├── y2b/  ← L3 Year 2 track B
│
├── _induction/                            ← Source markdown decks (authoritative content)
│   ├── Module A.md
│   ├── Module B.md
│   ├── Module C.md
│   ├── Module D.md
│   ├── Module E.md
│   ├── Module F.md
│   ├── Module G.md
│   ├── Module H.md
│   ├── Module I.md
│   ├── Module J.md
│   └── Module K.md
├── js/                                    ← app modules (loaded in order by index.html)
│   ├── firebaseConfig.js                  ← Firebase init + Google sign-in (git-ignored real config)
│   ├── firebase-config.example.js         ← Committed template
│   ├── databaseManager.js                 ← Firestore sync layer
│   ├── classroom.js                       ← Legacy Google Classroom submission (not used by induction)
│   ├── app.js                             ← Root: app.state, app.el, app.config, intake flow, helpers
│   ├── storage.js                         ← localStorage persistence
│   ├── helpers.js                         ← CSS var reader, canvas helpers
│   ├── settings.js                        ← Theme, timer, tutorial, reset progress
│   ├── learn.js                           ← Learn slide rendering + exercises
│   ├── quiz.js                            ← Quiz rendering + scoring (A/B/C variants)
│   ├── results.js                         ← Results screen
│   └── progress.js                        ← Completion badges + overall progress
│
├── functions/                             ← Firebase Cloud Functions (legacy Classroom)
└── plans/                                 ← development notes
```

## Data formats

### Learn file — `data/y{year}{track}/{level}{year}-{module}-learn.json`

The file lives in a per-track folder chosen for the student at
intake — see [Tracks (A / B)](#tracks-a--b) above. Examples:
`data/y1a/l3y1-a-learn.json` (Level 3, Year 1, Module A, track a),
`data/y2b/l3y2-k-learn.json` (Level 3, Year 2, Module K, track b).

```json
{
  "section": "l3y1-a",
  "level": "l3",
  "year": "y1",
  "module": "A",
  "title": "Welcome, Belonging & Support",
  "slides": [
    {
      "title": "What we'll do in this session",
      "content": "There's nothing to revise and nothing to get wrong today.",
      "exercise": {
        "type": "multiplechoice",
        "prompt": "Which of these is part of your study programme?",
        "options": ["Just your lessons", "English & maths (if applicable)", "Industry placement (where relevant)", "Tutorial & personal development", "All of the above"],
        "answer": "All of the above"
      }
    }
  ]
}
```

### Quiz file — `data/y{year}{track}/{level}{year}-{module}-quiz-{A|B|C}.json`

Same per-track routing as the Learn file. Example:
`data/y1a/l3y1-c-quiz-B.json` (Level 3, Year 1, Module C, track a,
quiz variant B).

```json
{
  "meta": {
    "section": "l3y1-a",
    "level": "l3",
    "year": "y1",
    "module": "A",
    "title": "Welcome, Belonging & Support"
  },
  "questions": [
    {
      "id": "l3y1-a-01",
      "type": "scored",
      "prompt": "What is the single biggest factor in whether students stay, attend and succeed?",
      "options": ["Tight deadlines", "Belonging", "High-stakes testing", "Strict uniforms"],
      "answerIndex": 1,
      "explanation": "Belonging is the single biggest factor in whether students stay, attend and succeed."
    }
  ]
}
```

Supported question types for induction content: `scored`, `multi`,
`insert`, `dragorder`. Other types (`typing`, `coderunner`, `visual`,
`pyramid`, `matrix-3x3`, `cluster-missing`, `profiled`) remain supported
by `quiz.js` for the legacy C# practice mode.

See **`SOURCE_OF_TRUTH.md` §6** for the full schema and a complete example
file showing every question type.

## Features

### Learn mode
- Slide-based lessons per module with interactive exercises: multiple
  choice, drag-and-drop, fill-in-the-blank.
- Skip-to-Quiz button on every slide.
- Per-slide "Learned" badge once the slide is read.

### Quiz mode
- 6–10 question quizzes per module, **three randomised variants (A, B, C)**
  — the app picks one at the start of each attempt and uses fallback to
  variant A if B/C are missing.
- Interactive question types: scored, multi-select, insert-the-blank,
  drag-to-reorder.
- Configurable global quiz timer (default 5 min, 0–20 min range).
- 80 % pass threshold with animated results screen.
- Per-question review showing your answer, correct answer, and explanation.

### Progress & evidence
- Per-module completion badges (Learned / Passed / percentage).
- Per-module quiz attempts persisted to localStorage, keyed by module id.
- Optional Firestore sync by signed-in user (email, year, attempts).
- All progress can be reset from Settings → "Reset all progress".

### Settings & accessibility
- Night mode toggle (persisted, respects `prefers-color-scheme`).
- Settings modal for timer configuration and progress reset.
- Fully keyboard navigable.

### Offline-first PWA
- Service worker caches the app shell for offline use.
- Installable on desktop and mobile.

## Getting started

### Running locally

No build step is required. Serve the folder over HTTP(S):

```bash
npx serve .
# or
python3 -m http.server 3000
```

> Google sign-in (the optional Firebase path) requires HTTPS.
> `localhost` is allowed for development.

Open `index.html` in your browser. On first visit you'll be asked to pick
Year 1 or Year 2 and enter your college email; after that the module grid
is your home screen.

### Enabling Firebase (optional)

1. Create a Firebase project and enable Authentication (Google) and
   Firestore.
2. Register a web app and copy the config to `js/firebaseConfig.js`
   (see `js/firebase-config.example.js` for the template).
3. Add your domain to Firebase Auth authorized domains.
4. Deploy Firestore security rules.

Firestore will then receive induction attempts under
`users/{uid}/induction/{profile, results, attempts}`.

## Deploying

**Firebase Hosting:**
```bash
firebase deploy --only hosting
```

**GitHub Pages:**
Push to `main` — the GitHub Actions workflow in
`.github/workflows/static.yml` handles deployment automatically.

## Architecture

The app is built around a single global `app` object. Each module in
`js/` attaches methods and properties to `app`. Load order in
`index.html` is deliberate:

1. Third-party libraries (Sortable.js, Firebase SDK, Google Identity Services)
2. `firebaseConfig.js` — Firebase initialisation and auth
3. `databaseManager.js` — Firestore sync layer
4. `classroom.js` — Legacy Google Classroom submission (kept for back-compat)
5. `app.js` — Root state, DOM element cache, initialisation
6. `storage.js` — localStorage persistence
7. `helpers.js` — Utility functions
8. `settings.js` — Theme, timers, tutorial gate
9. `learn.js` — Learn mode rendering
10. `quiz.js` — Quiz mode rendering and scoring
11. `results.js` — Results screen
12. `progress.js` — Badges and progress bar

State flows through `app.state` for in-memory quiz data and localStorage
for persistence. When Firebase is configured, Firestore acts as a
write-through cache synced after each induction module completion.

## Authoring a new module

For each module `{l1|l2|l3}{y1|y2}-{a..k}`:

1. Drop the PowerPoint into `_induction/{level}/{year}/` (already done for
   Level 3, 2026–27).
2. Pick the 5–8 key slides to adapt into Learn slides.
3. Write `data/{level}{year}-{letter}-learn.json` (e.g. `data/l2y1-c-learn.json`).
4. Write `data/{level}{year}-{letter}-quiz-A.json` with 6–10 questions
   covering the module's takeaways.
5. Write `quiz-B.json` and `quiz-C.json` — variants B and C with reordered
   or reworded questions. Every module ships all three variants and the
   app picks one at random per attempt.
6. Add an entry to `app.config.MODULES` in `js/app.js` (only needed if the
   level / year combination is new).
7. Open the app, pick the right level + year, run through Learn → Quiz
   end to end.

Full step-by-step with file templates is in
**`SOURCE_OF_TRUTH.md` §12**.

