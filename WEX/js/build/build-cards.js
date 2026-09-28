const fs = require('fs');
const PROJECT_ROOT = path.join(__dirname, '..', '..');
const path = require('path');

// Shared cards (24 cards) - same for all industries
const sharedCards = [
  // Setup (6)
  { type: 'Setup', category: 'Setup', set: 'any', value: 1, rarity: 'Common',
    templates: [
      { name: 'Research Industry Standards', desc: 'Study current best practices, pipelines, and quality bars for your discipline.', flavor: 'Know the bar before you raise it.' },
      { name: 'Create Personal Learning Plan', desc: 'Map skills to acquire, resources to use, and milestones to hit during the experience.', flavor: 'A plan turns hope into progress.' },
      { name: 'Set Up Portfolio Tracking', desc: 'Create a system to capture work-in-progress, feedback, and final pieces for your portfolio.', flavor: 'Document as you go, not after.' },
      { name: 'Establish Communication Routines', desc: 'Agree on check-in frequency, update formats, and escalation paths with your supervisor.', flavor: 'Communication is a skill, not an afterthought.' },
      { name: 'Define Success Metrics', desc: 'Agree on what "done well" looks like: quality, speed, innovation, or player impact.', flavor: 'You can\'t hit a target you can\'t see.' },
      { name: 'Prepare Questions for Mentor', desc: 'List specific technical, creative, and career questions to maximize mentor sessions.', flavor: 'Good questions get better answers.' }
    ]
  },
  // Action (6)
  { type: 'Action', category: 'Action', set: 'any', value: 1, rarity: 'Common',
    templates: [
      { name: 'Prototype a Core System', desc: 'Build a quick proof-of-concept for a key mechanic, tool, or pipeline.', flavor: 'Prototypes answer questions designs can\'t.' },
      { name: 'Collaborate Cross-Discipline', desc: 'Work with a different discipline (art/code/design) to integrate a feature end-to-end.', flavor: 'Great games are built at discipline boundaries.' },
      { name: 'Optimize a Workflow', desc: 'Identify a bottleneck and implement a faster process, script, or template.', flavor: 'Automation compounds.' },
      { name: 'Run a Playtest Session', desc: 'Observe players, take notes, and identify friction points in the experience.', flavor: 'Players reveal what designers miss.' },
      { name: 'Create Technical Documentation', desc: 'Write clear docs for a system, API, or pipeline so others can use and maintain it.', flavor: 'Documentation is empathy for your future self.' },
      { name: 'Refactor for Maintainability', desc: 'Clean up messy code, rigs, or files to improve readability and reduce future bugs.', flavor: 'Clean craft enables speed.' }
    ]
  },
  // Proof (6)
  { type: 'Proof', category: 'Proof', set: 'any', value: 1, rarity: 'Common',
    templates: [
      { name: 'Record Peer Feedback', desc: 'Document specific feedback from teammates and how you acted on it.', flavor: 'Feedback implemented is growth demonstrated.' },
      { name: 'Capture Before/After Comparison', desc: 'Show side-by-side evidence of improvement: performance, quality, or player experience.', flavor: 'Visual proof needs no translation.' },
      { name: 'Write a Case Study Outline', desc: 'Structure a portfolio case study: problem, process, solution, result, reflection.', flavor: 'Case studies get you hired.' },
      { name: 'Collect Quantitative Metrics', desc: 'Gather data: frame rates, load times, player retention, iteration speed, bug counts.', flavor: 'Numbers convince skeptics.' },
      { name: 'Document a Failure & Recovery', desc: 'Record what went wrong, root cause analysis, and the fix that prevented recurrence.', flavor: 'Failures documented become wisdom.' },
      { name: 'Create a Showcase Video/GIF', desc: 'Record a 30-second clip of your work in context: in-engine, in-game, or in-pipeline.', flavor: 'Show, don\'t just tell.' }
    ]
  },
  // Impact (3)
  { type: 'Impact', category: 'Impact', set: 'any', value: 1, rarity: 'Uncommon',
    templates: [
      { name: 'Feature Adopted by Team', desc: 'Your prototype, tool, or process was adopted as standard practice by the team.', flavor: 'Adoption is the ultimate validation.' },
      { name: 'Mentored a Peer', desc: 'Helped another student/junior improve their skills through guidance and knowledge sharing.', flavor: 'Teaching proves mastery.' },
      { name: 'Contributed to Shipped Content', desc: 'Your work is part of content that reached players, even in a small way.', flavor: 'Shipped is the only metric that counts.' }
    ]
  },
  // Wildcards (3)
  { type: 'Wildcard', category: 'Wildcard', set: 'any', value: 1, rarity: 'Rare',
    templates: [
      { name: 'Wild Card: Industry Veteran Insight', desc: 'A veteran shares hard-won wisdom. Use in place of any Setup, Action, or Proof card for any set.', flavor: 'Experience is the best teacher.' },
      { name: 'Wild Card: Cross-Discipline Workshop', desc: 'An intensive workshop bridges disciplines. Use in place of any card for any set.', flavor: 'Boundaries are where innovation lives.' },
      { name: 'Wild Card: Personal Project Sprint', desc: 'A focused personal project fills a gap. Use in place of any card for any set.', flavor: 'Self-directed work shows drive.' }
    ]
  }
];

