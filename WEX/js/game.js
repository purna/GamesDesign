/**
 * game.js — Race to the Role: Gaming Careers Card Game
 * A set-collection card game: draw, return, and bank Setup+Action+Proof
 * card sets into completed opportunities, race three AI rivals to be the
 * first eligible candidate to apply for the target job.
 */

/* ===== Base app namespace (shared with settings.js, accessibility.js) ===== */
if (!window.app) {
  window.app = { state: {}, el: {}, config: {} };
}
app.state.soundEnabled = true;
app.state.animationsEnabled = true;
app.state.autoDrawEnabled = true;

/* ===== RTTR: localStorage save system ===== */
window.RTTR = {
  KEY: 'rttr-game-save',
  SETTINGS_KEY: 'rttr-settings',
  HISTORY_KEY: 'rttr-completed-roles',
  saveGame(s) { try { localStorage.setItem(this.KEY, JSON.stringify(s)); } catch (e) {} },
  loadGame() { try { const v = localStorage.getItem(this.KEY); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
  clearGame() { try { localStorage.removeItem(this.KEY); } catch (e) {} },
  getSettings() {
    try {
      const s = JSON.parse(localStorage.getItem(this.SETTINGS_KEY) || '{}');
      return { sound: s.sound !== undefined ? s.sound : true, animations: s.animations !== undefined ? s.animations : true, autoDraw: s.autoDraw !== undefined ? s.autoDraw : true };
    } catch (e) { return { sound: true, animations: true, autoDraw: true }; }
  },
  saveSettings(s) { try { localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(s)); } catch (e) {} },
  loadCompletedRoles() {
    try {
      const v = localStorage.getItem(this.HISTORY_KEY);
      return v ? JSON.parse(v) : [];
    } catch (e) { return []; }
  },
  saveCompletedRole(entry) {
    try {
      const roles = this.loadCompletedRoles();
      roles.unshift(entry);
      if (roles.length > 20) roles.pop();
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(roles));
    } catch (e) {}
  },
  clearHistory() { try { localStorage.removeItem(this.HISTORY_KEY); } catch (e) {} },
  resetAll() { try { localStorage.removeItem(this.KEY); localStorage.removeItem(this.SETTINGS_KEY); localStorage.removeItem(this.HISTORY_KEY); } catch (e) {} },
};

const $ = (id) => document.getElementById(id);

const el = {
  industrySelect: $('industrySelect'), industryGrid: $('industryGrid'),
  jobSelect: $('jobSelect'), startBtn: $('startBtn'), backToIndustryBtn: $('backToIndustryBtn'),
  industryBreadcrumb: $('industryBreadcrumb'),
  completedRoles: $('completedRoles'),
  helpBtn: $('helpBtn'),
  setup: $('setup'),
  learnScreen: $('learnScreen'), learnStepNum: $('learnStepNum'), learnContent: $('learnContent'),
  learnPrevBtn: $('learnPrevBtn'), learnNextBtn: $('learnNextBtn'),
  game: $('game'),
  jobTitle: $('jobTitle'), jobDesc: $('jobDesc'), jobNeeds: $('jobNeeds'),
  guide: $('guide'),
  turnText: $('turnText'), actionInfo: $('actionInfo'),
  rivals: $('rivals'),
  market: $('market'),
  hand: $('hand'), handCount: $('handCount'),
  setBuilderStatus: $('setBuilderStatus'),
  returnBtn: $('returnBtn'), returnZone: $('returnZone'), bankBtn: $('bankBtn'),
  swapMarketBtn: $('swapMarketBtn'),
  applyBtn: $('applyBtn'), endBtn: $('endBtn'),
  sets: $('sets'),
  bankedSets: $('bankedSets'), bankedSetProgress: $('bankedSetProgress'),
  playerName: $('playerName'), cvStats: $('cvStats'), log: $('log'),
  toast: $('toast'),
  modalBack: $('modal'), modalBody: $('modalBody'),
  timerDisplay: $('timerDisplay'), timer: $('timer'),
  signInBtn: $('signInBtn'), signOutBtn: $('signOutBtn'),
  cardPreview: $('cardPreview'),
  gameOverOverlay: $('gameOverOverlay'),
  skillsRequired: $('skillsRequired'),
};

app.el = el;
app.el.helpBtn = el.helpBtn;
app.el.settingsBtn = $('settingsBtn');
app.el.settingsModal = $('settingsModal');
app.el.closeSettings = $('closeSettings');
app.el.cancelSettings = $('cancelSettings');
app.el.saveSettings = $('saveSettings');
app.el.resetSettings = $('resetSettings');
app.el.soundEnabled = $('soundEnabled');
app.el.animationsEnabled = $('animationsEnabled');
app.el.autoDrawEnabled = $('autoDrawEnabled');
app.el.a11yBtn = $('a11yBtn');
app.el.themeToggle = $('themeToggle');

const CATS = ['Setup', 'Action', 'Proof', 'Impact'];
const CAT_COLOR = { Setup: 'cyan', Action: 'pink', Proof: 'gold', Impact: 'orange', Wildcard: 'lime' };
const MARKET_SIZE = 6;
const MARKET_REFRESH_PER_ROUND = 2;
const START_HAND = 4;
const PLAYER_START_HAND = 6;
const REQUIRED_SET_VARIETY = 2;
const START_ENERGY = 3;
const ACTIONS_PER_TURN = 2;
const HAND_CAP = 6;
const MAX_MARKET_PICKS_PER_ROUND = 2;
const MAX_RETURNS_PER_ROUND = 2;
const MAX_MARKET_SWAPS_PER_ROUND = 2;
const TURN_SECONDS = 300;

const INDUSTRIES = [
  { id: 'esports', name: 'Esports', icon: '🎮', desc: 'Competitive gaming, events, coaching, and production' },
  { id: 'game-design', name: 'Game Design', icon: '🎮', desc: 'Gameplay, systems, narrative, and level design' },
  { id: 'games-development', name: 'Games Development', icon: '💻', desc: 'Programming, engineering, and technical art' },
  { id: 'animation', name: 'Animation', icon: '🎭', desc: 'Character, cinematic, and technical animation' },
  { id: 'illustration', name: 'Illustration', icon: '🎨', desc: 'Concept art, 3D modeling, environments, and VFX' },
  { id: 'cyber-security', name: 'Cyber Security', icon: '🛡️', desc: 'Security operations, penetration testing, and incident response' },
  { id: 'web-design', name: 'Web Design', icon: '🌐', desc: 'UX/UI design, frontend development, and design systems' },
  { id: 'film-making', name: 'Film Making', icon: '🎬', desc: 'Editing, cinematography, and post-production' },
];

const RIVAL_SEEDS = [
  { name: 'PixelPilot', strategy: 'brief', blurb: 'Portfolio builder', plan: 'Targets live briefs and portfolio proof.' },
  { name: 'GG_Grinder', strategy: 'placement', blurb: 'Placement chaser', plan: 'Prioritises placements and practical experience.' },
  { name: 'Questline', strategy: 'balanced', blurb: 'All-rounder', plan: 'Builds a mix of experience, skills and evidence.' },
];

const RIVAL_NAMES = [
  'AceGamer', 'ByteBard', 'CodeCatalyst', 'DesignDruid', 'EcoExplorer',
  'FluxFighter', 'GlyphGuru', 'HexHero', 'IonInnovator', 'JoltJockey',
  'KineticKane', 'LumenLark', 'MavenMara', 'NexusNinja', 'OmegaOracle',
  'PixelPunk', 'QuarkQueen', 'RiftRunner', 'SynthSage', 'TokenTitan',
  'UltraUrsa', 'VoxVoyager', 'WildWrench', 'XenonX', 'YieldYonder',
  'ZephyrZoom', 'ApexAce', 'BoltBard', 'CipherSpark', 'DriftDynamo',
];

function randomRivalName() {
  const prefix = RIVAL_NAMES[Math.floor(Math.random() * RIVAL_NAMES.length)];
  const suffix = Math.floor(100 + Math.random() * 900);
  return prefix + '_' + suffix;
}

let currentIndustry = null;
let DATA = null;      // { roles, cards, sets }
let state = null;     // live game state
let uidCounter = 1;
let selectedHandUids = new Set();
let turnTimerHandle = null;
let previewState = null; // { where: 'market'|'hand', card, uid }

/* ============================== Data load ============================== */

