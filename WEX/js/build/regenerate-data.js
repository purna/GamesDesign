const fs = require('fs');
const PROJECT_ROOT = path.join(__dirname, '..', '..');
const path = require('path');

function readRoles(dir) {
  const files = fs.readdirSync(dir);
  return files.filter(f => f.endsWith('.json')).map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
}

function readCards(industryDir) {
  const cardsDir = path.join(industryDir, 'cards');
  const industryFiles = fs.readdirSync(industryDir);
  
  // If cards.json exists at industry level, use it exclusively (contains all cards)
  if (industryFiles.includes('cards.json')) {
    const arrayCards = JSON.parse(fs.readFileSync(path.join(industryDir, 'cards.json'), 'utf8'));
    if (arrayCards.length > 0) return arrayCards;
  }
  
  // Otherwise read individual files from cards subfolder
  if (fs.existsSync(cardsDir)) {
    const individualFiles = fs.readdirSync(cardsDir).filter(f => f.endsWith('.json') && f !== 'cards.json');
    return individualFiles.map(f => JSON.parse(fs.readFileSync(path.join(cardsDir, f), 'utf8')));
  }
  
  return [];
}

const industries2 = ['esports', 'game-design', 'games-development', 'animation', 'illustration', 'cyber-security', 'web-design', 'film-making'];

industries2.forEach(ind => {
  const industryDir = `${PROJECT_ROOT}/data/industries/${ind}`;
  const rolesDir = path.join(industryDir, 'roles');
  const cardsDir = path.join(industryDir, 'cards');
  const outDir = industryDir;
  
  const roles = fs.existsSync(rolesDir) ? readRoles(rolesDir) : [];
  const cards = readCards(industryDir);
  
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
  console.log(`Regenerated ${ind}/game-data.json with ${roles.length} roles and ${cards.length} cards`);
});

console.log('Done!');