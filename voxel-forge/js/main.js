/**
 * main.js
 * The only file that touches the DOM. Everything else (blockchain.js,
 * mining.js, marketplace.js, network.js, auth.js, voxelRenderer.js) is
 * DOM-free logic that this file calls into and renders the result of.
 */
import { ITEMS, RARITIES, itemById, rarityOf } from './config.js';
import { state, myInventoryCounts } from './state.js';
import { Chain, shortHash } from './blockchain.js';
import { VoxelStage, getThumbnail } from './voxelRenderer.js';
import { pickWeightedItem, MiningSession } from './mining.js';
import * as auth from './auth.js';
import * as net from './network.js';
import * as market from './marketplace.js';

// ---------------------------------------------------------------- elements
const $ = id => document.getElementById(id);
const els = {
  login: $('login-screen'), app: $('app'),
  guestName: $('guest-name'), loginError: $('login-error'),
  userAvatar: $('user-avatar'), userName: $('user-name'),
  classroomCode: $('classroom-code'), peerStatus: $('peer-status'),
  miningCanvas: $('mining-canvas'), stageRarityBadge: $('stage-rarity-badge'),
  stageItemName: $('stage-item-name'), stageClicks: $('stage-clicks'),
  stageProgress: $('stage-progress'), minedFlash: $('mined-flash'),
  itemPicker: $('item-picker'),
  statMined: $('stat-mined'), statTraded: $('stat-traded'), statBlocks: $('stat-blocks'),
  inventoryGrid: $('inventory-grid'), inventoryEmpty: $('inventory-empty'),
  marketDisconnected: $('marketplace-disconnected'), marketConnected: $('marketplace-connected'),
  listingGrid: $('listing-grid'), incomingOffers: $('incoming-offers'), peersList: $('peers-list'),
  ledgerList: $('ledger-list'), verifyResult: $('verify-result'),
  itemModal: $('item-modal'), modalCanvas: $('modal-canvas'), modalItemName: $('modal-item-name'),
  modalItemRarity: $('modal-item-rarity'), modalItemCount: $('modal-item-count'),
  tradeModal: $('trade-modal'), tradeGive: $('trade-give'), tradeWant: $('trade-want'),
  howModal: $('how-modal')
};

let miningStage = null;
let modalStage = null;
let session = null;
let tradeContext = null; // { peerId, peerName }

// -------------------------------------------------------------------- init
async function boot() {
  populateItemPicker();
  wireLogin();
  wireApp();

  const restored = await auth.tryRestoreSession().catch(() => null);
  if (restored) await enterApp(restored);
}

function populateItemPicker() {
  els.itemPicker.innerHTML = `<option value="">Random block\u2026</option>` +
    ITEMS.map(item => `<option value="${item.id}">${item.name} \u2014 ${rarityOf(item).label}</option>`).join('');
}

// ------------------------------------------------------------------ login
function wireLogin() {
  $('btn-google').addEventListener('click', () => doLogin(auth.signInWithGoogle));
  $('btn-github').addEventListener('click', () => doLogin(auth.signInWithGithub));
  $('btn-guest').addEventListener('click', () => {
    const name = els.guestName.value.trim();
    if (!name) { showLoginError('Type a name first.'); return; }
    const profile = auth.continueAsGuest();
    doLogin(async () => auth.renameCurrentProfile(profile, name));
  });
}

async function doLogin(action) {
  showLoginError('');
  try {
    const profile = await action();
    await enterApp(profile);
  } catch (err) {
    showLoginError(err.message || 'Sign-in failed.');
  }
}

function showLoginError(msg) {
  els.loginError.textContent = msg;
  els.loginError.classList.toggle('hidden', !msg);
}

// -------------------------------------------------------------- app enter
async function enterApp(profile) {
  state.user = profile;
  state.chain = await new Chain(profile.id, profile.name).init();

  els.login.classList.add('hidden');
  els.app.classList.remove('hidden');
  renderUserChip();

  miningStage = new VoxelStage(els.miningCanvas, { size: 480, spin: true });
  miningStage.start();
  modalStage = new VoxelStage(els.modalCanvas, { size: 360, spin: true });

  startNewSession(pickWeightedItem());
  refreshAll();
}

function renderUserChip() {
  els.userName.textContent = state.user.name;
  if (state.user.photoURL) {
    els.userAvatar.innerHTML = `<img src="${state.user.photoURL}" class="w-full h-full object-cover" alt="">`;
  } else {
    els.userAvatar.textContent = state.user.name.slice(0, 2).toUpperCase();
  }
}

