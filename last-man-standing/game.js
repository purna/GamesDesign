import {
  GAME_STATE,
  WAITING_SECONDS,
  LOBBY_SECONDS,
  GAME_DURATION_MS,
  PODIUM_SECONDS,
  MIN_PLAYERS_TO_START,
  MOVE_COOLDOWN,
  WEAPON_DURATION,
  SHIELD_DURATION,
  ITEM_RESPAWN_MS,
  GRID_SIZE,
  DOOR_LOCK_COUNT,
  MAX_HEALTH,
  SPAWN_ROOMS,
  INTERIOR_ROOMS,
  ENEMY_WANDER_CHANCE,
  ENEMY_STEP_INTERVAL_MS,
  ENEMY_SPAWN_MIN_MS,
  ENEMY_SPAWN_MAX_MS,
  ENEMY_SPAWN_MIN_COUNT,
  ENEMY_SPAWN_MAX_COUNT,
  MAX_ENEMIES,
  MAP_DURATION_MS,
  RECONNECT_COOLDOWN_MS,
  ROOM_CLOSURE_ORDER,
  FULL_DASH_ARRAY,
  BUCKET_MS,
  DRAW_RESULT
} from './config.js';
import { getRoomMap, roomNeighbors, roomTypeLabel, isSolidTile, ENEMY_ROOM_MAP } from './room.js';
import { state, playersInRoom, aliveRoster, checkWinner } from './state.js';
import { getRoomClosureTime, isRoomClosed, getRoomClosureWarning } from './room-closure.js';
import {
  showRoomToast,
  showScreen,
  updateLobbyRosterUI,
  updateSpectatorBanner,
  setRemainingPathColor,
  setCircleDasharray
} from './ui.js';
import { drawMap } from './render.js';
import { currentBucket, generateDynamicCode } from './time.js';
import { nextHostAfter } from './host.js';

let roomConnector = null;
let lastAutoReconnectAt = 0;

export function setRoomConnector(connector) {
  roomConnector = connector;
}

/**
 * Gate for every *automatic* reconnect (arena rotation, empty-lobby timeout,
 * podium -> lobby). Each call opens fresh relay connections, and the
 * countdown tick that drives these call sites runs 4x/second, so without a
 * cooldown a stuck condition (e.g. staying solo through several bucket
 * rollovers) reconnects far more often than the arena rotation it's meant to
 * represent, and public relays start rate-limiting the resulting connection
 * churn. The user-initiated join from the "Enter Arena" button bypasses this
 * and always goes straight to connectToRoom().
 */
function requestAutoReconnect(bucket) {
  if (!roomConnector) return;
  const now = Date.now();
  if (bucket === state.activeBucket && now - lastAutoReconnectAt < RECONNECT_COOLDOWN_MS) return;
  lastAutoReconnectAt = now;
  roomConnector(bucket);
}

export function setMyName(name) {
  state.myName = name;
}

export function isHost() {
  return state.isHostFlag;
}

export function resetLocalRoundState(spawnIndex) {
  const spawnRoom = SPAWN_ROOMS[spawnIndex % SPAWN_ROOMS.length];
  state.me.roomRow = spawnRoom.row;
  state.me.roomCol = spawnRoom.col;
  state.me.x = 6;
  state.me.y = 6;
  state.me.renderX = 6 * 40;
  state.me.renderY = 6 * 40;
  state.me.health = MAX_HEALTH;
  state.me.alive = true;
  state.me.weaponCount = 0;
  state.me.weaponActiveUntil = 0;
  state.me.shieldCount = 0;
  state.me.shieldActiveUntil = 0;
  state.me.isAttacking = false;
  state.me.facing = 'down';
  state.mapActiveUntil = 0;
  state.appliedClaims = {};
  state.closedRooms = new Set();
  state.roomClosureStartedAt = 0;
  state.currentRoomMap = getRoomMap(state.me.roomRow, state.me.roomCol);
  drawMap();
  document.getElementById('winner-banner').classList.add('hidden');
}

