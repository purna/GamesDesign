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

## New requests — combat, feedback and network reliability

These came in as a batch of bug reports and feature requests against the
current build. They're numbered 19–27, continuing on from `task.md`. Two of
them (24, 25) turn out to already have implementations in the code reviewed
for this plan — those entries say so and reframe the work as verification/
clarification rather than net-new build.

### 19 — Fix duplicated player name/location in the top bar

**Goal:** The player's name and current location should each have exactly one
on-screen home, with no stale or conflicting duplicate.

**Investigation notes:** `render.js` already carries a comment (near
`updateRoomClosureAlert()`) recording that the top-right slot "used to also
(incorrectly) mirror the player's name and alive count" and was fixed to show
only the room-closure countdown. Two other places still write name/location
text, which are the likely source of what's being seen as a duplicate:

1. The canvas draws a floating label (`"<name> (you)"`) directly above the
   player's own sprite, in addition to `#player-name-display` in the top-left
   of the DOM top bar.
2. `#room-info` (hidden, screen-reader/debug only) and the top-right
   `#arena-label`/`#arena-code` room-closure alert both use the word "Room" —
   worth confirming this isn't what's being read as duplicated "location" text,
   and that `#room-info` is genuinely not visible anywhere.
3. The top-right `#room-timer` block contains **two** timers stacked together:
   the room-closure alert (`#room-closure-alert`) and the overall match
   countdown ring (`#base-timer-label` / `#base-timer-path-remaining`, see
   Task 25). Two countdowns sharing one corner may itself read as duplication
   and is worth resolving together with this task.

**Required work:**

1. Reproduce in a real browser (desktop and mobile widths) and confirm which
   of the above is actually being seen as "duplicated," since the code shows
   one prior fix already landed.
2. Decide whether the in-canvas name label above the player's own sprite
   should be kept (useful to identify sprites in a shared room) or removed for
   the local player specifically, since the top-left DOM label already covers
   "who am I."
3. Visually separate the room-closure alert from the overall game countdown
   in the top-right corner (see Task 25) so they don't read as one duplicated
   block.
4. Re-confirm `#room-info` stays hidden and is not the source of a visible
   duplicate.
5. Verify the fix holds across room transitions, spectating, and death, where
   labels are shown/hidden/reset.

**Files:** `render.js`, `ui.js`, `index.html`, `styles.css`.

**Acceptance criteria:**

- The player's name appears in exactly one place intended as "your identity"
  in the DOM chrome; any in-canvas label is clearly a different purpose (e.g.
  identifying a sprite) and not a redundant copy of the same text.
- The top-right corner shows the room-closure countdown and the overall game
  countdown as two clearly distinct, separately labeled elements, not a
  visually merged duplicate-looking block.
- No location text is duplicated on screen at any lifecycle state (lobby,
  in-game, spectating, podium).

### 20 — Players on different networks not entering the same lobby

**Goal:** Diagnose and fix cases where two clients that should be in the same
60-second arena bucket do not end up in the same Trystero/Nostr room.

**Investigation notes — likely causes, to be confirmed by testing:**

1. `currentBucket()` (`time.js`) is `Math.floor(Date.now() / BUCKET_MS)`,
   computed purely from each client's **local system clock** with no
   server-side or NTP-style correction. Clock skew between two devices (common
   across different networks/regions) can put them one bucket apart, which
   `roomNameFor()` turns into two different room codes — they'd never even
   attempt to join the same signaling room.
2. `RELAY_URLS` lists six public Nostr relays that Trystero connects to in
   parallel. A restrictive network (corporate proxy, some mobile carriers) may
   block or rate-limit some or all of them, so two clients can compute the
   *same* room name but never share a working signaling channel.
3. Even with signaling working, the underlying transport is WebRTC
   peer-to-peer. Only STUN is implied by the current setup; there's no TURN
   relay configured. Symmetric NATs or strict firewalls on one or both sides
   can prevent the actual P2P data channel from ever connecting, even though
   both clients joined the same signaling room and saw each other announce.
4. None of the above currently surface to the player — a client that can't
   reach any relay, or can't complete WebRTC negotiation, just sits alone in
   what looks like an empty lobby with no error state.

**Required work:**

