// Synced from Activity_01_Online_Surveys_-_Survey_Lab.html; library scope isolates DOM, callbacks and timers.
window.RESEARCH_TASKS["surveys"] = function(scope){
const window=scope.window, document=scope.document;
const addEventListener=scope.addEventListener;
const {setTimeout,clearTimeout,setInterval,clearInterval}=scope;

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

const $ = id => document.getElementById(id);
const qa = (r, s) => [...r.querySelectorAll(s)];
/* SEC-1: escape EVERYTHING dynamic before it enters innerHTML */
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
/* DATA-1: storage may be blocked (private mode, sandbox). Never throw. */
const store = (k, v) => { try { localStorage.setItem(CFG.pfx + k, v) } catch (e) {} };
const load  = k => { try { return localStorage.getItem(CFG.pfx + k) } catch (e) { return null } };
/* A11Y-6: clear then set so repeated identical messages are still announced */
const say = m => { const l = $("live"); l.textContent = ""; setTimeout(() => { l.textContent = m; setTimeout(() => { if (l.textContent === m) l.textContent = "" }, 4500) }, 30) };
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
function openTab(i, focus){ stopMic(); stopTTS(); cur = i; store("Tab", i); $("live").textContent = ""; drawTabs(); drawPanel(); if (focus) $("t" + i).focus() }
/* A11Y-5: real <label for>, hint linked with aria-describedby */
function field(f){
  if (f.hidden) return "";
  const id = "f-" + f.k, d = `id="${id}" data-k="${f.k}" aria-describedby="h-${f.k}"`;
  const chips = f.starters ? `<div class="sel"><label class="sr" for="s-${f.k}">Add a starter (keyboard: arrows to browse, Enter to add)</label><select id="s-${f.k}" data-s="${f.k}"><option value="">＋ Add a starter…</option>${f.starters.map((t, i) => `<option value="${i}">${esc(t)}</option>`).join("")}</select></div>` : "";
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
  el.dispatchEvent(new Event("input", {bubbles:true})); say("Added: " + t.replace(/\.+$/, ""));
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
  r.onresult = e => { let t = ""; for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript; el.value = base + sep + t; el.dispatchEvent(new Event("input", {bubbles:true})) };
  r.onerror = e => say(e.error === "not-allowed" || e.error === "service-not-allowed" ? "The microphone is blocked here. Allow it in your browser settings, or use the microphone key on your keyboard." : e.error === "no-speech" ? "I did not hear anything. Tap Dictate and try again." : "Dictation stopped (" + e.error + ").");
  r.onend = () => { if (rec === r){ rec = null; recBtn = null } micIdle(b) };
  try { r.start() } catch (e) { return say("Dictation could not start.") }
  rec = r; recBtn = b; b.setAttribute("aria-pressed", "true"); b.querySelector("span").textContent = "Stop";
  say("Listening. Speak now, then tap Dictate again for more.");
}
function addMics(r){
  if (!SR) return;
  qa(r || $("panel"), "textarea,input[type=text]").forEach(el => {
    if (el.dataset.nomic || el.parentNode.classList.contains("ig")) return;
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
/* model() is defined in section 11 (Survey Lab) */
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
      data = {}; FIELDS.forEach(fl => { if (typeof d.data[fl.k] === "string") data[fl.k] = d.data[fl.k].slice(0, /^sv_/.test(fl.k) ? 90000 : 5000) });                // only known keys, capped
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

   { const lt = load("Tab"), n = lt === null ? NaN : +lt; cur = load("Seen") !== "1" ? 1 : (Number.isInteger(n) && n >= 0 && n < TABS.length ? n : 0); } drawTabs(); drawPanel(); tutPrompt();
  /* hosted-page downloads capability (optional; falls back to <a download>) */
  if (window.claude && claude.use) claude.use("downloads").then(d => { if (d) dl = d }, () => {});
}
/* =============================================================================
   11. SURVEY LAB WIDGETS (custom, inside the drawPanel hook)
       Pipeline taught: FORM -> DATABASE -> SURVEY TOOL ANALYSIS -> TRAINED EXPERT
   ============================================================================= */
const TY={mc:"Multiple choice",rate:"Rating 1 to 5",yn:"Yes / No",open:"Open text"}, TYE={mc:"🔘",rate:"⭐",yn:"👍",open:"✍️"};
const SUG=[
 ["mc","How did you hear about the event?",["Social media","Friend or team mate","School or college","The stream"]],
 ["mc","Who did you come with?",["On my own","With friends","With family","With my team"]],
 ["mc","How long did you queue to get in?",["Under 5 minutes","5 to 15 minutes","Over 15 minutes"]],
 ["mc","Which type of game matters most to you?",["Shooter","Sports","Racing","Strategy"]],
 ["rate","How easy was it to find your seat?"],
 ["rate","How clear was the match schedule?"],
 ["rate","How good was the sound and picture on the big screen?"],
 ["rate","How good value was the food?"],
 ["rate","How friendly were the staff?"],
 ["yn","Would you come to the event again?"],
 ["yn","Did you watch any matches on the stream?"],
 ["yn","Did you buy any merchandise?"],
 ["open","What was the best moment of the event?"],
 ["open","What one thing would you change?"]];
const COM=[["The queue to get in took ages","Queues"],["Food was too expensive","Price"],["Tickets felt overpriced for what we got","Price"],["Loved the stream quality","Stream"],["Stream kept buffering","Stream"],["Hard to find the match schedule","Schedule"],["Matches started late","Schedule"],["Sound in the arena was brilliant","Venue"],["Not enough seats near the stage","Venue"],["Great atmosphere, will be back","Other"],["Staff were friendly and helpful","Other"],["Wanted more food stalls","Food"],["Merch queue was far too long","Queues"],["Screens were hard to see from the back","Venue"],["Cheaper snacks please","Price"],["Needed clearer signs for the toilets","Venue"]];
const THEMES_Q=["Price","Queues","Stream","Schedule","Food","Venue","Other"];
const BK={db:"🗄️ Database",tool:"📊 Survey tool",exp:"🔍 Trained expert"};
const GAME=[
 ["Keeps every answer safe after the person closes the form","db","The database stores each response as a row, so the data is still there next week."],
 ["Stores each respondent as one row in a table","db","Rows and columns are how a database holds survey answers."],
 ["Lets you come back and look up the data later","db","Stored data can be searched and used again. That is the point of the database."],
 ["Counts how many people picked each option","tool","Counting is the basic analysis a survey tool does for you."],
 ["Works out the average rating","tool","Averages and percentages are calculated automatically by the tool."],
 ["Draws a bar chart in seconds","tool","Instant charts are the tool's level of analysis."],
 ["Decides if 20 responses is enough to trust","exp","Judging sample size takes training. The tool will chart 20 answers as happily as 2,000."],
 ["Spots that a question was leading people","exp","The tool cannot see bad wording. An expert reviews the questions as well as the results."],
 ["Reads the comments to find out WHY scores were low","exp","The tool counts. An expert interprets what people mean."],
 ["Turns the findings into a recommendation","exp","Deciding what to DO is human judgement, based on the evidence."]];
const TUT=[
 {t:"The form",why:"An online survey is a structured questionnaire. Everyone answers the same questions in the same order by filling in a form on the internet.",todo:["Read the question below.","Pick the answer that is true for you.","Press Next to send it."]},
 {t:"The database",why:"When someone sends the form, their answers are stored in a database. Each person becomes one row, so nothing is lost.",todo:["Find your row (it is marked YOU).","Count how many rows there are.","Notice the columns, just like a spreadsheet."]},
 {t:"The survey tool",why:"The survey tool reads the database and gives you some level of analysis for free: counts, percentages and charts.",todo:["Find the longest bar.","Check your answer is counted.","Ask: does the chart tell me WHY people chose it?"]},
 {t:"The trained expert",why:"A trained expert reviews the results. They ask whether the data can be trusted and what to do about it. The tool cannot decide that for you.",todo:["Read the decision below.","Choose what a careful expert would say.","Then go to Learn."]}];
const TUTQ=["In the arena","Live stream","Highlights later"], TUTF=[["R1","Live stream"],["R2","In the arena"],["R3","Live stream"],["R4","Highlights later"],["R5","Live stream"],["R6","In the arena"]];
let anView=null,exIdx=0,expView="1",lastTy="mc",tutStep=0,tutPick="",tutDec="",formOpen=false,formT0=0,showAll=false,sortT=false,newFrom=-1;

/* ---- small helpers ---- */
const pj=(k,d)=>{try{const v=JSON.parse(data[k]||"null");return Array.isArray(d)?(Array.isArray(v)?v:d):(v&&typeof v==="object"&&!Array.isArray(v)?v:d)}catch(e){return d}};
const sj=(k,v)=>{const e=(Array.isArray(v)&&!v.length)||(v&&typeof v==="object"&&!Array.isArray(v)&&!Object.keys(v).length);if(e)delete data[k];else data[k]=JSON.stringify(v);persist()};
const rng=s=>()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const hs=s=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0};
const shuf=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const pct=(n,t)=>t?Math.round(n/t*100):0;
const getQs=()=>pj("sv_q",[]).filter(q=>q&&typeof q.id==="string"&&/^[a-z0-9]{1,8}$/i.test(q.id)&&typeof q.t==="string"&&TY[q.ty]).map(q=>({id:q.id,t:q.t.slice(0,140),ty:q.ty,o:q.ty==="mc"&&Array.isArray(q.o)?q.o.filter(x=>typeof x==="string").map(x=>x.slice(0,40)).slice(0,6):[]})).slice(0,12);
const getResp=()=>pj("sv_r",[]).filter(r=>r&&typeof r.id==="string"&&r.a&&typeof r.a==="object"&&!Array.isArray(r.a)).map(r=>({id:r.id.slice(0,8),you:r.you?1:0,t:Math.max(0,+r.t||0),a:r.a})).slice(0,110);
const getGame=()=>{const g0=pj("sv_game",{}),o=Array.isArray(g0.o)&&g0.o.length===GAME.length&&g0.o.every(n=>Number.isInteger(n)&&n>=0&&n<GAME.length)?g0.o:shuf(GAME.map((_,i)=>i));return{o,i:Math.min(+g0.i||0,GAME.length),s:Math.min(+g0.s||0,GAME.length),l:BK[g0.l]?g0.l:"",d:g0.d?1:0,h:typeof g0.h==="string"?g0.h.replace(/[^01]/g,"").slice(0,GAME.length):""}};
const flagged=()=>new Set(pj("sv_flag",[]).filter(x=>typeof x==="string"));
const isFast=r=>r.t<25;
const aval=(r,q)=>r.a[q.id];
function stat(q,rs){const v=rs.map(r=>aval(r,q)).filter(x=>x!==undefined&&x!==null&&x!=="");
 if(q.ty==="mc"){const c=q.o.map(o=>v.filter(x=>x===o).length);return{n:v.length,c}}
 if(q.ty==="rate"){const w=v.filter(x=>Number.isInteger(x)&&x>=1&&x<=5),c=[1,2,3,4,5].map(k=>w.filter(x=>x===k).length);return{n:w.length,c,avg:w.length?w.reduce((a,b)=>a+b,0)/w.length:0}}
 if(q.ty==="yn"){const c=[v.filter(x=>x==="Yes").length,v.filter(x=>x==="No").length];return{n:c[0]+c[1],c}}
 const txt=v.filter(x=>typeof x==="string"),SW=new Set("the and was for that with were this have from they there too more not you our but all had can very out one get got about what would really".split(" ")),W={};
 txt.join(" ").toLowerCase().replace(/[^a-z\s]/g," ").split(/\s+/).forEach(w=>{if(w.length>3&&!SW.has(w))W[w]=(W[w]||0)+1});
 return{n:txt.length,top:Object.entries(W).sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,6),txt}}
function coach(q){const m=[],t=q.t;
 if(/\b(don't you|wouldn't you|isn't it|obviously|amazing|awesome|fantastic|terrible|awful|best ever|agree)\b/i.test(t))m.push("Leading? Loaded words push people toward an answer. Use neutral wording.");
 if(/\band\b/i.test(t)&&q.ty!=="open")m.push("Check: does 'and' ask about two things at once? Ask one thing per question.");
 if(t.length>90)m.push("Long: shorter questions get better answers.");
 if(q.ty!=="open"&&!/\?$/.test(t))m.push("Tip: end it with a question mark so it reads as a question.");
 return m}
const mins=qs=>Math.max(1,Math.ceil(qs.reduce((a,q)=>a+(q.ty==="open"?1:.5),0)));
function confirmEdit(){if(getResp().length){if(!confirm("This survey already has responses. Changing the questions would mix old and new data, so the responses will be cleared. Continue?"))return false;["sv_r","sv_flag","sv_code"].forEach(k=>delete data[k]);delete data.sv_chk;persist()}return true}

/* ---- XP + badges (the fun layer) ---- */
function updXP(){const el=$("xp");if(!el)return;
 const q=getQs().length,r=getResp().length,gm=getGame(),code=Object.keys(pj("sv_code",{})).length,chk=data.sv_chk==="1",txt=FIELDS.filter(f=>!f.hidden&&g(f.k)).length;
 const xp=Math.min(q,10)*10+Math.min(r,40)+(gm.d?gm.s*10:0)+Math.min(code,10)*5+(chk?20:0)+txt*5;
 updTicks();const T=[0,50,120,200],R=["Rookie 🐣","Surveyor 📋","Analyst 📈","Research Pro 🏅"],li=xp<50?0:xp<120?1:xp<200?2:3,nx=T[li+1],pc=nx?Math.round((xp-T[li])/(nx-T[li])*100):100;
 const B=[["📝","Form Builder",q>=6],["🗄️","Data Keeper",r>=20],["🎯","Sort Champion",gm.d&&gm.s>=8],["🔍","Expert Eye",chk&&code>=5]];
 el.innerHTML=`<b>⭐ ${xp} XP</b><span>${esc(R[li])}</span><span class="xpbar" role="img" aria-label="${nx?pc+" percent of the way to "+R[li+1]:"Top rank reached"}"><i style="width:${pc}%"></i></span>`+B.map(b=>`<span class="bdg${b[2]?" on":""}" title="${b[1]}: ${b[2]?"earned":"locked"}">${b[2]?"✓":"🔒"} ${b[0]}<span class="bn"> ${b[1]}</span><span class="sr"> ${b[2]?"earned":"locked"}</span></span>`).join("")}

/* ---- navigation: ticks, Back/Next, one-time tutorial prompt ---- */
function tabDone(i){const t=TABS[i],w=t.widget;
 if(w==="tutorial")return load("TutDone")==="1";
 if(w==="build"&&getQs().length)return true;
 if(w==="collect"&&getResp().length)return true;
 if(w==="sort"&&getGame().d)return true;
 if(w==="expert"&&(data.sv_chk==="1"||Object.keys(pj("sv_code",{})).length))return true;
 if(w==="analyse"&&Object.keys(exPick).length)return true;
 return t.fields.some(f=>!f.hidden&&g(f.k))}
function updTicks(){TABS.forEach((t,i)=>{const b=$("t"+i);if(!b)return;const d=tabDone(i),s=b.querySelector(".dn");
 if(d&&!s)b.insertAdjacentHTML("beforeend",'<span class="dn"><span aria-hidden="true">✓</span><span class="sr"> done</span></span>');
 else if(!d&&s)s.remove()});tabFade()}
function navBar(){const p=$("panel");if(!p)return;const pr=TABS[cur-1],nx=TABS[cur+1];
 p.insertAdjacentHTML("beforeend",`<div class="row pnav">${pr?`<button type="button" class="alt" data-nav="-1"><span aria-hidden="true">←</span> Back: ${esc(pr.title)}</button>`:"<span></span>"}${nx?`<button type="button" data-nav="1">Next: ${esc(nx.title)} <span aria-hidden="true">→</span></button>`:"<span></span>"}</div>`);
 qa(p,"[data-nav]").forEach(b=>b.onclick=()=>{openTab(cur+ +b.dataset.nav,true);if($("tabs").scrollIntoView)$("tabs").scrollIntoView({block:"start"})})}
function tutPrompt(){const el=$("tp");if(!el||load("Seen")==="1")return;
 el.innerHTML=`<div class="tp" role="region" aria-label="Welcome"><p><b>New here?</b> Take the 2-minute tutorial first. It shows how one answer travels from the form to the expert.</p><div class="row"><button type="button" id="tpy">Take the tutorial</button><button type="button" class="alt" id="tpn">Skip for now</button></div></div>`;
 const close=m=>{store("Seen","1");el.innerHTML="";say(m)};
 $("tpy").onclick=()=>{close("Starting the tutorial.");openTab(0,true)};
 $("tpn").onclick=()=>close("Skipped. The tutorial is always in the first tab.")}

/* ---- widget plumbing ---- */
function tabFade(){const tl=$("tabs");if(!tl)return;tl.classList.toggle("tl-r",tl.scrollWidth-tl.clientWidth-tl.scrollLeft>6);tl.classList.toggle("tl-l",tl.scrollLeft>6)}
function widgetHook(){updXP();navBar();$("panel").classList.remove("hf");{const tb=$("t"+cur),tl=$("tabs");if(tb&&tl){const l=tb.offsetLeft,r=l+tb.offsetWidth;if(l<tl.scrollLeft)tl.scrollLeft=Math.max(0,l-10);else if(r>tl.scrollLeft+tl.clientWidth)tl.scrollLeft=r-tl.clientWidth+10;if(!tl.dataset.fx){tl.dataset.fx="1";tl.addEventListener("scroll",tabFade,{passive:true})}tabFade()}}if(!TABS[cur].widget)return;$("panel").querySelector("p").insertAdjacentHTML("afterend",'<div id="wg" class="wg"></div>');wgDraw()}
function wgDraw(fid){const el=$("wg");if(!el)return;
 el.innerHTML=({tutorial:wTut,learn:wLearn,build:wBuild,collect:wCollect,analyse:wAn,sort:wGame,expert:wExpert})[TABS[cur].widget]();
 el.onclick=e=>{const b=e.target.closest("button[data-a]");if(b)act(b.dataset.a,b.dataset.v,b.dataset.x,b.id)};
 el.onchange=e=>{if(e.target.id==="nt"){lastTy=e.target.value;const o=$("optw");if(o)o.hidden=lastTy!=="mc";return}const b=e.target.closest("[data-a]");if(b&&(b.tagName==="SELECT"||b.type==="checkbox"||b.type==="radio"))act(b.dataset.a,b.type==="checkbox"?b.checked:b.value,b.dataset.v,b.id)};
 el.onkeydown=e=>{if(e.key==="Enter"&&e.target.id==="nq"){e.preventDefault();act("addq")}};
 if(TABS[cur].widget==="analyse")$("panel").classList.toggle("hf",(anView||(getResp().length?"mine":"learn"))==="learn");addMics(el);if(fid&&$(fid))$(fid).focus();updXP()}

/* ---- tutorial ---- */
function wTut(){const s=TUT[tutStep];
 let vis="";
 if(tutStep===0)vis=`<fieldset><legend>Sample question: How did you watch the finals?</legend>${TUTQ.map((o,i)=>`<label class="rad"><input type="radio" name="tq" value="${esc(o)}" data-a="tpick"${tutPick===o?" checked":""}> ${esc(o)}</label>`).join("")}</fieldset>`;
 if(tutStep===1){const rows=TUTF.concat([["R7 (YOU)",tutPick||"(no answer)"]]);vis=`<div class="scr" tabindex="0" role="region" aria-label="Tutorial database table"><table class="tbl"><caption class="hint">Database: one row per respondent</caption><thead><tr><th scope="col">Respondent</th><th scope="col">How did you watch the finals?</th></tr></thead><tbody>${rows.map((r,i)=>`<tr${i===rows.length-1?' class="you"':""}><td>${esc(r[0])}</td><td>${esc(r[1])}</td></tr>`).join("")}</tbody></table></div>`}
 if(tutStep===2){const all=TUTF.map(r=>r[1]).concat([tutPick]).filter(Boolean);vis=`<div role="group" aria-label="Chart of answers">${TUTQ.map(o=>{const n=all.filter(x=>x===o).length;return bar(o,n,all.length)}).join("")}</div><p class="hint">Tool says: ${all.length} responses.</p>`}
 if(tutStep===3)vis=`<div class="callout"><p><b>Tool says:</b> Live stream is the most popular answer (${TUTF.filter(r=>r[1]==="Live stream").length+(tutPick==="Live stream"?1:0)} of 7).</p><p><b>Decision:</b> The organisers want to move every match to the stream only. What would a trained expert say?</p></div><div class="row"><button type="button" class="alt" data-a="tdec" data-v="yes">Do it now: the chart is clear</button><button type="button" class="alt" data-a="tdec" data-v="no">Not yet: ask more people and find out why</button></div>`+(tutDec?`<p class="fb" role="status"><b>${tutDec==="no"?"Good thinking.":"Careful."}</b> ${tutDec==="no"?"Seven people is a tiny sample, and the chart cannot tell you WHY they chose the stream. An expert checks both before recommending anything.":"Seven people cannot represent a whole audience, and the tool does not tell you why. Experts check the sample and the reasons first."}</p>`:"");
 return `<section class="tutorial-card"><span class="tutorial-count">TUTORIAL · STEP ${tutStep+1} OF ${TUT.length}</span><ol class="dots" aria-hidden="true">${TUT.map((_,i)=>`<li class="pip ${i<tutStep?"ok":i===tutStep?"cur":""}">${i<tutStep?"✓":i+1}</li>`).join("")}</ol><h3>${esc(s.t)}</h3><p>${esc(s.why)}</p><h4>What to do</h4><ol>${s.todo.map(x=>`<li>${esc(x)}</li>`).join("")}</ol>${vis}<div class="row"><button type="button" class="alt" data-a="tback"${tutStep?"":" disabled"}>Back</button>${tutStep<TUT.length-1?'<button type="button" id="tnext" data-a="tnext">Next</button>':'<button type="button" id="tnext" data-a="tdone">Finish tutorial: go to Learn</button>'}</div></section>`}
function bar(label,n,t){const p=pct(n,t);return `<div class="bar2"><span>${esc(label)}</span><div class="tk" aria-hidden="true"><i style="width:${p}%"></i></div><b>${n} (${p}%)</b></div>`}

/* ---- learn ---- */
function wLearn(){return `<blockquote class="rd"><p>An online survey is a structured questionnaire that your target audience completes over the internet, generally by filling out a form. Online surveys can vary in length and format. The data is stored in a database and the survey tool generally provides some level of analysis of the data, in addition to review by a trained expert.</p><small>From the Research slides: Online Surveys</small></blockquote>
 <h3 class="wh">The survey pipeline</h3>
 <div class="pipe"><div style="--c:var(--cy)"><h3>1 · Form</h3><p>People answer the same questions over the internet.</p></div><div style="--c:var(--pk)"><h3>2 · Database</h3><p>Every answer is stored. One person = one row.</p></div><div style="--c:var(--li)"><h3>3 · Survey tool</h3><p>Counts, averages and charts. Some level of analysis.</p></div><div style="--c:var(--am)"><h3>4 · Trained expert</h3><p>Reviews the data, explains it, and recommends action.</p></div></div>
 <h3 class="wh">Surveys vary in length and format</h3>
 <div class="chips">${Object.keys(TY).map(k=>`<span class="bdg on">${TYE[k]} ${TY[k]}</span>`).join("")}<span class="bdg on">⏱️ 2 minutes or 20</span></div>
 <p class="hint">Short surveys get more finishers. Long surveys get more detail. You will choose the balance on the Build tab.</p>`}

/* ---- build ---- */
function wBuild(){const qs=getQs(),have=new Set(qs.map(q=>q.t.toLowerCase())),left=SUG.map((s,i)=>[s,i]).filter(p=>!have.has(p[0][1].toLowerCase()));
 const used=[...new Set(qs.map(q=>TY[q.ty]))],n=qs.length,msg=n===0?"Add your first question.":n<6?`Add ${6-n} more for a solid survey.`:n<=10?"Good length ✓":"Getting long: shorter surveys get more finishers.";
 const meter=`<div class="mt"><p class="stat"><b>${n}</b> of 12 questions · about <b>${n?mins(qs):0}</b> min · ${used.length?esc(used.join(", ")):"no formats yet"}</p><div class="tk" aria-hidden="true"><i style="width:${Math.min(100,n*10)}%"></i></div><p class="hint">${msg} Aim for 6 to 10 questions in at least two formats.</p></div>`;
 const list=n?`<ol class="ql">${qs.map((q,i)=>`<li class="qi"><span class="qn" aria-hidden="true">${i+1}</span><div><span class="qty">${TYE[q.ty]} ${TY[q.ty]}</span><p class="qt">${esc(q.t)}</p>${q.o.length?`<p class="hint">Options: ${esc(q.o.join(" · "))}</p>`:""}${coach(q).map(m=>`<p class="coach">Coach: ${esc(m)}</p>`).join("")}</div><div class="qa"><button type="button" class="alt" data-a="mvq" data-v="${i}" data-x="-1" aria-label="Move question ${i+1} up" title="Move up"${i?"":" disabled"}>↑</button><button type="button" class="alt" data-a="mvq" data-v="${i}" data-x="1" aria-label="Move question ${i+1} down" title="Move down"${i<n-1?"":" disabled"}>↓</button><button type="button" class="alt" data-a="delq" data-v="${i}" aria-label="Remove question ${i+1}">Remove</button></div></li>`).join("")}</ol>`:'<p class="hint">No questions yet. Tap a suggestion to start.</p>';
 return `${meter}<div class="b2"><div>
 <h3 class="wh">Suggested questions</h3><p class="hint">Tap one to add it to your form.</p><div class="chips">${left.map(p=>`<button type="button" class="alt" data-a="sug" data-v="${p[1]}">＋ ${TYE[p[0][0]]} ${esc(p[0][1])}</button>`).join("")||'<p class="hint">All suggestions used.</p>'}</div>
 <div class="row"><button type="button" data-a="starter">Add 6 starter questions</button></div>
 <h3 class="wh">Write your own</h3>
 <label class="f" for="nq">Question text<span class="hint">One idea per question, in neutral words.</span></label><input type="text" id="nq" maxlength="140">
 <label class="f" for="nt">Format</label><select id="nt">${Object.keys(TY).map(k=>`<option value="${k}"${k===lastTy?" selected":""}>${TY[k]}</option>`).join("")}</select>
 <div id="optw"${lastTy==="mc"?"":" hidden"}><label class="f" for="no">Answer options<span class="hint">One per line, 2 to 6 options.</span></label><textarea id="no" rows="3" maxlength="300"></textarea></div>
 <div class="row"><button type="button" data-a="addq">Add question</button></div></div>
 <div class="stick"><h3 class="wh">Your survey form</h3>${list}<p class="hint">Once a survey has responses, adding or removing questions clears them. Reordering is safe.</p></div></div>`}

/* ---- database (collect) ---- */
function ansText(q,r){const v=aval(r,q);return v===undefined||v===""?"–":String(v)}
function wForm(){const qs=getQs();return `<section class="tutorial-card" aria-label="Survey form"><h3>${esc(g("name")||"Your survey")}</h3><p class="hint">Fill this in as a real respondent would. Open text is optional.</p>${qs.map((q,i)=>`<fieldset><legend>${i+1}. ${esc(q.t)}</legend>${q.ty==="open"?`<label class="f" for="fo_${q.id}">Your answer (optional)</label><textarea id="fo_${q.id}" rows="2" maxlength="200"></textarea>`:(q.ty==="mc"?q.o:q.ty==="yn"?["Yes","No"]:[1,2,3,4,5]).map((o,j)=>`<label class="rad"><input type="radio" name="qa_${q.id}" value="${esc(o)}"> ${q.ty==="rate"?o+(j===0?" (poor)":j===4?" (excellent)":""):esc(o)}</label>`).join("")}</fieldset>`).join("")}<div class="row"><button type="button" data-a="submit">Send my answers</button><button type="button" class="alt" data-a="cancelform">Cancel</button></div></section>`}
function wCollect(){const qs=getQs(),rs=getResp();
 if(qs.length<5)return `<p class="hint">Build at least 5 questions on the Build tab first. You have ${qs.length}.</p>`;
 const you=rs.some(r=>r.you),batches=Math.floor(rs.filter(r=>!r.you).length/20),rows=showAll?rs:rs.slice(-15),nf=newFrom;
 if(nf>=0)setTimeout(()=>{newFrom=-1},1800);
 return `<div class="row">${you?"":'<button type="button" data-a="openform" id="of">Fill in the form yourself</button>'}<button type="button" data-a="gen" id="gb"${batches>=5?" disabled":""}>${batches>=5?"All 5 batches collected":"Collect 20 more responses"}</button><button type="button" class="alt" data-a="clearr"${rs.length?"":" disabled"}>Clear responses</button></div>
 <div class="pips" role="img" aria-label="${batches} of 5 batches of 20 collected">${[0,1,2,3,4].map(i=>`<span class="pip ${i<batches?"ok":i===batches?"cur":""}" aria-hidden="true">${i<batches?"✓":i+1}</span>`).join("")}<span class="hint" style="align-self:center;margin:0 0 0 4px">Batch ${Math.min(batches+1,5)} of 5 · 20 simulated responses each</span></div>
 ${formOpen?wForm():""}
 <h3 class="wh">🗄️ Database: <span id="dbn">${rs.length}</span> rows</h3><p class="hint">Each time a form is sent, one new row is stored. Responses here are simulated so you can practise.</p>
 <details class="qk"><summary>Question key (Q1 to Q${qs.length})</summary><ul class="legend">${qs.map((q,i)=>`<li><b>Q${i+1}</b> ${esc(q.t)}</li>`).join("")}</ul></details>
 ${rs.length?`<div class="scr" tabindex="0" role="region" aria-label="Database table of responses"><table class="tbl"><thead><tr><th scope="col">ID</th><th scope="col">Time (s)</th>${qs.map((q,i)=>`<th scope="col" title="${esc(q.t)}">Q${i+1}</th>`).join("")}</tr></thead><tbody>${rows.map(r=>{const idx=rs.indexOf(r);return `<tr class="${r.you?"you ":""}${idx>=nf&&nf>=0?"new":""}"><th scope="row">${esc(r.id)}${r.you?" (YOU)":""}</th><td>${r.t}</td>${qs.map(q=>`<td title="${esc(ansText(q,r))}">${esc(ansText(q,r))}</td>`).join("")}</tr>`}).join("")}</tbody></table></div>${rs.length>15?`<div class="row"><button type="button" class="alt" data-a="showall">${showAll?"Show latest 15 only":"Show all "+rs.length+" rows"}</button></div>`:""}`:'<p class="hint">The database is empty. Fill in the form yourself, or collect responses.</p>'}`}
function gen(){const qs=getQs(),rs=getResp();const n=20,done=Math.floor(rs.filter(x=>!x.you).length/20);if(done>=5)return say("All 5 batches are collected: 100 simulated responses.");
 const R=rng((Date.now()^0x9e3779b9)>>>0);newFrom=rs.length;
 for(let k=0;k<n;k++){const sp=R()<.15,a={};
  qs.forEach(q=>{const h=hs(q.t);
   if(q.ty==="mc"){if(sp){a[q.id]=q.o[0];return}const w=q.o.map((o,j)=>.25+Math.pow((hs(q.t+"|"+j)%100)/100,2)*2),T=w.reduce((x,y)=>x+y,0);let r=R()*T,j=0;while(j<w.length-1&&r>w[j]){r-=w[j];j++}a[q.id]=q.o[j]}
   else if(q.ty==="rate"){if(sp){a[q.id]=5;return}a[q.id]=Math.max(1,Math.min(5,Math.round(2.6+(h%16)/10+(R()+R()+R()-1.5)*1.4)))}
   else if(q.ty==="yn"){if(sp){a[q.id]="Yes";return}a[q.id]=R()<.35+(h%45)/100?"Yes":"No"}
   else if(!sp&&R()<.8)a[q.id]=COM[Math.floor(R()*COM.length)][0]});
  rs.push({id:"R"+String(rs.length+1).padStart(3,"0"),you:0,t:sp?5+Math.floor(R()*10):Math.round(qs.length*(14+R()*18)),a})}
 sj("sv_r",rs);wgDraw(done+1>=5?"":"gb");say("Batch "+(done+1)+" of 5 stored. The database now has "+rs.length+" rows.")}



/* ---- pie chart (SVG, tokens only; numbered slices + legend so colour is never the only signal) ---- */
const PC=["--cy","--pk","--li","--am","--mu","--tx"];
function pie(items){const tot=items.reduce((a,x)=>a+x[1],0);
 if(!tot)return '<p class="hint">No answers yet, so there is nothing to show in a pie.</p>';
 let ang=-Math.PI/2,sl="",lb="";
 items.forEach((x,i)=>{if(!x[1])return;const f=x[1]/tot,a2=ang+f*2*Math.PI,c="var("+PC[i%6]+")";
  if(f>=.9999)sl+=`<circle cx="100" cy="100" r="90" style="fill:${c}"/>`;
  else{const x1=100+90*Math.cos(ang),y1=100+90*Math.sin(ang),x2=100+90*Math.cos(a2),y2=100+90*Math.sin(a2);sl+=`<path d="M100 100 L${x1.toFixed(2)} ${y1.toFixed(2)} A90 90 0 ${f>.5?1:0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z" style="fill:${c};stroke:var(--bg);stroke-width:2"/>`}
  if(f>=.1){const m=ang+f*Math.PI;const lx=(100+60*Math.cos(m)).toFixed(1),ly=(100+60*Math.sin(m)-2).toFixed(1);lb+=`<text text-anchor="middle" style="fill:var(--bg);font-size:12px;font-weight:700"><tspan x="${lx}" y="${ly}">${i+1}</tspan><tspan x="${lx}" dy="13">${Math.round(f*100)}%</tspan></text>`}
  ang=a2});
 return `<div class="pie"><svg viewBox="0 0 200 200" role="img" aria-label="Pie chart. ${esc(items.map(x=>x[0]+" "+pct(x[1],tot)+" percent").join(", "))}">${sl}${lb}</svg><ul class="pl">${items.map((x,i)=>`<li><i class="sw" style="background:var(${PC[i%6]})"></i><span><b>${i+1}.</b> ${esc(x[0])}: <b>${x[1]} (${pct(x[1],tot)}%)</b></span></li>`).join("")}</ul></div>`}

/* ---- worked example charts: practise READING data before using your own ---- */
const EXS=[
 {t:"Example 1 · Multiple choice: How long did you queue?",n:45,kind:"bars",d:[["Under 5 minutes",14],["5 to 15 minutes",22],["Over 15 minutes",9]],
  q:"What share of people queued for 5 minutes or more?",o:["31%","69%","49%"],c:1,
  why:"22 + 9 = 31 people out of 45, which is 69%. Add the bars that match the question, then divide by the total.",
  ex:"Most people (69%) queued for 5 minutes or more, and 1 in 5 waited over 15 minutes. That is worth fixing, but the chart cannot say WHY the queue was slow. Check the comments."},
 {t:"Example 2 · Rating 1 to 5: How good was the sound and picture?",n:45,kind:"bars",d:[["1 (poor)",2],["2",4],["3",9],["4",18],["5 (excellent)",12]],avg:"3.8",
  q:"The average is 3.8 out of 5. Which statement does the chart support?",o:["Nobody rated it poor","Most people rated it 4 or 5","Everyone was satisfied"],c:1,
  why:"18 + 12 = 30 of 45 gave a 4 or 5 (67%). Two people did give a 1, so the first statement is false, and 6 people rated it 1 or 2, so not everyone was satisfied.",
  ex:"An average of 3.8 looks good, and 67% rated 4 or 5. But look at the spread, not just the average: 6 people were unhappy. An expert would read their comments."},
 {t:"Example 3 · Yes / No: Would you come again?",n:45,kind:"bars",d:[["Yes",34],["No",11]],
  q:"76% said Yes. What would a trained expert check before celebrating?",o:["Who answered, and whether 45 people is enough","Nothing, 76% is high","Make the Yes bar bigger"],c:0,
  why:"A tool will chart any numbers. The expert asks whether the sample is fair: were these only fans who stayed to the end? Did anyone who left early get asked?",
  ex:"76% would return, but only 45 people answered and we do not know who they were. People who stayed to the end may be keener than those who left early, so treat this as a good sign, not proof."},
 {t:"Example 4 · Comparing groups: Average rating by day",n:45,kind:"cols",d:[["Friday",3.1],["Saturday",4.2],["Sunday",4.0]],
  q:"Which day should the organisers investigate first?",o:["Friday","Saturday","Sunday"],c:0,
  why:"Friday's average (3.1) is a full point below the other days. Comparing groups is how you find where a problem is hiding.",
  ex:"Friday scored about a point lower than Saturday and Sunday. Something went differently that day. An expert would filter the comments by day and look for the cause."},
 {t:"Example 5 · Pie chart: Who did you come with?",n:45,kind:"pie",d:[["On my own",6],["With friends",21],["With family",12],["With my team",6]],
  q:"Which statement does the pie chart support?",o:["Most people came with family","About half came with friends","Fewer than 10% came on their own"],c:1,
  why:"21 of 45 is 47%, which is about half. Family is 27% (not most), and coming alone is 13% (more than 10%). Read the slice sizes against the numbers in the legend.",
  ex:"Nearly half the audience (47%) came with friends, so group seating and group tickets look worthwhile. A pie shows parts of a whole, so use it for a few categories that add up to 100%. Use bars when you need to compare sizes closely, or compare groups."}];
let exPick={},exShow={};
function exChart(e){
 if(e.kind==="pie")return pie(e.d);
 if(e.kind==="bars")return `<div role="group" aria-label="Chart: ${esc(e.t)}">`+e.d.map(r=>bar(r[0],r[1],e.n)).join("")+`</div>`+(e.avg?`<p class="big">Average <b>${e.avg}</b> out of 5</p>`:"");
 const W=300,H=150,mx=5,bw=60,gap=30;
 return `<svg viewBox="0 0 ${W} ${H+30}" role="img" aria-label="Column chart. ${esc(e.d.map(r=>r[0]+" "+r[1]).join(", "))}" class="svgc">`+[1,2,3,4,5].map(k=>`<line x1="30" x2="${W}" y1="${H-k*H/mx+10}" y2="${H-k*H/mx+10}" style="stroke:var(--bd)"/><text x="24" y="${H-k*H/mx+14}" text-anchor="end" style="fill:var(--mu);font-size:10px">${k}</text>`).join("")+e.d.map((r,i)=>{const h=r[1]/mx*H,x=45+i*(bw+gap);return `<rect x="${x}" y="${H-h+10}" width="${bw}" height="${h}" rx="4" style="fill:var(--cy)"/><text x="${x+bw/2}" y="${H-h+4}" text-anchor="middle" style="fill:var(--hd);font-size:11px;font-weight:700">${r[1]}</text><text x="${x+bw/2}" y="${H+26}" text-anchor="middle" style="fill:var(--tx);font-size:11px">${esc(r[0])}</text>`}).join("")+`</svg>`}
function seg(id,opts,cur,action,label){return `<div class="seg" role="group" aria-label="${label}">${opts.map(o=>`<button type="button" id="${id}${o[0]}" class="alt" data-a="${action}" data-v="${o[0]}" aria-pressed="${cur===o[0]}">${o[1]}</button>`).join("")}</div>`}
function exSection(){const i=exIdx,e=EXS[i],p=exPick[i];
 return `<p class="hint">Sample data (45 responses). Read the chart, answer the question, then compare with the expert's reading.</p><div class="chips" role="group" aria-label="Choose an example">${EXS.map((x,j)=>`<button type="button" id="exc${j}" class="alt chip" data-a="exgo" data-v="${j}" aria-pressed="${j===i}" aria-label="Example ${j+1}${exPick[j]!==undefined?", answered":""}">${exPick[j]!==undefined?"✓ ":""}${j+1}</button>`).join("")}</div>
 <section class="qc"><h3 class="qh">${esc(e.t)}</h3><p class="hint">${e.n} responses</p>${exChart(e)}<p class="qt"><b>Your turn:</b> ${esc(e.q)}</p><div class="gb">${e.o.map((o,j)=>`<button type="button" class="alt${p!==undefined?(j===e.c?" ok":j===p?" no":""):""}" data-a="expick" data-v="${j}" data-x="${i}"${p!==undefined?" disabled":""}>${p!==undefined&&j===e.c?"✓ ":p===j?"✗ ":""}${esc(o)}</button>`).join("")}</div>${p!==undefined?`<p class="fb" role="status"><b>${p===e.c?"Correct! ✅":"Not quite. ❌ The answer is: "+esc(e.o[e.c])+"."}</b> ${esc(e.why)}</p>`:""}<div class="row"><button type="button" class="alt" data-a="exread" data-v="${i}" aria-expanded="${!!exShow[i]}">${exShow[i]?"Hide":"Show"} the expert's reading</button>${p!==undefined&&i<EXS.length-1?`<button type="button" id="exnext" data-a="exgo" data-v="${i+1}">Next example</button>`:""}</div>${exShow[i]?`<div class="callout"><p><b>Expert's reading:</b> ${esc(e.ex)}</p></div>`:""}</section>`}

/* ---- analyse (the survey tool) ---- */
function used(){const all=getResp(),fl=flagged(),ex=data.sv_ex==="1";return{all,rs:ex?all.filter(r=>!fl.has(r.id)):all,ex}}
function wAn(){const qs=getQs(),{all,rs,ex}=used(),done=Object.keys(exPick).length,v=anView||(all.length?"mine":"learn");
 const head=seg("av",[["mine","📊 Your results"],["learn",`🎓 Practise reading charts (${done} of ${EXS.length})`]],v,"anv","Analyse view");
 if(v==="learn")return head+exSection()+(all.length?`<div class="row"><button type="button" class="alt" data-a="anv" data-v="mine">Go to your own results</button></div>`:"")+`<p class="hint">Your written notes for this tab are on the "Your results" view.</p>`;
 if(!all.length)return head+`<p class="hint">The survey tool has nothing to analyse yet. Collect responses on the Database tab, or practise on the example charts first.</p><div class="row"><button type="button" data-a="anv" data-v="learn">Practise reading charts</button></div>`;
 const S=qs.map(q=>[q,stat(q,rs)]),ra=S.filter(x=>x[0].ty==="rate"&&x[1].n).map(x=>x[1].avg),avg=ra.length?(ra.reduce((a,b)=>a+b,0)/ra.length).toFixed(1):"–",cm=S.filter(x=>x[0].ty==="open").reduce((a,x)=>a+x[1].n,0);
 return head+`<div class="kpis"><div class="kpi"><b>${rs.length}</b><span>responses analysed${ex?` (${all.length-rs.length} left out)`:""}</span></div><div class="kpi"><b>${qs.length}</b><span>questions</span></div><div class="kpi"><b>${avg}</b><span>average rating (out of 5)</span></div><div class="kpi"><b>${cm}</b><span>comments</span></div></div>
 <label class="rad"><input type="checkbox" data-a="ex"${ex?" checked":""}> Leave out the responses I flagged as too fast (flag them on the Expert review tab)</label>
 ${S.map(([q,s],i)=>{let ch="";
  if(q.ty==="mc")ch=`<div class="dual"><div><h4 class="ch">Bar chart</h4>${q.o.map((o,j)=>bar(o,s.c[j],s.n)).join("")}</div><div><h4 class="ch">Pie chart</h4>${pie(q.o.map((o,j)=>[o,s.c[j]]))}</div></div>`;
  else if(q.ty==="yn")ch=`<div class="dual"><div><h4 class="ch">Bar chart</h4>${bar("Yes",s.c[0],s.n)+bar("No",s.c[1],s.n)}</div><div><h4 class="ch">Pie chart</h4>${pie([["Yes",s.c[0]],["No",s.c[1]]])}</div></div>`;
  else if(q.ty==="rate")ch=`<p class="big">Average <b>${s.n?s.avg.toFixed(1):"–"}</b> out of 5</p>`+s.c.map((c,j)=>bar((j+1)+(j===0?" (poor)":j===4?" (excellent)":""),c,s.n)).join("");
  else ch=`<p>${s.n} comments (${pct(rs.length-s.n,rs.length)}% skipped it)</p>${s.top.length?`<p>Most used words: ${s.top.map(w=>`<span class="bdg on">${esc(w[0])} ×${w[1]}</span>`).join(" ")}</p>`:""}<p class="hint">The tool can count words. It cannot tell you what the people meant.</p>`;
  return `<section class="qc"><h3 class="qh">Q${i+1} ${TYE[q.ty]} ${esc(q.t)}</h3>${ch}</section>`}).join("")}
 <div class="callout"><p><b>What the tool gives you:</b> counts, percentages, averages and charts.</p><p><b>Which chart?</b> A pie shows parts of a whole, so it suits a few categories that add up to 100%. Bars are better for comparing sizes, and for rating scales.</p><p><b>What it does not give you:</b> whether the sample is fair, whether the questions were fair, or <i>why</i> people answered that way. That is the expert's job.</p></div>`}

/* ---- tool or expert game ---- */
function wGame(){const gm=getGame(),pips=`<ol class="pips" role="img" aria-label="Card ${Math.min(gm.i+1,GAME.length)} of ${GAME.length}, ${gm.s} correct">${GAME.map((_,k)=>{const h=gm.h[k];return `<li class="pip ${h==="1"?"ok":h==="0"?"no":k===gm.i&&!gm.d?"cur":""}" aria-hidden="true">${h==="1"?"✓":h==="0"?"✗":k+1}</li>`}).join("")}</ol>`;
 if(gm.d){const m=gm.s>=9?"Outstanding. You know exactly who does what.":gm.s>=7?"Strong work. A couple to revisit.":"Good start. Read the Learn tab pipeline again and try once more.";
  return `<section class="tutorial-card" aria-live="polite">${pips}<h3 id="gc" tabindex="-1">Final score: ${gm.s} / ${GAME.length}</h3><p>${m}</p><p class="hint">${gm.s>=8?"🎯 Sort Champion badge earned.":"Score 8 or more to earn the Sort Champion badge."}</p><div class="row"><button type="button" id="ga" data-a="gagain">Play again</button></div></section>`}
 const it=GAME[gm.o[gm.i]];
 return `<section class="tutorial-card"><span class="tutorial-count">CARD ${gm.i+1} OF ${GAME.length} · SCORE ${gm.s}</span>${pips}<p class="hint">Who does this job in an online survey: the database, the survey tool, or the trained expert?</p><h3 id="gc" tabindex="-1">${esc(it[0])}</h3>
 <div class="gb">${Object.keys(BK).map(k=>`<button type="button" class="alt${gm.l?(k===it[1]?" ok":k===gm.l?" no":""):""}" data-a="gm" data-v="${k}"${gm.l?" disabled":""}>${gm.l&&k===it[1]?"✓ ":gm.l===k?"✗ ":""}${BK[k]}</button>`).join("")}</div>
 ${gm.l?`<p class="fb" role="status"><b>${gm.l===it[1]?"Correct! ✅":"Not quite. ❌ It is the "+BK[it[1]]+"."}</b> ${esc(it[2])}</p><div class="row"><button type="button" id="gn" data-a="gnext">${gm.i+1>=GAME.length?"See my score":"Next card"}</button></div>`:""}</section>`}

/* ---- expert review ---- */
function wExpert(){const qs=getQs(),all=getResp();
 if(!all.length)return `<p class="hint">An expert needs data to review. Collect responses on the Database tab first.</p>`;
 const fl=flagged(),sorted=sortT?all.slice().sort((a,b)=>a.t-b.t):all,show=sorted.slice(0,40),chk=data.sv_chk==="1";
 const glyph=(q,r)=>{const v=aval(r,q);if(v===undefined||v==="")return "–";return q.ty==="mc"?String.fromCharCode(65+Math.max(0,q.o.indexOf(v))):q.ty==="yn"?String(v)[0]:q.ty==="open"?"✎":String(v)};
 const head=seg("ev",[["1","1 · Data quality sweep"],["2","2 · Read the comments"]],expView,"expv","Expert review step");
 let body="";
 if(expView==="1"){let res="";if(chk){const truth=new Set(all.filter(isFast).map(r=>r.id)),hit=[...fl].filter(x=>truth.has(x)).length,miss=truth.size-hit,fa=fl.size-hit;res=`<p class="fb" role="status"><b>Expert check:</b> ${truth.size} responses finished in under 25 seconds. You caught ${hit}, missed ${miss}, and flagged ${fa} that were not too fast. People who rush tend to tick the same answer all the way down, which makes results look better or worse than they are.</p>`}
  body=`<p>The tool counted everything, including people who rushed. Flag responses that look too fast to be real. Check the Time column and the Answers column (letters are options, numbers are ratings, Y/N is yes/no, ✎ is a comment).</p>
 <div class="row"><button type="button" class="alt" id="sb" data-a="sortt">${sortT?"Sort by ID":"Sort by time (fastest first)"}</button><button type="button" id="cb" data-a="check">Check my flags</button></div><p class="stat">You have flagged <b id="fc">${fl.size}</b> responses.</p>
 <div class="scr" tabindex="0" role="region" aria-label="Responses to review"><table class="tbl flt"><thead><tr><th scope="col">Flag</th><th scope="col">ID</th><th scope="col">Time (s)</th><th scope="col">Answers</th></tr></thead><tbody>${show.map(r=>`<tr><td><input type="checkbox" class="fl" data-a="flag" data-v="${esc(r.id)}" aria-label="Flag ${esc(r.id)} as too fast"${fl.has(r.id)?" checked":""}></td><th scope="row">${esc(r.id)}</th><td>${r.t}</td><td>${qs.map(q=>esc(glyph(q,r))).join(" ")}</td></tr>`).join("")}</tbody></table></div>${all.length>40?`<p class="hint">Showing 40 of ${all.length}. Sort by time to see the fastest first.</p>`:""}${res}`}
 else{const op=qs.filter(q=>q.ty==="open"),cm=[];all.forEach(r=>{if(fl.has(r.id))return;op.forEach(q=>{const v=aval(r,q);if(typeof v==="string"&&v)cm.push([r.id+":"+q.id,v])})});
  const code=pj("sv_code",{}),list=cm.slice(-10),done=list.filter(c=>code[c[0]]).length,counts=THEMES_Q.map(t=>[t,Object.values(code).filter(x=>x===t).length]),tot=counts.reduce((a,b)=>a+b[1],0);
  const comp=data.sv_cmp==="1"?(()=>{const known=list.filter(c=>code[c[0]]&&COM.some(m=>m[0]===c[1]));const ok=known.filter(c=>COM.find(m=>m[0]===c[1])[1]===code[c[0]]).length;return `<p class="fb" role="status">You matched ${ok} of ${known.length} with our coding. More than one theme can be reasonable, so use this to discuss, not to mark yourself wrong.</p>`})():"";
  body=!op.length?'<p class="hint">Add an Open text question on the Build tab, then collect responses. Experts code comments into themes.</p>':!list.length?'<p class="hint">No comments yet. Collect more responses.</p>':`<p>Give each comment a theme. This is called <b>coding</b>, and a survey tool cannot do it for you. Coded ${done} of ${list.length}.</p><ul class="cl">${list.map((c,i)=>`<li><label for="th${i}">${esc(c[1])}<span class="hint">${esc(c[0].split(":")[0])}</span></label><select id="th${i}" data-a="theme" data-v="${esc(c[0])}"><option value="">Choose a theme…</option>${THEMES_Q.map(t=>`<option${code[c[0]]===t?" selected":""}>${t}</option>`).join("")}</select></li>`).join("")}</ul>${tot?`<div role="group" aria-label="Theme counts">${counts.filter(c=>c[1]).map(c=>bar(c[0],c[1],tot)).join("")}</div>`:""}<div class="row"><button type="button" class="alt" data-a="cmp">Compare with our coding</button></div>${comp}`}
 return head+body+`<h3 class="wh">3 · Your expert report</h3><p class="hint">Write it below, then check the Analyse tab again with the fast responses left out.</p>`}

/* ---- actions ---- */
function act(a,v,x,id){
 if(a==="tpick"){tutPick=v;return}
 if(a==="tnext"){if(tutStep===0&&!tutPick)return say("Pick an answer first.");tutStep++;tutDec="";wgDraw("tnext");return say("Step "+(tutStep+1)+" of "+TUT.length)}
 if(a==="tback"){tutStep=Math.max(0,tutStep-1);wgDraw("tnext");return say("Step "+(tutStep+1))}
 if(a==="tdec"){tutDec=v;wgDraw();return}
 if(a==="tdone"){tutStep=0;store("TutDone","1");return openTab(1,true)}
 const qs=getQs();
 if(a==="sug"||a==="addq"||a==="starter"){
  if(qs.length>=12)return say("12 questions is the limit. Remove one first.");
  let add=[];
  if(a==="sug"){const s=SUG[+v];add=[{t:s[1],ty:s[0],o:s[2]||[]}]}
  else if(a==="starter"){add=[SUG[0],SUG[4],SUG[9],SUG[2],SUG[10],SUG[12]].filter(s=>!qs.some(q=>q.t===s[1])).map(s=>({t:s[1],ty:s[0],o:s[2]||[]}))}
  else{const t=($("nq").value||"").trim().slice(0,140),ty=$("nt").value,o=($("no").value||"").split(/\n/).map(z=>z.trim().slice(0,40)).filter(Boolean).slice(0,6);
   if(!t)return say("Type the question first.");if(!TY[ty])return;if(qs.some(q=>q.t.toLowerCase()===t.toLowerCase()))return say("That question is already in the survey.");
   if(ty==="mc"&&o.length<2)return say("Multiple choice needs at least 2 options, one per line.");add=[{t,ty,o:ty==="mc"?o:[]}]}
  add=add.slice(0,12-qs.length);if(!add.length)return say("Nothing to add.");if(!confirmEdit())return;
  let n=qs.reduce((m,q)=>Math.max(m,parseInt(q.id.slice(1))||0),0);add.forEach(q=>{n++;qs.push({id:"q"+n,t:q.t,ty:q.ty,o:q.o})});
  sj("sv_q",qs);wgDraw(a==="addq"?"nq":"");return say("Added. The survey now has "+qs.length+" questions.")}
 if(a==="mvq"){const i=+v,j=i+ +x;if(j<0||j>=qs.length)return;[qs[i],qs[j]]=[qs[j],qs[i]];sj("sv_q",qs);wgDraw();const nb=$("wg").querySelector(`[data-a=mvq][data-v="${j}"][data-x="${x}"]`);if(nb&&!nb.disabled)nb.focus();return say("Question moved to position "+(j+1))}
 if(a==="delq"){if(!confirmEdit())return;const r=qs.splice(+v,1)[0];sj("sv_q",qs);wgDraw();return say("Removed: "+(r?r.t:"question"))}
 if(a==="openform"){formOpen=true;formT0=Date.now();wgDraw();const f=$("wg").querySelector("fieldset input,fieldset textarea");if(f)f.focus();return say("Survey form opened.")}
 if(a==="cancelform"){formOpen=false;wgDraw("of");return}
 if(a==="submit"){const A={};for(const q of qs){if(q.ty==="open"){const t=($("fo_"+q.id).value||"").trim().slice(0,200);if(t)A[q.id]=t}else{const c=$("wg").querySelector(`input[name="qa_${q.id}"]:checked`);if(!c)return say("Please answer: "+q.t);A[q.id]=q.ty==="rate"?+c.value:c.value}}
  const rs=getResp();newFrom=rs.length;rs.push({id:"R"+String(rs.length+1).padStart(3,"0"),you:1,t:Math.min(900,Math.max(3,Math.round((Date.now()-formT0)/1000))),a:A});sj("sv_r",rs);formOpen=false;wgDraw("gb");return say("Sent. Your answers are now a row in the database.")}
 if(a==="gen")return gen();
 if(a==="expick"){exPick[+x]=+v;updTicks();return wgDraw("exnext")}
 if(a==="anv"){anView=v;return wgDraw("av"+v)}
 if(a==="exgo"){exIdx=+v;return wgDraw("exc"+v)}
 if(a==="expv"){expView=v;return wgDraw("ev"+v)}
 if(a==="exread"){exShow[+v]=!exShow[+v];return wgDraw()}
 if(a==="clearr"){if(!confirm("Delete all collected responses?"))return;["sv_r","sv_flag","sv_code"].forEach(k=>delete data[k]);delete data.sv_chk;persist();newFrom=-1;wgDraw();return say("Responses cleared")}
 if(a==="showall"){showAll=!showAll;return wgDraw()}
 if(a==="ex"){if(v)data.sv_ex="1";else delete data.sv_ex;persist();return wgDraw(id)}
 if(a==="gm"){const gm=getGame();if(gm.l)return;gm.l=v;const okk=GAME[gm.o[gm.i]][1]===v;if(okk)gm.s++;gm.h=(gm.h||"")+(okk?"1":"0");sj("sv_game",gm);wgDraw("gn");return}
 if(a==="gnext"){const gm=getGame();gm.i++;gm.l="";if(gm.i>=GAME.length)gm.d=1;sj("sv_game",gm);wgDraw("gc");return}
 if(a==="gagain"){sj("sv_game",{o:shuf(GAME.map((_,i)=>i)),i:0,s:0,l:"",d:0,h:""});wgDraw("gc");return say("New game. Card 1.")}
 if(a==="flag"){const f=flagged(),rid=x;if(v)f.add(rid);else f.delete(rid);sj("sv_flag",[...f]);delete data.sv_chk;persist();const c=$("fc");if(c)c.textContent=f.size;return}
 if(a==="sortt"){sortT=!sortT;return wgDraw("sb")}
 if(a==="check"){if(!getResp().length)return;data.sv_chk="1";persist();return wgDraw("cb")}
 if(a==="theme"){const c=pj("sv_code",{});if(v)c[x]=v;else delete c[x];sj("sv_code",c);delete data.sv_cmp;return wgDraw(id)}
 if(a==="cmp"){data.sv_cmp="1";persist();return wgDraw()}
}

/* ---- export model: readable summaries instead of raw JSON (EXP-2) ---- */
function model(){
 const qs=getQs(),{all,rs}=used(),gm=getGame();
 const secs=TABS.filter(t=>t.fields.some(f=>!f.hidden)).map(t=>({h:t.title,rows:t.fields.filter(f=>!f.hidden).map(f=>[f.label,g(f.k)||"(empty)"])}));
 const sum=q=>{const s=stat(q,rs);if(q.ty==="mc")return q.o.map((o,j)=>o+" "+pct(s.c[j],s.n)+"%").join(", ")||"(none)";if(q.ty==="yn")return "Yes "+pct(s.c[0],s.n)+"%, No "+pct(s.c[1],s.n)+"%";if(q.ty==="rate")return s.n?"Average "+s.avg.toFixed(1)+" out of 5 (n="+s.n+")":"(none)";return s.n+" comments"+(s.top.length?"; top words: "+s.top.map(w=>w[0]).join(", "):"")};
 const extra=[{h:"Survey form",rows:qs.length?qs.map((q,i)=>["Q"+(i+1)+" · "+TY[q.ty],q.t+(q.o.length?" ["+q.o.join(" / ")+"]":"")]):[["Questions","(none)"]]},
  {h:"Survey tool results",rows:all.length?[["Responses in database",String(all.length)],["Responses analysed",String(rs.length)]].concat(qs.map((q,i)=>["Q"+(i+1)+" "+q.t,sum(q)])):[["Responses","(none)"]]},
  {h:"Tool or Expert? game",rows:[["Score",gm.d?gm.s+" / "+GAME.length:"(not finished)"]]}];
 secs.splice(secs.length-1,0,...extra);
 return{title:g("name")||CFG.title,sections:secs}}


boot();

return {dispose(){stopMic();stopTTS();scope.dispose();}};
};
