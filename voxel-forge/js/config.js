/**
 * config.js
 * Every tunable number for the class lives here so a teacher can reshape
 * the game (add items, change how hard something is to mine, rename the
 * classroom room) without touching game logic anywhere else.
 */

// ---- Multiplayer (peer-to-peer, no server) --------------------------------
// Trystero rooms are just a shared name two browsers both call joinRoom()
// with. Everyone who types the same CLASSROOM CODE in the app ends up in
// the same room. Swap RELAY_URLS for your own if a school network blocks
// the defaults.
export const APP_ID = 'voxel-forge-classroom-v1';
export const RELAY_URLS = undefined; // undefined = trystero's public defaults

// ---- Rarity tiers -----------------------------------------------------------
// clicksToMine: how many times a student must click the block to finish it.
// weight: relative chance this tier is offered as "next item to mine" when
//   a student asks for a random block instead of picking one themselves.
export const RARITIES = {
  common:    { label: 'Common',    color: '#8B9AA8', glow: '#B9C4CD', weight: 100, clicksToMine: 8   },
  uncommon:  { label: 'Uncommon',  color: '#4FD17A', glow: '#8CF0AC', weight: 55,  clicksToMine: 18  },
  rare:      { label: 'Rare',      color: '#4FA8E8', glow: '#8FCBF5', weight: 25,  clicksToMine: 34  },
  epic:      { label: 'Epic',      color: '#B07CE8', glow: '#D2B3F5', weight: 10,  clicksToMine: 55  },
  legendary: { label: 'Legendary', color: '#E8B84B', glow: '#FBDD8F', weight: 3,   clicksToMine: 90  }
};

export const RARITY_ORDER = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

// ---- Items ------------------------------------------------------------------
// `shape` picks a procedural voxel silhouette from voxelShapes.js.
// `grid` is the voxel resolution (grid x grid x grid) that shape is built on.
// Every item renders into the same 64x64px canvas, so a bigger grid just
// means smaller individual cubes, not a bigger sprite.
export const ITEMS = [
  { id: 'pebble',      name: 'Pebble',        rarity: 'common',    shape: 'cube',     grid: 4, hue: 0   },
  { id: 'copper-ore',  name: 'Copper Ore',    rarity: 'common',    shape: 'cluster',  grid: 5, hue: 28  },
  { id: 'oak-log',     name: 'Oak Log',       rarity: 'uncommon',  shape: 'column',   grid: 5, hue: 34  },
  { id: 'silver-bar',  name: 'Silver Bar',    rarity: 'uncommon',  shape: 'slab',     grid: 5, hue: 210 },
  { id: 'quartz',      name: 'Quartz Shard',  rarity: 'rare',      shape: 'diamond',  grid: 6, hue: 190 },
  { id: 'gold-nugget', name: 'Gold Nugget',   rarity: 'rare',      shape: 'sphere',   grid: 6, hue: 46  },
  { id: 'star-shard',  name: 'Star Shard',    rarity: 'epic',      shape: 'star',     grid: 7, hue: 265 },
  { id: 'void-core',   name: 'Void Core',     rarity: 'epic',      shape: 'ring',     grid: 7, hue: 300 },
  { id: 'phoenix-egg',  name: 'Phoenix Egg',   rarity: 'legendary', shape: 'sphere',   grid: 8, hue: 12  },
  { id: 'dragon-heart', name: 'Dragon Heart',  rarity: 'legendary', shape: 'star',     grid: 8, hue: 355 }
];

export const itemById = id => ITEMS.find(item => item.id === id);
export const rarityOf = item => RARITIES[item.rarity];

// ---- Blockchain --------------------------------------------------------------
export const CHAIN_DIFFICULTY_PREFIX = '0'; // block hash must start with this to be "mined" (kept trivial on purpose — it's a lesson, not a lockout)
export const CHAIN_STORAGE_PREFIX = 'voxelforge:chain:';
export const PROFILE_STORAGE_PREFIX = 'voxelforge:profile:';
export const GUEST_ID_STORAGE_KEY = 'voxelforge:guestId';

// ---- Mining feel --------------------------------------------------------------
export const MINE_CLICK_COOLDOWN_MS = 60; // guards against key-repeat spam counting as many clicks
export const MINE_SHAKE_DECAY = 0.85;
