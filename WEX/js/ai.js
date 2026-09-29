/**
 * ai.js — Rival (AI) decision logic for Race to the Role.
 *
 * All functions here operate on global `state` and `DATA` set up by game.js.
 * They use pure game-state mutations only (no direct DOM manipulation except
 * for the rival turn summary popup, which relies on globals from game.js).
 *
 * Load order: game.js → ai.js → settings.js → accessibility.js
 */

/* ====================== Set Targeting ====================== */

function targetSetOrder(agent, job) {
  const recommended = [...jobSetOptions(job)];
  const strategy = agent && agent.strategy;
  const completed = new Set((agent && agent.banked || []).map((entry) => entry.set));
  const ids = [...recommended.filter((id) => !completed.has(id)), ...recommended.filter((id) => completed.has(id))];
  // strategy is not always a set id ('balanced' is not a route), so only prefer
  // it when it names a real route. Pushing an unknown id made bankSet() dereference
  // an undefined set and throw mid-rival-phase.
  if (strategy && DATA.sets.some((s) => s.id === strategy) && !ids.includes(strategy)) ids.push(strategy);
  DATA.sets.forEach((set) => { if (!ids.includes(set.id)) ids.push(set.id); });
  return ids;
}

function tryFindAnyBank(agent, job) {
  for (const setId of targetSetOrder(agent, job)) {
    const candidates = agent.hand.filter((c) => c.category === 'Wildcard' || c.set === setId || c.set === 'any');
    const result = findBank(candidates, setId, true);
    if (result.ok) return result;
  }
  return null;
}

function setProgress(agent, setId) {
  const meta = setMeta(setId);
  if (!meta) return 0;
  const categories = new Set(agent.hand.filter((c) => (c.set === setId || c.set === 'any') && c.category !== 'Wildcard').map((c) => c.category));
  return categories.size;
}

function rateMarketCard(agent, card) {
  if (card.category === 'Wildcard') return 4;
  let score = card.set === 'any' ? 3 : jobSetOptions(state.job).has(card.set) ? 5 : 2;
  const duplicates = agent.hand.some((held) => held.category === card.category
    && (held.set === card.set || held.set === 'any' || card.set === 'any'));
  if (duplicates) score -= 5;
  else if (card.set !== 'any') score += Math.min(3, setProgress(agent, card.set));
  return score;
}

function replaceWeakMarketCards(agent) {
  const replaced = [];
  const justAdded = new Set();
  agent.marketSwapsThisRound = 0;
  while (agent.marketSwapsThisRound < MAX_MARKET_SWAPS_PER_ROUND && state.market.length) {
    const ranked = state.market.map((card, index) => ({ card, index, score: rateMarketCard(agent, card) }))
      .filter((entry) => !justAdded.has(entry.card.uid))
      .sort((a, b) => a.score - b.score);
    if (!ranked.length || ranked[0].score > 1) break;
    const swap = swapMarketCard(ranked[0].index, agent);
    if (!swap) break;
    agent.marketSwapsThisRound += 1;
    justAdded.add(swap.fresh.uid);
    replaced.push({ oldCard: swap.replaced, newCard: swap.fresh });
  }
  return replaced;
}

/* ====================== Market Card Selection ====================== */

function pickMarketCardFor(agent, job) {
  if (state.market.length === 0) return null;
  const order = targetSetOrder(agent, job);
  const recommended = jobSetOptions(job);
  const scores = state.market.map((card, index) => {
    let score = 0;
    const flexible = card.set === 'any' && card.category !== 'Wildcard';
    const set = setMeta(card.set);
    const rank = order.indexOf(card.set);
    if (rank >= 0) score += Math.max(2, 8 - rank * 1.2);
    if (recommended.has(card.set)) score += 4;
    if (agent.strategy && card.set === agent.strategy) score += 2;
    if (card.category === 'Wildcard') score += 2;
    if (flexible) {
      const usefulRoute = order.find((setId) => !agent.hand.some((held) => held.category === card.category && (held.set === setId || held.set === 'any')));
      if (usefulRoute) score += 5 + Math.max(0, 2 - order.indexOf(usefulRoute));
      else score -= 2;
    }
    if (set && card.category !== 'Wildcard') {
      const duplicate = agent.hand.some((held) => held.set === card.set && held.category === card.category);
      if (!duplicate) score += 2.5 + setProgress(agent, card.set) * 0.8;
      else score -= 2;
    }
    return { card, score, index };
  });
  scores.sort((a, b) => b.score - a.score || a.index - b.index);
  return scores[0].card;
}

