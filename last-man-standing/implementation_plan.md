# Last Man Standing — Implementation Plan

This document expands the checklist in `task.md` into the current implementation status, the work still required, and the acceptance criteria for each remaining item.

## Current implementation status

### Completed

- **Module structure:** The JavaScript is split into browser ES modules: `config.js`, `state.js`, `room.js`, `room-closure.js`, `time.js`, `lms-tiles.js`, `render.js`, `network.js`, `game.js`, `ui.js`, and `main.js`.
- **Shared configuration:** `config.js` centralizes game constants, room definitions, item/enemy defaults, palette data, timing values, and relay configuration.
- **Lifecycle state machine:** The game now uses `WAITING`, `LOBBY`, `IN_GAME`, `PODIUM`, and the legacy-compatible `GAME_OVER` state. `game.js` controls transitions and `network.js` broadcasts state changes.
- **Timer behavior:** The arena timer pauses while a match is active. The join timer displays `MATCH` during `IN_GAME`, and the match timer is based on `gameStartedAt` rather than the wall-clock bucket.
- **Game-in-progress gate:** New or late-arriving players see the game-in-progress overlay and are held until the next round. Spectator state and the next-round countdown are represented in the UI.
- **Network state:** Player announcements, player state, world state, pickups, spawn assignments, manual starts, and game-state changes are sent through Trystero Nostr actions.
- **Baked room renderer:** `render.js` bakes each 13×13 room into an offscreen canvas through `lms-tiles.js`, converts it to a PIXI texture, and redraws it when the player changes rooms.
- **Tile visuals:** Floor dithering, wall mortar/noise, door styling, pillar support in the renderer, ground cracks, moss, pebbles, rubble, wall torches, glow, and baked ember particles are implemented. Room-type labels and theme palettes also exist in configuration.
- **Characters:** Players use animated humanoid sprites with facing-dependent eyes and per-player colors. Enemies use the armored-soldier sprite style.
- **Podium and restart:** A podium screen shows the winner/standings and provides a return-to-lobby action. The automatic podium timer also returns players to the lobby.
- **Game-screen UI:** The current player's name is shown at the top; health has its own row; inventory is positioned as a right-side overlay and highlights when items are held; room-info text is hidden; the room-timer area shows the player name and players-left count.
- **Winner presentation:** The trophy emoji was replaced with an inline SVG cup icon.
- **Lobby start gate:** `Start Now` is disabled until the current client is host and at least `MIN_PLAYERS_TO_START` (2) players are present.

### Partially complete

- **Task 4 — rich tile renderer:** Tasks 4.1 through 4.5 are complete. Task 4.6 is still pending because the room-theme constants are defined but the tile renderer still primarily uses the generic `LMS_PALETTE`.
- **Task 7 — torch/ambient particles:** Static torch glows and baked embers exist. Runtime flicker and ambient particle animation are not yet implemented.

## Remaining implementation tasks

### 4.6 — Apply room-type theming

**Goal:** Make corner, interior, and spawn rooms visibly distinct while preserving the existing tile style and deterministic baked output.

**Required work:**

1. Add a small room-theme resolver in `lms-tiles.js` (or a dedicated renderer helper) that selects `ROOM_THEMES.corner`, `ROOM_THEMES.interior`, or `ROOM_THEMES.spawn` from the room coordinates.
2. Replace hardcoded floor, wall, mortar, door, pillar, rubble, moss, pebble, and crack colors with values from the selected theme.
3. Keep the theme selection stable for a room so rebaking does not randomly change its appearance.
4. Make corner rooms darker and moodier, interior rooms brighter/warmer, and spawn rooms visually neutral.
5. Verify that the theme is applied on initial load and after every room transition.
6. Confirm that all tile IDs used by `room.js` are exercised by actual room generation. In particular, check whether interior pillars are represented as tile `3` or are currently encoded as wall tile `1`.

**Files:** `config.js`, `room.js`, `lms-tiles.js`, `render.js`.

**Acceptance criteria:**

- Visiting a corner, interior, and spawn room produces three clearly distinguishable palettes.
- The same room looks identical on repeated visits unless the map itself changes.
- Floor/wall/door/pillar/decor details remain readable at the game's pixel-art scale.
- No generic palette values are accidentally left in theme-sensitive drawing paths.

### 7 — Add animated torch and ambient particles

**Goal:** Add lightweight runtime atmosphere without replacing the existing baked room art.

