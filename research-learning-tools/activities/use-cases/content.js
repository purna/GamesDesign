// Synced from Activity_13_Use_Case_Arena__Neon_Clash_Weekend.html; run tools/sync-research.py to refresh.
window.RESEARCH_TASK_CONTENT["use-cases"] = function(){
/* =============================================================================
   1. CONFIG + CONTENT.  This is the ONLY section a new app should need to edit.
   ============================================================================= */
const CFG = {pfx:"research-v3-use-cases-",file:"use-case-game",title:"Use Case Arena: Neon Clash Weekend",kicker:"RESEARCH METHODS · USE CASES · 50 MIN",sub:"Learn the symbols, play three levels, write a use case, then draw it.",version:1};
/* Each tab renders a panel. Field: {k: unique key, label, hint, rows?}
   rows => textarea; no rows => single-line input. Keys are the saved-data schema. */
const APP_TABS = [
 {title:"Case file",icon:"folder-open",fb:"📂",widget:"learn",intro:"A use case describes, from the user's side, how someone reaches a goal with your game or app: a main flow of steps, plus what could go wrong. Study this worked example for a fictional event.",fields:[
  {k:"own_def",label:"A use case in your own words",hint:"One or two sentences. Start with: A use case is...",rows:3,starters:["A use case is...","The main flow is...","An alternative flow is...","It helps a team because..."]}]},
 {title:"Key elements",short:"Symbols",icon:"shapes",fb:"◇",widget:"guide",intro:"A use case diagram is a picture of who uses a system and what goals it helps them reach. Learn the seven symbols, study a worked example, then draw your own later.",fields:[
  {k:"dg_own",label:"Include or extend, in your own words",hint:"Use the day pass example. Start with: Include means...",rows:3,starters:["Include means...","Extend means...","The arrow points to... because...","For example, ..."]}]},
 {title:"Level 1 · Actors",short:"1 · Actors",icon:"user-group",fb:"👥",widget:"l1",intro:"Level 1: set the actors. For each feature, choose who starts it and who else takes part.",fields:[{k:"uc_game",hidden:true}]},
 {title:"Level 2 · Place",short:"2 · Place",icon:"hand-pointer",fb:"👆",widget:"l2",intro:"Level 2: place the use cases. The actors are set. Drag each card onto the numbered oval it belongs to.",fields:[]},
 {title:"Level 3 · Fix",short:"3 · Fix",icon:"screwdriver-wrench",fb:"🔧",widget:"l3",intro:"Level 3: fix the diagram. Each picture has one mistake: change the association, switch include or extend, or flip an arrow.",fields:[]},
 {title:"Create",icon:"pen-ruler",fb:"✎",widget:"create",intro:"Your turn. Pick a feature for Neon Clash Weekend, or invent one, and write its use case. Use the checklist as your success criteria.",fields:[
  {k:"name",label:"Use case title",hint:"Start with who and a verb, for example: Fan finds the nearest first aid point."},
  {k:"actor",label:"Actors",hint:"Who does the task? Who else is involved?",rows:2,starters:["Primary actor: ","Secondary actor: "]},
  {k:"goal",label:"Goal",hint:"What does the user want, in their words?",rows:2,starters:["The user wants to..."]},
  {k:"pre",label:"Before it starts",hint:"What must already be true?",rows:2,starters:["The user has...","The app is..."]},
  {k:"main",label:"Main flow",hint:"Number the steps. Alternate between what the user does and how the system responds.",rows:6,starters:["1. The user opens...","2. The system shows...","The goal is reached when..."]},
  {k:"alt",label:"What could go wrong",hint:"For each risk, write the step and how the system responds.",rows:5,starters:["At step 2, if...","If there is no signal, the system...","If the user makes a mistake, the system..."]},
  {k:"req",label:"Requirements",hint:"Turn the risks into things the design must do.",rows:4,starters:["Because..., the system shall...","The design must..."]},
  {k:"uc_chk",hidden:true}]},
 {title:"Draw",icon:"diagram-project",fb:"🗺",widget:"draw",intro:"Turn your use case into a diagram. Follow the four steps. Your drawing saves on this device and goes into every export.",fields:[{k:"uc_diagram",hidden:true}]}
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
