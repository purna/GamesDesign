(function () {
  function init() {
    const params = new URLSearchParams(location.search);
    const forceOff = params.get('timer') === 'off';
    const config = window.GAME_CONFIG || {};
    const seconds = config.timerSeconds || 75;
    if (config.timer === false || forceOff) {
      window.GAME_TIMER = { disabled: true };
      return;
    }
    window.GAME_TIMER = { seconds, disabled: false };

    const STYLE = `
      .gtimer { position: fixed; top: 10px; right: 10px; z-index: 800;
        font-family: 'Comic Neue', Arial, sans-serif; font-size: 1rem; font-weight: 800;
        background: #fff; color: var(--ink, #3a2410);
        border: 3px solid var(--ink, #3a2410); border-radius: 12px;
        padding: 6px 12px; display: inline-flex; align-items: center; gap: 6px;
        box-shadow: 0 3px 0 rgba(58,36,16,.18);
        transition: color .2s, background .2s, border-color .2s, transform .2s; }
      .gtimer.warn { color: #a85b00; background: #fff0c4; border-color: #a85b00; }
      .gtimer.bad { color: #fff; background: var(--bad, #c62828); border-color: var(--bad, #c62828);
        animation: gtimerPulse .55s ease-in-out infinite; }
      @keyframes gtimerPulse { 50% { transform: scale(1.08); } }
      .gtimer .icon { display: inline-block; width: 18px; height: 18px; }
      .gtimer .icon svg { width: 100%; height: 100%; display: block; }
    `;
    const styleEl = document.createElement('style');
    styleEl.textContent = STYLE;
    document.head.appendChild(styleEl);

    const totalMs = seconds * 1000;
    const start = performance.now();
    const el = document.createElement('div');
    el.className = 'gtimer';
    el.setAttribute('role', 'timer');
    el.setAttribute('aria-live', 'polite');
    el.innerHTML = '<span class="icon" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="17" r="10" fill="#fff" stroke="#3a2410" stroke-width="3"/><path d="M16 17V9" stroke="#3a2410" stroke-width="3" stroke-linecap="round"/><path d="M11 4h10" stroke="#3a2410" stroke-width="3" stroke-linecap="round"/><path d="M19 4l2 3M13 4l-2 3" stroke="#3a2410" stroke-width="2" stroke-linecap="round"/></svg></span><span class="gt-secs">0:00</span>';
    document.body.appendChild(el);
    const secsEl = el.querySelector('.gt-secs');

    function fmt(remainingMs) {
      const s = Math.max(0, Math.ceil(remainingMs / 1000));
      const m = Math.floor(s / 60);
      const r = s % 60;
      return m + ':' + String(r).padStart(2, '0');
    }

    let ended = false;
    function tick(now) {
      if (ended) return;
      const elapsed = now - start;
      const remaining = totalMs - elapsed;
      secsEl.textContent = fmt(remaining);
      el.classList.toggle('warn', remaining <= totalMs * 0.4 && remaining > totalMs * 0.2);
      el.classList.toggle('bad', remaining <= totalMs * 0.2);
      if (remaining <= 0) {
        ended = true;
        window.dispatchEvent(new CustomEvent('game-timeout'));
        return;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);

    function endTimer() { ended = true; if (el && el.parentNode) el.parentNode.removeChild(el); }
    window.addEventListener('game-complete', endTimer);
    window.addEventListener('game-over', endTimer);
  }
  if (document.body) init();
  else document.addEventListener('DOMContentLoaded', init);
})();