// Industry-specific configuration
const industries = [
  {
    id: 'esports',
    prefix: 'es',
    icons: { Setup: '📋', Action: '🎮', Proof: '📝', Impact: '📈', Wildcard: '⭐' }
  },
  {
    id: 'game-design',
    prefix: 'gd',
    icons: { Setup: '📋', Action: '🛠️', Proof: '📝', Impact: '🚀', Wildcard: '⭐' }
  },
  {
    id: 'games-development',
    prefix: 'dev',
    icons: { Setup: '📋', Action: '⌨️', Proof: '📝', Impact: '🚀', Wildcard: '⭐' }
  },
  {
    id: 'animation',
    prefix: 'anim',
    icons: { Setup: '📋', Action: '🎭', Proof: '📝', Impact: '🚀', Wildcard: '⭐' }
  },
  {
    id: 'illustration',
    prefix: 'illu',
    icons: { Setup: '📋', Action: '🖌️', Proof: '📝', Impact: '🚀', Wildcard: '⭐' }
  },
  {
    id: 'cyber-security',
    prefix: 'cs',
    icons: { Setup: '📋', Action: '🔍', Proof: '📝', Impact: '✅', Wildcard: '⭐' }
  },
  {
    id: 'web-design',
    prefix: 'wd',
    icons: { Setup: '📋', Action: '⚛️', Proof: '📝', Impact: '🚀', Wildcard: '⭐' }
  },
  {
    id: 'film-making',
    prefix: 'fm',
    icons: { Setup: '📋', Action: '✂️', Proof: '📝', Impact: '🎬', Wildcard: '⭐' }
  }
];

// Industry-specific cards (read from individual files in cards/ subfolder for original industries,
// or from cards.json at industry level for new industries that don't have individual files yet)
function readIndustryCards(industryDir, industryId) {
  const cardsDir = path.join(industryDir, 'cards');
  let cards = [];
  
  // Read from individual files in cards/ subfolder
  if (fs.existsSync(cardsDir)) {
    const files = fs.readdirSync(cardsDir).filter(f => f.endsWith('.json') && f !== 'cards.json');
    if (files.length > 0) {
      cards = cards.concat(files.map(f => JSON.parse(fs.readFileSync(path.join(cardsDir, f), 'utf8'))));
      return cards; // Original industries: use individual files only
    }
  }
  
  // For new industries without individual files, read from cards.json at industry level
  const industryFiles = fs.readdirSync(industryDir);
  if (industryFiles.includes('cards.json')) {
    const jsonCards = JSON.parse(fs.readFileSync(path.join(industryDir, 'cards.json'), 'utf8'));
    // Filter out shared cards (those with -shared- in id)
    cards = jsonCards.filter(c => !c.id.includes('-shared-'));
  }
  
  return cards;
}

industries.forEach(ind => {
  const industryDir = `${PROJECT_ROOT}/data/industries/${ind.id}`;
  const industryCards = readIndustryCards(industryDir, ind.id);
  
  // Build shared cards with industry-specific prefix and icons
  let cardIdCounter = 1;
  const allCards = [...industryCards];
  
  sharedCards.forEach(cardGroup => {
    cardGroup.templates.forEach((tmpl, idx) => {
      const id = `${ind.prefix}-${cardGroup.type.toLowerCase()}-shared-${cardIdCounter}`;
      const newCard = {
        id,
        name: tmpl.name,
        type: cardGroup.type,
        category: cardGroup.category,
        description: tmpl.desc,
        flavor: tmpl.flavor,
        rarity: cardGroup.rarity,
        art: ind.icons[cardGroup.category] || '📋',
        set: cardGroup.set,
        value: cardGroup.value
      };
      
      if (cardGroup.type === 'Action') {
        const skills = ['Design', 'Technical Setup', 'Analysis', 'Communication', 'Teamwork', 'Reliability'];
        newCard.skill = skills[cardIdCounter % skills.length];
      } else if (cardGroup.type === 'Proof') {
        const skills = ['Reliability', 'Communication', 'Analysis', 'Teamwork', 'Design', 'Technical Setup'];
        newCard.skill = skills[cardIdCounter % skills.length];
      }
      
      allCards.push(newCard);
      cardIdCounter++;
    });
  });
  
  // Write cards.json at industry level
  fs.writeFileSync(path.join(industryDir, 'cards.json'), JSON.stringify(allCards, null, 2));
  console.log(`${ind.id}: ${industryCards.length} industry + ${sharedCards.reduce((sum, g) => sum + g.templates.length, 0)} shared = ${allCards.length} total cards`);
});

console.log('Done! All cards.json files created with 52 cards each.');