// Synced from Activity_09_First_Click_Lab__Neon_Clash_Weekend.html; library scope isolates DOM, callbacks and timers.
window.RESEARCH_TASKS["first-click"] = function(scope){
const window=scope.window, document=scope.document;
const addEventListener=scope.addEventListener;
const {setTimeout,clearTimeout,setInterval,clearInterval}=scope;

/* =============================================================================
   1. CONFIG + CONTENT.  This is the ONLY section a new app should need to edit.
   ============================================================================= */
const CFG = {pfx:"research-v3-first-click-",file:"first-click-lab",title:"First Click Lab: Neon Clash Weekend",kicker:"RESEARCH METHODS · FIRST CLICK TESTING · 40 MIN",sub:"Click through fake screens, see where people really click, and learn how colour and layout change the result.",version:1};
/* Each tab renders a panel. Field: {k: unique key, label, hint, rows?}
   rows => textarea; no rows => single-line input. Keys are the saved-data schema. */
const APP_TABS = [
 {title:"Learn",icon:"book-open",fb:"📖",widget:"learn",intro:"First click testing shows where a participant clicks first to complete a task. It works on a live site, a prototype or a wireframe. The first click matters because a wrong start makes success much less likely.",fields:[
  {k:"own_def",label:"First click testing in your own words",hint:"One or two sentences. Start with: A first click test is...",rows:3,starters:["A first click test is...","It matters because...","It can be done on...","A good task is one that..."]}]},
 {title:"Colour lab",icon:"palette",fb:"🎨",widget:"colour",intro:"Colour decisions change what people notice and click. Try the contrast checker, build a harmony, and see a screen as a person with colour-blindness might.",fields:[]},
 {title:"Test",icon:"computer-mouse",fb:"🖱",widget:"test",intro:"Be the participant, or pass the device to a friend. Read the task, then click once where you would click first. Nothing is marked right or wrong while you play.",fields:[{k:"fc_runs",hidden:true}]},
 {title:"Results",icon:"chart-simple",fb:"📊",widget:"results",intro:"See success rates, times and a click map for each screen. Compare design A with design B and find the colour and layout causes.",fields:[]},
 {title:"Findings",icon:"pen",fb:"✎",intro:"Write up what you found, then plan a test of your own.",fields:[
  {k:"name",label:"Test title",hint:"For example: Neon Clash navigation test."},
  {k:"worst",label:"Which screen failed most, and what did people click instead?",hint:"Use numbers from the Results tab.",rows:3,starters:["Screen ... had the lowest success rate...","Most people clicked...","The median time was..."]},
  {k:"cause",label:"Which colour or layout issue caused it?",hint:"Name the issue and the evidence.",rows:3,starters:["The contrast was too low because...","There was no visual hierarchy because...","The label was unfamiliar because...","The target was too small because..."]},
  {k:"fix",label:"Your redesign rule",hint:"One rule your team could follow next time.",rows:3,starters:["Always make the main action...","Never rely on colour alone to...","Use one accent colour for..."]},
  {k:"plan",label:"Plan your own first click test",hint:"Task, correct first click, number of participants.",rows:4,starters:["Task: ","The correct first click is: ","I will test... participants because..."]}]}
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
function openTab(i, focus){ stopMic(); stopTTS(); cur = i; drawTabs(); drawPanel(); if (focus) $("t" + i).focus() }
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
  widgetHook(); addMics(); drawNav();
}
/* ===== BACK / NEXT BETWEEN TABS =====
   Labels name the destination. Last tab offers Export. Focus moves to the new panel. */
function drawNav(){
  const p = cur > 0 ? TABS[cur - 1] : null, n = cur < TABS.length - 1 ? TABS[cur + 1] : null;
  $("panel").insertAdjacentHTML("beforeend", `<div class="row pnav" id="pnav">` +
    (p ? `<button type="button" class="alt" data-nav="-1"><span aria-hidden="true">\u2190</span> Back: ${esc(p.title)}</button>` : "<span></span>") +
    (n ? `<button type="button" data-nav="1">Next: ${esc(n.title)} <span aria-hidden="true">\u2192</span></button>` : `<button type="button" data-nav="x">Done: export your work\u2026</button>`) + `</div>`);
  qa($("pnav"), "button").forEach(b => b.onclick = () => { if (b.dataset.nav === "x") return $("xopen").click(); stepTab(+b.dataset.nav) });
}
function stepTab(d){ openTab(cur + d); $("panel").focus({preventScroll: true}); $("tabs").scrollIntoView({block: "start"}) }
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
  return [t.title, t.intro, ["learn","card"].includes(t.widget) && $("wg") ? $("wg").innerText : ""].concat(t.fields.filter(f => !f.hidden).map(f => f.label + ". " + (g(f.k) || "empty"))).filter(Boolean).map(x => /[.?!]$/.test(x) ? x : x + ".").join(" ");   // tidy pauses
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
function model(){
  return {title: g("name") || CFG.title,
    sections: TABS.map(t => ({h: t.title, rows: t.fields.map(f => [f.label, g(f.k) || "(empty)"])}))};
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
      data = {}; FIELDS.forEach(fl => { if (typeof d.data[fl.k] === "string") data[fl.k] = d.data[fl.k].slice(0, /^fc_/.test(fl.k) ? 70000 : 5000) });                // only known keys, capped
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
  /* Mark complete: flags the activity as done on this device */
  const updMc = () => { const d = load("Done") === "1"; $("mcsp").textContent = d ? "Completed ✓" : "Mark complete"; $("mcmp").setAttribute("aria-pressed", String(d)) };
  $("mcmp").onclick = () => { const d = load("Done") !== "1"; store("Done", d ? "1" : ""); updMc(); say(d ? "Activity marked complete." : "Completion cleared.") };
  updMc();
  /* first paint: stored theme, else the OS preference (A11Y-2) */

   drawTabs(); drawPanel();
  /* hosted-page downloads capability (optional; falls back to <a download>) */
  if (window.claude && claude.use) claude.use("downloads").then(d => { if (d) dl = d }, () => {});
}
/* ===== FIRST CLICK LAB ===== */
const arr=v=>Array.isArray(v)?v:[],cl=n=>Number.isFinite(n)?Math.min(100,Math.max(0,Math.round(n*10)/10)):0;
const pj=(k,d)=>{try{const v=JSON.parse(data[k]||"null");return Array.isArray(d)?(Array.isArray(v)?v:d):(v&&typeof v==="object"&&!Array.isArray(v)?v:d)}catch(e){return d}};
const sj=(k,v)=>{data[k]=JSON.stringify(v);persist()};
const hex2=h=>{const n=parseInt(h.slice(1),16);return[n>>16&255,n>>8&255,n&255]};
const lum=h=>{const c=hex2(h).map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*c[0]+.7152*c[1]+.0722*c[2]};
const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
const verdict=r=>r>=7?"Passes AAA":r>=4.5?"Passes AA":r>=3?"Large text only":"Fails";
const toHsl=h=>{const[r,gr,b]=hex2(h).map(v=>v/255),mx=Math.max(r,gr,b),mn=Math.min(r,gr,b),d=mx-mn,l=(mx+mn)/2;let hh=0,sa=0;if(d){sa=d/(1-Math.abs(2*l-1));hh=mx===r?((gr-b)/d)%6:mx===gr?(b-r)/d+2:(r-gr)/d+4;hh*=60}return[(hh+360)%360,sa*100,l*100]};
const fromHsl=(h,sa,l)=>{h=((h%360)+360)%360;sa/=100;l/=100;const a=sa*Math.min(l,1-l),f=n=>{const k=(n+h/30)%12;return Math.round(255*(l-a*Math.max(-1,Math.min(k-3,9-k,1)))).toString(16).padStart(2,"0")};return"#"+f(0)+f(8)+f(4)};
const NV=(items,bg,fg)=>`<div style="display:flex;gap:16px;padding:10px 14px;background:${bg};color:${fg};font-size:14px;align-items:center"><b data-l="Logo" style="margin-right:auto;letter-spacing:1px">NEON CLASH</b>${items.map(x=>`<span data-l="${x[0]}"${x[1]?' data-t="1"':''}>${x[0]}</span>`).join("")}</div>`;
const BT=(l,bg,fg,t,ex)=>`<span data-l="${l}"${t?' data-t="1"':''} style="display:inline-block;background:${bg};color:${fg};padding:11px 18px;border-radius:6px;font-weight:700;font-size:15px;${ex||""}">${l}</span>`;
const TK=["Register your team for the tournament.","Find out when your team plays on Saturday.","Buy a ticket for Sunday."];
const SCR=[
{id:"1A",t:0,bg:"#f1f5f9",tags:["Good practice"],why:"One primary action in the strongest colour, with a quieter secondary action. The button text passes contrast.",cp:[["Primary button text","#ffffff","#6d28d9"],["Body text","#334155","#f1f5f9"]],h:NV([["Home"],["Schedule"],["Teams"],["Tickets"]],"#14213d","#ffffff")+`<div style="padding:34px 28px"><div data-l="Headline" style="font-size:30px;font-weight:800;color:#14213d">Neon Clash Weekend</div><p data-l="Intro text" style="color:#334155;margin:8px 0 22px">16 teams. 2 days. One champion.</p>${BT("Register your team","#6d28d9","#ffffff",1)}${BT("Watch live","#ffffff","#6d28d9",0,"border:2px solid #6d28d9;padding:9px 16px;margin-left:10px")}</div>`},
{id:"1B",t:0,bg:"#0b0b10",tags:["No visual hierarchy","Too many saturated colours","Red and green pairing"],why:"Four loud buttons compete, so nothing leads the eye. Red next to green is hard to tell apart for many colour-blind people. White text on bright green or orange is weak. Use one accent colour for the main action.",cp:[["Buy tickets text","#ffffff","#22c55e"],["Register team text","#ffffff","#f97316"]],h:NV([["Home"],["Schedule"],["Teams"],["Tickets"]],"#1f1f2b","#ffffff")+`<div data-l="Live now banner" style="background:#facc15;color:#111;padding:6px 14px;font-weight:800;font-size:13px">LIVE NOW!!! BUY NOW!!! REGISTER NOW!!!</div><div style="padding:26px 28px"><div data-l="Headline" style="font-size:30px;font-weight:800;color:#fff">Neon Clash Weekend</div><div style="display:flex;gap:10px;margin-top:22px;flex-wrap:wrap">${BT("Watch live","#ef4444","#ffffff")}${BT("Buy tickets","#22c55e","#ffffff")}${BT("Register team","#f97316","#ffffff",1)}${BT("Merch","#eab308","#111111")}</div></div>`},
{id:"2A",t:1,bg:"#ffffff",tags:["Good practice"],why:"A familiar label (Schedule) with strong contrast, in the place people expect navigation.",cp:[["Navigation text","#ffffff","#0f172a"]],h:NV([["Home"],["Schedule",1],["Teams"],["Tickets"],["Shop"]],"#0f172a","#ffffff")+`<div style="padding:22px 28px;color:#1e293b"><div data-l="Headline" style="font-size:24px;font-weight:800">Welcome to the arena</div><p data-l="Intro text">Everything you need for the weekend.</p><div style="display:flex;gap:12px"><div data-l="Saturday card" style="flex:1;border:1px solid #cbd5e1;border-radius:8px;padding:14px">Saturday: Hall 3</div><div data-l="Sunday card" style="flex:1;border:1px solid #cbd5e1;border-radius:8px;padding:14px">Sunday: Main stage</div></div></div>`},
{id:"2B",t:1,bg:"#ffffff",tags:["Low contrast","Vague labels","Distracting banner"],why:"Grey text on light grey is hard to read. Hub and Fixtures are less familiar than Home and Schedule. A bright banner pulls the eye away from the navigation.",cp:[["Navigation text","#9ca3af","#e5e7eb"]],h:NV([["Hub"],["Fixtures",1],["Arena"],["Shop"]],"#e5e7eb","#9ca3af")+`<div data-l="Big welcome banner" style="margin:18px;height:150px;border-radius:10px;background:linear-gradient(135deg,#7c3aed,#ec4899);color:#fff;font-size:34px;font-weight:900;display:flex;align-items:center;justify-content:center">WELCOME</div><p data-l="Intro text" style="margin:0 18px;color:#334155">Everything you need for the weekend.</p>`},
{id:"3A",t:2,bg:"#f8fafc",tags:["Good practice"],why:"The main button is large, high contrast and next to the price. The selected tab uses a border, colour and bold weight, not colour alone.",cp:[["Buy button text","#ffffff","#1d4ed8"]],h:NV([["Home"],["Schedule"],["Tickets"]],"#14213d","#ffffff")+`<div style="margin:22px;background:#fff;border:1px solid #cbd5e1;border-radius:10px;padding:18px"><div data-l="Day passes heading" style="font-weight:800;font-size:20px;color:#14213d">Day passes</div><div style="display:flex;gap:8px;margin:12px 0"><span data-l="Saturday tab" style="padding:8px 14px;border:2px solid #cbd5e1;border-radius:6px;color:#334155">Saturday</span><span data-l="Sunday tab" style="padding:8px 14px;border:2px solid #1d4ed8;border-radius:6px;color:#1d4ed8;font-weight:700">Sunday</span></div><div data-l="Price text" style="color:#334155;margin-bottom:14px">£18 · 240 places left</div>${BT("Buy Sunday pass","#1d4ed8","#ffffff",1)}</div>`},
{id:"3B",t:2,bg:"#1e3a8a",tags:["Small target","Low contrast","Distractor banner"],why:"The real action is a tiny mid-blue link on dark blue, while a loud banner pulls attention. Make the main action a visible button with enough contrast.",cp:[["Small link","#3b82f6","#1e3a8a"],["Body text","#bfdbfe","#1e3a8a"]],h:NV([["Home"],["Schedule"],["Tickets"]],"#172554","#ffffff")+`<div data-l="Win a PC banner" style="margin:16px;padding:22px;border-radius:10px;background:linear-gradient(90deg,#ec4899,#f59e0b);color:#fff;font-size:28px;font-weight:900;text-align:center">WIN A GAMING PC! ENTER NOW</div><div data-l="Body text" style="padding:0 18px;color:#bfdbfe;font-size:14px">Sunday headline match: Vortex vs Lumen. Gates open at 10:00. <span data-l="Small buy link" data-t="1" style="color:#3b82f6;font-size:11px;text-decoration:underline">buy Sunday pass</span></div>`}];
const IDS=SCR.map(x=>x.id),FX={none:"",d:"url(#fx-d)",p:"url(#fx-p)",t:"url(#fx-t)",g:"url(#fx-g)"},FXN=[["none","Normal vision"],["d","Deuteranopia (green weak)"],["p","Protanopia (red weak)"],["t","Tritanopia (blue weak)"],["g","Greyscale"]];
const getR=()=>arr(pj("fc_runs",[])).slice(0,12).map((r,i)=>({p:"P"+(i+1),t:arr(r&&r.t).slice(0,6).filter(x=>x&&IDS.includes(x.s)).map(x=>({s:x.s,x:cl(x.x),y:cl(x.y),ms:Number.isFinite(x.ms)?Math.min(Math.max(Math.round(x.ms),0),120000):0,hit:x.hit===1?1:0,u:x.u===1?1:0,l:String(x.l||"").slice(0,40)}))}));
let ses=null,mode="all",cs={sc:"1B",cv:"none"},rs={sc:"1B",tg:false,cv:"none"},lastDone=false;
const mock=(sc,test)=>{let h=sc.h;if(test)h=h.replace(/data-l="/g,'tabindex="0" data-l="');return h};
const med=a=>{if(!a.length)return 0;const b=a.slice().sort((x,y)=>x-y),m=b.length>>1;return b.length%2?b[m]:(b[m-1]+b[m])/2};
function stat(id){const T=getR().flatMap(r=>r.t).filter(x=>x.s===id),n=T.length,h=T.filter(x=>x.hit).length,c={};T.forEach(x=>{const k=x.u?"Gave up":x.l||"Empty space";c[k]=(c[k]||0)+1});const top=Object.entries(c).sort((a,b)=>b[1]-a[1]);return{n,h,rate:n?Math.round(100*h/n):0,ms:Math.round(med(T.map(x=>x.ms))),top,T}}
const barRow=(l,p,txt)=>`<div class="bar"><span>${esc(l)}</span><span class="tr" aria-hidden="true"><i style="width:${p}%"></i></span><b>${txt}</b></div>`;
function widgetHook(){if(!TABS[cur].widget)return;$("panel").querySelector("p").insertAdjacentHTML("afterend",'<div id="wg" class="wg"></div>');wgDraw()}
function wgDraw(fid){const el=$("wg");if(!el)return;el.innerHTML=({learn:wLearn,colour:wColour,test:wTest,results:wRes})[TABS[cur].widget]();
 el.onclick=e=>{const b=e.target.closest("button[data-a]");if(b)act(b.dataset.a,b.dataset.v)};
 el.onchange=e=>{const b=e.target.closest("select[data-a]");if(b)act(b.dataset.a,b.value,b.dataset.v,b.id)};
 el.oninput=e=>{const i=e.target.id;if(i==="cf"||i==="cb")upC();if(i==="pc")upP()};
 if(TABS[cur].widget==="colour"){upC();upP()}if(fid&&$(fid))$(fid).focus()}
function clk(x,y,hit,l,u){const T=ses.rec;T.push({s:ses.order[ses.i],x,y,ms:performance.now()-ses.t0,hit:hit?1:0,u,l});ses.i++;if(ses.i>=ses.order.length){const R=getR();R.push({t:T});sj("fc_runs",R.map(r=>({t:r.t})));ses=null;lastDone=true;closeFS();say("Test complete. Thank you.");wgDraw("fcstart");return}drawFS()}
function act(a,v,x,id){
 if(a==="start"){const R=getR();if(R.length>=12)return say("12 participants is the limit.");lastDone=false;const n=R.length,list=mode==="split"?[0,1,2].map(t=>t*2+(n%2)):[0,1,2,3,4,5];for(let i=list.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[list[i],list[j]]=[list[j],list[i]]}ses={order:list.map(i=>SCR[i].id),i:0,rec:[]};wgDraw();return drawFS()}
 if(a==="md"){mode=v;return wgDraw(id)}
 if(a==="giveup")return clk(0,0,false,"Gave up",1);
 if(a==="cs"){cs.sc=v;return wgDraw(id)}if(a==="cv"){cs.cv=v;return wgDraw(id)}
 if(a==="rs"){rs.sc=v;return wgDraw(id)}if(a==="rv"){rs.cv=v;return wgDraw(id)}
 if(a==="tg"){rs.tg=!rs.tg;wgDraw("tg");return say(rs.tg?"Target area shown":"Target area hidden")}
 if(a==="clr"){if(!confirm("Delete all participants' clicks? This cannot be undone."))return;sj("fc_runs",[]);wgDraw();say("Results cleared")}
 if(a==="sw"){const f=$("cf").value;$("cf").value=$("cb").value;$("cb").value=f;upC()}}
function upC(){const f=$("cf").value,b=$("cb").value,r=ratio(f,b);$("cres").innerHTML=`<b>${r.toFixed(2)} : 1</b> · ${verdict(r)}<ul><li>Normal text needs 4.5:1 for AA: ${r>=4.5?"pass":"fail"}</li><li>Large text needs 3:1: ${r>=3?"pass":"fail"}</li><li>Buttons and icons need 3:1: ${r>=3?"pass":"fail"}</li></ul>`;$("csamp").style.cssText=`background:${b};color:${f};padding:14px;border-radius:8px;font-weight:700`}
function upP(){const c=$("pc").value,[h,sa,l]=toHsl(c),P=[["Base",c],["Complement (opposite)",fromHsl(h+180,sa,l)],["Analogous (neighbour)",fromHsl(h+30,sa,l)],["Analogous (neighbour)",fromHsl(h-30,sa,l)],["Triad",fromHsl(h+120,sa,l)],["Triad",fromHsl(h+240,sa,l)]];$("pal").innerHTML=P.map(p=>`<span style="background:${p[1]};color:${lum(p[1])>.4?"#000":"#fff"}">${p[0]}<br>${p[1]}</span>`).join("")}
const vsel=(a,id,v)=>`<div class="sel"><label for="${id}">View as</label><select id="${id}" data-a="${a}">${FXN.map(f=>`<option value="${f[0]}"${v===f[0]?" selected":""}>${f[1]}</option>`).join("")}</select></div>`;
const ssel=(a,id,v)=>`<div class="sel"><label for="${id}">Screen</label><select id="${id}" data-a="${a}">${SCR.map(x=>`<option value="${x.id}"${v===x.id?" selected":""}>${x.id} · ${esc(TK[x.t])}</option>`).join("")}</select></div>`;
function wColour(){const sc=SCR.find(x=>x.id===cs.sc);return `<div class="rd"><b>Four colour ideas to use</b><ul><li><b>Hue, saturation, brightness:</b> hue is the colour family, saturation is intensity, brightness is lightness. Brightness difference drives readability.</li><li><b>Contrast:</b> text and buttons need enough difference from their background.</li><li><b>Harmony:</b> complementary colours sit opposite, analogous sit next to each other. Use one accent for the main action.</li><li><b>Colour-blindness:</b> never rely on colour alone. Add shape, text or weight.</li></ul></div>
<h3 class="wh">Contrast checker</h3><div class="crow"><div class="sel"><label for="cf">Text colour</label><input type="color" id="cf" value="#9ca3af"></div><div class="sel"><label for="cb">Background colour</label><input type="color" id="cb" value="#e5e7eb"></div></div><div class="row" style="margin-top:6px"><button type="button" class="alt" data-a="sw">Swap colours</button></div><div id="csamp">Sample text on your background</div><div id="cres" role="status"></div>
<h3 class="wh">Harmony builder</h3><div class="sel"><label for="pc">Base colour</label><input type="color" id="pc" value="#6d28d9"></div><div class="sw2" id="pal"></div>
<h3 class="wh">See a screen through different eyes</h3><div class="crow">${ssel("cs","cs-s",cs.sc)}${vsel("cv","cs-v",cs.cv)}</div><p class="task">${esc(TK[sc.t])}</p><div class="scrw"><div class="scr" style="background:${sc.bg};${FX[cs.cv]?"filter:"+FX[cs.cv]:""}">${sc.h}</div></div><p class="hint">Try screen 1B as deuteranopia: the red, green and orange buttons become much harder to tell apart. Filters are approximations.</p>`}
const BGI=["#a11y","header","main"];
function fit(){const b=$("fsb");if(!b||!$("scr"))return;const k=Math.min(b.clientWidth/560,b.clientHeight/385),w=$("fsw");w.style.width=560*k+"px";w.style.height=385*k+"px";$("scr").style.transform="scale("+k+")";$("scr").style.transformOrigin="0 0"}
addEventListener("resize",fit);
function closeFS(){const f=$("fs");if(f)f.remove();BGI.forEach(q=>document.querySelector(q).inert=false)}
function exitFS(){if(!confirm("Exit the test? This participant's clicks will not be saved."))return;ses=null;closeFS();wgDraw("fcstart");say("Test stopped")}
function drawFS(){const sc=SCR.find(x=>x.id===ses.order[ses.i]);let f=$("fs");
 if(!f){f=document.createElement("div");f.id="fs";f.className="fs";f.tabIndex=-1;f.setAttribute("role","dialog");f.setAttribute("aria-modal","true");f.setAttribute("aria-labelledby","fst");document.body.appendChild(f);BGI.forEach(q=>document.querySelector(q).inert=true);
  f.onclick=e=>{const b=e.target.closest("button[data-f]");if(b)return b.dataset.f==="x"?exitFS():clk(0,0,false,"Gave up",1);if(!e.target.closest("#fsb")||!ses)return;const r=$("scr").getBoundingClientRect();clk(cl((e.clientX-r.left)/r.width*100),cl((e.clientY-r.top)/r.height*100),!!e.target.closest("[data-t]"),(e.target.closest("[data-l]")||{dataset:{}}).dataset.l||"Empty space",0)};
  f.onkeydown=e=>{if(e.key==="Escape"){e.preventDefault();return exitFS()}const t=e.target.closest("#scr [data-l]");if(t&&ses&&(e.key==="Enter"||e.key===" ")){e.preventDefault();const r=$("scr").getBoundingClientRect(),q=t.getBoundingClientRect();return clk(cl((q.left+q.width/2-r.left)/r.width*100),cl((q.top+q.height/2-r.top)/r.height*100),!!t.closest("[data-t]"),t.dataset.l,0)}
   if(e.key==="Tab"){const L=qa(f,'[tabindex="0"],button'),i=L.indexOf(document.activeElement);if(e.shiftKey&&i<=0){e.preventDefault();L[L.length-1].focus()}else if(!e.shiftKey&&i===L.length-1){e.preventDefault();L[0].focus()}}}}
 f.style.background=sc.bg;
 f.innerHTML=`<div class="fst"><span>Screen ${ses.i+1} of ${ses.order.length}</span><b id="fst">Task: ${esc(TK[sc.t])}</b><button type="button" class="alt" data-f="x">Exit test</button></div><div class="fsb" id="fsb"><div id="fsw"><div class="scr" id="scr" style="background:${sc.bg}">${mock(sc,1)}</div></div></div><div class="fsf"><button type="button" class="alt" data-f="g">I would not know where to click</button></div>`;
 fit();ses.t0=performance.now();f.focus();say("Screen "+(ses.i+1)+" of "+ses.order.length+". Task: "+TK[sc.t])}
function wTest(){const R=getR();
 if(!ses)return (lastDone?'<p class="task">Thank you. Your clicks are saved. Hand the device to the next participant, or open Results.</p>':"")+`<p>${R.length} participant${R.length===1?"":"s"} so far.</p><div class="sel"><label for="md">Which screens will each participant see?</label><select id="md" data-a="md"><option value="all"${mode==="all"?" selected":""}>All 6 screens in a random order</option><option value="split"${mode==="split"?" selected":""}>One design per task (alternate A and B between people)</option></select></div><p class="hint">One design per task avoids people learning from design A before they see B, but needs more participants. The test opens full screen like an app. Keyboard users: tab to an item and press Enter. Press Escape or Exit test to stop.</p><div class="row"><button type="button" id="fcstart" data-a="start">Start as participant ${R.length+1}</button></div>`;
 return '<p class="task">A test is running full screen. Press Exit test to stop it.</p>'}
function wRes(){const R=getR();if(!R.length)return '<p class="hint">No clicks yet. Play the Test tab first, ideally with a few different people.</p>';
 const sc=SCR.find(x=>x.id===rs.sc),st=stat(sc.id);
 const cmp=TK.map((t,i)=>{const a=stat(SCR[i*2].id),b=stat(SCR[i*2+1].id);return `<h4 class="wh">${esc(t)}</h4>${barRow("Design A ("+SCR[i*2].id+")",a.rate,a.n?a.rate+"%":"–")}${barRow("Design B ("+SCR[i*2+1].id+")",b.rate,b.n?b.rate+"%":"–")}`}).join("");
 return `<p>${R.length} participant${R.length===1?"":"s"}. Bar = share who clicked the correct area first.</p>${cmp}<h3 class="wh">Click map</h3><div class="crow">${ssel("rs","rs-s",rs.sc)}${vsel("rv","rs-v",rs.cv)}</div><div class="row" style="margin-top:0"><button type="button" class="alt" id="tg" data-a="tg" aria-pressed="${rs.tg}">${rs.tg?"Hide":"Show"} the correct area</button></div><p class="task">${esc(TK[sc.t])}</p><div class="scrw"><div class="scr${rs.tg?" showt":""}" style="background:${sc.bg};${FX[rs.cv]?"filter:"+FX[rs.cv]:""}">${sc.h}${st.T.filter(x=>!x.u).map(x=>`<i class="dt${x.hit?"":" m"}" style="left:${x.x}%;top:${x.y}%"></i>`).join("")}</div></div><p class="hint">● circle = correct first click, ◆ diamond = wrong. Gave up: ${st.T.filter(x=>x.u).length}.</p>
<p><b>${sc.id}:</b> ${st.n?st.rate+"% success":"no data"}${st.n?", median time "+(st.ms/1000).toFixed(1)+" s":""}. Most clicked: ${st.top.slice(0,3).map(t=>esc(t[0])+" ("+t[1]+")").join(", ")||"none"}.</p>
<h4 class="wh">Why? Issues on this screen</h4><p>${sc.tags.map(t=>"<b>"+esc(t)+"</b>").join(" · ")}</p><p>${esc(sc.why)}</p><ul>${sc.cp.map(c=>{const r=ratio(c[1],c[2]);return `<li>${esc(c[0])}: ${r.toFixed(1)}:1 · ${verdict(r)}</li>`}).join("")}</ul><div class="row"><button type="button" class="alt" data-a="clr">Delete all results</button></div>`}
const RD=[["First click testing guide","Lyssna","https://www.lyssna.com/guides/first-click-testing-guide/","Explains the method and why the first click predicts task success. It places first click testing between a full usability test and a five second test, and notes it suits early designs."],
["Do Click Tests Predict Live Site Clicks?","MeasuringU","https://measuringu.com/do-click-tests-predict-live-site-clicks/","Revisits the Bailey and Wolfson finding with new data and asks whether clicks on a picture match clicks on a live site. A useful reminder to treat results as evidence, not proof."],
["Understanding Success Criterion 1.4.3: Contrast (Minimum)","W3C Web Accessibility Initiative","https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html","The standard behind the contrast checker. It sets the 4.5:1 ratio for normal text and 3:1 for large text, and explains why people with low vision need it."]];
function wLearn(){return `<svg viewBox="0 0 640 200" role="img" aria-label="Diagram: a task card reading Register your team, a mock screen with a button outlined as the correct area, and click dots clustered around it"><g font-family="Calibri,Arial,sans-serif" font-size="13" fill="var(--tx)"><rect x="6" y="20" width="150" height="70" rx="8" fill="var(--bg)" stroke="var(--am)" stroke-width="3"/><text x="16" y="45" font-weight="700">TASK</text><text x="16" y="66">Register your team</text><path d="M160 55H215m-9-7 9 7-9 7" stroke="var(--am)" stroke-width="3" fill="none"/><rect x="225" y="10" width="260" height="180" rx="8" fill="var(--bg)" stroke="var(--bd)" stroke-width="2"/><rect x="225" y="10" width="260" height="26" rx="8" fill="var(--bd)"/><rect x="250" y="110" width="110" height="32" rx="6" fill="none" stroke="var(--li)" stroke-width="3" stroke-dasharray="6 4"/><text x="262" y="131" font-weight="700">Register team</text><rect x="380" y="110" width="80" height="32" rx="6" fill="none" stroke="var(--mu)"/>${[[270,125],[300,120],[320,132],[340,124],[290,135],[420,128],[310,70]].map((d,i)=>`<circle cx="${d[0]}" cy="${d[1]}" r="6" fill="var(--pk)" stroke="var(--tx)"/>`).join("")}<text x="500" y="100" font-weight="700" fill="var(--li)">Correct area</text><text x="500" y="122">dots = first clicks</text><text x="500" y="144">time = how long it took</text></g></svg>
<div class="rd"><b>Why the first click matters</b><p>In studies by Bailey and Wolfson, people who made the right first click went on to succeed about 87% of the time. People who clicked wrongly first succeeded about 46% of the time (figures as reported by several UX sources).</p>${barRow("Correct first click",87,"87%")}${barRow("Wrong first click",46,"46%")}</div>
<h3 class="wh">How a test runs</h3><ol><li>Write a clear task that does not use the label you hope they click.</li><li>Decide the correct click area before you test.</li><li>Show the screen and ask for one click. Record where and how long.</li><li>Compare success rate, time and what people clicked instead.</li><li>Fix the cause, then test again.</li></ol>
<h3 class="wh">Read next (summaries in my own words)</h3>${RD.map(r=>`<div class="rd"><a href="${esc(r[2])}" target="_blank" rel="noopener noreferrer">${esc(r[0])}</a><br><small>${esc(r[1])}</small><p>${esc(r[3])}</p></div>`).join("")}`}
model=function(){const R=getR(),m={title:g("name")||CFG.title,sections:TABS.map(x=>({h:x.title,rows:x.fields.filter(f=>!f.hidden).map(f=>[f.label,g(f.k)||"(empty)"])})).filter(x=>x.rows.length)};
 if(R.length)m.sections.splice(Math.max(m.sections.length-1,0),0,{h:"First click results ("+R.length+" participants)",rows:SCR.map(x=>{const t=stat(x.id);return[x.id+" "+TK[x.t],t.n?t.rate+"% success, median "+(t.ms/1000).toFixed(1)+" s, most clicked: "+(t.top[0]?t.top[0][0]:"none"):"no data"]})});return m};

boot();

return {dispose(){stopMic();stopTTS();scope.dispose();}};
};