export function pickFreeSpawnIndex(excludeSelf = false) {
  const occupied = new Set();
  if (!excludeSelf && state.me.roomRow !== undefined && state.me.roomCol !== undefined) {
    occupied.add(`${state.me.roomRow},${state.me.roomCol}`);
  }
  Object.keys(state.peers).forEach(id => {
    const peer = state.peers[id];
    if (peer && peer.name && peer.roomRow !== undefined && peer.roomCol !== undefined) {
      occupied.add(`${peer.roomRow},${peer.roomCol}`);
    }
  });
  const free = [];
  SPAWN_ROOMS.forEach((room, index) => {
    if (!occupied.has(`${room.row},${room.col}`)) free.push(index);
  });
  if (free.length === 0) return Math.floor(Math.random() * SPAWN_ROOMS.length);
  return free[Math.floor(Math.random() * free.length)];
}

export function myStatePayload() {
  return {
    name: state.myName,
    x: state.me.x,
    y: state.me.y,
    roomRow: state.me.roomRow,
    roomCol: state.me.roomCol,
    health: state.me.health,
    alive: state.me.alive,
    weaponCount: state.me.weaponCount,
    weaponActiveUntil: state.me.weaponActiveUntil,
    shieldCount: state.me.shieldCount,
    shieldActiveUntil: state.me.shieldActiveUntil,
    isAttacking: state.me.isAttacking,
    facing: state.me.facing,
    spectator: state.isSpectator
  };
}

export function broadcastMe() {
  if (state.sendPlayerState) state.sendPlayerState(myStatePayload());
}

export function processPickup(itemId, claimantId) {
  if (state.gameState !== GAME_STATE.IN_GAME) return;
  const item = state.items.find(candidate => candidate.id === itemId);
  if (!item || !item.available) return;
  item.available = false;
  item.claimedBy = claimantId;
  item.claimedAt = Date.now();
}

export function applyItemClaims() {
  if (state.gameState !== GAME_STATE.IN_GAME) return;
  if (state.isSpectator || !state.me.alive) {
    // Nothing is picked up after death: drop any pending claim and the minimap.
    state.mapActiveUntil = 0;
    state.items.forEach(item => {
      if (item.claimedBy === state.selfId) state.appliedClaims[item.id] = item.claimedAt;
    });
    return;
  }
  state.items.forEach(item => {
    if (item.claimedBy === state.selfId && state.appliedClaims[item.id] !== item.claimedAt) {
      state.appliedClaims[item.id] = item.claimedAt;
      // A claim that lands after elimination is swallowed, not applied — the
      // map in particular must never light up for a dead or spectating player.
      if (!state.me.alive || state.isSpectator) return;
      if (item.type === 'weapon') state.me.weaponCount += 1;
      else if (item.type === 'map') state.mapActiveUntil = Date.now() + MAP_DURATION_MS;
      else state.me.shieldCount += 1;
      broadcastMe();
    }
  });
}

export function checkPickupHere() {
  if (state.gameState !== GAME_STATE.IN_GAME || state.isSpectator || !state.me.alive) return;
  const item = state.items.find(candidate =>
    candidate.available &&
    candidate.roomRow === state.me.roomRow &&
    candidate.roomCol === state.me.roomCol &&
    candidate.x === state.me.x &&
    candidate.y === state.me.y
  );
  if (item) {
    if (isHost()) processPickup(item.id, state.selfId);
    else if (state.sendPickup) state.sendPickup({ itemId: item.id });
  }
}

export function tryMove(dx, dy, facing) {
  if (state.isSpectator || !state.me.alive) return;
  const now = Date.now();
  if (now - state.me.lastMove < MOVE_COOLDOWN) return;
  state.me.facing = facing;
  const nextX = state.me.x + dx;
  const nextY = state.me.y + dy;

  if (nextX >= 0 && nextX < 13 && nextY >= 0 && nextY < 13) {
    if (isSolidTile(state.currentRoomMap[nextY][nextX])) {
      broadcastMe();
      return;
    }
    state.me.x = nextX;
    state.me.y = nextY;
    state.me.lastMove = now;
    broadcastMe();
    checkPickupHere();
    return;
  }

  let targetRow = state.me.roomRow;
  let targetCol = state.me.roomCol;
  let entryX = state.me.x;
  let entryY = state.me.y;
  if (nextY < 0) { targetRow -= 1; entryY = 12; }
  else if (nextY >= 13) { targetRow += 1; entryY = 0; }
  else if (nextX < 0) { targetCol -= 1; entryX = 12; }
  else if (nextX >= 13) { targetCol += 1; entryX = 0; }

  if (targetRow < 0 || targetRow >= GRID_SIZE || targetCol < 0 || targetCol >= GRID_SIZE) {
    broadcastMe();
    return;
  }
  if (playersInRoom(targetRow, targetCol) >= DOOR_LOCK_COUNT) {
    state.me.lastMove = now;
    showRoomToast('Room locked — 2 players already inside');
    broadcastMe();
    return;
  }
  if (isRoomClosed(targetRow, targetCol)) {
    state.me.lastMove = now;
    showRoomToast('💀 That room has closed!');
    broadcastMe();
    return;
  }

  state.me.roomRow = targetRow;
  state.me.roomCol = targetCol;
  state.me.x = entryX;
  state.me.y = entryY;
  state.me.renderX = entryX * 40;
  state.me.renderY = entryY * 40;
  state.me.lastMove = now;
  state.currentRoomMap = getRoomMap(targetRow, targetCol);
  drawMap();
  broadcastMe();
  checkPickupHere();
}