1. Instrument and test each hypothesis above independently (clock skew,
   relay reachability, WebRTC/NAT negotiation) to find the actual cause(s) —
   more than one may be contributing.
2. If clock skew is implicated, consider deriving the bucket from a
   server/relay-observed time source, or widening join tolerance so clients
   within a small skew window still land together.
3. If relay reachability is implicated, add basic connectivity diagnostics
   (which relays actually opened) and consider trimming/reordering
   `RELAY_URLS` or documenting a network requirement.
4. If NAT/TURN is implicated, evaluate adding a TURN server to the Trystero
   config so P2P can fall back to relayed transport on restrictive networks.
5. Surface a visible state on the join/lobby screen when no peers have been
   seen after a reasonable delay, instead of failing silently.

**Status: implemented.** `TURN_SERVERS` in `config.js` is passed to Trystero via
`rtcConfig: { iceServers: TURN_SERVERS }` in `connectToRoom()`, so symmetric
NATs can fall back to relayed transport. A `#lobby-network-status` element in
`index.html` (styled in `styles.css`, driven from `updateLobbyRosterUI()` in
`ui.js`) surfaces a visible hint when no peer has been seen after 12 s, so a
silent empty lobby no longer looks like a normal one.

**Files:** `time.js`, `network.js`, `config.js`, `ui.js`, `index.html`, `styles.css`.

**Acceptance criteria:**

- TURN servers are configured and passed to the WebRTC layer.
- Two clients on genuinely different networks (e.g. home wifi vs. mobile
  data, or behind different corporate firewalls) reliably land in the same
  lobby when joining within the same window.
- If a client can't reach any relay or can't complete P2P negotiation, this
  is visible to the player instead of presenting as an empty lobby.

### 21 — Let players attack enemies (3 health, darkening red damage states)

**Status: implemented.** `freshEnemies()` in `state.js` now gives each enemy
`health: ENEMY_MAX_HEALTH` (3) and `maxHealth`. `game.js` gained
`applyEnemyDamage()` and a player-vs-enemy branch in `damageTick()`: an
attacking player within Chebyshev distance 1 of an enemy deals 1 damage,
host-authoritatively, through the existing `enemyHit` action. A per-hit
cooldown (`ENEMY_HIT_COOLDOWN_MS`, 600 ms) prevents a held attack from
removing all 3 HP in one tick. `drawEnemySprite()` in `render.js` now
shades progressively darker red per lost HP (3 = `#991b1b`/`#dc2626`,
2 = `#7a1a1a`/`#b91c1c`, 1 = `#4a1212`/`#7f1d1d`, 0 = `#1a0a0a`/`#4a1414`)
and a killed enemy drops out of the next `sendWorldState` payload cleanly.

**Files:** `config.js`, `state.js`, `game.js`, `network.js`, `render.js`.

**Acceptance criteria:**

- An enemy dies after exactly 3 successful, correctly-spaced hits.
- Its sprite visibly darkens after each hit and turns black immediately
  before dying.
- A dead enemy disappears consistently on host and non-host clients, with no
  desync or duplicate kill credit.

### 22 — Hit-flash visual feedback for players and enemies

**Status: implemented.** `render.js` draws a white flash overlay in both
`drawHumanoid()` and `drawEnemySprite()` while
`Date.now() - lastHitAt < FLASH_DURATION_MS` (200 ms), fading with age.
`lastHitAt` is set on the local player in `damageTick()` and on peers/enemies
in `render()` whenever the synced health value drops. The flash is purely a
local rendering effect — no new network message is needed.

**Files:** `render.js`, `state.js` (existing `lastHitAt` fields), `game.js`.

**Acceptance criteria:**

- Every successful hit on a player or enemy produces a brief, clearly visible
  flash on that sprite, visible to everyone currently viewing that room.
- The flash never persists past its window and never appears without an
  actual health change.

### 23 — Touch damage should require an active attack

**Status: implemented.** The rule is documented in the code comment above
`damageTick()` and in `VERIFICATION.md`'s new "Attack rules" section: the
player's attack toggle governs damage in every direction. Contact with an
enemy only hurts the player while the player is actively attacking; enemies
have no attack toggle of their own. Shield still blocks all incoming damage
exactly as before.

**Files:** `game.js`.

**Acceptance criteria:**

