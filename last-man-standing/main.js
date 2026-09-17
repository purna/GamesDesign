import {
  GAME_TICK_INTERVAL_MS,
  DAMAGE_TICK_INTERVAL_MS,
  COUNTDOWN_INTERVAL_MS
} from './config.js';
import { setupRender } from './render.js';
import { connectToRoom, reconcileHost } from './network.js';
import {
  setRoomConnector,
  updateCountdownAndRotate,
  applyItemClaims,
  hostTick,
  checkGameEndByClosure,
  damageTick,
  tryMove,
  setAttacking,
  activateShield,
  startGame,
  setJoined,
  setMyName,
  isHost,
  showLobbyScreen,
  restartToLobby
} from './game.js';
import { currentBucket } from './time.js';
import { validateUsername } from './username.js';
import { NAME_RULE_TEXT } from './config.js';

setRoomConnector(connectToRoom);
await setupRender();

setInterval(() => {
  applyItemClaims();
  reconcileHost();
  hostTick();
  checkGameEndByClosure();
}, GAME_TICK_INTERVAL_MS);

setInterval(damageTick, DAMAGE_TICK_INTERVAL_MS);
setInterval(updateCountdownAndRotate, COUNTDOWN_INTERVAL_MS);
updateCountdownAndRotate();

const enterButton = document.getElementById('btn-enter');
const usernameInput = document.getElementById('username');
const connectStatus = document.getElementById('connect-status');

function showNameError(message) {
  connectStatus.textContent = message;
  connectStatus.classList.add('error');
  usernameInput.setAttribute('aria-invalid', 'true');
}

function clearNameError() {
  connectStatus.textContent = '';
  connectStatus.classList.remove('error');
  usernameInput.removeAttribute('aria-invalid');
}

usernameInput.addEventListener('input', clearNameError);
usernameInput.addEventListener('keydown', event => {
  if (event.key === 'Enter') enterArena();
});
usernameInput.setAttribute('aria-describedby', 'name-rule');

let validating = false;

async function enterArena() {
  if (validating) return;
  validating = true;
  enterButton.disabled = true;
  connectStatus.classList.remove('error');
  connectStatus.textContent = 'Checking name…';
  try {
    const result = await validateUsername(usernameInput.value);
    if (!result.ok) {
      showNameError(result.reason || NAME_RULE_TEXT);
      return;
    }
    // Only the canonical (trimmed, lowercased) name is stored or broadcast.
    clearNameError();
    usernameInput.value = result.name;
    setMyName(result.name);
    document.getElementById('screen-join').classList.add('hidden');
    setJoined(true);
    connectToRoom(currentBucket());
    showLobbyScreen();
  } finally {
    validating = false;
    enterButton.disabled = false;
  }
}

enterButton.addEventListener('click', enterArena);

document.getElementById('btn-start-now').addEventListener('click', () => {
  if (!isHost()) return;
  startGame();
});

document.getElementById('btn-return-lobby').addEventListener('click', restartToLobby);

document.getElementById('btn-up').addEventListener('pointerdown', event => {
  event.preventDefault();
  tryMove(0, -1, 'up');
});
document.getElementById('btn-down').addEventListener('pointerdown', event => {
  event.preventDefault();
  tryMove(0, 1, 'down');
});
document.getElementById('btn-left').addEventListener('pointerdown', event => {
  event.preventDefault();
  tryMove(-1, 0, 'left');
});
document.getElementById('btn-right').addEventListener('pointerdown', event => {
  event.preventDefault();
  tryMove(1, 0, 'right');
});

const attackButton = document.getElementById('btn-attack');
const defendButton = document.getElementById('btn-defend');
attackButton.addEventListener('pointerdown', event => {
  event.preventDefault();
  setAttacking(true);
});
attackButton.addEventListener('pointerup', event => {
  event.preventDefault();
  setAttacking(false);
});
attackButton.addEventListener('pointerleave', () => setAttacking(false));
defendButton.addEventListener('pointerdown', event => {
  event.preventDefault();
  activateShield();
});

const MOVEMENT_KEYS = new Set(['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' ']);

window.addEventListener('keydown', event => {
  const key = event.key.toLowerCase();
  // Arrow keys and space scroll the document by default, which is what made the
  // arena jump up and down while playing.
  const typing = /^(input|textarea|select)$/i.test((event.target && event.target.tagName) || '');
  if (MOVEMENT_KEYS.has(key) && !typing) event.preventDefault();
  switch (key) {
    case 'arrowup':
    case 'w':
      tryMove(0, -1, 'up');
      break;
    case 'arrowdown':
    case 's':
      tryMove(0, 1, 'down');
      break;
    case 'arrowleft':
    case 'a':
      tryMove(-1, 0, 'left');
      break;
    case 'arrowright':
    case 'd':
      tryMove(1, 0, 'right');
      break;
    case ' ':
      event.preventDefault();
      setAttacking(true);
      break;
    case 'e':
    case 'shift':
      event.preventDefault();
      activateShield();
      break;
  }
});
window.addEventListener('keyup', event => {
  if (event.key === ' ') setAttacking(false);
});