const attackButton = document.getElementById('btn-attack');
const defendButton = document.getElementById('btn-defend');

export function setAttacking(value) {
  if (state.isSpectator || !state.me.alive) return;
  const now = Date.now();
  if (value) {
    if (state.me.weaponActiveUntil <= now) {
      if (state.me.weaponCount <= 0) return;
      state.me.weaponCount -= 1;
      state.me.weaponActiveUntil = now + WEAPON_DURATION;
    }
    state.me.isAttacking = true;
  } else {
    state.me.isAttacking = false;
  }
  attackButton.classList.toggle('swinging', state.me.isAttacking);
  broadcastMe();
}

export function activateShield() {
  if (state.isSpectator || !state.me.alive) return;
  const now = Date.now();
  if (state.me.shieldActiveUntil > now || state.me.shieldCount <= 0) return;
  state.me.shieldCount -= 1;
  state.me.shieldActiveUntil = now + SHIELD_DURATION;
  broadcastMe();
}

export function tryEnemyMove(enemy, dx, dy) {
  const map = getRoomMap(enemy.roomRow, enemy.roomCol);
  const nextX = enemy.x + dx;
  const nextY = enemy.y + dy;
  if (nextX >= 0 && nextX < 13 && nextY >= 0 && nextY < 13) {
    if (isSolidTile(map[nextY][nextX])) return false;
    enemy.x = nextX;
    enemy.y = nextY;
    return true;
  }

  let targetRow = enemy.roomRow;
  let targetCol = enemy.roomCol;
  let entryX = enemy.x;
  let entryY = enemy.y;
  if (nextY < 0) { targetRow -= 1; entryY = 12; }
  else if (nextY >= 13) { targetRow += 1; entryY = 0; }
  else if (nextX < 0) { targetCol -= 1; entryX = 12; }
  else if (nextX >= 13) { targetCol += 1; entryX = 0; }
  if (targetRow < 0 || targetRow >= GRID_SIZE || targetCol < 0 || targetCol >= GRID_SIZE) return false;
  if (isRoomClosed(targetRow, targetCol)) return false;

  enemy.roomRow = targetRow;
  enemy.roomCol = targetCol;
  enemy.x = entryX;
  enemy.y = entryY;
  enemy.renderX = entryX * 40;
  enemy.renderY = entryY * 40;
  return true;
}

export function stepEnemies() {
  const now = Date.now();
  if (now - state.lastEnemyStep < ENEMY_STEP_INTERVAL_MS) return;
  state.lastEnemyStep = now;
  state.enemies.forEach(enemy => {
    const targets = [];
    if (state.me.alive && !state.isSpectator && state.me.roomRow === enemy.roomRow && state.me.roomCol === enemy.roomCol) {
      targets.push({ x: state.me.x, y: state.me.y });
    }
    Object.keys(state.peers).forEach(id => {
      const peer = state.peers[id];
      if (peer && peer.name && peer.alive && !peer.spectator && peer.roomRow === enemy.roomRow && peer.roomCol === enemy.roomCol && peer.x !== undefined) {
        targets.push({ x: peer.x, y: peer.y });
      }
    });

    if (targets.length > 0) {
      let bestTarget = null;
      let bestDistance = Infinity;
      targets.forEach(target => {
        const distance = Math.abs(target.x - enemy.x) + Math.abs(target.y - enemy.y);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestTarget = target;
        }
      });
      const dx = bestTarget.x - enemy.x;
      const dy = bestTarget.y - enemy.y;
      let moveX = 0;
      let moveY = 0;
      if (Math.abs(dx) > Math.abs(dy)) moveX = Math.sign(dx);
      else if (dy !== 0) moveY = Math.sign(dy);
      else moveX = Math.sign(dx);
      if (!tryEnemyMove(enemy, moveX, moveY)) {
        tryEnemyMove(enemy, moveX === 0 ? Math.sign(dx) : 0, moveY === 0 ? Math.sign(dy) : 0);
      }
      return;
    }

    if (Math.random() < ENEMY_WANDER_CHANCE) return;
    const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];
    for (let index = directions.length - 1; index > 0; index--) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [directions[index], directions[swapIndex]] = [directions[swapIndex], directions[index]];
    }
    for (const [dx, dy] of directions) {
      if (tryEnemyMove(enemy, dx, dy)) break;
    }
  });
}

