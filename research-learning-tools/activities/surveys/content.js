// Synced from Activity_01_Online_Surveys_-_Survey_Lab.html; run tools/sync-research.py to refresh.
window.RESEARCH_TASK_CONTENT["surveys"] = function(){

/* =============================================================================
   1. CONFIG + CONTENT.  This is the ONLY section a new app should need to edit.
   ============================================================================= */
const CFG = {pfx:"research-v3-surveys-",file:"online-surveys-lab",title:"Survey Lab: Online Surveys",kicker:"RESEARCH METHODS · ONLINE SURVEYS · 60-75 MIN",sub:"Build a survey form, fill the database, read the tool's charts, then review the data like a trained expert.",version:1};
const APP_TABS = [
 {title:"Tutorial",icon:"circle-play",fb:"▶",widget:"tutorial",intro:"Follow one answer on its journey: form, database, survey tool, trained expert. It takes two minutes.",fields:[]},
 {title:"Learn",icon:"book-open",fb:"📖",widget:"learn",intro:"An online survey is more than a form. Read the key idea, then explain it in your own words.",fields:[
  {k:"own_def",label:"Online surveys in your own words",hint:"One or two sentences. Start with: An online survey is...",rows:3,starters:["An online survey is...","The data is stored...","The survey tool can...","A trained expert is needed because..."]}]},
 {title:"Brief",icon:"clipboard-list",fb:"📋",intro:"Plan the research. You are surveying the audience of an esports event.",fields:[
  {k:"name",label:"Survey name",hint:"Invent one, for example Neon Clash Weekend Feedback."},
  {k:"aud",label:"Who will you ask?",hint:"Name two groups, for example fans in the arena and players or coaches.",rows:3,starters:["Fans who...","Players who...","Parents who..."]},
  {k:"ask",label:"What do you need to find out?",hint:"Write one research question the survey must answer.",rows:3,starters:["I need to find out whether...","I want to know why...","The decision this helps is..."]}]},
 {title:"Build",icon:"pen-ruler",fb:"✎",widget:"build",intro:"Build the form. Mix formats, keep it short enough to finish, and let the coach check your wording.",fields:[{k:"sv_q",hidden:true}]},
 {title:"Database",icon:"database",fb:"🗄️",widget:"collect",intro:"Launch the survey. Every form that is sent becomes a row in the database.",fields:[{k:"sv_r",hidden:true},{k:"db_note",label:"What do you notice in the database?",hint:"Look at the rows, the columns and the Time column. Is anything odd?",rows:3,starters:["I can see that...","Some respondents...","The Time column shows..."]}]},
 {title:"Analyse",icon:"chart-simple",fb:"📊",widget:"analyse",intro:"This is the survey tool's level of analysis. Practise reading the worked examples, then read your own charts.",fields:[{k:"sv_ex",hidden:true},
  {k:"tool_sees",label:"What do the charts show?",hint:"Name the biggest result, the smallest, and one surprise, with numbers.",rows:4,starters:["The most common answer was...","The average rating for... was...","Only ...% said..."]},
  {k:"tool_cant",label:"What can the charts NOT tell you?",hint:"Think about why people answered as they did, and who did not answer.",rows:3,starters:["The chart cannot tell me why...","I do not know whether...","People who did not answer might..."]}]},
 {title:"Tool or Expert?",icon:"gamepad",fb:"🎮",widget:"sort",intro:"Game time. Ten jobs, three roles: the database, the survey tool, or the trained expert. Sort each job to the right role.",fields:[{k:"sv_game",hidden:true}]},
 {title:"Expert review",icon:"magnifying-glass-chart",fb:"🔍",widget:"expert",intro:"Now be the trained expert. Clean the data, code the comments, then write what you would tell the organisers.",fields:[{k:"sv_flag",hidden:true},{k:"sv_chk",hidden:true},{k:"sv_code",hidden:true},{k:"sv_cmp",hidden:true},
  {k:"finding",label:"What does the data say?",hint:"Two or three findings, with numbers, using only responses you trust.",rows:4,starters:["The strongest finding is...","After removing fast responses...","The comments suggest..."]},
  {k:"limits",label:"How far can you trust it?",hint:"Mention sample size, who answered, and any question wording problems.",rows:3,starters:["The sample was...","I cannot be sure because...","One question was weak because..."]},
  {k:"rec",label:"Your recommendation",hint:"One clear action for the organisers, linked to the evidence.",rows:3,starters:["I recommend...","The evidence for this is...","Before deciding I would also..."]}]}
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