async function loadData(industryId) {
  const res = await fetch(`data/industries/${industryId}/game-data.json`);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

function renderIndustryGrid() {
  el.industryGrid.innerHTML = '';
  INDUSTRIES.forEach((ind) => {
    const btn = document.createElement('button');
    btn.className = 'industry-card';
    btn.dataset.industry = ind.id;
    btn.innerHTML = `
      <span class="industry-icon">${ind.icon}</span>
      <h3>${ind.name}</h3>
      <p>${ind.desc}</p>
    `;
    btn.addEventListener('click', () => selectIndustry(ind.id));
    el.industryGrid.appendChild(btn);
  });
}

function selectIndustry(industryId) {
  currentIndustry = industryId;
  const ind = INDUSTRIES.find(i => i.id === industryId);
  el.industrySelect.classList.add('hidden');
  el.setup.classList.remove('hidden');
  el.industryBreadcrumb.innerHTML = `
    <button class="breadcrumb-link" id="backToIndustryLink">
      <i class="fa-solid fa-chevron-left"></i> ${ind.icon} ${ind.name}
    </button>
  `;
  document.getElementById('backToIndustryLink').addEventListener('click', () => {
    el.setup.classList.add('hidden');
    el.industrySelect.classList.remove('hidden');
  });
  loadIndustryData();
}

async function loadIndustryData() {
  try {
    DATA = await loadData(currentIndustry);
  } catch (e) {
    el.setup.innerHTML = `<div class="eyebrow">SETUP ERROR</div><h2>Couldn't load game data for ${currentIndustry}</h2><p>Run a local server, e.g. <code>python3 -m http.server</code>, then open the page through it.</p>`;
    console.error(e);
    return;
  }
  populateJobs();
  renderCompletedRoles();
  setupResumeButton();
}

function setupResumeButton() {
  const existing = $('resumeBtn');
  if (existing) existing.remove();
  const saved = window.RTTR ? window.RTTR.loadGame() : null;
  if (!saved || !saved.job || saved.winner) return;
  const resumeBtn = document.createElement('button');
  resumeBtn.id = 'resumeBtn';
  resumeBtn.className = 'btn btn-secondary';
  resumeBtn.style.marginTop = '0.75rem';
  resumeBtn.textContent = `Continue race for ${saved.job.title} \u2192`;
  resumeBtn.addEventListener('click', () => {
    state = saved;
    state.deck = cleanPile(state.deck);
    state.discard = cleanPile(state.discard);
    state.market = cleanPile(state.market);
    [state.player, ...(state.rivals || [])].forEach((agent) => { agent.hand = cleanPile(agent.hand); });
    state.player.returnsThisRound = state.player.returnsThisRound || 0;
    state.player.marketPicksThisRound = state.player.marketPicksThisRound || 0;
    state.player.marketSwapsThisRound = state.player.marketSwapsThisRound || 0;
    state.rivals.forEach((r) => {
      r.returnsThisRound = r.returnsThisRound || 0;
      r.marketPicksThisRound = r.marketPicksThisRound || 0;
      r.marketSwapsThisRound = r.marketSwapsThisRound || 0;
    });
    el.setup.classList.add('hidden');
    if (el.industrySelect) el.industrySelect.classList.add('hidden');
    el.game.classList.remove('hidden');
    startTurnTimer();
    render();
  });
  el.startBtn.insertAdjacentElement('afterend', resumeBtn);
}

/* ============================== Helpers ================================ */

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function setName(id) {
  const s = DATA.sets.find((x) => x.id === id);
  return s ? s.name : id;
}

function setMeta(id) {
  return DATA.sets.find((x) => x.id === id);
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let toastTimer = null;
function toast(msg) {
  if (!el.toast) return;
  el.toast.textContent = msg;
  el.toast.classList.add('show');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.toast.classList.remove('show');
    toastTimer = null;
  }, 2600);
}

function addLog(msg) {
  state.log.unshift(msg);
  if (state.log.length > 60) state.log.length = 60;
  renderLog();
}

function persist() {
  if (window.RTTR && state) window.RTTR.saveGame(state);
}

/* ============================== Deck ==================================== */

// Builds the "how do I get this skill" breakdown: which routes grant it, what each
// route needs, and a concrete example card. Shared by the sidebar panel and the
// "not ready yet" message so they can never disagree or hide the cheapest route.
function skillRouteBreakdown(skill) {
  const grantors = DATA.cards.filter((c) => cardGrantsAny(c, (s) => s === skill));
  if (!grantors.length) return { routes: [], text: null };
  const recs = state.job.recommendedSets || [];
  const byRoute = new Map();
  grantors.forEach((g) => {
    if (!byRoute.has(g.set)) byRoute.set(g.set, []);
    byRoute.get(g.set).push(g);
  });
  const routes = [...byRoute.entries()].map(([id, cs]) => {
    const req = requiredCategories(id);
    return {
      id,
      name: id === 'any' ? 'Any route' : setName(id),
      req,
      count: cs.length,
      isFit: recs.includes(id),
      cheapest: cs.slice().sort((a, b) => req.indexOf(a.category) - req.indexOf(b.category))[0],
    };
  }).sort((a, b) => (b.isFit - a.isFit) || (a.req.length - b.req.length));
  return { routes, text: routes.map((r) => r.name + ' (' + r.req.length + ' cards: ' + r.req.join(' + ') + ')').join('; ') };
}

let requiredSkillCache = null;
function isRoleRequiredSkill(skill) {
  if (!skill) return false;
  if (!requiredSkillCache || requiredSkillCache.data !== DATA) {
    requiredSkillCache = {
      data: DATA,
      set: new Set(DATA.roles.map((r) => r.requirements && r.requirements.skill).filter(Boolean)),
    };
  }
  return requiredSkillCache.set.has(skill);
}

function buildDeck() {
  const pool = [];
  const BASE_COPIES = 4;
  // Several routes have multiple flavour cards for the same category (e.g. 4 different
  // Action cards for "volunteering" vs only 1 Setup and 1 Proof card). Giving every
  // template a flat 4 copies would flood the deck with that category and make the other
  // required categories very rare draws. Instead, split BASE_COPIES evenly across all
  // templates that share the same (route, category), so each route's total supply of
  // Setup/Action/Proof/Impact cards stays roughly balanced regardless of how many
  // distinct card names exist for that category.
  const groupCounts = {};
  DATA.cards.forEach((tmpl) => {
    if (tmpl.category === 'Wildcard') return;
    const key = tmpl.set + '|' + tmpl.category;
    groupCounts[key] = (groupCounts[key] || 0) + 1;
  });
  // A small starting buffer only: bankSet() deals a fresh copy back whenever a
  // required-skill card is consumed, so supply is maintained during play instead.
  const REQUIRED_SKILL_COPIES = 2;

  DATA.cards.forEach((tmpl) => {
    let copies;
    if (tmpl.category === 'Wildcard') {
      copies = 2;
    } else {
      const key = tmpl.set + '|' + tmpl.category;
      copies = Math.max(1, Math.round(BASE_COPIES / groupCounts[key]));
    }
    if (cardGrantsAny(tmpl, isRoleRequiredSkill)) {
      copies = Math.max(copies, REQUIRED_SKILL_COPIES);
    }
    for (let i = 0; i < copies; i++) pool.push(tmpl);
  });
  return shuffle(pool).map(instantiate);
}

function isValidCard(card) {
  return !!(card && typeof card === 'object'
    && typeof card.id === 'string' && typeof card.name === 'string'
    && typeof card.category === 'string' && typeof card.set === 'string');
}

function instantiate(tmpl) {
  return Object.assign({}, tmpl, { uid: 'c' + uidCounter++ });
}

// Strips malformed entries out of a pile of cards. A bare `{uid}` (no id/name/
// category/set) otherwise renders as an "undefined" card and throws when previewed.
function cleanPile(pile) {
  if (!Array.isArray(pile)) return [];
  return pile.filter((card) => {
    if (isValidCard(card)) return true;
    addLog('A malformed card was removed from the pile.');
    return false;
  });
}

function draw(n) {
  const out = [];
  for (let i = 0; i < n; i++) {
    if (state.deck.length === 0) {
      if (state.discard.length > 0) {
        state.deck = shuffle(state.discard);
        state.discard = [];
        addLog('The deck reshuffled from the discard pile.');
      } else {
        state.deck = buildDeck();
        if (state.deck.length === 0) break;
        addLog('A fresh supply of opportunity cards has arrived.');
      }
    }
    const next = state.deck.pop();
    if (isValidCard(next)) out.push(next);
  }
  return out;
}

function redrawHandCards(agent, count, success = true) {
  const deselectable = agent.hand.slice();
  if (success && deselectable.length > count) {
    const shuffled = [...deselectable].sort(() => Math.random() - 0.5);
    const removed = shuffled.slice(0, count);
    agent.hand = agent.hand.filter((c) => !removed.some((r) => r.uid === c.uid));
    agent.hand.push(...draw(count));
    selectedHandUids = new Set();
  } else if (success) {
    const fresh = draw(Math.min(count, HAND_CAP - agent.hand.length));
    agent.hand.push(...fresh);
  }
}

function refillMarket() {
  while (state.market.length < MARKET_SIZE) {
    const [c] = draw(1);
    if (!c) break;
    state.market.push(c);
  }
}

function refreshMarketForRound() {
  const rotatedOut = state.market.splice(0, Math.min(MARKET_REFRESH_PER_ROUND, state.market.length));
  const freshCards = draw(rotatedOut.length);
  state.market.push(...freshCards.filter(isValidCard));
  state.discard.push(...rotatedOut.filter(isValidCard));
  refillMarket();
  addLog(`The community market refreshed with ${freshCards.length} new card(s).`);
}

function swapMarketCard(index, agent) {
  if (!state || state.winner) return;
  if (index < 0 || index >= state.market.length) return;
  const swapped = state.market.splice(index, 1);
  state.discard.push(...swapped);
  const [fresh] = draw(1);
  if (fresh) state.market.splice(index, 0, fresh);
  if (agent === state.player) {
    addLog(`You swapped a market card for a fresh draw.`);
  } else {
    addLog(`${agent.name} swapped a market card.`);
  }
}

function doMarketSwap() {
  if (state.winner || state.player.marketSwapsThisRound >= MAX_MARKET_SWAPS_PER_ROUND) {
    toast(`You can swap ${MAX_MARKET_SWAPS_PER_ROUND} market cards per round.`);
    return;
  }
  const available = state.market.length;
  if (!available) return toast('No market cards to swap.');
  const count = Math.min(MAX_MARKET_SWAPS_PER_ROUND - state.player.marketSwapsThisRound, available);
  const indices = [];
  for (let i = 0; i < available && indices.length < count; i++) indices.push(i);
  indices.sort(() => Math.random() - 0.5);
  indices.slice(0, count).forEach((i) => swapMarketCard(i, state.player));
  state.player.marketSwapsThisRound += count;
  render();
  persist();
}

/* ============================== Agents ================================== */

function newAgent(name, strategy) {
  return {
    name, strategy, isPlayer: strategy == null,
    energy: START_ENERGY, hand: [], banked: [], skills: [],
    evidence: 0, reliability: 0, references: 0, distinctions: 0,
    applied: false, actionPenalty: 0,
    marketPicksThisRound: 0, returnsThisRound: 0, marketSwapsThisRound: 0,
  };
}

function agentCV(agent) {
  return { experience: agent.banked.length, evidence: agent.evidence, skills: agent.skills };
}

function minimumExperienceForJob(job) {
  return Math.max(REQUIRED_SET_VARIETY, Number(job.requirements.experience) || 1);
}

function requiredCategories(setId) {
  const meta = setMeta(setId);
  return meta && Array.isArray(meta.requiredCategories) ? meta.requiredCategories : ['Setup', 'Action', 'Proof'];
}

function selectedRoute(cards) {
  const routes = new Set(cards.filter((card) => card.category !== 'Wildcard' && card.set !== 'any').map((card) => card.set));
  return routes.size === 1 ? [...routes][0] : null;
}