export function maybeSpawnEnemies(now) {
  if (state.nextEnemySpawnAt === 0) {
    state.nextEnemySpawnAt = now + ENEMY_SPAWN_MIN_MS + Math.random() * (ENEMY_SPAWN_MAX_MS - ENEMY_SPAWN_MIN_MS);
    return;
  }
  if (now < state.nextEnemySpawnAt) return;
  state.nextEnemySpawnAt = now + ENEMY_SPAWN_MIN_MS + Math.random() * (ENEMY_SPAWN_MAX_MS - ENEMY_SPAWN_MIN_MS);
  if (state.enemies.length >= MAX_ENEMIES) return;

  const count = ENEMY_SPAWN_MIN_COUNT + Math.floor(Math.random() * (ENEMY_SPAWN_MAX_COUNT - ENEMY_SPAWN_MIN_COUNT + 1));
  for (let index = 0; index < count && state.enemies.length < MAX_ENEMIES; index++) {
    const room = INTERIOR_ROOMS[Math.floor(Math.random() * INTERIOR_ROOMS.length)];
    const tile = randomOpenTile();
    state.enemySpawnSeq += 1;
    state.enemies.push({
      id: `enemy-spawn-${state.enemySpawnSeq}`,
      roomRow: room.row,
      roomCol: room.col,
      x: tile.x,
      y: tile.y,
      renderX: tile.x * 40,
      renderY: tile.y * 40
    });
  }
}

function randomOpenTile() {
  let x;
  let y;
  let tries = 0;
  do {
    x = 1 + Math.floor(Math.random() * 11);
    y = 1 + Math.floor(Math.random() * 11);
    tries++;
  } while (isSolidTile(ENEMY_ROOM_MAP[y][x]) && tries < 30);
  return { x, y };
}

export function hostTick() {
  if (!isHost()) return;
  stepEnemies();
  const now = Date.now();
  maybeSpawnEnemies(now);
  checkRoomClosureElimination();
  state.enemies = state.enemies.filter(enemy => !isRoomClosed(enemy.roomRow, enemy.roomCol));
  state.items.forEach(item => {
    if (!item.available && now - item.claimedAt > ITEM_RESPAWN_MS) {
      item.available = true;
      item.claimedBy = null;
    }
  });
  if (state.sendWorldState) {
    state.sendWorldState({
      items: state.items,
      enemies: state.enemies.map(enemy => ({
        id: enemy.id,
        roomRow: enemy.roomRow,
        roomCol: enemy.roomCol,
        x: enemy.x,
        y: enemy.y
      }))
    });
  }
}

export function damageTick() {
  if (state.isSpectator || !state.me.alive) return;
  const now = Date.now();
  let underAttack = false;
  state.enemies.forEach(enemy => {
    if (enemy.roomRow === state.me.roomRow && enemy.roomCol === state.me.roomCol && enemy.x === state.me.x && enemy.y === state.me.y) underAttack = true;
  });
  Object.keys(state.peers).forEach(id => {
    const peer = state.peers[id];
    if (!peer || !peer.alive || peer.spectator) return;
    if (peer.roomRow !== state.me.roomRow || peer.roomCol !== state.me.roomCol) return;
    if (!(peer.weaponActiveUntil > now) || !peer.isAttacking) return;
    if (Math.max(Math.abs(peer.x - state.me.x), Math.abs(peer.y - state.me.y)) <= 1) underAttack = true;
  });

  const shielded = state.me.shieldActiveUntil > now;
  if (state.me.isAttacking && state.me.weaponActiveUntil <= now) setAttacking(false);
  if (underAttack && !shielded) {
    state.me.health -= 1;
    if (state.me.health <= 0) {
      state.me.health = 0;
      state.me.alive = false;
      state.mapActiveUntil = 0;
      setAttacking(false);
    }
  }
  broadcastMe();
}

