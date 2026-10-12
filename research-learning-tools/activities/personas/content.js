// Synced from Activity_04_Persona_Maker__Esports_Event_App.html; run tools/sync-research.py to refresh.
window.RESEARCH_TASK_CONTENT["personas"] = function(){

/* =============================================================================
   1. CONFIG + CONTENT.  This is the ONLY section a new app should need to edit.
   ============================================================================= */
const CFG = {pfx:"research-v3-personas-",file:"persona-lesson",title:"Persona Maker: Esports Event App",kicker:"RESEARCH METHODS · PERSONAS · 40 MIN",sub:"Turn research into a believable person you can design for: portrait, profile and a check.",version:1};
/* Each tab renders a panel. Field: {k: unique key, label, hint, rows?}
   rows => textarea; no rows => single-line input. Keys are the saved-data schema. */
const APP_TABS = [
 {title:"Learn",icon:"book-open",fb:"📖",widget:"learn",intro:"A persona is a fictional person who stands for a group of real users. It helps a team decide with empathy instead of opinion. Read, then explain it in your own words.",fields:[
  {k:"own_def",label:"Personas in your own words",hint:"One or two sentences. Start with: A persona is...",rows:3,starters:["A persona is...","They help because...","A persona is only useful if...","Instead of asking what I think, I ask..."]}]},
 {title:"Read sources",icon:"book-open-reader",fb:"📚",widget:"src",intro:"Task: research real esports audiences before you invent a persona. Read the three sources, check how far each one can be trusted, and record one finding from each.",fields:[
  {k:"n_gwi",label:"A finding from the GWI report",hint:"One fact with a number if you can. Say who it is about.",rows:3,starters:["GWI found that...","Esports fans (esporters) are...","The report defines an esporter as..."]},
  {k:"n_mix",label:"A finding from the MixBright guide",hint:"A method or checklist idea you could use.",rows:3,starters:["MixBright suggests...","One way to segment players is...","I would check this claim because..."]},
  {k:"n_ps",label:"A finding from the Persona Studies article",hint:"What does it show about how a gamer persona can be built?",rows:3,starters:["The article shows that...","A risk of this persona is...","The voice that is missing is..."]},
  {k:"n_trust",label:"Which source would you trust most for an esports event app, and why?",hint:"Think about who wrote it, who it asked, and when.",rows:3,starters:["I trust ... most because...","I trust ... least because...","I would still need to ask..."]}]},
 {title:"Study examples",icon:"users-viewfinder",fb:"🔎",widget:"ex",intro:"Task: four example esports personas, written from a web search summary. Treat every line as a claim to check, not a fact. Read each line, check it against the sources, then mark it.",fields:[{k:"pp_chk",hidden:true},
  {k:"ex_weak",label:"Which example had the weakest evidence, and why?",hint:"Use your claim checks.",rows:3,starters:["Example ... was weakest because...","The claim that ... is contradicted by...","I could not find any source for..."]},
  {k:"ex_next",label:"What would you ask real people to fill the gaps?",hint:"Write two interview or survey questions.",rows:3,starters:["I would ask fans...","A survey question could be...","I need to find out whether..."]}]},
 {title:"Your evidence",icon:"magnifying-glass",fb:"🔍",intro:"Personas are only as good as the research behind them. Record your evidence first. Do not use a real person's details.",fields:[
  {k:"who",label:"Who did you learn from?",hint:"Interviews, a survey, friends who watch esports, forum posts.",rows:3,starters:["I asked...","I read posts from...","I surveyed..."]},
  {k:"qual",label:"What did people say or do?",hint:"Quotes and behaviour you noticed.",rows:4,starters:["Several people said...","Nobody mentioned...","They struggled when..."]},
  {k:"quant",label:"Numbers that back it up",hint:"Counts, percentages, analytics. Write none yet if you have none.",rows:3,starters:["Out of... people...","Most of them...","About half..."]}]},
 {title:"Portrait",icon:"palette",fb:"🎨",widget:"port",intro:"Give your persona a face. Build an avatar, draw one, or use an image. Then style the frame. Do not upload a photo of a real person you know.",fields:[{k:"pp_cfg",hidden:true},{k:"pp_draw",hidden:true},{k:"pp_up",hidden:true}]},
 {title:"Profile",icon:"puzzle-piece",fb:"🧩",widget:"prof",wend:true,intro:"Fill in who they are, then drag elements into their profile. Tap Add if you cannot drag. Each element tells you what to write.",fields:[
  {k:"name",label:"Name",hint:"First name and an initial."},{k:"page",label:"Age",hint:"A number or a range."},{k:"pjob",label:"Job or role",hint:"For example student, apprentice or coach."},{k:"ploc",label:"Where they live",hint:"Town or region."},{k:"pp_blocks",hidden:true}]},
 {title:"Card & Check",icon:"id-card",fb:"🪪",widget:"card",intro:"Your finished persona card. Print it or export it, then check it honestly.",fields:[
  {k:"real",label:"Realism: do they sound real?",hint:"Believable, but not a copy of someone you know.",rows:3,starters:["They are believable because...","They sound too perfect because...","They match a real person when..."]},
  {k:"use",label:"Utility: can you make decisions with them?",hint:"Pick one design choice and test it on your persona.",rows:3,starters:["Because of their goals I would...","They would ignore...","I still need to find out..."]}]}
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
