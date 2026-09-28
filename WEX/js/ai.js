/**
 * ai.js — Rival (AI) decision logic for Race to the Role.
 *
 * All functions here operate on global `state` and `DATA` set up by game.js.
 * They use pure game-state mutations only (no direct DOM manipulation except
 * for the rival turn summary popup, which relies on globals from game.js).
 *
 * Load order: game.js → ai.js → settings.js → accessibility.js
 */

/* ===================== Market Swap Heuristics ===================== */

function canSwapMarket(agent) {
  if (state.market.length === 0) return false;
  const useful = state.market.some((c) => {
    const score = rateMarketCard(agent, c);
    return score > 0;
  });
  return !useful;
}

function findWorstMarketCard(agent) {
  let worstIdx = -1;
  let worstScore = Infinity;
  state.market.forEach((c, i) => {
    const score = rateMarketCard(agent, c);
    if (score < worstScore) {
      worstScore = score;
      worstIdx = i;
    }
  });
  return worstIdx;
}

function rateMarketCard(agent, card) {
  const order = targetSetOrder(agent, state.job);
  const recommended = jobSetOptions(state.job);
  let score = 0;
  const rank = order.indexOf(card.set);
  if (rank >= 0) score += Math.max(1, 7 - rank);
  if (recommended.has(card.set)) score += 4;
  if (agent.strategy && card.set === agent.strategy) score += 2;
  if (card.category === 'Wildcard') score += 2;
  return score;
}

/* ====================== Set Targeting ====================== */

