/**
 * tutorialSystem.js — the first-run walkthrough engine.
 *
 * Consumes TUTORIAL_CONFIG (tutorialConfig.js). Shows one step at a time as a
 * spotlight: the page dims, the target element is cut out, and a card explains what
 * to do. Navigation is Back / Skip / Next.
 *
 * Design notes:
 * - Steps whose `target` no longer exists are skipped rather than thrown on, because
 *   the game re-renders large parts of the board and an id can legitimately vanish.
 * - Highlight uses a real element positioned over the target rather than a CSS
 *   clip-path, so it works even when the target scrolls or is partially offscreen.
 * - Progress is remembered in localStorage, so it runs once per browser. `reset()`
 *   is exposed for the settings screen.
 */

(function (global) {
  'use strict';

  var config = global.TUTORIAL_CONFIG;
  if (!config) {
    console.warn('tutorialSystem: TUTORIAL_CONFIG missing, tutorial disabled.');
    return;
  }

  var OVERLAY_ID = 'tutorial-overlay';
  var SPOTLIGHT_ID = 'tutorial-spotlight';
  var PANEL_ID = 'tutorial-container';

  var root = null;        // overlay element
  var spotlight = null;
  var panel = null;
  var parts = null;
  var index = 0;
  var steps = [];
  var active = false;
  var finished = false;

  function $(id) { return document.getElementById(id); }

  function build() {
    if (root) return;
    root = document.createElement('div');
    root.id = OVERLAY_ID;
    root.className = 'tutorial-overlay';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.setAttribute('aria-labelledby', 'tutorial-title');
    root.hidden = true;
    root.innerHTML =
      '<div id="tutorial-dim"></div>' +
      '<div id="' + SPOTLIGHT_ID + '" aria-hidden="true" hidden></div>' +
      '<div id="' + PANEL_ID + '" role="document">' +
        '<div class="tutorial-arrow" id="tutorial-arrow" aria-hidden="true"></div>' +
        '<div id="tutorial-header">' +
          '<h2 id="tutorial-heading"></h2>' +
          '<button id="tutorial-close" aria-label="Close tutorial" data-tutorial-skip>&times;</button>' +
        '</div>' +
        '<div id="tutorial-step-count"></div>' +
        '<div id="tutorial-content"></div>' +
        '<div id="tutorial-controls">' +
          '<div id="tutorial-buttons">' +
            '<button class="tutorial-btn secondary" data-tutorial-back>Back</button>' +
            '<button class="tutorial-btn primary" data-tutorial-next>Next</button>' +
          '</div>' +
          '<div id="tutorial-progress-dots" aria-hidden="true"></div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(root);

    spotlight = root.querySelector('#' + SPOTLIGHT_ID);
    panel = root.querySelector('#' + PANEL_ID);
    parts = {
      title: panel.querySelector('#tutorial-heading'),
      body: panel.querySelector('#tutorial-content'),
      step: panel.querySelector('#tutorial-step-count'),
      dots: panel.querySelector('#tutorial-progress-dots'),
      arrow: panel.querySelector('#tutorial-arrow'),
      back: panel.querySelector('[data-tutorial-back]'),
      next: panel.querySelector('[data-tutorial-next]')
    };
    // One dot per step, built once; render() only toggles the active class.
    steps.forEach(function (_, i) {
      var dot = document.createElement('span');
      dot.className = 'tutorial-progress-dot';
      dot.setAttribute('data-step', String(i));
      parts.dots.appendChild(dot);
    });

    root.addEventListener('click', function (e) {
      if (e.target.hasAttribute && e.target.hasAttribute('data-tutorial-skip')) { end(true); return; }
      if (e.target.hasAttribute && e.target.hasAttribute('data-tutorial-back')) { go(-1); return; }
      if (e.target.hasAttribute && e.target.hasAttribute('data-tutorial-next')) { go(1); return; }
    });
    document.addEventListener('keydown', onKey);
    global.addEventListener('resize', place);
  }

  function onKey(e) {
    if (!active) return;
    if (e.key === 'Escape') { e.preventDefault(); end(true); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  }

  function currentStep() {
    return steps[index] || null;
  }

  function targetEl(step) {
    if (!step || !step.target) return null;
    try {
      return document.querySelector(step.target);
    } catch (err) {
      return null;
    }
  }

  function boxOutOfView(el) {
    var b = el.getBoundingClientRect();
    var vh = global.innerHeight || 0;
    var vw = global.innerWidth || 0;
    return b.top < 0 || b.left < 0 || b.bottom > vh || b.right > vw;
  }

  function place() {
    if (!active) return;
    var step = currentStep();
    var el = targetEl(step);
    if (!el) {
      spotlight.hidden = true;
      panel.classList.add('is-centered');
      return;
    }
    spotlight.hidden = false;
    panel.classList.remove('is-centered');

    // A target below the fold would otherwise get an off-screen spotlight.
    if (el.scrollIntoView && boxOutOfView(el)) {
      try { el.scrollIntoView({ block: 'center', behavior: 'auto' }); }
      catch (e) { el.scrollIntoView(); }
    }

    // The overlay is position:fixed, so the spotlight and panel are laid out in
    // viewport coordinates. Adding scrollX/scrollY here would double-count the page
    // scroll and push the panel off screen.
    var pad = 8;
    var box = el.getBoundingClientRect();
    var top = box.top - pad;
    var left = box.left - pad;
    var width = box.width + pad * 2;
    var height = box.height + pad * 2;

    spotlight.style.top = top + 'px';
    spotlight.style.left = left + 'px';
    spotlight.style.width = width + 'px';
    spotlight.style.height = height + 'px';

    // Park the panel near the target, nudged to stay on screen.
    var placement = step.placement || 'bottom';
    var p = panel.getBoundingClientRect();
    var gap = 16;
    var nx = left + width / 2 - p.width / 2;
    var ny;
    if (placement === 'center') {
      ny = (global.innerHeight - p.height) / 2;
    } else if (placement === 'top') {
      ny = top - p.height - gap;
    } else if (placement === 'left') {
      ny = top + height / 2 - p.height / 2;
      nx = left - p.width - gap;
    } else if (placement === 'right') {
      ny = top + height / 2 - p.height / 2;
      nx = left + width + gap;
    } else {
      ny = top + height + gap;
    }
    var vw = global.innerWidth;
    var vh = global.innerHeight;
    var margin = 12;
    panel.style.left = Math.round(Math.max(margin, Math.min(nx, vw - p.width - margin))) + 'px';
    panel.style.top = Math.round(Math.max(margin, Math.min(ny, vh - p.height - margin))) + 'px';
  }

  function placeArrow(step) {
    if (!parts.arrow) return;
    var placement = step.placement || 'bottom';
    if (!step.target || placement === 'center') {
      parts.arrow.className = 'tutorial-arrow';
      parts.arrow.style.display = 'none';
      return;
    }
    // Opposite edge: a panel below the target points up from its top edge.
    var side = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' }[placement] || 'top';
    parts.arrow.className = 'tutorial-arrow ' + side;
    parts.arrow.style.display = '';
  }

  function open() {
    root.classList.add('is-open');
    panel.classList.add('is-open');
  }

  function shut() {
    root.classList.remove('is-open');
    panel.classList.remove('is-open');
  }

  function render() {
    var step = currentStep();
    if (!step) { end(false); return; }
    parts.title.textContent = step.title || '';
    parts.body.innerHTML = String(step.body || '')
      .split('\n')
      .map(function (line) { return line ? '<span>' + escapeHtml(line) + '</span>' : '<span>&nbsp;</span>'; })
      .join('<br>');
    // Several targets now live behind a rail tab. Open it first, or the spotlight
    // would point at a hidden panel and the panel would position against a
    // zero-sized rect.
    if (step.tab && global.Tutorial && typeof global.Tutorial.showRailTab === 'function') {
      global.Tutorial.showRailTab(step.tab);
    }
    parts.step.textContent = 'Step ' + (index + 1) + ' of ' + steps.length;
    var dots = parts.dots.querySelectorAll ? parts.dots.querySelectorAll('.tutorial-progress-dot') : [];
    Array.prototype.forEach.call(dots, function (dot, i) {
      if (i === index) dot.classList.add('active');
      else dot.classList.remove('active');
    });

    var last = index === steps.length - 1;
    if (parts.back) parts.back.disabled = index === 0;
    if (parts.next) parts.next.textContent = last ? 'Start playing' : 'Next';
    // A step that refuses Skip hides the close button too, or it would leak.
    var close = panel.querySelector('#tutorial-close');
    if (close) close.hidden = step.allowSkip === false;
    placeArrow(step);
    place();
  }

  function go(delta) {
    index += delta;
    if (index < 0) index = 0;
    if (index >= steps.length) { end(false); return; }
    render();
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }

  function seen() {
    try {
      return localStorage.getItem(config.storageKey) === String(config.version);
    } catch (e) {
      return false;
    }
  }

  function markSeen() {
    try { localStorage.setItem(config.storageKey, String(config.version)); } catch (e) { /* private mode */ }
  }

  function start(options) {
    var opts = options || {};
    var list = opts.steps || config.steps || [];
    // Drop any step whose target is missing, so a renamed id cannot break the run.
    steps = list.filter(function (s) { return !s.target || targetEl(s); });
    if (!steps.length) return false;
    build();
    index = opts.startAt || 0;
    active = true;
    finished = false;
    open();
    document.documentElement.classList.add('tutorial-open');
    render();
    return true;
  }

  function end(bySkip) {
    if (!active) return;
    active = false;
    finished = true;
    shut();
    document.documentElement.classList.remove('tutorial-open');
    markSeen();
    if (bySkip) {
      try { localStorage.setItem(config.storageKey + '-skipped', '1'); } catch (e) { /* ignore */ }
    }
    if (typeof config.onEnd === 'function') config.onEnd(bySkip);
    if (global.app && typeof global.app.onTutorialEnd === 'function') global.app.onTutorialEnd(bySkip);
  }

  function isActive() { return active; }

  function reset() {
    try {
      localStorage.removeItem(config.storageKey);
      localStorage.removeItem(config.storageKey + '-skipped');
    } catch (e) { /* ignore */ }
  }

  // First-run entry point: starts only if the player has not seen this version AND
  // has not switched the tutorial off in settings. A manual start() still works
  // either way, so the "Play the tutorial" button is unaffected by the toggle.
  function maybeStart() {
    if (seen()) return false;
    if (enabledByPreference() === false) return false;
    return start();
  }

  function enabledByPreference() {
    try {
      var s = JSON.parse(localStorage.getItem('rttr-settings') || '{}');
      return s.tutorial === undefined ? true : !!s.tutorial;
    } catch (e) {
      return true;
    }
  }

  global.Tutorial = {
    // Bound lazily to the game module: these live in game.js, which loads after
    // the config but is present by the time any step renders.
    showRailTab: function (name) {
      if (typeof global.showRailTab === 'function') global.showRailTab(name);
    },
    isRailTabVisible: function (name) {
      if (typeof global.isRailTabVisible === 'function') return global.isRailTabVisible(name);
      return true;
    },
    start: start,
    end: end,
    reset: reset,
    isActive: isActive,
    maybeStart: maybeStart,
    enabledByPreference: enabledByPreference,
    seen: seen,
    config: config
  };

  if (global.app) global.app.tutorial = global.Tutorial;
})(window);
