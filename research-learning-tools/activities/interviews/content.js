// Synced from Activity_06_Interviews_-_Peer_Experience_Lab.html; run tools/sync-research.py to refresh.
window.RESEARCH_TASK_CONTENT["interviews"] = function(){

/* =============================================================================
   1. CONFIG + CONTENT.  This is the ONLY section a new app should need to edit.
   ============================================================================= */
/* =============================================================================
   1. CONFIG + CONTENT.  Method lesson: Individual interviews (interviews)
   Content sourced from research-learning-tools/data/methods/interviews.js
   ============================================================================= */
const CFG = {pfx:"research-v3-interviews-",file:"interviews-lab",title:"Interviews: Peer Experience Lab",kicker:"RESEARCH METHODS · INTERVIEWS · 60 MIN",sub:"Interview one peer about the last time they learned a game, then follow up for detail.",version:1};
const APP_TABS = [
  {title:"Tutorial",icon:"circle-play",fb:"▶",widget:"tutorial",intro:"Follow the method in four steps, with a worked example and the key reading. About two minutes.",fields:[]},
  {title:"Learn",icon:"book-open",fb:"📖",widget:"learn",intro:"Read the key idea, then explain it in your own words.",fields:[
    {k:"own_def",label:"Interviews in your own words",hint:"One or two sentences. Start with: An interview is...",rows:3,starters:["An interview is...","Follow-ups matter because...","One interview is..."]}]},
  {title:"Goal and guide",icon:"comment-dots",fb:"💬",intro:"Write four open questions about a real past experience.",fields:[
    {"k":"iv_goal","label":"Research goal","hint":"What do you want to understand about how people learn a game or app?","rows":3,"starters":["I want to understand..."]},
    {"k":"iv_questions","label":"Four open questions","hint":"Write four open questions about a real past experience. Avoid “Would you like my idea?” Example: Tell me about the last game you learned. What happened first?","rows":5,"starters":["1. Tell me about...","2. What happened...","3. Can you give...","4. Why..."]}
  ]},
  {title:"Notes and quotations",icon:"notebook",fb:"📓",intro:"Ask permission, listen, and record accurate notes.",fields:[
    {"k":"iv_notes","label":"Interview notes","hint":"Ask permission, use P1 rather than a name, and record accurate notes.","rows":5,"starters":["P1 described...","P1 explained..."]},
    {"k":"iv_quote","label":"Quotation and paraphrase","hint":"Mark paraphrases as paraphrases. Example: P1 described looking up a video after failing the first level. Paraphrase: the in-game instructions felt too long.","rows":3,"starters":["Exact words:...","Paraphrase:..."]}
  ]},
  {title:"Themes and next questions",icon:"compass",fb:"🧭",intro:"Find a pattern, then name what you still need to investigate.",fields:[
    {"k":"iv_theme","label":"Pattern you noticed","hint":"Example: a possible need for help at the moment of difficulty.","rows":3,"starters":["The pattern is...","A possible need is..."]},
    {"k":"iv_next","label":"Question you still need to investigate","hint":"This is one interview. Say what you will ask more players before claiming a pattern.","rows":3,"starters":["I still need to know...","Before claiming a pattern..."]}
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
