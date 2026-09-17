/**
 * Deterministic host election.
 *
 * Every client feeds in the same roster and the same round key (the arena
 * bucket, plus a failover counter when a host disappears mid-round), so every
 * client independently arrives at the same answer without another round of
 * messaging. Because the bucket increments for each new arena, the host
 * rotates between rounds whenever more than one player is eligible.
 */
export function electHost(candidateIds, roundKey = 0) {
  const ids = Array.from(new Set((candidateIds || []).filter(Boolean))).sort();
  if (ids.length === 0) return null;
  const key = Number.isFinite(Number(roundKey)) ? Math.abs(Math.floor(Number(roundKey))) : 0;
  return ids[key % ids.length];
}

/** Host election after a disconnect: same rule, excluding whoever left. */
export function electFailoverHost(candidateIds, roundKey, departedId, failoverSeq = 1) {
  const remaining = (candidateIds || []).filter(id => id && id !== departedId);
  return electHost(remaining, Number(roundKey || 0) + failoverSeq);
}

/**
 * The player after `currentHostId` in sorted order. Broadcast with the podium
 * message so the next arena starts with a different host even when the round
 * ends inside the same 60-second bucket.
 */
export function nextHostAfter(candidateIds, currentHostId) {
  const ids = Array.from(new Set((candidateIds || []).filter(Boolean))).sort();
  if (ids.length === 0) return null;
  if (ids.length === 1) return ids[0];
  const index = ids.indexOf(currentHostId);
  if (index < 0) return ids[0];
  return ids[(index + 1) % ids.length];
}

/**
 * Per-arena election with an anti-repeat guard.
 *
 * `previousHostId` comes off the wire with the podium message, so clients that
 * played the last round all hold the same value and shift away from the same
 * name. A client joining fresh has no value and takes the unshifted pick; the
 * duplicate-claim resolver below settles that rare disagreement.
 */
export function electRoundHost(candidateIds, roundKey, previousHostId = null) {
  const ids = Array.from(new Set((candidateIds || []).filter(Boolean))).sort();
  if (ids.length === 0) return null;
  const chosen = electHost(ids, roundKey);
  if (ids.length < 2 || !previousHostId || chosen !== previousHostId) return chosen;
  return ids[(ids.indexOf(chosen) + 1) % ids.length];
}

/**
 * Two clients can both believe they are host if their rosters differed during
 * the assignment window. Both sides run this with the same inputs and exactly
 * one stays host; the sorted-id fallback guarantees convergence even if their
 * rosters still disagree.
 */
export function resolveHostConflict(selfId, claimantId, candidateIds, roundKey) {
  if (!claimantId || claimantId === selfId) return selfId;
  const ids = Array.from(new Set((candidateIds || []).concat([selfId, claimantId]).filter(Boolean)));
  const elected = electHost(ids, roundKey);
  if (elected === selfId || elected === claimantId) return elected;
  return [selfId, claimantId].sort()[0];
}
