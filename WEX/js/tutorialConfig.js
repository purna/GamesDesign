/**
 * tutorialConfig.js — data only.
 *
 * Definitions for the first-run tutorial. No behaviour lives here; the engine in
 * tutorialSystem.js decides how a step is shown.
 *
 * Each step may set:
 *   target        CSS selector for the element to point at. Omit for a centred step.
 *   title         heading text
 *   body          paragraph text (supports \n for line breaks)
 *   placement     'top' | 'bottom' | 'left' | 'right' | 'center'
 *   allowSkip     whether the player may dismiss this step (default true)
 *   advanceOnClick advance when the highlighted element itself is clicked
 *   before        optional predicate - step is skipped unless it returns true
 *
 * The order below is a first-run walkthrough of a single round, chosen to teach the
 * one thing that is genuinely hard to infer from the board: you do not win by
 * collecting cards, you win by banking a set of one card of each required type from
 * the same route.
 */

const TUTORIAL_CONFIG = {
  // Bumped when steps or targets change: seen() compares this, so players who
  // already ran v1 get the updated walkthrough.
  version: 2,
  storageKey: 'rttr-tutorial-seen',

  steps: [
    {
      id: 'welcome',
      title: 'Welcome to Race to the Role',
      body: 'You are building experience towards one target job, racing three rivals who want the same thing.\n\nThe goal is not to collect the most cards. It is to bank complete experience sets and meet the job requirements.',
      placement: 'center',
      allowSkip: true
    },
    {
      id: 'target-job',
      target: '#jobTitle',
      title: 'Your target job',
      body: 'This is the role you are competing for. Its requirements are listed underneath, and you must meet all of them before you can apply.',
      placement: 'bottom',
      allowSkip: true
    },
    {
      id: 'job-needs',
      target: '#jobNeeds',
      title: 'What the job needs',
      body: 'You need completed sets, evidence, variety across role-fit routes, and the required skill.\n\nTap the ? next to a skill to see exactly how to earn it.',
      placement: 'bottom',
      allowSkip: true,
      tab: 'needs'
    },
    {
      id: 'market',
      target: '#market',
      title: 'The market',
      body: 'Cards you can take come from here. Taking a card costs 1 action, and you may take 2 per round. Replace up to 2 market cards with new cards from the deck, or drag cards to rearrange the market. Click a card to preview it.',
      placement: 'top',
      allowSkip: true
    },
    {
      id: 'hand',
      target: '#hand',
      title: 'Your hand',
      body: 'Click a hand card to select it for a set. Selected cards get a highlight.\n\nUse the ? button on a card to read it without spending your selection, and drag cards to rearrange them.',
      placement: 'top',
      allowSkip: true
    },
    {
      id: 'set-status',
      target: '#setBuilderStatus',
      title: 'Building a set',
      body: 'A set needs one card of EVERY required type, and all from the same route.\n\nThe Routes tab on the left is now open, listing what each one needs. If your selection does not match, this panel tells you exactly what is missing.',
      placement: 'top',
      allowSkip: true,
      tab: 'routes'
    },
    {
      id: 'rail-tabs',
      target: '#tabbtn-skills',
      title: 'The left rail',
      body: 'Everything about the role lives here behind four tabs: Needs, Skills, Routes and CV. Click through them as you go.\n\nThe rail scrolls, but Bank, Apply and End stay pinned at the bottom so they can never be scrolled away.',
      placement: 'right',
      allowSkip: true,
      advanceOnClick: true
    },
    {
      id: 'open-routes',
      target: '#tabbtn-routes',
      title: 'Open the routes',
      body: 'Click the Routes tab to see the Experience sets.\n\nEach one lists the card types it needs and how many. That is the list you build against for the rest of the round.',
      placement: 'right',
      allowSkip: true,
      advanceOnClick: true
    },
    {
      id: 'players',
      target: '#drawerBtn',
      title: 'Your rivals',
      body: 'The Players button opens a side panel with your three competitors, the career feed and the roles you have completed.\n\nYou only need it if you want to check how the race is going — the play area is always visible without it.',
      placement: 'bottom',
      allowSkip: true
    },
    {
      id: 'bank',
      target: '#bankBtn',
      title: 'Banking a set',
      body: 'When the panel says you are ready, press Bank set. It sits at the bottom of the left rail, with your other decisions.\n\nBanking turns your cards into CV experience, evidence and skills. Banking the same route twice adds experience, but not new route variety.',
      placement: 'right',
      allowSkip: false
    },
    {
      id: 'controls',
      target: '#returnBtn',
      title: 'Your other moves',
      body: 'Return up to 2 selected cards per round for free by pressing the button or dragging them onto the market.\n\nEnding your turn is End turn, at the bottom of the left rail. The rivals move after you.',
      placement: 'top',
      allowSkip: true
    },
    {
      id: 'skills',
      target: '#skillsRequired',
      title: 'Skills',
      body: 'Every skill you can gain, with the one your job needs marked "needed". Hover any of them to see which routes and cards will get it.\n\nAt the end of each round a bonus knowledge check appears — answer correctly to redraw up to two cards.',
      placement: 'right',
      allowSkip: true,
      tab: 'skills'
    },
    {
      id: 'apply',
      target: '#applyBtn',
      title: 'Applying',
      body: 'This stays disabled until you meet every requirement: the experience, the evidence, two role-fit routes, and the required skill.\n\nThen it unlocks and you can apply. First to apply wins the job. If nobody qualifies, the closest candidate wins.',
      placement: 'right',
      allowSkip: true
    },
    {
      id: 'finish',
      title: 'You are ready',
      body: 'Good luck. Check the helper hints any time from the lightbulb in the top bar, and open How to Play for a reminder.\n\nYour progress saves automatically.',
      placement: 'center',
      allowSkip: true
    }
  ],

  // Shown the first time a player wins, as a short debrief.
  victory: {
    id: 'victory',
    title: 'You got the job',
    body: 'Every role you win is saved to your Hall of Fame, with the experience, evidence and skills you finished on.\n\nPick another industry or role to keep building.',
    placement: 'center'
  }
};

if (typeof window !== 'undefined') window.TUTORIAL_CONFIG = TUTORIAL_CONFIG;
