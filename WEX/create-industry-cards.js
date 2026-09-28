const fs = require('fs');
const path = require('path');

// Industry-specific cards for cyber-security (28 cards)
const cyberSecurityCards = [
  // Placement (8 cards: 2 Setup, 2 Action, 2 Proof, 2 Impact)
  { id: "setup-cs-placement-details", name: "Confirm Placement Details", type: "Setup", category: "Setup", description: "Agree tasks, dates, and hours with the security team; confirm your mentor and system access.", flavor: "Access granted. Trust earned.", rarity: "Common", art: "📋", set: "placement", value: 1 },
  { id: "setup-cs-placement-onboarding", name: "Complete Security Onboarding", type: "Setup", category: "Setup", description: "Set up SIEM access, configure lab environment, and review security policies.", flavor: "Know the environment before you defend it.", rarity: "Common", art: "🔐", set: "placement", value: 1 },
  { id: "action-cs-complete-placement", name: "Investigate Security Alerts", type: "Action", category: "Action", description: "Triage alerts, analyze logs, and determine false positives vs real incidents.", flavor: "Signal hides in noise. Find it.", rarity: "Common", art: "🔍", set: "placement", value: 1, skill: "Analysis" },
  { id: "action-cs-placement-2", name: "Run Vulnerability Scans", type: "Action", category: "Action", description: "Execute authenticated and unauthenticated scans, validate findings, and prioritize remediation.", flavor: "Scanners find vulns. Analysts find risk.", rarity: "Common", art: "📊", set: "placement", value: 1, skill: "Technical Setup" },
  { id: "proof-cs-log-placement-hours", name: "Log Security Hours & Reflection", type: "Proof", category: "Proof", description: "Record hours and reflect on alerts investigated, tools learned, and incidents handled.", flavor: "Every investigation teaches a new pattern.", rarity: "Common", art: "📝", set: "placement", value: 1, skill: "Reliability" },
  { id: "proof-cs-placement-reflection", name: "Incident Reflection", type: "Proof", category: "Proof", description: "Write a reflection on an incident you worked: detection, response, and lessons learned.", flavor: "Post-incident reviews prevent repeat incidents.", rarity: "Common", art: "📄", set: "placement", value: 1, skill: "Analysis" },
  { id: "impact-cs-placement-showcase", name: "Incident Resolved", type: "Impact", category: "Impact", description: "You helped resolve a real security incident. Document the impact and your contribution.", flavor: "Stopped the breach. Protected the data.", rarity: "Uncommon", art: "✅", set: "placement", value: 1 },
  { id: "impact-cs-measure-contribution", name: "Measure Security Impact", type: "Impact", category: "Impact", description: "Explain how your work improved detection coverage, response time, or security posture.", flavor: "Metrics make security visible.", rarity: "Uncommon", art: "📈", set: "placement", value: 1 },

  // Visit (2 cards: 1 Setup, 1 Action)
  { id: "setup-cs-book-visit", name: "Book SOC Visit", type: "Setup", category: "Setup", description: "Arrange a visit to a Security Operations Center. Confirm date, NDA, and tour agenda.", flavor: "See where the alerts come alive.", rarity: "Common", art: "🎫", set: "visit", value: 1 },
  { id: "action-cs-attend-visit", name: "Attend SOC Shift Shadow", type: "Action", category: "Action", description: "Shadow an analyst through a shift: alert triage, escalation, and handoff procedures.", flavor: "Watch how pros separate signal from noise.", rarity: "Common", art: "👁️", set: "visit", value: 1 },

  // Volunteering (3 cards: 1 Setup, 1 Action, 1 Proof)
  { id: "setup-cs-find-volunteer", name: "Find CTF Volunteer Role", type: "Setup", category: "Setup", description: "Join a Capture The Flag event or security competition as a volunteer or participant.", flavor: "CTFs are the gym for security skills.", rarity: "Common", art: "🤝", set: "volunteering", value: 1 },
  { id: "action-cs-volunteer-tournament", name: "Compete in a CTF", type: "Action", category: "Action", description: "Solve challenges in web exploitation, reverse engineering, crypto, or forensics.", flavor: "Break it to learn how to fix it.", rarity: "Common", art: "🏁", set: "volunteering", value: 1 },
  { id: "proof-cs-volunteer-feedback", name: "CTF Write-up", type: "Proof", category: "Proof", description: "Document your solution path, tools used, and what you learned from each challenge.", flavor: "A write-up proves you understand, not just solved.", rarity: "Common", art: "📝", set: "volunteering", value: 1, skill: "Communication" },

  // Brief (3 cards: 1 Setup, 1 Action, 1 Proof)
  { id: "setup-cs-review-brief", name: "Understand the Security Brief", type: "Setup", category: "Setup", description: "Clarify the scope: target systems, rules of engagement, reporting format, and timeline.", flavor: "Scope creep in security causes real damage.", rarity: "Common", art: "📋", set: "brief", value: 1 },
  { id: "action-cs-deliver-brief", name: "Complete Vulnerability Assessment", type: "Action", category: "Action", description: "Run scans, manually verify findings, and produce a prioritized remediation report.", flavor: "A scanner finds vulns. An analyst finds risk.", rarity: "Uncommon", art: "📊", set: "brief", value: 2 },
  { id: "proof-cs-document-brief-learnings", name: "Document Assessment Learnings", type: "Proof", category: "Proof", description: "Write a post-assessment review: methodology, findings, false positives, and improvements.", flavor: "Every assessment sharpens your methodology.", rarity: "Common", art: "📓", set: "brief", value: 1, skill: "Communication" },

  // Partnership (4 cards: 1 Setup, 1 Action, 1 Proof, 1 Impact)
  { id: "setup-cs-partner-expectations", name: "Partner Security Requirements", type: "Setup", category: "Setup", description: "Agree on deliverables with an industry partner: pentest, code review, or security architecture.", flavor: "Partners need trust, not just tools.", rarity: "Common", art: "🤝", set: "partnership", value: 1 },
  { id: "action-cs-complete-partner", name: "Complete Partner Security Project", type: "Action", category: "Action", description: "Execute the agreed security engagement: pentest, secure code review, or threat model.", flavor: "Professional scope. Professional results.", rarity: "Rare", art: "✨", set: "partnership", value: 2 },
  { id: "proof-cs-showcase-partner-work", name: "Showcase Partner Security Work", type: "Proof", category: "Proof", description: "Present your partner engagement with scope, findings, and remediation guidance.", flavor: "Show the risk, not just the vulnerability.", rarity: "Uncommon", art: "🖼️", set: "partnership", value: 2, skill: "Communication" },
  { id: "impact-cs-partner-feedback", name: "Partner Security Improved", type: "Impact", category: "Impact", description: "Your work led to measurable security improvements in the partner's environment.", flavor: "Fixed in production. Verified in staging.", rarity: "Uncommon", art: "📈", set: "partnership", value: 1 }
];

