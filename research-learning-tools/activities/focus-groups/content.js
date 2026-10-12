// Synced from Activity_08_Focus_Groups_-_Classroom_Discussion.html; run tools/sync-research.py to refresh.
window.RESEARCH_TASK_CONTENT["focus-groups"] = function(){

/* =============================================================================
   1. CONFIG + CONTENT.  This is the ONLY section a new app should need to edit.
   ============================================================================= */
/* =============================================================================
   1. CONFIG + CONTENT.  Method lesson: Focus groups (focus-groups)
   Content sourced from research-learning-tools/data/methods/focus-groups.js
   ============================================================================= */
const CFG = {pfx:"research-v3-focus-groups-",file:"focus-groups-lab",title:"Focus Groups: Classroom Discussion",kicker:"RESEARCH METHODS · FOCUS GROUPS · 60-75 MIN",sub:"Plan, run and interpret a moderated group discussion about the beginner experience.",version:1};
const APP_TABS = [
  {title:"Tutorial",icon:"circle-play",fb:"▶",widget:"tutorial",intro:"Follow the method in four steps, with a worked example and the key reading. About two minutes.",fields:[]},
  {title:"Learn",icon:"book-open",fb:"📖",widget:"learn",intro:"Read the key idea, then explain it in your own words.",fields:[
    {k:"own_def",label:"Focus groups in your own words",hint:"One or two sentences. Start with: A focus group is...",rows:3,starters:["A focus group is...","The moderator must...","What people say is not..."]}]},
  {title:"Discussion plan",icon:"users",fb:"👥",intro:"Plan the session before you run it: topic, prompts and ground rules.",fields:[
    {"k":"fg_topic","label":"Topic and three prompts","hint":"Set a topic and three open prompts about the beginner experience. Everyone gets a turn and anyone may pass.","rows":4,"starters":["Our topic is...","Prompt one:...","Prompt two:...","Prompt three:..."]},
    {"k":"fg_roles","label":"Moderator, note-taker and ground rules","hint":"Name a moderator and a note-taker. State the ground rules so no one is pushed to agree.","rows":3,"starters":["The moderator is...","The note-taker is...","Ground rules:..."]}
  ]},
  {title:"Views and quotations",icon:"quote-left",fb:"❝",intro:"Run the discussion. Invite each person to speak and record what they actually say.",fields:[
    {"k":"fg_views","label":"What people said","hint":"Record differing views rather than forcing agreement. Use P1, P2 and so on, never names.","rows":5,"starters":["P1 thinks...","P2 prefers...","P3 wants..."]},
    {"k":"fg_quote","label":"One exact quotation","hint":"Copy one sentence exactly as a participant said it. Exact words beat paraphrases.","rows":2,"starters":["P1 said...","P2 said..."]}
  ]},
  {title:"Themes and follow-up",icon:"lightbulb",fb:"💡",intro:"Group the views into themes, then plan the observation that would test them.",fields:[
    {"k":"fg_themes","label":"What did the discussion suggest?","hint":"Group the views into themes. Example: offer optional help formats as a hypothesis.","rows":3,"starters":["The group suggested...","The strongest theme is..."]},
    {"k":"fg_follow","label":"What would you observe in a usability test?","hint":"Discussion captures what people say. Plan what you would watch them do.","rows":3,"starters":["I would watch whether...","A usability test could check..."]}
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
