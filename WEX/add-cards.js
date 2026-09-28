const fs = require('fs');
const path = require('path');

function readRoles(dir) {
  const files = fs.readdirSync(dir);
  return files.filter(f => f.endsWith('.json')).map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
}

function readCards(dir) {
  const files = fs.readdirSync(dir);
  const individualFiles = files.filter(f => f.endsWith('.json') && f !== 'cards.json');
  let cards = individualFiles.map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
  if (files.includes('cards.json')) {
    const arrayCards = JSON.parse(fs.readFileSync(path.join(dir, 'cards.json'), 'utf8'));
    cards = cards.concat(arrayCards);
  }
  return cards;
}

function writeCardsArray(cardsDir, cards) {
  // Write consolidated cards.json
  fs.writeFileSync(path.join(cardsDir, 'cards.json'), JSON.stringify(cards, null, 2));
}

const industries = [
  {
    id: 'esports',
    name: 'Esports',
    short: 'es',
    prefix: 'es',
    icons: { Setup: '📋', Action: '🎮', Proof: '📝', Impact: '📈', Wildcard: '⭐' },
    flavor: {
      Setup: 'Preparation wins matches.',
      Action: 'Execution is everything.',
      Proof: 'Results speak louder than promises.',
      Impact: 'Change the game, not just the score.',
      Wildcard: 'Sometimes you need a wildcard.'
    }
  },
  {
    id: 'game-design',
    name: 'Game Design',
    short: 'gd',
    prefix: 'gd',
    icons: { Setup: '📋', Action: '🛠️', Proof: '📝', Impact: '🚀', Wildcard: '⭐' },
    flavor: {
      Setup: 'Clear expectations make great design possible.',
      Action: 'Design is iteration made visible.',
      Proof: 'A design log is a portfolio in waiting.',
      Impact: 'Shipped design is the only design that matters.',
      Wildcard: 'The best designers had mentors first.'
    }
  },
  {
    id: 'games-development',
    name: 'Games Development',
    short: 'dev',
    prefix: 'dev',
    icons: { Setup: '📋', Action: '⌨️', Proof: '📝', Impact: '🚀', Wildcard: '⭐' },
    flavor: {
      Setup: 'Clear specs prevent scope creep.',
      Action: 'Code that compiles is just the start.',
      Proof: 'Commit messages tell the real story.',
      Impact: 'Shipped code is the only code that matters.',
      Wildcard: 'The best engineers had mentors first.'
    }
  },
  {
    id: 'animation',
    name: 'Animation',
    short: 'anim',
    prefix: 'anim',
    icons: { Setup: '📋', Action: '🎭', Proof: '📝', Impact: '🚀', Wildcard: '⭐' },
    flavor: {
      Setup: 'Clear briefs make clean animation.',
      Action: 'Animation is acting with a timeline.',
      Proof: 'Every frame is a decision.',
      Impact: 'Animation lives in the engine, not the viewport.',
      Wildcard: 'The best animators had mentors first.'
    }
  },
  {
    id: 'illustration',
    name: 'Illustration',
    short: 'illu',
    prefix: 'illu',
    icons: { Setup: '📋', Action: '🖌️', Proof: '📝', Impact: '🚀', Wildcard: '⭐' },
    flavor: {
      Setup: 'Clear briefs make consistent art.',
      Action: 'Art that meets specs ships.',
      Proof: 'Every brush stroke is a decision.',
      Impact: 'Art lives in the engine, not the viewport.',
      Wildcard: 'The best artists had mentors first.'
    }
  }
];