// Industry-specific cards for web-design (28 cards)
const webDesignCards = [
  // Placement (8 cards)
  { id: "setup-wd-placement-details", name: "Confirm Placement Details", type: "Setup", category: "Setup", description: "Agree tasks, dates, and hours with the design/dev team; confirm your mentor and repo access.", flavor: "Clear handoffs prevent broken builds.", rarity: "Common", art: "📋", set: "placement", value: 1 },
  { id: "setup-wd-placement-onboarding", name: "Complete Web Design Onboarding", type: "Setup", category: "Setup", description: "Set up Figma, Storybook, and the component library. Review the design system documentation.", flavor: "Know the system before you extend it.", rarity: "Common", art: "🎨", set: "placement", value: 1 },
  { id: "action-wd-complete-placement", name: "Build a Production Feature", type: "Action", category: "Action", description: "Design and implement a UI feature: component, page, or flow. Follow the design system.", flavor: "Design in Figma. Ship in code.", rarity: "Common", art: "⚛️", set: "placement", value: 1, skill: "Design" },
  { id: "action-wd-placement-2", name: "Improve Accessibility", type: "Action", category: "Action", description: "Audit and fix WCAG violations: color contrast, keyboard navigation, ARIA labels, focus management.", flavor: "Accessible design is better design.", rarity: "Common", art: "♿", set: "placement", value: 1, skill: "Technical Setup" },
  { id: "proof-wd-log-placement-hours", name: "Log Web Design Hours & Reflection", type: "Proof", category: "Proof", description: "Record hours and reflect on components built, design decisions, and cross-browser testing.", flavor: "Every component teaches a new constraint.", rarity: "Common", art: "📝", set: "placement", value: 1, skill: "Reliability" },
  { id: "proof-wd-placement-reflection", name: "Feature Reflection", type: "Proof", category: "Proof", description: "Write a reflection on the feature: user feedback, accessibility audit, and performance metrics.", flavor: "Reflection turns features into craft.", rarity: "Common", art: "📄", set: "placement", value: 1, skill: "Analysis" },
  { id: "impact-wd-placement-showcase", name: "Feature Live in Production", type: "Impact", category: "Impact", description: "Your feature is live. Document the user-facing result and any metrics (conversion, engagement).", flavor: "Live is the only environment that matters.", rarity: "Uncommon", art: "🚀", set: "placement", value: 1 },
  { id: "impact-wd-measure-contribution", name: "Measure UX Impact", type: "Impact", category: "Impact", description: "Explain how your work improved usability, accessibility, performance, or conversion.", flavor: "Good UX shows in the numbers.", rarity: "Uncommon", art: "📈", set: "placement", value: 1 },

  // Visit (2 cards)
  { id: "setup-wd-book-visit", name: "Book Design Team Visit", type: "Setup", category: "Setup", description: "Arrange a visit to a product design team. Confirm date, NDA, and design critique invitation.", flavor: "See how design decisions happen at scale.", rarity: "Common", art: "🎫", set: "visit", value: 1 },
  { id: "action-wd-attend-visit", name: "Attend Design Critique", type: "Action", category: "Action", description: "Sit in on a design review, usability test, or design system office hours.", flavor: "Watch how feedback shapes the product.", rarity: "Common", art: "👁️", set: "visit", value: 1 },

  // Volunteering (3 cards)
  { id: "setup-wd-find-volunteer", name: "Find Nonprofit Web Project", type: "Setup", category: "Setup", description: "Join a volunteer project building a website for a nonprofit or community group.", flavor: "Real users. Real constraints. Real impact.", rarity: "Common", art: "🤝", set: "volunteering", value: 1 },
  { id: "action-wd-volunteer-tournament", name: "Build a Volunteer Website", type: "Action", category: "Action", description: "Design and build a responsive site: IA, wireframes, UI, and frontend implementation.", flavor: "Constraints breed creative solutions.", rarity: "Common", art: "🌐", set: "volunteering", value: 1 },
  { id: "proof-wd-volunteer-feedback", name: "Volunteer Project Feedback", type: "Proof", category: "Proof", description: "Collect feedback from the nonprofit on usability, maintenance, and goal achievement.", flavor: "Client feedback is the ultimate test.", rarity: "Common", art: "🗣️", set: "volunteering", value: 1, skill: "Teamwork" },

  // Brief (3 cards)
  { id: "setup-wd-review-brief", name: "Understand the Web Brief", type: "Setup", category: "Setup", description: "Clarify the brief: target audience, key journeys, tech stack, accessibility requirements, deadline.", flavor: "A brief understood prevents rework.", rarity: "Common", art: "📋", set: "brief", value: 1 },
  { id: "action-wd-deliver-brief", name: "Deliver Web Project", type: "Action", category: "Action", description: "Design and build the project: responsive pages, components, CMS integration, and QA.", flavor: "Responsive by default. Accessible by design.", rarity: "Uncommon", art: "🖥️", set: "brief", value: 2 },
  { id: "proof-wd-document-brief-learnings", name: "Document Web Project Learnings", type: "Proof", category: "Proof", description: "Write a case study: problem, user research, design iterations, tech choices, and results.", flavor: "Case studies get you hired.", rarity: "Common", art: "📓", set: "brief", value: 1, skill: "Communication" },

  // Partnership (4 cards)
  { id: "setup-wd-partner-expectations", name: "Partner Web Requirements", type: "Setup", category: "Setup", description: "Agree on deliverables with an industry partner: design system audit, component library, or migration.", flavor: "Partners want maintainable, scalable solutions.", rarity: "Common", art: "🤝", set: "partnership", value: 1 },
  { id: "action-wd-complete-partner", name: "Complete Partner Web Project", type: "Action", category: "Action", description: "Deliver the agreed web project: accessible components, documented APIs, and deployment guide.", flavor: "Professional code. Professional docs.", rarity: "Rare", art: "✨", set: "partnership", value: 2 },
  { id: "proof-wd-showcase-partner-work", name: "Showcase Partner Web Work", type: "Proof", category: "Proof", description: "Present your partner project: requirements, design process, technical implementation, and outcomes.", flavor: "Show the system, not just the screens.", rarity: "Uncommon", art: "🖼️", set: "partnership", value: 2, skill: "Communication" },
  { id: "impact-wd-partner-feedback", name: "Partner Site Improved", type: "Impact", category: "Impact", description: "Your work improved the partner's site: performance, accessibility, conversion, or developer velocity.", flavor: "Lighthouse scores don't lie.", rarity: "Uncommon", art: "📈", set: "partnership", value: 1 }
];

