import { GAME_STATE, MAX_PLAYERS, MIN_PLAYERS_TO_START, FULL_DASH_ARRAY, WARNING_THRESHOLD, ALERT_THRESHOLD } from './config.js';
import { state } from './state.js';

export function showRoomToast(text) {
  const element = document.getElementById('room-toast');
  element.textContent = text;
  element.classList.add('show');
  if (state.roomToastTimer) clearTimeout(state.roomToastTimer);
  state.roomToastTimer = setTimeout(() => element.classList.remove('show'), 1200);
}

export function showScreen(which) {
  const joinScreen = document.getElementById('screen-join');
  const lobbyScreen = document.getElementById('screen-lobby');
  const gameScreen = document.getElementById('screen-game');
  const podiumScreen = document.getElementById('screen-podium');
  if (joinScreen) joinScreen.classList.toggle('hidden', which !== 'join');
  if (lobbyScreen) lobbyScreen.classList.toggle('hidden', which !== 'lobby');
  if (gameScreen) gameScreen.classList.toggle('hidden', which !== 'game');
  if (podiumScreen) podiumScreen.classList.toggle('hidden', which !== 'podium');
  if (which !== 'game') {
    const overlay = document.getElementById('game-in-progress-overlay');
    if (overlay) overlay.classList.add('hidden');
  }
  if (which !== 'podium') {
    const winner = document.getElementById('winner-banner');
    if (winner) winner.classList.add('hidden');
  }
}

export function updateLobbyRosterUI() {
  const rows = [{ name: `${state.myName} (You)`, host: state.isHostFlag }];
  Object.keys(state.peers).forEach(id => {
    const peer = state.peers[id];
    if (peer && peer.name) rows.push({ name: peer.name, host: !!peer.isHost });
  });
  document.getElementById('lobby-player-list').innerHTML = rows.map(row =>
    `<div><span>${row.name}</span>${row.host ? '<span class="badge-host-pill">HOST</span>' : ''}</div>`
  ).join('');
  document.getElementById('lobby-status-text').textContent = `${rows.length}/${MAX_PLAYERS} players in this arena`;
  const startButton = document.getElementById('btn-start-now');
  const canStart = state.isHostFlag && rows.length >= MIN_PLAYERS_TO_START;
  startButton.disabled = !canStart;
  startButton.textContent = !state.isHostFlag
    ? 'Waiting for host to start…'
    : rows.length < MIN_PLAYERS_TO_START
      ? `Waiting for ${MIN_PLAYERS_TO_START - rows.length} more player${MIN_PLAYERS_TO_START - rows.length === 1 ? '' : 's'}…`
      : 'Start Now';
}

export function updateSpectatorBanner() {
  const banner = document.getElementById('spectator-banner');
  const overlay = document.getElementById('game-in-progress-overlay');
  const countdown = document.getElementById('waiting-countdown');
  if (state.gameState === GAME_STATE.IN_GAME && !state.me.alive) {
    banner.textContent = state.spectatorReason;
    banner.classList.toggle('hidden', !state.isSpectator);
    overlay.classList.remove('hidden');
    countdown.textContent = `Next round in ${Math.max(0, Math.ceil((state.gameEndAt - Date.now()) / 1000))}s`;
  } else if (state.isSpectator) {
    banner.textContent = state.spectatorReason;
    banner.classList.remove('hidden');
    overlay.classList.add('hidden');
  } else {
    banner.classList.add('hidden');
    overlay.classList.add('hidden');
  }
}

export function setRemainingPathColor(timeLeft, pathId) {
  const path = document.getElementById(pathId);
  if (!path) return;
  path.classList.remove('green', 'orange', 'red');
  if (timeLeft <= ALERT_THRESHOLD) path.classList.add('red');
  else if (timeLeft <= WARNING_THRESHOLD) path.classList.add('orange');
  else path.classList.add('green');
}

export function setCircleDasharray(timeLeft, totalSeconds, pathId) {
  const path = document.getElementById(pathId);
  if (!path) return;
  const fraction = timeLeft / totalSeconds;
  const adjustedFraction = fraction - (1 / totalSeconds) * (1 - fraction);
  path.setAttribute('stroke-dasharray', `${(adjustedFraction * FULL_DASH_ARRAY).toFixed(0)} 283`);
}
