import {
  TILE,
  COLS,
  ROWS,
  VIEW,
  DOOR_LO,
  DOOR_HI,
  GRID_SIZE,
  GAME_STATE,
  GAME_DURATION_MS,
  FULL_DASH_ARRAY,
  MAX_HEALTH,
  DRAW_RESULT,
  DECOR,
  FX,
  MAP_DURATION_MS
} from './config.js';
import { state, aliveRoster, playersInRoom, checkWinner } from './state.js';
import { roomNeighbors, roomTypeLabel } from './room.js';
import { getRoomClosureWarning, isRoomClosed } from './room-closure.js';
import { bakeRoomMap, getTorchPlacements } from './lms-tiles.js';

let app;
let mapLayer;
let itemLayer;
let enemyLayer;
let fxLayer;
let lightingLayer;
let doorLayer;
let playerLayer;
let labelLayer;
let mapSprite = null;
let vignetteSprite = null;
let torchLightSprite = null;
const nameLabels = {};

let torchPlacements = [];
let embers = [];
let ambientParticles = [];
let flickerPhase = 0;
let minimapCells = null;

export async function setupRender() {
  app = new PIXI.Application();
  await app.init({ width: VIEW, height: VIEW, backgroundColor: 0x0e0b08, antialias: false });
  document.getElementById('game-container').prepend(app.canvas);

  mapLayer = new PIXI.Graphics();
  itemLayer = new PIXI.Graphics();
  enemyLayer = new PIXI.Graphics();
  fxLayer = new PIXI.Graphics();
  lightingLayer = new PIXI.Container();
  doorLayer = new PIXI.Graphics();
  playerLayer = new PIXI.Graphics();
  labelLayer = new PIXI.Container();

  // Order matters: the lighting sits above the world but below the door
  // overlay, players and labels so nothing gameplay-critical gets dimmed out.
  app.stage.addChild(mapLayer, itemLayer, enemyLayer, fxLayer, lightingLayer, doorLayer, playerLayer, labelLayer);

  buildLighting();
  buildMinimap();
  app.ticker.add(render);
  drawMap();
}

/* ---------------------------------------------------------------- lighting */

function radialTexture(size, stops) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);
  return PIXI.Texture.from(canvas);
}

function buildLighting() {
  // Dark surround with a soft hole punched where the player's torch reaches.
  const vignetteSize = VIEW * 2;
  const vignetteTexture = radialTexture(vignetteSize, [
    [0, 'rgba(0,0,0,0)'],
    [0.16, 'rgba(0,0,0,0)'],
    [0.30, `rgba(8,5,3,${(FX.VIGNETTE_ALPHA * 0.45).toFixed(3)})`],
    [0.55, `rgba(8,5,3,${FX.VIGNETTE_ALPHA})`],
    [1, `rgba(8,5,3,${FX.VIGNETTE_ALPHA})`]
  ]);
  vignetteSprite = new PIXI.Sprite(vignetteTexture);
  vignetteSprite.anchor.set(0.5);

  const glowSize = FX.TORCH_LIGHT_RADIUS * 2;
  const glowTexture = radialTexture(glowSize, [
    [0, 'rgba(255,196,102,0.55)'],
    [0.45, 'rgba(255,150,64,0.22)'],
    [1, 'rgba(255,140,66,0)']
  ]);
  torchLightSprite = new PIXI.Sprite(glowTexture);
  torchLightSprite.anchor.set(0.5);
  torchLightSprite.blendMode = 'add';

  lightingLayer.addChild(vignetteSprite, torchLightSprite);
}

/* ------------------------------------------------------------------- map */

export function drawMap() {
  if (!mapLayer) return;
  mapLayer.clear();
  const roomType = roomTypeLabel(state.me.roomRow, state.me.roomCol).toLowerCase();
  const baked = bakeRoomMap(state.currentRoomMap, roomType);
  const texture = PIXI.Texture.from(baked);
  texture.source.scaleMode = 'nearest';
  const sprite = new PIXI.Sprite(texture);
  mapLayer.addChild(sprite);
  if (mapSprite) mapSprite.destroy();
  mapSprite = sprite;
  resetRoomFx();
}

/* -------------------------------------------------------------- particles */