// ----------------------------------------------------------------- mining
function startNewSession(item) {
  session = new MiningSession(item.id);
  miningStage.showItem(item);
  const rarity = rarityOf(item);
  els.stageItemName.textContent = item.name;
  els.stageRarityBadge.textContent = rarity.label;
  els.stageRarityBadge.className = `rarity-badge rarity-${item.rarity}`;
  els.stageClicks.textContent = `0 / ${session.target}`;
  els.stageProgress.style.width = '0%';
  els.miningCanvas.parentElement.style.setProperty('--stage-glow-color', `${rarity.glow}33`);
  els.itemPicker.value = '';
}

async function onStageClick() {
  if (!session) return;
  miningStage.punch();
  const done = session.click();
  els.stageClicks.textContent = `${session.clicks} / ${session.target}`;
  els.stageProgress.style.width = `${Math.round(session.progress * 100)}%`;
  if (done) {
    const minedItem = session.item;
    await state.chain.append('MINE', { itemId: minedItem.id });
    flashMined();
    refreshAll();
    startNewSession(pickWeightedItem());
  }
}

function flashMined() {
  els.minedFlash.classList.remove('flash');
  void els.minedFlash.offsetWidth; // restart animation
  els.minedFlash.classList.add('flash');
}

// ------------------------------------------------------------------- tabs
function wireTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active-tab'));
      btn.classList.add('active-tab');
      document.querySelectorAll('.tab-pane').forEach(p => p.classList.add('hidden'));
      $(`tab-${btn.dataset.tab}`).classList.remove('hidden');
    });
  });
}

// -------------------------------------------------------------- inventory
function renderInventory() {
  const counts = myInventoryCounts();
  const owned = ITEMS.filter(item => counts[item.id] > 0);
  els.inventoryEmpty.classList.toggle('hidden', owned.length > 0);
  els.inventoryGrid.innerHTML = owned.map(item => `
    <div class="item-tile" data-item="${item.id}">
      <img src="${getThumbnail(item)}" alt="${item.name}">
      <div class="mt-1 text-xs font-medium truncate">${item.name}</div>
      <div class="count">\u00d7${counts[item.id]} \u00b7 <span class="rarity-${item.rarity}">${rarityOf(item).label}</span></div>
    </div>`).join('');

  els.inventoryGrid.querySelectorAll('.item-tile').forEach(tile => {
    tile.addEventListener('click', () => openItemModal(itemById(tile.dataset.item), counts[tile.dataset.item]));
  });
}

function openItemModal(item, count) {
  els.itemModal.classList.remove('hidden');
  els.itemModal.classList.add('flex');
  modalStage.showItem(item);
  modalStage.start();
  els.modalItemName.textContent = item.name;
  els.modalItemRarity.textContent = rarityOf(item).label;
  els.modalItemRarity.className = `rarity-badge inline-block mb-3 rarity-${item.rarity}`;
  els.modalItemCount.textContent = `You own \u00d7${count}`;
}

function closeItemModal() {
  els.itemModal.classList.add('hidden');
  els.itemModal.classList.remove('flex');
  modalStage.stop();
}

// ------------------------------------------------------------------ stats
function renderStats() {
  const blocks = state.chain.blocks;
  els.statMined.textContent = blocks.filter(b => b.type === 'MINE').length;
  els.statTraded.textContent = blocks.filter(b => b.type === 'TRADE_IN' || b.type === 'TRADE_OUT').length;
  els.statBlocks.textContent = blocks.length;
}

// ----------------------------------------------------------------- ledger
function renderLedger() {
  const blocks = [...state.chain.blocks].reverse();
  els.ledgerList.innerHTML = blocks.map(b => {
    const item = b.data && b.data.itemId ? itemById(b.data.itemId) : null;
    const label = b.type === 'GENESIS' ? 'Genesis block \u2014 chain start'
      : b.type === 'MINE' ? `Mined ${item ? item.name : '?'}`
      : b.type === 'TRADE_OUT' ? `Sent ${item ? item.name : '?'} to ${b.data.withPeer || 'peer'}`
      : `Received ${item ? item.name : '?'} from ${b.data.withPeer || 'peer'}`;
    return `<div class="ledger-row" data-index="${b.index}">
      <span class="text-slate-500">#${b.index}</span>
      <span class="text-slate-400">${new Date(b.timestamp).toLocaleTimeString()}</span>
      <span class="text-slate-200 truncate">${label} <span class="text-slate-600">\u00b7 prev ${shortHash(b.prevHash)}</span></span>
      <span class="text-teal/80">${shortHash(b.hash)}</span>
    </div>`;
  }).join('');
  els.verifyResult.classList.add('hidden');
}

