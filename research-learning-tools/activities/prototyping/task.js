// Synced from Activity_03_Prototyping_Lab__Tutorial_Flow.html; library scope isolates DOM, callbacks and timers.
window.RESEARCH_TASKS["prototyping"] = function(scope){
const window=scope.window, document=scope.document;
const addEventListener=scope.addEventListener;
const {setTimeout,clearTimeout,setInterval,clearInterval}=scope;

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

const $ = id => document.getElementById(id);
const qa = (r, s) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const store = (k, v) => { try { localStorage.setItem(CFG.pfx + k, v) } catch (e) {} };
const load  = k => { try { return localStorage.getItem(CFG.pfx + k) } catch (e) { return null } };
const say = m => { const l = $("live"); l.textContent = ""; setTimeout(() => l.textContent = m, 30) };
const ic = (f, b) => `<i class="fa-solid fa-${f}" data-fb="${b}" aria-hidden="true"></i>`;

const pj = (k, d) => { try { const v = JSON.parse(data[k] || "null"); return Array.isArray(d) ? (Array.isArray(v) ? v : d) : (v && typeof v === "object" && !Array.isArray(v) ? v : d) } catch (e) { return d } };
const sj = (k, v) => { const e = (Array.isArray(v) && !v.length) || (v && typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length); if (e) delete data[k]; else data[k] = JSON.stringify(v); persist() };
const shuf = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a };

const getFoundBugs = () => pj("found_bugs", {});
const getFalseAlarms = () => pj("false_alarms", {});

/* ---------- UI builder / route data and logic ---------- */
const UI_SCREENS = [{id:"home",name:"Home",icon:"🏠"},{id:"login",name:"Login",icon:"🔐"},{id:"contact",name:"Contact",icon:"✉️"},{id:"cart",name:"Cart & payment",icon:"🛒"}];
const ROUTE_DESTS = UI_SCREENS.concat([{id:"done",name:"Order confirmed"}]);
const UI_EL = [
  {id:"logo",  label:"Logo",                    s:"home",    t:"logo"},
  {id:"nav",   label:"Navigation menu",         s:"home",    t:"nav",  act:1},
  {id:"search",label:"Search bar",              s:"home",    t:"field"},
  {id:"hero",  label:"Hero banner",             s:"home",    t:"hero", core:1},
  {id:"prods", label:"Product grid",            s:"home",    t:"grid", act:1, core:1},
  {id:"shop",  label:"“Shop now” button",       s:"home",    t:"btn",  act:1, core:1},
  {id:"foot",  label:"Footer links",            s:"home",    t:"foot"},
  {id:"em",    label:"Email field",             s:"login",   t:"field",core:1},
  {id:"pw",    label:"Password field",          s:"login",   t:"field",core:1},
  {id:"loginb",label:"“Log in” button",         s:"login",   t:"btn",  act:1, core:1},
  {id:"forgot",label:"Forgot password link",    s:"login",   t:"link"},
  {id:"cname", label:"Name field",              s:"contact", t:"field",core:1},
  {id:"cem",   label:"Reply-to email field",    s:"contact", t:"field",core:1},
  {id:"ctopic",label:"Topic dropdown",          s:"contact", t:"field"},
  {id:"cmsg",  label:"Message box",             s:"contact", t:"area", core:1},
  {id:"send",  label:"“Send message” button",   s:"contact", t:"btn",  act:1, core:1},
  {id:"items", label:"Cart item list",          s:"cart",    t:"list", core:1},
  {id:"promo", label:"Promo code box",          s:"cart",    t:"field"},
  {id:"total", label:"Order total",             s:"cart",    t:"total",core:1},
  {id:"card",  label:"Card number field",       s:"cart",    t:"field",core:1},
  {id:"exp",   label:"Expiry & CVV fields",     s:"cart",    t:"field",core:1},
  {id:"pay",   label:"“Pay now” button",        s:"cart",    t:"btn",  act:1, core:1}
];
const ACT_PRI = ["shop","prods","loginb","pay","send","nav"];
const elById = id => UI_EL.find(e => e.id === id);
const scName = id => (ROUTE_DESTS.find(x => x.id === id) || {}).name || id;
const shortL = e => e.label.replace(/[“”]/g, "").replace(/ (button|fields?|box|links?)$/i, "");
const getPlace = () => { const p = pj("ui_place", {}), o = {}; UI_EL.forEach(e => { if (UI_SCREENS.some(x => x.id === p[e.id])) o[e.id] = p[e.id] }); return o };
const getRoute = () => { const r = pj("route", {}), o = {}; UI_EL.forEach(e => { if (e.act && ROUTE_DESTS.some(x => x.id === r[e.id])) o[e.id] = r[e.id] }); return o };

function uiReport(){
  const pl = getPlace(); let correct = 0, placed = 0, complete = true;
  const per = UI_SCREENS.map(sc => {
    const here = UI_EL.filter(e => pl[e.id] === sc.id);
    const wrong = here.filter(e => e.s !== sc.id), right = here.filter(e => e.s === sc.id);
    const need = UI_EL.filter(e => e.s === sc.id && e.core && pl[e.id] !== sc.id);
    correct += right.length; placed += here.length; if (wrong.length || need.length) complete = false;
    return {sc, here, wrong, right, need};
  });
  return {per, correct, placed, complete};
}

function walk(){
  const pl = getPlace(), rt = getRoute(), path = ["home"], notes = []; let s = "home", ok = false;
  for (let i = 0; i < 10; i++){
    const here = ACT_PRI.filter(id => pl[id] === s);
    if (!here.length){ notes.push(`${scName(s)}: P1 cannot see a button that moves forward. Dead end.`); break }
    const id = here.find(x => rt[x]);
    if (!id){ notes.push(`${scName(s)}: P1 taps “${shortL(elById(here[0]))}” but it is not linked, so nothing happens.`); break }
    const nx = rt[id]; path.push(nx);
    notes.push(`${scName(s)}: P1 taps “${shortL(elById(id))}” and goes to ${scName(nx)}.`);
    if (nx === "done"){ ok = true; break }
    if (path.indexOf(nx) < path.length - 1){ notes.push(`P1 is back on ${scName(nx)} and is going in circles.`); break }
    s = nx;
  }
  return {path, notes, ok};
}
const routeWon = () => walk().ok;

function designChecks(){
  const pl = getPlace(), rt = getRoute(), rep = uiReport(), out = [];
  rep.per.filter(p => (p.sc.id === "cart" || p.sc.id === "login") && p.here.length && p.need.length)
    .forEach(p => out.push(`${p.sc.name} is missing ${p.need.map(shortL).join(", ")}, so a customer could not finish here.`));
  UI_EL.filter(e => e.act && pl[e.id] && !rt[e.id]).forEach(e => out.push(`“${shortL(e)}” on ${scName(pl[e.id])} is not linked, so tapping it does nothing.`));
  const w = walk(); if (w.ok && w.path.length - 1 > 4) out.push(`The route takes ${w.path.length - 1} taps. Can you shorten it?`);
  return out;
}

function runSim(guided){
  const w = walk(), lines = [];
  if (guided) lines.push("The runner tells P1 which button to tap on every screen.");
  w.notes.forEach(n => lines.push(n));
  if (!guided) designChecks().forEach(n => lines.push("Observation: " + n));
  let verdict;
  if (guided) verdict = w.ok ? "P1 succeeded, but only because you pointed the way. You cannot tell whether the route is easy to find." : "Even with hints P1 could not finish, so the route itself is broken.";
  else verdict = w.ok ? `P1 finished in ${w.path.length - 1} taps with no help. Now look at the observations for anything to improve.` : "P1 got stuck. That is your evidence: fix this in version two, then retest with someone new.";
  return {guided, ok: w.ok, title: (guided ? "Guided test" : "Unguided test") + (w.ok ? ": completed" : ": stuck"), lines, verdict};
}

