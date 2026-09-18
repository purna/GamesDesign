/**
 * state.js
 * One shared, mutable object. Nothing fancy — small enough that a plain
 * object plus direct mutation is easier to teach than an event/store library.
 */
export const state = {
  user: null,            // { id, name, provider, photoURL }
  chain: null,            // Chain instance (blockchain.js) for `user`
  room: null,              // trystero room, once a classroom code is joined
  classroomCode: null,
  peers: {},               // peerId -> { name, forSale: [itemId,...] }
  myListing: [],            // itemIds I've marked for sale
  sendPresence: null,
  sendTradeOffer: null,
  sendTradeResponse: null,
  sendTradeConfirm: null,
  currentMiningItemId: null,
  miningProgress: 0,
  pendingOffers: {},       // offerId -> offer we sent, awaiting response
  incomingOffers: {}        // offerId -> offer a peer sent us
};

export function myInventoryCounts() {
  if (!state.chain) return {};
  const counts = state.chain.itemCounts();
  Object.keys(counts).forEach(id => { if (counts[id] <= 0) delete counts[id]; });
  return counts;
}