function resetRoomFx() {
  torchPlacements = getTorchPlacements(state.currentRoomMap);
  embers = [];
  ambientParticles = [];
  const ambientTarget = Math.min(
    FX.MAX_AMBIENT,
    Math.round(COLS * ROWS * DECOR.AMBIENT_PARTICLE_DENSITY * 10)
  );
  for (let index = 0; index < ambientTarget; index++) {
    ambientParticles.push(spawnAmbient(Math.random() * VIEW));
  }
}

function spawnAmbient(startY) {
  return {
    x: Math.random() * VIEW,
    y: startY,
    drift: (Math.random() - 0.5) * DECOR.AMBIENT_PARTICLE_SPEED,
    speed: DECOR.AMBIENT_PARTICLE_SPEED * (0.4 + Math.random() * 0.9),
    size: Math.random() > 0.7 ? 2 : 1,
    alpha: 0.12 + Math.random() * 0.22
  };
}

function updateParticles(deltaMs) {
  const clamped = Math.min(deltaMs, 64);
  flickerPhase += clamped * DECOR.TORCH_FLICKER_SPEED;

  torchPlacements.forEach((placement, index) => {
    if (embers.length >= FX.MAX_EMBERS) return;
    if (Math.random() > FX.EMBER_SPAWN_CHANCE) return;
    embers.push({
      x: placement.x + (Math.random() - 0.5) * 4,
      y: placement.y,
      vx: (Math.random() - 0.5) * FX.EMBER_DRIFT,
      vy: -(FX.EMBER_RISE_SPEED * (0.6 + Math.random() * 0.8)),
      born: performance.now(),
      life: DECOR.TORCH_EMBER_LIFETIME_MS * (0.6 + Math.random() * 0.8),
      seed: index
    });
  });

  const now = performance.now();
  embers = embers.filter(ember => now - ember.born < ember.life);
  embers.forEach(ember => {
    ember.x += ember.vx * clamped + Math.sin((now + ember.seed * 400) / 260) * 0.12;
    ember.y += ember.vy * clamped;
  });

  ambientParticles.forEach(particle => {
    particle.x += particle.drift * clamped;
    particle.y += particle.speed * clamped * 0.25;
    if (particle.y > VIEW) Object.assign(particle, spawnAmbient(-4));
    if (particle.x < -4) particle.x = VIEW + 4;
    if (particle.x > VIEW + 4) particle.x = -4;
  });
}

function drawParticles() {
  fxLayer.clear();

  // Torch light pulses: cheap additive blobs at each baked torch.
  const pulse = 0.72 + Math.sin(flickerPhase) * 0.14 + Math.sin(flickerPhase * 2.7) * 0.07;
  torchPlacements.forEach((placement, index) => {
    const local = pulse + Math.sin(flickerPhase * 1.7 + index) * 0.08;
    fxLayer
      .circle(placement.x, placement.y, DECOR.TORCH_GLOW_RADIUS * (0.7 + local * 0.35))
      .fill({ color: '#ffb703', alpha: FX.GLOW_ALPHA * Math.max(0.2, local) * 0.5 });
  });

  const now = performance.now();
  embers.forEach(ember => {
    const age = (now - ember.born) / ember.life;
    const alpha = Math.max(0, 1 - age) * 0.8;
    fxLayer
      .rect(ember.x, ember.y, 2, 2)
      .fill({ color: age > 0.55 ? '#e74c3c' : '#ffd166', alpha });
  });

  ambientParticles.forEach(particle => {
    fxLayer
      .rect(particle.x, particle.y, particle.size, particle.size)
      .fill({ color: '#f5ebe0', alpha: particle.alpha });
  });
}

function updateLighting() {
  if (!vignetteSprite || !torchLightSprite) return;
  const centerX = state.me.renderX + TILE / 2;
  const centerY = state.me.renderY + TILE / 2;
  const flicker = 1 + Math.sin(flickerPhase) * FX.TORCH_LIGHT_FLICKER * 0.5 + Math.sin(flickerPhase * 3.1) * FX.TORCH_LIGHT_FLICKER * 0.2;

  // Spectators and eliminated players watch with the lights up.
  const dimmed = state.me.alive && !state.isSpectator;
  lightingLayer.visible = dimmed;
  if (!dimmed) return;

  vignetteSprite.position.set(centerX, centerY);
  vignetteSprite.scale.set(flicker);
  torchLightSprite.position.set(centerX, centerY);
  torchLightSprite.scale.set(flicker);
  torchLightSprite.alpha = 0.85 + Math.sin(flickerPhase * 2.2) * 0.12;
}