// The `n` least useful cards in the agent's hand, worst first. leastUsefulCard()
// returns a single card; this ranks the whole hand so a multi-card return drops the
// genuinely weakest cards rather than the worst plus an arbitrary one.
function leastUsefulCards(agent, job, n) {
  const recommended = jobSetOptions(job);
  const order = targetSetOrder(agent, job);
  return agent.hand
    .map((card, index) => {
      let score = 0;
      const flexible = card.set === 'any' && card.category !== 'Wildcard';
      const rank = order.indexOf(card.set);
      if (rank >= 0) score += Math.max(1, 7 - rank);
      if (flexible) {
        score += order.some((setId) => !agent.hand.some((held) => held.uid !== card.uid && held.category === card.category && (held.set === setId || held.set === 'any'))) ? 4 : 0;
      }
      if (recommended.has(card.set)) score += 4;
      if (agent.strategy && card.set === agent.strategy) score += 2;
      if (card.category === 'Wildcard') score += 5;
      if (agent.hand.filter((held) => held.set === card.set && held.category === card.category).length > 1) score -= 2;
      return { card, score, index };
    })
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .slice(0, Math.max(0, n))
    .map((entry) => entry.card);
}

function leastUsefulCard(agent, job) {
  const recommended = jobSetOptions(job);
  const order = targetSetOrder(agent, job);
  return agent.hand.map((card, index) => {
    let score = 0;
    const flexible = card.set === 'any' && card.category !== 'Wildcard';
    const rank = order.indexOf(card.set);
    if (rank >= 0) score += Math.max(1, 7 - rank);
    if (flexible) score += order.some((setId) => !agent.hand.some((held) => held.uid !== card.uid && held.category === card.category && (held.set === setId || held.set === 'any'))) ? 4 : 0;
    if (recommended.has(card.set)) score += 4;
    if (agent.strategy && card.set === agent.strategy) score += 2;
    if (card.category === 'Wildcard') score += 5;
    if (agent.hand.filter((held) => held.set === card.set && held.category === card.category).length > 1) score -= 2;
    return { card, score, index };
  }).sort((a, b) => a.score - b.score || a.index - b.index)[0].card;
}

/* ====================== Rival Turn Execution ====================== */

function runRivalTurn(agent) {
  const seed = RIVAL_SEEDS.find((r) => r.name === agent.name);
  const summary = { name: agent.displayName || agent.name, strategy: seed ? seed.blurb : 'Competitor', plan: seed ? seed.plan : '', actions: [], picked: [], returned: [], banked: [], applied: false };
  addLog(`${agent.displayName || agent.name}'s turn (${summary.strategy}): taking 2 actions.`);
  agent.energy = Math.min(START_ENERGY, agent.energy + 1);
  agent.marketPicksThisRound = 0;
  agent.returnsThisRound = 0;
  const swaps = replaceWeakMarketCards(agent);
  swaps.forEach(({ oldCard, newCard }) => {
    summary.actions.push({ type: 'swap', oldCard, newCard });
  });
  let actions = ACTIONS_PER_TURN;
  agent.actionPenalty = 0;

  while (actions > 0 && !state.winner) {
    const bank = tryFindAnyBank(agent, state.job);
    if (bank) {
      const result = bankSet(agent, bank.targetSet, bank.used);
      if (!result) { actions -= 1; continue; }
      summary.actions.push({ type: 'bank', title: result.meta.name, cards: bank.used.map((c) => ({ name: c.name, category: c.category, art: c.art })), skill: result.skillName, evidence: result.evidenceGain });
      summary.banked.push({ name: result.meta.name, skill: result.skillName, evidence: result.evidenceGain });
      addLog(`${agent.displayName || agent.name} action: banked ${result.meta.name}, gaining ${result.skillName} and CV evidence.`);
      actions -= 1;
      continue;
    }

    const pick = pickMarketCardFor(agent, state.job);
    if (pick && agent.marketPicksThisRound < MAX_MARKET_PICKS_PER_ROUND && agent.hand.length >= HAND_CAP && agent.returnsThisRound < MAX_RETURNS_PER_ROUND) {
      // Rank the whole hand and drop the weakest, rather than taking the single worst
      // plus whichever card happened to be first in the array.
      const wanted = Math.min(2, MAX_RETURNS_PER_ROUND - agent.returnsThisRound);
      const returns = leastUsefulCards(agent, state.job, wanted);
      agent.hand = agent.hand.filter((card) => !returns.some((item) => item.uid === card.uid));
      agent.returnsThisRound += returns.length;
      state.market.push(...returns);
      summary.returned.push(...returns.map((card) => ({ name: card.name, category: card.category, art: card.art })));
      summary.actions.push({ type: 'return', cards: returns.map((card) => ({ name: card.name, category: card.category, art: card.art })), reason: 'making room for useful cards' });
      addLog(`${agent.displayName || agent.name} returned ${returns.length} card(s) to the community market.`);
      continue;
    }

    if (pick && agent.hand.length < HAND_CAP && agent.marketPicksThisRound < MAX_MARKET_PICKS_PER_ROUND) {
      const idx = state.market.findIndex((c) => c.uid === pick.uid);
      if (idx !== -1) {
        state.market.splice(idx, 1);
        agent.hand.push(pick);
        agent.marketPicksThisRound += 1;
        const meta = pick.set && setMeta(pick.set);
        const reason = meta ? `towards ${meta.name}` : 'to support the target role';
        summary.actions.push({ type: 'pick', card: { name: pick.name, category: pick.category, art: pick.art }, reason });
        summary.picked.push({ name: pick.name, category: pick.category, art: pick.art, reason });
        addLog(`${agent.displayName || agent.name} action: picked ${pick.name} ${reason}.`);
        refillMarket();
        actions -= 1;
        continue;
      }
    }

    summary.actions.push({ type: 'wait', title: 'No available card' });
    actions -= 1;
  }

  if (eligible(agent, state.job) && !state.winner) {
    agent.applied = true;
    summary.applied = true;
    state.winner = agent;
    addLog(`${agent.displayName || agent.name} applied for ${state.job.title}!`);
  }
  return summary;
}