export function checkRoomClosureElimination() {
  if (state.gameState !== GAME_STATE.IN_GAME) return;
  const now = Date.now();
  ROOM_CLOSURE_ORDER.forEach(room => {
    const key = `${room.row},${room.col}`;
    if (state.closedRooms.has(key)) return;
    if (now >= getRoomClosureTime(room.row, room.col)) {
      state.closedRooms.add(key);
      if (state.me.roomRow === room.row && state.me.roomCol === room.col && state.me.alive) {
        state.me.alive = false;
        state.me.health = 0;
        state.mapActiveUntil = 0;
        setAttacking(false);
        showRoomToast(`💀 Room (${room.row + 1},${room.col + 1}) closed — eliminated!`);
      }
      Object.keys(state.peers).forEach(id => {
        const peer = state.peers[id];
        if (peer && peer.alive && peer.roomRow === room.row && peer.roomCol === room.col) {
          peer.alive = false;
          peer.health = 0;
        }
      });
    }
  });
}

export function checkGameEndByClosure() {
  if (state.gameState !== GAME_STATE.IN_GAME) return;
  checkRoomClosureElimination();
  if (checkWinner()) endGame();
}

export function startGame() {
  // The button is disabled below the minimum, but the timer path and the
  // network 'start' action reach here too, so the rule is enforced here as well.
  const roster = aliveRoster().filter(player => !player.spectator && player.name);
  if (roster.length < MIN_PLAYERS_TO_START) {
    updateLobbyRosterUI();
    return false;
  }
  if (state.gameState === GAME_STATE.LOBBY || state.gameState === GAME_STATE.WAITING) {
    state.gameState = GAME_STATE.IN_GAME;
    state.gameStartedAt = Date.now();
    state.manualStartTriggered = true;
    state.mapActiveUntil = 0;
    if (isHost() && state.sendGameState) {
      state.sendGameState({ state: GAME_STATE.IN_GAME, startedAt: state.gameStartedAt });
    }
    showScreen('game');
    document.getElementById('game-in-progress-overlay').classList.add('hidden');
    return true;
  }
  return false;
}

export function endGame(winnerOverride = null) {
  if (state.gameState === GAME_STATE.PODIUM) return;
  const winner = winnerOverride || checkWinner() || DRAW_RESULT;
  state.forcedWinner = winner;
  state.gameState = GAME_STATE.PODIUM;
  state.podiumStartedAt = Date.now();
  state.gameEndAt = state.podiumStartedAt + (PODIUM_SECONDS * 1000);
  state.winnerAnnouncedAt = state.podiumStartedAt;
  state.lastHostId = state.hostId || (isHost() ? state.selfId : state.lastHostId);
  state.mapActiveUntil = 0;
  showPodiumScreen(winner);
  if (isHost() && state.sendGameState) {
    // Nominate a different host for the next arena. Everyone still connected
    // gets the same nomination, so rotation survives a same-bucket restart.
    const rosterIds = aliveRoster().filter(player => player.name).map(player => player.id);
    state.nextHostHint = nextHostAfter(rosterIds, state.selfId);
    state.sendGameState({
      state: GAME_STATE.PODIUM,
      endsAt: state.gameEndAt,
      winner,
      nextHost: state.nextHostHint
    });
  }
}

export function showPodiumScreen(winnerOverride = null) {
  const winner = winnerOverride || state.forcedWinner || checkWinner() || DRAW_RESULT;
  state.forcedWinner = winner;
  const winnerText = winner === DRAW_RESULT ? 'No survivors' : winner;
  const winnerElement = document.getElementById('podium-winner');
  const winnerTitle = document.getElementById('winner-text');
  const copy = document.getElementById('podium-copy');
  const countdown = document.getElementById('podium-countdown');
  const button = document.getElementById('btn-return-lobby');
  if (winnerElement) winnerElement.textContent = winnerText;
  if (winnerTitle) winnerTitle.textContent = winner === DRAW_RESULT ? 'No survivors' : `${winner} wins!`;
  if (copy) copy.textContent = 'Return to the lobby to start the next arena.';
  if (button) button.disabled = false;
  renderPodiumStandings(winner);
  updatePodiumCountdown(PODIUM_SECONDS);
  showScreen('podium');
}

