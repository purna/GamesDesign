import { COLS, ROWS, GRID_SIZE, DOOR_LO, DOOR_HI, TILE_ID } from './config.js';

/** Walls and pillars block movement; floors and doorways do not. */
export function isSolidTile(tileId) {
  return tileId === TILE_ID.WALL || tileId === TILE_ID.PILLAR;
}

export function isWalkableTile(tileId) {
  return !isSolidTile(tileId);
}

export function isInterior(row, col) {
  return row >= 1 && row <= 3 && col >= 1 && col <= 3;
}

export function isCorner(row, col) {
  return (row === 0 || row === GRID_SIZE - 1) && (col === 0 || col === GRID_SIZE - 1);
}

export function roomNeighbors(row, col) {
  return {
    up: row > 0,
    down: row < GRID_SIZE - 1,
    left: col > 0,
    right: col < GRID_SIZE - 1
  };
}

export function roomTypeLabel(row, col) {
  return isCorner(row, col) ? 'Corner' : (isInterior(row, col) ? 'Interior' : 'Spawn');
}

export function buildRoomMap(neighbors, hasPillar) {
  const map = [];
  for (let row = 0; row < ROWS; row++) {
    const tiles = [];
    for (let col = 0; col < COLS; col++) {
      const isBorder = row === 0 || row === ROWS - 1 || col === 0 || col === COLS - 1;
      let tile = isBorder ? TILE_ID.WALL : TILE_ID.FLOOR;
      if (isBorder) {
        if (row === 0 && neighbors.up && col >= DOOR_LO && col <= DOOR_HI) tile = TILE_ID.DOOR;
        if (row === ROWS - 1 && neighbors.down && col >= DOOR_LO && col <= DOOR_HI) tile = TILE_ID.DOOR;
        if (col === 0 && neighbors.left && row >= DOOR_LO && row <= DOOR_HI) tile = TILE_ID.DOOR;
        if (col === COLS - 1 && neighbors.right && row >= DOOR_LO && row <= DOOR_HI) tile = TILE_ID.DOOR;
      }
      tiles.push(tile);
    }
    map.push(tiles);
  }
  if (hasPillar) map[6][6] = TILE_ID.PILLAR;
  return map;
}

export function getRoomMap(row, col) {
  return buildRoomMap(roomNeighbors(row, col), isInterior(row, col));
}

export const ENEMY_ROOM_MAP = getRoomMap(1, 1);
