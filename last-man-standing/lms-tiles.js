import { TILE, DECOR, ROOM_THEMES, TILE_ID } from './config.js';

/**
 * Room themes are keyed by room type ('corner' | 'interior' | 'spawn'), so the
 * palette for a given room is stable across rebakes — nothing here is random.
 */
export function resolveTheme(roomType) {
  return ROOM_THEMES[roomType] || ROOM_THEMES.interior;
}

function getStitchNoise(px, py) {
  const value = Math.sin(px * 12.9898 + py * 78.233) * 43758.5453123;
  return value - Math.floor(value);
}

/**
 * Integer hash rather than the sin-based one: the sine version repeats along
 * diagonals, which made the decoration read as a visible lattice.
 */
function getDecorNoise(col, row, salt = 0) {
  let hash = Math.imul(col + 1, 374761393) ^ Math.imul(row + 1, 668265263) ^ Math.imul(salt + 1, 2246822519);
  hash = Math.imul(hash ^ (hash >>> 13), 1274126177);
  return ((hash ^ (hash >>> 16)) >>> 0) / 4294967296;
}

function drawCrack(context, tx, ty, col, row, theme) {
  let x = tx + 7 + getDecorNoise(col, row, 41) * 12;
  let y = ty + 7 + getDecorNoise(col, row, 43) * 10;
  context.save();
  context.strokeStyle = theme.crack;
  context.globalAlpha = 0.48;
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(x, y);
  for (let index = 0; index < 4; index++) {
    x += (getDecorNoise(col + index, row + index, 47 + index) - 0.5) * 16;
    y += 5 + getDecorNoise(col + index, row + index, 53 + index) * 7;
    context.lineTo(x, y);
  }
  context.stroke();
  context.restore();
}