// Additional shared cards to add (set: "any")
const additionalCards = [
  // Setup cards (6)
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
  // Action cards (6)
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
  // Proof cards (6)
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
  // Impact cards (3)
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

// Process each industry
industries.forEach(ind => {
  const cardsDir = `/Users/nigelmorris/Documents/GitHub/GamesDesign/WEX/data/industries/${ind.id}/cards`;
  const cards = readCards(cardsDir);
  
  // Find the highest existing ID number for this industry
  let maxId = 0;
  cards.forEach(card => {
    const match = card.id.match(new RegExp(`${ind.prefix}-(\\d+)$`));
    if (match) maxId = Math.max(maxId, parseInt(match[1]));
    const match2 = card.id.match(new RegExp(`${ind.short}-(\\d+)$`));
    if (match2) maxId = Math.max(maxId, parseInt(match2[1]));
    // Also check for wild cards
    const wildMatch = card.id.match(new RegExp(`wild-${ind.prefix}-(\\d+)$`));
    if (wildMatch) maxId = Math.max(maxId, parseInt(wildMatch[1]));
    const wildMatch2 = card.id.match(new RegExp(`wild-${ind.short}-(\\d+)$`));
    if (wildMatch2) maxId = Math.max(maxId, parseInt(wildMatch2[1]));
  });
  
  let nextId = maxId + 1;
  let addedCount = 0;
  
  additionalCards.forEach(cardGroup => {
    cardGroup.templates.forEach((tmpl, idx) => {
      const id = `${ind.prefix}-${cardGroup.type.toLowerCase()}-${nextId}`;
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
      
      // Add skill for Action and Proof cards
      if (cardGroup.type === 'Action') {
        const skills = ['Design', 'Technical Setup', 'Analysis', 'Communication', 'Teamwork', 'Reliability'];
        newCard.skill = skills[addedCount % skills.length];
      } else if (cardGroup.type === 'Proof') {
        const skills = ['Reliability', 'Communication', 'Analysis', 'Teamwork', 'Design', 'Technical Setup'];
        newCard.skill = skills[addedCount % skills.length];
      }
      
      cards.push(newCard);
      nextId++;
      addedCount++;
    });
  });
  
  // Write consolidated cards.json
  writeCardsArray(cardsDir, cards);
  console.log(`Added ${addedCount} cards to ${ind.id}. Total: ${cards.length}`);
});

// Regenerate game-data.json files
const industries2 = ['esports', 'game-design', 'games-development', 'animation', 'illustration'];

industries2.forEach(ind => {
  const rolesDir = `/Users/nigelmorris/Documents/GitHub/GamesDesign/WEX/data/industries/${ind}/roles`;
  const cardsDir = `/Users/nigelmorris/Documents/GitHub/GamesDesign/WEX/data/industries/${ind}/cards`;
  const outDir = `/Users/nigelmorris/Documents/GitHub/GamesDesign/WEX/data/industries/${ind}`;
  
  const roles = fs.existsSync(rolesDir) ? readRoles(rolesDir) : [];
  const cards = readCards(cardsDir);
  
  const sets = [
    {
      "id": "placement",
      "name": "Block Placement",
      "art": "🏢",
      "groupSize": 4,
      "requiredCategories": ["Setup", "Action", "Proof", "Impact"],
      "reward": { "experience": `${ind.charAt(0).toUpperCase() + ind.slice(1)} Industry Placement`, "evidenceValue": 2, "reference": true },
      "why": "A placement gives practical experience and, if it goes well, an employer reference."
    },
    {
      "id": "visit",
      "name": "Employer Visit",
      "art": "🏭",
      "groupSize": 2,
      "requiredCategories": ["Setup", "Action"],
      "reward": { "experience": "Industry Insight Visit", "evidenceValue": 1, "reference": false },
      "why": "A visit builds industry understanding and useful contacts."
    },
    {
      "id": "volunteering",
      "name": "Volunteering",
      "art": "🙌",
      "groupSize": 3,
      "requiredCategories": ["Setup", "Action", "Proof"],
      "reward": { "experience": `${ind.charAt(0).toUpperCase() + ind.slice(1)} Volunteer`, "evidenceValue": 1, "reference": false },
      "why": "Volunteering shows reliability, initiative and teamwork."
    },
    {
      "id": "brief",
      "name": "Live Project Brief",
      "art": "🎨",
      "groupSize": 3,
      "requiredCategories": ["Setup", "Action", "Proof"],
      "reward": { "experience": `${ind.charAt(0).toUpperCase() + ind.slice(1)} Project`, "evidenceValue": 2, "reference": false },
      "why": "A finished brief creates a portfolio piece that shows you can respond to a client's needs."
    },
    {
      "id": "partnership",
      "name": "Industry Partnership",
      "art": "🎓",
      "groupSize": 4,
      "requiredCategories": ["Setup", "Action", "Proof", "Impact"],
      "reward": { "experience": "Industry Collaboration", "evidenceValue": 2, "reference": false },
      "why": "A partnership gives you specialist feedback and experience working with professionals."
    }
  ];
  
  const data = { roles, cards, sets };
  fs.writeFileSync(path.join(outDir, 'game-data.json'), JSON.stringify(data, null, 2));
  console.log(`Regenerated ${ind}/game-data.json with ${cards.length} cards`);
});

console.log('Done!');