/* -------------------------------------------------------------- minimap */

function buildMinimap() {
  const grid = document.getElementById('minimap-grid');
  if (!grid) return;
  minimapCells = [];
  grid.replaceChildren();
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      const cell = document.createElement('div');
      cell.className = 'minimap-cell';
      cell.dataset.row = String(row);
      cell.dataset.col = String(col);
      grid.appendChild(cell);
      minimapCells.push(cell);
    }
  }
}

function updateMinimap() {
  const overlay = document.getElementById('minimap');
  if (!overlay || !minimapCells) return;
  const now = Date.now();
  const active = state.mapActiveUntil > now &&
    state.gameState === GAME_STATE.IN_GAME &&
    state.me.alive &&
    !state.isSpectator;

  if (!active) {
    if (state.mapActiveUntil && state.mapActiveUntil <= now) state.mapActiveUntil = 0;
    overlay.classList.add('hidden');
    overlay.setAttribute('aria-hidden', 'true');
    return;
  }
  overlay.classList.remove('hidden');
  overlay.setAttribute('aria-hidden', 'false');

  const occupants = new Map();
  const addOccupant = (row, col, kind) => {
    const key = `${row},${col}`;
    const existing = occupants.get(key) || { self: false, others: 0 };
    if (kind === 'self') existing.self = true;
    else existing.others += 1;
    occupants.set(key, existing);
  };
  addOccupant(state.me.roomRow, state.me.roomCol, 'self');
  Object.keys(state.peers).forEach(id => {
    const peer = state.peers[id];
    if (!peer || !peer.name || !peer.alive || peer.spectator) return;
    if (peer.roomRow === undefined || peer.roomCol === undefined) return;
    addOccupant(peer.roomRow, peer.roomCol, 'other');
  });

  minimapCells.forEach(cell => {
    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);
    const here = occupants.get(`${row},${col}`);
    cell.classList.toggle('closed', isRoomClosed(row, col));
    cell.classList.toggle('self', !!(here && here.self));
    cell.classList.toggle('busy', !!(here && here.others > 0));
    const count = here ? here.others + (here.self ? 1 : 0) : 0;
    cell.textContent = count > 0 ? String(count) : '';
  });

  const secondsLeft = Math.max(0, Math.ceil((state.mapActiveUntil - now) / 1000));
  const timer = document.getElementById('minimap-timer');
  if (timer) timer.textContent = `${secondsLeft}s`;
  const bar = document.getElementById('minimap-bar-fill');
  if (bar) bar.style.width = `${Math.max(0, Math.min(1, (state.mapActiveUntil - now) / MAP_DURATION_MS)) * 100}%`;
}

/* --------------------------------------------------------------- overlays */

