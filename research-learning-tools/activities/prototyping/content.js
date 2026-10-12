// Synced from Activity_03_Prototyping_Lab__Tutorial_Flow.html; run tools/sync-research.py to refresh.
window.RESEARCH_TASK_CONTENT["prototyping"] = function(){

const CFG = {pfx:"research-v3-prototyping-",file:"prototyping-lab",title:"Prototyping Lab: Tutorial Flow",kicker:"RESEARCH METHODS · PROTOTYPING · 90 MIN",sub:"Build four screens by drag and drop, connect a purchase route, test it with a simulated customer, then improve the prototype.",version:11};

/* State Variables */
let currentProtoScreen = 1;
let protoClicks = 0;
let testSim = null;
let uiSel = null, uiChecked = false, rtScreen = "home", rtTaps = 0, rtPath = ["home"], rtMsg = "", fidelity = "lo";

/* Configuration & Data Constants */
const TUT_STEPS = [{"t":"Sketch","d":"Pick one task and define success. Draft three screens, each with a title, content and a next action."},{"t":"Connect","d":"Link the screens so the task has a route. Paper is fine; the flow is what matters."},{"t":"Try","d":"A partner attempts the task with no hints. Watch, and note exactly what happens."},{"t":"Improve","d":"Change the prototype based on the evidence, then retest with someone new."}];
const TUT_EX = ["A new player needs to start the beginner tutorial. Success means reaching the first tutorial step without help.","Screen 1: Home. Action: Learn to play.\nScreen 2: Tutorials. Action: Beginner.\nScreen 3: First lesson. Action: Start.","P1 chose “Play” instead of “Learn”. In version two I renamed the button “Beginner tutorial”. I will retest with another player."];
const READING = {"title":"Paper Prototyping: Getting User Data Before You Code","url":"https://www.nngroup.com/articles/paper-prototyping/","summary":"Paper prototypes let teams test early ideas at little cost. Their simplicity makes it easier to change direction before implementation. The article argues that waiting for a polished interface can delay useful user feedback and make fixes more expensive."};
const WATCH = "A prototype only tests the features it represents. Visual polish does not prove usability.";
const GAME = [["Choose one task and define successful completion","good","A single task with a success condition makes the test measurable."],["Give each screen a title, content and a next action","good","Screens need to show what happens next, not just look nice."],["Test with a partner attempting the task without hints","good","Unhelped attempts reveal the real route through the flow."],["Note what happened, then change the prototype","good","Failures are cheap while the prototype is still rough."],["Retest the changed version with another player","good","A fix is a claim until a new user succeeds."],["Add visual polish before the flow works","risk","Visual polish does not prove usability; a prototype tests the features it represents."],["Help the partner whenever they hesitate","risk","Unrecorded help hides the failure you are trying to find."],["Test every feature at once","risk","One task at a time keeps the evidence usable."],["Assume a finished look means the design is usable","risk","Looks are not behaviour."],["Change the prototype without recording what went wrong","risk","Without evidence you cannot say the new version is better."]];
const LEVELS = [["Newcomer 🐣",0],["Researcher 📋",60],["Research Lead 🏅",150]];
const GAME_TITLE = "Prototyping";

const WIREFRAME_CHALLENGES = [
  {
    id: "screen1",
    screen: "Screen 1: Home / Entry",
    desc: "Landing screen with hero visual and call-to-action button.",
    svgLarge: `<svg viewBox="0 0 280 240" width="100%" height="220" style="background:var(--card);border-radius:8px;border:1.5px solid var(--bd)">
      <rect x="20" y="20" width="240" height="200" rx="12" fill="var(--bg)" stroke="var(--bd)" stroke-width="2"/>
      <rect x="40" y="38" width="120" height="14" rx="4" fill="var(--mu)" opacity="0.6"/>
      <rect x="40" y="62" width="200" height="80" rx="6" fill="var(--card)" stroke="var(--bd)" stroke-width="1.5"/>
      <text x="140" y="106" font-size="14" fill="var(--mu)" text-anchor="middle">Hero Visual</text>
      <rect x="40" y="156" width="200" height="42" rx="6" fill="var(--pk)"/>
      <text x="140" y="182" font-size="15" font-weight="bold" fill="var(--onpk)" text-anchor="middle">Play (Misleading Label)</text>
    </svg>`,
    bugs: [
      {id: "b1", title: "UX Flaw: Misleading Action Label", hint: "Correct! The main button says 'Play' instead of guiding the user to the tutorial.", isBug: true},
      {id: "b2", title: "UI Layout: Standard Centered Header", hint: "False alarm! Centered header text is a completely valid layout practice.", isBug: false}
    ]
  },
  {
    id: "screen2",
    screen: "Screen 2: Tutorial Hub",
    desc: "Menu listing category options for selection.",
    svgLarge: `<svg viewBox="0 0 280 240" width="100%" height="220" style="background:var(--card);border-radius:8px;border:1.5px solid var(--bd)">
      <rect x="20" y="20" width="240" height="200" rx="12" fill="var(--bg)" stroke="var(--bd)" stroke-width="2"/>
      <rect x="40" y="38" width="140" height="14" rx="4" fill="var(--mu)" opacity="0.6"/>
      <rect x="40" y="68" width="200" height="34" rx="6" fill="var(--card)" stroke="var(--bd)" stroke-width="1.5"/>
      <text x="60" y="90" font-size="13" fill="var(--tx)">Beginner Tutorial</text>
      <rect x="40" y="112" width="200" height="34" rx="6" fill="var(--card)" stroke="var(--bd)" stroke-width="1.5"/>
      <text x="60" y="134" font-size="13" fill="var(--tx)">Advanced Guides</text>
      <rect x="40" y="156" width="200" height="34" rx="6" fill="var(--card)" stroke="var(--bd)" stroke-width="1.5"/>
      <text x="60" y="178" font-size="13" fill="var(--tx)">Community Hub</text>
    </svg>`,
    bugs: [
      {id: "b3", title: "UX Flaw: Dead End Route", hint: "Correct! There is no back button or exit path provided on this screen.", isBug: true},
      {id: "b4", title: "UI Layout: Clean Vertical List", hint: "False alarm! Vertical lists are standard and highly readable.", isBug: false}
    ]
  },
  {
    id: "screen3",
    screen: "Screen 3: First Lesson",
    desc: "Step-by-step instructions view.",
    svgLarge: `<svg viewBox="0 0 280 240" width="100%" height="220" style="background:var(--card);border-radius:8px;border:1.5px solid var(--bd)">
      <rect x="20" y="20" width="240" height="200" rx="12" fill="var(--bg)" stroke="var(--bd)" stroke-width="2"/>
      <rect x="40" y="38" width="100" height="14" rx="4" fill="var(--mu)" opacity="0.6"/>
      <rect x="40" y="66" width="200" height="8" rx="3" fill="var(--mu)" opacity="0.4"/>
      <rect x="40" y="82" width="180" height="8" rx="3" fill="var(--mu)" opacity="0.4"/>
      <rect x="40" y="98" width="190" height="8" rx="3" fill="var(--mu)" opacity="0.4"/>
      <rect x="40" y="114" width="150" height="8" rx="3" fill="var(--mu)" opacity="0.4"/>
      <rect x="40" y="156" width="200" height="42" rx="6" fill="var(--cy)"/>
      <text x="140" y="182" font-size="15" font-weight="bold" fill="var(--bg)" text-anchor="middle">Start Lesson</text>
    </svg>`,
    bugs: [
      {id: "b5", title: "UX Flaw: Cognitive Overload", hint: "Correct! Too much unchunked text block content is crammed together.", isBug: true},
      {id: "b6", title: "Accessibility: High-Contrast Primary CTA", hint: "False alarm! A high-contrast CTA button is an accessibility best practice.", isBug: false}
    ]
  }
];

/* Helper Functions */

const APP_TABS = [
  {title:"Tutorial",icon:"circle-play",fb:"▶",widget:"tutorial",intro:"Follow the method in four steps, with a worked example and the key reading. About two minutes.",fields:[]},
  {title:"Bug Hunt Theory",icon:"bug",fb:"🐛",widget:"bug_theory",intro:"Review wireframe screens and click hotspots to spot real UI/UX flaws.",fields:[{k:"wf_score",hidden:true},{k:"found_bugs",hidden:true},{k:"false_alarms",hidden:true}]},
  {title:"Learn",icon:"book-open",fb:"📖",widget:"learn",intro:"Read the key idea, then explain it in your own words.",fields:[
    {k:"own_def",label:"Prototyping in your own words",hint:"One or two sentences. Start with: A prototype is...",rows:3,starters:["A prototype is...","Paper is enough because...","The test shows..."]}]},
  {title:"Goal and success",icon:"flag-checkered",fb:"🏁",intro:"Pick one task and define what success looks like.",fields:[
    {"k":"pr_task","label":"The one task","hint":"Choose one task, such as buying a hoodie or finding a tutorial.","rows":3,"starters":["The task is..."]},
    {"k":"pr_success","label":"Success condition","hint":"Define what successful completion looks like. Example: reaching “Order confirmed” without help.","rows":3,"starters":["Success means..."]}
  ]},
  {title:"Build the screens",icon:"table-cells-large",fb:"🧩",widget:"ui_builder",intro:"Drag UI elements onto the screen where each one belongs: a homepage, a login page, a contact form and a cart with payment.",fields:[{k:"ui_place",hidden:true},
    {"k":"pr_screens","label":"Screen content notes","hint":"Notes on titles, content, and CTA buttons.","rows":4,"starters":["Screen 1: Home...","Screen 2: Login...","Screen 3: Cart & payment..."]}
  ]},
  {title:"Connect the route",icon:"route",fb:"🛒",widget:"route",intro:"Link the buttons so a customer can get from Home to Order confirmed, then tap through your own prototype.",fields:[{k:"route",hidden:true},
    {"k":"pr_flow","label":"Transitions & Logic","hint":"Specify what clicking each button should do.","rows":3,"starters":["Tapping ... opens...","The purchase route is..."]}
  ]},
  {title:"Test and version two",icon:"flask",fb:"🧪",widget:"test_sandbox",intro:"Run a simulated customer through your route, then log what you will change.",fields:[
    {"k":"pr_test","label":"What happened in the test","hint":"Note what happened during unguided testing.","rows":4,"starters":["P1 chose...","P1 hesitated at..."]},
    {"k":"pr_v2","label":"Version two changes","hint":"What did you change for version two?","rows":3,"starters":["In version two...","I will retest with..."]}
  ]},
  {title:"Sort the practice",icon:"sort",fb:"🗂️",widget:"game",intro:"Ten statements. Sort each into good research practice or a risky shortcut.",fields:[{k:"gm",hidden:true}]}
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