async function runVerify() {
  const result = await state.chain.validate();
  els.verifyResult.classList.remove('hidden');
  document.querySelectorAll('.ledger-row').forEach(row => row.classList.remove('tampered'));
  if (result.valid) {
    els.verifyResult.className = 'text-xs mb-3 rounded-lg px-3 py-2 bg-teal/10 text-teal border border-teal/30';
    els.verifyResult.textContent = `\u2713 Chain is valid \u2014 all ${state.chain.blocks.length} blocks link up correctly.`;
  } else {
    els.verifyResult.className = 'text-xs mb-3 rounded-lg px-3 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/30';
    els.verifyResult.textContent = `\u2717 Broken at block #${result.brokenAt} \u2014 ${result.reason}.`;
    const rowIndex = state.chain.blocks.length - 1 - result.brokenAt;
    const row = els.ledgerList.children[rowIndex];
    if (row) row.classList.add('tampered');
  }
}

function simulateTamper() {
  const blocks = state.chain.blocks;
  if (blocks.length < 2) return;
  const targetIndex = 1 + Math.floor(Math.random() * (blocks.length - 1));
  const target = blocks[targetIndex];
  if (target.data && target.data.itemId) {
    const otherItems = ITEMS.filter(i => i.id !== target.data.itemId);
    target.data.itemId = otherItems[Math.floor(Math.random() * otherItems.length)].id;
  } else {
    target.data = { ...target.data, tampered: true };
  }
  renderLedger();
  runVerify();
  els.verifyResult.textContent += ' (Not saved \u2014 reload the page to restore your real chain.)';
}

// ------------------------------------------------------------- marketplace
function renderListingGrid() {
  const counts = myInventoryCounts();
  const owned = ITEMS.filter(item => counts[item.id] > 0);
  const selected = new Set(state.myListing || []);
  els.listingGrid.innerHTML = owned.map(item => `
    <div class="item-tile listing-tile ${selected.has(item.id) ? 'selected' : ''}" data-item="${item.id}">
      <img src="${getThumbnail(item)}" alt="${item.name}">
      <div class="count">\u00d7${counts[item.id]}</div>
    </div>`).join('') || `<p class="text-xs text-slate-500 col-span-full">Mine something first, then list it here.</p>`;

  els.listingGrid.querySelectorAll('.listing-tile').forEach(tile => {
    tile.addEventListener('click', () => {
      tile.classList.toggle('selected');
      const chosen = [...els.listingGrid.querySelectorAll('.listing-tile.selected')].map(t => t.dataset.item);
      market.updateListing(chosen);
    });
  });
}

function renderPeers() {
  const ids = Object.keys(state.peers);
  if (!ids.length) {
    els.peersList.innerHTML = `<p class="text-xs text-slate-500">Nobody else is here yet \u2014 share the classroom code.</p>`;
    return;
  }
  els.peersList.innerHTML = ids.map(peerId => {
    const peer = state.peers[peerId];
    const listing = (peer.forSale || []);
    const chips = listing.length
      ? listing.map(id => {
          const item = itemById(id);
          return item ? `<button class="offer-chip text-xs px-2 py-1 rounded-full border border-edge hover:border-gold/70 hover:text-gold transition" data-peer="${peerId}" data-peer-name="${peer.name || 'Classmate'}" data-item="${id}">${item.name}</button>` : '';
        }).join('')
      : `<span class="text-xs text-slate-600">nothing listed</span>`;
    return `<div class="bg-ink border border-edge rounded-lg p-3">
      <div class="text-sm font-medium mb-1.5">${peer.name || 'Classmate'}</div>
      <div class="flex flex-wrap gap-1.5">${chips}</div>
    </div>`;
  }).join('');

  els.peersList.querySelectorAll('.offer-chip').forEach(chip => {
    chip.addEventListener('click', () => openTradeModal(chip.dataset.peer, chip.dataset.peerName, chip.dataset.item));
  });
}

function openTradeModal(peerId, peerName, requestedItemId) {
  const counts = myInventoryCounts();
  const owned = ITEMS.filter(item => counts[item.id] > 0);
  if (!owned.length) { alert('You need at least one item to trade.'); return; }
  tradeContext = { peerId, peerName };
  els.tradeGive.innerHTML = owned.map(i => `<option value="${i.id}">${i.name} (\u00d7${counts[i.id]})</option>`).join('');
  els.tradeWant.innerHTML = `<option value="${requestedItemId}">${itemById(requestedItemId).name}</option>`;
  els.tradeModal.classList.remove('hidden');
  els.tradeModal.classList.add('flex');
}

function closeTradeModal() {
  els.tradeModal.classList.add('hidden');
  els.tradeModal.classList.remove('flex');
  tradeContext = null;
}

