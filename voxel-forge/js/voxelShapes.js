/**
 * voxelShapes.js
 * Pure functions: (gridSize) -> array of {x,y,z} filled voxel coordinates,
 * each in [0, gridSize). No Three.js in here — voxelRenderer.js turns the
 * coordinates into cubes. Keeping shape math separate from rendering means
 * a student (or teacher) can add a new shape without knowing any Three.js.
 */

const inBounds = (v, size) => v >= 0 && v < size;

function cube(size) {
  const pad = Math.max(0, Math.floor(size * 0.12));
  const out = [];
  for (let x = pad; x < size - pad; x++)
    for (let y = pad; y < size - pad; y++)
      for (let z = pad; z < size - pad; z++)
        out.push({ x, y, z });
  return out;
}

function cluster(size) {
  // A few overlapping blobs, like ore veins in rock.
  const out = [];
  const blobs = 3;
  const rand = mulberry32(size * 7919);
  for (let b = 0; b < blobs; b++) {
    const cx = 1 + rand() * (size - 2);
    const cy = 1 + rand() * (size - 2);
    const cz = 1 + rand() * (size - 2);
    const r = size * 0.32;
    for (let x = 0; x < size; x++)
      for (let y = 0; y < size; y++)
        for (let z = 0; z < size; z++) {
          const d = Math.hypot(x - cx, y - cy, z - cz);
          if (d < r) out.push({ x, y, z });
        }
  }
  return dedupe(out);
}

function column(size) {
  const out = [];
  const r = size * 0.28;
  const cx = size / 2 - 0.5, cz = size / 2 - 0.5;
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++)
      for (let z = 0; z < size; z++)
        if (Math.hypot(x - cx, z - cz) < r) out.push({ x, y, z });
  return out;
}

function slab(size) {
  const out = [];
  const thickness = Math.max(1, Math.round(size * 0.35));
  const start = Math.floor((size - thickness) / 2);
  for (let y = start; y < start + thickness; y++)
    for (let x = 0; x < size; x++)
      for (let z = 0; z < size; z++)
        out.push({ x, y, z });
  return out;
}

function diamond(size) {
  const out = [];
  const c = (size - 1) / 2;
  const r = size * 0.62;
  for (let x = 0; x < size; x++)
    for (let y = 0; y < size; y++)
      for (let z = 0; z < size; z++) {
        const d = Math.abs(x - c) + Math.abs(y - c) + Math.abs(z - c);
        if (d <= r) out.push({ x, y, z });
      }
  return out;
}

function sphere(size) {
  const out = [];
  const c = (size - 1) / 2;
  const r = size * 0.48;
  for (let x = 0; x < size; x++)
    for (let y = 0; y < size; y++)
      for (let z = 0; z < size; z++)
        if (Math.hypot(x - c, y - c, z - c) <= r) out.push({ x, y, z });
  return out;
}

function star(size) {
  // A sphere core with 6 spikes poking out along each axis.
  const out = sphere(Math.max(4, size - 2)).map(v => ({
    x: v.x + 1, y: v.y + 1, z: v.z + 1
  }));
  const c = Math.floor(size / 2);
  const spikeLen = Math.ceil(size * 0.42);
  const dirs = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
  dirs.forEach(([dx, dy, dz]) => {
    for (let i = 1; i <= spikeLen; i++) {
      const x = c + dx * i, y = c + dy * i, z = c + dz * i;
      if (inBounds(x, size) && inBounds(y, size) && inBounds(z, size)) out.push({ x, y, z });
    }
  });
  return dedupe(out);
}

function ring(size) {
  const out = [];
  const c = (size - 1) / 2;
  const rOuter = size * 0.46;
  const rInner = size * 0.28;
  const thickness = Math.max(1, size * 0.3);
  for (let x = 0; x < size; x++)
    for (let y = 0; y < size; y++)
      for (let z = 0; z < size; z++) {
        const dRing = Math.hypot(x - c, z - c);
        if (dRing <= rOuter && dRing >= rInner && Math.abs(y - c) <= thickness / 2) {
          out.push({ x, y, z });
        }
      }
  return out;
}

function dedupe(voxels) {
  const seen = new Set();
  const out = [];
  voxels.forEach(v => {
    const key = `${v.x},${v.y},${v.z}`;
    if (!seen.has(key)) { seen.add(key); out.push(v); }
  });
  return out;
}

// Deterministic tiny PRNG so a given item always renders the same silhouette.
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const SHAPES = { cube, cluster, column, slab, diamond, sphere, star, ring };

export function buildVoxels(shapeName, gridSize) {
  const fn = SHAPES[shapeName] || cube;
  return fn(gridSize);
}