function jobSetOptions(job) {
  const recommended = ((job && job.recommendedSets) || []).map((id) => ({ volunteer: 'volunteering', partner: 'partnership' }[id] || id));
  const available = recommended.filter((id) => DATA.sets.some((set) => set.id === id));
  return new Set(available.length ? available : DATA.sets.map((set) => set.id));
}

function completedSetTypes(agent) {
  return new Set(agent.banked.map((entry) => entry.set));
}

function completedJobSetTypes(agent, job) {
  const relevant = jobSetOptions(job);
  return new Set(agent.banked.map((entry) => entry.set).filter((id) => relevant.has(id)));
}

function eligible(agent, job) {
  const cv = agentCV(agent);
  return cv.experience >= minimumExperienceForJob(job)
    && completedJobSetTypes(agent, job).size >= REQUIRED_SET_VARIETY
    && cv.evidence >= job.requirements.evidence
    && agent.skills.includes(job.requirements.skill);
}

/* ============================== New game ================================ */

function populateJobs() {
  const byCat = {};
  DATA.roles.forEach((r) => {
    (byCat[r.category] = byCat[r.category] || []).push(r);
  });
  el.jobSelect.innerHTML = '';
  Object.keys(byCat).forEach((cat) => {
    const group = document.createElement('optgroup');
    group.label = cat;
    byCat[cat].forEach((r) => {
      const opt = document.createElement('option');
      opt.value = r.id;
      opt.textContent = `${r.art} ${r.title}`;
      group.appendChild(opt);
    });
    el.jobSelect.appendChild(group);
  });
}

function newGame(jobId) {
  const job = DATA.roles.find((r) => r.id === jobId) || DATA.roles[0];
  state = {
    job,
    round: 1,
    actionsLeft: ACTIONS_PER_TURN,
    winner: null,
    log: [],
    deck: [],
    discard: [],
    market: [],
    player: newAgent('You', null),
    rivals: RIVAL_SEEDS.map((r) => { const agent = newAgent(r.name, r.strategy); agent.displayName = randomRivalName(); return agent; }),
  };
  state.deck = buildDeck();
  refillMarket();
  state.player.hand = draw(PLAYER_START_HAND);
  state.rivals.forEach((r) => { r.hand = draw(START_HAND); });
  selectedHandUids = new Set();
  addLog(`You start your race for ${job.title}.`);
  showGuide(`START HERE: choose one colour route and collect its listed card types. Employer Visit needs 2 cards; Volunteering and Live Project Brief need 3; Block Placement and Industry Partnership need 4. There are several examples to choose from. Select only one card of each required type, then bank the set to add CV experience, evidence and a skill.`);
  el.setup.classList.add('hidden');
  el.learnScreen.classList.add('hidden');
  el.game.classList.remove('hidden');
  startTurnTimer();
  render();
  persist();
}

/* ============================== Banking logic ============================ */

function findBank(cards, forcedSet, allowSubset = false) {
  // cards: array of card objects (with category/set/uid). Returns
  // { ok, targetSet, used:[card,...] } or { ok:false, msg }
  const nonWild = cards.filter((c) => c.category !== 'Wildcard');
  const setIds = new Set(nonWild.map((c) => c.set).filter((setId) => setId !== 'any'));
  if (forcedSet) setIds.add(forcedSet);
  if (setIds.size > 1) return { ok: false, msg: "Those cards belong to different opportunities." };
  const targetSet = setIds.size ? [...setIds][0] : null;
  if (!targetSet) return { ok: false, msg: "Include at least one card from an experience route so I know which group you're banking." };
  const meta = setMeta(targetSet);
  const required = meta && Array.isArray(meta.requiredCategories) ? meta.requiredCategories : ['Setup', 'Action', 'Proof'];
  if (cards.length < required.length || (!allowSubset && cards.length !== required.length)) return { ok: false, msg: `${setName(targetSet)} needs exactly ${required.length} cards: ${required.join(', ')}.` };
  const groups = [];
  function choose(start, chosen) {
    if (chosen.length === required.length) { groups.push(chosen); return; }
    for (let i = start; i < cards.length; i++) choose(i + 1, [...chosen, cards[i]]);
  }
  if (allowSubset && cards.length > required.length) choose(0, []);
  else groups.push(cards);
  let bestMissing = null;
  for (const group of groups) {
    const normal = group.filter((card) => card.category !== 'Wildcard');
    const categories = normal.map((card) => card.category);
    if (new Set(categories).size !== categories.length || new Set(group.map((card) => card.id)).size !== group.length) continue;
    const used = [];
    const remaining = group.slice();
    const missing = [];
    for (const cat of required) {
      const idx = remaining.findIndex((c) => c.category === cat && (c.set === targetSet || c.set === 'any'));
      const wildcardIdx = remaining.findIndex((c) => c.category === 'Wildcard');
      const chosen = idx !== -1 ? idx : wildcardIdx;
      if (chosen === -1) { missing.push(cat); continue; }
      used.push(remaining[chosen]);
      remaining.splice(chosen, 1);
    }
    if (!missing.length) return { ok: true, targetSet, used };
    if (!bestMissing || missing.length < bestMissing.length) bestMissing = missing;
  }
  if (bestMissing && bestMissing.length) {
    const haveText = nonWild.length ? nonWild.map((c) => c.category).join(', ') : 'no route cards yet';
    const missingText = bestMissing.length === 1
      ? `${/^[AEIOU]/i.test(bestMissing[0]) ? 'an' : 'a'} ${bestMissing[0]} card`
      : `${bestMissing.length} cards (${bestMissing.join(', ')})`;
    return { ok: false, msg: `Missing ${missingText} for ${setName(targetSet)}. You have: ${haveText}.` };
  }
  return { ok: false, msg: `Missing a required card type for ${setName(targetSet)}. Use one each: ${required.join(', ')}.` };
}

function bankSet(agent, targetSet, used) {
  const meta = setMeta(targetSet);
  used.forEach((c) => {
    agent.hand = agent.hand.filter((h) => h.uid !== c.uid);
    state.discard.push(c);
    // A role-required skill card went into a banked set, so deal a fresh copy back
    // to circulation. The skill stays obtainable for every agent still racing.
    if (cardGrantsAny(c, isRoleRequiredSkill)) {
      const tmpl = DATA.cards.find((d) => d.id === c.id);
      if (tmpl) state.deck = shuffle([...state.deck, instantiate(tmpl)]);
    }
  });

  let evidenceGain = meta.reward.evidenceValue;
  let strong = true;
  if (targetSet === 'brief') {
    if (agent.energy > 0) agent.energy -= 1; else strong = false;
  }
  if (!strong) evidenceGain = Math.max(1, evidenceGain - 1);

  agent.banked.push({ set: targetSet, round: state.round, strong });
  agent.evidence += evidenceGain;

  // Every skill card in a banked set counts. Using find() here granted only the first
  // one and silently dropped the rest, so a set holding the required skill card could
  // award a different skill instead.
  const gained = [...new Set(used.flatMap((c) => cardSkills(c)))];
  if (!gained.length) gained.push('Adaptability');
  gained.forEach((s) => { if (!agent.skills.includes(s)) agent.skills.push(s); });
  const skillName = gained.join(' + ');

  if (meta.reward.reference) agent.references += 1;
  if (targetSet === 'volunteering') agent.reliability += 1;

  const settings = window.RTTR ? window.RTTR.getSettings() : { autoDraw: true };
  if (settings.autoDraw) {
    const fresh = draw(Math.max(0, START_HAND - agent.hand.length));
    agent.hand.push(...fresh);
  }

  return { meta, evidenceGain, skillName, strong };
}

/* ============================== Player actions ============================ */

function requireActions(n) {
  if (state.winner) return false;
  if (state.actionsLeft < n) {
    toast(`You only have ${state.actionsLeft} action(s) left this turn.`);
    return false;
  }
  return true;
}

function spendActions(n) {
  state.actionsLeft -= n;
}

function onMarketCardClick(uid) {
  if (state.winner) return;
  if (!requireActions(1)) return;
  if (state.player.marketPicksThisRound >= MAX_MARKET_PICKS_PER_ROUND) {
    toast(`You can take up to ${MAX_MARKET_PICKS_PER_ROUND} community cards per round.`);
    return;
  }
  const idx = state.market.findIndex((c) => c.uid === uid);
  if (idx === -1) return;
  const [card] = state.market.splice(idx, 1);
  if (state.player.hand.length >= HAND_CAP) {
    toast('Your hand is full — discard something first.');
    state.market.splice(idx, 0, card);
    return;
  }
  state.player.hand.push(card);
  state.player.marketPicksThisRound += 1;
  refillMarket();
  spendActions(1);
  addLog(`You took ${card.name} from the market.`);
  afterPlayerAction();
}

function toggleHandSelect(uid) {
  if (selectedHandUids.has(uid)) selectedHandUids.delete(uid);
  else {
    const cards = state.player.hand.filter((card) => selectedHandUids.has(card.uid));
    const route = selectedRoute(cards);
    const limit = route ? requiredCategories(route).length : Math.max(...DATA.sets.map((set) => requiredCategories(set.id).length));
    if (selectedHandUids.size >= limit) {
      toast(`This route uses exactly ${limit} cards. Remove one selected card before adding another.`);
      return;
    }
    if (cards.some((card) => card.category !== 'Wildcard' && state.player.hand.find((candidate) => candidate.uid === uid)?.category === card.category)) {
      toast('Choose different card types for a set; duplicate types cannot be used.');
      return;
    }
    selectedHandUids.add(uid);
  }
  renderHand();
  renderControls();
}

function returnCardsToDeck(uids) {
  if (state.winner) return;
  const uniqueUids = [...new Set(uids)];
  if (!uniqueUids.length) return toast('Select at least one hand card to return.');
  const remaining = MAX_RETURNS_PER_ROUND - state.player.returnsThisRound;
  if (uniqueUids.length > remaining) return toast(`You can return ${remaining} more card(s) this round.`);
  const returned = state.player.hand.filter((card) => uniqueUids.includes(card.uid));
  if (!returned.length) return;
  state.player.hand = state.player.hand.filter((card) => !uniqueUids.includes(card.uid));
  state.deck = shuffle([...state.deck, ...returned]);
  state.player.returnsThisRound += returned.length;
  selectedHandUids = new Set();
  addLog(`You returned ${returned.length} card(s) to the deck.`);
  closePreview();
  afterPlayerAction();
}

