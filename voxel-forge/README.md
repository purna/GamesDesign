# Voxel Forge — a teaching toy for blockchain basics

A browser game where students **mine** voxel items (cookie-clicker style),
**trade** them peer-to-peer with classmates, and watch every action land on
their own personal **blockchain** — a hash-linked ledger they can inspect,
verify, and (in a safe demo mode) watch break when tampered with.

No build step, no server, no framework. Open `index.html` and it runs.

## Running it

Just open `index.html` in a modern browser (Chrome/Edge/Firefox). For
multiplayer trading to work over the internet (not just two tabs on the
same machine) it needs to be served over `http://` or `https://`, not
`file://` — any static file server works, e.g. from this folder:

```
python3 -m http.server 8000
```
then visit `http://localhost:8000`. For a whole class, host it anywhere
static files work (GitHub Pages, Netlify, a school web server, etc).

## Login

Three options on the landing screen:
- **Guest** — just a name, saved to that browser's local storage. No setup
  needed; this is enough for a single class session.
- **Google** / **GitHub** — real accounts via Firebase Authentication, so a
  student's progress follows them to another device. Requires you to create
  a free Firebase project and paste its config into `js/firebaseConfig.js`
  (instructions are in that file). If you skip this, Guest mode still works
  fully — the buttons will just show a "not configured" error.

## Multiplayer / trading

There's no game server. Two browsers that type the same **classroom code**
into the header connect to each other directly (WebRTC, via the `trystero`
library, using public relays just to introduce peers to each other — no
game data passes through a third party). Give your class one code per
period, e.g. `PERIOD3`.

## How the lesson maps to the code

| Concept | Where |
|---|---|
| Mining / proof-of-work | `js/mining.js` (the clicking) + `js/blockchain.js`'s `mineBlockHash` (the nonce search after) |
| A block | `js/blockchain.js` — `{ index, type, timestamp, data, prevHash, nonce, hash }` |
| The chain link | each block's `prevHash` must equal the previous block's `hash` |
| Tamper-evidence | Ledger tab → **Verify chain** recomputes every hash; **Simulate tampering** breaks one in memory (not saved) so students can watch verification fail |
| Peer-to-peer trade | `js/network.js` (the wire messages) + `js/marketplace.js` (each side only ever writes to their *own* chain) |

This is deliberately a **simplified, single-writer-per-chain** model — each
student has their own chain rather than everyone agreeing on one shared
chain (real blockchains solve that harder problem, called consensus). It's
enough to teach hashing, linking, and immutability without needing any
backend infrastructure. The in-app **"?" button** (top right) has a
student-facing version of this same explanation.

## File map

```
index.html          Page structure (Tailwind CDN + Font Awesome CDN)
css/style.css        Everything Tailwind utilities don't cover
js/config.js          Items, rarities, mining difficulty — tune the game here
js/voxelShapes.js      Procedural voxel silhouettes (pure math, no rendering)
js/voxelRenderer.js    Three.js: live rotating stage + cached 64x64 thumbnails
js/blockchain.js       The Chain class: hashing, linking, validation
js/mining.js            Click-to-mine session logic
js/marketplace.js        Trade offer/accept handshake, writes to the chain
js/network.js             Peer-to-peer classroom connection (trystero)
js/auth.js                 Google / GitHub / Guest login
js/firebaseConfig.js        Your Firebase project keys go here (optional)
js/main.js                   Wires everything to the DOM — the only file that touches it
```

## Adding your own items

Add an entry to `ITEMS` in `js/config.js` — pick a `rarity` (controls mining
difficulty), a `shape` (one of the procedural silhouettes in
`voxelShapes.js`: `cube`, `cluster`, `column`, `slab`, `diamond`, `sphere`,
`star`, `ring`), a `grid` size (voxel resolution), and a `hue` (0–360, the
item's base color). No art tools needed — the shape renders itself.

## Known limitations (worth discussing with students)

- Each student's chain lives in that browser's local storage — clearing
  browser data loses it (there's no backend to restore from).
- Trades are optimistic: if a student closes their tab mid-handshake, their
  partner's side of the trade may not complete. Fine for a classroom demo,
  not fine for anything real.
- The "Simulate tampering" button only mutates the in-memory copy so the
  demo is repeatable — a real attacker editing local storage directly would
  actually corrupt the chain, which **Verify chain** would still catch.