function renderPodiumStandings(winner) {
  const standings = document.getElementById('podium-standings');
  if (!standings) return;
  const roster = aliveRoster().filter(player => player.name);
  const ordered = roster.slice().sort((left, right) => {
    if (winner !== DRAW_RESULT) {
      if (left.name === winner) return -1;
      if (right.name === winner) return 1;
    }
    if (left.alive !== right.alive) return left.alive ? -1 : 1;
    return (right.health || 0) - (left.health || 0);
  });
  const places = ['1st', '2nd', '3rd'];
  standings.replaceChildren(...ordered.slice(0, 3).map((player, index) => {
    const place = document.createElement('div');
    place.className = `podium-place${index === 0 ? ' first' : ''}`;
    const rank = document.createElement('div');
    rank.textContent = places[index] || `${index + 1}th`;
    const name = document.createElement('strong');
    name.textContent = player.name;
    const status = document.createElement('span');
    status.textContent = player.alive ? 'Survived' : 'Eliminated';
    place.append(rank, name, status);
    return place;
  }));
}

function updatePodiumCountdown(secondsLeft) {
  const countdown = document.getElementById('podium-countdown');
  if (countdown) countdown.textContent = `Restarting to lobby in ${Math.max(0, secondsLeft)}s`;
}

export function restartToLobby() {
  // GAME_OVER is a legacy wire value only: network.js maps it onto PODIUM on
  // receipt, so PODIUM is the single owner of the end-of-match transition.
  if (state.gameState !== GAME_STATE.PODIUM) return;
  state.gameState = GAME_STATE.WAITING;
  state.mapActiveUntil = 0;
  state.gameEndAt = 0;
  state.podiumStartedAt = 0;
  state.winnerAnnouncedAt = null;
  state.forcedWinner = null;
  state.pendingRejoin = false;
  requestAutoReconnect(currentBucket());
  showLobbyScreen();
}

export function setGameInProgressOverlay() {
  document.getElementById('game-in-progress-overlay').classList.remove('hidden');
}

