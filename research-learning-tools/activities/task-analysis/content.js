// Synced from Activity_02_Task_Analysis_-_Join_A_Match.html; run tools/sync-research.py to refresh.
window.RESEARCH_TASK_CONTENT["task-analysis"] = function(){

/* =============================================================================
   1. CONFIG + CONTENT.  This is the ONLY section a new app should need to edit.
   ============================================================================= */
/* =============================================================================
   1. CONFIG + CONTENT.  Method lesson: Task analysis (task-analysis)
   Content sourced from research-learning-tools/data/methods/task-analysis.js
   ============================================================================= */
const CFG = {pfx:"research-v3-task-analysis-",file:"task-analysis-lab",title:"Task Analysis: Join a Match",kicker:"RESEARCH METHODS · TASK ANALYSIS · 60 MIN",sub:"Watch a partner achieve a real goal and map what actually happens, step by step.",version:1};
const APP_TABS = [
  {title:"Tutorial",icon:"circle-play",fb:"▶",widget:"tutorial",intro:"Follow the method in four steps, with a worked example and the key reading. About two minutes.",fields:[]},
  {title:"Learn",icon:"book-open",fb:"📖",widget:"learn",intro:"Read the key idea, then explain it in your own words.",fields:[
    {k:"own_def",label:"Task analysis in your own words",hint:"One or two sentences. Start with: Task analysis is...",rows:3,starters:["Task analysis is...","The map shows...","Observation beats expectation..."]}]},
  {title:"Goal and plan",icon:"bullseye",fb:"🎯",intro:"Name the outcome, then plan how you will observe it.",fields:[
    {"k":"ta_goal","label":"The user's outcome","hint":"Describe the outcome, rather than a button press. Example: the player wants to join a match with a friend.","rows":3,"starters":["The player wants...","The goal is..."]},
    {"k":"ta_plan","label":"Observation plan","hint":"Ask permission before observing. State where you will watch from and what you will note.","rows":3,"starters":["I will observe...","I will note...","I asked permission and..."]}
  ]},
  {title:"Observed steps",icon:"list-ol",fb:"🔢",intro:"Watch the task happen. Number each step and keep facts separate from guesses.",fields:[
    {"k":"ta_steps","label":"Number the steps you saw","hint":"Number each step in order. Example: 1. Opens game. 2. Looks for friends list. 3. Opens profile instead.","rows":6,"starters":["1. ...","2. ...","3. ..."]},
    {"k":"ta_split","label":"What you saw vs what you think","hint":"Separate observation from interpretation. Observation: pauses for 12 seconds. Interpretation: the friends label may be unclear.","rows":4,"starters":["Observation:...","Interpretation:..."]}
  ]},
  {title:"Improved task map",icon:"map",fb:"🗺️",intro:"Choose one step to simplify and state the evidence for the change.",fields:[
    {"k":"ta_change","label":"One step to simplify","hint":"Which step could be simplified? Example: put “Play with friends” on the home screen.","rows":3,"starters":["I would simplify...","The weakest step is..."]},
    {"k":"ta_evidence","label":"Evidence for the change","hint":"Explain the evidence for your change. Example: the player searched in two places.","rows":3,"starters":["The evidence is...","I noticed..."]}
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