**Required work:**

1. Add a dedicated PIXI particle/lighting layer in `render.js` above the baked map but below or beside character labels as appropriate.
2. Use the existing `DECOR` values (`TORCH_FLICKER_SPEED`, `TORCH_EMBER_LIFETIME_MS`, `AMBIENT_PARTICLE_DENSITY`, and `AMBIENT_PARTICLE_SPEED`) rather than introducing duplicate timing constants.
3. Animate ember particles rising from wall torches with fade-out and slight horizontal drift.
4. Add sparse ambient dust/ash particles across the visible room.
5. Add subtle torch-light intensity flicker, coordinated with the particle layer where practical.
6. Pause or throttle particle updates when the game screen is not active, and cap particle counts for mobile performance.
7. Remove particles cleanly when the renderer is torn down or the room changes.

**Files:** `config.js`, `render.js`, potentially `lms-tiles.js`.

**Acceptance criteria:**

- Torches visibly flicker and emit moving embers.
- Ambient particles are visible but do not obscure players, enemies, pickups, or map details.
- The effect remains smooth during normal movement and room transitions.
- No unbounded particle growth occurs over a long session.

### 9 — Test the multi-tab gameplay flow

**Goal:** Validate that the networked lifecycle works across independent browser tabs and that late arrivals behave correctly.

**Required test matrix:**

1. Open two tabs in the same 60-second arena bucket and join with different valid names.
2. Confirm one tab becomes host, both tabs receive the host assignment, and spawn rooms do not overlap.
3. Confirm the non-host sees the host badge/state correctly and cannot start manually.
4. Start from the lobby and verify both tabs enter `IN_GAME` at the same time with the same start timestamp.
5. Move each player and verify position, health, facing, and alive state propagate to the other tab.
6. Pick up weapon/shield items and verify claims, inventory counts, and respawns are synchronized.
7. Exercise attack, defend, enemy damage, room locking, room closure, elimination, winner detection, and draw behavior.
8. Open a third tab after the match starts and verify it sees the game-in-progress gate, waits for the next round, then joins the new arena.
9. End the match, verify the podium/winner is shared, click or wait through return-to-lobby, and confirm all tabs reconnect to the next bucket.
10. Close the host tab and verify a remaining player is elected host without leaving the game permanently stuck.
11. Test the 12-player cap and verify excess arrivals are rejected or placed into spectator mode consistently.
12. Repeat the critical flow with relay latency/unavailable-relay behavior where practical.

**Files:** Primarily `network.js`, `game.js`, `state.js`, `ui.js`, and `render.js`; no new feature code is required unless tests expose defects.

**Acceptance criteria:**

- All tabs agree on lifecycle state, winner, roster, room assignments, items, and enemies.
- No tab can start a second game while another match is active.
- Late arrivals do not corrupt the active round and automatically enter the next round.
- Host loss has a deterministic and visible failover path.

### 12 — Add a map-tile pickup and 10-second minimap

**Goal:** Let a player pick up a map item that temporarily reveals the 5×5 room grid and all player positions.

**Required work:**

1. Add a `map` item type to `config.js` and include map pickups in `DEFAULT_ITEMS` at one or more intentional locations.
2. Extend pickup/claim handling so map claims are synchronized through the existing host/world-state flow.
3. When the current player claims a map, set `state.mapActiveUntil` using the existing `MAP_DURATION_MS` value and broadcast the activation/claim as needed.
4. Add a minimap overlay to `index.html` and styling in `styles.css`. It should show:
   - the 5×5 room grid and closed-room state;
   - the current player;
   - other alive players, with a clear spectator/eliminated treatment if applicable;
   - a visible remaining-time indicator.
5. Update `render.js` or a dedicated UI module every frame/tick while active, and hide the overlay automatically when `Date.now()` reaches `mapActiveUntil`.
6. Ensure the minimap does not reveal more than the requested player positions and does not remain active after death, round end, or room rotation.
7. Add a small inventory indicator for the map item if the player can hold it before activation; otherwise document that pickup activates immediately.

**Files:** `config.js`, `state.js`, `game.js`, `network.js`, `render.js`, `index.html`, `styles.css`.

**Acceptance criteria:**

- A map pickup is visible and can be claimed by stepping onto its tile.
- The minimap appears for exactly 10 seconds and then disappears.
- All current players are represented at the correct room coordinates during the active window.
- Closed rooms and room boundaries are understandable at a glance.
- The feature works for host and non-host clients and survives normal network updates.

