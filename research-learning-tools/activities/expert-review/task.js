// Synced from Activity_07_Expert_Review_Lab__UI_Audit_Triage.html; library scope isolates DOM, callbacks and timers.
window.RESEARCH_TASKS["expert-review"] = function(scope){
const window=scope.window, document=scope.document;
const addEventListener=scope.addEventListener;
const {setTimeout,clearTimeout,setInterval,clearInterval}=scope;

const CFG = {
  pfx:"research-v3-expert-review-",
  file: "expert-review-lab",
  title: "Expert Review Lab: UI Audit & Triage",
  kicker: "UI AUDIT & HEURISTIC EVALUATION · 45 MIN",
  sub: "Inspect mock UI layouts in the full-screen modal inspector, place issue markers, beat the countdown timer, and triage bugs.",
  version: 1
};

const APP_TABS = [
  {title:"Learn", icon:"book-open", fb:"📖", widget:"learn", intro:"An Expert Review (Heuristic Evaluation) is a usability inspection method where UX experts check interfaces against recognized principles (heuristics) like visibility, consistency, error prevention, and accessibility.", fields:[
    {k:"review_notes", label:"Key goals of an expert review", hint:"Summarize why expert reviews are effective.", rows:3, starters:["Expert reviews help us spot...","We evaluate against heuristics such as...","Prioritizing issues ensures the team..."]}
  ]},
  {title:"Audit Inspector", icon:"magnifying-glass", fb:"🔍", widget:"audit_hub", intro:"Launch the Full-Screen Layout Inspector to examine flawed app screens. Click anywhere on the screens to place bug markers, identify issue categories, and assign severity against the clock!", fields:[]},
  {title:"Issue Triage Log", icon:"list-check", fb:"📋", widget:"triage", intro:"Review all logged findings from your audit sessions. Triage issues by importance, urgency, and assign team owners.", fields:[]},
  {title:"Findings & Report", icon:"pen", fb:"✎", intro:"Summarize your expert review findings and formulate key recommendations for the product team.", fields:[
    {k:"eval_title", label:"Audit Report Title", hint:"e.g., Mobile Checkout & Dashboard Heuristic Audit"},
    {k:"summary", label:"Executive Summary", hint:"Overall assessment of the app usability and accessibility compliance.", rows:3, starters:["The application currently exhibits...","The most critical vulnerabilities involve...","With targeted remediation..."]},
    {k:"top_rec", label:"Top Priority Action", hint:"What is the single most urgent recommendation?", rows:3, starters:["We recommend immediate redesign of...","To meet WCAG standards, the team must...","The primary friction point to eliminate is..."]}
  ]}
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

const THEMES = ["day","night","contrast"], FONTS = [90,100,110,120,130];
const FIELDS = TABS.flatMap(t => t.fields);
let theme = load("Theme"), fp = +load("Font") || 100, dys = load("Dys") === "true";
let data = {}, cur = 0, spd = 1, dl = null;
if (!THEMES.includes(theme)) theme = null;
if (!FONTS.includes(fp)) fp = 100;

const g = k => String(data[k] || "").trim();
const started = () => FIELDS.some(f => g(f.k)) || getIssues().length > 0;
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
function openTab(i, focus){ stopMic(); stopTTS(); cur = i; drawTabs(); drawPanel(); if (focus) $("t" + i).focus() }

function field(f){
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
  if (t.widget) renderWidget(t.widget);
  addMics();
}

function insertStarter(el, t){
  const v = el.value, sep = v && !/\s$/.test(v) ? " " : "";
  el.value = v + sep + t + " "; el.focus(); el.setSelectionRange(el.value.length, el.value.length);
  el.dispatchEvent(new Event("input")); say("Added: " + t.replace(/\.+$/, ""));
}

const hasTTS = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
function readText(){
  const t = TABS[cur];
  return [t.title, t.intro].concat(t.fields.map(f => f.label + ". " + (g(f.k) || "empty"))).map(x => /[.?!]$/.test(x) ? x : x + ".").join(" ");
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
  r.onerror = e => say("Dictation stopped.");
  r.onend = () => { if (rec === r){ rec = null; recBtn = null } micIdle(b) };
  try { r.start() } catch (e) { return say("Dictation could not start.") }
  rec = r; recBtn = b; b.setAttribute("aria-pressed", "true"); b.querySelector("span").textContent = "Stop";
  say("Listening. Speak now.");
}
function addMics(){
  if (!SR) return;
  qa($("panel"), "textarea,input[type=text]").forEach(el => {
    if (el.dataset.nomic || el.parentNode.classList.contains("ig")) return;
    const b = document.createElement("button");
    b.type = "button"; b.className = "alt mic"; b.setAttribute("aria-pressed", "false");
    b.setAttribute("aria-label", "Dictate into " + labelOf(el));
    b.innerHTML = ic("microphone", "🎤") + "<span>Dictate</span>";
    const w = document.createElement("div"); w.className = "ig";
    el.parentNode.insertBefore(w, el); w.append(el, b); b.onclick = () => toggleMic(el, b);
  });
}

// --- SCREENS DATA FOR INSPECTOR ---
// Each planted bug is tagged in the markup with data-bug="<id>"; decoys (things that are actually fine) use data-ok="<id>".
const CAT_INFO = {
  "Contrast/Accessibility": "Text or controls that are hard to see. WCAG asks for at least 4.5:1 for normal text and 3:1 for large text and UI components.",
  "Visual Hierarchy": "The most important thing should look the most important. Size, weight and colour should match priority.",
  "Target Size": "Controls too small to tap or click reliably. Aim for about 44px; WCAG 2.5.8 sets a 24px minimum.",
  "Unclear Label": "Wording that does not tell people what a field is for, or what a button will do.",
  "Colour-only Meaning": "Information carried by colour alone. Add text or an icon so colour-blind users get it too (WCAG 1.4.1).",
  "Misleading Affordance": "Something looks usable when it is not, or looks inert when it is usable.",
  "Error Prevention": "A risky or irreversible action with no confirmation, undo or safeguard.",
  "Inconsistency": "The same thing looks or reads differently in different places, so people must relearn it."
};
const CAT_OWNER = {
  "Contrast/Accessibility": "Designer", "Visual Hierarchy": "Designer", "Target Size": "Developer", "Unclear Label": "Content Writer",
  "Colour-only Meaning": "Designer", "Misleading Affordance": "Designer", "Error Prevention": "Developer", "Inconsistency": "Designer"
};
const SCREENS = [
  {
    id: "s1",
    name: "Mobile Checkout Screen",
    bg: "#f8fafc",
    html: `
      <div data-ok="s1-header" style="background:#0f172a;color:#fff;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;">
        <b>Checkout</b>
        <span style="font-size:12px;color:#94a3b8;">Step 1 of 3</span>
      </div>
      <div style="padding:18px;">
        <div style="font-size:18px;font-weight:bold;margin-bottom:12px;color:#1e293b;">Review Your Order</div>
        <div data-ok="s1-card" style="background:#fff;border:1px solid #cbd5e1;padding:12px;border-radius:6px;margin-bottom:12px;">
          <div style="font-weight:bold;">Neon Gamer Pro Bundle</div>
          <div style="color:#64748b;font-size:13px;">Qty: 1 · £149.99</div>
        </div>
        <div data-bug="s1-promo" style="background:#e2e8f0;padding:10px;border-radius:6px;margin-bottom:16px;">
          <span style="color:#94a3b8;font-size:12px;">Promo code applied: SAVE10</span>
        </div>
        <button data-bug="s1-btn" style="width:100%;background:#9ca3af;color:#e2e8f0;padding:12px;border-radius:6px;font-weight:bold;border:none;">Complete Purchase Now</button>
      </div>
      <div style="position:absolute;bottom:8px;left:18px;">
        <a data-bug="s1-link" href="#" style="color:#64748b;font-size:10px;">Terms &amp; Conditions</a>
      </div>
    `,
    ok: {
      "s1-header": "The header text is white on near-black, and the step indicator (light grey on dark navy) is about 6:1, so it passes. Clear context with no problem.",
      "s1-card": "A bold product name with a muted but readable quantity and price line. The hierarchy is good here: the most important detail stands out, and the secondary detail is still legible."
    },
    bugs: [
      {id: "s1-btn", type: "Contrast/Accessibility", sev: "Critical", title: "Low-contrast checkout button",
       why: "Light grey text (#e2e8f0) on a mid grey button (#9ca3af) has a contrast ratio of about 2:1. WCAG needs 4.5:1 for text. It also looks disabled, so people may think they cannot buy, and this is the one button that completes the purchase.",
       fix: "Use a strong brand colour with white text (aim for 4.5:1 or more), for example #0e7490 with white.",
       rule: "WCAG 1.4.3 Contrast (Minimum); Nielsen: Visibility of system status (a disabled-looking primary action).",
       sevWhy: "Critical because it blocks the main task (buying) for many users."},
      {id: "s1-promo", type: "Contrast/Accessibility", sev: "Minor", title: "Promo confirmation text barely readable",
       why: "Pale grey text (#94a3b8) on a light grey panel (#e2e8f0) is about 2:1. Users need to see that the discount code actually worked, and many will not be able to read it.",
       fix: "Darken the text (for example #334155) or add a tick icon and a clear 'SAVE10 applied: -£15.00' message.",
       rule: "WCAG 1.4.3 Contrast (Minimum).",
       sevWhy: "Minor because the order can still be completed, but it hides confirmation of a discount."},
      {id: "s1-link", type: "Target Size", sev: "Minor", title: "Tiny Terms & Conditions link",
       why: "A 10px text link sits right at the screen edge. On a touch screen it is far below the 44px recommended target and the 24px WCAG minimum, so it is easy to miss or mis-tap.",
       fix: "Increase the font size to at least 14px, add padding so the tap area is 44px tall, and move it away from the screen edge.",
       rule: "WCAG 2.5.8 Target Size (Minimum); Fitts's Law.",
       sevWhy: "Minor because it is a secondary link, though legal links should be easy to reach."}
    ]
  },
  {
    id: "s2",
    name: "SaaS Dashboard Overview",
    bg: "#0f172a",
    html: `
      <div data-ok="s2-header" style="background:#1e293b;color:#fff;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;">
        <b>Analytics Hub</b>
        <span>⚙️ Settings</span>
      </div>
      <div style="padding:16px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px;">
          <div data-ok="s2-users" style="background:#334155;padding:12px;border-radius:6px;">
            <div style="color:#94a3b8;font-size:12px;">Active Users</div>
            <div style="color:#fff;font-size:22px;font-weight:bold;">12,840</div>
          </div>
          <div style="background:#334155;padding:12px;border-radius:6px;">
            <div style="color:#94a3b8;font-size:12px;">Server Load</div>
            <div data-bug="s2-load" style="color:#ef4444;font-size:22px;font-weight:bold;">98%</div>
          </div>
        </div>
        <div data-ok="s2-report" style="background:#1e293b;padding:14px;border-radius:6px;margin-bottom:14px;">
          <div style="color:#fff;font-weight:bold;margin-bottom:6px;">System Performance Report</div>
          <p style="color:#94a3b8;font-size:13px;margin:0;">Latency has increased across US-East nodes by 140ms over the last 24 hours.</p>
        </div>
        <div style="display:flex;gap:10px;">
          <button data-bug="s2-reboot" style="background:#ef4444;color:#fff;padding:10px;border-radius:6px;border:none;flex:1;">Reboot Cluster</button>
          <button data-bug="s2-export" style="background:#22c55e;color:#fff;padding:10px;border-radius:6px;border:none;flex:1;">Export Logs</button>
        </div>
      </div>
    `,
    ok: {
      "s2-header": "The gear icon is paired with the word 'Settings', so it is clear and does not depend on the icon alone. White on dark slate also has strong contrast.",
      "s2-users": "The grey label (#94a3b8) on slate (#334155) is about 4.9:1, which passes for small text, and the number is large, bold and white. Good hierarchy.",
      "s2-report": "A clear heading and plain-language text that gives a specific number (140ms) and a time window (24 hours). It is useful, specific and readable."
    },
    bugs: [
      {id: "s2-reboot", type: "Error Prevention", sev: "Critical", title: "Destructive 'Reboot Cluster' with no safeguard",
       why: "Rebooting a production cluster is disruptive, yet the button sits right next to a harmless one at the same size, with no confirmation step. One slip takes the system down for everyone.",
       fix: "Ask for confirmation ('Reboot 4 nodes? Users will be disconnected'), separate it from safe actions, and consider requiring a typed confirmation.",
       rule: "Nielsen: Error prevention; Nielsen: User control and freedom.",
       sevWhy: "Critical because a single accidental click causes an outage."},
      {id: "s2-load", type: "Colour-only Meaning", sev: "Major", title: "98% load flagged by red colour alone",
       why: "The danger is signalled only by the red number. Colour-blind users, and anyone in bright light, get no hint that 98% is a problem, and there is no label, trend or link to explain what to do.",
       fix: "Add a text status ('Critical') and an icon or arrow, plus a link to the load breakdown.",
       rule: "WCAG 1.4.1 Use of Colour; Nielsen: Visibility of system status.",
       sevWhy: "Major because it hides the most urgent metric on the screen from some users."},
      {id: "s2-export", type: "Contrast/Accessibility", sev: "Major", title: "White text on green button fails contrast",
       why: "White text on #22c55e is about 2.3:1, well under the 4.5:1 required for normal text. The label is hard to read, especially on a dark screen.",
       fix: "Use a darker green such as #15803d with white text (about 5:1), or use dark text on the light green.",
       rule: "WCAG 1.4.3 Contrast (Minimum).",
       sevWhy: "Major because it makes a core action hard to read, though the task is still possible."}
    ]
  },
  {
    id: "s3",
    name: "User Account Settings",
    bg: "#ffffff",
    html: `
      <div data-ok="s3-header" style="background:#0e7490;color:#fff;padding:12px 16px;">
        <b>Account Preferences</b>
      </div>
      <div style="padding:18px;color:#0f172a;">
        <label style="display:block;font-size:13px;font-weight:bold;margin-bottom:4px;">Email Address</label>
        <input data-bug="s3-email" type="text" value="alex.jones@example.com" style="width:100%;padding:8px;border:1px solid #94a3b8;border-radius:4px;margin-bottom:12px;background:#fff;" readonly>
        
        <label style="display:block;font-size:13px;font-weight:bold;margin-bottom:4px;">Notification Frequency</label>
        <select data-ok="s3-select" style="width:100%;padding:8px;border:1px solid #94a3b8;border-radius:4px;margin-bottom:16px;">
          <option>Instant updates</option>
          <option>Daily digest</option>
        </select>
        
        <div data-bug="s3-warning" style="background:#fef08a;padding:10px;border-radius:4px;font-size:13px;margin-bottom:16px;color:#713f12;">
          Warning: Changes cannot be undone once saved.
        </div>
        
        <button data-bug="s3-save" style="background:#0e7490;color:#fff;padding:10px 20px;border-radius:4px;border:none;font-weight:bold;">Done</button>
      </div>
    `,
    ok: {
      "s3-header": "A clear page title with white text on teal (about 5.4:1), so it passes.",
      "s3-select": "A visible label sits above the field, the control looks like a dropdown, and the options are plain English. The contrast is fine."
    },
    bugs: [
      {id: "s3-email", type: "Misleading Affordance", sev: "Minor", title: "Read-only email looks editable",
       why: "The field is locked, but it is styled exactly like the editable inputs. People will click, try to type, and get nothing back, with no hint about how to change their email.",
       fix: "Style read-only fields differently (grey fill, lock icon) and add a 'Change email' link.",
       rule: "Nielsen: Match between system and real world; Affordances.",
       sevWhy: "Minor because it causes confusion, not data loss."},
      {id: "s3-warning", type: "Error Prevention", sev: "Major", title: "Irreversible change, no confirmation or Cancel",
       why: "The warning says changes cannot be undone, but the page offers no Cancel, no preview and no confirm step. A warning alone does not prevent a mistake. (The warning does include the word 'Warning:' so it is not a colour-only issue.)",
       fix: "Add a Cancel button and a confirmation dialog that states what will change, or make the change reversible.",
       rule: "Nielsen: Error prevention; Nielsen: User control and freedom.",
       sevWhy: "Major because users can permanently change settings by accident."},
      {id: "s3-save", type: "Unclear Label", sev: "Minor", title: "Vague 'Done' button",
       why: "'Done' does not say whether the changes are saved, discarded or just closed. It matters more here because the page warns the change cannot be undone.",
       fix: "Use a specific verb and noun, for example 'Save preferences'.",
       rule: "Nielsen: Match between system and real world; clear action labels.",
       sevWhy: "Minor because the layout makes the purpose guessable, but it is still ambiguous."}
    ]
  },
  {
    id: "s4",
    name: "Login Form",
    bg: "#f1f5f9",
    html: `
      <div style="padding:18px 0;">
        <div data-ok="s4-title" style="text-align:center;font-size:20px;font-weight:bold;color:#0f172a;margin-bottom:14px;">Welcome back</div>
        <div style="width:320px;margin:0 auto;">
          <div data-bug="s4-ph" style="background:#fff;border:1px solid #94a3b8;border-radius:4px;padding:10px;color:#94a3b8;font-size:14px;margin-bottom:10px;">Email</div>
          <div data-bug="s4-err" style="background:#fff;border:2px solid #ef4444;border-radius:4px;padding:10px;color:#94a3b8;font-size:14px;margin-bottom:6px;">Password</div>
          <div style="text-align:right;margin-bottom:14px;"><span data-bug="s4-forgot" style="font-size:11px;color:#cbd5e1;">Forgot password?</span></div>
          <div data-ok="s4-signin" style="background:#2563eb;color:#fff;text-align:center;font-weight:bold;padding:11px;border-radius:4px;margin-bottom:10px;">Sign in</div>
          <div data-bug="s4-create" style="background:#2563eb;color:#fff;text-align:center;font-weight:bold;padding:11px;border-radius:4px;">Create account</div>
        </div>
      </div>
    `,
    ok: {
      "s4-title": "A short, friendly heading in large bold dark text. The hierarchy is clear and the contrast is excellent.",
      "s4-signin": "White on blue (#2563eb) is about 5.2:1, so it passes, and the label says exactly what will happen. This is the primary action and it looks like one."
    },
    bugs: [
      {id: "s4-ph", type: "Unclear Label", sev: "Major", title: "Placeholder used instead of a label",
       why: "The word 'Email' only exists as light grey placeholder text, so it vanishes as soon as the user types. People with memory or attention difficulties lose the context, and screen readers may not announce it. The grey is also low contrast.",
       fix: "Add a visible label above each field and keep the placeholder only for an example format.",
       rule: "WCAG 3.3.2 Labels or Instructions; WCAG 1.3.1 Info and Relationships.",
       sevWhy: "Major because it affects every user and breaks assistive technology."},
      {id: "s4-err", type: "Colour-only Meaning", sev: "Major", title: "Error shown only by a red border",
       why: "The password field has a red outline, but there is no message, icon or text saying what is wrong. Colour-blind users may not see the red, and nobody learns how to fix it.",
       fix: "Add an icon and an error message under the field, for example 'Password must be at least 8 characters'.",
       rule: "WCAG 1.4.1 Use of Colour; WCAG 3.3.1 Error Identification.",
       sevWhy: "Major because users cannot recover from the error without guessing."},
      {id: "s4-forgot", type: "Contrast/Accessibility", sev: "Major", title: "Almost invisible 'Forgot password?' link",
       why: "Very pale grey (#cbd5e1) at 11px on a near-white background is about 1.4:1. Users who cannot log in need this link most, and it is the hardest thing on the page to see.",
       fix: "Use the link colour from the brand palette (4.5:1 or more), at least 14px, and underline it.",
       rule: "WCAG 1.4.3 Contrast (Minimum).",
       sevWhy: "Major because it blocks account recovery."},
      {id: "s4-create", type: "Visual Hierarchy", sev: "Minor", title: "'Create account' styled the same as 'Sign in'",
       why: "Two filled buttons of identical weight compete, so the primary action is not obvious. Returning users, the main audience here, can easily click the wrong one.",
       fix: "Make 'Create account' a secondary style, such as an outline or text link, so 'Sign in' stays dominant.",
       rule: "Gestalt: emphasis and visual priority; Nielsen: Aesthetic and minimalist design.",
       sevWhy: "Minor because both buttons are clearly labelled; it just slows people down."}
    ]
  },
  {
    id: "s5",
    name: "Product Listing",
    bg: "#f8fafc",
    html: `
      <div data-ok="s5-header" style="background:#0f172a;color:#fff;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;">
        <b>Gear Shop</b>
        <button data-bug="s5-search" style="width:18px;height:18px;padding:0;font-size:12px;line-height:18px;background:transparent;border:none;color:#fff;">🔍</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:16px;">
        <div data-ok="s5-card" style="background:#fff;border:1px solid #cbd5e1;border-radius:8px;padding:10px;">
          <div style="background:#e2e8f0;border-radius:6px;height:60px;display:flex;align-items:center;justify-content:center;font-size:28px;">🎧</div>
          <div style="font-size:13px;font-weight:bold;margin:8px 0 4px;color:#0f172a;">Pro Headset</div>
          <div data-bug="s5-price" style="margin-bottom:8px;"><span style="font-size:18px;font-weight:bold;color:#0f172a;text-decoration:line-through;">£59</span> <span style="font-size:11px;color:#94a3b8;">£39</span></div>
          <button style="width:100%;background:#2563eb;color:#fff;border:none;border-radius:4px;padding:8px 4px;font-size:12px;font-weight:bold;">Add to basket</button>
        </div>
        <div data-ok="s5-card" style="background:#fff;border:1px solid #cbd5e1;border-radius:8px;padding:10px;">
          <div style="background:#e2e8f0;border-radius:6px;height:60px;display:flex;align-items:center;justify-content:center;font-size:28px;">⌨️</div>
          <div style="font-size:13px;font-weight:bold;margin:8px 0 4px;color:#0f172a;">RGB Keyboard</div>
          <div style="font-size:18px;font-weight:bold;color:#0f172a;margin-bottom:8px;">£49</div>
          <button data-bug="s5-label" style="width:100%;background:#2563eb;color:#fff;border:none;border-radius:4px;padding:8px 4px;font-size:12px;font-weight:bold;">Purchase</button>
        </div>
        <div data-bug="s5-stock" style="background:#fff;border:1px solid #cbd5e1;border-radius:8px;padding:10px;opacity:.45;">
          <div style="background:#e2e8f0;border-radius:6px;height:60px;display:flex;align-items:center;justify-content:center;font-size:28px;">🖱️</div>
          <div style="font-size:13px;font-weight:bold;margin:8px 0 4px;color:#0f172a;">Gaming Mouse</div>
          <div style="font-size:18px;font-weight:bold;color:#0f172a;margin-bottom:8px;">£29</div>
          <button style="width:100%;background:#2563eb;color:#fff;border:none;border-radius:4px;padding:8px 4px;font-size:12px;font-weight:bold;">Add to basket</button>
        </div>
      </div>
    `,
    ok: {
      "s5-header": "A short store name in white on near-black. Clear, high contrast, and it does what a header should.",
      "s5-card": "A consistent card layout: image, bold name, large price, full-width button. The repeated structure makes scanning easy."
    },
    bugs: [
      {id: "s5-search", type: "Target Size", sev: "Major", title: "Tiny icon-only search button",
       why: "An 18px icon with no text label is far below the 24px WCAG minimum and the 44px touch recommendation. It is hard to hit, and an icon alone does not tell everyone it is search.",
       fix: "Make the tap area at least 44x44px, and add a visible 'Search' label or an accessible name.",
       rule: "WCAG 2.5.8 Target Size (Minimum); WCAG 4.1.2 Name, Role, Value; Fitts's Law.",
       sevWhy: "Major because search is a key way to find products."},
      {id: "s5-price", type: "Visual Hierarchy", sev: "Major", title: "Sale price smaller than the crossed-out price",
       why: "The old price (large, bold, dark) dominates, while the price you actually pay is tiny and pale. People read the biggest number first, so the deal is hidden and can be misread as £59.",
       fix: "Make the sale price the largest and boldest, and show the old price smaller, grey and struck through.",
       rule: "Visual hierarchy: size and weight should follow importance.",
       sevWhy: "Major because it hides the key buying information and risks misleading users."},
      {id: "s5-label", type: "Inconsistency", sev: "Minor", title: "'Purchase' vs 'Add to basket'",
       why: "Two cards use 'Add to basket' and one says 'Purchase'. Users will wonder whether this one skips the basket and charges them immediately. The same action should always have the same name.",
       fix: "Use the same label on every card, such as 'Add to basket'.",
       rule: "Nielsen: Consistency and standards.",
       sevWhy: "Minor because the buttons look the same, but the uncertainty could cost trust."},
      {id: "s5-stock", type: "Colour-only Meaning", sev: "Major", title: "Out-of-stock state shown only by fading",
       why: "The third card is simply dimmed. There is no 'Out of stock' text, and the button still looks live. Users may think the page is broken, or try to buy it and fail. Faded styling is also not reliably perceived by everyone.",
       fix: "Add an 'Out of stock' badge, disable the button, and offer 'Notify me'.",
       rule: "WCAG 1.4.1 Use of Colour; Nielsen: Visibility of system status.",
       sevWhy: "Major because it leads people into a dead end."}
    ]
  },
  {
    id: "s6",
    name: "Esports Match Lobby",
    bg: "#0f172a",
    html: `
      <div data-ok="s6-header" style="background:#1e293b;padding:10px 16px;display:flex;justify-content:space-between;align-items:center;color:#fff;">
        <b>Ranked Lobby</b>
        <span data-bug="s6-timer" style="font-size:10px;color:#64748b;">Match starts 00:12</span>
      </div>
      <div style="padding:14px 16px;">
        <div data-ok="s6-player" style="display:flex;justify-content:space-between;align-items:center;background:#1e293b;padding:8px 12px;border-radius:6px;margin-bottom:6px;color:#e2e8f0;font-size:14px;"><span>NovaStrike</span><span data-bug="s6-status" style="width:10px;height:10px;border-radius:50%;background:#22c55e;display:inline-block;"></span></div>
        <div data-ok="s6-player" style="display:flex;justify-content:space-between;align-items:center;background:#1e293b;padding:8px 12px;border-radius:6px;margin-bottom:6px;color:#e2e8f0;font-size:14px;"><span>PixelPanda</span><span data-bug="s6-status" style="width:10px;height:10px;border-radius:50%;background:#ef4444;display:inline-block;"></span></div>
        <div data-ok="s6-player" style="display:flex;justify-content:space-between;align-items:center;background:#1e293b;padding:8px 12px;border-radius:6px;margin-bottom:6px;color:#e2e8f0;font-size:14px;"><span>ByteWolf</span><span data-bug="s6-status" style="width:10px;height:10px;border-radius:50%;background:#22c55e;display:inline-block;"></span></div>
        <div data-ok="s6-player" style="display:flex;justify-content:space-between;align-items:center;background:#1e293b;padding:8px 12px;border-radius:6px;margin-bottom:6px;color:#e2e8f0;font-size:14px;"><span>Skyline</span><span data-bug="s6-status" style="width:10px;height:10px;border-radius:50%;background:#ef4444;display:inline-block;"></span></div>
        <div data-bug="s6-chat" style="border:1px solid #334155;border-radius:6px;padding:8px 10px;font-size:13px;color:#475569;margin:10px 0;background:#1e293b;">Type a message...</div>
        <div style="display:flex;gap:10px;">
          <button data-ok="s6-leave" style="flex:1;background:transparent;border:1.5px solid #94a3b8;color:#e2e8f0;padding:10px;border-radius:6px;">Leave Lobby</button>
          <button data-bug="s6-go" style="flex:1;background:#15803d;color:#fff;border:none;padding:10px;border-radius:6px;font-weight:bold;">Go</button>
        </div>
      </div>
    `,
    ok: {
      "s6-header": "A clear, high-contrast lobby title. The title itself is fine; the problem is with the small text next to it.",
      "s6-player": "Player names are light on dark slate with strong contrast, in a readable size, with even spacing. The names are fine; look closely at the small indicators beside them.",
      "s6-leave": "'Leave Lobby' says exactly what it does and is correctly styled as a secondary outline button next to the primary action. The contrast is also strong."
    },
    bugs: [
      {id: "s6-timer", type: "Visual Hierarchy", sev: "Major", title: "Match countdown tiny and grey",
       why: "The most time-critical information on the screen is the smallest, dimmest text (10px, #64748b), tucked in a corner. Players will miss that the match is about to start. It is also only about 3:1 contrast.",
       fix: "Make the countdown large and bold, centre it, and use a high-contrast colour; pulse or sound an alert in the last few seconds.",
       rule: "Visual hierarchy: priority information should be most prominent; WCAG 1.4.3.",
       sevWhy: "Major because missing it can mean missing the match."},
      {id: "s6-status", type: "Colour-only Meaning", sev: "Major", title: "Ready status shown by green/red dots only",
       why: "Whether each player is ready is shown only by a green or red dot. Red-green colour blindness is common, so a large number of players cannot tell who is ready. The dots are also 10px.",
       fix: "Add text ('Ready' / 'Not ready') or distinct icons (tick / cross) alongside the colour.",
       rule: "WCAG 1.4.1 Use of Colour.",
       sevWhy: "Major because it hides key team information from colour-blind players."},
      {id: "s6-chat", type: "Contrast/Accessibility", sev: "Minor", title: "Chat placeholder too dim",
       why: "Dark grey text (#475569) on dark slate (#1e293b) is about 1.9:1. The prompt is hard to see, so the field might not look usable.",
       fix: "Lighten the text to at least 4.5:1 (for example #94a3b8), and add a visible label or icon for chat.",
       rule: "WCAG 1.4.3 Contrast (Minimum).",
       sevWhy: "Minor because chat is secondary to the main task."},
      {id: "s6-go", type: "Unclear Label", sev: "Major", title: "Vague 'Go' button",
       why: "'Go' does not say what happens. Does it ready up, start the match or join a queue? In a competitive lobby a wrong click could commit the player to a match they are not prepared for.",
       fix: "Use a specific label such as 'Ready up' or 'Start match', and change it once pressed ('Ready, waiting...').",
       rule: "Nielsen: Match between system and real world; clear action labels.",
       sevWhy: "Major because the primary action is ambiguous."}
    ]
  }
];

// --- ISSUE MANAGEMENT LOGIC ---
function getIssues(){
  try {
    const raw = data["issues_list"];
    if (raw) return JSON.parse(raw);
  } catch(e){}
  return [
    {id: 1, title: "Low Contrast Checkout Button", severity: "Critical", urgency: "Immediate", owner: "Developer", desc: "Grey text on light grey button fails WCAG contrast requirements."},
    {id: 2, title: "Destructive Button Styling Risk", severity: "Major", urgency: "Next Sprint", owner: "Designer", desc: "Reboot Cluster button is styled identically to secondary actions."},
    {id: 3, title: "Ambiguous Save Button", severity: "Minor", urgency: "Backlog", owner: "Content Writer", desc: "Button simply reads 'Save' rather than 'Save Preferences'."}
  ];
}
function saveIssues(arr){
  data["issues_list"] = JSON.stringify(arr);
  persist();
}

let inspectorState = {
  screenIdx: 0,
  log: [], // {screenId, x, y, bugId, matched, title, sev, type, pts}
  score: 0,
  timer: 300,
  timerInterval: null,
  pending: null,
  feedback: null
};

function renderWidget(name){
  const p = $("panel");
  const div = document.createElement("div");
  div.className = "wg";
  if(name === "learn"){
    div.innerHTML = `
      <h3 style="color:var(--cy);margin-top:16px;">Expert Review Heuristics & Triage Framework</h3>
      <p>When inspecting an application layout, evaluate across three core dimensions:</p>
      <ul>
        <li><b>Severity (Importance):</b> Critical (blocks user flow / accessibility failure), Major (causes significant friction), Minor (cosmetic or minor annoyance).</li>
        <li><b>Urgency:</b> Immediate (fix before release), Next Sprint (fix soon), Backlog (nice to fix).</li>
        <li><b>Ownership:</b> Assign to the right expert (Designer, Developer, Content Writer, QA).</li>
      </ul>
    `;
  } else if(name === "audit_hub"){
    div.innerHTML = `
      <div style="background:var(--card);border:2px solid var(--bd);border-radius:10px;padding:20px;text-align:center;margin-top:10px;">
        <h3 style="color:var(--hd);margin-top:0;">Interactive UI Layout Audit Challenge</h3>
        <p>Step into the Inspector Modal to examine 6 flawed mock screens. Click on UI defects to place bug markers, get instant feedback on why each one is (or is not) a real problem, and log your findings into your triage queue. You get 20 seconds per screen before you are moved on, and the timer pauses while you fill in the form.</p>
        <button type="button" style="font-size:1.1rem;padding:12px 24px;margin-top:10px;" data-task-handler="openAuditInspector" data-task-arg="">Launch Full-Screen Inspector 🔍</button>
      </div>
    `;
  } else if(name === "triage"){
    const issues = getIssues();
    const crit = issues.filter(i=>i.severity==="Critical").length;
    const maj = issues.filter(i=>i.severity==="Major").length;
    const min = issues.filter(i=>i.severity==="Minor").length;
    
    div.innerHTML = `
      <div class="card-grid">
        <div class="stat-box"><b>${issues.length}</b><br><small>Total Issues Logged</small></div>
        <div class="stat-box"><b style="color:#ef4444">${crit}</b><br><small>Critical Severity</small></div>
        <div class="stat-box"><b style="color:#f59e0b">${maj}</b><br><small>Major Severity</small></div>
        <div class="stat-box"><b style="color:#3b82f6">${min}</b><br><small>Minor Severity</small></div>
      </div>

      <h3 style="color:var(--cy);margin-top:16px;">Log New Custom Issue</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px;">
        <input type="text" id="new_title" placeholder="Issue title (e.g. Broken Nav)">
        <select id="new_sev"><option value="Critical">Critical</option><option value="Major" selected>Major</option><option value="Minor">Minor</option></select>
        <select id="new_urg"><option value="Immediate">Immediate</option><option value="Next Sprint" selected>Next Sprint</option><option value="Backlog">Backlog</option></select>
        <select id="new_own"><option value="Developer">Developer</option><option value="Designer" selected>Designer</option><option value="Content Writer">Content Writer</option><option value="QA">QA</option></select>
      </div>
      <textarea id="new_desc" placeholder="Describe the usability or accessibility problem..." rows="2" style="margin-bottom:8px;"></textarea>
      <button type="button" data-task-handler="addNewIssue" data-task-arg="">Add to Triage Log</button>

      <h3 style="color:var(--cy);margin-top:20px;">Active Triage Queue</h3>
      <div style="overflow-x:auto;">
        <table class="triage-table">
          <thead><tr><th>Title & Description</th><th>Severity</th><th>Urgency</th><th>Owner</th><th>Action</th></tr></thead>
          <tbody>
            ${issues.map(i => `
              <tr>
                <td><b>${esc(i.title)}</b><br><small>${esc(i.desc)}</small></td>
                <td><span class="badge ${i.severity==='Critical'?'badge-crit':i.severity==='Major'?'badge-maj':'badge-min'}">${i.severity}</span></td>
                <td>${i.urgency}</td>
                <td>${i.owner}</td>
                <td><button type="button" class="alt" style="padding:4px 8px;font-size:0.75rem;" data-task-handler="deleteIssue" data-task-arg="${i.id}">Delete</button></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }
  p.appendChild(div);
}

// --- FULL SCREEN MODAL INSPECTOR LOGIC ---
const SCREEN_SECONDS = 20;

window.openAuditInspector = function(){
  inspectorState.screenIdx = 0;
  inspectorState.log = [];
  inspectorState.score = 0;
  inspectorState.timer = SCREEN_SECONDS;
  inspectorState.pending = null;
  inspectorState.feedback = null;
  if(inspectorState.timerInterval) clearInterval(inspectorState.timerInterval);
  const stale = document.getElementById("audit-modal");
  if(stale) stale.remove();
  
  const f = document.createElement("div");
  f.id = "audit-modal";
  f.className = "fs";
  f.tabIndex = -1;
  document.body.appendChild(f);
  
  renderInspectorScreen();
  startInspectorTimer();
  say("Inspector launched. Click on UI bugs before the timer runs out!");
};

function updateTimerBadge(busy){
  const tb = $("inspector-timer");
  if(!tb) return;
  tb.textContent = "⏱ " + Math.max(inspectorState.timer,0) + "s" + (busy ? " (paused)" : "");
  tb.style.background = (!busy && inspectorState.timer <= 5) ? "#b91c1c" : "";
  tb.style.color = (!busy && inspectorState.timer <= 5) ? "#fff" : "";
}

function startInspectorTimer(){
  if(inspectorState.timerInterval) clearInterval(inspectorState.timerInterval);
  inspectorState.timerInterval = setInterval(() => {
    const busy = !!(inspectorState.pending || inspectorState.feedback);
    if(!busy) inspectorState.timer--;
    updateTimerBadge(busy);
    if(inspectorState.timer <= 0){
      if(inspectorState.screenIdx < SCREENS.length - 1){
        say("Time's up for this screen. Moving to the next one.");
        changeInspectorScreen(1);
      } else {
        say("Time's up! Review your score.");
        showInspectorResults();
      }
    }
  }, 1000);
}

function renderInspectorScreen(){
  const sc = SCREENS[inspectorState.screenIdx];
  const f = $("audit-modal");
  if(!f) return;
  const marks = inspectorState.log.filter(l => l.screenId === sc.id);
  const foundHere = marks.filter(m => m.matched).length;
  const pd = inspectorState.pending;
  
  f.innerHTML = `
    <div class="fst">
      <span>Screen ${inspectorState.screenIdx + 1} of ${SCREENS.length}: <b>${sc.name}</b></span>
      <span class="timer-badge" id="inspector-timer">⏱ ${Math.max(inspectorState.timer,0)}s</span>
      <span style="font-weight:bold;color:var(--li);">Score: ${inspectorState.score} pts</span>
      <button type="button" class="alt" data-task-handler="closeAuditModal" data-task-arg="">Exit Inspector</button>
    </div>
    <div class="fsb insp" id="inspector-body">
      <div class="insp-main">
        <p class="hint" style="margin-top:0;margin-bottom:8px;">Click a layout element to tag a bug. This screen has <b>${sc.bugs.length}</b> planted issues (found ${foundHere}). You have <b>${SCREEN_SECONDS} seconds</b> per screen, then you move on automatically. The timer pauses while you fill in the form.</p>
        <div class="screen-frame" id="screen-canvas" style="background:${sc.bg};" data-task-handler="handleScreenClick" data-task-arg="event">
          ${sc.html}
          ${marks.map((m, idx) => `
            <div class="marker" style="left:${m.x}%;top:${m.y}%;background:${m.matched?'#22c55e':'var(--pk)'};">${idx+1}</div>
          `).join("")}
          ${pd ? `<div id="pending-marker" class="marker pending" style="left:${pd.x}%;top:${pd.y}%;">+</div>` : ""}
        </div>
        <div style="margin-top:14px;display:flex;gap:10px;">
          ${inspectorState.screenIdx < SCREENS.length - 1 ? `<button type="button" data-task-handler="changeInspectorScreen" data-task-arg="1">Next Screen ➔</button>` : `<button type="button" data-task-handler="showInspectorResults" data-task-arg="">Finish & View Results 🎉</button>`}
        </div>
      </div>
      <aside class="insp-side" id="issue-sidebar" aria-label="Tag Issue Marker" aria-live="polite">${sidebarHTML()}</aside>
    </div>
  `;
}

function sidebarHTML(){
  if(inspectorState.feedback) return inspectorState.feedback;
  const pd = inspectorState.pending;
  if(!pd) return `<h3>Tag Issue Marker</h3><p class="hint" style="margin:0;">Click a spot on the screen to place a marker, then describe the issue here. You will get feedback on whether you were right and why.</p>`;
  const err = id => `<span class="fld-err" id="${id}-err" style="display:block;color:var(--pk);font-size:.8rem;font-weight:700;min-height:1em;"></span>`;
  return `
    <h3>Tag Issue Marker</h3>
    <p class="hint" style="margin:0 0 4px;font-size:.8rem;">All fields are required (*).</p>
    <label for="pop-type">Bug Category: *</label>
    <select id="pop-type" aria-required="true" aria-describedby="pop-type-err">
      <option value="">Select a category...</option>
      ${Object.keys(CAT_INFO).map(c => `<option value="${c}">${c.replace("/", " / ")}</option>`).join("")}
    </select>
    ${err("pop-type")}
    <label for="pop-sev">Severity: *</label>
    <select id="pop-sev" aria-required="true" aria-describedby="pop-sev-err">
      <option value="">Select a severity...</option>
      <option value="Critical">Critical</option>
      <option value="Major">Major</option>
      <option value="Minor">Minor</option>
    </select>
    ${err("pop-sev")}
    <label for="pop-title">Issue Title: *</label>
    <input type="text" id="pop-title" placeholder="Short description..." aria-required="true" aria-describedby="pop-title-err">
    ${err("pop-title")}
    <label for="pop-notes">Notes: *</label>
    <textarea id="pop-notes" placeholder="Why is this a problem?" aria-required="true" aria-describedby="pop-notes-err"></textarea>
    ${err("pop-notes")}
    <div style="display:flex;gap:6px;margin-top:10px;">
      <button type="button" style="flex:1;padding:6px;font-size:0.8rem;" data-task-handler="submitBugMarker" data-task-arg="">Save Bug</button>
      <button type="button" class="alt" style="flex:1;padding:6px;font-size:0.8rem;" data-task-handler="cancelBugMarker" data-task-arg="">Cancel</button>
    </div>`;
}

window.cancelBugMarker = function(){
  inspectorState.pending = null;
  inspectorState.feedback = null;
  const pm = document.getElementById("pending-marker"); if(pm) pm.remove();
  const sb = $("issue-sidebar"); if(sb) sb.innerHTML = sidebarHTML();
};

window.dismissFeedback = function(){
  inspectorState.feedback = null;
  const sb = $("issue-sidebar"); if(sb) sb.innerHTML = sidebarHTML();
};

window.changeInspectorScreen = function(dir){
  inspectorState.screenIdx += dir;
  inspectorState.timer = SCREEN_SECONDS;
  inspectorState.pending = null;
  inspectorState.feedback = null;
  renderInspectorScreen();
};

// Work out which planted bug (or decoy) is at the click point, using the real element rectangles.
function hitTest(canvas, cx, cy){
  const inR = (r, pad) => cx >= r.left - pad && cx <= r.right + pad && cy >= r.top - pad && cy <= r.bottom + pad;
  const area = r => r.width * r.height;
  const els = sel => Array.from(canvas.querySelectorAll(sel));
  let best = null;
  els("[data-bug]").forEach(el => { const r = el.getBoundingClientRect(); if(inR(r,0) && (!best || area(r) < best.a)) best = {id: el.dataset.bug, a: area(r)}; });
  if(best) return {bugId: best.id};
  const nearest = pad => {
    let n = null;
    els("[data-bug]").forEach(el => {
      const r = el.getBoundingClientRect();
      if(!inR(r, pad)) return;
      const d = Math.hypot(cx - (r.left + r.width/2), cy - (r.top + r.height/2));
      if(!n || d < n.d) n = {id: el.dataset.bug, d};
    });
    return n;
  };
  const n1 = nearest(8);
  if(n1) return {bugId: n1.id};
  let ok = null;
  els("[data-ok]").forEach(el => { const r = el.getBoundingClientRect(); if(inR(r,0) && (!ok || area(r) < ok.a)) ok = {id: el.dataset.ok, a: area(r)}; });
  if(ok) return {okId: ok.id};
  const n2 = nearest(16);
  if(n2) return {bugId: n2.id};
  return {};
}

window.handleScreenClick = function(e){
  if(e.target.closest(".marker")) return;
  e.preventDefault();
  const canvas = $("screen-canvas");
  const rect = canvas.getBoundingClientRect();
  const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
  const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
  const hit = hitTest(canvas, e.clientX, e.clientY);
  const keep = inspectorState.pending && $("pop-title") ? {t:$("pop-title").value, n:$("pop-notes").value, ty:$("pop-type").value, sv:$("pop-sev").value} : null;
  inspectorState.feedback = null;
  inspectorState.pending = {x, y, bugId: hit.bugId || null, okId: hit.okId || null};
  
  let pm = document.getElementById("pending-marker");
  if(!pm){ pm = document.createElement("div"); pm.id = "pending-marker"; pm.className = "marker pending"; pm.textContent = "+"; canvas.appendChild(pm); }
  pm.style.left = x + "%"; pm.style.top = y + "%";
  
  const sb = $("issue-sidebar");
  sb.innerHTML = sidebarHTML();
  if(keep){ $("pop-title").value = keep.t; $("pop-notes").value = keep.n; $("pop-type").value = keep.ty; $("pop-sev").value = keep.sv; }
  try{ $("pop-title").focus({preventScroll:true}); }catch(err){}
};

function fbBox(color, heading, body){
  return `
    <h3>Tag Issue Marker</h3>
    <div role="status" style="border-left:6px solid ${color};background:var(--bg);padding:10px 12px;border-radius:6px;font-size:.875rem;">
      <b style="font-size:1rem;color:var(--hd);">${heading}</b>
      ${body}
    </div>
    <button type="button" style="width:100%;margin-top:10px;" data-task-handler="dismissFeedback" data-task-arg="">Tag another issue</button>`;
}

window.submitBugMarker = function(){
  const pd = inspectorState.pending;
  if(!pd) return;
  const sc = SCREENS[inspectorState.screenIdx];
  const required = [["pop-type","Choose a category."],["pop-sev","Choose a severity."],["pop-title","Enter an issue title."],["pop-notes","Explain why this is a problem."]];
  let firstBad = null;
  required.forEach(([id, msg]) => {
    const el = $(id), bad = !el.value.trim();
    el.setAttribute("aria-invalid", bad ? "true" : "false");
    el.style.borderColor = bad ? "var(--pk)" : "";
    $(id + "-err").textContent = bad ? msg : "";
    if(bad && !firstBad) firstBad = el;
  });
  if(firstBad){ firstBad.focus(); say("Please complete all required fields."); return; }
  const notes = $("pop-notes").value.trim();
  const title = $("pop-title").value.trim();
  const type = $("pop-type").value;
  const sev = $("pop-sev").value;
  const bug = pd.bugId ? sc.bugs.find(b => b.id === pd.bugId) : null;
  const already = bug && inspectorState.log.some(l => l.bugId === bug.id);
  let fb;
  
  if(bug && already){
    fb = fbBox("var(--am)", "↺ Already found", `<p style="margin:6px 0 0;">You already tagged <b>${esc(bug.title)}</b>. No extra points for the same issue twice.</p>`);
  } else if(bug){
    const catOk = type === bug.type, sevOk = sev === bug.sev;
    const pts = 10 + (catOk ? 10 : 0) + (sevOk ? 5 : 0);
    inspectorState.score += pts;
    inspectorState.log.push({screenId: sc.id, x: pd.x, y: pd.y, bugId: bug.id, matched: true, title, sev, type, pts});
    const issues = getIssues();
    issues.push({
      id: Date.now(),
      title: title,
      severity: sev,
      urgency: sev === "Critical" ? "Immediate" : sev === "Major" ? "Next Sprint" : "Backlog",
      owner: CAT_OWNER[type] || "Designer",
      desc: `Found on ${sc.name} [Category: ${type}]` + (notes ? " - " + notes : "")
    });
    saveIssues(issues);
    say(`Real bug found, +${pts} points.`);
    fb = fbBox(catOk && sevOk ? "#22c55e" : "var(--am)", `✅ Real bug found (+${pts} pts)`, `
      <p style="margin:6px 0 2px;"><b>${esc(bug.title)}</b></p>
      <ul style="margin:4px 0 8px;padding-left:18px;">
        <li>Location: ✔ correct (+10)</li>
        <li>Category: ${catOk ? "✔ " + esc(bug.type) + " (+10)" : "✘ you chose <b>" + esc(type) + "</b>, but this is <b>" + esc(bug.type) + "</b>. " + esc(CAT_INFO[bug.type])}</li>
        <li>Severity: ${sevOk ? "✔ " + sev + " (+5)" : "✘ you rated it <b>" + sev + "</b>; expected <b>" + bug.sev + "</b>. " + esc(bug.sevWhy)}</li>
      </ul>
      <p style="margin:6px 0;"><b>Why it's a problem:</b> ${esc(bug.why)}</p>
      <p style="margin:6px 0;"><b>How to fix it:</b> ${esc(bug.fix)}</p>
      <p style="margin:6px 0;color:var(--mu);"><b>Principle:</b> ${esc(bug.rule)}</p>`);
  } else {
    inspectorState.log.push({screenId: sc.id, x: pd.x, y: pd.y, bugId: null, matched: false, title, sev, type, pts: 0});
    say("No bug here: see the feedback to learn why.");
    const reason = pd.okId && sc.ok && sc.ok[pd.okId]
      ? `<p style="margin:6px 0;"><b>Why this is actually fine:</b> ${esc(sc.ok[pd.okId])}</p>`
      : `<p style="margin:6px 0;"><b>Why:</b> There is no usability or accessibility defect at this spot. It is empty space or ordinary content that works as intended.</p>`;
    fb = fbBox("var(--pk)", "✘ Not a bug (false alarm)", `
      ${reason}
      <p style="margin:6px 0;color:var(--mu);"><b>Tip:</b> Experts check contrast, text and target size, labels, whether colour is the only signal, and whether risky actions have safeguards. Keep looking. This marker was not added to your triage log.</p>`);
  }
  
  inspectorState.pending = null;
  inspectorState.feedback = fb;
  renderInspectorScreen();
};

window.showInspectorResults = function(){
  if(inspectorState.timerInterval) clearInterval(inspectorState.timerInterval);
  const f = $("audit-modal");
  if(!f) return;
  inspectorState.pending = null;
  inspectorState.feedback = null;
  const log = inspectorState.log;
  const total = SCREENS.reduce((n, s) => n + s.bugs.length, 0);
  const found = log.filter(l => l.matched).length;
  const falseAlarms = log.filter(l => !l.matched).length;
  
  const perScreen = SCREENS.map(sc => `
    <h3 style="color:var(--cy);margin:18px 0 6px;text-align:left;">${esc(sc.name)}</h3>
    ${sc.bugs.map(b => {
      const hit = log.find(l => l.bugId === b.id);
      if(hit){
        const catOk = hit.type === b.type;
        return `<div style="border-left:6px solid #22c55e;background:var(--bg);padding:8px 12px;border-radius:6px;margin-bottom:8px;text-align:left;">
          <b>✅ Found: ${esc(b.title)}</b> <small>(${esc(b.type)}, ${b.sev})</small>
          <div style="font-size:.875rem;color:var(--mu);">${catOk ? "" : "You labelled it " + esc(hit.type) + ". "}${esc(b.rule)}</div>
        </div>`;
      }
      return `<div style="border-left:6px solid var(--pk);background:var(--bg);padding:8px 12px;border-radius:6px;margin-bottom:8px;text-align:left;">
        <b>❌ Missed: ${esc(b.title)}</b> <small>(${esc(b.type)}, ${b.sev})</small>
        <p style="margin:4px 0;font-size:.875rem;"><b>Why it's a problem:</b> ${esc(b.why)}</p>
        <p style="margin:4px 0;font-size:.875rem;"><b>How to fix it:</b> ${esc(b.fix)}</p>
        <div style="font-size:.8125rem;color:var(--mu);">${esc(b.rule)}</div>
      </div>`;
    }).join("")}
  `).join("");
  
  f.innerHTML = `
    <div class="fst">
      <b>Audit Session Complete! 🎉</b>
      <button type="button" class="alt" data-task-handler="closeAuditModal" data-task-arg="">Close & View Triage Log</button>
    </div>
    <div class="fsb insp">
      <div style="background:var(--card);border:2px solid var(--bd);border-radius:12px;padding:24px;width:100%;max-width:760px;text-align:center;">
        <h2 style="color:var(--cy);margin-top:0;">Your Expert Review Score</h2>
        <div style="font-size:3.5rem;font-weight:bold;color:var(--li);margin:10px 0;">${inspectorState.score} pts</div>
        <p>You found <b>${found} of ${total}</b> planted issues and made <b>${falseAlarms}</b> false alarm${falseAlarms === 1 ? "" : "s"}. Real bugs you tagged are in your Triage Queue.</p>
        <div style="display:flex;gap:12px;margin:16px 0;justify-content:center;flex-wrap:wrap;">
          <button type="button" data-task-handler="openAuditInspector" data-task-arg="">Try Again / Retry</button>
          <button type="button" class="alt" data-task-handler="closeAuditModal" data-task-arg="">Go to Triage Log</button>
        </div>
        <h2 style="text-align:left;font-size:1.125rem;margin:18px 0 0;color:var(--hd);">Full answer key: what each bug was and why</h2>
        ${perScreen}
      </div>
    </div>
  `;
};

window.closeAuditModal = function(){
  if(inspectorState.timerInterval) clearInterval(inspectorState.timerInterval);
  const f = $("audit-modal");
  if(f) f.remove();
  if(TABS[cur].widget === "audit_hub") renderWidget("audit_hub");
};

window.addNewIssue = function(){
  const title = $("new_title").value.trim();
  const severity = $("new_sev").value;
  const urgency = $("new_urg").value;
  const owner = $("new_own").value;
  const desc = $("new_desc").value.trim();
  if(!title) return say("Please enter an issue title.");
  const issues = getIssues();
  issues.push({id: Date.now(), title, severity, urgency, owner, desc: desc || "No description provided."});
  saveIssues(issues);
  renderWidget("triage");
  say("Issue added to triage log.");
};

window.deleteIssue = function(id){
  let issues = getIssues();
  issues = issues.filter(i => i.id !== id);
  saveIssues(issues);
  renderWidget("triage");
  say("Issue removed.");
};

// --- EXPORT MODEL ---
function model(){
  const issues = getIssues();
  const issueRows = issues.map((i, idx) => [`Issue #${idx+1}: ${i.title}`, `Severity: ${i.severity} | Urgency: ${i.urgency} | Owner: ${i.owner}\nDescription: ${i.desc}`]);
  
  const sections = TABS.map(t => {
    if(t.widget === "triage"){
      return {h: "Issue Log & Triage", rows: issueRows};
    }
    return {h: t.title, rows: t.fields.filter(f=>!f.hidden).map(f => [f.label, g(f.k) || "(empty)"])};
  }).filter(s => s.rows && s.rows.length > 0);

  return {title: g("eval_title") || CFG.title, sections};
}

const stamp = () => new Date().toISOString().slice(0, 10);
const fileName = ext => `${CFG.file}-${stamp()}.${ext}`;

function md(){
  const m = model();
  return "# " + m.title + "\n\n" + m.sections.map(s => "## " + s.h + "\n\n" + s.rows.map(r => "**" + r[0] + "**\n\n" + r[1]).join("\n\n")).join("\n\n") + "\n";
}

const cell = v => { v = String(v); if (/^[=+\-@\t\r]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"' };
function csv(){
  const m = model(), o = [["Section","Field","Value"].map(cell).join(",")];
  m.sections.forEach(s => s.rows.forEach(r => o.push([s.h, r[0], r[1]].map(cell).join(","))));
  return "\uFEFF" + o.join("\r\n") + "\r\n";
}

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
  if (dl) return dl.save({filename: name, data: body}).then(() => say("Saved " + name), e => say("Save cancelled."));
  try {
    const b = body instanceof Blob ? body : new Blob([body], {type: "text/plain;charset=utf-8"}), a = document.createElement("a");
    a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000); say("Saved " + name);
  } catch (e) { say("Could not save the file.") }
}
function runExport(x){
  if (!started()) return say("Fill in part of the form first.");
  if (x.lib && !x.lib()) return say(x.label + " is still loading. Try again.");
  Promise.resolve().then(x.build).then(b => save(fileName(x.id), b)).catch(e => { console.warn(e); say("Could not build file.") });
}
function copyText(){
  if (!started()) return say("Fill in part of the form first.");
  if (navigator.clipboard) navigator.clipboard.writeText(md()).then(() => say("Copied to clipboard"), () => say("Could not copy"));
  else say("Copy not available.");
}

function backup(){
  if (!started()) return say("Nothing to back up yet.");
  save(`${CFG.file}-backup-${stamp()}.json`, new Blob([JSON.stringify({app: CFG.pfx, version: CFG.version, saved: new Date().toISOString(), data, prefs: {theme, font: fp, dys}}, null, 2)], {type: "application/json;charset=utf-8"}));
}
function importBackup(f){
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const d = JSON.parse(r.result);
      if (!d || d.app !== CFG.pfx) throw 0;
      data = d.data || {};
      persist(); drawPanel(); say("Backup imported.");
    } catch (e) { say("Invalid backup file.") }
  };
  r.readAsText(f);
}