function updateDoorOverlay() {
  doorLayer.clear();
  const neighbors = roomNeighbors(state.me.roomRow, state.me.roomCol);
  const bar = 8;
  if (neighbors.up && playersInRoom(state.me.roomRow - 1, state.me.roomCol) >= 2) {
    doorLayer.rect(DOOR_LO * TILE, 0, (DOOR_HI - DOOR_LO + 1) * TILE, bar).fill({ color: '#f87171', alpha: 0.85 });
  }
  if (neighbors.down && playersInRoom(state.me.roomRow + 1, state.me.roomCol) >= 2) {
    doorLayer.rect(DOOR_LO * TILE, ROWS * TILE - bar, (DOOR_HI - DOOR_LO + 1) * TILE, bar).fill({ color: '#f87171', alpha: 0.85 });
  }
  if (neighbors.left && playersInRoom(state.me.roomRow, state.me.roomCol - 1) >= 2) {
    doorLayer.rect(0, DOOR_LO * TILE, bar, (DOOR_HI - DOOR_LO + 1) * TILE).fill({ color: '#f87171', alpha: 0.85 });
  }
  if (neighbors.right && playersInRoom(state.me.roomRow, state.me.roomCol + 1) >= 2) {
    doorLayer.rect(COLS * TILE - bar, DOOR_LO * TILE, bar, (DOOR_HI - DOOR_LO + 1) * TILE).fill({ color: '#f87171', alpha: 0.85 });
  }

  const directions = [
    { dir: 'up', row: state.me.roomRow - 1, col: state.me.roomCol, x: DOOR_LO * TILE, y: 0, width: (DOOR_HI - DOOR_LO + 1) * TILE, height: bar },
    { dir: 'down', row: state.me.roomRow + 1, col: state.me.roomCol, x: DOOR_LO * TILE, y: ROWS * TILE - bar, width: (DOOR_HI - DOOR_LO + 1) * TILE, height: bar },
    { dir: 'left', row: state.me.roomRow, col: state.me.roomCol - 1, x: 0, y: DOOR_LO * TILE, width: bar, height: (DOOR_HI - DOOR_LO + 1) * TILE },
    { dir: 'right', row: state.me.roomRow, col: state.me.roomCol + 1, x: COLS * TILE - bar, y: DOOR_LO * TILE, width: bar, height: (DOOR_HI - DOOR_LO + 1) * TILE }
  ];
  directions.forEach(direction => {
    if (direction.row < 0 || direction.row >= GRID_SIZE || direction.col < 0 || direction.col >= GRID_SIZE) return;
    if (neighbors[direction.dir]) {
      const warning = getRoomClosureWarning(direction.row, direction.col);
      if (warning.warning) {
        doorLayer.rect(direction.x, direction.y, direction.width, direction.height).fill({ color: '#e9c46a', alpha: 0.9 });
      } else if (warning.closing) {
        doorLayer.rect(direction.x, direction.y, direction.width, direction.height).fill({ color: '#f87171', alpha: 0.95 });
      }
    }
  });
}

function getLabel(id) {
  if (!nameLabels[id]) {
    const label = new PIXI.Text({
      text: '',
      style: { fontFamily: 'monospace', fontSize: 10, fill: 0xf5ebe0, fontWeight: 'bold' }
    });
    label.anchor.set(0.5, 1);
    labelLayer.addChild(label);
    nameLabels[id] = label;
  }
  return nameLabels[id];
}

function drawHumanoid(graphics, startX, startY, size, bounce, facing, bodyColor, accentColor, alive, spectator) {
  const quarter = size / 4;
  const x = startX;
  const y = startY - bounce;
  const alpha = spectator ? 0.35 : alive ? 1 : 0.25;
  for (let index = 0; index < 4; index++) {
    const color = index === 1 ? accentColor || '#5c4033' : bodyColor || '#e9c46a';
    graphics.rect(x, y + index * quarter, size, quarter).fill({ color, alpha });
  }
  let eyeY = y + quarter + 2;
  let firstEyeX = x + 4;
  let secondEyeX = x + size - 8;
  if (facing === 'left') { firstEyeX -= 2; secondEyeX -= 2; }
  if (facing === 'right') { firstEyeX += 2; secondEyeX += 2; }
  if (facing === 'up') eyeY -= 2;
  graphics.rect(firstEyeX, eyeY, 3, 3).fill({ color: '#ffffff', alpha });
  graphics.rect(secondEyeX, eyeY, 3, 3).fill({ color: '#ffffff', alpha });
  let firstPupilX = firstEyeX + 1;
  let secondPupilX = secondEyeX + 1;
  if (facing === 'right') { firstPupilX += 1; secondPupilX += 1; }
  if (facing === 'left') { firstPupilX -= 1; secondPupilX -= 1; }
  graphics.rect(firstPupilX, eyeY + 1, 2, 2).fill({ color: '#000000', alpha });
  graphics.rect(secondPupilX, eyeY + 1, 2, 2).fill({ color: '#000000', alpha });
}

function drawEnemySprite(graphics, startX, startY, size, bounce) {
  const quarter = size / 4;
  const x = startX;
  const y = startY - bounce;
  graphics.rect(x + 4, y + quarter * 3, size - 8, quarter).fill('#991b1b');
  graphics.rect(x + 2, y + quarter * 2, size - 4, quarter).fill('#dc2626');
  graphics.rect(x + 4, y + quarter, size - 8, quarter).fill('#7f8c8d');
  graphics.rect(x + size / 2 - 2, y - 2, 4, 5).fill('#f87171');
  graphics.rect(x + size - 10, y + quarter * 2 + 2, 6, quarter).fill('#95a5a6');
  graphics.rect(x + 6, y + quarter + 2, 3, 3).fill('#ffffff');
  graphics.rect(x + size - 10, y + quarter + 2, 3, 3).fill('#ffffff');
}

