// Synced from Activity_07_Expert_Review_Lab__UI_Audit_Triage.html; run tools/sync-research.py to refresh.
window.RESEARCH_TASK_CONTENT["expert-review"] = function(){

const CFG = {
  pfx:"research-v3-expert-review-",
  file: "expert-review-lab",
  title: "Expert Review Lab: UI Audit & Triage",
  kicker: "UI AUDIT & HEURISTIC EVALUATION · 45 MIN",
  sub: "Inspect mock UI layouts in the full-screen modal inspector, place issue markers, beat the countdown timer, and triage bugs.",
  version: 1
};

const APP_TABS = [
  {title:"Learn", icon:"book-open", fb:"📖", widget:"learn", intro:"An Expert Review (Heuristic Evaluation) is a usability inspection method where UX experts check interfaces against recognized principles (heuristics) like visibility, consistency, error prevention, and accessibility.", fields:[
    {k:"review_notes", label:"Key goals of an expert review", hint:"Summarize why expert reviews are effective.", rows:3, starters:["Expert reviews help us spot...","We evaluate against heuristics such as...","Prioritizing issues ensures the team..."]}
  ]},
  {title:"Audit Inspector", icon:"magnifying-glass", fb:"🔍", widget:"audit_hub", intro:"Launch the Full-Screen Layout Inspector to examine flawed app screens. Click anywhere on the screens to place bug markers, identify issue categories, and assign severity against the clock!", fields:[]},
  {title:"Issue Triage Log", icon:"list-check", fb:"📋", widget:"triage", intro:"Review all logged findings from your audit sessions. Triage issues by importance, urgency, and assign team owners.", fields:[]},
  {title:"Findings & Report", icon:"pen", fb:"✎", intro:"Summarize your expert review findings and formulate key recommendations for the product team.", fields:[
    {k:"eval_title", label:"Audit Report Title", hint:"e.g., Mobile Checkout & Dashboard Heuristic Audit"},
    {k:"summary", label:"Executive Summary", hint:"Overall assessment of the app usability and accessibility compliance.", rows:3, starters:["The application currently exhibits...","The most critical vulnerabilities involve...","With targeted remediation..."]},
    {k:"top_rec", label:"Top Priority Action", hint:"What is the single most urgent recommendation?", rows:3, starters:["We recommend immediate redesign of...","To meet WCAG standards, the team must...","The primary friction point to eliminate is..."]}
  ]}
];

const REFLECT = {title:"Reflect", icon:"comments", fb:"💬", reflect:true,
  intro:"What? So What? Now What? Three questions, one next step. Write one to three sentences for each.",
  cite:"Based on Borton, T. (1970) Reach, Touch and Teach; developed by Rolfe, Freshwater and Jasper (2001).",
  fields:[
    {k:"ref_what",   cls:"",   label:"WHAT? Describe it",      hint:"What happened? Facts only: what did you do, see, hear or make? Start with: I noticed...", rows:4, starters:["I noticed that...", "First I...", "The part I spent most time on was...", "Someone told me...", "What I made or wrote was..."]},
    {k:"ref_sowhat", cls:"sw", label:"SO WHAT? Make sense of it", hint:"Why does it matter? What did you learn, find hard or find surprising? Start with: This matters because...", rows:4, starters:["This matters because...", "I found it hard to...", "I was surprised that...", "This shows me that...", "The evidence for this is..."]},
    {k:"ref_nowwhat",cls:"nw", label:"NOW WHAT? Act on it",    hint:"What will you do next? One clear action. Start with: Next I will...", rows:4, starters:["Next I will...", "To fix this I will...", "My first step is...", "I will ask for feedback on...", "By the next lesson I will have..."]}]};

const TABS = APP_TABS.concat(REFLECT);


return {CFG,APP_TABS,REFLECT,TABS};
};