function uiChip(e, mark){
  const on = uiSel === e.id, pre = uiChecked && mark ? (mark === "ok" ? "✓ " : "✖ ") : "";
  return `<div class="ui-chip${on ? " sel" : ""}${uiChecked && mark ? " " + mark : ""}" role="button" tabindex="0" draggable="true" data-uid="${e.id}" aria-pressed="${on}">${pre}${esc(e.label)}</div>`;
}

function uiPlace(id, dest){
  if (!elById(id) || (dest !== "pal" && !UI_SCREENS.some(x => x.id === dest))) return;
  const pl = Object.assign({}, getPlace());
  if (dest === "pal"){
    delete pl[id];
    const r = Object.assign({}, getRoute()); if (r[id]){ delete r[id]; sj("route", r) }
  } else pl[id] = dest;
  uiSel = null; uiChecked = false; sj("ui_place", pl); wgDraw();
  say(dest === "pal" ? shortL(elById(id)) + " returned to the list." : shortL(elById(id)) + " added to " + scName(dest) + ".");
  refocus(`[data-uid="${id}"]`);
}
function refocus(q){ const el = document.querySelector(q); if (el) el.focus() }

function mockEl(e){
  const L = esc(shortL(e));
  switch (e.t){
    case "logo":  return '<div class="m-logo">◆ ShopDemo</div>';
    case "nav":   return `<button type="button" class="proto-hotspot m-nav" data-rt="${e.id}">☰ Menu</button>`;
    case "field": return `<div class="m-field"><span>${L}</span><div class="m-box"></div></div>`;
    case "area":  return `<div class="m-field"><span>${L}</span><div class="m-box tall"></div></div>`;
    case "hero":  return '<div class="m-hero">Autumn sale: 20% off</div>';
    case "grid":  return `<div class="m-grid"><button type="button" class="proto-hotspot m-tile" data-rt="${e.id}">Hoodie £18</button><button type="button" class="proto-hotspot m-tile" data-rt="${e.id}">Cap £6</button></div>`;
    case "btn":   return `<button type="button" class="proto-hotspot" data-rt="${e.id}">${L}</button>`;
    case "link":  return '<span class="m-link">Forgot password?</span>';
    case "foot":  return '<div class="m-foot">Help · Returns · Privacy</div>';
    case "list":  return '<div class="m-list"><div><span>Hoodie × 1</span><b>£18</b></div><div><span>Cap × 1</span><b>£6</b></div></div>';
    case "total": return '<div class="m-total">Total £24.00</div>';
  }
  return "";
}

function routePhoneHTML(){
  const pl = getPlace(); let title, body;
  if (rtScreen === "done"){ title = "Order confirmed"; body = '<div class="m-done" aria-hidden="true">✓</div><p style="text-align:center"><b>Thank you!</b><br>Your order is on its way.</p>' }
  else {
    const sc = UI_SCREENS.find(x => x.id === rtScreen) || UI_SCREENS[0]; title = sc.name;
    body = UI_EL.filter(e => pl[e.id] === sc.id).map(mockEl).join("") || '<p class="hint">Nothing on this screen yet. Add elements in the Build tab.</p>';
  }
  const w = walk();
  return `<div class="phone-frame"><div class="phone-screen"><div class="phone-header">${esc(title)}</div><div class="phone-body">${body}</div></div></div>
    <div class="proto-inspector"><h4>Route inspector</h4>
      <p><b>Path so far:</b> ${rtPath.map(x => esc(scName(x))).join(" → ")}</p><p><b>Taps:</b> ${rtTaps}</p>
      ${rtMsg ? `<p class="fb no">${esc(rtMsg)}</p>` : ""}
      <p class="fb ${w.ok ? "ok" : "no"}"><b>Route check:</b> ${w.ok ? `a first-time customer can finish in ${w.path.length - 1} taps.` : esc(w.notes[w.notes.length - 1] || "Link the buttons to build a route.")}</p>
      <button type="button" class="alt" data-rtreset="1">Restart from Home</button></div>`;
}
function rtTap(id){
  const dest = getRoute()[id];
  if (!dest) rtMsg = `“${shortL(elById(id))}” is not linked yet. Choose where it goes in the list above.`;
  else { rtMsg = ""; rtScreen = dest; rtTaps++; rtPath.push(dest); say("Went to " + scName(dest)) }
  const p = $("rt-phone"); if (p){ p.innerHTML = routePhoneHTML(); const f = p.querySelector(".phone-body button"); if (f) f.focus() }
  updXP();
}




const THEMES = ["day","night","contrast"], FONTS = [90,100,110,120,130];
const FIELDS = TABS.flatMap(t => t.fields);
let theme = load("Theme"), fp = +load("Font") || 100, dys = load("Dys") === "true";
let data = {}, cur = 0, spd = 1, dl = null;

if (!THEMES.includes(theme)) theme = null;
if (!FONTS.includes(fp)) fp = 100;

const g = k => String(data[k] || "").trim();
const started = () => FIELDS.some(f => g(f.k));
const persist = () => { store("Data", JSON.stringify({v: CFG.version, data})); try { store("Report", JSON.stringify(model())); } catch {} if (typeof updXP === "function") updXP(); scope.notifySaved(); };

function setTheme(t){
  theme = t; document.documentElement.setAttribute("data-theme", t);
  THEMES.forEach(x => { $("th-"+x).classList.toggle("on", x === t); $("th-"+x).setAttribute("aria-pressed", x === t) });
  store("Theme", t);
}
function applyFont(){ document.documentElement.style.fontSize = fp + "%"; $("fsd").textContent = fp + "%" }
function setFont(d){ const i = FONTS.indexOf(fp) + d; if (i < 0 || i >= FONTS.length) return; fp = FONTS[i]; applyFont(); store("Font", fp); say("Text size " + fp + " percent") }
function setDys(v){ dys = v; document.body.classList.toggle("dys", v); $("dys").classList.toggle("on", v); $("dys").setAttribute("aria-pressed", v); store("Dys", v) }

function drawTabs(){
  $("tabs").innerHTML = TABS.map((t, i) =>
    `<button type="button" role="tab" id="t${i}" aria-controls="panel" aria-selected="${i === cur}" tabindex="${i === cur ? 0 : -1}">${ic(t.icon, t.fb)}${esc(t.title)}</button>`).join("");
  TABS.forEach((t, i) => {
    const b = $("t" + i);
    b.onclick = () => openTab(i);
    b.onkeydown = e => {
      const n = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? TABS.length - 1 : null;
      if (n === null) return; e.preventDefault(); openTab((n + TABS.length) % TABS.length, true);
    };
  });
}

function openTab(i, focus){ stopMic(); stopTTS(); uiSel = null; cur = i; store("Tab", i); drawTabs(); drawPanel(); if (focus) $("t" + i).focus() }