function doReturnSelected() {
  returnCardsToDeck([...selectedHandUids]);
}

function doBank() {
  if (!requireActions(1)) return;
  const cards = state.player.hand.filter((c) => selectedHandUids.has(c.uid));
  const route = selectedRoute(cards);
  if (!route) {
    toast('Include at least one card from an experience route. Wildcards can fill missing card types.');
    return;
  }
  const required = requiredCategories(route);
  if (cards.length !== required.length) {
    toast(`${setName(route)} needs exactly ${required.length} cards: ${required.join(', ')}.`);
    return;
  }
  const result = findBank(cards);
  if (!result.ok) {
    toast(result.msg);
    showGuide(`${result.msg} Choose the different card types listed for this experience route. Wildcards can fill one missing type each.`);
    return;
  }
  const { meta, evidenceGain, skillName, strong } = bankSet(state.player, result.targetSet, result.used);
  spendActions(1);
  selectedHandUids = new Set();
  addLog(`You banked ${meta.name}! +${evidenceGain} evidence, gained the ${skillName} skill${strong ? '' : ' (basic evidence — low energy)'}.`);
  showGuide(`You completed ${meta.name}. ${meta.why} This adds toward the "${state.job.requirements.skill}" and experience requirements for ${state.job.title}.`);
  afterPlayerAction();
  maybeApplyPrompt();
}

function maybeApplyPrompt() {
  if (eligible(state.player, state.job) && !state.player.applied) {
    toast(`You now meet the requirements for ${state.job.title} — press Apply!`);
  }
}

function doApply() {
  if (state.winner) return;
  if (!requireActions(1)) return;
  if (!eligible(state.player, state.job)) {
    const need = missingRequirements(state.player, state.job);
    toast(`Not ready yet — you still need: ${need.join(', ')}.`);
    return;
  }
  spendActions(1);
  state.player.applied = true;
  addLog(`You submitted your application for ${state.job.title}!`);
  endGame(state.player);
}

function missingRequirements(agent, job) {
  const cv = agentCV(agent);
  const out = [];
  const experienceGoal = minimumExperienceForJob(job);
  if (cv.experience < experienceGoal) out.push(`${experienceGoal - cv.experience} more completed experience set(s)`);
  const setVariety = completedJobSetTypes(agent, job).size;
  if (setVariety < REQUIRED_SET_VARIETY) out.push(`experience from ${REQUIRED_SET_VARIETY - setVariety} more job-relevant set type(s)`);
  if (cv.evidence < job.requirements.evidence) out.push(`${job.requirements.evidence - cv.evidence} more evidence`);
  if (!agent.skills.includes(job.requirements.skill)) {
    const { routes, text } = skillRouteBreakdown(job.requirements.skill);
    const hint = text ? ` Get it by banking a set — ${text}.` : ' No card in this pack grants it.';
    out.push(`the ${job.requirements.skill} skill.${hint}`);
  }
  return out;
}

function afterPlayerAction() {
  checkHandLimit();
  render();
  persist();
}

function checkHandLimit() {
  if (!state || state.winner) return;
  if (state.player.hand.length <= HAND_CAP) return;
  const excess = state.player.hand.length - HAND_CAP;
  const toSelect = new Set();
  openModal(`
    <h2>Hand limit (${state.player.hand.length}/${HAND_CAP})</h2>
    <p>Choose ${excess} card${excess > 1 ? 's' : ''} to discard to get back under the limit.</p>
    <div class="discard-grid" id="discardGrid"></div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Cancel</button>
      <button class="btn primary-btn" id="confirmDiscard" disabled>Discard selected (${excess})</button>
    </div>
  `);
  const grid = $('discardGrid');
  state.player.hand.forEach((c, i) => {
    const div = cardEl(c, {
      selected: false,
      onClick: () => {
        if (toSelect.has(i)) toSelect.delete(i);
        else if (toSelect.size < excess) toSelect.add(i);
        else return;
        renderDiscardGrid(toSelect, excess);
      },
    });
    grid.appendChild(div);
  });
  function renderDiscardGrid(sel, count) {
    grid.innerHTML = '';
    state.player.hand.forEach((c, i) => {
      const div = cardEl(c, {
        selected: sel.has(i),
        onClick: () => {
          if (sel.has(i)) sel.delete(i);
          else if (sel.size < count) sel.add(i);
          else return;
          renderDiscardGrid(sel, count);
        },
      });
      grid.appendChild(div);
    });
    const btn = $('confirmDiscard');
    if (btn) btn.disabled = sel.size !== count;
  }
  
  const confirmBtn = $('confirmDiscard');
  if (confirmBtn) {
    confirmBtn.onclick = function () {
      const sel = [...toSelect];
      if (sel.length !== excess) return;
      const discarded = sel.map((i) => state.player.hand[i]).filter(Boolean);
      state.player.hand = state.player.hand.filter((_, i) => !toSelect.has(i));
      state.discard.push(...discarded);
      addLog(`You discarded ${discarded.length} card(s) to meet the hand limit.`);
      closeModal();
      render();
      persist();
    };
  }
}

/* ============================== End turn / rivals ========================= */

function endTurn() {
  if (state.winner) return;
  stopTurnTimer();
  addLog(`— End of round ${state.round} for you —`);
  state.rivalTurnSummaries = [];
  state.rivalTurnIndex = 0;
  state.rivals.forEach((r) => {
    if (!state.winner) state.rivalTurnSummaries.push(runRivalTurn(r));
  });
  if (!state.rivalTurnSummaries.length) {
    finishRivalPhase();
    return;
  }
  showRivalTurnPopup();
  persist();
}

function finishRivalPhase() {
  closeModal();
  if (state.winner) {
    endGame(state.winner);
    render();
    persist();
    return;
  }
  state.round += 1;
  if (state.round % 3 === 0) triggerEvent();
  state.player.energy = Math.min(START_ENERGY, state.player.energy + 1);
  state.player.marketPicksThisRound = 0;
  state.player.returnsThisRound = 0;
  state.player.marketSwapsThisRound = 0;
  state.actionsLeft = ACTIONS_PER_TURN - (state.player.actionPenalty || 0);
  state.player.actionPenalty = 0;
  if (state.actionsLeft < 1) state.actionsLeft = 1;
  refreshMarketForRound();
  addLog(`Round ${state.round} begins.`);
  startTurnTimer();
  render();
  persist();
}

/* ============================== Events ==================================== */

const EVENTS = [
  {
    title: 'Assignment Deadline',
    body: 'You have an assignment due soon. What do you do?',
    choices: [
      { label: 'Complete it now', run: (a) => { if (!a.skills.includes('Problem solving')) a.skills.push('Problem solving'); addLog('You completed the assignment and gained the Problem solving skill.'); } },
      { label: 'Ask for help (Feedback token)', run: (a) => { addLog('You asked for help — you\'ll finish it on a later turn.'); } },
      { label: 'Ignore it', run: (a) => { a.energy = Math.max(0, a.energy - 1); a.actionPenalty = 1; addLog('You ignored it — you lose 1 Energy and 1 action next round.'); } },
    ],
  },
  {
    title: "You're Unwell on an Experience Day",
    body: 'You need to take a day off. How do you handle it?',
    choices: [
      { label: 'Contact employer & tutor', run: (a) => { addLog('You contacted them and protected your Reliability.'); } },
      { label: 'Take the day without telling anyone', run: (a) => { a.actionPenalty = 1; addLog('You lose 1 action next round while you reschedule.'); } },
    ],
  },
  {
    title: 'New Game Jam Announced',
    body: 'A short game jam is open to students.',
    choices: [
      { label: 'Join it (spend 1 Energy)', run: (a) => { if (a.energy > 0) { a.energy -= 1; a.evidence += 1; if (!a.skills.includes('Digital Production')) a.skills.push('Digital Production'); addLog('You joined the jam — +1 evidence and the Digital Production skill.'); } else { addLog('Not enough Energy to join — you sit this one out.'); } } },
      { label: 'Sit this one out', run: () => { addLog('You sit this one out and rest instead.'); } },
    ],
  },
  {
    title: 'Your First Choice Falls Through',
    body: 'The placement or visit you were counting on is no longer available.',
    choices: [
      { label: 'Draw two new Opportunity cards', run: (a) => { const fresh = draw(Math.min(2, Math.max(0, HAND_CAP - a.hand.length))); a.hand.push(...fresh); addLog(`You drew ${fresh.length} new opportunity card(s).`); } },
    ],
  },
  {
    title: 'Bonus Mini-Challenge',
    body: 'A quick skills challenge pops up in the student portal. Nail it and you can redraw some cards.',
    choices: [
      { label: 'Give it a go (redraw 2 cards)', run: (a) => { redrawHandCards(a, 2, true); addLog('You nailed the challenge and redrew 2 cards from your hand.'); } },
      { label: 'Not today', run: () => { addLog('You skip the challenge and keep your current hand.'); } },
    ],
  },
];

function triggerEvent() {
  const ev = EVENTS[Math.floor(Math.random() * EVENTS.length)];
  openModal(`
    <h2>${escapeHtml(ev.title)}</h2>
    <p>${escapeHtml(ev.body)}</p>
    <div class="modal-actions" id="eventChoices"></div>
  `);
  const wrap = $('eventChoices');
  ev.choices.forEach((choice) => {
    const btn = document.createElement('button');
    btn.className = 'btn';
    btn.textContent = choice.label;
    btn.addEventListener('click', () => {
      choice.run(state.player);
      closeModal();
      render();
      persist();
    });
    wrap.appendChild(btn);
  });
}

/* ============================== Win / apply =============================== */