export function updateCountdownAndRotate() {
  const now = Date.now();
  const wallSecondsIntoBucket = Math.floor((now % BUCKET_MS) / 1000);
  const wallSecondsLeft = Math.max(0, WAITING_SECONDS - wallSecondsIntoBucket);
  const wallBucket = currentBucket();
  const wallCode = generateDynamicCode(wallBucket);
  const joinTimerLabel = document.getElementById('join-base-timer-label');
  const joinTimerPath = document.getElementById('join-base-timer-path-remaining');
  const joinArenaCode = document.getElementById('join-arena-code');
  if (joinTimerLabel) joinTimerLabel.textContent = `${wallSecondsLeft}s`;
  if (joinArenaCode) joinArenaCode.textContent = wallCode;
  if (joinTimerPath) {
    setCircleDasharray(wallSecondsLeft, WAITING_SECONDS, 'join-base-timer-path-remaining');
    setRemainingPathColor(wallSecondsLeft, 'join-base-timer-path-remaining');
  }

  if (state.isSpectator && !state.hasJoined) return;
  if (!state.hasJoined || state.activeBucket === null) return;

  // arena-code is the room-closure countdown now (render.js owns it
  // exclusively while IN_GAME); it has no other job, so this no longer writes
  // the join code into it.
  const myCode = generateDynamicCode(state.activeBucket);

  if (state.gameState === GAME_STATE.PODIUM) {
    if (state.gameEndAt === 0) state.gameEndAt = now + (PODIUM_SECONDS * 1000);
    if (now >= state.gameEndAt) {
      restartToLobby();
      return;
    }
    updatePodiumCountdown(Math.ceil((state.gameEndAt - now) / 1000));
    return;
  }

  if (state.gameState === GAME_STATE.IN_GAME) {
    if (joinTimerLabel) joinTimerLabel.textContent = 'MATCH';
    if (joinTimerPath) {
      joinTimerPath.setAttribute('stroke-dasharray', `0 ${FULL_DASH_ARRAY}`);
      joinTimerPath.classList.remove('green', 'orange', 'red');
      joinTimerPath.classList.add('red');
    }
    if (state.gameStartedAt && now - state.gameStartedAt >= GAME_DURATION_MS) {
      endGame();
      return;
    }
    return;
  }

  if (state.gameState === GAME_STATE.LOBBY) {
    const secondsLeft = Math.max(0, LOBBY_SECONDS - Math.floor((now - state.activeBucketStartMs) / 1000));
    const lobbyLabel = document.getElementById('lobby-base-timer-label');
    const lobbyPath = document.getElementById('lobby-base-timer-path-remaining');
    const lobbyCode = document.getElementById('lobby-arena-code');
    if (lobbyLabel) lobbyLabel.textContent = `${secondsLeft}s`;
    if (lobbyCode) lobbyCode.textContent = myCode;
    if (lobbyPath) {
      setCircleDasharray(secondsLeft, LOBBY_SECONDS, 'lobby-base-timer-path-remaining');
      setRemainingPathColor(secondsLeft, 'lobby-base-timer-path-remaining');
    }
    if (secondsLeft <= 0) {
      const roster = aliveRoster().filter(player => !player.spectator && player.name);
      if (roster.length >= MIN_PLAYERS_TO_START) {
        startGame();
      } else {
        // Not enough players left in this arena — roll into the next bucket.
        state.gameState = GAME_STATE.WAITING;
        requestAutoReconnect(currentBucket());
      }
      return;
    }
    updateLobbyRosterUI();
    return;
  }

  if (state.gameState === GAME_STATE.WAITING) {
    const secondsLeft = Math.max(0, WAITING_SECONDS - Math.floor((now - state.activeBucketStartMs) / 1000));
    const lobbyLabel = document.getElementById('lobby-base-timer-label');
    const lobbyPath = document.getElementById('lobby-base-timer-path-remaining');
    const lobbyCode = document.getElementById('lobby-arena-code');
    if (lobbyLabel) lobbyLabel.textContent = `${secondsLeft}s`;
    if (lobbyCode) lobbyCode.textContent = myCode;
    if (lobbyPath) {
      setCircleDasharray(secondsLeft, WAITING_SECONDS, 'lobby-base-timer-path-remaining');
      setRemainingPathColor(secondsLeft, 'lobby-base-timer-path-remaining');
    }
    const roster = aliveRoster().filter(player => !player.spectator);
    if (roster.length >= MIN_PLAYERS_TO_START) {
      state.gameState = GAME_STATE.LOBBY;
      updateLobbyRosterUI();
      return;
    }
    if (secondsLeft <= 0) {
      requestAutoReconnect(currentBucket());
      return;
    }
    updateLobbyRosterUI();
  }
}

export function showGameScreen() {
  showScreen('game');
}

export function showLobbyScreen() {
  showScreen('lobby');
}

export function refreshSpectatorBanner() {
  updateSpectatorBanner();
}

export function updateLobby() {
  updateLobbyRosterUI();
}

export function getGameState() {
  return state.gameState;
}

export function setGameState(gameState) {
  state.gameState = gameState;
}

export function setGameStartedAt(timestamp) {
  state.gameStartedAt = timestamp;
}

export function setGameEndAt(timestamp) {
  state.gameEndAt = timestamp;
}

export function setManualStartTriggered(value) {
  state.manualStartTriggered = value;
}

export function setHost(value) {
  state.isHostFlag = value;
}

export function setSpectator(value, reason = 'Spectating until next round') {
  if (value) state.mapActiveUntil = 0;
  state.isSpectator = value;
  state.spectatorReason = reason;
  updateSpectatorBanner();
}

export function setJoined(value) {
  state.hasJoined = value;
}

export function setActiveBucket(bucket) {
  state.activeBucket = bucket;
  state.activeBucketStartMs = bucket * BUCKET_MS;
}

export function setRoom(room) {
  state.room = room;
}

export function setSenders(senders) {
  Object.assign(state, senders);
}

export function setPeers(peers) {
  state.peers = peers;
}

export function setHostAssignedRooms(hostAssignedRooms) {
  state.hostAssignedRooms = hostAssignedRooms;
}

export function setItems(items) {
  state.items = items;
}

export function setEnemies(enemies) {
  state.enemies = enemies;
}

