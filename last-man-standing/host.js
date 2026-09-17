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
