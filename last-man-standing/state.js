import {
  GAME_STATE,
  TILE,
  DEFAULT_ITEMS,
  DEFAULT_ENEMIES,
  SPAWN_ROOMS,
  DRAW_RESULT
} from './config.js';
import { getRoomMap } from './room.js';

export function freshItems() {
  return DEFAULT_ITEMS.map(item => ({
    ...item,
    available: true,
    claimedBy: null,
    claimedAt: 0
  }));
}

export function freshEnemies() {
  return DEFAULT_ENEMIES.map(enemy => ({
    ...enemy,
    renderX: enemy.x * TILE,
    renderY: enemy.y * TILE
  }));
}

export const state = {
  selfId: 'local-player',
  myName: '',
  room: null,
  sendAnnounce: null,
  sendPlayerState: null,
  sendWorldState: null,
  sendPickup: null,
  sendStartGame: null,
  sendAssign: null,
  sendGameState: null,
  peers: {},
  hostAssignedRooms: {},
  items: freshItems(),
  enemies: freshEnemies(),
  appliedClaims: {},
  activeBucket: null,
  activeBucketStartMs: 0,
  isSpectator: false,
  spectatorReason: 'Spectating until next round',
  isHostFlag: false,
  hostId: null,
  lastHostId: null,
  failoverSeq: 0,
  roundId: 0,
  hasJoined: false,
  manualStartTriggered: false,
  gameStartedAt: 0,
  winnerAnnouncedAt: null,
  forcedWinner: null,
  podiumStartedAt: 0,
  pendingRejoin: false,
  mapActiveUntil: 0,
  gameEndAt: 0,
  gameState: GAME_STATE.WAITING,
  me: {
    roomRow: SPAWN_ROOMS[0].row,
    roomCol: SPAWN_ROOMS[0].col,
    x: 6,
    y: 6,
    renderX: 6 * TILE,
    renderY: 6 * TILE,
    facing: 'down',
    health: 10,
    alive: true,
    weaponCount: 0,
    weaponActiveUntil: 0,
    shieldCount: 0,
    shieldActiveUntil: 0,
    isAttacking: false,
    lastMove: 0
  },
  currentRoomMap: getRoomMap(SPAWN_ROOMS[0].row, SPAWN_ROOMS[0].col),
  closedRooms: new Set(),
  roomClosureStartedAt: 0,
  lastEnemyStep: 0,
  nextEnemySpawnAt: 0,
  enemySpawnSeq: 0,
  roomToastTimer: null
};

export function aliveRoster() {
  const list = [{
    id: state.selfId,
    alive: state.me.alive,
    spectator: state.isSpectator,
    name: state.myName
  }];
  Object.keys(state.peers).forEach(id => {
    const peer = state.peers[id];
    if (peer && peer.name) {
      list.push({
        id,
        alive: !!peer.alive,
        spectator: !!peer.spectator,
        name: peer.name
      });
    }
  });
  return list;
}

export function playersInRoom(row, col) {
  let count = 0;
  if (state.me.alive && !state.isSpectator && state.me.roomRow === row && state.me.roomCol === col) {
    count++;
  }
  Object.keys(state.peers).forEach(id => {
    const peer = state.peers[id];
    if (peer && peer.name && peer.alive && !peer.spectator && peer.roomRow === row && peer.roomCol === col) {
      count++;
    }
  });
  return count;
}

export function checkWinner() {
  const roster = aliveRoster().filter(player => !player.spectator);
  if (roster.length < 2) return null;
  const alivePlayers = roster.filter(player => player.alive);
  if (alivePlayers.length === 1) return alivePlayers[0].name;
  if (alivePlayers.length === 0) return DRAW_RESULT;
  return null;
}
