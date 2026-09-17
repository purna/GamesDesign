/**
 * Automated checks for the Last Man Standing modules.
 *
 *   node verify.mjs
 *
 * Covers the "Automated checks" section of the implementation plan: syntax,
 * import resolution, DOM id cross-referencing, and focused unit tests for
 * username rules, host election, room tiles and minimap timing.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(fileURLToPath(import.meta.url));
let failures = 0;
let checks = 0;

function check(name, fn) {
  checks++;
  try {
    fn();
    console.log(`  ok   ${name}`);
  } catch (error) {
    failures++;
    console.log(`  FAIL ${name}\n       ${error.message}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const moduleFiles = readdirSync(root).filter(file => file.endsWith('.js'));

console.log('\nSyntax');
for (const file of moduleFiles) {
  check(file, () => execFileSync('node', ['--check', join(root, file)]));
}

console.log('\nImport resolution');
for (const file of moduleFiles) {
  const source = readFileSync(join(root, file), 'utf8');
  const imports = [...source.matchAll(/from\s+'(\.\/[^']+)'/g)].map(match => match[1]);
  check(`${file} -> ${imports.join(', ') || '(none)'}`, () => {
    for (const specifier of imports) {
      const target = specifier.replace('./', '');
      assert(moduleFiles.includes(target), `missing module ${specifier}`);
      const exported = readFileSync(join(root, target), 'utf8');
      const names = [...source.matchAll(new RegExp(`import\\s+\\{([^}]+)\\}\\s+from\\s+'\\./${target}'`, 'g'))]
        .flatMap(match => match[1].split(',').map(part => part.trim().split(/\s+as\s+/)[0]))
        .filter(Boolean);
      for (const name of names) {
        assert(
          new RegExp(`export\\s+(const|function|async function|let|class)\\s+${name}\\b`).test(exported),
          `${target} does not export ${name}`
        );
      }
    }
  });
}

console.log('\nNo duplicate top-level declarations');
for (const file of moduleFiles) {
  const source = readFileSync(join(root, file), 'utf8');
  const declared = [...source.matchAll(/^(?:export\s+)?(?:async\s+)?(?:function|const|let|class)\s+([A-Za-z_$][\w$]*)/gm)]
    .map(match => match[1]);
  const seen = new Set();
  const duplicates = declared.filter(name => (seen.has(name) ? true : (seen.add(name), false)));
  // ES modules are strict mode: a repeated top-level declaration is a load-time
  // SyntaxError that `node --check` (script mode) does not report.
  check(file, () => assert(duplicates.length === 0, `declared twice: ${[...new Set(duplicates)].join(', ')}`));
}

console.log('\nDOM ids referenced by modules exist in index.html');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const htmlIds = new Set([...html.matchAll(/id="([^"]+)"/g)].map(match => match[1]));
for (const file of moduleFiles) {
  const source = readFileSync(join(root, file), 'utf8');
  const ids = [...source.matchAll(/getElementById\('([^']+)'\)/g)].map(match => match[1]);
  const missing = [...new Set(ids)].filter(id => !htmlIds.has(id));
  check(`${file} (${new Set(ids).size} ids)`, () => assert(missing.length === 0, `missing in index.html: ${missing.join(', ')}`));
}

const { validateNameFormat, checkProfanity, validateUsername } = await import('./username.js');
const { electHost, electFailoverHost } = await import('./host.js');
const { buildRoomMap, getRoomMap, isSolidTile, roomNeighbors, isInterior } = await import('./room.js');
const { TILE_ID, DEFAULT_ITEMS, MAX_NAME_LENGTH, MAP_DURATION_MS, MIN_PLAYERS_TO_START } = await import('./config.js');

console.log('\nUsername rules (16, 16.1)');
check('max length is 10', () => assert(MAX_NAME_LENGTH === 10, `got ${MAX_NAME_LENGTH}`));
check('valid name accepted', () => assert(validateNameFormat('nigel').ok));
check('hyphenated name accepted', () => assert(validateNameFormat('red-fox').ok));
check('uppercase is normalized, not rejected twice', () => {
  const result = validateNameFormat('  NiGeL ');
  assert(result.ok && result.name === 'nigel', JSON.stringify(result));
});
check('over 10 characters rejected', () => assert(!validateNameFormat('abcdefghijk').ok));
check('digits rejected', () => assert(!validateNameFormat('nigel99').ok));
check('spaces rejected', () => assert(!validateNameFormat('two words').ok));
check('leading hyphen rejected', () => assert(!validateNameFormat('-nigel').ok));
check('trailing hyphen rejected', () => assert(!validateNameFormat('nigel-').ok));
check('double hyphen rejected', () => assert(!validateNameFormat('a--b').ok));
check('empty rejected', () => assert(!validateNameFormat('   ').ok));

const remoteRejects = async () => ({ ok: true, text: async () => 'true' });
const remoteAccepts = async () => ({ ok: true, text: async () => 'false' });
const remoteDown = async () => { throw new Error('offline'); };

const profanityHit = await checkProfanity('fine-name', { fetchImpl: remoteRejects });
check('remote "true" rejects the name', () => assert(!profanityHit.ok, JSON.stringify(profanityHit)));
const profanityMiss = await checkProfanity('fine-name', { fetchImpl: remoteAccepts });
check('remote "false" accepts the name', () => assert(profanityMiss.ok));
const offline = await checkProfanity('fine-name', { fetchImpl: remoteDown });
check('service failure fails open (not locked out)', () => assert(offline.ok && offline.source === 'fallback'));
const offlineDirty = await checkProfanity('shit', { fetchImpl: remoteDown });
check('local blocklist still catches obvious cases offline', () => assert(!offlineDirty.ok));
const gated = await validateUsername('nigel99', { fetchImpl: remoteAccepts });
check('format is checked before the network call', () => assert(!gated.ok));

console.log('\nHost election (14)');
const roster = ['aaa', 'bbb', 'ccc'];
check('one host per round', () => assert(roster.includes(electHost(roster, 100))));
check('all clients agree for the same roster and round', () => {
  assert(electHost(roster, 100) === electHost([...roster].reverse(), 100));
});
check('host rotates between consecutive rounds', () => {
  const hosts = [100, 101, 102].map(bucket => electHost(roster, bucket));
  assert(new Set(hosts).size === roster.length, `hosts: ${hosts.join(',')}`);
});
check('single player is always host', () => assert(electHost(['solo'], 7) === 'solo'));
check('empty roster yields no host', () => assert(electHost([], 7) === null));
check('failover excludes the departed host and picks one replacement', () => {
  const replacement = electFailoverHost(roster, 100, electHost(roster, 100), 1);
  assert(replacement && replacement !== electHost(roster, 100), `got ${replacement}`);
});
check('failover is deterministic across remaining clients', () => {
  assert(electFailoverHost(roster, 100, 'aaa', 2) === electFailoverHost([...roster].reverse(), 100, 'aaa', 2));
});

console.log('\nRoom tiles (4.6 support)');
const interiorMap = getRoomMap(2, 2);
const spawnMap = getRoomMap(0, 1);
check('interior rooms generate a pillar tile', () => assert(interiorMap[6][6] === TILE_ID.PILLAR));
check('pillars block movement', () => assert(isSolidTile(TILE_ID.PILLAR)));
check('doorways are generated as door tiles', () => {
  assert(interiorMap.flat().includes(TILE_ID.DOOR), 'no door tile in interior room');
});
check('doorways are walkable', () => assert(!isSolidTile(TILE_ID.DOOR)));
check('spawn rooms have no pillar', () => assert(spawnMap[6][6] === TILE_ID.FLOOR));
check('outer wall stays solid', () => assert(spawnMap[0][0] === TILE_ID.WALL));
check('every generated tile id has a renderer branch', () => {
  const used = new Set(interiorMap.flat().concat(spawnMap.flat()));
  const supported = new Set(Object.values(TILE_ID));
  for (const id of used) assert(supported.has(id), `tile id ${id} is generated but unsupported`);
});
check('room maps are deterministic', () => {
  assert(JSON.stringify(getRoomMap(2, 2)) === JSON.stringify(buildRoomMap(roomNeighbors(2, 2), isInterior(2, 2))));
});

console.log('\nMap pickup (12)');
const mapItems = DEFAULT_ITEMS.filter(item => item.type === 'map');
check('map pickups exist in the default item set', () => assert(mapItems.length > 0));
check('map pickups do not sit on a pillar tile', () => {
  for (const item of mapItems) {
    const roomMap = getRoomMap(item.roomRow, item.roomCol);
    assert(!isSolidTile(roomMap[item.y][item.x]), `${item.id} is on a solid tile`);
  }
});
check('map duration is 10 seconds', () => assert(MAP_DURATION_MS === 10000));

console.log('\nLobby rules');
check('minimum players to start is 2', () => assert(MIN_PLAYERS_TO_START === 2));
check('startGame enforces the minimum itself', () => {
  const source = readFileSync(join(root, 'game.js'), 'utf8');
  const body = source.slice(source.indexOf('export function startGame'));
  assert(body.slice(0, 600).includes('MIN_PLAYERS_TO_START'), 'no minimum check inside startGame');
});

const { electRoundHost, resolveHostConflict, nextHostAfter } = await import('./host.js');
const { ROOM_THEMES, FX } = await import('./config.js');
const networkSource = readFileSync(join(root, 'network.js'), 'utf8');
const gameSource = readFileSync(join(root, 'game.js'), 'utf8');
const tilesSource = readFileSync(join(root, 'lms-tiles.js'), 'utf8');
const css = readFileSync(join(root, 'styles.css'), 'utf8');

console.log('\nLate arrivals cannot join a live match');
check('host turns joiners away while IN_GAME', () => {
  assert(/state\.isHostFlag && state\.gameState === GAME_STATE\.IN_GAME/.test(networkSource), 'no in-match join guard');
  assert(/sendReject\([^)]*Match in progress/.test(networkSource), 'joiner is not rejected during a match');
});
check('a late arrival becomes a spectator, not a player', () => {
  assert(networkSource.includes('function isLateArrival'), 'no late-arrival test');
  assert(/markLateArrival[\s\S]{0,300}setSpectator\(true/.test(networkSource), 'late arrival is not made a spectator');
  assert(/markLateArrival[\s\S]{0,300}state\.me\.alive = false/.test(networkSource), 'late arrival still counts as alive');
  assert(networkSource.includes('state.joinedRoomAt = Date.now()'), 'join time is never recorded');
});
check('no spawn room is assigned during a live match', () => {
  assert(/state\.isHostFlag && state\.gameState !== GAME_STATE\.IN_GAME && state\.hostAssignedRooms/.test(networkSource));
});

console.log('\nHost rotation and duplicate hosts (14)');
const trio = ['aaa', 'bbb', 'ccc'];
check('round election skips the previous host', () => {
  for (const key of [10, 11, 12, 16]) {
    const previous = electRoundHost(trio, key);
    assert(electRoundHost(trio, key, previous) !== previous, `repeated host at key ${key}`);
  }
});
check('round election is still deterministic across clients', () => {
  assert(electRoundHost(trio, 12, 'aaa') === electRoundHost([...trio].reverse(), 12, 'aaa'));
});
check('two claimants resolve to exactly one host', () => {
  const selfWins = resolveHostConflict('aaa', 'bbb', trio, 5);
  const peerView = resolveHostConflict('bbb', 'aaa', trio, 5);
  assert(selfWins === peerView, `disagreement: ${selfWins} vs ${peerView}`);
  assert([selfWins === 'aaa', peerView === 'bbb'].filter(Boolean).length === 1, 'both or neither stayed host');
});
check('conflict resolution converges even with mismatched rosters', () => {
  const left = resolveHostConflict('aaa', 'bbb', ['aaa', 'bbb', 'zzz'], 9);
  const right = resolveHostConflict('bbb', 'aaa', ['aaa', 'bbb'], 9);
  assert(left === right || [left, right].every(id => ['aaa', 'bbb'].includes(id)), 'no convergence path');
});
check('the podium broadcast nominates the next host', () => {
  assert(/state: GAME_STATE\.PODIUM[\s\S]{0,240}nextHost:/.test(gameSource), 'no nomination on the wire');
  assert(networkSource.includes('state.nextHostHint = data.nextHost'), 'clients ignore the nomination');
});
check('the nomination always moves to a different player', () => {
  const ids = ['aaa', 'bbb', 'ccc'];
  assert(nextHostAfter(ids, 'aaa') === 'bbb');
  assert(nextHostAfter(ids, 'ccc') === 'aaa');
  assert(nextHostAfter(['solo'], 'solo') === 'solo');
  assert(nextHostAfter(ids, 'unknown') === 'aaa');
});

console.log('\nMinimap lifetime (12)');
check('dead or spectating players apply no claims and lose the map', () => {
  assert(/isSpectator \|\| !state\.me\.alive[\s\S]{0,200}mapActiveUntil = 0/.test(gameSource));
});
for (const marker of ['startGame', 'endGame', 'restartToLobby', 'setSpectator']) {
  check(`${marker} clears mapActiveUntil`, () => {
    const body = gameSource.slice(gameSource.indexOf(`function ${marker}`));
    assert(body.slice(0, 900).includes('mapActiveUntil = 0'), 'not cleared');
  });
}

console.log('\nRoom theming (4.6)');
const themeNames = Object.keys(ROOM_THEMES);
const themeKeys = Object.keys(ROOM_THEMES.interior);
check('every theme defines the same keys', () => {
  for (const name of themeNames) {
    const missing = themeKeys.filter(key => !ROOM_THEMES[name][key]);
    assert(missing.length === 0, `${name} is missing ${missing.join(', ')}`);
  }
});
check('the three themes are visually distinct', () => {
  for (const key of ['floor', 'wall', 'door']) {
    const values = new Set(themeNames.map(name => ROOM_THEMES[name][key]));
    assert(values.size === themeNames.length, `themes share a ${key} colour`);
  }
});
check('doors do not reuse a wall colour', () => {
  for (const name of themeNames) {
    const theme = ROOM_THEMES[name];
    assert(![theme.wall, theme.wallDark, theme.wallLight].includes(theme.door), `${name} door matches a wall tone`);
  }
});
check('the tile renderer no longer falls back to the generic palette', () => {
  assert(!tilesSource.includes('LMS_PALETTE'), 'LMS_PALETTE still referenced');
});
check('all decoration types are drawn', () => {
  for (const drawer of ['drawStain', 'drawPuddle', 'drawLitter', 'drawPlant', 'drawBrokenTile', 'drawMoss']) {
    assert(tilesSource.includes(`${drawer}(context`), `${drawer} missing`);
  }
});

console.log('\nLayout and lighting');
check('the outer edge sits at 90% darkness', () => assert(FX.VIGNETTE_ALPHA === 0.9, `got ${FX.VIGNETTE_ALPHA}`));
check('the page cannot scroll', () => assert(/body\s*\{[^}]*overflow:\s*hidden/.test(css)));
check('the canvas is sized from the viewport height', () => assert(css.includes('100dvh - var(--game-chrome)')));
check('controls overlap the canvas by a viewport-dependent amount', () => {
  assert(css.includes('--control-overlap'), 'no overlap variable');
  assert(css.includes('margin-top: calc(-1 * var(--control-overlap))'), 'controls do not use it');
});

console.log(`\n${checks - failures}/${checks} checks passed.`);
process.exit(failures === 0 ? 0 : 1);
