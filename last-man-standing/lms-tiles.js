import { TILE, LMS_PALETTE, DECOR, ROOM_THEMES, TILE_ID } from './config.js';

const flame = LMS_PALETTE;

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

function getDecorNoise(col, row, salt = 0) {
  const value = Math.sin((col + 1) * 12.9898 + (row + 1) * 78.233 + salt * 37.719) * 43758.5453123;
  return value - Math.floor(value);
}

function drawGroundDetails(context, tx, ty, col, row, theme, roomType) {
  const crackNoise = getDecorNoise(col, row, 11);
  const mossNoise = getDecorNoise(col, row, 23);
  const pebbleNoise = getDecorNoise(col, row, 37);

  if (crackNoise < DECOR.CRACK_PROBABILITY) {
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

  if (mossNoise < DECOR.MOSS_PROBABILITY) {
    context.save();
    context.fillStyle = theme.moss;
    context.globalAlpha = 0.42;
    for (let index = 0; index < 4; index++) {
      const x = tx + 6 + getDecorNoise(col, row, 61 + index) * 28;
      const y = ty + 6 + getDecorNoise(col, row, 67 + index) * 28;
      const radius = 2 + getDecorNoise(col, row, 71 + index) * 4;
      context.beginPath();
      context.ellipse(x, y, radius, radius * 0.65, getDecorNoise(col, row, 73 + index), 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
  }

  if (pebbleNoise > 1 - DECOR.PEBBLE_PROBABILITY) {
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
  glow.addColorStop(0, 'rgba(255, 183, 3, 0.42)');
  glow.addColorStop(0.55, 'rgba(255, 140, 66, 0.18)');
  glow.addColorStop(1, 'rgba(255, 140, 66, 0)');
  context.fillStyle = glow;
  context.beginPath();
  context.arc(flameX, flameY, DECOR.TORCH_GLOW_RADIUS, 0, Math.PI * 2);
  context.fill();

  context.strokeStyle = flame.torch_handle;
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(bracketX, bracketY);
  context.lineTo(x, y);
  context.stroke();
  context.fillStyle = theme.pillar;
  context.fillRect(bracketX - 3, bracketY - 2, 6, 4);

  context.fillStyle = flame.torch_red;
  context.beginPath();
  context.ellipse(flameX, flameY, 4.5, 7, vertical ? Math.PI / 2 : 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = flame.torch_orange;
  context.beginPath();
  context.ellipse(flameX, flameY, 2.8, 4.8, vertical ? Math.PI / 2 : 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = flame.torch_yellow;
  context.beginPath();
  context.ellipse(flameX, flameY, 1.4, 2.5, vertical ? Math.PI / 2 : 0, 0, Math.PI * 2);
  context.fill();

  // A couple of static embers stay baked in; the moving ones come from render.js.
  for (let index = 0; index < DECOR.TORCH_EMBER_COUNT; index++) {
    const angle = getDecorNoise(placement.col, placement.row, 113 + index) * Math.PI * 2;
    const distance = 7 + getDecorNoise(placement.col, placement.row, 127 + index) * 10;
    const emberX = flameX + Math.cos(angle) * distance;
    const emberY = flameY + Math.sin(angle) * distance - 3;
    context.fillStyle = index % 2 ? flame.torch_yellow : flame.torch_orange;
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
  // Planks run across the threshold, perpendicular to the direction of travel.
  const horizontalPassage = col === 0 || col === cols - 1;
  context.fillStyle = theme.door;
  context.fillRect(tx, ty, TILE, TILE);
  context.fillStyle = theme.mortar;
  for (let offset = 0; offset < TILE; offset += 8) {
    if (horizontalPassage) context.fillRect(tx + offset, ty, 2, TILE);
    else context.fillRect(tx, ty + offset, TILE, 2);
  }
  for (let y = 0; y < TILE; y += 2) {
    for (let x = 0; x < TILE; x += 2) {
      const seed = getStitchNoise(col * TILE + x * 3, row * TILE + y * 3);
      if (seed > 0.86) {
        context.fillStyle = theme.pebbleLight;
        context.fillRect(tx + x, ty + y, horizontalPassage ? 2 : 4, horizontalPassage ? 4 : 2);
      } else if (seed < 0.08) {
        context.fillStyle = theme.crack;
        context.fillRect(tx + x, ty + y, 2, 2);
      }
    }
  }
  // Iron studs at the jambs.
  context.fillStyle = theme.pillar;
  if (horizontalPassage) {
    context.fillRect(tx + 4, ty + 6, 3, 3);
    context.fillRect(tx + TILE - 7, ty + TILE - 9, 3, 3);
  } else {
    context.fillRect(tx + 6, ty + 4, 3, 3);
    context.fillRect(tx + TILE - 9, ty + TILE - 7, 3, 3);
  }
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
