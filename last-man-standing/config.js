export const TILE = 40;
export const COLS = 13;
export const ROWS = 13;
export const VIEW = COLS * TILE;
export const BUCKET_MS = 60000;
export const MOVE_COOLDOWN = 150;
export const WEAPON_DURATION = 10000;
export const SHIELD_DURATION = 5000;
export const MAP_DURATION_MS = 10000;
export const ITEM_RESPAWN_MS = 12000;
export const GRID_SIZE = 5;
export const DOOR_LO = 5;
export const DOOR_HI = 7;
export const DOOR_LOCK_COUNT = 2;
export const MAX_PLAYERS = 12;
export const MAX_HEALTH = 10;
export const MIN_NAME_LENGTH = 1;
export const MAX_NAME_LENGTH = 10;
export const NAME_PATTERN = /^[a-z]+(?:-[a-z]+)*$/;
export const NAME_RULE_TEXT = 'Names use lowercase letters a-z and single hyphens between words, max 10 characters.';
export const PROFANITY_ENDPOINT = 'https://www.purgomalum.com/service/containsprofanity';
export const PROFANITY_TIMEOUT_MS = 2500;
export const APP_ID = 'last-man-standing-2026-v1';
export const FULL_DASH_ARRAY = 283;
export const WARNING_THRESHOLD = 15;
export const ALERT_THRESHOLD = 5;
export const DRAW_RESULT = '__DRAW__';

export const TILE_ID = Object.freeze({
  FLOOR: 0,
  WALL: 1,
  DOOR: 2,
  PILLAR: 3
});

export const GAME_STATE = Object.freeze({
  WAITING: 'WAITING',
  LOBBY: 'LOBBY',
  IN_GAME: 'IN_GAME',
  PODIUM: 'PODIUM',
  GAME_OVER: 'GAME_OVER'
});

export const WAITING_SECONDS = 60;
export const LOBBY_SECONDS = 60;
export const GAME_DURATION_MS = 180000;
export const GAME_OVER_DELAY_MS = 6000;
export const PODIUM_SECONDS = 12;
export const MIN_PLAYERS_TO_START = 2;

export const SPAWN_ROOMS = Object.freeze([
  { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 },
  { row: 1, col: 0 }, { row: 1, col: 4 },
  { row: 2, col: 0 }, { row: 2, col: 4 },
  { row: 3, col: 0 }, { row: 3, col: 4 },
  { row: 4, col: 1 }, { row: 4, col: 2 }, { row: 4, col: 3 }
]);

export const INTERIOR_ROOMS = Object.freeze(
  Array.from({ length: 3 }, (_, rowOffset) =>
    Array.from({ length: 3 }, (_, colOffset) => ({
      row: rowOffset + 1,
      col: colOffset + 1
    }))
  ).flat()
);

export const CORNER_ROOMS = Object.freeze([
  { row: 0, col: 0 }, { row: 0, col: 4 }, { row: 4, col: 0 }, { row: 4, col: 4 }
]);

export const ROOM_CLOSURE_ORDER = Object.freeze([
  { row: 0, col: 0 }, { row: 0, col: 4 }, { row: 4, col: 0 }, { row: 4, col: 4 },
  { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 },
  { row: 4, col: 1 }, { row: 4, col: 2 }, { row: 4, col: 3 },
  { row: 1, col: 0 }, { row: 2, col: 0 }, { row: 3, col: 0 },
  { row: 1, col: 4 }, { row: 2, col: 4 }, { row: 3, col: 4 },
  { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 1, col: 3 },
  { row: 2, col: 1 }, { row: 2, col: 3 },
  { row: 3, col: 1 }, { row: 3, col: 2 }, { row: 3, col: 3 },
  { row: 2, col: 2 }
]);

export const ROOM_CLOSURE_INTERVAL_MS = 6000;
export const ROOM_CLOSURE_WARNING_MS = 10000;

export const MAP_ITEM_ROOMS = Object.freeze([
  { row: 2, col: 2 }, { row: 1, col: 3 }, { row: 3, col: 1 }
]);

export const DEFAULT_ITEMS = Object.freeze([
  ...INTERIOR_ROOMS.map((room, index) => ({
    id: `item-i${index}`,
    type: index % 2 === 0 ? 'weapon' : 'shield',
    roomRow: room.row,
    roomCol: room.col,
    x: 4,
    y: 4
  })),
  ...CORNER_ROOMS.map((room, index) => ({
    id: `item-c${index}`,
    type: 'weapon',
    roomRow: room.row,
    roomCol: room.col,
    x: 6,
    y: 6
  })),
  ...MAP_ITEM_ROOMS.map((room, index) => ({
    id: `item-m${index}`,
    type: 'map',
    roomRow: room.row,
    roomCol: room.col,
    x: 8,
    y: 8
  }))
]);