function endGame(winnerAgent) {
  state.winner = winnerAgent;
  stopTurnTimer();
  if (window.RTTR) window.RTTR.clearGame();
  const you = winnerAgent === state.player;
  if (you && state.job) {
    const cv = agentCV(winnerAgent);
    window.RTTR.saveCompletedRole({
      jobId: state.job.id,
      jobTitle: state.job.title,
      art: state.job.art,
      date: new Date().toISOString(),
      experience: winnerAgent.banked.length,
      evidence: winnerAgent.evidence,
      skills: winnerAgent.skills.slice(),
      rounds: state.round,
    });
    renderCompletedRoles();
  }
  el.game.classList.add('game-over');
  const overlay = el.gameOverOverlay;
  if (overlay) {
    if (document.getElementById('gameOverCard')) return;
    const winIcon = you ? '🎉' : '🏆';
    const title = you ? 'You got the job!' : `${winnerAgent.name} got there first`;
    const sub = you
      ? `Congratulations — you're ready for the ${escapeHtml(state.job.title)} role.`
      : `${winnerAgent.name} applied for <strong>${escapeHtml(state.job.title)}</strong> before you did.`;
    overlay.innerHTML = `
      <div class="game-over-card" id="gameOverCard">
        <div class="win-icon">${winIcon}</div>
        <h2>${escapeHtml(title)}</h2>
        <p>${sub}</p>
        <div class="final-stats">
          <span>Experience: <strong>${winnerAgent.banked.length}</strong></span>
          <span>Evidence: <strong>${winnerAgent.evidence}</strong></span>
          <span>Skills: <strong>${winnerAgent.skills.join(', ') || 'none'}</strong></span>
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" id="closeGameOver" style="margin-right:auto">Continue watching</button>
          <button class="btn primary-btn" id="playAgainBtn">Choose a new role</button>
        </div>
      </div>
    `;
    overlay.classList.remove('hidden');
    $('playAgainBtn').addEventListener('click', () => {
      overlay.classList.add('hidden');
      overlay.innerHTML = '';
      el.game.classList.remove('game-over');
      el.game.classList.add('hidden');
      el.industrySelect.classList.remove('hidden');
      el.setup.classList.add('hidden');
      closeHallOfFame();
    });
    $('closeGameOver').addEventListener('click', () => {
      overlay.classList.add('hidden');
      overlay.innerHTML = '';
      el.game.classList.remove('game-over');
    });
  }
}

/* ============================== Modal / toast ============================= */

function openModal(html) {
  el.modalBody.innerHTML = html;
  el.modalBack.classList.add('show');
}
function closeModal() {
  el.modalBack.classList.remove('show');
}
function closeHallOfFame() {
  el.hallOfFame.classList.add('hidden');
  el.industrySelect.classList.remove('hidden');
  el.setup.classList.add('hidden');
  el.game.classList.add('hidden');
}
if (el.modalBack) {
  el.modalBack.addEventListener('click', (e) => { if (e.target === el.modalBack) closeModal(); });
}

if (el.cardPreview) {
  el.cardPreview.addEventListener('click', (e) => { if (e.target === el.cardPreview) closePreview(); });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closePreview();
});

/* Auto-save on page hide / unload / refresh so progress survives crashes */
function autoSave() {
  if (state && !state.winner && window.RTTR) window.RTTR.saveGame(state);
}
window.addEventListener('beforeunload', (e) => {
  autoSave();
  if (turnTimerHandle) e.preventDefault();
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) autoSave();
});

/* ============================== Turn timer ================================ */

function startTurnTimer() {
  stopTurnTimer();
  if (!el.timerDisplay) return;
  let remaining = TURN_SECONDS;
  el.timerDisplay.classList.remove('hidden');
  renderTimer(remaining);
  turnTimerHandle = setInterval(() => {
    remaining -= 1;
    renderTimer(remaining);
    if (remaining <= 0) {
      stopTurnTimer();
      toast("Time's up — ending your turn.");
      endTurn();
    }
  }, 1000);
}
function stopTurnTimer() {
  if (turnTimerHandle) { clearInterval(turnTimerHandle); turnTimerHandle = null; }
  if (el.timerDisplay) el.timerDisplay.classList.add('hidden');
}
function renderTimer(remaining) {
  const m = Math.floor(remaining / 60), s = remaining % 60;
  el.timer.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  el.timer.classList.toggle('low', remaining <= 30);
}

/* ============================== Rendering ================================= */

function render() {
  if (!state) return;
  el.jobTitle.textContent = `${state.job.art} ${state.job.title}`;
  el.jobDesc.textContent = state.job.description;
  renderJobNeeds();
  renderSkills();
  renderTurnBar();
  renderRivals();
  renderMarket();
  renderHand();
  renderSets();
  renderBankedSets();
  renderCV();
  renderControls();
  renderLog();
}

function renderCompletedRoles() {
  const roles = window.RTTR ? window.RTTR.loadCompletedRoles() : [];
  if (!el.completedRoles) return;
  if (!roles.length) {
    el.completedRoles.innerHTML = '<div class="history-empty">No roles completed yet. Start a new career run to earn your place in the hall of fame.</div>';
    return;
  }
  el.completedRoles.innerHTML = `<div class="history-header"><span>${roles.length} role${roles.length !== 1 ? 's' : ''} completed</span></div>${    roles.slice(0, 8).map((r) => `
      <div class="completed-role">
        <span class="completed-role-art">${r.art || '🎮'}</span>
        <div class="completed-role-info">
          <strong>${escapeHtml(r.jobTitle)}</strong>
          <small>${r.rounds} round${r.rounds !== 1 ? 's' : ''} · ${r.evidence} evidence · Skills: ${r.skills.join(', ') || 'none'}</small>
        </div>
        <span class="completed-role-date">${new Date(r.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})</span>
      </div>
    `).join('')
  }`;
}

function renderSkills() {
  if (!el.skillsRequired || !state) return;
  const req = state.job.requirements;
  const playerSkills = state.player.skills || [];
  // Required skill always leads the list, even if no card currently grants it,
  // so the panel can never silently omit what the player still has to collect.
  const others = [...new Set(DATA.cards
    .filter((c) => {
      if (!cardSkills(c).length) return false;
      return (state.job.recommendedSets || []).includes(c.set);
    })
    .flatMap((c) => cardSkills(c)))]
    .sort();
  const allSkills = [req.skill, ...others.filter((s) => s !== req.skill)];

  el.skillsRequired.innerHTML = allSkills.map((skill) => {
    const has = playerSkills.includes(skill);
    const isRequired = skill === req.skill;
    const grantors = DATA.cards.filter((c) => cardGrantsAny(c, (s) => s === skill));
    const cls = isRequired ? (has ? 'owned required' : 'needed required') : (has ? 'owned' : 'needed');
    let hint = '';
    if (isRequired && !has) {
      if (!grantors.length) {
        hint = '<small class="skill-hint skill-hint-warn">No card in this pack grants it \u2014 this role cannot be completed.</small>';
      } else {
        // Group the granting cards by route, role-fit routes first, fewest cards first,
        // so the player can see the cheapest way to actually earn the skill.
        const recs = state.job.recommendedSets || [];
        const byRoute = new Map();
        grantors.forEach((g) => {
          if (!byRoute.has(g.set)) byRoute.set(g.set, []);
          byRoute.get(g.set).push(g);
        });
        const routes = [...byRoute.entries()].map(([id, cs]) => {
          const req = requiredCategories(id);
          return {
            id,
            name: id === 'any' ? 'Any route' : setName(id),
            req,
            cheapest: cs.slice().sort((a, b) => req.indexOf(a.category) - req.indexOf(b.category))[0],
            count: cs.length,
            isFit: recs.includes(id),
          };
        }).sort((a, b) => (b.isFit - a.isFit) || (a.req.length - b.req.length));
        const shortest = Math.min(...routes.map((r) => r.req.length));
        const items = routes.slice(0, 3).map((r) => {
          const fit = r.isFit ? ' \u2b50 role-fit' : '';
          const usable = r.req.includes(r.cheapest.category);
          const tryText = usable
            ? `try "${escapeHtml(r.cheapest.name)}" as the ${escapeHtml(r.cheapest.category)} slot`
            : `"${escapeHtml(r.cheapest.name)}" is a ${escapeHtml(r.cheapest.category)} card, which this route does not use`;
          return `${escapeHtml(r.name)}${fit}: bank ${r.req.length} cards \u2014 ${escapeHtml(r.req.join(' + '))}; ${tryText}`;
        });
        const more = routes.length > 3 ? ` (+${routes.length - 3} more route${routes.length - 3 === 1 ? '' : 's'})` : '';
        const cheapestNote = routes.some((r) => r.req.length === shortest && r.isFit)
          ? ''
          : ` Cheapest is ${shortest} cards.`;
        hint = `<small class="skill-hint">Get it by banking a set:<br>\u2022 ${items.join('<br>\u2022 ')}${more}.${escapeHtml(cheapestNote)}</small>`;
      }
    }
    return `<span class="skill-item ${cls}">
      <span class="skill-check">${has ? '\u2713' : '\u25cb'}</span>
      <span class="skill-name">${escapeHtml(skill)}${isRequired ? ' <b class="required-tag">needed</b>' : ''}${hint}</span>
    </span>`;
  }).join('');
}

function renderJobNeeds() {
  const req = state.job.requirements;
  const cv = agentCV(state.player);
  const line = (ok, text, subtext, extraClass) => `<span class="need ${ok ? 'met' : ''} ${extraClass || ''}">${ok ? '✓' : '•'} ${text}${subtext ? '<small>' + subtext + '</small>' : ''}</span>`;
  const hasSkill = state.player.skills.includes(req.skill);
  const skillCards = DATA.cards.filter((c) => cardGrantsAny(c, (s) => s === req.skill));
  const skillHint = hasSkill ? '' : skillCards.length ? `Includes: ${skillCards.slice(0, 3).map((c) => `"${c.name}"`).join(', ')}` : '';
  const skillClass = hasSkill ? 'met' : 'skill-needed';
  el.jobNeeds.innerHTML = [
    line(cv.experience >= minimumExperienceForJob(state.job), `${cv.experience}/${minimumExperienceForJob(state.job)} completed sets`),
    line(completedJobSetTypes(state.player, state.job).size >= REQUIRED_SET_VARIETY, `${completedJobSetTypes(state.player, state.job).size}/${REQUIRED_SET_VARIETY} role-fit set types`),
    line(cv.evidence >= req.evidence, `${req.evidence} evidence`),
    line(hasSkill, `★ Skill: ${req.skill}`, skillHint, skillClass),
  ].join('');
}

