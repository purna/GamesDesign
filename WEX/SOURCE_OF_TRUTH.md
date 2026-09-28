# Race To The Role — Source of Truth

## Overview

A card-driven prototype game where students collect experience sets across five
esports industry routes. Each route requires 1-4 card types (Setup, Action,
Proof, Impact). Wildcards substitute for a missing card type — but only within
their assigned route. The first player to meet their target job's requirements
wins.

## File Structure

```
WEX/
├── index.html              # Game shell, loads js/game.js + js/settings.js + js/accessibility.js (all defer)
├── styles.css              # Theme variables, layout, typography
├── card-styles.css         # Card visuals, sets, drag-and-drop zones, modal styles
├── js/
│   ├── game.js             # Core game logic (state, deck, rendering, events)
│   ├── settings.js         # Theme toggle, sound/animations/autodraw/reset/help
│   └── accessibility.js    # Font sizing, contrast, simple mode
├── data/
│   ├── game-data.json      # Consolidated active data (roles, cards, sets)
│   ├── roles/*.json        # 18 standalone role JSON files
│   └── cards/*.json        # 63 standalone card JSON files
└── prototype/
    └── race-to-the-role_v1.html  # Original prototype (reference)
```

## Data Layer

### game-data.json Structure

```jsonc
{
  "roles": [
    {
      "id": "string",
      "title": "string",
      "category": "Career category",
      "description": "string",
      "requirements": {
        "experience": 1|2,          // Sets needed (1=job, 2=job+extra)
        "evidence": 2|3,            // Evidence points needed
        "skill": "one of: Analysis, Communication, Coaching, Design, Organisation, Problem solving, Teamwork, Technical Setup"
      },
      "recommendedSets": ["set-id", ...], // Which routes the job fits
      "flavor": "string",
      "art": "emoji",
      "rarity": "Common|Uncommon|Rare",
      "stats": { industryKnowledge, networking, technicalSkill, creativity, reliability }
    }
  ],
  "cards": [
    {
      "id": "kebab-case-id",
      "name": "Display name",
      "type": "Setup|Action|Proof|Impact|Wildcard",
      "category": "same as type",
      "description": "Shown in card preview",
      "flavor": "Italic quote",
      "rarity": "Common|Uncommon|Rare",
      "art": "emoji",
      "set": "placement|visit|volunteering|brief|partnership|any",
      "value": 1|2,               // Evidence value when banked
      "skill": "optional skill name"  // Grants this skill when banked
    }
  ],
  "sets": [
    {
      "id": "set-id",
      "name": "Display name",
      "art": "emoji",
      "groupSize": 2|3|4,          // Cards needed
      "requiredCategories": ["Setup", "Action", ...],
      "reward": {
        "experience": 1,         // CV experience points
        "evidenceValue": 1|2,     // Evidence gained
        "reference": true|false    // Adds reference
      },
      "why": "..."
    }
  ]
}
```

### Set Routes

| ID          | Name              | Group Size | Required Types       | Wildcard Route(s)      |
|-------------|-------------------|------------|----------------------|------------------------|
| placement   | Block Placement   | 4          | Setup+Action+Proof+Impact | placement (2)        |
| visit       | Employer Visit    | 2          | Setup+Action         | —                      |
| volunteering | Volunteering     | 3          | Setup+Action+Proof   | volunteering (1)      |
| brief       | Live Project Brief| 3          | Setup+Action+Proof   | brief (2)             |
| partnership | Industry Partnership| 4       | Setup+Action+Proof+Impact | —                |

### Wildcard Cards (5 total, each tied to ONE route)

| Card ID              | Route        | Substitutes For        |
|----------------------|--------------|------------------------|
| wild-mentor-advice   | brief        | Any missing type       |
| wild-careers-team    | placement    | Any missing type       |
| wild-card-evidence-boost | placement | Any missing type       |
| wild-card-extra-time | brief        | Any missing type       |
| wild-card-tutor-advice | volunteering | Any missing type     |