export function setSelfId(selfId) {
  state.selfId = selfId;
}

export function getState() {
  return state;
}

export function getRoomClosureTimeFor(roomRow, roomCol) {
  return getRoomClosureTime(roomRow, roomCol);
}

export function isRoomClosedFor(roomRow, roomCol) {
  return isRoomClosed(roomRow, roomCol);
}

export function getRoomClosureWarningFor(roomRow, roomCol) {
  return getRoomClosureWarning(roomRow, roomCol);
}

export function getRoomTypeLabel(roomRow, roomCol) {
  return roomTypeLabel(roomRow, roomCol);
}

export function getRoomNeighbors(roomRow, roomCol) {
  return roomNeighbors(roomRow, roomCol);
}

export function getPlayersInRoom(roomRow, roomCol) {
  return playersInRoom(roomRow, roomCol);
}

export function getAliveRoster() {
  return aliveRoster();
}

export function getWinner() {
  return checkWinner();
}

export function getCurrentRoomMap() {
  return state.currentRoomMap;
}

export function getMe() {
  return state.me;
}

export function getItems() {
  return state.items;
}

export function getEnemies() {
  return state.enemies;
}

export function getPeers() {
  return state.peers;
}

export function getSelfId() {
  return state.selfId;
}

export function getActiveBucket() {
  return state.activeBucket;
}

export function getActiveBucketStartMs() {
  return state.activeBucketStartMs;
}

export function getGameStartedAt() {
  return state.gameStartedAt;
}

export function getGameEndAt() {
  return state.gameEndAt;
}

export function getRoomClosureStartedAt() {
  return state.roomClosureStartedAt;
}

export function getClosedRooms() {
  return state.closedRooms;
}

export function getEnemyRoomMap() {
  return ENEMY_ROOM_MAP;
}

export function setLastEnemyStep(timestamp) {
  state.lastEnemyStep = timestamp;
}

export function setNextEnemySpawnAt(timestamp) {
  state.nextEnemySpawnAt = timestamp;
}

export function setEnemySpawnSeq(sequence) {
  state.enemySpawnSeq = sequence;
}

export function setWinnerAnnouncedAt(timestamp) {
  state.winnerAnnouncedAt = timestamp;
}


export function setAppliedClaims(appliedClaims) {
  state.appliedClaims = appliedClaims;
}

export function setRoomToastTimer(timer) {
  state.roomToastTimer = timer;
}



export function getAttackButton() {
  return attackButton;
}

export function getDefendButton() {
  return defendButton;
}

export function getRoomConnector() {
  return roomConnector;
}

export function clearRoomConnector() {
  roomConnector = null;
}

export function resetGame() {
  state.gameState = GAME_STATE.WAITING;
  state.gameStartedAt = 0;
  state.gameEndAt = 0;
  state.winnerAnnouncedAt = null;
  state.forcedWinner = null;
  state.podiumStartedAt = 0;
  state.pendingRejoin = false;
  state.manualStartTriggered = false;
  state.activeBucket = null;
  state.activeBucketStartMs = 0;
  state.isSpectator = false;
  state.spectatorReason = 'Spectating until next round';
  state.isHostFlag = false;
  state.hasJoined = false;
  state.peers = {};
  state.hostAssignedRooms = {};
  state.appliedClaims = {};
  state.closedRooms = new Set();
  state.roomClosureStartedAt = 0;
  state.lastEnemyStep = 0;
  state.nextEnemySpawnAt = 0;
  state.enemySpawnSeq = 0;
  state.mapActiveUntil = 0;
  state.hostId = null;
  state.lastHostId = null;
  state.failoverSeq = 0;
  state.me.health = MAX_HEALTH;
  state.me.alive = true;
  state.me.weaponCount = 0;
  state.me.weaponActiveUntil = 0;
  state.me.shieldCount = 0;
  state.me.shieldActiveUntil = 0;
  state.me.isAttacking = false;
  state.me.facing = 'down';
  state.me.x = 6;
  state.me.y = 6;
  state.me.renderX = 240;
  state.me.renderY = 240;
  state.me.roomRow = SPAWN_ROOMS[0].row;
  state.me.roomCol = SPAWN_ROOMS[0].col;
  state.currentRoomMap = getRoomMap(state.me.roomRow, state.me.roomCol);
  drawMap();
}
