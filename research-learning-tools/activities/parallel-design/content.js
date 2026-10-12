// Synced from Activity_05_Parallel_Design_-_Home_Screen_Sprint.html; run tools/sync-research.py to refresh.
window.RESEARCH_TASK_CONTENT["parallel-design"] = function(){

const CFG = {pfx:"research-v3-parallel-design-",file:"parallel-design-login",title:"Parallel Design: Login Page Sprint",kicker:"UX METHODS · PARALLEL LOGIN DESIGN",sub:"Pick a page layout, review login wireframe options, choose one concept, apply up to 2 changes per round across two rounds, and review feedback.",version:7};
const APP_TABS = [
  {title:"Tutorial",icon:"circle-play",fb:"▶",widget:"tutorial",intro:"Follow the method in four steps, with a login sprint example and key reading.",fields:[]},
  {title:"Learn",icon:"book-open",fb:"📖",widget:"learn",intro:"Read the key idea, then explain authentication parallel design in your own words.",fields:[
    {k:"own_def",label:"Parallel login design in your own words",hint:"One or two sentences. Start with: Parallel login design is...",rows:3,starters:["Parallel login design is...","Testing multiple wireframes lets us...","The iterative rounds help..."]}]},
  {title:"Shared requirements",icon:"clipboard-check",fb:"✅",intro:"Establish user and security requirements before wireframing.",fields:[
    {"k":"login_reqs","label":"Audience, security constraints, and tasks","hint":"Define target users, accessibility requirements, and authentication criteria.","rows":4,"starters":["The target users are...","Security constraints require...","Primary tasks include..."]}
  ]},
  {title:"Wireframes & Feedback",icon:"eye",fb:"🖥️",widget:"wireframes",intro:"Pick a page layout, review the three parallel login concepts, then choose your preferred concept to begin two rounds of changes (max 2 additions per round).",fields:[{k:"loginstate",hidden:true}]},
  {title:"Combined design",icon:"code-merge",fb:"🔀",intro:"Synthesize findings and configure your final integrated login layout.",fields:[
    {"k":"login_keep","label":"What elements we kept and why","hint":"Explain which wireframe elements and security features made it into your final build.","rows":4,"starters":["We kept... because...","We integrated security features like..."]},
    {"k":"login_test","label":"What security or UX to test next","hint":"State what your final login design still needs to test with real users.","rows":3,"starters":["We will test user friction on...","Remaining security testing includes..."]}
  ]},
  {title:"Writeup & Feedback Summary",icon:"pen-to-square",fb:"📝",widget:"summary",intro:"Review audit feedback summary of your changes across both sprint rounds, and document final outcomes.",fields:[
    {"k":"login_eval","label":"Final Sprint Evaluation & Writeup","hint":"Summarize success or failure of modifications across iteration rounds.","rows":5,"starters":["The iterative changes were successful because...","Round 1 and 2 modifications achieved...","One remaining challenge or vulnerability is..."]}
  ]},
  {title:"Sort the practice",icon:"sort",fb:"🗂️",widget:"game",intro:"Ten statements. Sort each into good research practice or a risky authentication shortcut.",fields:[{k:"gm",hidden:true}]}
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