### 13 — Add player torch light and scene vignette

**Goal:** Give each player a local torch-lit area and a darker vignette around the visible room.

**Required work:**

1. Add a lighting/vignette layer in `render.js` that follows the current player's rendered position.
2. Draw a dark overlay over the room with a radial cutout or gradient around the player torch.
3. Add subtle flicker tied to the animated torch effect from Task 7, while keeping the player and nearby hazards readable.
4. Decide and document how the effect behaves for spectators, dead players, and the minimap overlay; the lighting must not hide the minimap or essential UI.
5. Keep the implementation compatible with the existing PIXI 8 renderer and mobile-sized canvas.
6. Tune opacity, radius, and blend behavior so the vignette is atmospheric rather than obscuring gameplay.

**Files:** `render.js`, `styles.css` if any DOM fallback is needed.

**Acceptance criteria:**

- The current player has a visible warm light radius that follows movement.
- Areas outside the radius are visibly darker.
- Players, enemies, pickups, doors, and room-closure warnings remain playable.
- The effect does not cause a noticeable frame-rate regression.

### 14 — Select a new host for each game

**Goal:** Rotate host responsibility between rounds instead of always retaining the first/lowest-ID host.

**Required work:**

1. Define a deterministic election rule using the active roster and round/bucket identity, for example: choose the next eligible player after `lastHostId` in sorted peer-ID order.
2. Use the existing `hostId`, `lastHostId`, and `roundId` state fields, or replace them with a clearly named equivalent if the implementation is redesigned.
3. Elect and broadcast the host when a new arena/round begins, not only when a peer disconnects.
4. Ensure the elected host initializes fresh items/enemies, assigns spawn rooms, and owns world-state/pickup authority for that round.
5. Update lobby/host badges and the `Start Now` permission after election.
6. Preserve failover when the host leaves or becomes inactive; failover must not reset a game that is already in progress.
7. Avoid repeatedly selecting the same host when two or more eligible players are available.

**Files:** `state.js`, `network.js`, `game.js`, `ui.js`.

**Acceptance criteria:**

- Each new round has exactly one authoritative host.
- The host changes between rounds when there are multiple eligible players.
- All clients agree on who is host.
- Host loss during a round produces one replacement without duplicate hosts or lost world state.

### 16 — Validate usernames with a profanity filter

**Goal:** Prevent inappropriate names before a player enters an arena.

**Required work:**

1. Select one of the requested providers: `profanity.dev` or the user-provided PurgoMalum endpoint. Prefer the provider that can be used without exposing a secret or requiring an unmanaged browser-only credential.
2. Add an asynchronous validation step in `main.js` before `connectToRoom()` is called.
3. Send only the trimmed username, with a timeout and a safe local fallback if the service is unavailable.
4. Show a specific, accessible error message when a name is rejected; do not join the room or broadcast the rejected name.
5. Reuse the validation result during reconnect/rejoin where appropriate, but revalidate if the user changes the name.
6. Keep validation client-side only unless a server-side trust boundary is added later; peers should still ignore malformed or rejected names.

**Files:** `main.js`, `ui.js`, potentially a new small validation module and `config.js`.

**Acceptance criteria:**

- Known inappropriate test names are rejected consistently.
- Valid names join without a noticeable delay or false positive.
- Service failure does not permanently lock the player out; the fallback behavior is explicit and safe.
- The UI explains why entry was blocked.

### 16.1 — Enforce the 10-character username format

**Goal:** Restrict usernames to the requested character set and length before moderation or network entry.

**Required work:**

1. Change `MAX_NAME_LENGTH` from 14 to 10.
2. Change the username input's `maxlength` from 14 to 10.
3. Validate the trimmed value with a lowercase ASCII pattern such as `/^[a-z-]{1,10}$/` (or a stricter variant that rejects leading, trailing, or repeated hyphens if that is the intended product rule).
4. Normalize or reject uppercase input consistently; do not silently create two visually different identities.
5. Apply the same validation on reconnect and before broadcasting the name, not only in the initial click handler.
6. Update placeholder/help text and error messaging to state the allowed format.

**Files:** `config.js`, `main.js`, `index.html`, `ui.js`.

**Acceptance criteria:**

