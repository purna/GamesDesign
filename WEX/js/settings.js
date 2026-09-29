/**
 * settings.js — Theme toggling, settings modal, reset confirmation,
 * and help button wiring for Race to the Role.
 */
(function () {
  'use strict';

  /* ---------- Theme ---------- */
  app.initTheme = function () {
    const saved = localStorage.getItem('gameTheme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    app.applyTheme(theme);
  };

  app.applyTheme = function (theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (app.el.themeToggle) {
      app.el.themeToggle.innerHTML = theme === 'dark'
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';
    }
    localStorage.setItem('gameTheme', theme);
  };

  if (app.el.themeToggle) {
    app.el.themeToggle.addEventListener('click', function () {
      const current = document.documentElement.getAttribute('data-theme');
      app.applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  /* ---------- Settings modal ---------- */
  function getSettings() {
    return {
      sound: app.el.soundEnabled ? !app.el.soundEnabled.checked : true,
      animations: app.el.animationsEnabled ? !app.el.animationsEnabled.checked : false,
      autoDraw: app.el.autoDrawEnabled ? !app.el.autoDrawEnabled.checked : true,
      // Not inverted: these boxes are ticked when the feature is switched on.
      tutorial: app.el.tutorialEnabled ? app.el.tutorialEnabled.checked : true,
      // Stacking is opt-in: off by default.
      stacking: app.el.stackingEnabled ? app.el.stackingEnabled.checked : false,
    };
  }

  function saveSettings(settings) {
    if (window.RTTR) window.RTTR.saveSettings(settings);
  }

  app.initSettings = function () {
    const settings = window.RTTR ? window.RTTR.getSettings() : { sound: true, animations: true, autoDraw: true };
    if (app.el.soundEnabled) app.el.soundEnabled.checked = !settings.sound;
    if (app.el.animationsEnabled) app.el.animationsEnabled.checked = !settings.animations;
    if (app.el.autoDrawEnabled) app.el.autoDrawEnabled.checked = !settings.autoDraw;
    if (app.el.tutorialEnabled) app.el.tutorialEnabled.checked = settings.tutorial !== false;
    if (app.el.stackingEnabled) app.el.stackingEnabled.checked = settings.stacking === true;
    app.state.tutorialEnabled = settings.tutorial !== false;
    app.state.stackingEnabled = settings.stacking === true;
    applyCardStacking();
    app.state.soundEnabled = settings.sound;
    app.state.animationsEnabled = settings.animations;
    app.state.autoDrawEnabled = settings.autoDraw;
  };

  function openSettings() {
    if (app.el.settingsModal) app.el.settingsModal.classList.remove('hidden');
  }

  function closeSettings() {
    if (app.el.settingsModal) app.el.settingsModal.classList.add('hidden');
  }

  if (app.el.stackingEnabled) {
    app.el.stackingEnabled.addEventListener('change', function () {
      app.state.stackingEnabled = app.el.stackingEnabled.checked;
      if (typeof app.applyCardStacking === 'function') app.applyCardStacking();
    });
  }
  if (app.el.settingsBtn) app.el.settingsBtn.addEventListener('click', openSettings);
  if (app.el.closeSettings) app.el.closeSettings.addEventListener('click', closeSettings);
  if (app.el.cancelSettings) app.el.cancelSettings.addEventListener('click', closeSettings);
  if (app.el.settingsModal) {
    app.el.settingsModal.addEventListener('click', function (e) {
      if (e.target === app.el.settingsModal) closeSettings();
    });
  }

  if (app.el.saveSettings) {
    app.el.saveSettings.addEventListener('click', function () {
      const settings = getSettings();
      saveSettings(settings);
      app.state.soundEnabled = settings.sound;
      app.state.animationsEnabled = settings.animations;
      app.state.autoDrawEnabled = settings.autoDraw;
      app.state.stackingEnabled = settings.stacking;
      if (typeof app.applyCardStacking === 'function') app.applyCardStacking();
      closeSettings();
    });
  }

  /* ---------- Reset ---------- */
  const resetConfirmModal = document.getElementById('resetConfirmModal');
  const confirmReset = document.getElementById('confirmReset');
  const cancelReset = document.getElementById('cancelReset');
  const closeResetConfirm = document.getElementById('closeResetConfirm');

  if (app.el.resetSettings) {
    app.el.resetSettings.addEventListener('click', function () {
      if (resetConfirmModal) resetConfirmModal.classList.remove('hidden');
    });
  }

  function doReset() {
    if (window.RTTR) window.RTTR.resetAll();
    localStorage.removeItem('gameTheme');
    if (resetConfirmModal) resetConfirmModal.classList.add('hidden');
    closeSettings();
    window.location.reload();
  }

  if (confirmReset) confirmReset.addEventListener('click', doReset);
  if (cancelReset) cancelReset.addEventListener('click', function () {
    if (resetConfirmModal) resetConfirmModal.classList.add('hidden');
  });
  if (closeResetConfirm) closeResetConfirm.addEventListener('click', function () {
    if (resetConfirmModal) resetConfirmModal.classList.add('hidden');
  });
  if (resetConfirmModal) {
    resetConfirmModal.addEventListener('click', function (e) {
      if (e.target === resetConfirmModal) resetConfirmModal.classList.add('hidden');
    });
  }

  /* ---------- Help / Learn ---------- */
  function openHelp() {
    if (window.app.openLearn) window.app.openLearn(window.app.state && window.app.state.job ? 'game' : 'setup');
    else if (app.el.learnScreen) {
      app.el.setup.classList.add('hidden');
      app.el.game.classList.add('hidden');
      app.el.learnScreen.classList.remove('hidden');
    }
  }

  if (app.el.helpBtn) app.el.helpBtn.addEventListener('click', openHelp);

  /* ---------- Sign in (placeholder) ---------- */
  if (app.el.signInBtn) {
    app.el.signInBtn.addEventListener('click', function () {
      if (window.app && window.app.toast) window.app.toast('Sign-in requires a Firebase project. Your progress saves locally in this browser.');
    });
  }

  /* ---------- Init ---------- */
  app.initTheme();
  app.initSettings();
})();
