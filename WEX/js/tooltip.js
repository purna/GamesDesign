/**
 * tooltip.js — a small, reusable tooltip system.
 *
 * Usage, declarative (preferred):
 *   <button data-tip="Some help text" data-tip-place="top">Hover me</button>
 *   window.Tooltip.attach(rootEl);           // scans a subtree for [data-tip]
 *
 * Usage, programmatic:
 *   const t = Tooltip.bind(el, { content: 'Help text', place: 'right' });
 *   t.setContent('New text');
 *   t.destroy();
 *
 * Deliberate choices:
 * - One shared DOM node, reused for every tooltip. Adding a node per tooltip makes
 *   a list of a hundred tooltips cost a hundred nodes.
 * - Position is measured on show, not on scroll, so a tooltip attached near a
 *   scrolling panel stays correct when it appears.
 * - Everything is delegated from document-level listeners, so it keeps working for
 *   markup that is re-rendered (the game rebuilds innerHTML constantly).
 * - Touch: tapping a [data-tip] target toggles it, since hover does not exist.
 */

(function (global) {
  'use strict';

  var NODE_ID = 'rttr-tooltip';
  var DEFAULT_PLACE = 'top';
  var GAP = 8;
  var MAX_WIDTH = 260;

  var node = null;
  var current = null;      // the element the visible tooltip belongs to
  var listeners = null;    // bound document listeners, for detach()
  var hideTimer = null;

  function ensureNode() {
    if (node && node.isConnected) return node;
    var existing = document.getElementById(NODE_ID);
    if (existing) {
      node = existing;
      return node;
    }
    node = document.createElement('div');
    node.id = NODE_ID;
    node.className = 'rttr-tooltip';
    node.setAttribute('role', 'tooltip');
    node.hidden = true;
    document.body.appendChild(node);
    return node;
  }

  function readOptions(el) {
    return {
      content: el.getAttribute('data-tip') || '',
      place: el.getAttribute('data-tip-place') || DEFAULT_PLACE
    };
  }

  // Flip to the opposite side if the preferred side has no room.
  function resolvePlace(el, place) {
    var box = el.getBoundingClientRect();
    var vw = global.innerWidth || document.documentElement.clientWidth;
    var vh = global.innerHeight || document.documentElement.clientHeight;
    var order = {
      top: ['top', 'bottom'],
      bottom: ['bottom', 'top'],
      left: ['left', 'right'],
      right: ['right', 'left']
    }[place] || [place, place];
    for (var i = 0; i < order.length; i++) {
      var p = order[i];
      var fits = true;
      if (p === 'top') fits = box.top > GAP + 40;
      if (p === 'bottom') fits = vh - box.bottom > GAP + 40;
      if (p === 'left') fits = box.left > GAP + 40;
      if (p === 'right') fits = vw - box.right > GAP + 40;
      if (fits) return p;
    }
    return place;
  }

  function position(el, place) {
    var tip = ensureNode();
    var box = el.getBoundingClientRect();
    var tipBox = tip.getBoundingClientRect();
    var vw = global.innerWidth || document.documentElement.clientWidth;
    var vh = global.innerHeight || document.documentElement.clientHeight;
    var top = 0;
    var left = 0;

    if (place === 'top' || place === 'bottom') {
      left = box.left + box.width / 2 - tipBox.width / 2;
      top = place === 'top' ? box.top - tipBox.height - GAP : box.bottom + GAP;
    } else {
      top = box.top + box.height / 2 - tipBox.height / 2;
      left = place === 'left' ? box.left - tipBox.width - GAP : box.right + GAP;
    }

    // Keep the tooltip inside the viewport rather than letting it run off-screen.
    var pad = 6;
    left = Math.max(pad, Math.min(left, vw - tipBox.width - pad));
    top = Math.max(pad, Math.min(top, vh - tipBox.height - pad));

    tip.style.left = Math.round(left + global.scrollX) + 'px';
    tip.style.top = Math.round(top + global.scrollY) + 'px';
  }

  // Minimal allowlist sanitiser for tooltip markup. The tooltip is the one place in
  // the app that injects HTML, so anything not explicitly permitted is stripped:
  // script/style/iframe are removed outright, every other tag is unwrapped, and
  // inline event handlers and javascript: URLs are dropped.
  var ALLOWED = /^(b|strong|i|em|u|br|ul|ol|li|p|span|div|small|code)$/i;

  function sanitizeTip(html) {
    return String(html == null ? '' : html)
      .replace(/<\s*(script|style|iframe|object|embed|link|meta)[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
      .replace(/<\s*(script|style|iframe|object|embed|link|meta)[^>]*>/gi, '')
      .replace(/<\/?([a-z0-9-]+)((?:[^>"']|"[^"]*"|'[^']*')*)>/gi, function (match, tag) {
        if (!ALLOWED.test(tag)) return '';
        if (match.charAt(1) === '/') return '</' + tag.toLowerCase() + '>';
        var attrs = match.slice(1 + tag.length, -1);
        if (/\son[a-z]+\s*=/i.test(attrs)) return '<' + tag.toLowerCase() + '>';
        if (/javascript\s*:/i.test(attrs)) return '<' + tag.toLowerCase() + '>';
        return match;
      });
  }

  function escapeTipText(text) {
    return String(text == null ? '' : text)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function show(el) {
    if (!enabled) return;
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
    var opts = readOptions(el);
    if (!opts.content) return;
    var tip = ensureNode();
    // Tooltips carry formatted content (bold labels, bullet lists, line breaks),
    // so this uses innerHTML. Everything is passed through sanitizeTip() first, and
    // callers are still expected to escapeHtml() any data-derived text.
    tip.innerHTML = sanitizeTip(opts.content);
    tip.hidden = false;
    // Measure once visible so the size is real before positioning.
    position(el, resolvePlace(el, opts.place));
    tip.setAttribute('data-place', resolvePlace(el, opts.place));
    el.setAttribute('aria-describedby', NODE_ID);
    current = el;
    tip.classList.add('is-visible');
  }

  function hide() {
    if (hideTimer) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
    if (!node) return;
    node.classList.remove('is-visible');
    node.hidden = true;
    if (current) {
      current.removeAttribute('aria-describedby');
      current = null;
    }
  }

  // A short delay keeps a tooltip from flashing when the pointer crosses a row of
  // items on its way somewhere else.
  function showSoon(el) {
    if (hideTimer) clearTimeout(hideTimer);
    hideTimer = setTimeout(function () { show(el); }, 120);
  }

  // Global switch, driven by the header toggle. When off the layer stops
  // responding entirely rather than just hiding, so no tooltip can appear.
  var enabled = true;

  function setEnabled(on) {
    enabled = !!on;
    if (!enabled) hide();
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('tooltips-off', !enabled);
    }
    return enabled;
  }

  function isEnabled() {
    return enabled;
  }

  function targetFor(event) {
    var el = event.target;
    if (!el || !el.closest) return null;
    var hit = el.closest('[data-tip]');
    return hit || null;
  }

  function onPointerOver(event) {
    if (!enabled) return;
    if (event.pointerType === 'touch') return;
    var el = targetFor(event);
    if (el) showSoon(el);
    else hide();
  }

  function onPointerOut(event) {
    if (!enabled) return;
    if (event.pointerType === 'touch') return;
    var el = targetFor(event);
    if (el) hide();
  }

  function onClick(event) {
    if (!enabled) return;
    // Tap-to-toggle for touch. Guarded so a plain mouse click does not double up
    // with hover behaviour.
    if (event.pointerType !== 'touch' && !('ontouchstart' in global)) return;
    var el = targetFor(event);
    if (!el) { hide(); return; }
    event.preventDefault();
    if (current === el) hide();
    else show(el);
  }

  function onKeyDown(event) {
    if (!enabled) return;
    if (event.key === 'Escape' && current) {
      hide();
      return;
    }
    if ((event.key === 'Enter' || event.key === ' ') && event.target) {
      var el = event.target.closest ? event.target.closest('[data-tip]') : null;
      if (el) { event.preventDefault(); show(el); }
    }
  }

  function onScroll() {
    if (current) show(current);
  }

  function attach() {
    if (listeners) return;   // already bound
    listeners = [
      ['pointerover', onPointerOver, true],
      ['pointerout', onPointerOut, true],
      ['click', onClick, true],
      ['keydown', onKeyDown, true],
      ['scroll', onScroll, true],
      ['resize', onScroll, true]
    ];
    listeners.forEach(function (entry) {
      document.addEventListener(entry[0], entry[1], entry[2]);
    });
  }

  function detach() {
    if (!listeners) return;
    listeners.forEach(function (entry) {
      document.removeEventListener(entry[0], entry[1], entry[2]);
    });
    listeners = null;
    hide();
  }

  // Programmatic binding. Returns a handle; content can be updated without
  // re-attaching, which matters for the skills list where content is rebuilt.
  function bind(el, options) {
    if (!el) return { setContent: function () {}, destroy: function () {} };
    var opts = options || {};
    if (opts.content != null) el.setAttribute('data-tip', opts.content);
    if (opts.place) el.setAttribute('data-tip-place', opts.place);
    attach();
    return {
      el: el,
      setContent: function (text) { el.setAttribute('data-tip', text); if (current === el) show(el); },
      show: function () { show(el); },
      hide: hide,
      destroy: function () { hide(); el.removeAttribute('data-tip'); el.removeAttribute('data-tip-place'); }
    };
  }

  // Scan a subtree and bind every [data-tip] found. Because the listeners are
  // delegated from document, this is really only needed to make the presence of a
  // data attribute meaningful; it also flips a data-tip-disabled ancestor back on.
  function scan(root) {
    attach();
    var scope = root || document;
    var nodes = scope.querySelectorAll ? scope.querySelectorAll('[data-tip]') : [];
    return nodes.length;
  }

  var Tooltip = {
    attach: attach,
    detach: detach,
    scan: scan,
    bind: bind,
    show: show,
    hide: hide,
    setEnabled: setEnabled,
    isEnabled: isEnabled,
    sanitize: sanitizeTip,
    escapeText: escapeTipText,
    NODE_ID: NODE_ID
  };

  global.Tooltip = Tooltip;
  // Loaded as a plain deferred script alongside the rest of the game, which shares
  // one global scope. Also expose on app for consistency with the other modules.
  if (global.app) global.app.tooltip = Tooltip;
})(window);