- Names longer than 10 characters are rejected or truncated according to the documented rule.
- Characters outside `a-z` and `-` are rejected.
- Empty names remain rejected.
- All clients display the same canonical name.

## Cross-cutting stabilization before completion

These items are not separate numbered tasks in `task.md`, but they should be resolved while finishing the remaining work:

- Reconcile the legacy `GAME_OVER` path with the active `PODIUM` flow so lifecycle transitions have one clear owner and tests do not need to support contradictory behavior.
- Enforce the minimum-player rule inside `startGame()` as well as disabling the button in `updateLobbyRosterUI()`.
- Decide whether the current hidden `room-info` DOM updates are needed; remove them if they are purely legacy, or retain them as an accessibility/debug source.
- Confirm door and pillar tile IDs are generated and rendered in real rooms, not only supported by the tile-drawing function.
- Remove or intentionally use stale state fields such as `inLobbyPhase`, `hostId`, `lastHostId`, `roundId`, and `mapActiveUntil` as their corresponding features are completed.
- Run syntax checks and browser smoke tests after each feature group, then run the multi-tab matrix in Task 9.

## Verification plan

### Automated checks

- Run `node --check` against every JavaScript module.
- Load `index.html` through a local static server and verify all module imports resolve.
- Smoke-test the join, lobby, game, podium, inventory, timer, and restart DOM states in a browser automation script.
- Add focused tests or assertions for username format/moderation, host election, minimap expiry, and minimum-player start behavior if a test framework is introduced.

### Manual/browser checks

- Verify the three room themes and particle/lighting effects on desktop and mobile-sized viewports.
- Run the complete two-tab and late-arrival flow from Task 9.
- Verify the minimap for 10 seconds and confirm it disappears without leaving an overlay or timer behind.
- Verify host rotation across at least three consecutive rounds and host-disconnect failover.
- Verify invalid, inappropriate, overlong, and service-unavailable username cases.

## Status — this pass

Tasks 4.6, 7, 12, 13, 14, 16 and 16.1 are implemented; the cross-cutting
stabilization items are resolved. Task 9 is the only item left open: it needs
two real browser tabs against a live relay, and the matrix is written up in
`VERIFICATION.md`.

What changed:

- **4.6** — `lms-tiles.js` now takes a theme from `ROOM_THEMES` (via
  `resolveTheme()`) and every floor/wall/door/pillar/decor colour reads from it.
  `room.js` emits real door (`2`) and pillar (`3`) tile ids, and movement uses
  `isSolidTile()` instead of comparing against `1`, so pillars still block.
- **7** — `render.js` gained an `fxLayer`: rising embers seeded from
  `getTorchPlacements()`, drifting ambient motes, and torch-glow pulses driven
  by `DECOR.TORCH_FLICKER_SPEED` / `TORCH_EMBER_LIFETIME_MS` /
  `AMBIENT_PARTICLE_*`. Counts are capped by `FX.MAX_EMBERS` / `MAX_AMBIENT`,
  particles reset on every room change, and updates stop while the game screen
  is hidden.
- **12** — `map` items in `DEFAULT_ITEMS`, claimed through the existing host
  pickup flow; claiming sets `state.mapActiveUntil` and opens a DOM minimap that
  shows the 5×5 grid, closed rooms, occupant counts and a countdown bar. It
  clears on expiry, death, podium and round reset. Pickup activates immediately;
  the inventory panel shows the remaining seconds.
- **13** — A lighting layer between the world and the door/player layers: a
  radial vignette plus an additive warm torch light that follows the player and
  flickers with the particle phase. Spectators and eliminated players see the
  room unlit so they can still follow the match.
- **14** — `host.js` elects the host deterministically from the sorted roster
  keyed on the arena bucket, so the host rotates between rounds and every client
  reaches the same answer. Disconnects run the same rule with a failover
  counter, and a mid-round failover leaves items and enemies untouched.
- **16 / 16.1** — `username.js` enforces `/^[a-z]+(?:-[a-z]+)*$/` at 10
  characters, normalizes case, then asks PurgoMalum with a 2.5 s timeout and
  falls back to a small local blocklist. Names are revalidated on reconnect and
  peers ignore malformed announcements.

### Definition of done

The remaining checklist is complete when Tasks 4.6, 7, 9, 12, 13, 14, 16, and 16.1 pass their acceptance criteria, the cross-cutting stabilization items are resolved or explicitly deferred, and the automated plus multi-tab verification steps pass without runtime errors.