// Industry-specific cards for film-making (28 cards)
const filmMakingCards = [
  // Placement (8 cards)
  { id: "setup-fm-placement-details", name: "Confirm Placement Details", type: "Setup", category: "Setup", description: "Agree tasks, dates, and hours with the production company; confirm your supervisor and call sheets.", flavor: "Call time is sacred. Be ready.", rarity: "Common", art: "📋", set: "placement", value: 1 },
  { id: "setup-fm-placement-onboarding", name: "Complete Production Onboarding", type: "Setup", category: "Setup", description: "Learn the workflow: NLE setup, media management, naming conventions, and backup protocols.", flavor: "Organization is the editor's superpower.", rarity: "Common", art: "🎞️", set: "placement", value: 1 },
  { id: "action-fm-complete-placement", name: "Edit a Production Sequence", type: "Action", category: "Action", description: "Cut a scene, segment, or sequence: assemble, rough cut, fine cut, and deliver for review.", flavor: "Editing is rewriting with footage.", rarity: "Common", art: "✂️", set: "placement", value: 1, skill: "Technical Setup" },
  { id: "action-fm-placement-2", name: "Sync and Organize Dailies", type: "Action", category: "Action", description: "Sync audio to picture, organize bins, create stringouts, and prep for the editor.", flavor: "Dailies done right save weeks later.", rarity: "Common", art: "🎬", set: "placement", value: 1, skill: "Technical Setup" },
  { id: "proof-fm-log-placement-hours", name: "Log Edit Hours & Reflection", type: "Proof", category: "Proof", description: "Record hours and reflect on creative choices, director feedback, and technical problem-solving.", flavor: "Every cut is a decision. Every revision is growth.", rarity: "Common", art: "📝", set: "placement", value: 1, skill: "Reliability" },
  { id: "proof-fm-placement-reflection", name: "Sequence Reflection", type: "Proof", category: "Proof", description: "Write a reflection on the edit: pacing, storytelling, sound design, and lessons learned.", flavor: "The best edit serves the story.", rarity: "Common", art: "📄", set: "placement", value: 1, skill: "Analysis" },
  { id: "impact-fm-placement-showcase", name: "Sequence in Final Cut", type: "Impact", category: "Impact", description: "Your edited sequence appears in the final deliverable. Document the context and your contribution.", flavor: "Your cut made the final cut.", rarity: "Uncommon", art: "🎬", set: "placement", value: 1 },
  { id: "impact-fm-measure-contribution", name: "Measure Creative Impact", type: "Impact", category: "Impact", description: "Explain how your editing elevated the narrative, pacing, or emotional resonance.", flavor: "Invisible edits make the best stories.", rarity: "Uncommon", art: "📈", set: "placement", value: 1 },

  // Visit (2 cards)
  { id: "setup-fm-book-visit", name: "Book Post House Visit", type: "Setup", category: "Setup", description: "Arrange a visit to a post-production facility. Confirm date, NDA, and suite access.", flavor: "See where the magic gets polished.", rarity: "Common", art: "🎫", set: "visit", value: 1 },
  { id: "action-fm-attend-visit", name: "Attend Color Grade / Mix Session", type: "Action", category: "Action", description: "Sit in on a color grading session, sound mix, or online conform review.", flavor: "Color and sound are the final rewrite.", rarity: "Common", art: "👁️", set: "visit", value: 1 },

  // Volunteering (3 cards)
  { id: "setup-fm-find-volunteer", name: "Find Film Festival Volunteer", type: "Setup", category: "Setup", description: "Volunteer at a film festival: projection, guest services, or filmmaker hospitality.", flavor: "Festivals run on volunteer passion.", rarity: "Common", art: "🤝", set: "volunteering", value: 1 },
  { id: "action-fm-volunteer-tournament", name: "Crew a Short Film", type: "Action", category: "Action", description: "Work on a student/indie short: camera, sound, grip, or post. Experience the full pipeline.", flavor: "Small crew. Big lessons.", rarity: "Common", art: "🎥", set: "volunteering", value: 1 },
  { id: "proof-fm-volunteer-feedback", name: "Short Film Feedback", type: "Proof", category: "Proof", description: "Collect feedback from the director/producer on your contribution to the production.", flavor: "Set etiquette matters as much as skill.", rarity: "Common", art: "🗣️", set: "volunteering", value: 1, skill: "Teamwork" },

  // Brief (3 cards)
  { id: "setup-fm-review-brief", name: "Understand the Film Brief", type: "Setup", category: "Setup", description: "Clarify the brief: genre, tone, runtime, deliverables (festival DCP, broadcast, social cuts), deadline.", flavor: "Deliverables define the workflow.", rarity: "Common", art: "📋", set: "brief", value: 1 },
  { id: "action-fm-deliver-brief", name: "Deliver Film Project", type: "Action", category: "Action", description: "Edit the project from assembly to picture lock. Handle notes, conform, and export deliverables.", flavor: "Picture lock is a milestone, not the finish.", rarity: "Uncommon", art: "🎞️", set: "brief", value: 2 },
  { id: "proof-fm-document-brief-learnings", name: "Document Film Project Learnings", type: "Proof", category: "Proof", description: "Write a post-mortem: creative challenges, technical workflow, collaboration, and festival strategy.", flavor: "Every film teaches a new workflow.", rarity: "Common", art: "📓", set: "brief", value: 1, skill: "Communication" },

  // Partnership (4 cards)
  { id: "setup-fm-partner-expectations", name: "Partner Production Requirements", type: "Setup", category: "Setup", description: "Agree on deliverables with an industry partner: trailer, sizzle reel, or episodic editing.", flavor: "Partners need storytellers who hit deadlines.", rarity: "Common", art: "🤝", set: "partnership", value: 1 },
  { id: "action-fm-complete-partner", name: "Complete Partner Film Project", type: "Action", category: "Action", description: "Deliver the partner project: creative edit, sound design, color, and final exports per spec.", flavor: "Broadcast standards. Festival deadlines.", rarity: "Rare", art: "✨", set: "partnership", value: 2 },
  { id: "proof-fm-showcase-partner-work", name: "Showcase Partner Film Work", type: "Proof", category: "Proof", description: "Present your partner work: brief, rough cut evolution, director collaboration, and final deliverable.", flavor: "Show the journey from assembly to answer print.", rarity: "Uncommon", art: "🖼️", set: "partnership", value: 2, skill: "Communication" },
  { id: "impact-fm-partner-feedback", name: "Partner Film Released", type: "Impact", category: "Impact", description: "Your edit was released: festival selection, broadcast, or client approval. Document the outcome.", flavor: "Screened. Selected. Seen.", rarity: "Uncommon", art: "📈", set: "partnership", value: 1 }
];

// Write industry-specific cards to individual files in cards/ subfolder
function writeIndustryCards(industryId, cards) {
  const cardsDir = `/Users/nigelmorris/Documents/GitHub/GamesDesign/WEX/data/industries/${industryId}/cards`;
  if (!fs.existsSync(cardsDir)) fs.mkdirSync(cardsDir, { recursive: true });
  
  cards.forEach(card => {
    fs.writeFileSync(path.join(cardsDir, `${card.id}.json`), JSON.stringify(card, null, 2));
  });
  console.log(`Wrote ${cards.length} industry cards to ${industryId}/cards/`);
}

// Write cards for all three new industries
writeIndustryCards('cyber-security', cyberSecurityCards);
writeIndustryCards('web-design', webDesignCards);
writeIndustryCards('film-making', filmMakingCards);

console.log('Done! Industry-specific cards created.');