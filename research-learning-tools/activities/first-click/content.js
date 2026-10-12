// Synced from Activity_09_First_Click_Lab__Neon_Clash_Weekend.html; run tools/sync-research.py to refresh.
window.RESEARCH_TASK_CONTENT["first-click"] = function(){

/* =============================================================================
   1. CONFIG + CONTENT.  This is the ONLY section a new app should need to edit.
   ============================================================================= */
const CFG = {pfx:"research-v3-first-click-",file:"first-click-lab",title:"First Click Lab: Neon Clash Weekend",kicker:"RESEARCH METHODS · FIRST CLICK TESTING · 40 MIN",sub:"Click through fake screens, see where people really click, and learn how colour and layout change the result.",version:1};
/* Each tab renders a panel. Field: {k: unique key, label, hint, rows?}
   rows => textarea; no rows => single-line input. Keys are the saved-data schema. */
const APP_TABS = [
 {title:"Learn",icon:"book-open",fb:"📖",widget:"learn",intro:"First click testing shows where a participant clicks first to complete a task. It works on a live site, a prototype or a wireframe. The first click matters because a wrong start makes success much less likely.",fields:[
  {k:"own_def",label:"First click testing in your own words",hint:"One or two sentences. Start with: A first click test is...",rows:3,starters:["A first click test is...","It matters because...","It can be done on...","A good task is one that..."]}]},
 {title:"Colour lab",icon:"palette",fb:"🎨",widget:"colour",intro:"Colour decisions change what people notice and click. Try the contrast checker, build a harmony, and see a screen as a person with colour-blindness might.",fields:[]},
 {title:"Test",icon:"computer-mouse",fb:"🖱",widget:"test",intro:"Be the participant, or pass the device to a friend. Read the task, then click once where you would click first. Nothing is marked right or wrong while you play.",fields:[{k:"fc_runs",hidden:true}]},
 {title:"Results",icon:"chart-simple",fb:"📊",widget:"results",intro:"See success rates, times and a click map for each screen. Compare design A with design B and find the colour and layout causes.",fields:[]},
 {title:"Findings",icon:"pen",fb:"✎",intro:"Write up what you found, then plan a test of your own.",fields:[
  {k:"name",label:"Test title",hint:"For example: Neon Clash navigation test."},
  {k:"worst",label:"Which screen failed most, and what did people click instead?",hint:"Use numbers from the Results tab.",rows:3,starters:["Screen ... had the lowest success rate...","Most people clicked...","The median time was..."]},
  {k:"cause",label:"Which colour or layout issue caused it?",hint:"Name the issue and the evidence.",rows:3,starters:["The contrast was too low because...","There was no visual hierarchy because...","The label was unfamiliar because...","The target was too small because..."]},
  {k:"fix",label:"Your redesign rule",hint:"One rule your team could follow next time.",rows:3,starters:["Always make the main action...","Never rely on colour alone to...","Use one accent colour for..."]},
  {k:"plan",label:"Plan your own first click test",hint:"Task, correct first click, number of participants.",rows:4,starters:["Task: ","The correct first click is: ","I will test... participants because..."]}]}
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