function renderTurnBar() {
  el.turnText.textContent = `Round ${state.round} — your turn`;
  el.actionInfo.textContent = `Actions left: ${state.actionsLeft} · Energy: ${'⚡'.repeat(state.player.energy)}${'·'.repeat(Math.max(0, START_ENERGY - state.player.energy))}`;
}

function renderRivals() {
  el.rivals.innerHTML = '';
  state.rivals.forEach((r, i) => {
    const seed = RIVAL_SEEDS[i];
    const cv = agentCV(r);
    const req = state.job.requirements;
    const pct = Math.round(Math.min(1, ((cv.experience / minimumExperienceForJob(state.job)) + (completedJobSetTypes(r, state.job).size / REQUIRED_SET_VARIETY) + (cv.evidence / req.evidence) + (r.skills.includes(req.skill) ? 1 : 0)) / 4) * 100);
    const card = document.createElement('div');
    card.className = 'rival-card';
    card.style.cursor = 'pointer';
    const bankedSets = (r.banked || []).map((b) => setMeta(b.set)?.name || b.set);
    card.innerHTML = `
      <div class="rival-head">
        <strong>${escapeHtml(r.displayName || r.name)}</strong>
        <span class="rival-strategy">${escapeHtml(seed.blurb)}</span>
        <span class="rival-bank-count" title="Completed sets">${bankedSets.length}</span>
      </div>
      <div class="rival-plan">${escapeHtml(seed.plan)}</div>
      <div class="rival-bar"><div class="rival-bar-fill" style="width:${pct}%"></div></div>
      <div class="rival-stats">Sets ${cv.experience} · ${completedJobSetTypes(r, state.job).size}/${REQUIRED_SET_VARIETY} role-fit types · Evidence ${cv.evidence}<br>Skills: ${r.skills.join(', ') || '—'}</div>
    `;
    card.addEventListener('click', () => showRivalSets(i));
    el.rivals.appendChild(card);
  });
}

function showRivalSets(index) {
  const rival = state.rivals[index];
  if (!rival) return;
  const banked = rival.banked || [];
  if (!banked.length) return toast('This rival has not completed any sets yet.');
  const rows = banked.map((b) => {
    const meta = setMeta(b.set);
    const name = meta ? meta.name : b.set;
    const round = b.round;
    const strong = b.strong ? 'with proof' : 'weaker';
    return `<div class="rival-banked-row"><strong>${escapeHtml(name)}</strong><small>Round ${round} · ${strong}</small></div>`;
  }).join('');
  const usedSets = new Set(banked.map((b) => b.set));
  const remainingInfo = DATA.sets.map((s) => {
    const taken = usedSets.has(s.id) ? 'taken' : 'available';
    return `<span class="rival-banked-set ${taken}">${escapeHtml(s.name)}: ${taken}</span>`;
  }).join('');
  openModal(`
    <h2>${escapeHtml(rival.displayName || rival.name)}'s Completed Sets</h2>
    <p>Banked experience sets:</p>
    <div class="rival-banked-list">${rows}</div>
    <p style="margin-top:1rem">Community card availability:</p>
    <div class="rival-set-tags">${remainingInfo}</div>
    <div class="modal-actions">
      <button class="btn btn-secondary" onclick="closeModal()">Close</button>
    </div>
  `);
}

// Cards may carry a single `skill` string or a `skills` array; normalise both.
function cardSkills(card) {
  if (!card) return [];
  const list = Array.isArray(card.skills) ? card.skills.slice() : [];
  if (card.skill && !list.includes(card.skill)) list.unshift(card.skill);
  return list.filter(Boolean);
}

function cardGrantsAny(card, predicate) {
  return cardSkills(card).some(predicate);
}

function isRequiredSkillCard(card) {
  return !!(state && state.job
    && cardGrantsAny(card, (s) => s === state.job.requirements.skill)
    && !(state.player && state.player.skills.includes(state.job.requirements.skill)));
}

function cardSetClass(card) {
  if (!isValidCard(card)) return 'invalid-card';
  if (!card.set) return 'wildcard-card';
  if (card.category === 'Wildcard') {
    if (card.set === 'any') return 'wildcard-card';
    const id = DATA.sets.some((set) => set.id === card.set) ? card.set : 'unassigned';
    return `set-${id}`;
  }
  if (card.set === 'any') return 'route-flexible-card';
  const id = DATA.sets.some((set) => set.id === card.set) ? card.set : 'unassigned';
  return `set-${id}`;
}

function cardEl(c, opts) {
  opts = opts || {};
  if (!isValidCard(c)) {
    // Return a real element: callers attach listeners to whatever cardEl returns.
    const broken = document.createElement('div');
    broken.className = 'card invalid-card';
    broken.innerHTML = '<div class="card-art">\u2753</div><div class="card-name">Damaged card</div>'
      + '<div class="card-type">removed from play</div>';
    return broken;
  }
  const div = document.createElement('div');
  div.className = 'card cat-' + CAT_COLOR[c.category] + ' ' + cardSetClass(c) + (isRequiredSkillCard(c) ? ' card-key-skill' : '');
  if (opts.selected) div.classList.add('selected');
  div.dataset.uid = c.uid;
  if (opts.dragSource) {
    div.draggable = true;
    div.addEventListener('dragstart', (event) => {
      event.dataTransfer.setData('text/plain', JSON.stringify({ source: opts.dragSource, uid: c.uid }));
      event.dataTransfer.effectAllowed = 'move';
      div.classList.add('dragging-card');
    });
    div.addEventListener('dragend', () => div.classList.remove('dragging-card'));
  }
  div.title = c.description + (c.flavor ? '\n\n"' + c.flavor + '"' : '');
  div.innerHTML = `
    <div class="card-art">${c.art || '🃏'}</div>
    <div class="card-name">${escapeHtml(c.name)}</div>
    <div class="card-type">${c.category}${c.set === 'any' ? ' · <span class="any-route">Any route</span>' : ' · ' + escapeHtml(setName(c.set))}</div>
    ${cardSkills(c).length ? '<div class="card-skill' + (isRequiredSkillCard(c) ? ' card-skill-key' : '') + '"><i class="fa-solid fa-star"></i> ' + escapeHtml(cardSkills(c).join(' \u00b7 ')) + (isRequiredSkillCard(c) ? ' \u2014 needed for this role' : '') + '</div>' : ''}
  `;
  if (opts.onClick) div.addEventListener('click', opts.onClick);
  return div;
}

/* ============================== Card Preview ============================= */

function openPreview(where, card) {
  if (!el.cardPreview) return;
  if (!isValidCard(card)) return toast('That card is damaged and cannot be opened.');
  previewState = { where, card };
  const cat = card.category;
  const colorClass = cardSetClass(card);
  const catLabel = cat === 'Wildcard' ? 'Wildcard' : cat;
  const catDesc = cat === 'Setup' ? 'Use this to arrange an opportunity before taking part.'
    : cat === 'Action' ? 'Use this to complete the experience or task.'
    : cat === 'Proof' ? 'Use this to record what you learned and add evidence to your CV.'
    : cat === 'Impact' ? 'Show the outcome or impact of your experience.'
    : cat === 'Wildcard' && card.set !== 'any' ? `Use this wildcard as a substitute for a missing card type in the ${setName(card.set)} route.`
    : 'Use this as a substitute for a missing set card.';
  const routeDesc = cat !== 'Wildcard' && card.set === 'any' ? 'This card can count as its printed type in any experience route.' : '';

  // Role-fit highlighting: does this card help complete a route the job recommends?
  const jobOptions = jobSetOptions(state.job);
  const flexible = cat !== 'Wildcard' && card.set === 'any';
  const routeId = flexible ? null : card.set;
  const isRoleFit = flexible || (routeId && jobOptions.has(routeId));
  const requiredSkill = state.job.requirements.skill;
  const isKeySkill = cardGrantsAny(card, (s) => s === requiredSkill) && !(state.player.skills || []).includes(requiredSkill);
  const doneTypes = completedJobSetTypes(state.player, state.job);
  const neededTypes = Math.max(0, REQUIRED_SET_VARIETY - doneTypes.size);
  let roleFitHtml = '';
  if (isKeySkill) {
    roleFitHtml = `<p class="preview-rolefit key"><b>★ This card grants the skill you need: ${escapeHtml(requiredSkill)}</b> Bank it in any set that accepts a ${escapeHtml(card.category)} card.</p>`;
  } else if (isRoleFit) {
    if (flexible) {
      const useful = [...jobOptions].filter((id) => !doneTypes.has(id));
      roleFitHtml = useful.length
        ? `<p class="preview-rolefit fit"><b>Counts toward a role-fit route</b> — usable for ${useful.map((id) => escapeHtml(setName(id))).join(' or ')}.</p>`
        : '<p class="preview-rolefit done"><b>Role-fit routes complete</b> — this card adds CV experience but not the required set variety.</p>';
    } else {
      const requiredCats = requiredCategories(routeId);
      const held = new Set(state.player.hand
        .filter((h) => h.uid !== card.uid && (h.set === routeId || h.set === 'any') && h.category !== 'Wildcard')
        .map((h) => h.category));
      const stillNeeded = requiredCats.filter((cat) => !held.has(cat));
      const slotText = stillNeeded.length
        ? `Still needed for ${escapeHtml(setName(routeId))}: ${stillNeeded.map(escapeHtml).join(' + ')}.`
        : `With this card you have all ${requiredCats.length} types for ${escapeHtml(setName(routeId))} — select your cards and bank it.`;
      let varietyNote;
      if (doneTypes.has(routeId)) {
        varietyNote = 'You already banked this route — doing it again adds experience but not new set variety.';
      } else if (neededTypes > 1) {
        const after = neededTypes - 1;
        varietyNote = `New role-fit route — you would still need ${after} more role-fit route${after === 1 ? '' : 's'}.`;
      } else {
        varietyNote = 'New role-fit route — this would complete your role-fit set variety.';
      }
      roleFitHtml = `<p class="preview-rolefit fit"><b>✓ Role-fit route — ${escapeHtml(setName(routeId))}</b> ${escapeHtml(slotText)}<br><span class="rolefit-note">${escapeHtml(varietyNote)}</span></p>`;
    }
  }

  const inHand = where === 'hand';
  const isSelected = inHand && selectedHandUids.has(card.uid);

  let actionHtml = '';
  if (where === 'market') {
    const marketIndex = state.market.findIndex((c) => c.uid === card.uid);
    const canSwap = marketIndex !== -1 && state.player.marketSwapsThisRound < MAX_MARKET_SWAPS_PER_ROUND && !state.winner;
    actionHtml = `
      <button class="btn primary-btn" onclick="takePreviewCard()" ${state.actionsLeft < 1 || state.winner || state.player.hand.length >= HAND_CAP || state.player.marketPicksThisRound >= MAX_MARKET_PICKS_PER_ROUND ? 'disabled' : ''}>Take this card (1 action)</button>
      <button class="btn btn-secondary" onclick="swapPreviewCard()" ${!canSwap ? 'disabled' : ''}>Swap this card</button>
      <button class="btn btn-secondary" onclick="closePreview()">Done</button>
    `;
  } else {
    actionHtml = `
      <button class="btn ${isSelected ? 'btn-secondary' : 'primary-btn'}" onclick="togglePreviewSelect()">${isSelected ? 'Remove from set' : 'Add to set'}</button>
      <button class="btn btn-secondary" onclick="returnPreviewCard()" ${state.winner || state.player.returnsThisRound >= MAX_RETURNS_PER_ROUND ? 'disabled' : ''}>Return to deck</button>
      <button class="btn btn-secondary" onclick="closePreview()">Done</button>
    `;
  }

  el.cardPreview.innerHTML = `
    <div class="card-preview-wrap">
      <button class="preview-close" aria-label="Close card preview" onclick="closePreview()">×</button>
      <div class="card card-preview tone-${cat === 'Wildcard' ? 'wild' : cat.toLowerCase()} ${colorClass}">
        <div class="card-art">${card.art || '🃏'}</div>
        <div class="card-name">${escapeHtml(card.name)}</div>
        <div class="card-description">${escapeHtml(card.description)}</div>
        ${roleFitHtml}
        <div class="preview-meta"><b>${catLabel}</b><br>${catDesc}${routeDesc ? '<br>' + routeDesc : ''}${card.set !== 'any' ? '<br>Opportunity: ' + escapeHtml(setName(card.set)) : card.category === 'Wildcard' ? '<br>Opportunity: Any route' : ''}${cardSkills(card).length ? '<br><span class="skill-badge">' + escapeHtml(cardSkills(card).join(' \u00b7 ')) + '</span>' : ''}</div>
        <div class="card-top">
          <span class="${card.set === 'any' ? 'any-route' : ''}">${escapeHtml(card.set === 'any' ? 'Any route' : setName(card.set) || '—')}</span>
          <span>${cat === 'Wildcard' ? '★' : cat === 'Proof' ? '◆' : cat === 'Action' ? '●' : '◇'}</span>
        </div>
        <div class="preview-actions">${actionHtml}</div>
      </div>
    </div>
  `;
  el.cardPreview.classList.add('open');
}