function field(f){
  if (f.hidden) return "";
  const id = "f-" + f.k, d = `id="${id}" data-k="${f.k}" aria-describedby="h-${f.k}"`;
  const chips = f.starters ? `<div class="sel"><label for="s-${f.k}">Add a starter (keyboard: arrows to browse, Enter to add)</label><select id="s-${f.k}" data-s="${f.k}"><option value="">Choose a starter…</option>${f.starters.map((t, i) => `<option value="${i}">${esc(t)}</option>`).join("")}</select></div>` : "";
  return `<label class="f" for="${id}">${esc(f.label)}<span class="hint" id="h-${f.k}">${esc(f.hint || "")}</span></label>` + chips +
    (f.rows ? `<textarea ${d} rows="${f.rows}">${esc(data[f.k])}</textarea>` : `<input type="text" ${d} value="${esc(data[f.k])}">`);
}

function drawPanel(){
  const t = TABS[cur];
  $("panel").setAttribute("aria-labelledby", "t" + cur);
  $("panel").innerHTML = `<h2>${esc(t.title)}</h2><p>${esc(t.intro)}</p>` + (t.reflect
    ? `<div class="ref">${t.fields.map(f => `<div class="rc ${f.cls}">${field(f)}</div>`).join("")}</div><p class="hint cite">${esc(t.cite)}</p>`
    : t.fields.map(field).join(""));
  qa($("panel"), "[data-k]").forEach(el => { el.oninput = () => { data[el.dataset.k] = el.value; persist() } });
  qa($("panel"), "select[data-s]").forEach(sel => {
    const add = () => { if (sel.value === "") return; insertStarter($("f-" + sel.dataset.s), FIELDS.find(x => x.k === sel.dataset.s).starters[+sel.value]); sel.value = ""; sel._nav = false };
    sel.onpointerdown = () => { sel._nav = false };
    sel.onkeydown = e => { if (["ArrowUp","ArrowDown","Home","End","PageUp","PageDown"].includes(e.key)) sel._nav = true; else if (e.key === "Enter"){ e.preventDefault(); add() } };
    sel.onchange = () => { if (!sel._nav) add() };
    sel.onblur = () => { sel._nav = false; sel.value = "" };
  });
  widgetHook(); addMics();
}

function insertStarter(el, t){
  const v = el.value, sep = v && !/\s$/.test(v) ? " " : "";
  el.value = v + sep + t + " "; el.focus(); el.setSelectionRange(el.value.length, el.value.length);
  el.dispatchEvent(new Event("input")); say("Added: " + t.replace(/\.+$/, ""));
}

const hasTTS = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
function readText(){
  const t = TABS[cur];
  return [t.title, t.intro, t.widget && $("wg") ? $("wg").innerText : ""].concat(t.fields.filter(f => !f.hidden).map(f => f.label + ". " + (g(f.k) || "empty"))).filter(Boolean).map(x => /[.?!]$/.test(x) ? x : x + ".").join(" ");
}
function speak(txt){
  if (!hasTTS) return say("Read aloud is not available in this browser.");
  speechSynthesis.cancel(); $("pst").textContent = "Pause";
  const u = new SpeechSynthesisUtterance(txt); u.rate = spd; u.lang = document.documentElement.lang || "en-GB";
  speechSynthesis.speak(u);
}
function stopTTS(){ if (hasTTS) speechSynthesis.cancel(); $("pst").textContent = "Pause" }

const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
let rec = null, recBtn = null;
const micIdle = b => { b.setAttribute("aria-pressed", "false"); b.querySelector("span").textContent = "Dictate" };
function stopMic(){ if (rec){ const r = rec; rec = null; try { r.stop() } catch (e) {} } if (recBtn){ micIdle(recBtn); recBtn = null } }
const labelOf = el => { const l = document.querySelector(`label[for="${el.id}"]`); return l ? l.childNodes[0].textContent : "this field" };
function toggleMic(el, b){
  if (recBtn === b){ stopMic(); return say("Stopped listening") }
  stopMic();
  const r = new SR(), base = el.value, sep = base && !/\s$/.test(base) ? " " : "";
  r.lang = navigator.language || "en-GB"; r.interimResults = true; r.continuous = false;
  r.onresult = e => { let t = ""; for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript; el.value = base + sep + t; el.dispatchEvent(new Event("input")) };
  r.onerror = e => say("Dictation stopped (" + e.error + ").");
  r.onend = () => { if (rec === r){ rec = null; recBtn = null } micIdle(b) };
  try { r.start() } catch (e) { return say("Dictation could not start.") }
  rec = r; recBtn = b; b.setAttribute("aria-pressed", "true"); b.querySelector("span").textContent = "Stop";
  say("Listening. Speak now, then tap Dictate again for more.");
}

function addMics(r){
  if (!SR) return;
  qa(r || $("panel"), "textarea,input[type=text]").forEach(el => {
    if (el.dataset.nomic) return;
    const b = document.createElement("button");
    b.type = "button"; b.className = "alt mic"; b.setAttribute("aria-pressed", "false");
    b.setAttribute("aria-label", "Dictate into " + labelOf(el));
    b.innerHTML = ic("microphone", "🎤") + "<span>Dictate</span>";
    const w = document.createElement("div"); w.className = "ig";
    el.parentNode.insertBefore(w, el); w.append(el, b); b.onclick = () => toggleMic(el, b);
  });
}

function model(){
  const gm = getGame(), pl = getPlace(), rt = getRoute(), wk = walk();
  return {title: g("name") || CFG.title,
    sections: TABS.filter(t => t.fields.some(f => !f.hidden)).map(t => ({h: t.title, rows: t.fields.filter(f => !f.hidden).map(f => [f.label, g(f.k) || "(empty)"])}))
      .concat([{h: "Practice sorter", rows: [["Score", gm.done ? gm.s + " / " + GAME.length + " correct" : "(not finished)"]]},
      {h: "Screen builder", rows: UI_SCREENS.map(sc => [sc.name, UI_EL.filter(e => pl[e.id] === sc.id).map(shortL).join(", ") || "(empty)"])},
      {h: "Purchase route", rows: [["Links", UI_EL.filter(e => e.act && pl[e.id]).map(e => scName(pl[e.id]) + ": " + shortL(e) + " → " + (rt[e.id] ? scName(rt[e.id]) : "(not linked)")).join("\n") || "(none)"], ["Result", wk.ok ? "Route complete in " + (wk.path.length - 1) + " taps" : "Route not complete"]]}])};
}
const stamp = () => new Date().toISOString().slice(0, 10);
const fileName = ext => `${CFG.file}-${stamp()}.${ext}`;