/* ====================== Rival Summary UI ====================== */

function rivalCardMarkup(card, label, bankedSetId) {
  if (!card) return '';
  const isWild = card.category === 'Wildcard';
  const isAnyRoute = card.set === 'any' && !isWild;
  const cls = isWild ? 'cat-lime' : card.category === 'Action' ? 'cat-pink' : card.category === 'Proof' ? 'cat-gold' : card.category === 'Impact' ? 'cat-orange' : 'cat-cyan';
  const badge = isWild ? '★' : isAnyRoute ? '✦' : '';
  return `<div class="rival-action-card ${cls} ${cardSetClass(card)}" title="${isWild ? 'Wildcard (substitutes any card)' : isAnyRoute ? 'Any route card' : ''}"><span class="rival-action-art">${escapeHtml(card.art || '🃏')}</span><span class="rival-action-label">${escapeHtml(label)}${badge ? ' ' + badge : ''}</span><strong>${escapeHtml(card.name)}</strong></div>`;
}

function showRivalTurnPopup() {
  const summary = state.rivalTurnSummaries[state.rivalTurnIndex];
  if (!summary) { finishRivalPhase(); return; }
  const last = state.rivalTurnIndex === state.rivalTurnSummaries.length - 1;
  const turnNo = state.rivalTurnIndex + 1;
  let actionNumber = 0;
  const actionRows = summary.actions.map((action) => {
    const number = action.type === 'swap' ? '↻' : action.type === 'return' ? '↩' : ++actionNumber;
    if (action.type === 'swap') return `<div class="rival-action-row"><span class="rival-action-number">${number}</span><div><b>Free market replacement</b><p>Added a fresh card from the deck to the community market.</p></div><div class="rival-action-cards">${rivalCardMarkup(action.oldCard, 'Replaced')}${rivalCardMarkup(action.newCard, 'New card')}</div></div>`;
    if (action.type === 'pick') return `<div class="rival-action-row"><span class="rival-action-number">${number}</span><div><b>Picked from the market</b><p>${escapeHtml(action.reason)}</p></div>${rivalCardMarkup(action.card, 'Picked')}</div>`;
    if (action.type === 'return') return `<div class="rival-action-row"><span class="rival-action-number">${number}</span><div><b>Returned to the community market</b><p>${escapeHtml(action.reason)}</p></div><div class="rival-action-cards">${action.cards.map((c) => rivalCardMarkup(c, 'Returned')).join('')}</div></div>`;
    if (action.type === 'bank') return `<div class="rival-action-row"><span class="rival-action-number">${number}</span><div><b>Completed ${escapeHtml(action.title)}</b><p>Added ${action.evidence} CV evidence and the ${escapeHtml(action.skill)} skill.</p></div><div class="rival-action-cards">${action.cards.map((c) => rivalCardMarkup(c, 'Banked', action.title)).join('')}</div></div>`;
    return `<div class="rival-action-row"><span class="rival-action-number">${number}</span><div><b>${escapeHtml(action.title)}</b><p>No move available.</p></div></div>`;
  }).join('');
  const applied = summary.applied ? `<p class="rival-win-callout">${escapeHtml(summary.name)} now meets the role requirements and has applied!</p>` : '';
  openModal(`<div class="rival-turn-modal"><div class="eyebrow">RIVAL TURN ${turnNo} OF ${state.rivalTurnSummaries.length} · ROUND ${state.round}</div><h2>${escapeHtml(summary.name)} is making a move</h2><p class="rival-modal-plan"><b>${escapeHtml(summary.strategy)}</b> · ${escapeHtml(summary.plan)}</p><div class="rival-turn-actions">${actionRows}</div>${applied}<div class="modal-actions"><button class="btn primary-btn" id="nextRivalBtn">${last ? (state.winner ? 'See result' : 'Start next round') : 'Next competitor'} →</button></div></div>`);
  $('nextRivalBtn').addEventListener('click', () => {
    state.rivalTurnIndex += 1;
    if (state.rivalTurnIndex < state.rivalTurnSummaries.length) showRivalTurnPopup();
    else finishRivalPhase();
  });
}
