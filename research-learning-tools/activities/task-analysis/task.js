// Synced from Activity_02_Task_Analysis_-_Join_A_Match.html; library scope isolates DOM, callbacks and timers.
window.RESEARCH_TASKS["task-analysis"] = function(scope){
const window=scope.window, document=scope.document;
const addEventListener=scope.addEventListener;
const {setTimeout,clearTimeout,setInterval,clearInterval}=scope;

/* =============================================================================
   1. CONFIG + CONTENT.  This is the ONLY section a new app should need to edit.
   ============================================================================= */
/* =============================================================================
   1. CONFIG + CONTENT.  Method lesson: Task analysis (task-analysis)
   Content sourced from research-learning-tools/data/methods/task-analysis.js
   ============================================================================= */
const CFG = {pfx:"research-v3-task-analysis-",file:"task-analysis-lab",title:"Task Analysis: Join a Match",kicker:"RESEARCH METHODS · TASK ANALYSIS · 60 MIN",sub:"Watch a partner achieve a real goal and map what actually happens, step by step.",version:1};
const APP_TABS = [
  {title:"Tutorial",icon:"circle-play",fb:"▶",widget:"tutorial",intro:"Follow the method in four steps, with a worked example and the key reading. About two minutes.",fields:[]},
  {title:"Learn",icon:"book-open",fb:"📖",widget:"learn",intro:"Read the key idea, then explain it in your own words.",fields:[
    {k:"own_def",label:"Task analysis in your own words",hint:"One or two sentences. Start with: Task analysis is...",rows:3,starters:["Task analysis is...","The map shows...","Observation beats expectation..."]}]},
  {title:"Goal and plan",icon:"bullseye",fb:"🎯",intro:"Name the outcome, then plan how you will observe it.",fields:[
    {"k":"ta_goal","label":"The user's outcome","hint":"Describe the outcome, rather than a button press. Example: the player wants to join a match with a friend.","rows":3,"starters":["The player wants...","The goal is..."]},
    {"k":"ta_plan","label":"Observation plan","hint":"Ask permission before observing. State where you will watch from and what you will note.","rows":3,"starters":["I will observe...","I will note...","I asked permission and..."]}
  ]},
  {title:"Observed steps",icon:"list-ol",fb:"🔢",intro:"Watch the task happen. Number each step and keep facts separate from guesses.",fields:[
    {"k":"ta_steps","label":"Number the steps you saw","hint":"Number each step in order. Example: 1. Opens game. 2. Looks for friends list. 3. Opens profile instead.","rows":6,"starters":["1. ...","2. ...","3. ..."]},
    {"k":"ta_split","label":"What you saw vs what you think","hint":"Separate observation from interpretation. Observation: pauses for 12 seconds. Interpretation: the friends label may be unclear.","rows":4,"starters":["Observation:...","Interpretation:..."]}
  ]},
  {title:"Improved task map",icon:"map",fb:"🗺️",intro:"Choose one step to simplify and state the evidence for the change.",fields:[
    {"k":"ta_change","label":"One step to simplify","hint":"Which step could be simplified? Example: put “Play with friends” on the home screen.","rows":3,"starters":["I would simplify...","The weakest step is..."]},
    {"k":"ta_evidence","label":"Evidence for the change","hint":"Explain the evidence for your change. Example: the player searched in two places.","rows":3,"starters":["The evidence is...","I noticed..."]}
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

const $ = id => document.getElementById(id);
const qa = (r, s) => [...r.querySelectorAll(s)];
/* SEC-1: escape EVERYTHING dynamic before it enters innerHTML */
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
/* DATA-1: storage may be blocked (private mode, sandbox). Never throw. */
const store = (k, v) => { try { localStorage.setItem(CFG.pfx + k, v) } catch (e) {} };
const load  = k => { try { return localStorage.getItem(CFG.pfx + k) } catch (e) { return null } };
/* A11Y-6: clear then set so repeated identical messages are still announced */
const say = m => { const l = $("live"); l.textContent = ""; setTimeout(() => l.textContent = m, 30) };
/* A11Y-11: icon with emoji fallback */
const ic = (f, b) => `<i class="fa-solid fa-${f}" data-fb="${b}" aria-hidden="true"></i>`;

const THEMES = ["day","night","contrast"], FONTS = [90,100,110,120,130];
const FIELDS = TABS.flatMap(t => t.fields);
let theme = load("Theme"), fp = +load("Font") || 100, dys = load("Dys") === "true";
let data = {}, cur = 0, spd = 1, dl = null;
if (!THEMES.includes(theme)) theme = null;
if (!FONTS.includes(fp)) fp = 100;

const g = k => String(data[k] || "").trim();
const started = () => FIELDS.some(f => g(f.k));            // EXP-3
/* DATA-2: versioned envelope */
const persist = () => { store("Data", JSON.stringify({v: CFG.version, data})); try { store("Report", JSON.stringify(model())); } catch {} if (typeof updXP === "function") updXP(); scope.notifySaved(); };

/* =============================================================================
   3. ACCESSIBILITY CONTROLS (A11Y-2)
   ============================================================================= */
function setTheme(t){
  theme = t; document.documentElement.setAttribute("data-theme", t);
  THEMES.forEach(x => { $("th-"+x).classList.toggle("on", x === t); $("th-"+x).setAttribute("aria-pressed", x === t) });
  store("Theme", t);
}
function applyFont(){ document.documentElement.style.fontSize = fp + "%"; $("fsd").textContent = fp + "%" }
function setFont(d){ const i = FONTS.indexOf(fp) + d; if (i < 0 || i >= FONTS.length) return; fp = FONTS[i]; applyFont(); store("Font", fp); say("Text size " + fp + " percent") }
function setDys(v){ dys = v; document.body.classList.toggle("dys", v); $("dys").classList.toggle("on", v); $("dys").setAttribute("aria-pressed", v); store("Dys", v) }

/* =============================================================================
   4. TABS + PANEL  (A11Y-7, A11Y-5)
   ============================================================================= */
function drawTabs(){
  $("tabs").innerHTML = TABS.map((t, i) =>
    `<button type="button" role="tab" id="t${i}" aria-controls="panel" aria-selected="${i === cur}" tabindex="${i === cur ? 0 : -1}">${ic(t.icon, t.fb)}${esc(t.title)}</button>`).join("");
  TABS.forEach((t, i) => {
    const b = $("t" + i);
    b.onclick = () => openTab(i);
    b.onkeydown = e => {                                    // roving tabindex keys
      const n = e.key === "ArrowRight" ? i + 1 : e.key === "ArrowLeft" ? i - 1 : e.key === "Home" ? 0 : e.key === "End" ? TABS.length - 1 : null;
      if (n === null) return; e.preventDefault(); openTab((n + TABS.length) % TABS.length, true);
    };
  });
}
function openTab(i, focus){ stopMic(); stopTTS(); cur = i; store("Tab", i); drawTabs(); drawPanel(); if (focus) $("t" + i).focus() }
/* A11Y-5: real <label for>, hint linked with aria-describedby */
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
    ? `<div class="ref">${t.fields.map(f => `<div class="rc ${f.cls}">${field(f)}</div>`).join("")}</div><p class="hint cite">${esc(t.cite)}</p>`   // colour + words, never colour alone
    : t.fields.map(field).join(""));
  qa($("panel"), "[data-k]").forEach(el => { el.oninput = () => { data[el.dataset.k] = el.value; persist() } });
  qa($("panel"), "select[data-s]").forEach(sel => {
    const add = () => { if (sel.value === "") return; insertStarter($("f-" + sel.dataset.s), FIELDS.find(x => x.k === sel.dataset.s).starters[+sel.value]); sel.value = ""; sel._nav = false };
    /* Browsers fire "change" on every arrow press. Ignore those so keyboard users can browse; Enter adds. Mouse/touch picks add on change. */
    sel.onpointerdown = () => { sel._nav = false };
    sel.onkeydown = e => { if (["ArrowUp","ArrowDown","Home","End","PageUp","PageDown"].includes(e.key)) sel._nav = true; else if (e.key === "Enter"){ e.preventDefault(); add() } };
    sel.onchange = () => { if (!sel._nav) add() };
    sel.onblur = () => { sel._nav = false; sel.value = "" };
  });
  widgetHook(); addMics();
}
/* STARTER-1: APPEND a sentence starter (never overwrite), move focus to the box, announce it */
function insertStarter(el, t){
  const v = el.value, sep = v && !/\s$/.test(v) ? " " : "";
  el.value = v + sep + t + " "; el.focus(); el.setSelectionRange(el.value.length, el.value.length);
  el.dispatchEvent(new Event("input")); say("Added: " + t.replace(/\.+$/, ""));
}

/* =============================================================================
   5. READ ALOUD (VOICE-1)  - add custom speech by extending readText()
   ============================================================================= */
const hasTTS = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
function readText(){
  const t = TABS[cur];
  return [t.title, t.intro, t.widget && $("wg") ? $("wg").innerText : ""].concat(t.fields.filter(f => !f.hidden).map(f => f.label + ". " + (g(f.k) || "empty"))).filter(Boolean).map(x => /[.?!]$/.test(x) ? x : x + ".").join(" ");   // tidy pauses
}
function speak(txt){
  if (!hasTTS) return say("Read aloud is not available in this browser.");
  speechSynthesis.cancel(); $("pst").textContent = "Pause";
  const u = new SpeechSynthesisUtterance(txt); u.rate = spd; u.lang = document.documentElement.lang || "en-GB";
  speechSynthesis.speak(u);
}
function stopTTS(){ if (hasTTS) speechSynthesis.cancel(); $("pst").textContent = "Pause" }

/* =============================================================================
   6. DICTATION (VOICE-2)  - a mic button is auto-added after every text field.
      Opt a field out with data-nomic="1".
   ============================================================================= */
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
  r.onerror = e => say(e.error === "not-allowed" || e.error === "service-not-allowed" ? "The microphone is blocked here. Allow it in your browser settings, or use the microphone key on your keyboard." : e.error === "no-speech" ? "I did not hear anything. Tap Dictate and try again." : "Dictation stopped (" + e.error + ").");
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
    const w = document.createElement("div"); w.className = "ig";      // attach button to the field as one group
    el.parentNode.insertBefore(w, el); w.append(el, b); b.onclick = () => toggleMic(el, b);
  });
}

