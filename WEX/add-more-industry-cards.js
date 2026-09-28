const fs = require('fs');
const path = require('path');

// Additional industry-specific cards for cyber-security (8 more to reach 28)
const additionalCyberSecurity = [
  // Additional Placement cards
  { id: "setup-cs-placement-3", name: "Configure Monitoring Rules", type: "Setup", category: "Setup", description: "Create detection rules for SIEM: correlation searches, thresholds, and alert routing.", flavor: "Good rules reduce noise. Great rules catch attackers.", rarity: "Common", art: "⚙️", set: "placement", value: 1 },
  { id: "action-cs-placement-3", name: "Perform Log Analysis", type: "Action", category: "Action", description: "Deep-dive into logs to reconstruct attack timeline and identify root cause.", flavor: "Logs don't lie. But they do hide.", rarity: "Common", art: "📜", set: "placement", value: 1, skill: "Analysis" },
  { id: "proof-cs-placement-3", name: "Create Detection Rule Documentation", type: "Proof", category: "Proof", description: "Document new detection rules: logic, test cases, false positive rate, and maintenance notes.", flavor: "Undocumented rules are technical debt.", rarity: "Common", art: "📄", set: "placement", value: 1, skill: "Communication" },
  { id: "impact-cs-placement-3", name: "Detection Rule Deployed", type: "Impact", category: "Impact", description: "Your detection rule is in production and generating true positive alerts.", flavor: "Rule deployed. Attacker detected.", rarity: "Uncommon", art: "🎯", set: "placement", value: 1 },
  
  // Additional Partnership cards
  { id: "setup-cs-partner-2", name: "Threat Model Workshop", type: "Setup", category: "Setup", description: "Facilitate a threat modeling session with the partner: assets, threats, mitigations, and priorities.", flavor: "Threat model first. Controls second.", rarity: "Common", art: "🧠", set: "partnership", value: 1 },
  { id: "action-cs-partner-2", name: "Deliver Threat Model", type: "Action", category: "Action", description: "Produce a structured threat model document with data flow diagrams and risk ratings.", flavor: "A good threat model is a roadmap for defense.", rarity: "Uncommon", art: "🗺️", set: "partnership", value: 2 },
  { id: "proof-cs-partner-2", name: "Threat Model Review", type: "Proof", category: "Proof", description: "Present the threat model to stakeholders and incorporate feedback on risk ratings.", flavor: "Alignment on risk enables aligned defense.", rarity: "Common", art: "📋", set: "partnership", value: 1, skill: "Communication" },
  { id: "impact-cs-partner-2", name: "Risk Mitigated", type: "Impact", category: "Impact", description: "Partner implemented mitigations for high-risk threats identified in your model.", flavor: "Risk accepted, transferred, or mitigated.", rarity: "Uncommon", art: "🛡️", set: "partnership", value: 1 }
];

// Additional industry-specific cards for web-design (8 more)
const additionalWebDesign = [
  { id: "setup-wd-placement-3", name: "Set Up Design Token Pipeline", type: "Setup", category: "Setup", description: "Configure Style Dictionary or similar: tokens, build scripts, and platform outputs (iOS, Android, Web).", flavor: "Tokens are the single source of truth.", rarity: "Common", art: "🎯", set: "placement", value: 1 },
  { id: "action-wd-placement-3", name: "Build a Reusable Component", type: "Action", category: "Action", description: "Create a fully tested, documented, accessible component with variants and states.", flavor: "A component library is a product, not a project.", rarity: "Common", art: "🧩", set: "placement", value: 1, skill: "Technical Setup" },
  { id: "proof-wd-placement-3", name: "Component Documentation", type: "Proof", category: "Proof", description: "Write component docs: API, usage examples, accessibility notes, and migration guide.", flavor: "Undocumented components don't get adopted.", rarity: "Common", art: "📄", set: "placement", value: 1, skill: "Communication" },
  { id: "impact-wd-placement-3", name: "Component Adopted", type: "Impact", category: "Impact", description: "Your component is used across multiple pages/products. Document adoption metrics.", flavor: "Adoption proves utility.", rarity: "Uncommon", art: "📈", set: "placement", value: 1 },
  
  { id: "setup-wd-partner-2", name: "Design System Audit", type: "Setup", category: "Setup", description: "Audit partner's existing UI: inventory components, find inconsistencies, and prioritize standardization.", flavor: "Audit before you build. Measure before you cut.", rarity: "Common", art: "🔍", set: "partnership", value: 1 },
  { id: "action-wd-partner-2", name: "Deliver Design System Foundation", type: "Action", category: "Action", description: "Create tokens, core components, and documentation site for the partner's design system.", flavor: "Foundations first. Patterns later.", rarity: "Rare", art: "🏗️", set: "partnership", value: 2 },
  { id: "proof-wd-partner-2", name: "Design System Handoff", type: "Proof", category: "Proof", description: "Walk partner team through the system: tokens, components, contribution model, and governance.", flavor: "A system without governance is just a library.", rarity: "Common", art: "📋", set: "partnership", value: 1, skill: "Communication" },
  { id: "impact-wd-partner-2", name: "Design System Live", type: "Impact", category: "Impact", description: "Partner's products ship using the new design system. Measure consistency and velocity gains.", flavor: "Consistency scales. Velocity compounds.", rarity: "Uncommon", art: "🚀", set: "partnership", value: 1 }
];