function closePreview() {
  if (!el.cardPreview) return;
  el.cardPreview.classList.remove('open');
  previewState = null;
}

function takePreviewCard() {
  if (!previewState || previewState.where !== 'market' || state.actionsLeft <= 0 || state.winner) return;
  if (state.player.marketPicksThisRound >= MAX_MARKET_PICKS_PER_ROUND) {
    toast(`You can take up to ${MAX_MARKET_PICKS_PER_ROUND} community cards per round.`);
    return;
  }
  const uid = previewState.card.uid;
  const idx = state.market.findIndex((c) => c.uid === uid);
  if (idx === -1) return;
  const [card] = state.market.splice(idx, 1);
  if (state.player.hand.length >= HAND_CAP) {
    toast('Your hand is full — discard something first.');
    state.market.splice(idx, 0, card);
    closePreview();
    return;
  }
  state.player.hand.push(card);
  state.player.marketPicksThisRound += 1;
  refillMarket();
  spendActions(1);
  addLog(`You took ${card.name} from the market.`);
  closePreview();
  afterPlayerAction();
}

function swapPreviewCard() {
  if (!previewState || previewState.where !== 'market' || state.winner) return;
  if (state.player.marketSwapsThisRound >= MAX_MARKET_SWAPS_PER_ROUND) {
    toast(`You can swap ${MAX_MARKET_SWAPS_PER_ROUND} market cards per round.`);
    return;
  }
  const uid = previewState.card.uid;
  const marketIndex = state.market.findIndex((c) => c.uid === uid);
  if (marketIndex === -1) return;
  swapMarketCard(marketIndex, state.player);
  state.player.marketSwapsThisRound += 1;
  renderMarket();
  renderControls();
  persist();
  closePreview();
}

function togglePreviewSelect() {
  if (!previewState || previewState.where !== 'hand') return;
  const uid = previewState.card.uid;
  const existing = state.player.hand.filter((card) => selectedHandUids.has(card.uid));
  const nextCard = state.player.hand.find((card) => card.uid === uid);
  const route = selectedRoute(existing);
  const limit = route ? requiredCategories(route).length : Math.max(...DATA.sets.map((set) => requiredCategories(set.id).length));
  if (!selectedHandUids.has(uid) && existing.length >= limit) return toast(`This route uses exactly ${limit} cards. Remove one selected card before adding another.`);
  if (!selectedHandUids.has(uid) && nextCard.category !== 'Wildcard' && existing.some((card) => card.category === nextCard.category)) return toast('Choose different card types for a set; duplicate types cannot be used.');
  if (selectedHandUids.has(uid)) selectedHandUids.delete(uid);
  else selectedHandUids.add(uid);
  renderHand();
  renderControls();
}

function returnPreviewCard() {
  if (!previewState || previewState.where !== 'hand') return;
  returnCardsToDeck([previewState.card.uid]);
}

function renderMarket() {
  el.market.innerHTML = '';
  state.market.forEach((c) => {
    const card = cardEl(c, {
      onClick: () => openPreview('market', c),
      dragSource: 'market',
    });
    el.market.appendChild(card);
  });
}

function renderHand() {
  el.hand.innerHTML = '';
  state.player.hand.forEach((c) => {
    const card = cardEl(c, {
      selected: selectedHandUids.has(c.uid),
      onClick: () => toggleHandSelect(c.uid),
      dragSource: 'hand',
    });
    card.addEventListener('dblclick', () => openPreview('hand', c));
    el.hand.appendChild(card);
  });
  el.handCount.textContent = `${state.player.hand.length}/${HAND_CAP} cards · returned ${state.player.returnsThisRound}/${MAX_RETURNS_PER_ROUND} · picked ${state.player.marketPicksThisRound}/${MAX_MARKET_PICKS_PER_ROUND} this round`;
}

function renderSets() {
  el.sets.innerHTML = '';
  DATA.sets.forEach((s) => {
    const count = state.player.banked.filter((b) => b.set === s.id).length;
    const required = requiredCategories(s.id);
    const row = document.createElement('div');
    row.className = `set-row set-${s.id}`;
    row.title = `${required.length} cards: ${required.join(' + ')}. ${s.why}`;
    row.innerHTML = `<span class="set-art">${s.art}</span><span class="set-name">${escapeHtml(s.name)}<small class="set-recipe">${required.length} cards · ${escapeHtml(required.join(' + '))}</small></span><span class="set-count">${count}</span>`;
    el.sets.appendChild(row);
  });
}

function renderBankedSets() {
  if (!el.bankedSets) return;
  const banked = state.player.banked;
  const variety = completedJobSetTypes(state.player, state.job).size;
  if (el.bankedSetProgress) el.bankedSetProgress.textContent = `${variety} / ${REQUIRED_SET_VARIETY} role-fit types`;
  if (!banked.length) {
    el.bankedSets.innerHTML = '<div class="storage-empty">Your completed sets will appear here.</div>';
    return;
  }
  el.bankedSets.innerHTML = banked.map((entry) => {
    const meta = setMeta(entry.set);
    const color = cardSetClass({ set: entry.set, category: 'Setup' });
    const repeat = banked.filter((other) => other.set === entry.set).length;
    return `<div class="banked-set-tile ${color}"><span class="banked-set-art">${meta ? meta.art : '🎮'}</span><div><strong>${escapeHtml(meta ? meta.name : entry.set)}</strong><small>Round ${entry.round} · CV experience${entry.strong ? '' : ' · basic'}</small></div>${repeat > 1 ? '<span class="banked-set-repeat">×' + repeat + '</span>' : ''}</div>`;
  }).join('');
}

function renderCV() {
  const p = state.player;
  el.cvStats.innerHTML = `
    <div class="cv-row"><span>Experience</span><strong>${p.banked.length}</strong></div>
    <div class="cv-row"><span>Evidence</span><strong>${p.evidence}</strong></div>
    <div class="cv-row"><span>Skills</span><strong>${p.skills.length}</strong></div>
    <div class="cv-row"><span>Reliability</span><strong>${'★'.repeat(p.reliability) || '—'}</strong></div>
    <div class="cv-row"><span>References</span><strong>${p.references}</strong></div>
  `;
}