function healthBarColor(percent) {
  return percent <= 0.3 ? '#f87171' : percent <= 0.6 ? 'orange' : '#7fd88f';
}

function drawHealthBar(graphics, px, py, health) {
  const width = TILE - 14;
  const height = 4;
  const x = px + 7;
  const y = py - 4;
  const percent = Math.max(0, Math.min(1, health / MAX_HEALTH));
  graphics.rect(x, y, width, height).fill({ color: '#2c2219' });
  if (percent > 0) graphics.rect(x, y, width * percent, height).fill({ color: healthBarColor(percent) });
}

function gameScreenVisible() {
  const screen = document.getElementById('screen-game');
  return !!screen && !screen.classList.contains('hidden');
}

function render(ticker) {
  const deltaMs = ticker && typeof ticker.deltaMS === 'number' ? ticker.deltaMS : 16;
  const screenActive = gameScreenVisible();

  state.enemies.forEach(enemy => {
    const roomKey = `${enemy.roomRow},${enemy.roomCol}`;
    if (enemy._roomKey !== roomKey || enemy.renderX === undefined) {
      enemy.renderX = enemy.x * TILE;
      enemy.renderY = enemy.y * TILE;
      enemy._roomKey = roomKey;
    } else {
      enemy.renderX += (enemy.x * TILE - enemy.renderX) * 0.25;
      enemy.renderY += (enemy.y * TILE - enemy.renderY) * 0.25;
    }
  });
  state.me.renderX += (state.me.x * TILE - state.me.renderX) * 0.3;
  state.me.renderY += (state.me.y * TILE - state.me.renderY) * 0.3;
  updateDoorOverlay();

  if (screenActive) {
    updateParticles(deltaMs);
    drawParticles();
    updateLighting();
    updateMinimap();
  } else {
    fxLayer.clear();
    lightingLayer.visible = false;
  }

  itemLayer.clear();
  state.items.forEach(item => {
    if (!item.available || item.roomRow !== state.me.roomRow || item.roomCol !== state.me.roomCol) return;
    const centerX = item.x * TILE + TILE / 2;
    const centerY = item.y * TILE + TILE / 2;
    if (item.type === 'weapon') {
      itemLayer.poly([centerX, centerY - 10, centerX + 9, centerY + 8, centerX - 9, centerY + 8]).fill('#f87171').stroke({ width: 2, color: '#7a2e2e' });
    } else if (item.type === 'map') {
      itemLayer.rect(centerX - 9, centerY - 7, 18, 14).fill('#e9c46a').stroke({ width: 2, color: '#6e463b' });
      itemLayer.rect(centerX - 3, centerY - 7, 2, 14).fill('#6e463b');
      itemLayer.rect(centerX + 3, centerY - 7, 2, 14).fill('#6e463b');
    } else {
      itemLayer.circle(centerX, centerY, 10).fill('#5ec8ff').stroke({ width: 2, color: '#23506b' });
    }
  });

  enemyLayer.clear();
  state.enemies.forEach(enemy => {
    if (enemy.roomRow !== state.me.roomRow || enemy.roomCol !== state.me.roomCol) return;
    const bounce = Math.abs(Math.sin((Date.now() / 150) + enemy.x)) * 3;
    drawEnemySprite(enemyLayer, enemy.renderX, enemy.renderY, TILE, bounce);
  });

  playerLayer.clear();
  Object.keys(nameLabels).forEach(id => {
    if (id !== state.selfId && !state.peers[id]) {
      nameLabels[id].destroy();
      delete nameLabels[id];
    }
  });
  Object.keys(state.peers).forEach(id => {
    const peer = state.peers[id];
    const inRoom = peer && peer.name && peer.x !== undefined && peer.roomRow === state.me.roomRow && peer.roomCol === state.me.roomCol;
    const label = getLabel(id);
    label.visible = !!inRoom;
    if (!inRoom) return;
    const x = peer.x * TILE;
    const y = peer.y * TILE;
    const bounce = Math.abs(Math.sin((Date.now() / 200) + id.length)) * 4;
    drawHumanoid(playerLayer, x, y, TILE, bounce, peer.facing || 'down', colorForId(id), '#5c4033', peer.alive, peer.spectator);
    drawHealthBar(playerLayer, x, y, peer.health);
    if (peer.shieldActiveUntil > Date.now()) playerLayer.circle(x + TILE / 2, y + TILE / 2, TILE * 0.4).stroke({ width: 2, color: '#5ec8ff' });
    if (peer.weaponActiveUntil > Date.now()) playerLayer.circle(x + TILE / 2, y + TILE / 2, TILE * 0.44).stroke({ width: 2, color: '#f87171' });
    label.text = `${peer.name}${peer.spectator ? ' (spec)' : ''}`;
    label.position.set(x + TILE / 2, y - 10);
  });

  const now = Date.now();
  const myBounce = Math.abs(Math.sin(now / 200)) * 4;
  drawHumanoid(playerLayer, state.me.renderX, state.me.renderY, TILE, myBounce, state.me.facing, colorForId(state.selfId), '#5c4033', state.me.alive, state.isSpectator);
  drawHealthBar(playerLayer, state.me.renderX, state.me.renderY, state.me.health);
  if (state.me.shieldActiveUntil > now) playerLayer.circle(state.me.renderX + TILE / 2, state.me.renderY + TILE / 2, TILE * 0.4).stroke({ width: 2, color: '#5ec8ff' });
  if (state.me.weaponActiveUntil > now) playerLayer.circle(state.me.renderX + TILE / 2, state.me.renderY + TILE / 2, TILE * 0.44).stroke({ width: 2, color: '#f87171' });
  const myLabel = getLabel(state.selfId);
  myLabel.visible = true;
  myLabel.text = `${state.myName} (you)`;
  myLabel.position.set(state.me.renderX + TILE / 2, state.me.renderY - 10);

  const roster = aliveRoster();
  const aliveCount = roster.filter(player => player.alive && !player.spectator).length;
  const totalCount = roster.filter(player => !player.spectator).length;
  const playerName = document.getElementById('player-name-display');
  if (playerName) playerName.textContent = state.myName || '—';
  const arenaLabel = document.getElementById('arena-label');
  if (arenaLabel) arenaLabel.textContent = state.myName || 'Player';
  const arenaCode = document.getElementById('arena-code');
  if (arenaCode && state.gameState === GAME_STATE.IN_GAME) arenaCode.textContent = `Players left: ${aliveCount}/${totalCount}`;

  const healthPercent = Math.max(0, Math.min(1, state.me.health / MAX_HEALTH));
  const healthFill = document.getElementById('health-bar-fill');
  healthFill.style.width = `${healthPercent * 100}%`;
  healthFill.style.background = healthBarColor(healthPercent);
  document.getElementById('health-bar-label').textContent = `${Math.max(0, state.me.health)}/${MAX_HEALTH}`;

  const baseTimerLabel = document.getElementById('base-timer-label');
  const baseTimerPath = document.getElementById('base-timer-path-remaining');
  if (state.gameState === GAME_STATE.IN_GAME && state.gameStartedAt) {
    const remaining = Math.max(0, GAME_DURATION_MS - (Date.now() - state.gameStartedAt));
    const seconds = Math.ceil(remaining / 1000);
    if (baseTimerLabel) baseTimerLabel.textContent = `${seconds}s`;
    if (baseTimerPath) {
      baseTimerPath.setAttribute('stroke-dasharray', `${(remaining / GAME_DURATION_MS * FULL_DASH_ARRAY).toFixed(0)} 283`);
      baseTimerPath.classList.remove('green', 'orange', 'red');
      if (seconds <= 10) baseTimerPath.classList.add('red');
      else if (seconds <= 30) baseTimerPath.classList.add('orange');
      else baseTimerPath.classList.add('green');
    }
  }

  const countdown = document.getElementById('waiting-countdown');
  if (countdown && state.gameState === GAME_STATE.IN_GAME && !state.me.alive) {
    countdown.textContent = `Next round in ${Math.max(0, Math.ceil((state.gameEndAt - Date.now()) / 1000))}s`;
  }

  const weaponInventory = document.getElementById('inventory-weapon');
  const shieldInventory = document.getElementById('inventory-shield');
  const mapInventory = document.getElementById('inventory-map');
  const inventoryEmpty = document.getElementById('inventory-empty');
  const inventoryPanel = document.getElementById('inventory-panel');
  const weaponCount = state.me.weaponCount || 0;
  const shieldCount = state.me.shieldCount || 0;
  const mapActive = state.mapActiveUntil > now;
  const hasItems = weaponCount > 0 || shieldCount > 0 || mapActive;
  if (weaponInventory) {
    weaponInventory.querySelector('span').textContent = `x${weaponCount}`;
    weaponInventory.classList.toggle('active', state.me.weaponActiveUntil > now);
    weaponInventory.style.display = weaponCount > 0 ? 'flex' : 'none';
  }
  if (shieldInventory) {
    shieldInventory.querySelector('span').textContent = `x${shieldCount}`;
    shieldInventory.classList.toggle('active', state.me.shieldActiveUntil > now);
    shieldInventory.style.display = shieldCount > 0 ? 'flex' : 'none';
  }
  if (mapInventory) {
    mapInventory.querySelector('span').textContent = mapActive
      ? `${Math.max(0, Math.ceil((state.mapActiveUntil - now) / 1000))}s`
      : '';
    mapInventory.classList.toggle('active', mapActive);
    mapInventory.style.display = mapActive ? 'flex' : 'none';
  }
  if (inventoryEmpty) inventoryEmpty.style.display = hasItems ? 'none' : 'block';
  if (inventoryPanel) inventoryPanel.classList.toggle('has-items', hasItems);
  document.getElementById('btn-attack').classList.toggle('ready', weaponCount > 0);
  document.getElementById('btn-defend').classList.toggle('ready', shieldCount > 0);

  // #room-info is visually hidden but kept as a screen-reader/debug source of
  // the room state that the canvas can only communicate visually.
  const roomHere = playersInRoom(state.me.roomRow, state.me.roomCol);
  let roomInfo = `Room (${state.me.roomRow + 1},${state.me.roomCol + 1}) · ${roomTypeLabel(state.me.roomRow, state.me.roomCol)} · ${roomHere}/2 here`;
  if (state.gameState === GAME_STATE.IN_GAME) {
    const warning = getRoomClosureWarning(state.me.roomRow, state.me.roomCol);
    if (warning.warning) roomInfo += ` · ⚠️ closing in ${Math.ceil(warning.msLeft / 1000)}s`;
    else if (warning.closing) roomInfo += ` · 💀 CLOSED`;
  }
  document.getElementById('room-info').textContent = roomInfo;

  document.getElementById('alive-count').textContent = `Players alive: ${aliveCount} / ${totalCount}`;

  const winner = checkWinner();
  const winnerBanner = document.getElementById('winner-banner');
  if (state.gameState !== GAME_STATE.PODIUM && winner) {
    document.getElementById('winner-text').textContent = winner === DRAW_RESULT ? 'No survivors' : `${winner} wins!`;
    winnerBanner.classList.remove('hidden');
  } else {
    winnerBanner.classList.add('hidden');
  }

  if (state.gameState === GAME_STATE.IN_GAME && !state.me.alive) {
    document.getElementById('game-in-progress-overlay').classList.remove('hidden');
  }

  const list = document.getElementById('playerlist');
  list.innerHTML = roster.map(player =>
    `<div><span>${player.name}${player.id === state.selfId ? ' (you)' : ''}${player.spectator ? ' · spectating' : ''}</span><span>${player.alive ? 'alive' : 'eliminated'}</span></div>`
  ).join('');
}

function colorForId(id) {
  let hash = 0;
  for (let index = 0; index < id.length; index++) hash = id.charCodeAt(index) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360},70%,55%)`;
}

/** Drops every runtime particle and light; used when tearing the view down. */
export function teardownRenderFx() {
  embers = [];
  ambientParticles = [];
  torchPlacements = [];
  if (fxLayer) fxLayer.clear();
  if (lightingLayer) lightingLayer.visible = false;
}

export function getRenderLayers() {
  return { mapLayer, doorLayer, itemLayer, enemyLayer, fxLayer, lightingLayer, playerLayer, labelLayer };
}

export function getRenderApp() {
  return app;
}