function drawMoss(context, tx, ty, col, row, theme) {
  context.save();
  context.fillStyle = theme.moss;
  context.globalAlpha = 0.42;
  for (let index = 0; index < 5; index++) {
    const x = tx + 6 + getDecorNoise(col, row, 61 + index) * 28;
    const y = ty + 6 + getDecorNoise(col, row, 67 + index) * 28;
    const radius = 2 + getDecorNoise(col, row, 71 + index) * 4;
    context.beginPath();
    context.ellipse(x, y, radius, radius * 0.65, getDecorNoise(col, row, 73 + index), 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
}

function drawPebbles(context, tx, ty, col, row, theme) {
  context.save();
  for (let index = 0; index < 3; index++) {
    const x = tx + 5 + getDecorNoise(col, row, 81 + index) * 29;
    const y = ty + 5 + getDecorNoise(col, row, 83 + index) * 29;
    const size = 2 + getDecorNoise(col, row, 87 + index) * 3;
    context.fillStyle = index % 2 ? theme.pebbleDark : theme.pebbleLight;
    context.globalAlpha = 0.65;
    context.beginPath();
    context.ellipse(x, y, size, size * 0.7, getDecorNoise(col, row, 89 + index), 0, Math.PI * 2);
    context.fill();
  }
  context.restore();
}

/** Irregular soaked-in blotch: grime, soot or something older. */
function drawStain(context, tx, ty, col, row, theme) {
  const centerX = tx + 8 + getDecorNoise(col, row, 141) * 24;
  const centerY = ty + 8 + getDecorNoise(col, row, 143) * 24;
  context.save();
  context.fillStyle = theme.stain;
  for (let ring = 0; ring < 3; ring++) {
    context.globalAlpha = 0.26 - ring * 0.07;
    context.beginPath();
    for (let step = 0; step <= 10; step++) {
      const angle = (step / 10) * Math.PI * 2;
      const wobble = 5 + ring * 3 + getDecorNoise(col + step, row, 147 + ring) * 5;
      const x = centerX + Math.cos(angle) * wobble;
      const y = centerY + Math.sin(angle) * wobble * 0.72;
      if (step === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.closePath();
    context.fill();
  }
  context.restore();
}

/** Shallow standing water with a rim and a couple of specular flecks. */
function drawPuddle(context, tx, ty, col, row, theme) {
  const centerX = tx + 10 + getDecorNoise(col, row, 151) * 20;
  const centerY = ty + 12 + getDecorNoise(col, row, 153) * 16;
  const width = 7 + getDecorNoise(col, row, 157) * 8;
  const height = width * (0.5 + getDecorNoise(col, row, 159) * 0.2);
  context.save();
  context.globalAlpha = 0.46;
  context.fillStyle = theme.puddle;
  context.beginPath();
  context.ellipse(centerX, centerY, width, height, 0, 0, Math.PI * 2);
  context.fill();
  context.globalAlpha = 0.5;
  context.strokeStyle = theme.crack;
  context.lineWidth = 1;
  context.stroke();
  context.globalAlpha = 0.55;
  context.fillStyle = theme.puddleLight;
  context.fillRect(centerX - width * 0.5, centerY - height * 0.4, Math.max(2, width * 0.5), 1);
  context.fillRect(centerX + width * 0.1, centerY + height * 0.15, Math.max(2, width * 0.28), 1);
  context.restore();
}

/** Straw, splinters, bone chips — the floor of a room nobody sweeps. */
function drawLitter(context, tx, ty, col, row, theme) {
  context.save();
  for (let index = 0; index < 5; index++) {
    const x = tx + 4 + getDecorNoise(col, row, 161 + index) * 30;
    const y = ty + 4 + getDecorNoise(col, row, 167 + index) * 30;
    const length = 2 + getDecorNoise(col, row, 173 + index) * 5;
    const angle = getDecorNoise(col, row, 179 + index) * Math.PI;
    context.globalAlpha = 0.5 + getDecorNoise(col, row, 181 + index) * 0.3;
    context.strokeStyle = index % 3 === 0 ? theme.rubble : theme.litter;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
    context.stroke();
  }
  context.restore();
}

/** Weeds pushing up through the joints. */
function drawPlant(context, tx, ty, col, row, theme) {
  const baseX = tx + 8 + getDecorNoise(col, row, 191) * 24;
  const baseY = ty + 26 + getDecorNoise(col, row, 193) * 8;
  context.save();
  context.globalAlpha = 0.8;
  for (let stem = 0; stem < 3; stem++) {
    const lean = (getDecorNoise(col, row, 197 + stem) - 0.5) * 7;
    const height = 6 + getDecorNoise(col, row, 199 + stem) * 7;
    const x = baseX + (stem - 1) * 3;
    context.strokeStyle = theme.plant;
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(x, baseY);
    context.quadraticCurveTo(x + lean * 0.5, baseY - height * 0.6, x + lean, baseY - height);
    context.stroke();
    context.fillStyle = stem % 2 ? theme.plantLight : theme.plant;
    context.beginPath();
    context.ellipse(x + lean, baseY - height, 2.2, 1.4, lean * 0.2, 0, Math.PI * 2);
    context.fill();
  }
  context.fillStyle = theme.moss;
  context.globalAlpha = 0.45;
  context.beginPath();
  context.ellipse(baseX, baseY + 1, 5, 2, 0, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

/** A flagstone that has given up: sunken, chipped, showing the rubble beneath. */
function drawBrokenTile(context, tx, ty, col, row, theme) {
  const x = tx + 4 + getDecorNoise(col, row, 203) * 12;
  const y = ty + 4 + getDecorNoise(col, row, 207) * 12;
  const width = 10 + getDecorNoise(col, row, 211) * 12;
  const height = 8 + getDecorNoise(col, row, 213) * 12;
  const jitter = (salt, scale) => (getDecorNoise(col, row, salt) - 0.5) * scale;
  context.save();
  // Sunken slab: darker floor, not a black hole.
  context.globalAlpha = 0.5;
  context.fillStyle = theme.floorDark;
  context.beginPath();
  context.moveTo(x + jitter(215, 4), y + jitter(217, 3));
  context.lineTo(x + width + jitter(219, 5), y + jitter(221, 4));
  context.lineTo(x + width + jitter(223, 4), y + height + jitter(227, 4));
  context.lineTo(x + jitter(229, 5), y + height + jitter(231, 3));
  context.closePath();
  context.fill();
  context.globalAlpha = 0.65;
  context.strokeStyle = theme.crack;
  context.lineWidth = 1;
  context.stroke();
  // Split across the slab, offset per tile.
  context.beginPath();
  context.moveTo(x + 1, y + height * (0.35 + getDecorNoise(col, row, 233) * 0.3));
  context.lineTo(x + width - 1, y + height * (0.4 + getDecorNoise(col, row, 239) * 0.3));
  context.stroke();
  context.globalAlpha = 0.6;
  context.fillStyle = theme.pebbleDark;
  for (let index = 0; index < 3; index++) {
    context.fillRect(
      x + 2 + getDecorNoise(col, row, 241 + index) * (width - 4),
      y + 2 + getDecorNoise(col, row, 251 + index) * (height - 4),
      2, 2
    );
  }
  context.restore();
}

function drawGroundDetails(context, tx, ty, col, row, theme, roomType) {
  const crackNoise = getDecorNoise(col, row, 11);
  const mossNoise = getDecorNoise(col, row, 23);
  const pebbleNoise = getDecorNoise(col, row, 37);
  const stainNoise = getDecorNoise(col, row, 139);
  const puddleNoise = getDecorNoise(col, row, 149);
  const litterNoise = getDecorNoise(col, row, 163);
  const plantNoise = getDecorNoise(col, row, 189);
  const brokenNoise = getDecorNoise(col, row, 201);

  // Order matters: ground damage first, then what has grown or collected on it.
  if (brokenNoise < DECOR.BROKEN_TILE_PROBABILITY) drawBrokenTile(context, tx, ty, col, row, theme);
  if (crackNoise < DECOR.CRACK_PROBABILITY) drawCrack(context, tx, ty, col, row, theme);
  if (stainNoise < DECOR.STAIN_PROBABILITY) drawStain(context, tx, ty, col, row, theme);
  if (puddleNoise < DECOR.PUDDLE_PROBABILITY) drawPuddle(context, tx, ty, col, row, theme);
  if (mossNoise < DECOR.MOSS_PROBABILITY) drawMoss(context, tx, ty, col, row, theme);
  if (plantNoise < DECOR.PLANT_PROBABILITY) drawPlant(context, tx, ty, col, row, theme);
  if (pebbleNoise > 1 - DECOR.PEBBLE_PROBABILITY) drawPebbles(context, tx, ty, col, row, theme);
  if (litterNoise < DECOR.LITTER_PROBABILITY) drawLitter(context, tx, ty, col, row, theme);

  // Corner rooms are the ruined ones: extra rubble scatter.
  if (roomType === 'corner' && pebbleNoise > 0.72) {
    context.save();
    context.fillStyle = theme.rubble;
    context.globalAlpha = 0.55;
    for (let index = 0; index < 3; index++) {
      const x = tx + 4 + getDecorNoise(col, row, 97 + index) * 31;
      const y = ty + 4 + getDecorNoise(col, row, 101 + index) * 31;
      context.fillRect(x, y, 2 + index, 2 + (index % 2));
    }
    context.restore();
  }
}

function isWalkableAt(roomMap, x, y) {
  if (x < 0 || y < 0 || y >= roomMap.length || x >= roomMap[0].length) return false;
  const tile = roomMap[y][x];
  return tile === TILE_ID.FLOOR || tile === TILE_ID.DOOR;
}

function getTorchSide(roomMap, col, row) {
  if (isWalkableAt(roomMap, col, row - 1)) return 'down';
  if (isWalkableAt(roomMap, col, row + 1)) return 'up';
  if (isWalkableAt(roomMap, col - 1, row)) return 'right';
  if (isWalkableAt(roomMap, col + 1, row)) return 'left';
  return null;
}

function torchAnchor(tx, ty, side) {
  const centerX = tx + TILE / 2;
  const centerY = ty + TILE / 2;
  let x = centerX;
  let y = centerY;
  let flameX = x;
  let flameY = y;
  let bracketX = x;
  let bracketY = y;

  if (side === 'down') {
    y = ty + TILE - 8;
    flameY = y + 7;
    bracketY = y - 3;
  } else if (side === 'up') {
    y = ty + 8;
    flameY = y - 7;
    bracketY = y + 3;
  } else if (side === 'right') {
    x = tx + TILE - 8;
    flameX = x + 7;
    bracketX = x - 3;
  } else {
    x = tx + 8;
    flameX = x - 7;
    bracketX = x + 3;
  }
  return { x, y, flameX, flameY, bracketX, bracketY };
}

/**
 * Deterministic torch placement for a room map. The baked art and the runtime
 * particle/light layer both read this, so embers always come out of a torch.
 * Flame positions are returned in room pixel space.
 */
export function getTorchPlacements(roomMap) {
  const placements = [];
  const rows = roomMap.length;
  const cols = roomMap[0].length;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (roomMap[row][col] !== TILE_ID.WALL) continue;
      const side = getTorchSide(roomMap, col, row);
      if (!side) continue;
      const seed = getDecorNoise(col, row, 101);
      if (seed > DECOR.TORCH_DENSITY) continue;
      const anchor = torchAnchor(col * TILE, row * TILE, side);
      placements.push({ col, row, side, seed, x: anchor.flameX, y: anchor.flameY });
    }
  }
  return placements;
}

function drawTorch(context, placement, theme) {
  const { side } = placement;
  const { x, y, flameX, flameY, bracketX, bracketY } = torchAnchor(placement.col * TILE, placement.row * TILE, side);
  const vertical = side === 'left' || side === 'right';

  context.save();
  const glow = context.createRadialGradient(flameX, flameY, 1, flameX, flameY, DECOR.TORCH_GLOW_RADIUS);
  glow.addColorStop(0, `rgba(${theme.glowRgb}, 0.42)`);
  glow.addColorStop(0.55, `rgba(${theme.glowRgb}, 0.18)`);
  glow.addColorStop(1, `rgba(${theme.glowRgb}, 0)`);
  context.fillStyle = glow;
  context.beginPath();
  context.arc(flameX, flameY, DECOR.TORCH_GLOW_RADIUS, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = theme.torchHandle;
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(bracketX, bracketY);
  context.lineTo(x, y);
  context.stroke();
  context.fillStyle = theme.pillar;
  context.fillRect(bracketX - 3, bracketY - 2, 6, 4);

  context.fillStyle = theme.flameOuter;
  context.beginPath();
  context.ellipse(flameX, flameY, 4.5, 7, vertical ? Math.PI / 2 : 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = theme.flameMid;
  context.beginPath();
  context.ellipse(flameX, flameY, 2.8, 4.8, vertical ? Math.PI / 2 : 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = theme.flameCore;
  context.beginPath();
  context.ellipse(flameX, flameY, 1.4, 2.5, vertical ? Math.PI / 2 : 0, 0, Math.PI * 2);
  context.fill();

  // A couple of static embers stay baked in; the moving ones come from render.js.
  for (let index = 0; index < DECOR.TORCH_EMBER_COUNT; index++) {
    const angle = getDecorNoise(placement.col, placement.row, 113 + index) * Math.PI * 2;
    const distance = 7 + getDecorNoise(placement.col, placement.row, 127 + index) * 10;
    const emberX = flameX + Math.cos(angle) * distance;
    const emberY = flameY + Math.sin(angle) * distance - 3;
    context.fillStyle = index % 2 ? theme.flameCore : theme.flameMid;
    context.globalAlpha = 0.35 + getDecorNoise(placement.col, placement.row, 131 + index) * 0.25;
    context.fillRect(emberX, emberY, 1.5, 1.5);
  }
  context.restore();
}

function getTileEdges(map, id, col, row, rows, cols) {
  const get = (c, r) => (c < 0 || c >= cols || r < 0 || r >= rows) ? TILE_ID.WALL : map[r][c];
  const top = get(col, row - 1);
  const bottom = get(col, row + 1);
  const left = get(col - 1, row);
  const right = get(col + 1, row);
  return {
    top: top !== id,
    bottom: bottom !== id,
    left: left !== id,
    right: right !== id,
    topId: top,
    bottomId: bottom,
    leftId: left,
    rightId: right
  };
}

function drawFloorTile(context, tx, ty, col, row, roomMap, theme, rows, cols) {
  const edges = getTileEdges(roomMap, TILE_ID.FLOOR, col, row, rows, cols);
  for (let y = 0; y < TILE; y += 2) {
    for (let x = 0; x < TILE; x += 2) {
      const seed = getStitchNoise(col * TILE + x, row * TILE + y);
      let shade = seed > 0.88 ? theme.floorDark : theme.floor;
      if (seed > 0.96) shade = theme.floorWave;
      // Shade the edge that meets a wall, warm the edge that meets a doorway.
      if (edges.left && edges.leftId === TILE_ID.WALL && x < 8) shade = seed > 0.5 ? theme.wallDark : theme.floorDark;
      if (edges.right && edges.rightId === TILE_ID.WALL && x > 22) shade = seed > 0.5 ? theme.wallDark : theme.floorDark;
      if (edges.top && edges.topId === TILE_ID.WALL && y < 8) shade = seed > 0.5 ? theme.wallDark : theme.floorDark;
      if (edges.bottom && edges.bottomId === TILE_ID.WALL && y > 22) shade = seed > 0.5 ? theme.wallDark : theme.floorDark;
      if (edges.left && edges.leftId === TILE_ID.DOOR && x < 6) shade = theme.door;
      if (edges.right && edges.rightId === TILE_ID.DOOR && x > 24) shade = theme.door;
      if (edges.top && edges.topId === TILE_ID.DOOR && y < 6) shade = theme.door;
      if (edges.bottom && edges.bottomId === TILE_ID.DOOR && y > 24) shade = theme.door;
      context.fillStyle = shade;
      context.fillRect(tx + x, ty + y, 2, 2);
    }
  }
}

function drawWallTile(context, tx, ty, col, row, theme) {
  for (let y = 0; y < TILE; y += 2) {
    if (y % 10 === 0) {
      context.fillStyle = theme.mortar;
      context.fillRect(tx, ty + y, TILE, 2);
      continue;
    }
    for (let x = 0; x < TILE; x += 2) {
      const seed = getStitchNoise(col * TILE + x, row * TILE + y);
      if (seed > 0.7) context.fillStyle = theme.wallLight;
      else if (seed > 0.4) context.fillStyle = theme.wallDark;
      else continue;
      context.fillRect(tx + x, ty + y, 2, 2);
    }
  }
  // Vertical block seams so courses read as masonry rather than noise.
  context.fillStyle = theme.mortar;
  for (let y = 0; y < TILE; y += 10) {
    const offset = ((y / 10) % 2) * 10;
    context.fillRect(tx + ((offset + 8) % TILE), ty + y, 2, 10);
  }
}

function drawDoorTile(context, tx, ty, col, row, theme, cols) {
  // Doors are deliberately a different material family from the clay walls:
  // dark green-blue timber with iron banding, so an exit reads at a glance.
  const horizontalPassage = col === 0 || col === cols - 1;
  context.fillStyle = theme.doorFrame;
  context.fillRect(tx, ty, TILE, TILE);
  context.fillStyle = theme.door;
  if (horizontalPassage) context.fillRect(tx, ty + 3, TILE, TILE - 6);
  else context.fillRect(tx + 3, ty, TILE - 6, TILE);

  for (let offset = 0; offset < TILE; offset += 9) {
    context.fillStyle = theme.doorDark;
    if (horizontalPassage) context.fillRect(tx + offset, ty + 3, 2, TILE - 6);
    else context.fillRect(tx + 3, ty + offset, TILE - 6, 2);
    context.fillStyle = theme.doorLight;
    if (horizontalPassage) context.fillRect(tx + offset + 3, ty + 3, 1, TILE - 6);
    else context.fillRect(tx + 3, ty + offset + 3, TILE - 6, 1);
  }

  for (let y = 0; y < TILE; y += 2) {
    for (let x = 0; x < TILE; x += 2) {
      const seed = getStitchNoise(col * TILE + x * 3, row * TILE + y * 3);
      if (seed > 0.9) {
        context.fillStyle = theme.doorLight;
        context.fillRect(tx + x, ty + y, 2, 2);
      } else if (seed < 0.06) {
        context.fillStyle = theme.doorDark;
        context.fillRect(tx + x, ty + y, 2, 2);
      }
    }
  }

  // Iron band across the middle plus corner studs.
  context.fillStyle = theme.doorFrame;
  if (horizontalPassage) context.fillRect(tx, ty + TILE / 2 - 2, TILE, 4);
  else context.fillRect(tx + TILE / 2 - 2, ty, 4, TILE);
  context.fillStyle = theme.pebbleLight;
  context.globalAlpha = 0.7;
  context.fillRect(tx + 5, ty + 5, 2, 2);
  context.fillRect(tx + TILE - 7, ty + 5, 2, 2);
  context.fillRect(tx + 5, ty + TILE - 7, 2, 2);
  context.fillRect(tx + TILE - 7, ty + TILE - 7, 2, 2);
  context.globalAlpha = 1;
}

function drawPillarTile(context, tx, ty, theme) {
  context.fillStyle = theme.floorDark;
  context.fillRect(tx, ty, TILE, TILE);
  // Chunky stone drum: base, shaft courses, cap and a cast shadow.
  context.fillStyle = theme.pillar;
  context.fillRect(tx + 3, ty + 2, TILE - 6, TILE - 4);
  context.fillStyle = theme.mortar;
  for (let y = 8; y < TILE - 4; y += 9) {
    context.fillRect(tx + 3, ty + y, TILE - 6, 2);
  }
  context.fillStyle = theme.wallLight;
  context.fillRect(tx + 5, ty + 4, 3, TILE - 10);
  context.fillStyle = theme.crack;
  context.fillRect(tx + TILE - 8, ty + 4, 3, TILE - 10);
  context.fillStyle = theme.wallDark;
  context.fillRect(tx + 1, ty + TILE - 7, TILE - 2, 5);
  context.fillStyle = theme.wallLight;
  context.fillRect(tx + 1, ty + 1, TILE - 2, 3);
  context.save();
  context.fillStyle = theme.rubble;
  context.globalAlpha = 0.5;
  context.fillRect(tx, ty + TILE - 3, TILE, 3);
  context.restore();
}

function renderTileToCtx(context, id, col, row, roomMap, theme, rows, cols) {
  const tx = col * TILE;
  const ty = row * TILE;
  let baseColor = theme.floor;
  if (id === TILE_ID.WALL) baseColor = theme.wall;
  else if (id === TILE_ID.DOOR) baseColor = theme.door;
  else if (id === TILE_ID.PILLAR) baseColor = theme.pillar;
  context.fillStyle = baseColor;
  context.fillRect(tx, ty, TILE, TILE);

  if (id === TILE_ID.FLOOR) drawFloorTile(context, tx, ty, col, row, roomMap, theme, rows, cols);
  else if (id === TILE_ID.WALL) drawWallTile(context, tx, ty, col, row, theme);
  else if (id === TILE_ID.DOOR) drawDoorTile(context, tx, ty, col, row, theme, cols);
  else if (id === TILE_ID.PILLAR) drawPillarTile(context, tx, ty, theme);
}

export function bakeRoomMap(roomMap, roomType) {
  const theme = resolveTheme(roomType);
  const rows = roomMap.length;
  const cols = roomMap[0].length;
  const canvas = document.createElement('canvas');
  canvas.width = cols * TILE;
  canvas.height = rows * TILE;
  const context = canvas.getContext('2d');
  context.imageSmoothingEnabled = false;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      renderTileToCtx(context, roomMap[row][col], col, row, roomMap, theme, rows, cols);
      if (roomMap[row][col] === TILE_ID.FLOOR) {
        drawGroundDetails(context, col * TILE, row * TILE, col, row, theme, roomType);
      }
    }
  }
  getTorchPlacements(roomMap).forEach(placement => drawTorch(context, placement, theme));
  return canvas;
}
