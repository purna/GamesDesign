import { joinRoom, selfId } from 'https://esm.sh/trystero@0.22.0/nostr';
import {
  APP_ID,
  RELAY_URLS,
  MAX_PLAYERS,
  GAME_STATE,
  GAME_OVER_DELAY_MS,
  PODIUM_SECONDS,
  HOST_ASSIGNMENT_DELAY_MS,
  BUCKET_MS,
  TILE
} from './config.js';
import { state, freshItems, freshEnemies } from './state.js';
import { roomNameFor } from './time.js';
import { electHost, electFailoverHost } from './host.js';
import { validateNameFormat } from './username.js';
import {
  resetLocalRoundState,
  pickFreeSpawnIndex,
  broadcastMe,
  myStatePayload,
  processPickup,
  startGame,
  showGameScreen,
  showPodiumScreen,
  refreshSpectatorBanner,
  updateLobby
} from './game.js';

export function connectToRoom(bucket) {
  // Re-check the stored name on every (re)connect, so a name can never reach
  // the wire without passing the format rule.
  const nameCheck = validateNameFormat(state.myName);
  if (!nameCheck.ok) {
    console.warn('Refusing to join with an invalid name:', nameCheck.reason);
    return;
  }
  state.myName = nameCheck.name;

  if (state.room) {
    try { state.room.leave(); } catch (error) {}
  }

  state.peers = {};
  state.lastHostId = state.hostId;
  state.hostId = null;
  state.failoverSeq = 0;
  state.roundId = bucket;
  state.activeBucket = bucket;
  state.activeBucketStartMs = bucket * BUCKET_MS;
  state.isHostFlag = false;
  state.nextEnemySpawnAt = 0;
  state.enemySpawnSeq = 0;
  state.hostAssignedRooms = {};
  state.selfId = selfId;
  state.forcedWinner = null;
  state.podiumStartedAt = 0;
  state.gameEndAt = 0;
  state.winnerAnnouncedAt = null;
  state.pendingRejoin = false;

  const room = joinRoom({ appId: APP_ID, relayUrls: RELAY_URLS }, roomNameFor(bucket));
  state.room = room;

  const [sendAnnounce, getAnnounce] = room.makeAction('announce');
  const [sendPlayerState, getPlayerState] = room.makeAction('pstate');
  const [sendWorldState, getWorldState] = room.makeAction('wstate');
  const [sendPickup, getPickup] = room.makeAction('pickup');
  const [sendReject, getReject] = room.makeAction('reject');
  const [sendStartGame, getStartGame] = room.makeAction('start');
  const [sendAssign, getAssign] = room.makeAction('assign');
  const [sendGameState, getGameState] = room.makeAction('gamestate');

  state.sendAnnounce = sendAnnounce;
  state.sendPlayerState = sendPlayerState;
  state.sendWorldState = sendWorldState;
  state.sendPickup = sendPickup;
  state.sendStartGame = sendStartGame;
  state.sendAssign = sendAssign;
  state.sendGameState = sendGameState;
  state.manualStartTriggered = false;

  getStartGame(() => {
    state.manualStartTriggered = true;
    if (state.isHostFlag) startGame();
  });

  getGameState(data => {
    if (!data || !data.state) return;
    if (data.state === GAME_STATE.IN_GAME) {
      state.gameState = GAME_STATE.IN_GAME;
      state.gameStartedAt = data.startedAt || Date.now();
      showGameScreen();
      document.getElementById('game-in-progress-overlay').classList.add('hidden');
    } else if (data.state === GAME_STATE.PODIUM) {
      state.gameState = GAME_STATE.PODIUM;
      state.forcedWinner = data.winner || state.forcedWinner || null;
      state.gameEndAt = data.endsAt || (Date.now() + (PODIUM_SECONDS * 1000));
      showPodiumScreen(state.forcedWinner);
    } else if (data.state === GAME_STATE.GAME_OVER) {
      state.gameState = GAME_STATE.PODIUM;
      state.forcedWinner = data.winner || state.forcedWinner || null;
      state.gameEndAt = (data.endsAt || Date.now()) + GAME_OVER_DELAY_MS;
      showPodiumScreen(state.forcedWinner);
    }
  });

  getAnnounce((data, peerId) => {
    // Peers police each other: a malformed or rejected name is simply ignored.
    if (!data || !validateNameFormat(data.name).ok) return;
    state.peers[peerId] = state.peers[peerId] || {};
    if (state.peers[peerId].joinIndex === undefined) {
      state.peers[peerId].joinIndex = Object.keys(state.peers).filter(id => state.peers[id].joinIndex !== undefined).length;
    }
    state.peers[peerId].name = data.name;
    state.peers[peerId].isHost = !!data.isHost;
    if (data.isHost) state.hostId = peerId;
    if (state.isHostFlag && state.hostAssignedRooms[peerId] === undefined) {
      const spawnIndex = pickFreeSpawnIndex();
      state.hostAssignedRooms[peerId] = spawnIndex;
      sendAssign({ spawnIndex }, peerId);
    }
  });

  getAssign(data => {
    if (data && typeof data.spawnIndex === 'number') {
      resetLocalRoundState(data.spawnIndex);
      broadcastMe();
    }
  });

  getPlayerState((data, peerId) => {
    if (data && data.name !== undefined && !validateNameFormat(data.name).ok) return;
    state.peers[peerId] = state.peers[peerId] || {};
    Object.assign(state.peers[peerId], data);
  });

  getWorldState(data => {
    if (data.items) state.items = data.items;
    if (data.enemies) {
      state.enemies = data.enemies.map(enemy => {
        const previous = state.enemies.find(candidate => candidate.id === enemy.id);
        const roomKey = `${enemy.roomRow},${enemy.roomCol}`;
        const sameRoom = previous && previous._roomKey === roomKey;
        return {
          ...enemy,
          _roomKey: roomKey,
          renderX: sameRoom ? previous.renderX : enemy.x * TILE,
          renderY: sameRoom ? previous.renderY : enemy.y * TILE
        };
      });
    }
  });

  getPickup((data, peerId) => {
    if (state.isHostFlag) processPickup(data.itemId, peerId);
  });

  getReject(data => {
    state.isSpectator = true;
    state.spectatorReason = data.reason || 'Arena is full — spectating until next round';
    refreshSpectatorBanner();
  });

  room.onPeerJoin(peerId => {
    const currentCount = Object.keys(state.peers).filter(id => state.peers[id] && state.peers[id].name).length + 1;
    if (state.isHostFlag && currentCount > MAX_PLAYERS) {
      sendReject({ reason: `Arena is full! Maximum ${MAX_PLAYERS} players.` });
      return;
    }
    sendAnnounce({ name: state.myName, isHost: state.isHostFlag });
    sendPlayerState(myStatePayload());
  });

  room.onPeerLeave(peerId => {
    const departedWasHost = !!(state.peers[peerId] && state.peers[peerId].isHost) || state.hostId === peerId;
    delete state.peers[peerId];
    const activeIds = Object.keys(state.peers).filter(id => state.peers[id] && state.peers[id].name);
    const hostExists = activeIds.some(id => state.peers[id].isHost);
    if (hostExists || !departedWasHost) return;

    // Deterministic failover: every remaining client runs the same election on
    // the same roster, so exactly one of them promotes itself. World state is
    // left alone, so a mid-round failover does not reset the match.
    state.failoverSeq += 1;
    state.lastHostId = peerId;
    const elected = electFailoverHost(activeIds.concat([selfId]), bucket, peerId, state.failoverSeq);
    state.hostId = elected;
    state.isHostFlag = elected === selfId;
    if (state.isHostFlag) {
      if (state.gameState !== GAME_STATE.IN_GAME) {
        state.items = freshItems();
        state.enemies = freshEnemies();
      }
      sendAnnounce({ name: state.myName, isHost: true });
      sendPlayerState(myStatePayload());
    }
    updateLobby();
  });

  state.isSpectator = false;
  state.gameState = GAME_STATE.WAITING;
  resetLocalRoundState(0);

  setTimeout(() => {
    const activeIds = Object.keys(state.peers).filter(id => state.peers[id] && state.peers[id].name);
    const hostAlreadyClaimed = activeIds.some(id => state.peers[id].isHost);
    if (hostAlreadyClaimed) {
      state.hostId = activeIds.find(id => state.peers[id].isHost) || state.hostId;
      state.isHostFlag = false;
    } else {
      // Rotate the host per arena: the bucket is the round key, so a new
      // arena picks the next player in the sorted roster.
      const elected = electHost(activeIds.concat([selfId]), bucket);
      state.hostId = elected;
      state.isHostFlag = elected === selfId;
    }
    if (state.isHostFlag) {
      state.items = freshItems();
      state.enemies = freshEnemies();
      state.nextEnemySpawnAt = 0;
      state.enemySpawnSeq = 0;
      const mySpawnIndex = pickFreeSpawnIndex(true);
      state.hostAssignedRooms[selfId] = mySpawnIndex;
      resetLocalRoundState(mySpawnIndex);
      activeIds.forEach(id => {
        if (state.hostAssignedRooms[id] === undefined) {
          const spawnIndex = pickFreeSpawnIndex();
          state.hostAssignedRooms[id] = spawnIndex;
          sendAssign({ spawnIndex }, id);
        }
      });
    }
    sendAnnounce({ name: state.myName, isHost: state.isHostFlag });
    sendPlayerState(myStatePayload());
    refreshSpectatorBanner();
    updateLobby();
  }, HOST_ASSIGNMENT_DELAY_MS);
}
