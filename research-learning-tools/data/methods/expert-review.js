METHODS.push({
  "id": "expert-review",
  "title": "Expert review",
  "time": 45,
  "desc": "Inspect mock UI layouts in the full-screen modal inspector, place issue markers, beat the countdown timer, and triage bugs.",
  "task": "Inspect mock UI layouts in the full-screen modal inspector, place issue markers, beat the countdown timer, and triage bugs.",
  "labels": [
    "Interface and review criteria",
    "Issue log",
    "Priorities and proposed fixes"
  ],
  "hints": [
    "Try visibility of system status, consistency, and error prevention. Describe each in your own words.",
    "For each issue: location, principle, evidence and likely consequence. This is a practice review, not a claim of expertise.",
    "Rank issues by impact. Explain a fix and how a user test could check it."
  ],
  "examples": [
    "I will review the save-game menu for feedback, consistent labels and protection against accidental deletion.",
    "Delete button: error prevention. The menu deletes a save without confirmation. Likely consequence: a player can lose progress accidentally.",
    "High impact: add a confirmation and a recoverable delete. Test whether a player can cancel safely."
  ],
  "steps": [
    "Criteria",
    "Inspect",
    "Log issues",
    "Prioritise"
  ],
  "article": "How to Conduct a Heuristic Evaluation",
  "url": "https://www.nngroup.com/articles/how-to-conduct-a-heuristic-evaluation/",
  "summary": "Evaluators inspect a product against usability guidelines, work independently, and then consolidate issues. This can identify likely problems early, including in prototypes and games. The article explains why this complements research with users rather than replacing it.",
  "watch": "A reviewer’s predicted problem needs user evidence. Preference alone is not a usability principle.",
  "activity": "expert-review"
});