function renderControls() {
  const returnCount = selectedHandUids.size;
  const returnsLeft = MAX_RETURNS_PER_ROUND - state.player.returnsThisRound;
  el.returnBtn.disabled = !returnCount || returnCount > returnsLeft || !!state.winner;
  el.returnBtn.textContent = returnCount
    ? `↩ Return ${returnCount} to deck`
    : `↩ Return selected to deck (${returnsLeft} left this round)`;
   el.returnBtn.title = 'Select up to two cards in your hand and return them to the deck, or drag one to the return area. Returns are free, up to two each round.';
  const swapsLeft = MAX_MARKET_SWAPS_PER_ROUND - state.player.marketSwapsThisRound;
  el.swapMarketBtn.textContent = `↻ Swaps left: ${swapsLeft}/${MAX_MARKET_SWAPS_PER_ROUND}`;
  el.swapMarketBtn.title = 'Swap market cards by clicking a card in the market and using "Swap this card" in the preview. Free, up to 2 per round.';
  el.swapMarketBtn.disabled = true;
  el.swapMarketBtn.style.cursor = 'default';
  el.swapMarketBtn.style.opacity = '0.7';
  const selectedCards = state.player.hand.filter((card) => selectedHandUids.has(card.uid));
  const route = selectedRoute(selectedCards);
  const requiredCount = route ? requiredCategories(route).length : 0;
  // The count must match AND the cards must actually be a valid set for that route,
  // otherwise the button is clickable but doBank() can only report a failure.
  const countMatches = !!requiredCount && selectedHandUids.size === requiredCount;
  const bankResult = countMatches ? findBank(selectedCards) : { ok: false };
  const canBank = countMatches && bankResult.ok && state.actionsLeft >= 1 && !state.winner;
  el.bankBtn.disabled = !canBank;
  el.bankBtn.textContent = route
    ? `✦ Bank ${setName(route)} (${selectedHandUids.size}/${requiredCount})`
    : `✦ Bank completed set (${selectedHandUids.size} selected)`;

  // Highlight bank button when a valid set is ready to bank
  el.bankBtn.classList.toggle('ready-to-bank', canBank);

  renderSetBuilderStatus();
  el.applyBtn.disabled = !!state.winner;
  el.endBtn.disabled = !!state.winner;
}

function renderSetBuilderStatus() {
  if (!el.setBuilderStatus || !state) return;
  const cards = state.player.hand.filter((card) => selectedHandUids.has(card.uid));
  const count = cards.length;
  if (!count) {
    el.setBuilderStatus.innerHTML = `<strong>Build an experience set</strong><span>Each route has several card examples. Click hand cards to select them — choose only one of each required type: Employer Visit needs 2 cards; Volunteering and Live Project Brief need 3; Block Placement and Industry Partnership need 4. Cards marked Any route fit any colour route. Wildcards belong to one route — check the card's opportunity before using it. Double-click any card to preview its details.</span>`;
    return;
  }
  const selectedRoutes = new Set(cards.filter((card) => card.category !== 'Wildcard' && card.set !== 'any').map((card) => card.set));
  const routeId = selectedRoute(cards);
  const required = routeId ? requiredCategories(routeId) : [];
  if (routeId && count === required.length) {
    const result = findBank(cards);
    if (result.ok && state.actionsLeft < 1) {
      el.setBuilderStatus.innerHTML = `<strong>Set complete: ${escapeHtml(setName(result.targetSet))}</strong><span>You're out of actions this round, so <b>Bank completed set</b> is disabled. Press <b>End turn</b> — your selection is kept, and you can bank it as soon as your next turn starts.</span>`;
    } else if (result.ok) {
      el.setBuilderStatus.innerHTML = `<strong>✓ Ready to bank: ${escapeHtml(setName(result.targetSet))}</strong><span>Press <b>Bank completed set</b> to store this experience on your CV. You’ll gain evidence and a skill too.</span>`;
    } else {
      el.setBuilderStatus.innerHTML = `<strong>Not a complete set yet</strong><span>${escapeHtml(result.msg)} Remove a selected card or choose the missing type from the same route.</span>`;
    }
    return;
  }
  const max = routeId ? required.length : Math.max(...DATA.sets.map((set) => requiredCategories(set.id).length));
  if (routeId && count > required.length) {
    el.setBuilderStatus.innerHTML = `<strong>Too many cards for ${escapeHtml(setName(routeId))}</strong><span>This route uses exactly ${required.length} cards. Remove ${count - required.length} card(s) from the selection.</span>`;
    return;
  }
  if (selectedRoutes.size > 1) {
    el.setBuilderStatus.innerHTML = `<strong>Cards from different routes</strong><span>Choose cards with the same route colour. Wildcards can be used with one route.</span>`;
    return;
  }
  const routeText = routeId ? ` · ${escapeHtml(setName(routeId))} route` : '';
  const specific = new Set(cards.filter((card) => card.category !== 'Wildcard').map((card) => card.category));
  const wildcards = cards.filter((card) => card.category === 'Wildcard').length;
  const targetCategories = routeId ? required : CATS;
  const remainingSlots = targetCategories.filter((cat) => !specific.has(cat)).slice(wildcards);
  const next = remainingSlots.length ? ` Next choose: ${remainingSlots.join(', ')}.` : ' Select another unique card type.';
  const routeSizeText = routeId ? `${required.length}` : `up to ${max}`;
  el.setBuilderStatus.innerHTML = `<strong>${count}/${routeSizeText} cards selected${routeText}</strong><span>${escapeHtml(next)} Use different card types from the same route; wildcards substitute for missing types.</span>`;
}

function renderLog() {
  el.log.innerHTML = state.log.map((l) => `<div class="log-line">${escapeHtml(l)}</div>`).join('');
}

function showGuide(text) {
  el.guide.textContent = text;
}

/* ============================== Learn / how-to-play ======================= */

const LEARN_STEPS = [
  { title: 'Pick a target job', body: 'Choose the gaming-industry role you want. Each role needs a set number of completed experiences, evidence, and one specific skill.' },
  { title: 'Take or return cards', body: 'Each round you may take up to 2 cards from the market and return up to 2 cards from your hand to the deck. Returns are free; taking each market card costs 1 action. You can also swap up to 2 market cards at the start of your turn by clicking the Swap button — put back unwanted market cards and draw fresh ones. Click hand cards to select them for banking (selected cards get a border highlight). Double-click a card to preview it. You can also drag market cards into your hand and drag hand cards to the market or return area.' },
  { title: 'Bank a set', body: 'Each colour route needs a different group: Employer Visit needs Setup + Action (2 cards); Volunteering and Live Project Brief need Setup + Action + Proof (3); Block Placement and Industry Partnership need Setup + Action + Proof + Impact (4). You will see several examples for each type. Choose only one card per required type and bank it for CV experience, evidence and a skill. Any route cards work in every route; wildcards replace a missing type.' },
  { title: 'Watch your rivals', body: 'Three AI candidates take two actions each after your turn, each with a different strategy. Keep an eye on their progress bars in the rivals panel.' },
  { title: 'Apply for the job', body: "Once your CV meets the job's requirements, press Apply. The first eligible candidate — you or a rival — wins the race." },
];
let learnIndex = 0;
let learnReturnTo = 'setup';

function renderLearn() {
  const step = LEARN_STEPS[learnIndex];
  el.learnStepNum.textContent = String(learnIndex + 1);
  el.learnContent.innerHTML = `<h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.body)}</p>`;
  el.learnPrevBtn.disabled = learnIndex === 0;
  el.learnNextBtn.textContent = learnIndex === LEARN_STEPS.length - 1 ? 'Got it →' : 'Next';
}

function openLearn(returnTo) {
  learnReturnTo = returnTo;
  learnIndex = 0;
  el.setup.classList.add('hidden');
  el.game.classList.add('hidden');
  el.learnScreen.classList.remove('hidden');
  renderLearn();
}

app.openLearn = openLearn;
app.toast = toast;
app.showGuide = showGuide;
app.state = Object.assign(app.state || {}, { round: 0, actionsLeft: 0 });

el.learnPrevBtn.addEventListener('click', () => { if (learnIndex > 0) { learnIndex--; renderLearn(); } });
el.learnNextBtn.addEventListener('click', () => {
  if (learnIndex < LEARN_STEPS.length - 1) { learnIndex++; renderLearn(); return; }
  el.learnScreen.classList.add('hidden');
  if (learnReturnTo === 'game' && state) el.game.classList.remove('hidden');
  else el.setup.classList.remove('hidden');
});

function setupDragAndDrop() {
  function attach(zone, acceptedSource, onDrop) {
    if (!zone) return;
    zone.addEventListener('dragover', (event) => {
      event.preventDefault();
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
      zone.classList.add('drag-over');
    });
    zone.addEventListener('dragleave', (event) => {
      if (!zone.contains(event.relatedTarget)) zone.classList.remove('drag-over');
    });
    zone.addEventListener('drop', (event) => {
      event.preventDefault();
      zone.classList.remove('drag-over');
      let payload;
      try { payload = JSON.parse(event.dataTransfer.getData('text/plain')); } catch (_) { return; }
      if (!payload || payload.source !== acceptedSource || !payload.uid) return;
      onDrop(payload.uid);
    });
  }
  attach(el.hand, 'market', onMarketCardClick);
  attach(el.returnZone, 'hand', (uid) => returnCardsToDeck([uid]));
  attach(el.market, 'hand', (uid) => returnCardsToDeck([uid]));
}

/* ============================== Wiring ==================================== */

el.startBtn.addEventListener('click', () => newGame(el.jobSelect.value));
el.backToIndustryBtn.addEventListener('click', () => {
  el.setup.classList.add('hidden');
  el.industrySelect.classList.remove('hidden');
});
el.returnBtn.addEventListener('click', doReturnSelected);
  setupDragAndDrop();
el.bankBtn.addEventListener('click', doBank);
el.applyBtn.addEventListener('click', doApply);
el.endBtn.addEventListener('click', endTurn);

if (el.signInBtn) {
  el.signInBtn.addEventListener('click', () => toast('Sign-in requires a Firebase project. Your progress saves locally in this browser.'));
}

/* ============================== Boot ======================================= */

(async function boot() {
  renderIndustryGrid();
  el.industrySelect.classList.remove('hidden');
  renderCompletedRoles();
  if (el.hofBackBtn) el.hofBackBtn.addEventListener('click', closeHallOfFame);
  if (el.hofClearBtn) el.hofClearBtn.addEventListener('click', () => {
    if (confirm('Clear all completed role history? This cannot be undone.')) {
      if (window.RTTR) window.RTTR.clearHistory();
      renderCompletedRoles();
      if (el.hofList) el.hofList.innerHTML = '<div class="hof-empty">No roles completed yet.</div>';
    }
  });

  setupResumeButton();
})();
