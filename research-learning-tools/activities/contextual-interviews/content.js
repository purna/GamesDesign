// Synced from Activity_11_Contextual_Interviews_-_Study_Session.html; run tools/sync-research.py to refresh.
window.RESEARCH_TASK_CONTENT["contextual-interviews"] = function(){

/* =============================================================================
   1. CONFIG + CONTENT.  This is the ONLY section a new app should need to edit.
   ============================================================================= */
/* =============================================================================
   1. CONFIG + CONTENT.  Method lesson: Contextual interviews (contextual-interviews)
   Content sourced from research-learning-tools/data/methods/contextual-interviews.js
   ============================================================================= */
const CFG = {pfx:"research-v3-contextual-interviews-",file:"contextual-interviews-lab",title:"Contextual Interviews: Study Session",kicker:"RESEARCH METHODS · CONTEXTUAL INTERVIEWS · 60 MIN",sub:"Observe a peer in their usual setting, then ask about a moment you actually saw.",version:1};
const APP_TABS = [
  {title:"Tutorial",icon:"circle-play",fb:"▶",widget:"tutorial",intro:"Follow the method in four steps, with a worked example and the key reading. About two minutes.",fields:[]},
  {title:"Learn",icon:"book-open",fb:"📖",widget:"learn",intro:"Read the key idea, then explain it in your own words.",fields:[
    {k:"own_def",label:"Contextual interviews in your own words",hint:"One or two sentences. Start with: Contextual inquiry is...",rows:3,starters:["Contextual inquiry is...","The setting matters because...","I ask about..."]}]},
  {title:"Setting and consent",icon:"video",fb:"📹",intro:"Observe in the person's usual environment, with agreed boundaries.",fields:[
    {"k":"ci_setting","label":"Setting and goal","hint":"Example: P1 will show how they find tutorial help on a laptop during independent study.","rows":3,"starters":["The setting is...","The goal is..."]},
    {"k":"ci_consent","label":"Consent and boundaries","hint":"Agree what you may observe. Avoid private accounts, messages or personal information. They can stop at any time.","rows":3,"starters":["We agreed...","Out of bounds:..."]}
  ]},
  {title:"Observed moment",icon:"eye",fb:"👁️",intro:"Record the action first, then ask about a moment you saw.",fields:[
    {"k":"ci_obs","label":"What you saw","hint":"First record the action. Example: P1 moved between the game and a browser.","rows":4,"starters":["I saw...","P1 moved..."]},
    {"k":"ci_ask","label":"Follow-up and answer","hint":"Ask “I noticed… can you explain what was happening?” Example: What were you looking for? Paraphrase: they needed a controls reference.","rows":4,"starters":["I noticed...","They explained..."]}
  ]},
  {title:"Need and implication",icon:"puzzle-piece",fb:"🧩",intro:"Interpret together, then state the design implication.",fields:[
    {"k":"ci_need","label":"Contextual need","hint":"How did the device, interruptions or environment affect the task?","rows":3,"starters":["The need is...","The environment..."]},
    {"k":"ci_impl","label":"Design implication","hint":"Example: a controls overlay could reduce window switching. Say what you still need to observe.","rows":3,"starters":["The implication is...","I still need to observe..."]}
  ]},
  {title:"Sort the practice",icon:"sort",fb:"🗂️",widget:"game",intro:"Ten statements. Sort each into good research practice or a risky shortcut. The sorter explains every answer.",fields:[{k:"gm",hidden:true}]}
];
/* REFLECT-1: the standard exit task. Appended to every app. Do not edit the
   wording, order or colours: they mirror the presentation template.
   cls picks the card colour: "" cyan (What), "sw" pink (So What), "nw" lime (Now What). */
const REFLECT = {title:"Reflect", icon:"comments", fb:"💬", reflect:true,
  intro:"What? So What? Now What? Three questions, one next step. Write one to three sentences for each.",
  cite:"Based on Borton, T. (1970) Reach, Touch and Teach; developed by Rolfe, Freshwater and Jasper (2001).",
  fields:[
    {k:"ref_what",   cls:"",   label:"WHAT? Describe it",      hint:"What happened? Facts only: what did you do, see, hear or make? Start with: I noticed...", rows:4, starters:["I noticed that...", "First I...", "The part I spent most time on was...", "Someone told me...", "What I made or wrote was..."]},
    {k:"ref_sowhat", cls:"sw", label:"SO WHAT? Make sense of it", hint:"Why does it matter? What did you learn, find hard or find surprising? Start with: This matters because...", rows:4, starters:["This matters because...", "I found it hard to...", "I was surprised that...", "This shows me that...", "The evidence for this is..."]},
    {k:"ref_nowwhat",cls:"nw", label:"NOW WHAT? Act on it",    hint:"What will you do next? One clear action. Start with: Next I will...", rows:4, starters:["Next I will...", "To fix this I will...", "My first step is...", "I will ask for feedback on...", "By the next lesson I will have..."]}]};
const TABS = APP_TABS.concat(REFLECT);

/* =============================================================================
   2. CORE HELPERS
   ============================================================================= */

return {CFG,APP_TABS,REFLECT,TABS};
};