let opener = null; const BG = ["header", "main"];
const mEls = () => qa($("mdl"), "button").filter(b => !b.disabled);
function openM(){
  const n = started(); opener = document.activeElement;
  $("mc").textContent = n ? "Choose an export format:" : "Fill in part of the form first.";
  qa($("mo"), "button").forEach(b => b.disabled = !n); $("bks").disabled = !n;
  $("mdl").hidden = false; BG.forEach(q => document.querySelector(q).inert = true);
  (mEls()[0] || $("xcl")).focus();
}
function closeM(){ $("mdl").hidden = true; BG.forEach(q => document.querySelector(q).inert = false); if (opener && opener.focus) opener.focus() }

function boot(){
  try {const saved=JSON.parse(load("Data")||"null");if(saved?.data && saved.v<=CFG.version){data=Object.fromEntries(Object.entries(saved.data).filter(([,value])=>typeof value==="string"&&value.length<=1500000));}} catch {}

  try { const s = JSON.parse(load("Data") || "null"); if (s && s.data) data = s.data; } catch (e) {}
   $("kick").textContent = CFG.kicker; $("ttl").textContent = CFG.title; $("sub").textContent = CFG.sub;


  $("rd").onclick = () => speak(readText());
  $("ps").onclick = () => { if (!hasTTS) return; if (speechSynthesis.paused){ speechSynthesis.resume(); $("pst").textContent = "Pause" } else if (speechSynthesis.speaking){ speechSynthesis.pause(); $("pst").textContent = "Resume" } };
  $("st").onclick = stopTTS;
  $("sp").onchange = () => { spd = +$("sp").value };
  addEventListener("pagehide", () => { stopTTS(); stopMic() });
  $("dh").textContent = SR ? "Tip: tap Dictate under any box and speak." : "Dictation not supported in this browser.";
  $("mo").innerHTML = EXPORTS.map(x => `<button type="button" class="alt opt" id="x-${x.id}">${ic(x.ic, x.fb)}<span>${esc(x.label)}<small>${esc(x.desc)}</small></span></button>`).join("");
  EXPORTS.forEach(x => $("x-" + x.id).onclick = () => { closeM(); runExport(x) });
  $("xopen").onclick = openM; $("xcl").onclick = closeM; $("xcp").onclick = copyText; $("xpr").onclick = () => window.print();
  $("bks").onclick = () => { closeM(); backup() };
  $("bki").onclick = () => $("bkf").click();
  $("bkf").onchange = function(){ closeM(); importBackup(this.files[0]); this.value = "" };
  $("mdl").onclick = e => { if (e.target === $("mdl")) closeM() };
  $("clr").onclick = () => { if (!confirm("Clear everything?")) return; data = {}; persist(); openTab(0); say("Cleared") };
  /* Mark complete: flags the activity as done on this device */
  const updMc = () => { const d = load("Done") === "1"; $("mcsp").textContent = d ? "Completed ✓" : "Mark complete"; $("mcmp").setAttribute("aria-pressed", String(d)) };
  $("mcmp").onclick = () => { const d = load("Done") !== "1"; store("Done", d ? "1" : ""); updMc(); say(d ? "Activity marked complete." : "Completion cleared.") };
  updMc();

   drawTabs(); drawPanel();
}
boot();

return {dispose(){stopMic();stopTTS();scope.dispose();}};
};
