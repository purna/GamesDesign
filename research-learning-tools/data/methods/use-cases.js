METHODS.push({
  "id": "use-cases",
  "title": "Use cases",
  "time": 50,
  "desc": "Learn the symbols, play three levels, write a use case, then draw it.",
  "task": "Learn the symbols, play three levels, write a use case, then draw it.",
  "labels": [
    "Actor, goal and preconditions",
    "Main success sequence",
    "Alternative flow and requirements"
  ],
  "hints": [
    "Name the user role, trigger, starting conditions and successful end state.",
    "Number alternating user actions and system responses. Keep this about behaviour, not visual styling.",
    "Include a full lobby or lost connection. Describe recovery and a testable requirement."
  ],
  "examples": [
    "Actor: signed-in player. Goal: join a friend. Precondition: friend is online. Trigger: player chooses the friend. End state: player is in the same lobby.",
    "1. Player selects friend. 2. System shows available lobby. 3. Player chooses Join. 4. System checks capacity. 5. System adds player and confirms success.",
    "At step 4, lobby is full. System explains the issue and offers Return to friends. Requirement: full lobbies must give a clear message and preserve the friends list."
  ],
  "steps": [
    "Actor + goal",
    "Actions",
    "System response",
    "Alternative"
  ],
  "article": "The impact of Use Cases in real-world software development projects: A systematic mapping study",
  "url": "https://arxiv.org/abs/1906.06754",
  "summary": "This research review maps reported benefits and problems of use cases in software projects. Benefits include estimation, analysis and automation. Problems include inconsistent formats and scenario detail. The authors also note possible bias toward publishing positive results.",
  "watch": "Use cases describe proposed requirements. Validate them with stakeholders and research rather than calling them observed behaviour.",
  "activity": "use-cases"
});
