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
4. Unit checks for username format and moderation fallback, host election and
   failover, generated tile ids, map-pickup placement, and the minimum-player
   rule.

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
| 11 | Open a third tab mid-match | "Game in progress" gate, then it joins the next arena |
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

## Known limitation

Host election is deterministic per roster + arena bucket, so all clients that
see the same roster agree without extra messaging. If two clients briefly
disagree about the roster during the 800 ms host-assignment window, the first
announced `isHost` claim wins and the other client defers — that is the
reconciliation path to watch during step 2 above.
