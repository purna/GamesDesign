/**
 * mining.js
 * The "cookie clicker" half of the game. Pure logic, no DOM — main.js wires
 * this to the click handler and the progress bar.
 */
import { ITEMS, RARITIES, itemById, rarityOf } from './config.js';

export function pickWeightedItem() {
  const total = ITEMS.reduce((sum, item) => sum + RARITIES[item.rarity].weight, 0);
  let roll = Math.random() * total;
  for (const item of ITEMS) {
    roll -= RARITIES[item.rarity].weight;
    if (roll <= 0) return item;
  }
  return ITEMS[0];
}

export class MiningSession {
  constructor(itemId) {
    this.item = itemById(itemId);
    this.clicks = 0;
    this.target = rarityOf(this.item).clicksToMine;
  }

  get progress() {
    return Math.min(1, this.clicks / this.target);
  }

  /** Returns true the click that completes the block. */
  click() {
    if (this.clicks >= this.target) return true;
    this.clicks += 1;
    return this.clicks >= this.target;
  }
}
