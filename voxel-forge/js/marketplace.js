/**
 * marketplace.js
 * Barter only — no in-game currency, to keep the lesson on "how does a
 * trade become a permanent, tamper-evident record" rather than pricing.
 * A trade is: "I'll give you one of my <offerItemId> for one of your
 * <requestItemId>."
 *
 * Handshake (see network.js for the wire format):
 *   1. proposeTrade()  — proposer sends tradeOffer
 *   2. acceptOffer()   — the recipient, on accepting, immediately writes
 *      TRADE_OUT/TRADE_IN to their own chain and replies "accepted" with
 *      the timestamp they used
 *   3. handleTradeResponse() — the proposer, on seeing "accepted", writes
 *      the mirror-image TRADE_OUT/TRADE_IN to their own chain, using that
 *      same timestamp
 * Each side only ever writes to their own chain — nobody can write into a
 * classmate's ledger, which is itself worth pointing out to students.
 */
import { state, myInventoryCounts } from './state.js';
import { sendOffer, sendResponse, broadcastPresence, myPeerId } from './network.js';

let offerCounter = 0;
function newOfferId() {
  offerCounter += 1;
  return `${myPeerId() || 'me'}-${Date.now()}-${offerCounter}`;
}

export function updateListing(itemIds) {
  state.myListing = itemIds;
  broadcastPresence(state.user.name, itemIds);
}

export function proposeTrade(peerId, offerItemId, requestItemId, peerName) {
  const counts = myInventoryCounts();
  if (!counts[offerItemId]) throw new Error('You do not have that item to offer.');
  const offerId = newOfferId();
  const offer = {
    offerId,
    fromName: state.user.name,
    offerItemId,
    requestItemId
  };
  state.pendingOffers[offerId] = { ...offer, peerId, peerName };
  sendOffer(peerId, offer);
  return offerId;
}

export function recordIncomingOffer(offer) {
  state.incomingOffers[offer.offerId] = offer;
}

export async function acceptOffer(offerId) {
  const offer = state.incomingOffers[offerId];
  if (!offer) throw new Error('That offer is no longer available.');
  const counts = myInventoryCounts();
  if (!counts[offer.requestItemId]) {
    sendResponse(offer.fromPeerId, { offerId, accepted: false, reason: 'no-longer-have-item' });
    delete state.incomingOffers[offerId];
    throw new Error('You no longer have the item they asked for.');
  }
  const sharedTimestamp = Date.now();
  await state.chain.appendAgreed('TRADE_OUT', { itemId: offer.requestItemId, withPeer: offer.fromName }, sharedTimestamp);
  await state.chain.appendAgreed('TRADE_IN', { itemId: offer.offerItemId, withPeer: offer.fromName }, sharedTimestamp);
  sendResponse(offer.fromPeerId, { offerId, accepted: true, sharedTimestamp });
  delete state.incomingOffers[offerId];
  return offer;
}

export function declineOffer(offerId) {
  const offer = state.incomingOffers[offerId];
  if (!offer) return;
  sendResponse(offer.fromPeerId, { offerId, accepted: false, reason: 'declined' });
  delete state.incomingOffers[offerId];
}

/** Called when the *other* side responds to an offer we sent. */
export async function handleTradeResponse(response) {
  const offer = state.pendingOffers[response.offerId];
  if (!offer) return null;
  delete state.pendingOffers[response.offerId];
  if (!response.accepted) return { offer, accepted: false, reason: response.reason };

  await state.chain.appendAgreed('TRADE_OUT', { itemId: offer.offerItemId, withPeer: offer.peerName || 'peer' }, response.sharedTimestamp);
  await state.chain.appendAgreed('TRADE_IN', { itemId: offer.requestItemId, withPeer: offer.peerName || 'peer' }, response.sharedTimestamp);
  return { offer, accepted: true };
}