/* =============================================================================
   7. EXPORT MODEL (EXP-2)  - the ONE shape every exporter reads.
      {title, sections:[{h, rows:[[label, value], ...]}]}
   ============================================================================= */
function model(){
  const gm = getGame();
  return {title: g("name") || CFG.title,
    sections: TABS.filter(t => t.fields.some(f => !f.hidden)).map(t => ({h: t.title, rows: t.fields.filter(f => !f.hidden).map(f => [f.label, g(f.k) || "(empty)"])}))
      .concat([{h: "Practice sorter", rows: [["Score", gm.done ? gm.s + " / " + GAME.length + " correct" : "(not finished)"]]}])};
}
const stamp = () => new Date().toISOString().slice(0, 10);
const fileName = ext => `${CFG.file}-${stamp()}.${ext}`;           // EXP-4

function md(){ const m = model(); return "# " + m.title + "\n\n" + m.sections.map(s => "## " + s.h + "\n\n" + s.rows.map(r => "**" + r[0] + "**\n\n" + r[1]).join("\n\n")).join("\n\n") + "\n" }
/* EXP-4: guard against spreadsheet formula injection (=,+,-,@) + UTF-8 BOM for Excel */
const cell = v => { v = String(v); if (/^[=+\-@\t\r]/.test(v)) v = "'" + v; return '"' + v.replace(/"/g, '""') + '"' };
function csv(){ const m = model(), o = [["Section","Field","Value"].map(cell).join(",")]; m.sections.forEach(s => s.rows.forEach(r => o.push([s.h, r[0], r[1]].map(cell).join(",")))); return "\uFEFF" + o.join("\r\n") + "\r\n" }

/* --- DOCX: zero-dependency (own ZIP writer, stored/no compression). Works offline. --- */
const CRC = (() => { const t = []; for (let n = 0; n < 256; n++){ let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0 } return t })();
const crc32 = u => { let c = 0xFFFFFFFF; for (let i = 0; i < u.length; i++) c = CRC[(c ^ u[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0 };
function zipBlob(files, mime){                                  // files: [[path, text], ...]
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

/* --- PPTX via PptxGenJS (CDN). autoPage splits long tables across slides. --- */
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

/* --- PDF via jsPDF (CDN). Latin text only. Page break handled by room(). --- */
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

/* =============================================================================
   8. EXPORT PIPELINE (EXP-1, EXP-3, EXP-4, EXP-5)
      To add a format: add one entry here. The dialog builds itself.
      lib() = readiness check for CDN-backed formats.
   ============================================================================= */
const EXPORTS = [
  {id:"pptx", label:"PowerPoint (.pptx)", desc:"Title slide and one slide per section", ic:"file-powerpoint", fb:"▦", lib:() => window.PptxGenJS, build:pptx},
  {id:"docx", label:"Word (.docx)",       desc:"Report with a table per section",       ic:"file-word",       fb:"📝", build:docx},
  {id:"pdf",  label:"PDF (.pdf)",         desc:"Ready to print or share",               ic:"file-pdf",        fb:"📕", lib:() => window.jspdf, build:pdf},
  {id:"csv",  label:"CSV (.csv)",         desc:"Opens in Excel or Google Sheets",       ic:"file-csv",        fb:"▤",  build:() => new Blob([csv()], {type:"text/csv;charset=utf-8"})},
  {id:"md",   label:"Markdown (.md)",     desc:"Plain text with headings",              ic:"file-lines",      fb:"📄", build:() => new Blob([md()], {type:"text/markdown;charset=utf-8"})}
];
/* EXP-5: host "downloads" capability if present (hosted pages), else Blob + <a download> */
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

/* --- DATA-4: backup / restore. Validate EVERYTHING that comes in. --- */
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
      if (started() && !confirm("Replace what is on this device with the backup?")) return say("Import cancelled. Nothing changed.");   // DATA-3
      data = {}; FIELDS.forEach(fl => { if (typeof d.data[fl.k] === "string") data[fl.k] = d.data[fl.k].slice(0, 5000) });                // only known keys, capped
      persist(); drawPanel(); say("Backup imported.");
    } catch (e) { say("That does not look like a backup from this app.") }
  };
  r.readAsText(f);
}

/* =============================================================================
   9. MODAL (A11Y-8): focus in, Tab trapped, background inert, Esc, restore focus
   ============================================================================= */
let opener = null; const BG = ["header", "main"];
const mEls = () => qa($("mdl"), "button").filter(b => !b.disabled);
function openM(){
  const n = started(); opener = document.activeElement;
  $("mc").textContent = n ? "Your work is ready to export. Choose a format:" : "Fill in part of the form first, then come back to export.";
  qa($("mo"), "button").forEach(b => b.disabled = !n); $("bks").disabled = !n;                       // EXP-3
  $("mdl").hidden = false; BG.forEach(q => document.querySelector(q).inert = true);
  (mEls()[0] || $("xcl")).focus();
}
function closeM(){ $("mdl").hidden = true; BG.forEach(q => document.querySelector(q).inert = false); if (opener && opener.focus) opener.focus() }

/* =============================================================================
   10. BOOT
   ============================================================================= */
function boot(){
  try {const saved=JSON.parse(load("Data")||"null");if(saved?.data && saved.v<=CFG.version){data=Object.fromEntries(Object.entries(saved.data).filter(([,value])=>typeof value==="string"&&value.length<=1500000));}} catch {}

  try { const s = JSON.parse(load("Data") || "null"); if (s && s.data && s.v <= CFG.version) FIELDS.forEach(f => { if (typeof s.data[f.k] === "string") data[f.k] = s.data[f.k] }) } catch (e) {}
   $("kick").textContent = CFG.kicker; $("ttl").textContent = CFG.title; $("sub").textContent = CFG.sub;
  /* accessibility */


  /* read aloud */
  $("rd").onclick = () => speak(readText());
  $("ps").onclick = () => { if (!hasTTS) return; if (speechSynthesis.paused){ speechSynthesis.resume(); $("pst").textContent = "Pause" } else if (speechSynthesis.speaking){ speechSynthesis.pause(); $("pst").textContent = "Resume" } };
  $("st").onclick = stopTTS;
  $("sp").onchange = () => { spd = +$("sp").value };
  addEventListener("pagehide", () => { stopTTS(); stopMic() });
  /* dictation notice (VOICE-2) */
  $("dh").textContent = SR ? "Tip: tap Dictate under any box and speak. Your browser's speech service may send the audio away, so do not say personal details." : "Dictation is not supported in this browser. On a phone, use the microphone key on your keyboard.";
  /* export dialog */
  $("mo").innerHTML = EXPORTS.map(x => `<button type="button" class="alt opt" id="x-${x.id}">${ic(x.ic, x.fb)}<span>${esc(x.label)}<small>${esc(x.desc)}</small></span></button>`).join("");
  EXPORTS.forEach(x => $("x-" + x.id).onclick = () => { closeM(); runExport(x) });
  $("xopen").onclick = openM; $("xcl").onclick = closeM; $("xcp").onclick = copyText; $("xpr").onclick = () => window.print();
  $("bks").onclick = () => { closeM(); backup() };
  $("bki").onclick = () => $("bkf").click();
  $("bkf").onchange = function(){ closeM(); importBackup(this.files[0]); this.value = "" };
  $("mdl").onclick = e => { if (e.target === $("mdl")) closeM() };
  $("mdl").onkeydown = e => {
    if (e.key === "Escape"){ e.preventDefault(); closeM(); return }
    if (e.key !== "Tab") return;
    const f = mEls(); if (!f.length) return; const i = f.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0){ e.preventDefault(); f[f.length - 1].focus() } else if (!e.shiftKey && i === f.length - 1){ e.preventDefault(); f[0].focus() }
  };
  $("clr").onclick = () => { if (!confirm("Clear everything you have written? This cannot be undone.")) return; data = {}; persist(); openTab(0); say("Everything cleared") };   // DATA-3
  /* first paint: stored theme, else the OS preference (A11Y-2) */

  
  { const lt = load("Tab"), n = lt === null ? NaN : +lt; cur = load("Seen") !== "1" ? 1 : (Number.isInteger(n) && n >= 0 && n < TABS.length ? n : 0); }
  drawTabs(); drawPanel(); tutPrompt();
  /* hosted-page downloads capability (optional; falls back to <a download>) */
  if (window.claude && claude.use) claude.use("downloads").then(d => { if (d) dl = d }, () => {});
}
/* =============================================================================
   11. "task-analysis" WIDGETS (custom, inside the drawPanel hook)
       Pipeline taught: TUTORIAL -> LEARN -> THREE EVIDENCE TABS -> SORTER
   ============================================================================= */
const TUT_STEPS = [{"t":"Goal","d":"Describe the outcome the user wants, in their words, not your interface's words."},{"t":"Observe","d":"Watch one person attempt the goal. Ask permission first. Note pauses, retries and detours."},{"t":"Map steps","d":"Number what you saw in order. Keep observation separate from interpretation."},{"t":"Simplify","d":"Choose one step to simplify and state the evidence for the change."}];
const TUT_EX = ["The player wants to join a match with a friend. I will observe from opening the game to entering the lobby.","1. Opens game. 2. Looks for friends list. 3. Opens profile instead. 4. Returns to menu. Observation: pauses for 12 seconds. Interpretation: the friends label may be unclear.","I will put “Play with friends” on the home screen because the player searched in two places."];
const READING = {"title":"Task Analysis: Support Users in Achieving Their Goals","url":"https://www.nngroup.com/articles/task-analysis/","summary":"Task analysis begins with gathering evidence about users’ goals and actions, then structures those actions into steps and subtasks. Observing real activity helps reveal details that self-reports can miss. A task diagram can show sequence, complexity and opportunities for improvement."};
const WATCH = "An imagined journey is a hypothesis. Label it clearly until you observe a user.";
const GAME = [["Describe the outcome the user wants, not the button to press","good","Goals, not controls. The same goal can be reached in different ways."],["Number each step you actually see, in order","good","A numbered map shows sequence and complexity."],["Separate what you saw from what you think it means","good","Observation and interpretation are different kinds of evidence."],["Ask permission before observing anyone","good","Consent keeps observation ethical and the participant comfortable."],["Check a proposed change by observing another user","good","Evidence for a change is a new observation, not a hunch."],["Write down the steps you expect without watching anyone","risk","An imagined journey is a hypothesis until you observe a user."],["Present an imagined journey as observed fact","risk","Labelling matters: simulated steps are not field evidence."],["Count button presses and ignore why the user paused","risk","Pauses often reveal the real obstacle."],["Assume one observed session proves the best design","risk","One observation is a clue, not a conclusion."],["Judge the user for choosing a slow route","risk","Task analysis judges the task, not the person."]];
const LEVELS = [["Newcomer 🐣",0],["Researcher 📋",25],["Research Lead 🏅",60]];
const GAME_TITLE = "Task analysis";

/* ---- small helpers ---- */
const pj = (k, d) => { try { const v = JSON.parse(data[k] || "null"); return Array.isArray(d) ? (Array.isArray(v) ? v : d) : (v && typeof v === "object" && !Array.isArray(v) ? v : d) } catch (e) { return d } };
const sj = (k, v) => { const e = (Array.isArray(v) && !v.length) || (v && typeof v === "object" && !Array.isArray(v) && !Object.keys(v).length); if (e) delete data[k]; else data[k] = JSON.stringify(v); persist() };
const shuf = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]] } return a };