**Design note:** Wildcards carry their `set` for display (route-colored border), but
the game logic allows them to substitute for any missing card type in their assigned
route. A "brief" wildcard cannot be used in the placement route.

### Skill Coverage (each skill has ≥2 cards)

| Skill            | Cards | Routes                            |
|------------------|-------|-----------------------------------|
| Communication    | 6     | brief, partnership, placement, volunteering |
| Analysis         | 3     | partnership, placement, volunteering |
| Coaching         | 3     | brief, placement, volunteering    |
| Teamwork         | 3     | volunteering                     |
| Technical Setup  | 3     | placement, visit                 |
| Organisation     | 3     | partnership, visit, volunteering |
| Problem solving  | 2     | brief, partnership               |
| Design           | 2     | brief, partnership               |

### Standalone Files

- `data/cards/*.json` — 63 files, all matching `game-data.json` card IDs
- `data/roles/*.json` — 18 files; 17 match game-data.json IDs (1 standalone alt: `gaming-community-assistant`)

## Game Logic

### Core Constants
- `HAND_CAP = 5` — max hand size
- `ACTIONS_PER_TURN = 2` — actions per turn
- `START_ENERGY = 5` — starting energy
- `MAX_RETURNS_PER_ROUND = 2` — return cards to deck per round (free)
- `MAX_MARKET_PIECKS_PER_ROUND = 2` — take market cards per round (costs 1 action each)
- `MARKET_SIZE = 4` — visible market cards
- `REQUIRED_SET_VARIETY = 2` — distinct routes needed for job application
- Events trigger every 3rd round via `triggerEvent()`

### Key Functions
- `buildDeck()` — 4 copies per route card (split by route+category), 2 copies per wildcard
- `findBank(cards, forcedSet, allowSubset)` — validates if selected cards form a bankable set
- `bankSet(agent, targetSet, used)` — removes cards, grants evidence/skill/references
- `tryFindAnyBank(agent, job)` — AI tries to bank a set using weighted route order
- `pickMarketCardFor(agent, job)` — AI picks the best market card by score
- `leastUsefulCard(agent, job)` — AI picks worst hand card to return

### Player Turn Flow
1. End turn automatically spends remaining actions
2. AI takes 2 actions (bank → return → pick → wait priority)
3. Every 3rd round: event modal with choices (some offer redraws)
4. After round 6: AI checks eligibility and applies

### Win Condition
`eligible(agent, job)` checks:
- `agent.experience >= minimumExperienceForJob(job)` (typically 2-4 sets)
- `completedJobSetTypes(agent, job).size >= REQUIRED_SET_VARIETY` (2 route types)
- `cv.evidence >= job.requirements.evidence` (2-3 evidence)
- `agent.skills.includes(job.requirements.skill)` (job-specific skill)

### UI Interactions
- Click hand cards to select (toggle with border highlight)
- Double-click hand cards to preview
- Click market cards to preview, or drag market cards to hand to take (costs 1 action)
- Drag hand cards to market or return zone to return to deck (free, up to 2/round)
- Click rival cards to view their completed sets and route availability
- Bank button appears when selected cards form a valid set

## Conventions

- Scripts loaded via `<script defer>` (no modules, no bundler)
- `window.app` namespace initialized in `game.js`, shared with `settings.js`
- `window.RTTR` save/load system (localStorage, auto-load on page open)
- `data/game-data.json` is the single source of truth for active game data
- Standalone JSON files in `data/cards/` and `data/roles/` mirror game-data.json for reference

## Validation Procedures

```bash
# JavaScript syntax check
node --check js/game.js
node --check js/settings.js
node --check js/accessibility.js

# Data validation
python3 -c "
import json, glob
for f in glob.glob('data/**/*.json', recursive=True):
    json.load(open(f))
gd = json.load(open('data/game-data.json'))
print(f'Cards: {len(gd[\"cards\"])}, Roles: {len(gd[\"roles\"])}, Sets: {len(gd[\"sets\"])}')
"

# Local server
python3 -m http.server 8080 --directory WEX
```
