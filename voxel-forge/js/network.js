/**
 * network.js
 * Peer-to-peer only — no game server. Every browser that joins the same
 * "classroom code" calls trystero's joinRoom() with that code as the room
 * name, and trystero finds the other browsers using it (via WebRTC, with a
 * public relay just to introduce peers to each other). Once connected,
 * browsers talk directly to each other.
 *
 * Three things travel over the wire:
 *   1. presence  — "here's my name and what I have listed for sale"
 *   2. tradeOffer — "I'll give you X for your Y"
 *   3. tradeResponse — "accepted" or "declined", plus the timestamp both
 *      sides record the trade under
 *
 * Nothing about mining travels over the network — mining is a private,
 * offline action recorded straight onto a student's own chain. Only trades
 * (which affect another student's chain too) need the network at all.
 */
import { APP_ID, RELAY_URLS } from './config.js';
import { state } from './state.js';

let joinRoomFn = null;
let selfIdValue = null;

async function loadTrystero() {
  if (joinRoomFn) return;
  const mod = await import('https://esm.sh/trystero@0.22.0/nostr');
  joinRoomFn = mod.joinRoom;
  selfIdValue = mod.selfId;
}

export function myPeerId() {
  return selfIdValue;
}

export async function joinClassroom(code, onPeerUpdate, onTradeOffer, onTradeResponse) {
  await loadTrystero();
  if (state.room) {
    try { state.room.leave(); } catch { /* ignore */ }
  }
  state.peers = {};
  state.classroomCode = code;

  const config = RELAY_URLS ? { appId: APP_ID, relayUrls: RELAY_URLS } : { appId: APP_ID };
  const room = joinRoomFn(config, `classroom-${code}`);
  state.room = room;

  const [sendPresence, getPresence] = room.makeAction('presence');
  const [sendTradeOffer, getTradeOffer] = room.makeAction('tOffer');
  const [sendTradeResponse, getTradeResponse] = room.makeAction('tResp');

  state.sendPresence = sendPresence;
  state.sendTradeOffer = sendTradeOffer;
  state.sendTradeResponse = sendTradeResponse;

  getPresence((data, peerId) => {
    state.peers[peerId] = { ...(state.peers[peerId] || {}), ...data };
    onPeerUpdate();
  });

  getTradeOffer((data, peerId) => {
    onTradeOffer({ ...data, fromPeerId: peerId });
  });

  getTradeResponse((data, peerId) => {
    onTradeResponse({ ...data, fromPeerId: peerId });
  });

  room.onPeerJoin(() => onPeerUpdate());
  room.onPeerLeave(peerId => {
    delete state.peers[peerId];
    onPeerUpdate();
  });

  return room;
}

export function leaveClassroom() {
  if (state.room) {
    try { state.room.leave(); } catch { /* ignore */ }
  }
  state.room = null;
  state.classroomCode = null;
  state.peers = {};
  state.sendPresence = null;
  state.sendTradeOffer = null;
  state.sendTradeResponse = null;
}

export function broadcastPresence(name, forSale) {
  if (state.sendPresence) state.sendPresence({ name, forSale });
}

export function sendOffer(peerId, offer) {
  if (state.sendTradeOffer) state.sendTradeOffer(offer, peerId);
}

export function sendResponse(peerId, response) {
  if (state.sendTradeResponse) state.sendTradeResponse(response, peerId);
}