function targetSetOrder(agent, job) {
  const recommended = [...jobSetOptions(job)];
  const strategy = agent && agent.strategy;
  const completed = new Set((agent && agent.banked || []).map((entry) => entry.set));
  const ids = [...recommended.filter((id) => !completed.has(id)), ...recommended.filter((id) => completed.has(id))];
  if (strategy && !ids.includes(strategy)) ids.push(strategy);
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
  const summary = { name: agent.name, strategy: seed ? seed.blurb : 'Competitor', plan: seed ? seed.plan : '', actions: [], picked: [], returned: [], banked: [], applied: false };
  addLog(`${agent.name}'s turn (${summary.strategy}): taking 2 actions.`);
  agent.energy = Math.min(START_ENERGY, agent.energy + 1);
  agent.marketPicksThisRound = 0;
  agent.returnsThisRound = 0;
  agent.marketSwapsThisRound = 0;
  if (agent.hand.length < HAND_CAP && canSwapMarket(agent)) {
    const swapCount = Math.min(MAX_MARKET_SWAPS_PER_ROUND, state.market.length);
    for (let i = 0; i < swapCount; i++) {
      const worstIdx = findWorstMarketCard(agent);
      if (worstIdx === -1) break;
      swapMarketCard(worstIdx, agent);
    }
    if (swapCount > 0) {
      summary.actions.push({ type: 'swap', count: swapCount });
      agent.marketSwapsThisRound = swapCount;
    }
  }
  let actions = ACTIONS_PER_TURN;
  agent.actionPenalty = 0;

  while (actions > 0 && !state.winner) {
    const bank = tryFindAnyBank(agent, state.job);
    if (bank) {
      const result = bankSet(agent, bank.targetSet, bank.used);
      summary.actions.push({ type: 'bank', title: result.meta.name, cards: bank.used.map((c) => ({ name: c.name, category: c.category, art: c.art })), skill: result.skillName, evidence: result.evidenceGain });
      summary.banked.push({ name: result.meta.name, skill: result.skillName, evidence: result.evidenceGain });
      addLog(`${agent.name} action: banked ${result.meta.name}, gaining ${result.skillName} and CV evidence.`);
      actions -= 1;
      continue;
    }

    const pick = pickMarketCardFor(agent, state.job);
    if (pick && agent.marketPicksThisRound < MAX_MARKET_PICKS_PER_ROUND && agent.hand.length >= HAND_CAP && agent.returnsThisRound < MAX_RETURNS_PER_ROUND) {
      const leastUseful = leastUsefulCard(agent, state.job);
      const returns = [leastUseful, ...agent.hand.filter((card) => card.uid !== leastUseful.uid)]
        .slice(0, Math.min(2, MAX_RETURNS_PER_ROUND - agent.returnsThisRound));
      agent.hand = agent.hand.filter((card) => !returns.some((item) => item.uid === card.uid));
      agent.returnsThisRound += returns.length;
      state.deck = shuffle([...state.deck, ...returns]);
      summary.returned.push(...returns.map((card) => ({ name: card.name, category: card.category, art: card.art })));
      summary.actions.push({ type: 'return', cards: returns.map((card) => ({ name: card.name, category: card.category, art: card.art })), reason: 'making room for useful cards' });
      addLog(`${agent.name} returned ${returns.length} card(s) to the deck.`);
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
        addLog(`${agent.name} action: picked ${pick.name} ${reason}.`);
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
    addLog(`${agent.name} applied for ${state.job.title}!`);
  }
  return summary;
}

/* ====================== Rival Summary UI ====================== */

function rivalCardMarkup(card, label) {
  if (!card) return '';
  const cls = card.category === 'Wildcard' ? 'cat-lime' : card.category === 'Action' ? 'cat-pink' : card.category === 'Proof' ? 'cat-gold' : card.category === 'Impact' ? 'cat-orange' : 'cat-cyan';
  return `<div class="rival-action-card ${cls} ${cardSetClass(card)}"><span class="rival-action-art">${escapeHtml(card.art || '🃏')}</span><span class="rival-action-label">${escapeHtml(label)}</span><strong>${escapeHtml(card.name)}</strong></div>`;
}

function showRivalTurnPopup() {
  const summary = state.rivalTurnSummaries[state.rivalTurnIndex];
  if (!summary) { finishRivalPhase(); return; }
  const last = state.rivalTurnIndex === state.rivalTurnSummaries.length - 1;
  const turnNo = state.rivalTurnIndex + 1;
  const actionRows = summary.actions.map((action, i) => {
    if (action.type === 'pick') return `<div class="rival-action-row"><span class="rival-action-number">${i + 1}</span><div><b>Picked from the market</b><p>${escapeHtml(action.reason)}</p></div>${rivalCardMarkup(action.card, 'Picked')}</div>`;
    if (action.type === 'return') return `<div class="rival-action-row"><span class="rival-action-number">${i + 1}</span><div><b>Returned to the deck</b><p>${escapeHtml(action.reason)}</p></div><div class="rival-action-cards">${action.cards.map((c) => rivalCardMarkup(c, 'Returned')).join('')}</div></div>`;
    if (action.type === 'bank') return `<div class="rival-action-row"><span class="rival-action-number">${i + 1}</span><div><b>Completed ${escapeHtml(action.title)}</b><p>Added ${action.evidence} CV evidence and the ${escapeHtml(action.skill)} skill.</p></div><div class="rival-action-cards">${action.cards.map((c) => rivalCardMarkup(c, 'Banked')).join('')}</div></div>`;
    return `<div class="rival-action-row"><span class="rival-action-number">${i + 1}</span><div><b>${escapeHtml(action.title)}</b><p>No move available.</p></div></div>`;
  }).join('');
  const applied = summary.applied ? `<p class="rival-win-callout">${escapeHtml(summary.name)} now meets the role requirements and has applied!</p>` : '';
  openModal(`<div class="rival-turn-modal"><div class="eyebrow">RIVAL TURN ${turnNo} OF ${state.rivalTurnSummaries.length} · ROUND ${state.round}</div><h2>${escapeHtml(summary.name)} is making a move</h2><p class="rival-modal-plan"><b>${escapeHtml(summary.strategy)}</b> · ${escapeHtml(summary.plan)}</p><div class="rival-turn-actions">${actionRows}</div>${applied}<div class="modal-actions"><button class="btn primary-btn" id="nextRivalBtn">${last ? (state.winner ? 'See result' : 'Start next round') : 'Next competitor'} →</button></div></div>`);
  $('nextRivalBtn').addEventListener('click', () => {
    state.rivalTurnIndex += 1;
    if (state.rivalTurnIndex < state.rivalTurnSummaries.length) showRivalTurnPopup();
    else finishRivalPhase();
  });
}