export const DEFAULT_ENEMIES = Object.freeze(
  INTERIOR_ROOMS.map((room, index) => ({
    id: `enemy-i${index}`,
    roomRow: room.row,
    roomCol: room.col,
    x: 8,
    y: 4
  }))
);

export const ENEMY_WANDER_CHANCE = 0.5;
export const ENEMY_STEP_INTERVAL_MS = 500;
export const ENEMY_SPAWN_MIN_MS = 6000;
export const ENEMY_SPAWN_MAX_MS = 12000;
export const ENEMY_SPAWN_MIN_COUNT = 1;
export const ENEMY_SPAWN_MAX_COUNT = 3;
export const MAX_ENEMIES = 40;
export const HOST_ASSIGNMENT_DELAY_MS = 800;

export const GAME_TICK_INTERVAL_MS = 200;
export const DAMAGE_TICK_INTERVAL_MS = 1000;
export const COUNTDOWN_INTERVAL_MS = 250;

export const RELAY_URLS = Object.freeze([
  'wss://relay.damus.io',
  'wss://nos.lol'
]);

export const LMS_PALETTE = Object.freeze({
  floor_light: '#e9c46a',
  floor_dark: '#dfb24c',
  floor_wave: '#d4a373',
  wall_clay: '#cd7f60',
  wall_dark: '#b06548',
  wall_light: '#de9678',
  mortar: '#6e463b',
  border_brown: '#4a3b2c',
  bush_green: '#588157',
  rubble: '#5c4033',
  torch_orange: '#ff8c42',
  torch_red: '#e74c3c',
  torch_yellow: '#ffd166',
  torch_glow: '#ffb703',
  torch_handle: '#6b4226',
  moss_green: '#6a994e',
  pebble_light: '#c8b294',
  pebble_dark: '#8d6e63',
  crack_dark: '#7a5c42'
});

export const ROOM_THEMES = Object.freeze({
  corner: {
    floor: '#c9973f',
    floorDark: '#9a6f35',
    floorWave: '#a9743f',
    wall: '#9c5a45',
    wallDark: '#744034',
    wallLight: '#b8735c',
    mortar: '#54382f',
    door: '#7a4a35',
    pillar: '#6e4b3a',
    rubble: '#4a3327',
    moss: '#4a6e3d',
    pebbleLight: '#a28568',
    pebbleDark: '#684f3b',
    crack: '#5a412e'
  },
  interior: {
    floor: '#e9c46a',
    floorDark: '#dfb24c',
    floorWave: '#d4a373',
    wall: '#cd7f60',
    wallDark: '#b06548',
    wallLight: '#de9678',
    mortar: '#6e463b',
    door: '#8a5a3d',
    pillar: '#7c5140',
    rubble: '#5c4033',
    moss: '#5f8a4a',
    pebbleLight: '#b8a284',
    pebbleDark: '#7d6353',
    crack: '#6a4d38'
  },
  spawn: {
    floor: '#d9b76a',
    floorDark: '#bd914a',
    floorWave: '#c49a5c',
    wall: '#b87057',
    wallDark: '#955644',
    wallLight: '#cf886d',
    mortar: '#65453a',
    door: '#7c5139',
    pillar: '#75503f',
    rubble: '#523727',
    moss: '#587a45',
    pebbleLight: '#b09a78',
    pebbleDark: '#725b48',
    crack: '#604532'
  }
});

export const DECOR = Object.freeze({
  TORCH_DENSITY: 0.18,
  GROUND_DETAIL_DENSITY: 0.82,
  CRACK_PROBABILITY: 0.12,
  MOSS_PROBABILITY: 0.08,
  PEBBLE_PROBABILITY: 0.16,
  TORCH_GLOW_RADIUS: 18,
  TORCH_EMBER_COUNT: 4,
  TORCH_MIN_WALL_GAP: 3,
  TORCH_FLICKER_SPEED: 0.006,
  TORCH_EMBER_LIFETIME_MS: 900,
  AMBIENT_PARTICLE_DENSITY: 0.025,
  AMBIENT_PARTICLE_SPEED: 0.18
});

export const MINIMAP = Object.freeze({
  SIZE: 148,
  CELL: 26,
  PAD: 8
});

export const FX = Object.freeze({
  MAX_EMBERS: 90,
  MAX_AMBIENT: 40,
  EMBER_SPAWN_CHANCE: 0.06,
  EMBER_RISE_SPEED: 0.022,
  EMBER_DRIFT: 0.012,
  VIGNETTE_ALPHA: 0.62,
  TORCH_LIGHT_RADIUS: 150,
  TORCH_LIGHT_FLICKER: 0.07,
  GLOW_ALPHA: 0.3
});