function md(){ const m = model(); return "# " + m.title + "\n\n" + m.sections.map(s => "## " + s.h + "\n\n" + s.rows.map(r => "**" + r[0] + "**\n\n" + r[1]).join("\n\n")).join("\n\n") + "\n" }
const cell = v => { v = String(v); if (/^[=+\-@\t\r]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"' };
function csv(){ const m = model(), o = [["Section","Field","Value"].map(cell).join(",")]; m.sections.forEach(s => s.rows.forEach(r => o.push([s.h, r[0], r[1]].map(cell).join(",")))); return "\uFEFF" + o.join("\r\n") + "\r\n" }

const CRC = (() => { const t = []; for (let n = 0; n < 256; n++){ let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0 } return t })();
const crc32 = u => { let c = 0xFFFFFFFF; for (let i = 0; i < u.length; i++) c = CRC[(c ^ u[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0 };
function zipBlob(files, mime){
  const enc = new TextEncoder(), parts = [], cd = []; let off = 0;
  files.forEach(f => {
    const name = enc.encode(f[0]), d = enc.encode(f[1]), crc = crc32(d);
    const h = new DataView(new ArrayBuffer(30));
    h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(12, 0x21, true);
    h.setUint32(14, crc, true); h.setUint32(18, d.length, true); h.setUint32(22, d.length, true); h.setUint16(26, name.length, true);
    parts.push(h.buffer, name, d);
    const c = new DataView(new ArrayBuffer(46));
    c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(14, 0x21, true);
    c.setUint32(16, crc, true); c.setUint32(20, d.length, true); c.setUint32(24, d.length, true); c.setUint16(28, name.length, true); c.setUint32(42, off, true);
    cd.push(c.buffer, name); off += 30 + name.length + d.length;
  });
  let len = 0; cd.forEach(b => len += b.byteLength);
  const e = new DataView(new ArrayBuffer(22));
  e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, len, true); e.setUint32(16, off, true);
  return new Blob(parts.concat(cd, [e.buffer]), {type: mime});
}

const xe = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
const wp = (t, o = {}) => String(t).split(/\r?\n/).map(l => `<w:p><w:r><w:rPr>${o.b ? "<w:b/>" : ""}${o.c ? `<w:color w:val="${o.c}"/>` : ""}<w:sz w:val="${o.sz || 22}"/></w:rPr><w:t xml:space="preserve">${xe(l)}</w:t></w:r></w:p>`).join("");
const wt = rows => `<w:tbl><w:tblPr><w:tblW w:w="9000" w:type="dxa"/><w:tblBorders>${["top","left","bottom","right","insideH","insideV"].map(b => `<w:${b} w:val="single" w:sz="4" w:color="94A3B8"/>`).join("")}</w:tblBorders></w:tblPr><w:tblGrid><w:gridCol w:w="2400"/><w:gridCol w:w="6600"/></w:tblGrid>${rows.map(r => `<w:tr>${r.map((c, i) => `<w:tc><w:tcPr><w:tcW w:w="${i ? 6600 : 2400}" w:type="dxa"/></w:tcPr>${wp(c, {b: !i})}</w:tc>`).join("")}</w:tr>`).join("")}</w:tbl>`;

function docx(){
  const m = model(), X = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>';
  const body = wp(m.title, {b: 1, sz: 44}) + m.sections.map(s => wp(s.h, {b: 1, sz: 30, c: "0E7490"}) + wt(s.rows) + wp("")).join("");
  return zipBlob([
    ["[Content_Types].xml", X + '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>'],
    ["_rels/.rels", X + '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'],
    ["word/document.xml", X + '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' + body + '</w:body></w:document>']
  ], "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
}

function pptx(){
  const m = model(), p = new PptxGenJS(); p.layout = "LAYOUT_WIDE";
  const H = t => ({text: t, options: {bold: true, color: "FFFFFF", fill: {color: "0E7490"}}});
  const t = p.addSlide(); t.background = {color: "0B0F1A"};
  t.addText(m.title, {x: .6, y: 2.4, w: 12, h: 1, fontSize: 40, bold: true, color: "FFFFFF", fontFace: "Calibri"});
  t.addText(CFG.title, {x: .6, y: 3.5, w: 12, h: .8, fontSize: 20, color: "00E5FF", fontFace: "Calibri"});
  m.sections.forEach(s => {
    const a = p.addSlide();
    a.addText(s.h, {x: .5, y: .25, w: 12.3, h: .7, fontSize: 26, bold: true, color: "0F172A", fontFace: "Calibri"});
    a.addTable([[H("Field"), H("Response")]].concat(s.rows.map(r => [{text: r[0], options: {bold: true}}, {text: r[1]}])),
      {x: .5, y: 1.1, w: 12.3, colW: [2.8, 9.5], fontSize: 12, fontFace: "Calibri", color: "0F172A", border: {type: "solid", color: "94A3B8", pt: 1}, valign: "top", autoPage: true});
  });
  return p.write({outputType: "blob"});
}

function pdf(){
  const m = model(), d = new window.jspdf.jsPDF({unit: "mm", format: "a4"}), L = 15, W = 180; let y = 20;
  const room = h => { if (y + h > 282){ d.addPage(); y = 20 } };
  d.setFont("helvetica", "bold"); d.setFontSize(20); d.setTextColor(14, 116, 144);
  d.splitTextToSize(m.title, W).forEach(l => { room(9); d.text(l, L, y); y += 9 }); y += 4;
  m.sections.forEach(s => {
    room(14); d.setFont("helvetica", "bold"); d.setFontSize(14); d.setTextColor(14, 116, 144); d.text(s.h, L, y); y += 8;
    s.rows.forEach(r => {
      d.setFontSize(11); d.setTextColor(30); d.setFont("helvetica", "bold"); room(6); d.text(r[0], L, y); y += 5.5;
      d.setFont("helvetica", "normal"); d.splitTextToSize(r[1], W).forEach(l => { room(5.5); d.text(l, L, y); y += 5.5 }); y += 2;
    }); y += 4;
  });
  return d.output("blob");
}

const EXPORTS = [
  {id:"pptx", label:"PowerPoint (.pptx)", desc:"Title slide and one slide per section", ic:"file-powerpoint", fb:"▦", lib:() => window.PptxGenJS, build:pptx},
  {id:"docx", label:"Word (.docx)",       desc:"Report with a table per section",       ic:"file-word",       fb:"📝", build:docx},
  {id:"pdf",  label:"PDF (.pdf)",         desc:"Ready to print or share",               ic:"file-pdf",        fb:"📕", lib:() => window.jspdf, build:pdf},
  {id:"csv",  label:"CSV (.csv)",         desc:"Opens in Excel or Google Sheets",       ic:"file-csv",        fb:"▤",  build:() => new Blob([csv()], {type:"text/csv;charset=utf-8"})},
  {id:"md",   label:"Markdown (.md)",     desc:"Plain text with headings",              ic:"file-lines",      fb:"📄", build:() => new Blob([md()], {type:"text/markdown;charset=utf-8"})}
];

function save(name, body){
  if (dl) return dl.save({filename: name, data: body}).then(() => say("Saved " + name), e => say(e && e.code === "declined" ? "Save cancelled." : "This view could not save the file."));
  try {
    const b = body instanceof Blob ? body : new Blob([body], {type: "text/plain;charset=utf-8"}), a = document.createElement("a");
    a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000); say("Saved " + name);
  } catch (e) { say("This view could not save the file.") }
}
function runExport(x){
  if (!started()) return say("Fill in part of the form first.");
  if (x.lib && !x.lib()) return say(x.label + " is still loading or was blocked. Try again, or choose another format.");
  Promise.resolve().then(x.build).then(b => save(fileName(x.id), b)).catch(e => { console.warn(e); say("Could not build the " + x.id.toUpperCase() + " file.") });
}
function copyText(){
  if (!started()) return say("Fill in part of the form first.");
  if (navigator.clipboard) navigator.clipboard.writeText(md()).then(() => say("Copied to clipboard"), () => say("Could not copy"));
  else say("Copy is not available in this browser.");
}

function backup(){
  if (!started()) return say("Nothing to back up yet.");
  save(`${CFG.file}-backup-${stamp()}.json`, new Blob([JSON.stringify({app: CFG.pfx, version: CFG.version, saved: new Date().toISOString(), data, prefs: {theme, font: fp, dys}}, null, 2)], {type: "application/json;charset=utf-8"}));
}
function importBackup(f){
  if (!f) return;
  if (f.size > 2e6) return say("That file is too large to be a backup.");
  const r = new FileReader(); r.onerror = () => say("That file could not be read.");
  r.onload = () => {
    try {
      const d = JSON.parse(r.result);
      if (!d || d.app !== CFG.pfx || typeof d.data !== "object") throw 0;
      if (d.version > CFG.version) return say("That backup is from a newer version of this app.");
      if (started() && !confirm("Replace what is on this device with the backup?")) return say("Import cancelled. Nothing changed.");
      data = {}; FIELDS.forEach(fl => { if (typeof d.data[fl.k] === "string") data[fl.k] = d.data[fl.k].slice(0, 5000) });
      persist(); drawPanel(); say("Backup imported.");
    } catch (e) { say("That does not look like a backup from this app.") }
  };
  r.readAsText(f);
}

let opener = null; const BG = ["header", "main"];
const mEls = () => qa($("mdl"), "button").filter(b => !b.disabled && b.offsetParent !== null);

function openExportModal(){
  const n = started(); opener = document.activeElement;
  $("mt").textContent = "Export";
  $("mc").textContent = n ? "Your work is ready to export. Choose a format:" : "Fill in part of the form first, then come back to export.";
  $("mo").style.display = "block";
  $("modal-backup-section").style.display = "block";
  $("modal-body-extra").innerHTML = "";
  qa($("mo"), "button").forEach(b => b.disabled = !n); $("bks").disabled = !n;
  $("mdl").hidden = false; BG.forEach(q => document.querySelector(q).inert = true);
  (mEls()[0] || $("xcl")).focus();
}

function openChallengeModal(keepId){
  if ($("mdl").hidden) opener = document.activeElement;
  $("mt").textContent = "🐛 Bug Hunt Challenge Modal";
  $("mc").textContent = "Test your knowledge! Click the buttons below. Some are true bugs, but others are false alarms (good practices)!";
  $("mo").style.display = "none";
  $("modal-backup-section").style.display = "none";
  
  const found = getFoundBugs();
  const falseAlarms = getFalseAlarms();
  const count = Object.keys(found).length;
  
  $("modal-body-extra").innerHTML = `
    <p><b>Real Bugs Found: ${count} / 3 | False Alarms Triggered: ${Object.keys(falseAlarms).length}</b></p>
    <div class="wf-grid">${WIREFRAME_CHALLENGES.map(ex => `
      <div class="wf-card">
        <span class="wf-badge">${esc(ex.screen)}</span>${ex.svgLarge}
        <div style="display:flex;flex-direction:column;gap:6px">
          ${ex.bugs.map(bug => {
            const isFound = found[bug.id];
            const isFalse = falseAlarms[bug.id];
            let btnClass = "";
            if (isFound) btnClass = " found";
            if (isFalse) btnClass = " false-alarm";
            return `<button type="button" class="bug-btn${btnClass}" data-bug="${bug.id}">
              <span><i class="fa-solid fa-${isFound ? "check" : isFalse ? "triangle-exclamation" : "bug"}" aria-hidden="true"></i> ${esc(bug.title)}</span>
              <div class="bug-reveal">${esc(bug.hint)}</div>
            </button>`;
          }).join("")}
        </div>
      </div>
    `).join("")}</div>`;
  
  $("mdl").hidden = false; BG.forEach(q => document.querySelector(q).inert = true);
  const firstBtn = (keepId && $("mdl").querySelector(`[data-bug="${keepId}"]`)) || mEls()[0];
  if (firstBtn) firstBtn.focus();
}

function closeM(){ 
  $("mdl").hidden = true; 
  BG.forEach(q => document.querySelector(q).inert = false); 
  if (opener && opener.focus) opener.focus(); 
  if (TABS[cur].widget === "bug_theory") drawPanel(); 
}

function getGame(){
  const g0 = pj("gm", {});
  const ok = g0.o && Array.isArray(g0.o) && g0.o.length === GAME.length && g0.o.every(n => Number.isInteger(n) && n >= 0 && n < GAME.length);
  return { o: ok ? g0.o : shuf(GAME.map((_, i) => i)), i: Math.min(+g0.i || 0, GAME.length - 1), s: Math.min(Math.max(+g0.s || 0, 0), GAME.length), done: g0.done ? 1 : 0, picks: g0.picks && typeof g0.picks === "object" && !Array.isArray(g0.picks) ? g0.picks : {} };
}

function updXP(){
  const el = $("xp"); if (!el) return;
  const total = FIELDS.filter(f => !f.hidden).length, txt = FIELDS.filter(f => !f.hidden && g(f.k)).length, gm = getGame();
  const foundCount = Object.keys(getFoundBugs()).length;
  const ui = uiReport(), won = routeWon();
  const xp = txt * 5 + gm.s * 10 + foundCount * 20 + ui.correct * 2 + (won ? 30 : 0) + Math.min(protoClicks, 10) * 2, lv = LEVELS.filter(l => xp >= l[1]).pop() || LEVELS[0];
  el.innerHTML = `<b>⭐ ${xp} XP</b><span>Rank: ${esc(lv[0])}</span><span class="bdg${foundCount >= 3 ? " on" : ""}">🐛 Bugs ${foundCount} / 3</span><span class="bdg${ui.complete ? " on" : ""}">🧩 Screens ${ui.complete ? "built" : ui.placed + " placed"}</span><span class="bdg${won ? " on" : ""}">🛒 Route ${won ? "complete" : "open"}</span><span class="bdg${gm.done ? " on" : ""}">🎯 Sorter ${gm.done ? "complete" : "locked"}</span>`;
  updTicks();
}

function tabDone(i){
  const t = TABS[i], w = t.widget;
  if (w === "tutorial") return load("TutDone") === "1";
  if (w === "bug_theory") return Object.keys(getFoundBugs()).length >= 3;
  if (w === "game") return getGame().done === 1;
  if (w === "ui_builder") return uiReport().complete;
  if (w === "route") return routeWon();
  return t.fields.some(f => !f.hidden && g(f.k));
}

function updTicks(){
  TABS.forEach((t, i) => {
    const b = $("t" + i); if (!b) return;
    const d = tabDone(i), s = b.querySelector(".dn");
    if (d && !s) b.insertAdjacentHTML("beforeend", '<span class="dn"><span aria-hidden="true">✓</span><span class="sr"> done</span></span>');
    else if (!d && s) s.remove();
  });
}

function navBar(){
  const p = $("panel"); if (!p) return;
  const pr = TABS[cur - 1], nx = TABS[cur + 1];
  p.insertAdjacentHTML("beforeend", `<div class="row pnav">${pr ? `<button type="button" class="alt" data-nav="-1"><span aria-hidden="true">←</span> Back: ${esc(pr.title)}</button>` : "<span></span>"}${nx ? `<button type="button" class="alt" data-nav="1">Next: ${esc(nx.title)} <span aria-hidden="true">→</span></button>` : `<button type="button" class="alt" data-nav="x">Done: export your work…</button>`}</div>`);
  qa(p, "[data-nav]").forEach(b => b.onclick = () => { if (b.dataset.nav === "x") return $("xopen").click(); openTab(cur + +b.dataset.nav, true); if ($("tabs").scrollIntoView) $("tabs").scrollIntoView({ block: "start" }) });
}

function tutPrompt(){
  const el = $("tp"); if (!el || load("Seen") === "1") return;
  el.innerHTML = `<div class="tp" role="region" aria-label="Welcome"><p><b>New here?</b> Take the 2-minute tutorial first. It shows the method in four steps, with a worked example and the key reading.</p><div class="row"><button type="button" id="tpy">Take the tutorial</button><button type="button" class="alt" id="tpn">Skip for now</button></div></div>`;
  const close = m => { store("Seen", "1"); el.innerHTML = ""; say(m) };
  $("tpy").onclick = () => { close("Starting the tutorial."); openTab(0, true) };
  $("tpn").onclick = () => close("Skipped. The tutorial is always in the first tab.");
}

/* Widget Renderers */
function wTut(){
  const done = load("TutDone") === "1";
  return `<h3 class="wh">How the method works</h3>` +
    `<ol class="steps">${TUT_STEPS.map((s, i) => `<li><b>${esc(s.t)}</b> — ${esc(s.d)}</li>`).join("")}</ol>` +
    `<h3 class="wh">Worked example</h3><ul class="ex">${TUT_EX.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` +
    `<h3 class="wh">Try the worked example</h3><p class="hint">Tap through the three screens of this prototype. Which button would a first-time player press, and why?</p>` + wInteractiveFlow(true) +
    `<h3 class="wh">Key reading</h3><p><b>${esc(READING.title)}</b></p><p><a href="${esc(READING.url)}" target="_blank" rel="noopener">${esc(READING.url)}</a></p><p class="hint">${esc(READING.summary)}</p>` +
    `<div class="watch"><b>Watch for:</b> ${esc(WATCH)}</div>` +
    `<div class="row"><button type="button" data-a="td">${done ? "Tutorial completed ✓" : "Mark tutorial as read"}</button></div>`;
}

function wTheory(){
  const found = getFoundBugs();
  const count = Object.keys(found).length;
  return `<h3 class="wh">Enlarged Wireframe Examples & Bug Hunting Theory</h3>` +
    `<p>Study the enlarged wireframe examples below carefully. When reviewing prototypes, you must distinguish between <b>real usability flaws</b> and <b>sound design practices</b> (avoid false alarms!).</p>` +
    `<div class="wf-grid">${WIREFRAME_CHALLENGES.map(ex => `
      <div class="wf-card">
        <span class="wf-badge">${esc(ex.screen)}</span>${ex.svgLarge}
        <p style="font-size:0.9375rem;margin:0"><b>Focus:</b> ${esc(ex.desc)}</p>
      </div>
    `).join("")}</div>` +
    `<div class="watch"><b>Ready to test your analytical skills?</b> Launch the challenge modal to evaluate statements for each wireframe screen and find the 3 real bugs while avoiding false alarms!</div>` +
    `<div class="row"><button type="button" data-a="launch_challenge"><i class="fa-solid fa-bug" aria-hidden="true"></i> Launch Bug Hunt Challenge (${count} / 3 real bugs found)</button></div>`;
}

function wInteractiveFlow(bare){
  let screenTitle = "", bodyContent = "";
  if(currentProtoScreen === 1) {
    screenTitle = "Screen 1: Home";
    bodyContent = `<p style="font-size:0.85rem">Welcome to Esports Arena</p>
      <button type="button" class="proto-hotspot danger" data-protogo="2">Play (Misleading Label)</button>
      <button type="button" class="proto-hotspot" data-protogo="2">Learn to Play (Clear CTA)</button>`;
  } else if(currentProtoScreen === 2) {
    screenTitle = "Screen 2: Tutorial Hub";
    bodyContent = `<p style="font-size:0.85rem">Select a category:</p>
      <button type="button" class="proto-hotspot" data-protogo="3">Beginner Tutorial</button>
      <button type="button" class="proto-hotspot" data-protogo="1">← Back to Home</button>`;
  } else if(currentProtoScreen === 3) {
    screenTitle = "Screen 3: First Lesson";
    bodyContent = `<p style="font-size:0.85rem">Lesson 1: Controls & Map</p>
      <p style="font-size:0.75rem;color:var(--mu)">Welcome to your first match setup...</p>
      <button type="button" class="proto-hotspot" data-protogo="1">Finish Task ✓</button>`;
  }

  return (bare ? "" : `<h3 class="wh">Interactive Device Prototype Simulator</h3>
    <p class="hint">Click the active hotspots inside the device screen below to test user navigation and screen transitions live.</p>`) + `
    <div class="proto-container">
      <div class="phone-frame">
        <div class="phone-screen">
          <div class="phone-header">${esc(screenTitle)}</div>
          <div class="phone-body">${bodyContent}</div>
        </div>
      </div>
      <div class="proto-inspector">
        <h4>Prototype Inspector</h4>
        <p><b>Current Screen:</b> Screen ${currentProtoScreen}</p>
        <p><b>Total Navigation Clicks:</b> ${protoClicks}</p>
        <p class="hint">Goal: Ensure the route from Screen 1 to Screen 3 is frictionless and obvious to a first-time user.</p>
        <button type="button" class="alt" data-protoreset="1">Reset Simulator</button>
      </div>
    </div>`;
}

function wUiBuilder(){
  const pl = getPlace(), rep = uiReport(), left = UI_EL.filter(e => !pl[e.id]), sel = uiSel ? elById(uiSel) : null;
  const pal = `<div class="ui-pal" data-drop="pal"><h4>Elements (${left.length} left)</h4>${left.map(e => uiChip(e, "")).join("") || '<p class="hint">All elements are placed.</p>'}${sel && pl[sel.id] ? `<button type="button" class="alt ui-add" data-uiadd="pal">Return “${esc(shortL(sel))}” to the list</button>` : ""}</div>`;
  const scr = rep.per.map(p => `<section class="ui-scr" data-drop="${p.sc.id}" aria-label="${esc(p.sc.name)} screen"><h4>${p.sc.icon} ${esc(p.sc.name)}</h4>${p.here.map(e => uiChip(e, e.s === p.sc.id ? "ok" : "bad")).join("") || '<p class="hint">Drop elements here</p>'}${sel ? `<button type="button" class="alt ui-add" data-uiadd="${p.sc.id}">Add “${esc(shortL(sel))}” here</button>` : ""}</section>`).join("");
  let fb = "";
  if (uiChecked){
    const li = rep.per.map(p => { const b = [];
      if (p.wrong.length) b.push("✖ Does not belong here: " + p.wrong.map(shortL).join(", ") + ".");
      if (p.need.length) b.push("Still needs: " + p.need.map(shortL).join(", ") + ".");
      return `<li><b>${esc(p.sc.name)}:</b> ${esc(b.length ? b.join(" ") : "✓ Looks complete.")}</li>` }).join("");
    fb = `<div class="fb ${rep.complete ? "ok" : "no"}"><b>${rep.complete ? "All four screens are built correctly. Now connect them into a purchase route in the next tab." : "Not there yet."}</b><ul>${li}</ul></div>`;
  }
  return `<h3 class="wh">UI builder</h3>` +
    `<p class="hint">${sel ? `Selected: <b>${esc(sel.label)}</b>. Tap “Add here” on a screen, or drag it there.` : "Drag each element onto the screen where it belongs. On a phone or with a keyboard, select an element, then use the “Add here” button on a screen."}</p>` +
    `<div class="ui-wrap">${pal}<div class="ui-screens">${scr}</div></div>` +
    `<p class="hint">${rep.correct} of ${UI_EL.length} elements on the right screen.</p>${fb}` +
    `<div class="row"><button type="button" data-a="ui_check">Check my screens</button><button type="button" class="alt" data-a="ui_reset">Reset builder</button></div>`;
}

function wRoute(){
  const pl = getPlace(), rt = getRoute(), acts = UI_EL.filter(e => e.act && pl[e.id]);
  const head = `<h3 class="wh">Connect the screens</h3><div class="watch"><b>Customer goal:</b> start on Home, buy something and reach “Order confirmed”. Link every button so the route has no dead ends.</div>`;
  if (!acts.length) return head + '<p class="fb no">No buttons placed yet. Go to “Build the screens”, add the buttons (Shop now, Log in, Pay now…) to their screens, then come back.</p>';
  const rows = UI_SCREENS.map(sc => { const a = acts.filter(e => pl[e.id] === sc.id); if (!a.length) return "";
    return `<div class="tp"><h4>${sc.icon} On ${esc(sc.name)}</h4>${a.map(e => `<div class="rt-row"><label for="rl-${e.id}">${esc(shortL(e))} goes to</label><select id="rl-${e.id}" data-rl="${e.id}"><option value="">— not linked —</option>${ROUTE_DESTS.map(d => `<option value="${d.id}"${rt[e.id] === d.id ? " selected" : ""}>${esc(d.name)}</option>`).join("")}</select></div>`).join("")}</div>` }).join("");
  return head + rows + `<h3 class="wh">Try your route</h3><p class="hint">Tap the buttons in the phone. Where you linked them, they work; where you did not, you will see what a customer sees.</p><div class="proto-container" id="rt-phone">${routePhoneHTML()}</div>`;
}

function wTestSandbox(){
  const built = Object.keys(getPlace()).length;
  const res = testSim ? `<div class="fb ${testSim.ok ? "ok" : "no"}" style="margin-top:14px"><b>${esc(testSim.title)}</b><ol class="steps">${testSim.lines.map(l => `<li>${esc(l)}</li>`).join("")}</ol><p>${esc(testSim.verdict)}</p></div><div class="row"><button type="button" class="alt" data-a="sim_notes">Add this result to my test notes</button></div>` : "";
  return `<h3 class="wh">Test your purchase route</h3>
    <p class="hint">The simulator plays P1, a first-time customer who wants to buy something. It follows the most obvious button on each screen of the prototype you built.</p>
    ${built ? "" : '<p class="fb no">You have not built any screens yet. Build them, then link the route, then come back to test.</p>'}
    <div class="row"><button type="button" data-a="run_sim_unguided">Run unguided test (best practice)</button><button type="button" class="alt" data-a="run_sim_guided">Run guided test (biased prompting)</button></div>${res}`;
}

function wLearn(){
  return `<h3 class="wh">The key idea</h3><p>${esc(READING.summary)}</p>` +
    `<div class="watch"><b>Watch for:</b> ${esc(WATCH)}</div>` +
    `<h3 class="wh">Same screen, two levels of detail</h3><div class="row" role="group" aria-label="Prototype detail level"><button type="button" class="${fidelity === "lo" ? "" : "alt"}" aria-pressed="${fidelity === "lo"}" data-a="fid_lo">Paper sketch</button><button type="button" class="${fidelity === "hi" ? "" : "alt"}" aria-pressed="${fidelity === "hi"}" data-a="fid_hi">Clickable mock</button></div>` +
    `<div class="m-wrap${fidelity === "lo" ? " lofi" : ""}"><div class="m-logo">◆ ShopDemo</div><div class="m-field"><span>Email</span><div class="m-box"></div></div><div class="m-field"><span>Password</span><div class="m-box"></div></div><div class="m-btn">Log in</div></div>` +
    `<p class="hint">Both versions answer the same test question: can a customer see how to log in? The sketch takes minutes and finds the same problems, so polish can wait.</p>` +
    `<p class="hint">Now explain the idea in your own words in the box below. Aim for one or two sentences a peer could follow.</p>`;
}

function wGame(){
  const gm = getGame();
  if (gm.done) return `<h3 class="wh">Results</h3><p><b>${gm.s} out of ${GAME.length}</b> sorted correctly.</p>` +
    `<p class="hint">${gm.s === GAME.length ? "Full marks. You can tell strong evidence from risky shortcuts." : gm.s >= GAME.length / 2 ? "A solid start. Review the ones you missed, then take another round." : "Revisit the tutorial and the worked example, then try another round."}</p>` +
    `<div class="row"><button type="button" data-a="gr">Shuffle and retake</button></div>`;
  const idx = gm.o[gm.i], st = GAME[idx], picked = gm.picks[idx];
  let h = `<h3 class="wh">Sort the practice (${gm.i + 1} of ${GAME.length})</h3>` +
    `<p class="hint">Is this good research practice for ${esc(GAME_TITLE)}, or a risky shortcut?</p>` +
    `<div class="stmt">${esc(st[0])}</div>`;
  if (picked !== undefined){
    const ok = picked === st[1];
    h += `<div class="fb ${ok ? "ok" : "no"}"><b>${ok ? "Correct." : "Not quite."}</b> ${esc(st[2])}</div>` +
      `<div class="row"><button type="button" data-a="gn">${gm.i >= GAME.length - 1 ? "See results" : "Next statement"}</button></div>`;
  } else {
    h += `<div class="sortrow"><button type="button" class="alt" data-a="gp" data-v="good">✓ Good practice</button><button type="button" class="alt" data-a="gp" data-v="risk">✖ Risky shortcut</button></div>`;
  }
  return h + `<p class="hint">Score so far: ${gm.s}.</p>`;
}

function widgetHook(){ updXP(); navBar(); if (!TABS[cur].widget) return; $("panel").querySelector("p").insertAdjacentHTML("afterend", '<div id="wg" class="wg"></div>'); wgDraw() }

function wgDraw(){
  const el = $("wg"); if (!el || !TABS[cur].widget) return;
  el.innerHTML = ({ tutorial: wTut, bug_theory: wTheory, learn: wLearn, game: wGame, interactive_flow: wInteractiveFlow, test_sandbox: wTestSandbox, ui_builder: wUiBuilder, route: wRoute })[TABS[cur].widget]();
  updXP();
}

function handleBugClick(id){
  let targetBug = null;
  for (const c of WIREFRAME_CHALLENGES) {
    const found = c.bugs.find(b => b.id === id);
    if (found) { targetBug = found; break; }
  }
  if (!targetBug) return;

  if (targetBug.isBug) {
    const found = Object.assign({}, getFoundBugs());
    if (found[id]) delete found[id]; else found[id] = true;
    sj("found_bugs", found);
    say(found[id] ? "Correct! Real bug logged." : "Bug unchecked.");
  } else {
    const fa = Object.assign({}, getFalseAlarms());
    if (fa[id]) delete fa[id]; else fa[id] = true;
    sj("false_alarms", fa);
    say(fa[id] ? "False alarm! That is actually a good design practice." : "Unchecked.");
  }
  openChallengeModal(id);
}

function act(a, v) {
  if (a === "td") { store("TutDone", "1"); wgDraw(); return say("Tutorial complete"); }
  if (a === "gr") { sj("gm", { o: shuf(GAME.map((_, i) => i)), i: 0, s: 0, done: 0, picks: {} }); wgDraw(); return say("Sorter reset"); }
  if (a === "gp") {
    const gm = getGame(), idx = gm.o[gm.i], st = GAME[idx];
    gm.picks[idx] = v;
    if (v === st[1]) gm.s++;
    sj("gm", gm); wgDraw(); return;
  }
  if (a === "gn") {
    const gm = getGame();
    if (gm.i >= GAME.length - 1) gm.done = 1; else gm.i++;
    sj("gm", gm); wgDraw(); return;
  }
  if (a === "ui_check") { uiChecked = true; wgDraw(); return say(uiReport().complete ? "All screens built correctly." : "Checked. Some elements are in the wrong place or missing.") }
  if (a === "ui_reset") { uiSel = null; uiChecked = false; sj("ui_place", {}); sj("route", {}); wgDraw(); return say("Builder reset.") }
  if (a === "fid_lo" || a === "fid_hi") { fidelity = a === "fid_lo" ? "lo" : "hi"; wgDraw(); refocus(`[data-a="${a}"]`); return say(fidelity === "lo" ? "Showing the paper sketch." : "Showing the clickable mock.") }
  if (a === "run_sim_unguided" || a === "run_sim_guided") { testSim = runSim(a === "run_sim_guided"); wgDraw(); return say(testSim.title) }
  if (a === "sim_notes" && testSim) {
    data.pr_test = (g("pr_test") ? g("pr_test") + "\n" : "") + testSim.title + ". " + testSim.lines.join(" ") + " " + testSim.verdict;
    persist(); drawPanel(); return say("Added to your test notes.");
  }
}

function boot(){
  try {const saved=JSON.parse(load("Data")||"null");if(saved?.data && saved.v<=CFG.version){data=Object.fromEntries(Object.entries(saved.data).filter(([,value])=>typeof value==="string"&&value.length<=1500000));}} catch {}

  try { const s = JSON.parse(load("Data") || "null"); if (s && s.data && s.v <= CFG.version) FIELDS.forEach(f => { if (typeof s.data[f.k] === "string") data[f.k] = s.data[f.k] }) } catch (e) {}
   $("kick").textContent = CFG.kicker; $("ttl").textContent = CFG.title; $("sub").textContent = CFG.sub;
  


  
  $("rd").onclick = () => speak(readText());
  $("ps").onclick = () => { if (!hasTTS) return; if (speechSynthesis.paused){ speechSynthesis.resume(); $("pst").textContent = "Pause" } else if (speechSynthesis.speaking){ speechSynthesis.pause(); $("pst").textContent = "Resume" } };
  $("st").onclick = stopTTS;
  $("sp").onchange = () => { spd = +$("sp").value };
  addEventListener("pagehide", () => { stopTTS(); stopMic() });
  
  $("dh").textContent = SR ? "Tip: tap Dictate under any box and speak." : "Dictation is not supported in this browser.";
  
  $("mo").innerHTML = EXPORTS.map(x => `<button type="button" class="alt opt" id="x-${x.id}">${ic(x.ic, x.fb)}<span>${esc(x.label)}<small>${esc(x.desc)}</small></span></button>`).join("");
  EXPORTS.forEach(x => $("x-" + x.id).onclick = () => { closeM(); runExport(x) });
  $("xopen").onclick = openExportModal; $("xcl").onclick = closeM; $("xcp").onclick = copyText; $("xpr").onclick = () => window.print();
  $("bks").onclick = () => { closeM(); backup() };
  $("bki").onclick = () => $("bkf").click();
  $("bkf").onchange = function(){ closeM(); importBackup(this.files[0]); this.value = "" };
  
  $("mdl").onclick = e => { if (e.target === $("mdl")) { closeM(); return; } };

  document.addEventListener("click", e => {
    const chip = e.target.closest("[data-uid]");
    if (chip) { const id = chip.dataset.uid; uiSel = uiSel === id ? null : id; wgDraw(); refocus(`[data-uid="${id}"]`); say(uiSel ? "Selected " + shortL(elById(id)) : "Deselected"); return; }
    const addBtn = e.target.closest("button[data-uiadd]");
    if (addBtn && uiSel) { uiPlace(uiSel, addBtn.dataset.uiadd); return; }
    const rtBtn = e.target.closest("button[data-rt]");
    if (rtBtn) { rtTap(rtBtn.dataset.rt); return; }
    const rtReset = e.target.closest("button[data-rtreset]");
    if (rtReset) { rtScreen = "home"; rtTaps = 0; rtPath = ["home"]; rtMsg = ""; $("rt-phone").innerHTML = routePhoneHTML(); updXP(); say("Restarted from Home."); return; }
    const launchBtn = e.target.closest("button[data-a='launch_challenge']");
    if (launchBtn) { openChallengeModal(); return; }
    const bugBtn = e.target.closest("button[data-bug]");
    if (bugBtn && !$("mdl").hidden) { handleBugClick(bugBtn.dataset.bug); return; }
    const resetBtn = e.target.closest("button[data-protoreset]");
    if (resetBtn) { currentProtoScreen = 1; protoClicks = 0; wgDraw(); say("Simulator reset to Screen 1."); return; }
    const protoBtn = e.target.closest("button[data-protogo]");
    if (protoBtn) {
      currentProtoScreen = +protoBtn.dataset.protogo;
      protoClicks++;
      wgDraw();
      say("Navigated to prototype screen " + currentProtoScreen);
      return;
    }
    const actBtn = e.target.closest("button[data-a]");
    if (actBtn) {
      act(actBtn.dataset.a, actBtn.dataset.v);
      return;
    }
  });

  document.addEventListener("keydown", e => { const c = e.target.closest && e.target.closest("[data-uid]"); if (c && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); c.click() } });
  document.addEventListener("dragstart", e => { const c = e.target.closest && e.target.closest("[data-uid]"); if (!c || !e.dataTransfer) return; e.dataTransfer.setData("text/plain", c.dataset.uid); e.dataTransfer.effectAllowed = "move" });
  document.addEventListener("dragover", e => { const z = e.target.closest && e.target.closest("[data-drop]"); if (!z) return; e.preventDefault(); z.classList.add("ui-over") });
  document.addEventListener("dragleave", e => { const z = e.target.closest && e.target.closest("[data-drop]"); if (z && !z.contains(e.relatedTarget)) z.classList.remove("ui-over") });
  document.addEventListener("drop", e => { const z = e.target.closest && e.target.closest("[data-drop]"); if (!z) return; e.preventDefault(); z.classList.remove("ui-over"); const id = e.dataTransfer && e.dataTransfer.getData("text/plain"); if (id) uiPlace(id, z.dataset.drop) });
  document.addEventListener("change", e => {
    const sl = e.target.closest && e.target.closest("select[data-rl]"); if (!sl) return;
    const r = Object.assign({}, getRoute()); if (sl.value) r[sl.dataset.rl] = sl.value; else delete r[sl.dataset.rl];
    sj("route", r); const p = $("rt-phone"); if (p) p.innerHTML = routePhoneHTML(); say(sl.value ? "Linked to " + scName(sl.value) : "Link removed");
  });

  $("mdl").onkeydown = e => {
    if (e.key === "Escape"){ e.preventDefault(); closeM(); return }
    if (e.key !== "Tab") return;
    const f = mEls(); if (!f.length) return; const i = f.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0){ e.preventDefault(); f[f.length - 1].focus() } else if (!e.shiftKey && i === f.length - 1){ e.preventDefault(); f[0].focus() }
  };
  $("clr").onclick = () => { if (!confirm("Clear everything you have written? This cannot be undone.")) return; data = {}; uiSel = null; uiChecked = false; rtScreen = "home"; rtTaps = 0; rtPath = ["home"]; rtMsg = ""; testSim = null; protoClicks = 0; currentProtoScreen = 1; persist(); openTab(0); say("Everything cleared") };
  

  
  { const lt = load("Tab"), n = lt === null ? NaN : +lt; cur = load("Seen") !== "1" ? 0 : (Number.isInteger(n) && n >= 0 && n < TABS.length ? n : 0); }
  drawTabs(); drawPanel(); tutPrompt();
  if (window.claude && claude.use) claude.use("downloads").then(d => { if (d) dl = d }, () => {});
}

boot();

return {dispose(){stopMic();stopTTS();scope.dispose();}};
};
