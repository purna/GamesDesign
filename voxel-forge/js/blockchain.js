/**
 * blockchain.js
 * A deliberately small blockchain, built to be read by students:
 *  - every block stores what happened (MINE / TRADE_OUT / TRADE_IN / GENESIS)
 *  - every block's hash is SHA-256 of its own contents *plus the previous
 *    block's hash* — that link is the whole "chain" idea.
 *  - mining a block means searching for a nonce that makes the hash start
 *    with CHAIN_DIFFICULTY_PREFIX. The prefix is one character, so it's fast
 *    — the point is to *show* proof-of-work, not to make students wait.
 *  - validateChain() walks the chain and recomputes every hash, so editing
 *    a past block (e.g. in devtools) is visibly detectable — that's the
 *    "immutability" lesson.
 *
 * Each student keeps their own chain in localStorage, keyed by their user
 * id. A trade appends a matching block to *both* students' chains (each
 * signs their own copy) once the trade is agreed over the network — see
 * marketplace.js and network.js.
 */

import { CHAIN_DIFFICULTY_PREFIX, CHAIN_STORAGE_PREFIX } from './config.js';

async function sha256(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function blockPayload(block) {
  // Everything except `hash` itself feeds the hash.
  const { hash, ...rest } = block;
  return JSON.stringify(rest);
}

async function mineBlockHash(block) {
  let nonce = 0;
  // Trivial difficulty on purpose (see file header) — this loop typically
  // ends in a handful of iterations, which is still enough to *show* the
  // search-for-a-nonce idea without making anyone wait.
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const candidate = { ...block, nonce };
    const hash = await sha256(blockPayload(candidate));
    if (hash.startsWith(CHAIN_DIFFICULTY_PREFIX)) return { hash, nonce };
    nonce++;
  }
}

export class Chain {
  constructor(ownerId, ownerName) {
    this.ownerId = ownerId;
    this.ownerName = ownerName;
    this.blocks = [];
  }

  static async genesisBlock(ownerId, ownerName) {
    const base = {
      index: 0,
      type: 'GENESIS',
      timestamp: Date.now(),
      data: { ownerId, ownerName },
      prevHash: '0'.repeat(64)
    };
    const { hash, nonce } = await mineBlockHash(base);
    return { ...base, nonce, hash };
  }

  async init() {
    const loaded = loadChain(this.ownerId);
    if (loaded && loaded.length) {
      this.blocks = loaded;
    } else {
      this.blocks = [await Chain.genesisBlock(this.ownerId, this.ownerName)];
      this.persist();
    }
    return this;
  }

  get latest() {
    return this.blocks[this.blocks.length - 1];
  }

  async append(type, data) {
    const prev = this.latest;
    const base = {
      index: prev.index + 1,
      type,
      timestamp: Date.now(),
      data,
      prevHash: prev.hash
    };
    const { hash, nonce } = await mineBlockHash(base);
    const block = { ...base, nonce, hash };
    this.blocks.push(block);
    this.persist();
    return block;
  }

  /** Append a block whose hash was already agreed with a trade partner
   *  (both sides must end up with byte-identical block contents so the
   *  hash matches on both chains). */
  async appendAgreed(type, data, sharedTimestamp) {
    const prev = this.latest;
    const base = {
      index: prev.index + 1,
      type,
      timestamp: sharedTimestamp,
      data,
      prevHash: prev.hash
    };
    const { hash, nonce } = await mineBlockHash(base);
    const block = { ...base, nonce, hash };
    this.blocks.push(block);
    this.persist();
    return block;
  }

  persist() {
    localStorage.setItem(CHAIN_STORAGE_PREFIX + this.ownerId, JSON.stringify(this.blocks));
  }

  /** Recomputes every hash and every link. Returns { valid, brokenAt }. */
  async validate() {
    for (let i = 0; i < this.blocks.length; i++) {
      const block = this.blocks[i];
      const recomputed = await sha256(blockPayload(block));
      if (recomputed !== block.hash) return { valid: false, brokenAt: i, reason: 'hash does not match block contents' };
      if (!recomputed.startsWith(CHAIN_DIFFICULTY_PREFIX)) return { valid: false, brokenAt: i, reason: 'hash does not satisfy the mining rule' };
      if (i > 0 && block.prevHash !== this.blocks[i - 1].hash) {
        return { valid: false, brokenAt: i, reason: 'does not point at the previous block\u2019s hash' };
      }
    }
    return { valid: true, brokenAt: -1 };
  }

  itemCounts() {
    const counts = {};
    this.blocks.forEach(b => {
      if (b.type === 'MINE' || b.type === 'TRADE_IN') {
        counts[b.data.itemId] = (counts[b.data.itemId] || 0) + 1;
      } else if (b.type === 'TRADE_OUT') {
        counts[b.data.itemId] = (counts[b.data.itemId] || 0) - 1;
      }
    });
    return counts;
  }
}

function loadChain(ownerId) {
  const raw = localStorage.getItem(CHAIN_STORAGE_PREFIX + ownerId);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function shortHash(hash) {
  return hash ? `${hash.slice(0, 6)}…${hash.slice(-4)}` : '';
}