const getGame = () => {
  const g0 = pj("gm", {});
  const ok = g0.o && Array.isArray(g0.o) && g0.o.length === GAME.length && g0.o.every(n => Number.isInteger(n) && n >= 0 && n < GAME.length);
  return { o: ok ? g0.o : shuf(GAME.map((_, i) => i)), i: Math.min(+g0.i || 0, GAME.length - 1), s: Math.min(Math.max(+g0.s || 0, 0), GAME.length), done: g0.done ? 1 : 0, picks: g0.picks && typeof g0.picks === "object" && !Array.isArray(g0.picks) ? g0.picks : {} };
};

/* ---- progress: XP, rank, tab ticks ---- */
function updXP(){
  const el = $("xp"); if (!el) return;
  const total = FIELDS.filter(f => !f.hidden).length, txt = FIELDS.filter(f => !f.hidden && g(f.k)).length, gm = getGame();
  const xp = txt * 5 + gm.s * 10, lv = LEVELS.filter(l => xp >= l[1]).pop() || LEVELS[0];
  el.innerHTML = `<b>⭐ ${xp} XP</b><span>Rank: ${esc(lv[0])}</span><span class="bdg${gm.done ? " on" : ""}">🎯 Sorter ${gm.done ? "complete" : "locked"}</span><span class="bdg${txt >= total ? " on" : ""}">📝 Notes ${txt >= total ? "complete" : txt + " / " + total}</span>`;
  updTicks();
}
function tabDone(i){
  const t = TABS[i], w = t.widget;
  if (w === "tutorial") return load("TutDone") === "1";
  if (w === "game") return getGame().done === 1;
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

/* ---- widget plumbing ---- */
function widgetHook(){ updXP(); navBar(); if (!TABS[cur].widget) return; $("panel").querySelector("p").insertAdjacentHTML("afterend", '<div id="wg" class="wg"></div>'); wgDraw() }
function wgDraw(){
  const el = $("wg"); if (!el || !TABS[cur].widget) return;
  el.innerHTML = ({ tutorial: wTut, learn: wLearn, game: wGame })[TABS[cur].widget]();
  el.onclick = e => { const b = e.target.closest("button[data-a]"); if (b) act(b.dataset.a, b.dataset.v) };
  updXP();
}

/* ---- tutorial ---- */
function wTut(){
  const done = load("TutDone") === "1";
  return `<h3 class="wh">How the method works</h3>` +
    `<ol class="steps">${TUT_STEPS.map((s, i) => `<li><b>${i + 1}. ${esc(s.t)}</b> — ${esc(s.d)}</li>`).join("")}</ol>` +
    `<h3 class="wh">Worked example</h3><ul class="ex">${TUT_EX.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` +
    `<h3 class="wh">Key reading</h3><p><b>${esc(READING.title)}</b></p><p><a href="${esc(READING.url)}" target="_blank" rel="noopener">${esc(READING.url)}</a></p><p class="hint">${esc(READING.summary)}</p>` +
    `<div class="watch"><b>Watch for:</b> ${esc(WATCH)}</div>` +
    `<div class="row"><button type="button" data-a="td">${done ? "Tutorial completed ✓" : "Mark tutorial as read"}</button></div>`;
}

/* ---- learn ---- */
function wLearn(){
  return `<h3 class="wh">The key idea</h3><p>${esc(READING.summary)}</p>` +
    `<div class="watch"><b>Watch for:</b> ${esc(WATCH)}</div>` +
    `<p class="hint">Now explain the idea in your own words in the box below. Aim for one or two sentences a peer could follow.</p>`;
}

/* ---- practice sorter ---- */
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

/* ---- actions ---- */
function act(a, v){
  if (a === "td"){ if (load("TutDone") !== "1"){ store("TutDone", "1"); say("Tutorial marked as read.") } wgDraw(); return }
  if (a === "gp"){
    const gm = getGame(), idx = gm.o[gm.i];
    if (gm.picks[idx] !== undefined) return;
    const ok = v === GAME[idx][1];
    const picks = Object.assign({}, gm.picks); picks[idx] = v;
    sj("gm", { o: gm.o, i: gm.i, s: gm.s + (ok ? 1 : 0), done: 0, picks });
    say((ok ? "Correct. " : "Not quite. ") + GAME[idx][2]);
    wgDraw(); return;
  }
  if (a === "gn"){
    const gm = getGame(), last = gm.i >= GAME.length - 1;
    sj("gm", { o: gm.o, i: last ? gm.i : gm.i + 1, s: gm.s, done: last ? 1 : 0, picks: gm.picks });
    if (last) say("Sort complete. Score " + gm.s + " out of " + GAME.length + ".");
    wgDraw(); return;
  }
  if (a === "gr"){ sj("gm", { o: shuf(GAME.map((_, i) => i)), i: 0, s: 0, done: 0, picks: {} }); say("New round. The statements are shuffled."); wgDraw() }
}

boot();

return {dispose(){stopMic();stopTTS();scope.dispose();}};
};