function renderIncomingOffers() {
  const offers = Object.values(state.incomingOffers);
  if (!offers.length) {
    els.incomingOffers.innerHTML = `<p class="text-xs text-slate-500">No offers yet.</p>`;
    return;
  }
  els.incomingOffers.innerHTML = offers.map(o => `
    <div class="bg-ink border border-edge rounded-lg p-3 flex items-center justify-between gap-3">
      <div class="text-sm">
        <span class="font-medium">${o.fromName}</span> offers
        <span class="text-gold">${itemById(o.offerItemId)?.name || '?'}</span> for your
        <span class="text-teal">${itemById(o.requestItemId)?.name || '?'}</span>
      </div>
      <div class="flex gap-1.5 shrink-0">
        <button data-accept="${o.offerId}" class="text-xs px-2.5 py-1.5 rounded-lg bg-teal text-ink font-semibold">Accept</button>
        <button data-decline="${o.offerId}" class="text-xs px-2.5 py-1.5 rounded-lg border border-edge">Decline</button>
      </div>
    </div>`).join('');

  els.incomingOffers.querySelectorAll('[data-accept]').forEach(btn => {
    btn.addEventListener('click', async () => {
      try { await market.acceptOffer(btn.dataset.accept); refreshAll(); }
      catch (err) { alert(err.message); renderIncomingOffers(); }
    });
  });
  els.incomingOffers.querySelectorAll('[data-decline]').forEach(btn => {
    btn.addEventListener('click', () => { market.declineOffer(btn.dataset.decline); renderIncomingOffers(); });
  });
}

// -------------------------------------------------------------- refresh
function refreshAll() {
  renderInventory();
  renderStats();
  renderLedger();
  if (state.room) { renderListingGrid(); renderPeers(); }
}

// -------------------------------------------------------------- app wiring
function wireApp() {
  wireTabs();
  els.miningCanvas.addEventListener('click', onStageClick);
  $('btn-reroll').addEventListener('click', () => startNewSession(pickWeightedItem()));
  els.itemPicker.addEventListener('change', () => {
    if (els.itemPicker.value) startNewSession(itemById(els.itemPicker.value));
  });

  $('modal-close').addEventListener('click', closeItemModal);
  $('trade-cancel').addEventListener('click', closeTradeModal);
  $('trade-send').addEventListener('click', () => {
    if (!tradeContext) return;
    try {
      market.proposeTrade(tradeContext.peerId, els.tradeGive.value, els.tradeWant.value, tradeContext.peerName);
      closeTradeModal();
      alert('Offer sent \u2014 waiting for them to respond.');
    } catch (err) { alert(err.message); }
  });

  $('btn-how').addEventListener('click', () => { els.howModal.classList.remove('hidden'); els.howModal.classList.add('flex'); });
  $('how-close').addEventListener('click', () => { els.howModal.classList.add('hidden'); els.howModal.classList.remove('flex'); });

  $('btn-verify').addEventListener('click', runVerify);
  $('btn-tamper-demo').addEventListener('click', simulateTamper);

  $('btn-signout').addEventListener('click', async () => {
    await auth.signOutCurrent();
    net.leaveClassroom();
    location.reload();
  });

  $('btn-join-classroom').addEventListener('click', joinClassroom);
  els.classroomCode.addEventListener('keydown', e => { if (e.key === 'Enter') joinClassroom(); });
}

async function joinClassroom() {
  const code = els.classroomCode.value.trim().toUpperCase();
  if (!code) return;
  els.peerStatus.innerHTML = `<i class="fa-solid fa-circle text-[6px] text-gold animate-pulse"></i> connecting\u2026`;
  try {
    await net.joinClassroom(code, onPeerUpdate, onTradeOffer, onTradeResponse);
    net.broadcastPresence(state.user.name, state.myListing || []);
    els.peerStatus.innerHTML = `<i class="fa-solid fa-circle text-[6px] text-teal"></i> in "${code}"`;
    els.marketDisconnected.classList.add('hidden');
    els.marketConnected.classList.remove('hidden');
    refreshAll();
  } catch (err) {
    els.peerStatus.innerHTML = `<i class="fa-solid fa-circle text-[6px] text-rose-400"></i> connection failed`;
    console.error(err);
  }
}

function onPeerUpdate() {
  els.peerStatus.innerHTML = `<i class="fa-solid fa-circle text-[6px] text-teal"></i> in "${state.classroomCode}" \u00b7 ${Object.keys(state.peers).length} online`;
  renderPeers();
}

function onTradeOffer(offer) {
  market.recordIncomingOffer(offer);
  renderIncomingOffers();
}

async function onTradeResponse(response) {
  const result = await market.handleTradeResponse(response);
  if (!result) return;
  if (result.accepted) {
    refreshAll();
  } else {
    alert(`Trade declined${result.reason ? ` (${result.reason})` : ''}.`);
  }
}

boot();
