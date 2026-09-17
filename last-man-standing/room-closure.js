import {
  GAME_STATE,
  ROOM_CLOSURE_ORDER,
  ROOM_CLOSURE_INTERVAL_MS,
  ROOM_CLOSURE_WARNING_MS
} from './config.js';
import { state } from './state.js';

export function getRoomClosureTime(roomRow, roomCol) {
  if (state.gameState !== GAME_STATE.IN_GAME || !state.gameStartedAt) return Infinity;
  if (state.roomClosureStartedAt === 0) state.roomClosureStartedAt = state.gameStartedAt;
  const index = ROOM_CLOSURE_ORDER.findIndex(room => room.row === roomRow && room.col === roomCol);
  if (index < 0) return Infinity;
  return state.roomClosureStartedAt + (index + 1) * ROOM_CLOSURE_INTERVAL_MS;
}

export function isRoomClosed(roomRow, roomCol) {
  const key = `${roomRow},${roomCol}`;
  if (state.closedRooms.has(key)) return true;
  if (state.gameState !== GAME_STATE.IN_GAME || !state.gameStartedAt) return false;
  const closeTime = getRoomClosureTime(roomRow, roomCol);
  if (Date.now() >= closeTime) {
    state.closedRooms.add(key);
    return true;
  }
  return false;
}

export function getRoomClosureWarning(roomRow, roomCol) {
  const closeTime = getRoomClosureTime(roomRow, roomCol);
  const msLeft = closeTime - Date.now();
  if (msLeft <= 0) return { closing: true, msLeft: 0 };
  if (msLeft <= ROOM_CLOSURE_WARNING_MS) return { closing: false, msLeft, warning: true };
  return { closing: false, msLeft, warning: false };
}
