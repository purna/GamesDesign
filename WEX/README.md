# Race To The Role

A browser-based card-driven prototype game where students collect experience sets
across five esports industry routes and race against AI rivals to meet a target
job's requirements first.

Built for **East Sussex College Group** students in Games Development and
Esports programs. Single HTML shell with vanilla JavaScript — no build step, no
framework, no backend required.

## Quick Start

```bash
# Serve locally (drag-and-drop won't work from file://)
python3 -m http.server 8080 --directory WEX
# Then open: http://localhost:8080
```

## Game Overview

Each round represents part of a student's journey from college towards employment
in the gaming/esports industry. Players choose a target job, then build experience
by collecting and banking card sets:

- **Block Placement** (4 cards: Setup + Action + Proof + Impact)
- **Employer Visit** (2 cards: Setup + Action)
- **Volunteering** (3 cards: Setup + Action + Proof)
- **Live Project Brief** (3 cards: Setup + Action + Proof)
- **Industry Partnership** (4 cards: Setup + Action + Proof + Impact)

**Card types:** Setup (cyan), Action (pink), Proof (gold), Impact (orange),
Wildcard (lime). Each turn you get 2 actions. Each round you may take up to 2
market cards (1 action each) and return up to 2 hand cards to the deck (free).
Events trigger every 3rd round.

**Wildcards** substitute for any missing card type in their assigned route.
"Any route" cards (shown with an accent border) can fill any route's requirement.

## File Structure

```
WEX/
├── index.html              # Game shell — loads js/ scripts via <script defer>
├── styles.css              # Theme variables, layout, typography
├── card-styles.css         # Card visuals, sets, drag-and-drop zones
├── js/
│   ├── game.js             # Core game logic (state, deck, rendering, events)
│   ├── settings.js         # Theme toggle, sound/animations/reset/help
│   └── accessibility.js    # Font sizing, contrast, simple mode
├── data/
│   ├── game-data.json      # Consolidated active data (roles, cards, sets)
│   ├── roles/*.json        # 18 standalone role files
│   └── cards/*.json        # 82 standalone card files
├── _docs/
│   └── SOURCE_OF_TRUTH.md  # Design notes and current state documentation
└── prototype/
    └── race-to-the-role_v1.html  # Original prototype (reference)
```

## Data Layer

- **`data/game-data.json`** — the single source of truth loaded at game start.
  Contains 17 roles, 63 card templates, and 5 set definitions.
- **`data/roles/*.json`** — 18 standalone role files (17 match game-data.json;
  one is an alternate "Gaming Community Assistant" kept for reference).
- **`data/cards/*.json`** — 82 standalone card files mirroring game-data.json,
  plus the 5 group-specific wildcards.

### Role Data Fields

| Field           | Type     | Description                              |
|-----------------|----------|------------------------------------------|
| `id`            | string   | kebab-case identifier                    |
| `title`         | string   | Display name                             |
| `category`      | string   | Career category                          |
| `requirements`  | object   | `experience`, `evidence`, `skill`        |
| `recommendedSets` | array  | Which routes the job fits best           |
| `flavor`        | string   | Quote shown in job modal                 |
| `art`           | string   | Emoji icon                               |
| `rarity`        | string   | Common, Uncommon, or Rare                |
| `stats`         | object   | industryKnowledge, networking, etc      |

### Card Data Fields

| Field          | Type    | Description                          |
|----------------|---------|--------------------------------------|
| `id`           | string  | kebab-case identifier                |
| `name`         | string  | Display name                         |
| `type`         | string  | Setup, Action, Proof, Impact, Wildcard |
| `category`     | string  | Same as `type`                       |
| `description`  | string  | Shown in card preview                |
| `flavor`       | string  | Italic quote                         |
| `rarity`       | string  | Common, Uncommon, Rare               |
| `art`          | string  | Emoji icon                           |
| `set`          | string  | One of: placement, visit, volunteering, brief, partnership, any |
| `value`        | number  | Evidence value when banked (1-2)     |
| `skill`        | string  | Optional — grants this skill when banked |

## Game Logic

### Key Constants
| Constant               | Value | Meaning                           |
|------------------------|-------|-----------------------------------|
| `HAND_CAP`             | 5     | Max hand size                     |
| `ACTIONS_PER_TURN`     | 2     | Actions per turn                  |
| `START_ENERGY`         | 5     | Starting energy                   |
| `MAX_RETURNS_PER_ROUND`| 2     | Cards returned to deck per round  |
| `MAX_MARKET_PIECKS_PER_ROUND` | 2 | Cards taken from market per round |
| `MARKET_SIZE`          | 4     | Visible market cards              |
| `REQUIRED_SET_VARIETY` | 2     | Distinct routes for job application |

### Turn Flow
1. Player spends 2 actions (bank, return, or take market card)
2. End turn — AI rivals take their turns
3. Every 3rd round: event modal (some offer card redraws)
4. Market rotates 2 new cards at round start
5. When deck runs low, reshuffle discard or build fresh supply

### Win Condition
First candidate (player or AI) to meet ALL job requirements:
- Enough completed experience sets
- Evidence points target
- Required skill
- Correct set variety

## Skills System

Each target job requires one specific skill. Skills are gained by banking sets
that include cards with matching `skill` fields. The job needs display shows
which cards provide the required skill when it's missing.

| Skill            | Cards | Routes                            |
|------------------|-------|-----------------------------------|
| Communication    | 6     | brief, partnership, placement, volunteering |
| Teamwork         | 3     | volunteering                     |
| Technical Setup  | 3     | placement, visit                 |
| Organisation     | 3     | partnership, visit, volunteering |
| Coaching         | 3     | brief, placement, volunteering   |
| Analysis         | 3     | partnership, placement, volunteering |
| Problem solving  | 2     | brief, partnership               |
| Design           | 2     | brief, partnership               |

## Development

### Validation
```bash
# JS syntax
node --check js/game.js
node --check js/settings.js
node --check js/accessibility.js

# JSON validation
python3 -c "import json, glob; [json.load(open(f)) for f in glob.glob('data/**/*.json', recursive=True)]; print('All valid')"
```

### Conventions
- Scripts loaded via `<script defer>` — no ES modules
- `window.app` namespace shared between game.js and settings.js
- `window.RTTR` save/load system uses localStorage
- All standalone JSON files must match game-data.json IDs exactly
- See `_docs/SOURCE_OF_TRUTH.md` for full design notes