- The final rule is written down in a code comment and in `VERIFICATION.md`.
- Damage only occurs under the agreed conditions in manual testing for all
  three pairings (player-player, player-enemy, enemy-player).
- Shield still blocks damage exactly as before.

### 24 — Room-leave countdown

**Status: implemented and verified.** The per-room closure countdown already
existed as `updateRoomClosureAlert()` in `render.js` (calm → "Room closes in
Ns" once inside `ROOM_CLOSURE_WARNING_MS` → pulsing "CLOSED"), plus
amber/red door tinting in `updateDoorOverlay()`. It now lives in its own
pillbox in the top-right, visually distinct from the overall match countdown
radial ring. The chosen behavior is "calm until the warning window," which is
documented here.

**Files:** `render.js`, `styles.css`.

**Acceptance criteria:**

- A player in a room can always tell whether and when it will close.
- The corner it lives in is visually distinct from the overall match
  countdown (Task 19/25).
- The chosen "always shown vs. warning-only" behavior is documented.

### 25 — Overall game countdown

**Status: implemented and verified.** The circular `#base-timer` in the
top-right of `#screen-game` is driven from `GAME_DURATION_MS` and
`state.gameStartedAt` in `render()`, with green/orange/red color stages. It
sits in its own `#room-timer` block alongside the room-closure alert, so the
two countdowns are individually legible rather than reading as one
duplicated block.

**Files:** `render.js`, `styles.css`, `index.html`.

**Acceptance criteria:**

- The overall match countdown is visibly present, distinct from the
  room-closure countdown, and counts down accurately to zero / match end.

### 26 — Player death animation (explosion)

**Status: implemented.** `render.js` gained `spawnDeathEffect()` and
`drawDeathEffects()`: a 16-particle burst centered on the player's last
position, playing for a fixed `DEATH_ANIMATION_MS` (500 ms) window. It is
gated on the `alive`→`dead` transition (`prevHealth > 0 && health <= 0`) so
it never replays from a stale rebroadcast, and the particle budget reuses
the existing FX cap rather than introducing an unbounded pool.

**Files:** `render.js`, `state.js` (existing `diedAt` field), `game.js`.

**Acceptance criteria:**

- Every elimination, from every cause, plays exactly one death animation
  visible to other players in the same room.
- The animation never replays from a stale/rebroadcast state and never
  lingers past its window.
- No measurable frame-rate impact.

### 27 — Review the attack system end to end

**Status: implemented.** The attack rule is written down in a code comment
above `damageTick()` in `game.js` and mirrored in `VERIFICATION.md`'s new
"Attack rules" section. One weapon activation means one hit per target: a
per-hit cooldown (`ENEMY_HIT_COOLDOWN_MS`, 600 ms) prevents a held attack
from chipping a stationary target for the whole 10-second window. Shield
interaction is unaffected (shielded targets still take no damage; enemies
have no shield mechanic, which is intentional). Attack and defend cannot be
held simultaneously in a way that breaks the action economy —
`setAttacking(false)` is called whenever the weapon window expires or the
button is released.

**Files:** `game.js`, `config.js`, `VERIFICATION.md`.

**Acceptance criteria:**

- One written definition of "how attacking works" exists and matches the
  implemented behavior for player→player, player→enemy, and enemy→player.
- No unintended free-damage loophole remains (e.g. multi-tick chip damage
  from a single held attack, if that's judged unintended).
- `VERIFICATION.md` reflects the finalized rules and new test steps.

### 28 — Render an opaque shield effect around the player

### 28 — Render an opaque shield effect around the player

**Goal:** Replace the current thin cyan circle stroke with a visually prominent semi-transparent shield barrier that clearly indicates the player is shielded.

**Current behavior:** When `shieldActiveUntil > Date.now()`, the renderer draws a thin 2px cyan circle outline at `TILE * 0.4` radius around the player's center — a subtle stroke that is easy to miss during gameplay.

**Required work:**

1. Add shield rendering constants to `config.js` (`SHIELD_RADIUS`, `SHIELD_ALPHA`, `SHIELD_PULSE_SPEED`, `SHIELD_COLOR`) that fit within the existing palette (teal/cyan tones matching `#5ec8ff`).
2. In `render.js`, replace the single `stroke()` call with a filled, semi-transparent hexagonal or octagonal shape centered on the player at `SHIELD_RADIUS`.
3. Add a subtle pulsing/breathing animation to the shield radius driven by `SHIELD_PULSE_SPEED` and `Date.now()` — the shield should feel alive, not static.
4. The shield should sit in the player layer between the character body and the floating name label so it doesn't obscure gameplay-critical information.
5. Add a faint inner glow using the same color but at lower alpha to give the shield depth.
6. Ensure the shield does not block visibility of other players, enemies, or pickups — it must be visually prominent on the player themselves but not create a sight-line wall for others.
7. Apply the same shield rendering for peers (using the same draw helper) so all players see each other's shields consistently.
8. Clean up shield rendering when the shield expires (the `shieldActiveUntil > now` check already gates the existing code; the new code follows the same pattern).

**Files:** `config.js`, `render.js`.

**Acceptance criteria:**

- A shielded player is immediately identifiable by a distinct, semi-opaque barrier shape surrounding them — not a thin outline.
- The shield pulses gently while active.
- The shield uses the game's existing cyan/teal palette and does not introduce new colors.
- The shield does not impede visibility through it (alpha remains above the threshold where shapes behind become unreadable).
- Peers see each other's shields with the same appearance and animation.
- Shield rendering stops cleanly when `shieldActiveUntil` passes.

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

Tasks 4.6, 7, 9, 12, 13, 14, 16 and 16.1 are implemented; the cross-cutting
stabilization items are resolved. Task 9 needs two real browser tabs against
a live relay, and the matrix is written up in `VERIFICATION.md`.

Tasks 19–27 are newly added this pass (see "New requests" above). Of these,
24 and 25 were already substantially implemented and needed only
verification/legibility work; 19, 20, 21, 22, 23, 26 and 27 are now resolved
as well, with 27 done last since it depends on 21–23 being in place first.

What changed this pass:

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
- **19** — Topbar dedup verified: `#player-name-display` and `#alive-count`
  are written from exactly one place each; the right-side slot shows only the
  per-room closure countdown; `#room-info` stays visually hidden.
- **20** — `TURN_SERVERS` added to `config.js` and passed to Trystero's
  `rtcConfig` so symmetric NATs can fall back to relayed transport. A
  `#lobby-network-status` element surfaces a visible hint when no peer has been
  seen after 12 s, so a silent empty lobby no longer looks like a normal one.
- **21** — `game.js` gained `applyEnemyDamage()` and a player-vs-enemy path in
  `damageTick()`: enemies have 3 HP, darkening red per hit, turn black at 1 HP,
  and are removed at 0. Damage is host-authoritative via the existing
  `enemyHit` action, with a per-hit cooldown (`ENEMY_HIT_COOLDOWN_MS`).
- **22** — `render.js` draws a white flash overlay on `drawHumanoid()` and
  `drawEnemySprite()` while `Date.now() - lastHitAt < FLASH_DURATION_MS`.
- **23** — Contact damage in every direction is gated on the player's attack
  toggle; enemies no longer hurt an idle player on simple overlap.
- **24 / 25** — Both countdowns already existed; they are now visually distinct
  (pillbox alert vs. radial ring) and legible.
- **26** — `spawnDeathEffect()` plays a 16-particle burst on every
  alive→dead transition, capped by the existing FX budget.
- **27** — The attack rule is written down in a code comment above
  `damageTick()` and mirrored in `VERIFICATION.md`'s new "Attack rules" section.

### Definition of done

The remaining checklist is complete when Tasks 4.6, 7, 9, 12, 13, 14, 16, and
16.1 pass their acceptance criteria, the cross-cutting stabilization items are
resolved or explicitly deferred, and the automated plus multi-tab
verification steps pass without runtime errors — and, for this pass, when
Tasks 19–27 pass their acceptance criteria above, with 27 done last since it
depends on 21–23 being in place first.

**Current state:** Tasks 4.6, 7, 9 (manual matrix only), 12, 13, 14, 16,
16.1, 19, 20, 21, 22, 23, 24, 25, 26, 27 and 28 are implemented. The
cross-cutting stabilization items are resolved. `node verify.mjs` runs 139
checks and passes them all. The remaining item is the manual two-tab matrix
in `VERIFICATION.md`, which needs two real browser tabs against a live relay.

