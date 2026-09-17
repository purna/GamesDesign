# Verification

## Automated

```bash
node verify.mjs
```

Runs, in order:

1. `node --check` on every module.
2. Import resolution — every `./x.js` specifier exists and actually exports the
   named bindings that are imported from it.
3. DOM cross-reference — every id passed to `getElementById()` in any module
   exists in `index.html`. (This caught a real mismatch: `showPodiumScreen()`
   looked up `podium-copy`, which only existed as a class.)
4. Duplicate top-level declarations — ES modules are strict mode, so a function
   declared twice is a load-time SyntaxError that `node --check` (script mode)
   does not report. This caught a real duplicate in `lms-tiles.js`.
5. Unit checks for username format and moderation fallback, host election,
   rotation, failover and duplicate-host resolution, generated tile ids,
   map-pickup placement and expiry, theme completeness, the minimum-player
   rule, the late-arrival guard, and the layout/lighting constants.

Not automated here: PIXI and Trystero are loaded from CDNs, so the rendering and
networking paths need a real browser. Serve the folder and open it:

```bash
python3 -m http.server 8000   # then http://localhost:8000
```

## Task 9 — multi-tab matrix (manual)

Two tabs must join inside the same 60-second bucket, so start them together.

| # | Step | Expect |
|---|------|--------|
| 1 | Join two tabs with different valid names | Both land in the lobby with the same arena code |
| 2 | Watch host badges | Exactly one HOST pill; both tabs agree on who |
| 3 | Check spawn rooms | Different rooms on the 5×5 grid |
| 4 | Non-host presses Start Now | Button is disabled / labelled "Waiting for host to start…" |
| 5 | Host starts | Both tabs enter the arena on the same timer value |
| 6 | Move one player | Position, facing, health and alive state mirror in the other tab |
| 7 | Pick up weapon / shield / map | Counts sync; map opens the minimap for 10s in the claiming tab only |
| 8 | Attack, defend, walk into an enemy | Health ticks; shield blocks |
| 9 | Walk two players into one room | Third entrant is refused with the room-locked toast |
| 10 | Wait for room closure | Warning band, then elimination for anyone left inside |
| 11 | Open a third tab mid-match | Rejected into spectating: overlay stays up, not in the roster, cannot move — then it plays the next arena |
| 12 | Play to a winner | Same winner and standings on the podium in every tab |
| 13 | Wait out / click Return to Lobby | All tabs reconnect to the next bucket |
| 14 | Close the host tab mid-match | One remaining tab promotes itself; the match keeps running |
| 15 | Play three rounds back to back | The host changes between rounds while ≥2 players are present |
| 16 | Open 13 tabs | The 13th is rejected into spectator mode |

Username cases to try by hand: `nigel` (ok), `red-fox` (ok), `NIGEL` (accepted,
stored as `nigel`), `nigel99` (rejected), `-nigel` / `nigel-` / `a--b`
(rejected), `abcdefghijk` (rejected), empty (rejected), a known profanity
(rejected), and the same with the network blocked in devtools — the local
blocklist still catches the obvious cases and everything else fails open with no
lockout.

## Host handover, in order of precedence

1. **Nomination.** The outgoing host names the next one in the podium message
   (`nextHost`), so rotation survives even a same-bucket restart.
2. **Election.** With no usable nomination (first arena, or the nominee did not
   come back), every client runs the same bucket-keyed election and shifts away
   from the previous host.
3. **Conflict resolution.** If two clients still both claim the role — possible
   when their rosters differed inside the 800 ms assignment window — both run
   `resolveHostConflict()` on the same inputs and exactly one stands down.
4. **Failover.** A host disconnecting mid-round re-runs the election with a
   failover counter; world state is left untouched so the match continues.

Watch steps 2, 14 and 15 of the matrix for all four.

## Layout

The game screen is sized from the viewport (`100dvh`) and the page cannot
scroll. The canvas takes whatever height is left after the top bar, health bar
and controls, and the controls ride over the bottom of the canvas by an amount
that grows as the window shortens: 0 above 800 px, 34 px, 62 px, then 84 px
below 640 px, where the roster panel is also dropped. The overlap covers the
bottom wall course rather than playable floor. Verified headlessly at 1440×900,
1440×780, 1280×620 and 390×760.