// Additional industry-specific cards for film-making (8 more)
const additionalFilmMaking = [
  { id: "setup-fm-placement-3", name: "Set Up Project Template", type: "Setup", category: "Setup", description: "Create project template: bin structure, sequence settings, export presets, and keyboard shortcuts.", flavor: "Template once. Use forever.", rarity: "Common", art: "📐", set: "placement", value: 1 },
  { id: "action-fm-placement-3", name: "Create Motion Graphics Template", type: "Action", category: "Action", description: "Build a reusable MOGRT: lower thirds, titles, or transitions with editable controls.", flavor: "Templates save hours on every episode.", rarity: "Common", art: "🎨", set: "placement", value: 1, skill: "Technical Setup" },
  { id: "proof-fm-placement-3", name: "Template Documentation", type: "Proof", category: "Proof", description: "Document the MOGRT: controls, use cases, font requirements, and version history.", flavor: "A template without docs is a mystery box.", rarity: "Common", art: "📄", set: "placement", value: 1, skill: "Communication" },
  { id: "impact-fm-placement-3", name: "Template Adopted", type: "Impact", category: "Impact", description: "Your MOGRT is used across the production. Document time saved per episode.", flavor: "Standardization scales creativity.", rarity: "Uncommon", art: "📈", set: "placement", value: 1 },
  
  { id: "setup-fm-partner-2", name: "Trailer Strategy Session", type: "Setup", category: "Setup", description: "Align with partner on trailer goals: audience, tone, key beats, platform specs, and approval chain.", flavor: "A trailer is a promise. Keep it.", rarity: "Common", art: "🎯", set: "partnership", value: 1 },
  { id: "action-fm-partner-2", name: "Cut the Trailer", type: "Action", category: "Action", description: "Edit the trailer: select beats, pace to music, add graphics, and iterate on feedback.", flavor: "Two minutes. Maximum impact.", rarity: "Rare", art: "🎬", set: "partnership", value: 2 },
  { id: "proof-fm-partner-2", name: "Trailer Review Deck", type: "Proof", category: "Proof", description: "Present trailer versions with rationale: structure, music choices, pacing, and test screening data.", flavor: "Data defends creative choices.", rarity: "Common", art: "📋", set: "partnership", value: 1, skill: "Communication" },
  { id: "impact-fm-partner-2", name: "Trailer Released", type: "Impact", category: "Impact", description: "Partner's trailer launches: track views, engagement, and conversion to ticket sales/streams.", flavor: "The trailer sold the show.", rarity: "Uncommon", art: "📈", set: "partnership", value: 1 }
];

// Write additional cards
function writeAdditionalCards(industryId, cards) {
  const cardsDir = `/Users/nigelmorris/Documents/GitHub/GamesDesign/WEX/data/industries/${industryId}/cards`;
  cards.forEach(card => {
    fs.writeFileSync(path.join(cardsDir, `${card.id}.json`), JSON.stringify(card, null, 2));
  });
  console.log(`Wrote ${cards.length} additional cards to ${industryId}/cards/`);
}

writeAdditionalCards('cyber-security', additionalCyberSecurity);
writeAdditionalCards('web-design', additionalWebDesign);
writeAdditionalCards('film-making', additionalFilmMaking);

console.log('Done! Additional industry cards created.');