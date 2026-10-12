// Synced from Activity_12_Usability_Testing_Lab__Practice_Session.html; run tools/sync-research.py to refresh.
window.RESEARCH_TASK_CONTENT["usability-testing"] = function(){

/* =============================================================================
   1. CONFIG + CONTENT.  This is the ONLY section a new app should need to edit.
   ============================================================================= */
/* =============================================================================
   1. CONFIG + CONTENT.  Method lesson: Usability testing (usability-testing)
   Content sourced from research-learning-tools/data/methods/usability-testing.js
   ============================================================================= */
const CFG = {pfx:"research-v3-usability-testing-",file:"usability-testing-lab",title:"Usability Testing Lab: Practice Session",kicker:"RESEARCH METHODS · USABILITY TESTING · 75 MIN",sub:"Test one important task in a prototype, record behaviour, then improve the design.",version:1};
const APP_TABS = [
  {title:"Tutorial",icon:"circle-play",fb:"▶",widget:"tutorial",intro:"Follow the method in four steps, with a worked example and the key reading. About two minutes.",fields:[]},
  {title:"Learn",icon:"book-open",fb:"📖",widget:"learn",intro:"Read the key idea, then explain it in your own words.",fields:[
    {k:"own_def",label:"Usability testing in your own words",hint:"One or two sentences. Start with: Usability testing is...",rows:3,starters:["Usability testing is...","Think-aloud helps because...","The fix must follow..."]}]},
  {title:"Task and participants",icon:"tasks",fb:"📋",intro:"Write one realistic task and a success measure.",fields:[
    {"k":"ut_task","label":"The task","hint":"Write a realistic goal without instructions for using the interface. Example: start a beginner practice session.","rows":3,"starters":["The task is..."]},
    {"k":"ut_success","label":"Success measure and participants","hint":"Define success before testing. Example: reaches practice without researcher help. P1 is new to this game.","rows":3,"starters":["Success means...","P1 is..."]}
  ]},
  {title:"Observation log",icon:"clipboard",fb:"📝",intro:"Ask the participant to think aloud while you watch.",fields:[
    {"k":"ut_log","label":"Behaviour log","hint":"Record completion, hesitation, errors and help given. Example: P1 opened “Play”, returned to Home, then found “Training”.","rows":5,"starters":["P1 opened...","P1 hesitated...","P1 completed..."]},
    {"k":"ut_time","label":"Timing and help","hint":"Note seconds to completion and any help you gave.","rows":2,"starters":["Time:...","Help given:..."]}
  ]},
  {title:"Finding and fix",icon:"wrench",fb:"🔧",intro:"Tie a proposed fix to observed behaviour, then plan the retest.",fields:[
    {"k":"ut_finding","label":"Finding","hint":"Tie the finding to observed behaviour. Example: the training route was unclear for P1.","rows":3,"starters":["The finding is..."]},
    {"k":"ut_fix","label":"Fix and retest plan","hint":"Example: label it “Beginner practice”. Retest with a different beginner, and state the limitation of your sample.","rows":3,"starters":["The fix is...","I will retest...","Limitation:..."]}
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
