// Synced from Activity_10_Card_Sorting_-_Esports_Event_with_Tutorial.html; run tools/sync-research.py to refresh.
window.RESEARCH_TASK_CONTENT["card-sorting"] = function(){

/* =============================================================================
   1. CONFIG + CONTENT.  This is the ONLY section a new app should need to edit.
   ============================================================================= */
const CFG = {pfx:"research-v3-card-sorting-",file:"card-sort-lesson",title:"Card Sorting: Esports Event App",kicker:"RESEARCH METHODS · CARD SORTING · 60–75 MIN",sub:"Group your event content, build its hierarchy, and plan a clear title page from audience evidence.",version:1};
/* Each tab renders a panel. Field: {k: unique key, label, hint, rows?}
   rows => textarea; no rows => single-line input. Keys are the saved-data schema. */
const APP_TABS = [
 {title:"Tutorial",icon:"circle-play",fb:"▶",widget:"tutorial",intro:"Your task: organise the information for an esports event app. You will make content cards, ask people to group them, and turn their choices into a clear menu and title page. Use this guided example before you begin.",fields:[]},
 {title:"Learn",icon:"book-open",fb:"📖",widget:"learn",intro:"Card sorting shows how real people group information, so your menus match their thinking, not yours. Read, then explain it in your own words.",fields:[
  {k:"own_def",label:"Card sorting in your own words",hint:"One or two sentences. Start with: Card sorting is...",rows:3,starters:["Card sorting is...","It helps because...","An open sort is...","A closed sort is..."]}]},
 {title:"Brief",icon:"trophy",fb:"🏆",intro:"Plan the study. You are designing the app for an esports event.",fields:[
  {k:"name",label:"Event name",hint:"Invent one, for example Neon Clash Weekend."},
  {k:"aud",label:"Who will use the app?",hint:"Name two groups, for example fans in the arena and players or coaches.",rows:3,starters:["Fans who want to...","Players who need to...","Parents who ask..."]},
  {k:"goal",label:"What must the app help people do?",hint:"Think about the first thing someone does at the event.",rows:3,starters:["Find...","Watch...","Buy..."]}]},
 {title:"Cards",icon:"clone",fb:"🃏",widget:"cards",intro:"Build the deck. Aim for 20 to 30 cards, one idea per card, in words your audience uses. Tap suggestions or write your own.",fields:[{k:"cs_cards",hidden:true}]},
 {title:"Sort",icon:"table-cells-large",fb:"▦",widget:"sort",intro:"Sort every card into groups, as a participant would. Drag cards, or use the Move menu on each card. Save the sort, then repeat with friends.",fields:[{k:"cs_cur",hidden:true},{k:"cs_sorts",hidden:true}]},
 {title:"Analyse",icon:"chart-simple",fb:"📊",widget:"analyse",intro:"Look for agreement between sorts, then use the Structure tab to propose a hierarchy. Card sorting suggests relationships; it does not by itself decide homepage priority.",fields:[
  {k:"pat",label:"Patterns you spotted",hint:"Which cards always sat together? Which split people?",rows:4,starters:["Everyone grouped...","People disagreed about...","A surprising group was..."]},
  {k:"nav",label:"Your proposed menu",hint:"List 4 to 6 top-level labels, then what sits under each. Use the group names people chose.",rows:5,starters:["Menu: ","Under Watch: ","Under Visit: "]}]},
 {title:"Structure",icon:"sitemap",fb:"▦",widget:"structure",intro:"Build the fundamental structure of your event app. Start with a saved participant sort, then organise main sections, subsections and content pages. The live tree shows the overall hierarchy.",fields:[{k:"cs_structure",hidden:true},{k:"structure_reason",label:"Why this hierarchy fits your event",hint:"Connect a grouping to a user goal and participant evidence. Mark unsupported choices as hypotheses.",rows:4,starters:["Participants grouped...","This section helps fans...","I still need to test..."]}]},
 {title:"Title page",icon:"house",fb:"⌂",widget:"homepage",intro:"Choose what belongs on your event’s title page. Rank up to three featured items, add supporting information, and keep other pages in the navigation. These are design priorities to test with users.",fields:[{k:"cs_home",hidden:true},{k:"event_date",label:"Event date and time",hint:"What date and opening time should visitors see?"},{k:"event_venue",label:"Venue or online location",hint:"Give the venue name or online platform."},{k:"home_reason",label:"Why these items come first",hint:"Use audience goals, timing and research. Before the event, tickets may matter most; during it, schedules or live streams may matter more.",rows:4,starters:["The first thing our audience needs is...","During the event...","The evidence for this priority is..."]}]},
 {title:"Labels",icon:"tags",fb:"Aa",widget:"labels",intro:"Refine the category labels using the words your audience uses. Compare your proposed labels with participant group names, then ask someone where they would look for a real task.",fields:[{k:"label_test",label:"Navigation label check",hint:"Record task, expected section, participant code, actual first choice and explanation. An example task is: You need directions to the venue. Where would you look?",rows:5,starters:["Task: ... Expected section: ...","Participant P1 chose...","I changed the label because..."]},{k:"label_next",label:"Next test or revision",hint:"Explain which label needs checking and how you will test the hierarchy with another participant.",rows:3,starters:["Next I will ask...","A label that needs checking is..."]}]}

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
