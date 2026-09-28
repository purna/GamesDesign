(function () {
  'use strict';

  window.app = {};

  /* ---------- State ---------- */
  app.state = {
    level: 'l3',
    year: 'y1',
    section: null,
    data: null,
    index: 0,
    answers: {},
    timerEnabled: true,
    timerMinutes: 5,
    timerRemaining: 0,
    timerHandle: null,
    pqTimerEnabled: false,
    pqTimerSeconds: 30,
    pqTimerRemaining: 0,
    pqTimerHandle: null,
    selectedTileValue: null,
    pqLocked: false,
    quizVariant: null,
    score: 0,
    passed: false,
    user: null,
    intakeLevel: null,
    intakeYear: null,
    dataTrack: null,
  };

  /* ---------- Config ---------- */
  app.config = {
    ALLOWED_EMAIL_DOMAINS: ['escg.ac.uk', 'sussexcoast.ac.uk', 'hastings.ac.uk'],
    PASS_THRESHOLD: 80,
    QUIZ_VARIANTS: ['A', 'B', 'C'],
    REQUIRE_EMAIL: false,
    CERT_LOGO_DATAURL: null,
    LEVELS: [
      { id: 'l3', label: 'Level 3', blurb: 'A Level / T-Level — Year 1 & Year 2', years: ['y1', 'y2'] },
      { id: 'l2', label: 'Level 2', blurb: 'BTEC / Vocational — Year 1 & Year 2', years: ['y1', 'y2'] },
      { id: 'l1', label: 'Level 1', blurb: 'Introductory — Year 1', years: ['y1'] },
    ],
    MODULES: [
      { id: 'l3y1-a', level: 'l3', year: 'y1', module: 'A', title: 'Welcome, Belonging & Support',            summary: 'Settling in, study programme, support services, enrichment' },
      { id: 'l3y1-b', level: 'l3', year: 'y1', module: 'B', title: 'Confidence & Attendance',                 summary: 'School to college, the long fuse, attendance case' },
      { id: 'l3y1-c', level: 'l3', year: 'y1', module: 'C', title: 'Health & Safety',                         summary: 'Introduction, basics, subject-specific, noticing and reporting' },
      { id: 'l3y1-d', level: 'l3', year: 'y1', module: 'D', title: "Students' Voice & Student Rep Elections", summary: 'How student voice works, Rep / Governor roles, election' },
      { id: 'l3y1-e', level: 'l3', year: 'y1', module: 'E', title: 'Respect, Relationships & College Values', summary: 'PROUD values, British Values, Equality Act 2010, behaviour standards' },
      { id: 'l3y1-f', level: 'l3', year: 'y1', module: 'F', title: 'Staying Safe at College',                 summary: 'Safeguarding, Prevent, online safety, AI & data, reporting' },
      { id: 'l3y1-g', level: 'l3', year: 'y1', module: 'G', title: 'Looking After Myself (Wellbeing)',        summary: 'Mental health, stress, sleep, money, support, looking out for others' },
      { id: 'l3y1-h', level: 'l3', year: 'y1', module: 'H', title: 'How to Use Navigate',                     summary: 'Skills assessment, next destination, careers, logging, reflection' },
      { id: 'l3y1-i', level: 'l3', year: 'y1', module: 'I', title: 'Professional Behaviour & Personal Strengths', summary: 'Standard, attendance, employability, strengths with evidence' },
      { id: 'l3y1-j', level: 'l3', year: 'y1', module: 'J', title: 'Work Experience',                         summary: 'Why it matters, block vs flexible, dates, finding a placement' },
      { id: 'l3y1-k', level: 'l3', year: 'y1', module: 'K', title: 'Progression Opportunities & Setting Goals', summary: 'Where Level 3 leads, evidence, three horizons, write one goal' },

      { id: 'l3y2-a', level: 'l3', year: 'y2', module: 'A', title: 'Welcome, Belonging & Support',            summary: 'Welcome back — final year, where you are headed' },
      { id: 'l3y2-b', level: 'l3', year: 'y2', module: 'B', title: 'Confidence & Attendance',                 summary: 'Year 1 to Year 2, the final fuse, Year-2 attendance case' },
      { id: 'l3y2-c', level: 'l3', year: 'y2', module: 'C', title: 'Health & Safety',                         summary: 'Year-2 refresher, familiarity is the risk' },
      { id: 'l3y2-d', level: 'l3', year: 'y2', module: 'D', title: "Students' Voice & Student Rep Elections", summary: 'Year-2 view of student voice, leadership roles' },
      { id: 'l3y2-e', level: 'l3', year: 'y2', module: 'E', title: 'Respect, Relationships & College Values', summary: 'Same content, framed as accountability and consistency' },
      { id: 'l3y2-f', level: 'l3', year: 'y2', module: 'F', title: 'Staying Safe at College',                 summary: 'Year-2 risk profile (FMP, placement, UCAS)' },
      { id: 'l3y2-g', level: 'l3', year: 'y2', module: 'G', title: 'Looking After Myself (Wellbeing)',        summary: 'Same — Year 2 asks more of you' },
      { id: 'l3y2-h', level: 'l3', year: 'y2', module: 'H', title: 'How to Use Navigate',                     summary: 'Same — refresh and audit your evidence' },
      { id: 'l3y2-i', level: 'l3', year: 'y2', module: 'I', title: 'Professional Behaviour & Personal Strengths', summary: 'Standard did not reset, references, application-ready' },
      { id: 'l3y2-j', level: 'l3', year: 'y2', module: 'J', title: 'Work Experience',                         summary: 'Second, sharper placement — same process, higher bar' },
      { id: 'l3y2-k', level: 'l3', year: 'y2', module: 'K', title: 'Progression Opportunities & Setting Goals', summary: 'Final year — calendar, deadlines, one dated application goal' },
    ],
  };

  app.modulesForLevelYear = function (level, year) {
    return (app.config.MODULES || []).filter(function (m) {
      return m.level === level && m.year === year;
    });
  };

  app.getModule = function (id) {
    return (app.config.MODULES || []).find(function (m) { return m.id === id; }) || null;
  };

  /* ---------- Elements ---------- */
  app.el = {
    themeToggle: document.getElementById('themeToggle'),
    settingsBtn: document.getElementById('settingsBtn'),
    settingsModal: document.getElementById('settingsModal'),
    closeSettings: document.getElementById('closeSettings'),
    cancelSettings: document.getElementById('cancelSettings'),
    saveSettings: document.getElementById('saveSettings'),
    resetSettings: document.getElementById('resetSettings'),
    timerEnabled: document.getElementById('timerEnabled'),
    timerMinutes: document.getElementById('timerMinutes'),
    timerMinutesValue: document.getElementById('timerMinutesValue'),
    timerDisplay: document.getElementById('timerDisplay'),
    timer: document.getElementById('timer'),

    pqTimerDisplay: document.getElementById('pqTimerDisplay'),
    pqTimer: document.getElementById('pqTimer'),
    pqTimerEnabledCheckbox: document.getElementById('pqTimerEnabled'),
    pqTimerSecondsInput: document.getElementById('pqTimerSeconds'),

    startScreen: document.getElementById('startScreen'),
    levelPicker: document.getElementById('levelPicker'),
    yearSection: document.getElementById('yearSection'),
    yearPicker: document.getElementById('yearPicker'),
    emailSection: document.getElementById('emailSection'),
    emailInput: document.getElementById('emailInput'),
    consentCheck: document.getElementById('consentCheck'),
    startContinue: document.getElementById('startContinue'),

    tutorialScreen: document.getElementById('tutorialScreen'),
    startPracticing: document.getElementById('startPracticing'),
    helpBtn: document.getElementById('helpBtn'),

    sectionSelection: document.getElementById('sectionSelection'),
    learnScreen: document.getElementById('learnScreen'),
    quizContainer: document.getElementById('quizContainer'),
    resultsContainer: document.getElementById('resultsContainer'),

    sectionCards: document.querySelectorAll('.section-card'),
    learnBtns: document.querySelectorAll('.learn-btn'),
    quizBtns: document.querySelectorAll('.quiz-btn'),

    inductionGrid: document.getElementById('inductionGrid'),
    legacySectionGrid: document.getElementById('legacySectionGrid'),
    legacySectionTitle: document.getElementById('legacySectionTitle'),

    learnTitle: document.getElementById('learnTitle'),
    learnProgress: document.getElementById('learnProgress'),
    learnSlideTitle: document.getElementById('learnSlideTitle'),
    learnSlideContent: document.getElementById('learnSlideContent'),
    learnSlideExample: document.getElementById('learnSlideExample'),
    learnSlideOutput: document.getElementById('learnSlideOutput'),
    learnPrevBtn: document.getElementById('learnPrevBtn'),
    learnNextBtn: document.getElementById('learnNextBtn'),
    learnSkipBtn: document.getElementById('learnSkipBtn'),

    exerciseContainer: document.getElementById('exerciseContainer'),
    exercisePrompt: document.getElementById('exercisePrompt'),
    exerciseArea: document.getElementById('exerciseArea'),
    exerciseCheckBtn: document.getElementById('exerciseCheckBtn'),
    exerciseFeedback: document.getElementById('exerciseFeedback'),

    progressBar: document.getElementById('progressBar'),
    progressLabel: document.getElementById('progressLabel'),
    questionContainer: document.getElementById('questionContainer'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
  };

  /* ---------- Helpers ---------- */
  app.escapeHtml = function (text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  app.shuffleArray = function (arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = a[i];
      a[i] = a[j];
      a[j] = temp;
    }
    return a;
  };

  app.pickQuizVariant = function () {
    const variants = app.config.QUIZ_VARIANTS || ['A', 'B', 'C'];
    return variants[Math.floor(Math.random() * variants.length)];
  };

  app.isValidInductionEmail = function (email) {
    if (!email || email.indexOf('@') === -1) return false;
    const domains = app.config.ALLOWED_EMAIL_DOMAINS || [];
    if (!domains.length) return true;
    const lower = email.toLowerCase();
    return domains.some(function (d) { return lower.endsWith('@' + d.toLowerCase()); });
  };

  app.resolveModuleId = function (section, year) {
    const legacyMap = {
      'csharp-intro': 'a',
      'csharp-syntax': 'b',
      'csharp-output': 'c',
      'csharp-comments': 'd',
      'csharp-variables': 'e',
      'csharp-datatypes': 'f',
      'csharp-typecasting': 'g',
      'csharp-userinput': 'h',
      'csharp-operators': 'i',
      'csharp-math': 'j',
      'csharp-strings': 'k'
    };
    if (section && section.indexOf('l3y') === 0) return section;
    const moduleLetter = legacyMap[section];
    if (!moduleLetter) return section;
    const y = year || app.state.year || 'y1';
    return 'l3' + y + '-' + moduleLetter.toLowerCase();
  };

  /* ---------- Start / intake ---------- */
  app.renderLevelPicker = function () {
    const wrap = app.el.levelPicker;
    if (!wrap) return;
    wrap.innerHTML = '';
    (app.config.LEVELS || []).forEach(function (lvl) {
      const card = document.createElement('button');
      card.type = 'button';
      const isActive = lvl.id === 'l3';
      card.className = 'level-card' + (isActive ? '' : ' level-card-disabled');
      card.setAttribute('data-level', lvl.id);
      if (!isActive) card.setAttribute('disabled', 'disabled');
      card.innerHTML =
        '<span class="level-card-mark">' + app.escapeHtml(lvl.label) + '</span>' +
        '<span class="level-card-blurb">' + app.escapeHtml(lvl.blurb || '') + '</span>';
      card.addEventListener('click', function () {
        if (!isActive) return;
        app.pickLevel(lvl.id);
      });
      wrap.appendChild(card);
    });
  };

  app.renderYearPicker = function () {
    const wrap = app.el.yearPicker;
    if (!wrap) return;
    wrap.innerHTML = '';
    const lvl = (app.config.LEVELS || []).find(function (l) { return l.id === app.state.intakeLevel; });
    if (!lvl) return;
    lvl.years.forEach(function (yr) {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'level-card';
      card.setAttribute('data-year', yr);
      card.innerHTML =
        '<span class="level-card-mark">' + (yr === 'y1' ? 'Year 1' : 'Year 2') + '</span>' +
        '<span class="level-card-blurb">' + (yr === 'y1' ? 'First year of this level' : 'Second / final year of this level') + '</span>';
      card.addEventListener('click', function () { app.pickYear(yr); });
      wrap.appendChild(card);
    });
  };

  app.pickLevel = function (levelId) {
    app.state.intakeLevel = levelId;
    Array.prototype.forEach.call(app.el.levelPicker.querySelectorAll('.level-card'), function (card) {
      card.classList.toggle('selected', card.getAttribute('data-level') === levelId);
    });
    const lvl = (app.config.LEVELS || []).find(function (l) { return l.id === levelId; });
    if (lvl && lvl.years && lvl.years.length === 1) {
      app.state.intakeYear = lvl.years[0];
      if (app.el.yearSection) app.el.yearSection.hidden = true;
      if (app.config.REQUIRE_EMAIL) app.showEmailStep();
    } else {
      app.state.intakeYear = null;
      if (app.el.yearSection) app.el.yearSection.hidden = false;
      app.renderYearPicker();
      if (app.el.emailSection) app.el.emailSection.hidden = !app.config.REQUIRE_EMAIL;
    }
    app.updateContinueEnabled();
  };

  app.pickYear = function (yearId) {
    app.state.intakeYear = yearId;
    Array.prototype.forEach.call(app.el.yearPicker.querySelectorAll('.level-card'), function (card) {
      card.classList.toggle('selected', card.getAttribute('data-year') === yearId);
    });
    if (app.config.REQUIRE_EMAIL) app.showEmailStep();
    app.updateContinueEnabled();
  };

  app.showEmailStep = function () {
    if (app.el.emailSection) app.el.emailSection.hidden = false;
  };

  app.updateContinueEnabled = function () {
    if (!app.el.startContinue) return;
    const hasLevel = !!app.state.intakeLevel;
    const lvl = (app.config.LEVELS || []).find(function (l) { return l.id === app.state.intakeLevel; });
    const requiresYear = lvl && lvl.years && lvl.years.length > 1;
    const hasYear = !requiresYear || !!app.state.intakeYear;

    if (!app.config.REQUIRE_EMAIL) {
      app.el.startContinue.disabled = !(hasLevel && hasYear);
      return;
    }

    const email = (app.el.emailInput && app.el.emailInput.value || '').trim();
    const emailOk = app.isValidInductionEmail(email);
    const consent = !!(app.el.consentCheck && app.el.consentCheck.checked);
    app.el.startContinue.disabled = !(hasLevel && hasYear && emailOk && consent);
  };

  app.TRACK_STORAGE_PREFIX = 'inductionTrack:';

  app.getOrAssignTrack = function (level, year, email) {
    const key = app.TRACK_STORAGE_PREFIX + level + ':' + year;
    try {
      const stored = localStorage.getItem(key);
      if (stored === 'a' || stored === 'b') return stored;
    } catch (e) { /* ignore */ }
    let track = 'a';
    if (email) {
      let h = 0;
      for (let i = 0; i < email.length; i++) {
        h = (h * 31 + email.charCodeAt(i)) | 0;
      }
      track = (Math.abs(h) % 2 === 0) ? 'a' : 'b';
    } else {
      track = Math.random() < 0.5 ? 'a' : 'b';
    }
    try { localStorage.setItem(key, track); } catch (e) { /* ignore quota */ }
    return track;
  };

  app.dataPath = function (filename, year, track) {
    const y = year || app.state.year || 'y1';
    const t = track || app.state.dataTrack || 'a';
    return 'data/' + y + t + '/' + filename;
  };

  app.renderInductionGrid = function () {
    if (!app.el.inductionGrid) return;
    const level = app.state.level;
    const year = app.state.year;
    const modules = (app.config.MODULES || []).filter(function (m) {
      return m.level === level && m.year === year;
    });
    app.el.inductionGrid.innerHTML = '';
    if (modules.length === 0) {
      app.el.inductionGrid.style.display = 'none';
      if (app.el.legacySectionGrid) app.el.legacySectionGrid.style.display = '';
      if (app.el.legacySectionTitle) app.el.legacySectionTitle.style.display = '';
      return;
    }
    app.el.inductionGrid.style.display = '';
    if (app.el.legacySectionGrid) app.el.legacySectionGrid.style.display = 'none';
    if (app.el.legacySectionTitle) app.el.legacySectionTitle.style.display = 'none';
    modules.forEach(function (m) {
      const card = document.createElement('div');
      card.className = 'section-card';
      card.setAttribute('data-section', m.id);
      card.setAttribute('data-level', m.level);
      const mark = (m.module || '').toString();
      card.innerHTML = ''
        + '<span class="section-mark">' + mark + '</span>'
        + '<h3>Module ' + mark + ' - ' + m.title + '</h3>'
        + '<p>' + (m.summary || '') + '</p>'
        + '<span class="completion-badge"></span>'
        + '<div class="section-actions">'
        +   '<button class="btn btn-secondary learn-btn" data-section="' + m.id + '">Learn</button>'
        +   '<button class="btn quiz-btn" data-section="' + m.id + '">Quiz</button>'
        + '</div>';
      app.el.inductionGrid.appendChild(card);
    });
    app.el.learnBtns = document.querySelectorAll('.learn-btn');
    app.el.quizBtns = document.querySelectorAll('.quiz-btn');
    app.el.learnBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        const section = btn.getAttribute('data-section');
        const card = btn.closest('.section-card');
        const level = card ? card.getAttribute('data-level') : app.state.level;
        app.startLearn(section, level);
      });
    });
    app.el.quizBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        const section = btn.getAttribute('data-section');
        const card = btn.closest('.section-card');
        const level = card ? card.getAttribute('data-level') : app.state.level;
        app.startQuiz(section, level);
      });
    });
  };

  app.completeIntake = function () {
    const email = app.config.REQUIRE_EMAIL ? (app.el.emailInput && app.el.emailInput.value || '').trim() : '';
    app.state.user = { email: email, level: app.state.intakeLevel, year: app.state.intakeYear };
    app.state.level = app.state.intakeLevel;
    app.state.year = app.state.intakeYear;
    app.state.dataTrack = app.getOrAssignTrack(app.state.level, app.state.year, email);
    try {
      localStorage.setItem('inductionUser', JSON.stringify({
        email: email,
        level: app.state.intakeLevel,
        year: app.state.intakeYear,
        startedAt: new Date().toISOString()
      }));
    } catch (e) { /* ignore quota errors */ }
    app.el.startScreen.classList.add('hidden');
    app.el.sectionSelection.classList.add('hidden');
    app.el.tutorialScreen.classList.remove('hidden');
    app.renderInductionGrid();
    if (app.applyProgressToCards) app.applyProgressToCards();
  };

  app.tryResumeIntake = function () {
    try {
      const raw = localStorage.getItem('inductionUser');
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.level || !parsed.year) return false;
      if (app.config.REQUIRE_EMAIL && !parsed.email) return false;
      app.state.user = { email: parsed.email || '', level: parsed.level, year: parsed.year };
      app.state.level = parsed.level;
      app.state.year = parsed.year;
      app.state.dataTrack = app.getOrAssignTrack(parsed.level, parsed.year, parsed.email || '');
      app.el.startScreen.classList.add('hidden');
      app.el.sectionSelection.classList.remove('hidden');
      app.renderInductionGrid();
      if (app.el.emailInput && parsed.email) app.el.emailInput.value = parsed.email;
      if (app.applyProgressToCards) app.applyProgressToCards();
      return true;
    } catch (e) {
      return false;
    }
  };

  /* ---------- Init ---------- */
  app.init = function () {
    if (app.initTheme) app.initTheme();
    if (app.initSettings) app.initSettings();

    app.renderLevelPicker();

    if (app.tryResumeIntake()) {
      // already signed in — skip start screen
    } else {
      app.el.startScreen.classList.remove('hidden');
      app.el.sectionSelection.classList.add('hidden');
    }

    if (app.el.emailInput) app.el.emailInput.addEventListener('input', app.updateContinueEnabled);
    if (app.el.consentCheck) app.el.consentCheck.addEventListener('change', app.updateContinueEnabled);
    if (app.el.startContinue) app.el.startContinue.addEventListener('click', app.completeIntake);

    if (app.initTutorial) app.initTutorial();

    app.el.learnBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        const section = btn.getAttribute('data-section');
        const card = btn.closest('.section-card');
        const level = card ? card.getAttribute('data-level') : 'beginner';
        app.startLearn(section, level);
      });
    });

    app.el.quizBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        const section = btn.getAttribute('data-section');
        const card = btn.closest('.section-card');
        const level = card ? card.getAttribute('data-level') : 'beginner';
        app.startQuiz(section, level);
      });
    });


    if ('serviceWorker' in navigator) {
      window.addEventListener('load', function () {
        navigator.serviceWorker.register('sw.js').catch(function (err) {
          console.warn('ServiceWorker registration failed:', err);
        });
      });
    }

    app.fallbackIcons();
  };

  app.fallbackIcons = function () {
    setTimeout(function () {
      var test = document.createElement('i');
      test.className = 'fa-solid fa-circle-question menu-icon';
      test.style.display = 'none';
      document.body.appendChild(test);
      var fontFamily = getComputedStyle(test).fontFamily;
      document.body.removeChild(test);
      var faLoaded = fontFamily.indexOf('Font Awesome') !== -1;
      if (!faLoaded) {
        document.querySelectorAll('.icon-btn i, .btn-close i').forEach(function (icon) {
          var emoji = icon.getAttribute('data-emoji');
          if (emoji) {
            icon.replaceWith(document.createTextNode(emoji));
          }
        });
      }
    }, 500);
  };

  app.init();
})();