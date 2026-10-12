// Synced from Activity_04_Persona_Maker__Esports_Event_App.html; library scope isolates DOM, callbacks and timers.
window.RESEARCH_TASKS["personas"] = function(scope){
const window=scope.window, document=scope.document;
const addEventListener=scope.addEventListener;
const {setTimeout,clearTimeout,setInterval,clearInterval}=scope;

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
    `<button type="button" role="tab" id="t${i}" aria-controls="panel" aria-selected="${i === cur}" tabindex="${i === cur ? 0 : -1}">${ic(t.icon, t.fb)}${esc(t.title)}<span class="tk" data-tk="${i}"></span></button>`).join(""); refreshTicks();
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
  /* Starter list sits in one compact row UNDER the box, next to Dictate (added by addMics) */
  const sel = f.starters ? `<div class="sel"><label for="s-${f.k}">Starter</label><select id="s-${f.k}" data-s="${f.k}" aria-label="Add a starter to: ${esc(f.label)}"><option value="">Choose an opener…</option>${f.starters.map((t, i) => `<option value="${i}">${esc(t)}</option>`).join("")}</select></div>` : "";
  return `<label class="f" for="${id}">${esc(f.label)}<span class="hint" id="h-${f.k}">${esc(f.hint || "")}</span></label>` +
    (f.rows ? `<textarea ${d} rows="${f.rows}">${esc(data[f.k])}</textarea><div class="tools">${sel}</div>`
            : (sel ? `<div class="tools">${sel}</div>` : "") + `<input type="text" ${d} value="${esc(data[f.k])}">`);
}
function drawPanel(){
  const t = TABS[cur];
  $("panel").setAttribute("aria-labelledby", "t" + cur);
  $("panel").innerHTML = `<h2>${esc(t.title)}</h2><p>${esc(t.intro)}</p>` + (t.reflect
    ? `<div class="ref">${t.fields.map(f => `<div class="rc ${f.cls}">${field(f)}</div>`).join("")}</div><p class="hint cite">${esc(t.cite)}</p>`   // colour + words, never colour alone
    : t.fields.map(field).join(""));
  qa($("panel"), "[data-k]").forEach(el => { el.oninput = () => { data[el.dataset.k] = el.value; persist(); updPrev() } });
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
    if (el.dataset.nomic || el.dataset.mic || el.parentNode.classList.contains("ig")) return;
    el.dataset.mic = "1";
    const b = document.createElement("button");
    b.type = "button"; b.className = "alt mic"; b.setAttribute("aria-pressed", "false");
    b.setAttribute("aria-label", "Dictate into " + labelOf(el));
    b.innerHTML = ic("microphone", "🎤") + "<span>Dictate</span>";
    if (el.tagName === "TEXTAREA"){                           // big boxes: Dictate joins the Starter row under the box
      let tl = el.nextElementSibling;
      if (!tl || !tl.classList.contains("tools")){ tl = document.createElement("div"); tl.className = "tools"; el.after(tl) }
      tl.append(b);
    } else {                                                   // one-line boxes: Dictate stays beside the box
      const w = document.createElement("div"); w.className = "ig";
      el.parentNode.insertBefore(w, el); w.append(el, b);
    }
    b.onclick = () => toggleMic(el, b);
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
      data = {}; FIELDS.forEach(fl => { if (typeof d.data[fl.k] === "string") data[fl.k] = d.data[fl.k].slice(0, /^pp_/.test(fl.k) ? 70000 : 5000) });                // only known keys, capped
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
  $("dh").textContent = (SR ? "Tip: under each box, choose a Starter to add an opener (keyboard: arrows to browse, Enter to add) or tap Dictate and speak. Your browser's speech service may send the audio away, so do not say personal details." : "Tip: under each box, choose a Starter to add an opener (keyboard: arrows to browse, Enter to add). Dictation is not supported in this browser. On a phone, use the microphone key on your keyboard.");
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
/* ===== PERSONA WIDGETS ===== */
const GC=["--cy","--pk","--li","--am"];
const SK=["#f5d5b8","#e8b98f","#d09a6b","#a8714a","#7a4a2e","#4e2f1d"],HC=["#1b1b1b","#5a3a22","#d8b45a","#b5482a","#b8bcc4","#2e6bd6"],BGC=["#cfeaff","#ffe0ec","#e3ffd0","#fff0c2","#e4dcff","#d9d9d9"],SH=["#2c3e8f","#b0306a","#2f7d4f","#c9761a","#444b57","#7b3fb5"],FCL=["#00E5FF","#FF2E88","#B6FF3B","#FFC83D","#ffffff","#222222"];
const OPT={fa:["Face","Round","Square","Oval"],sk:["Skin","Tone 1","Tone 2","Tone 3","Tone 4","Tone 5","Tone 6"],hr:["Hair style","None","Short","Long","Curly","Bun"],hc:["Hair colour","Black","Brown","Blonde","Ginger","Grey","Blue"],ex:["Expression","Smile","Neutral","Surprised"],ac:["Extra","None","Glasses","Headphones","Cap"],sh:["Top colour","Navy","Magenta","Green","Orange","Charcoal","Purple"],bg:["Background","Sky","Pink","Mint","Sand","Lilac","Grey"],fr:["Frame shape","Square","Rounded","Circle"],fcl:["Frame colour","Cyan","Pink","Lime","Amber","White","Black"],flt:["Photo filter","None","Greyscale","Sepia","Punchy","Colour shift"]};
const DEF={fa:0,sk:1,hr:1,hc:1,ex:0,ac:0,sh:0,bg:0,fr:2,fcl:0,flt:0},FL=["none","grayscale(1)","sepia(.8)","contrast(1.4) saturate(1.3)","hue-rotate(40deg)"];
const DC=[["Black","#111111"],["White (eraser)","#ffffff"],["Red","#e11d48"],["Blue","#2563eb"],["Green","#16a34a"],["Orange","#f59e0b"],["Purple","#7c3aed"],["Brown","#7a4a2e"]],DS=[2,5,10,20];
const BL=[["goals","🎯","Goals","What do they want to achieve at the event? Start with: I want to..."],["frus","😤","Frustrations","What slows or annoys them? Start with: I hate it when..."],["mot","🔥","Motivations","What drives them? Start with: I love..."],["tech","📱","Tech comfort","How confident are they with apps? Start with: They use..."],["quote","💬","Quote","One line in their own voice."],["hob","🎮","Games and hobbies","What do they play, watch or do for fun?"],["dev","🖥️","Devices","What do they carry at the event?"],["day","⏰","Typical day","A few sentences about their day."],["val","💎","Values","What matters most to them?"],["need","🧩","Needs from the app","What must the app give them?"],["esp","🏆","Esports habits","Which games, teams or events do they follow?"],["soc","👥","Who they go with","Friends, team or family?"]];
const pj=(k,d)=>{try{const v=JSON.parse(data[k]||"null");return Array.isArray(d)?(Array.isArray(v)?v:d):(v&&typeof v==="object"&&!Array.isArray(v)?v:d)}catch(e){return d}};
const sj=(k,v)=>{data[k]=JSON.stringify(v);persist()};
const getCfg=()=>{const o=pj("pp_cfg",{}),c={mode:["avatar","draw","upload"].includes(o.mode)?o.mode:"avatar"};for(const k in DEF)c[k]=Number.isInteger(o[k])&&o[k]>=0&&o[k]<OPT[k].length-1?o[k]:DEF[k];return c};
const getBl=()=>pj("pp_blocks",[]).filter(b=>b&&BL.some(x=>x[0]===b.k)).map(b=>({k:b.k,v:String(b.v||"").slice(0,600)})).filter((b,i,a)=>a.findIndex(z=>z.k===b.k)===i);
const imgOk=(u,t)=>new RegExp("^data:image/"+t+";base64,[A-Za-z0-9+/=]+$").test(u||"");
function av(c){const sk=SK[c.sk],hc=HC[c.hc],sh=SH[c.sh];
 const head=c.fa===1?`<rect x="62" y="48" width="76" height="92" rx="14" fill="${sk}"/>`:`<ellipse cx="100" cy="94" rx="${c.fa===2?36:40}" ry="${c.fa===2?50:44}" fill="${sk}"/>`;
 const top=`<path d="M58 80Q58 40 100 40Q142 40 142 80Q120 62 100 62Q80 62 58 80Z" fill="${hc}"/>`;
 const hair=["",top,`<path d="M56 100Q50 38 100 38Q150 38 144 100L144 150L128 150L128 80Q100 60 72 80L72 150L56 150Z" fill="${hc}"/>`,[68,84,100,116,132].map((x,i)=>`<circle cx="${x}" cy="${i%2?46:56}" r="17" fill="${hc}"/>`).join(""),top+`<circle cx="100" cy="30" r="14" fill="${hc}"/>`][c.hr];
 const mouth=[`<path d="M86 114Q100 126 114 114" stroke="#7a2b2b" stroke-width="3" fill="none"/>`,`<path d="M88 116H112" stroke="#7a2b2b" stroke-width="3"/>`,`<ellipse cx="100" cy="117" rx="7" ry="9" fill="#7a2b2b"/>`][c.ex];
 const acc=["",`<g stroke="#222" stroke-width="3" fill="none"><circle cx="86" cy="92" r="11"/><circle cx="114" cy="92" r="11"/><path d="M97 92H103"/></g>`,`<path d="M56 96Q56 36 100 36Q144 36 144 96" stroke="#222" stroke-width="6" fill="none"/><rect x="48" y="90" width="14" height="30" rx="6" fill="#222"/><rect x="138" y="90" width="14" height="30" rx="6" fill="#222"/>`,`<path d="M58 76Q100 18 142 76Z" fill="${sh}"/><rect x="98" y="70" width="54" height="9" rx="4" fill="${sh}"/>`][c.ac];
 return `<svg viewBox="0 0 200 200" role="img" aria-label="Avatar portrait"><rect width="200" height="200" fill="${BGC[c.bg]}"/><rect x="88" y="130" width="24" height="26" fill="${sk}"/><path d="M30 200Q30 150 100 148Q170 150 170 200Z" fill="${sh}"/>${head}${hair}<circle cx="86" cy="94" r="4" fill="#222"/><circle cx="114" cy="94" r="4" fill="#222"/>${mouth}${acc}</svg>`}
function portrait(c){let b;if(c.mode==="avatar")b=av(c);else{const u=data[c.mode==="draw"?"pp_draw":"pp_up"];b=imgOk(u,c.mode==="draw"?"png":"jpeg")?`<img src="${u}" alt="Persona portrait">`:'<p class="hint" style="padding:8px">No image yet.</p>'}
 return `<div class="pt" style="border-radius:${["0","18px","50%"][c.fr]};border-color:${FCL[c.fcl]}">${b}</div>`}
function widgetHook(){const t=TABS[cur];if(!t.widget)return;const h='<div id="wg" class="wg"></div>';if(t.wend)$("panel").insertAdjacentHTML("beforeend",h);else $("panel").querySelector("p").insertAdjacentHTML("afterend",h);wgDraw()}
function wgDraw(fid){const el=$("wg");if(!el)return;el.innerHTML=({learn:wLearn,port:wPort,prof:wProf,card:wCard,src:wSrc,ex:wEx})[TABS[cur].widget]();
 el.onclick=e=>{const b=e.target.closest("button[data-a]");if(b)act(b.dataset.a,b.dataset.v)};
 el.onchange=e=>{const b=e.target.closest("select[data-a]");if(b)act(b.dataset.a,b.value,b.dataset.v,b.id)};
 el.oninput=e=>{const k=e.target.dataset.bk;if(!k)return;const B=getBl(),b=B.find(x=>x.k===k);if(b){b.v=e.target.value.slice(0,600);sj("pp_blocks",B);updPrev()}};
 el.ondragstart=e=>{const p=e.target.closest("[data-p],[data-b]");if(p)e.dataTransfer.setData("text/plain",p.dataset.p?"p:"+p.dataset.p:"b:"+p.dataset.b)};
 el.ondragover=e=>{if(e.target.closest("[data-zone]"))e.preventDefault()};
 el.ondrop=e=>{const z=e.target.closest("[data-zone]");if(!z)return;e.preventDefault();const t=e.dataTransfer.getData("text/plain"),bi=e.target.closest("[data-bi]"),B=getBl(),n=bi?+bi.dataset.bi:B.length;
  if(t.startsWith("p:")){const k=t.slice(2);if(!BL.some(x=>x[0]===k)||B.some(b=>b.k===k))return;B.splice(n,0,{k,v:""})}
  else if(t.startsWith("b:")){const f=+t.slice(2);if(!B[f])return;const m=B.splice(f,1)[0];B.splice(f<n?n-1:n,0,m)}else return;
  sj("pp_blocks",B);wgDraw();say("Profile updated")};
 wPost();addMics(el);if(fid&&$(fid))$(fid).focus()}
let undo=[],upImg=null;
function fin(){data.pp_draw=$("cv").toDataURL("image/png");const c=getCfg();c.mode="draw";sj("pp_cfg",c);$("pv").innerHTML=portrait(c)}
function applyUp(){const cv=document.createElement("canvas");cv.width=cv.height=240;const x=cv.getContext("2d"),c=getCfg(),s=Math.min(upImg.width,upImg.height);x.filter=FL[c.flt];x.drawImage(upImg,(upImg.width-s)/2,(upImg.height-s)/2,s,s,0,0,240,240);data.pp_up=cv.toDataURL("image/jpeg",.8);c.mode="upload";sj("pp_cfg",c);wgDraw();say("Image added")}
function wPost(){if(TABS[cur].widget!=="port")return;const c=getCfg();
 if(c.mode==="upload")$("uf").onchange=e=>{const f=e.target.files[0];if(!f)return;if(!/^image\//.test(f.type)||f.size>8e6)return say("Choose an image under 8 MB.");const im=new Image();im.onload=()=>{upImg=im;applyUp();URL.revokeObjectURL(im.src)};im.onerror=()=>say("That image could not be read.");im.src=URL.createObjectURL(f)};
 if(c.mode!=="draw")return;const cv=$("cv"),x=cv.getContext("2d");x.fillStyle="#fff";x.fillRect(0,0,240,240);
 if(imgOk(data.pp_draw,"png")){const im=new Image();im.onload=()=>x.drawImage(im,0,0);im.src=data.pp_draw}
 let on=false,px=0,py=0;const pos=e=>{const r=cv.getBoundingClientRect();return[(e.clientX-r.left)*240/r.width,(e.clientY-r.top)*240/r.height]},col=()=>DC[$("dc").value][1];
 cv.onpointerdown=e=>{e.preventDefault();cv.setPointerCapture(e.pointerId);on=true;[px,py]=pos(e);undo.push(x.getImageData(0,0,240,240));if(undo.length>12)undo.shift();x.fillStyle=col();x.beginPath();x.arc(px,py,DS[$("dz").value]/2,0,7);x.fill()};
 cv.onpointermove=e=>{if(!on)return;const p=pos(e);x.strokeStyle=col();x.lineWidth=DS[$("dz").value];x.lineCap="round";x.beginPath();x.moveTo(px,py);x.lineTo(p[0],p[1]);x.stroke();px=p[0];py=p[1]};
 cv.onpointerup=cv.onpointercancel=()=>{if(on){on=false;fin()}}}
function act(a,v,x,id){const c=getCfg(),B=getBl();
 if(a==="ck"){const C=getChk();if(+v)C[x]=+v;else delete C[x];sj("pp_chk",C);wgDraw(id);return say(CHKN[+v])}
 if(a==="seed"){const e=EX[+v-1];if(!e)return;if(B.some(b=>b.v.trim())&&!confirm("Replace your profile elements with this example?"))return;sj("pp_blocks",[{k:"mot",v:e.a[2][1]},{k:"frus",v:e.a[4][1]},{k:"dev",v:e.a[1][1]},{k:"esp",v:e.a[3][1]}]);data.page=e.ag;persist();return say("Profile started from the example. Open the Profile tab and edit it using your evidence.")}
 if(a==="pm"){c.mode=v;sj("pp_cfg",c);return wgDraw()}
 if(a==="cfg"){c[x]=+v;sj("pp_cfg",c);if(x==="flt"&&upImg)return applyUp();return wgDraw(id)}
 if(a==="undo"){if(!$("cv")||!undo.length)return say("Nothing to undo.");$("cv").getContext("2d").putImageData(undo.pop(),0,0);return fin()}
 if(a==="clr"){if(!confirm("Clear the drawing?"))return;const x2=$("cv").getContext("2d");x2.fillStyle="#fff";x2.fillRect(0,0,240,240);return fin()}
 if(a==="addb"){if(B.length<12&&!B.some(b=>b.k===v)){B.push({k:v,v:""});sj("pp_blocks",B);wgDraw("b-"+v);say("Element added")}return}
 const i=+v;if(a==="up"&&i>0)[B[i-1],B[i]]=[B[i],B[i-1]];else if(a==="dn"&&i<B.length-1)[B[i+1],B[i]]=[B[i],B[i+1]];
 else if(a==="rmb"){if(B[i].v.trim()&&!confirm("Remove this element and its text?"))return;B.splice(i,1)}else return;
 sj("pp_blocks",B);wgDraw();say("Profile updated")}
function wPort(){const c=getCfg(),m=c.mode,S=k=>`<div class="sel"><label for="c-${k}">${OPT[k][0]}</label><select id="c-${k}" data-a="cfg" data-v="${k}">${OPT[k].slice(1).map((n,i)=>`<option value="${i}"${i===c[k]?" selected":""}>${n}</option>`).join("")}</select></div>`;
 const ctl=m==="avatar"?["fa","sk","hr","hc","ex","ac","sh","bg"].map(S).join(""):m==="draw"?`<canvas id="cv" width="240" height="240" aria-label="Drawing area. Draw with a mouse, finger or pen."></canvas><p class="hint">Drawing needs a pointer. Keyboard users can build an avatar instead.</p><div class="sel"><label for="dc">Pen colour</label><select id="dc">${DC.map((d,i)=>`<option value="${i}">${d[0]}</option>`).join("")}</select></div><div class="sel"><label for="dz">Pen size</label><select id="dz">${["Fine","Medium","Thick","Fat"].map((d,i)=>`<option value="${i}"${i===1?" selected":""}>${d}</option>`).join("")}</select></div><div class="row" style="margin-top:0"><button type="button" class="alt" data-a="undo">Undo</button><button type="button" class="alt" data-a="clr">Clear</button></div>`:`<label class="f" for="uf">Choose an image<span class="hint">It is cropped to a square and stays on this device. Need a face? Try <a href="https://thispersondoesnotexist.com" target="_blank" rel="noopener noreferrer" style="color:var(--cy)">thispersondoesnotexist.com</a>, save one, then choose it here.</span></label><input type="file" id="uf" accept="image/*">${S("flt")}`;
 return `<div class="row" role="group" aria-label="Portrait method" style="margin-top:0">${[["avatar","Build an avatar"],["draw","Draw one"],["upload","Use an image"]].map(p=>`<button type="button" class="${m===p[0]?"":"alt"}" data-a="pm" data-v="${p[0]}" aria-pressed="${m===p[0]}">${p[1]}</button>`).join("")}</div><div class="portrow"><div id="pv">${portrait(c)}</div><div class="pc-ctl">${ctl}<h3 class="wh">Style the frame</h3>${S("fr")}${S("fcl")}</div></div>`}
function wProf(){const B=getBl(),used=new Set(B.map(b=>b.k));
 return `<h3 class="wh">Elements: drag into your profile, or tap Add</h3><div class="chips">${BL.filter(x=>!used.has(x[0])).map(x=>`<div class="cd" draggable="true" data-p="${x[0]}"><span class="em" aria-hidden="true">${x[1]}</span><span class="ct">${x[2]}</span><small class="bx">→ ${bxn(x[0])}</small><button type="button" class="alt" data-a="addb" data-v="${x[0]}" aria-label="Add ${x[2]}">Add</button></div>`).join("")||'<p class="hint">All elements placed.</p>'}</div>
 <h3 class="wh">Your profile (${B.length} elements)</h3><div class="pool" data-zone="1">${B.map((b,i)=>{const x=BL.find(z=>z[0]===b.k);return `<div class="blk" style="--c:var(${GC[i%4]})" data-bi="${i}"><span class="hd" draggable="true" data-b="${i}">⠿ Drag to reorder</span><label class="f" for="b-${b.k}" style="margin-top:2px"><span aria-hidden="true">${x[1]}</span> ${x[2]}<span class="hint">${x[3]} Shows in: ${bxn(b.k)}.</span></label><textarea id="b-${b.k}" data-bk="${b.k}" rows="2" maxlength="600">${esc(b.v)}</textarea><div class="row" style="margin:4px 0 0"><button type="button" class="alt" data-a="up" data-v="${i}">Move up</button><button type="button" class="alt" data-a="dn" data-v="${i}">Move down</button><button type="button" class="alt" data-a="rmb" data-v="${i}">Remove</button></div></div>`}).join("")||'<p class="hint">Drop elements here.</p>'}</div><details class="pvd" open><summary>Live preview of your persona card</summary><div id="pvw">${cardHtml(1,"pv")}</div></details>`}
/* Which box of the 2x2 card each profile element fills. Quote sits under the name. */
const BX={goals:"g",need:"g",mot:"g",frus:"g",val:"g",hob:"b",day:"b",esp:"b",soc:"b",tech:"b",dev:"d"},BXN={b:"Behaviours",d:"Demographics",g:"Needs & goals"};
const bxn=k=>k==="quote"?"under the name":BXN[BX[k]];
const BXH={b:"Add Esports habits, Games and hobbies, Typical day, Who they go with or Tech comfort on the Profile tab.",d:"Fill in age, job and where they live, and add Devices, on the Profile tab.",g:"Add Goals, Needs from the app, Motivations, Frustrations or Values on the Profile tab."};
function cardHtml(sm,idp){
 const c=getCfg(),B=getBl().filter(b=>b.v.trim()),q=B.find(b=>b.k==="quote"),nm=g("name"),
  facts=[["Age",g("page")],["Role",g("pjob")],["Lives in",g("ploc")]].filter(a=>a[1]),
  grp=k=>B.filter(b=>BX[b.k]===k).map(b=>[BL.find(z=>z[0]===b.k)[2],b.v]),
  box=(k,t,rows)=>`<div role="group" aria-labelledby="${idp}-${k}"><p class="p4t" id="${idp}-${k}">${t}</p>${rows.length?`<ul>${rows.map(r=>`<li style="white-space:pre-line"><b>${esc(r[0])}:</b> ${esc(r[1])}</li>`).join("")}</ul>`:`<p class="hint">${BXH[k]}</p>`}</div>`;
 return `<article class="wp4${sm?" sm":""}" aria-label="Persona card: ${esc(nm||"unnamed persona")}"><div class="p4"><div role="group" aria-labelledby="${idp}-n"><p class="p4t p4n" id="${idp}-n">${nm?"\u201C"+esc(nm)+"\u201D":"Unnamed persona"}</p>${portrait(c)}${q?`<blockquote class="p4q">\u201C${esc(q.v)}\u201D</blockquote>`:""}</div>`+
  box("b","Behaviours",grp("b"))+box("d","Demographics",facts.concat(grp("d")))+box("g","Needs &amp; goals",grp("g"))+`</div></article>`}
function updPrev(){const el=$("pvw");if(el)el.innerHTML=cardHtml(1,"pv")}
function wCard(){return cardHtml(0,"pc")}
const RD=[["A Closer Look At Personas, Part 1","Smashing Magazine (2014)","https://www.smashingmagazine.com/2014/08/a-closer-look-at-personas-part-1/","Introduces what personas are and why teams use them. Stresses that a persona should rest on real research rather than guesses. Use it for your Research tab."],
["Personas Make Users Memorable for Product Team Members","Nielsen Norman Group","https://www.nngroup.com/articles/persona/","Argues that personas keep a team focused on real users and build empathy, but only when grounded in data. Use it to answer the Realism and Utility checks."]];
const CHKN=["Not checked yet","Supported by a source","Assumption: no evidence found","Contradicted by a source"];
const getChk=()=>{const o=pj("pp_chk",{}),r={};for(const k in o)if(/^[1-4]\.[0-4]$/.test(k)&&Number.isInteger(o[k])&&o[k]>=1&&o[k]<=3)r[k]=o[k];return r};
const SRC=[{t:"Gaming Personas (audience report, 2020)",by:"GlobalWebIndex, now GWI",kind:"Industry survey report · data from Q3 2019",u:"https://www.gwi.com/hubfs/Downloads/Gaming_Personas.pdf",trust:"A very large online survey (44,160 gamers aged 16 to 64 in 42 countries). Strong on numbers, but it only counts adults who are online, so younger teens are not in the sample.",sum:"Splits online gamers into six types: mobile-only, casual, esporter, socializer, cloud gamer and influencer. An esporter is someone who watched a live gaming stream or esports tournament in the past year. The report compares the types on age, gender, interests, attitudes, media use and shopping. Heavier gamers use more media and visit Twitch more, and esports fans lean towards tech interests such as computers, coding and gadgets.",look:"How is an esporter defined? What is the gender split? Which ages are included?"},
{t:"Gaming Market Research 2026: Strategies, Personas, Trends",by:"MixBright",kind:"Company blog · March 2026",u:"https://mixbright.com/gaming-market-research-strategies-personas-trends/",trust:"Written by a company that sells persona software, and many of its statistics have no named source in the text. Good for method. Check any number before you use it.",sum:"A practical guide to planning player research. It says to combine numbers (what players do) with interviews (why they do it), and to group players by who they are, how they behave and why they play. It also groups people by whether they play, watch, collect or join the community. It ends with a persona checklist: name, photo, demographics, backstory, gaming behaviour, motivations, frustrations and a quote.",look:"The viewing segment, the research question list and the persona checklist."},
{t:"Hype Source: G Fuel's Contemporary Gamer Persona and its Navigation of Prestige and Diversity",by:"Tomkinson and Elliott, Persona Studies (2021)",kind:"Academic journal article (read the abstract first)",u:"https://ojs.deakin.edu.au/index.php/ps/article/view/971",alt:"https://www.researchgate.net/publication/350296222_Hype_Source_G_Fuel's_Contemporary_Gamer_Persona_and_its_Navigation_of_Prestige_and_Diversity",trust:"A journal article, but it studies how one energy drink brand builds a gamer persona for marketing. It is not a survey of what fans or players say about themselves.",sum:"Looks at how the energy drink brand G Fuel builds a contemporary gamer persona with influencers and esports stars. The persona builds on the stereotype of the geeky male gamer, but also presents gaming as athletic, social and glamorous. The brand has to balance popular but controversial influencers against a commitment to diversity.",look:"How could a persona repeat a stereotype? Whose voice is missing?"}];
const EX=[{id:1,t:"The Hardcore Competitor",sub:"The Pro / Aspiring Pro",ag:"16-25",cfg:{fa:1,sk:2,hr:1,hc:0,ex:1,ac:2,sh:4,bg:4},a:[["Age and gender","Typically 16–25 years old; predominantly male.",""],["Platforms","High-end PC or latest-generation consoles.",""],["Core motivation","Mastery, rank escalation, cash prizes, and team recognition.",""],["Behaviour and habits","Spends hours daily practising specific mechanics, reviewing match replays, and playing ranked and scrim matches. Follows patch notes, meta changes and high-tier competitive circuit standings religiously.",""],["Pain points","Server lag, unbalanced game patches, toxic teammates, and lack of local tournament infrastructure.",""]],hint:"GWI describes six gamer types aged 16 to 64 and has no separate pro player type. Where could the claims about cash prizes and server lag come from? Who could you interview instead?"},
{id:2,t:"The Esports Spectator",sub:"The Armchair Fan",ag:"18-34",cfg:{fa:0,sk:3,hr:3,hc:1,ex:2,ac:0,sh:1,bg:1},a:[["Age and gender","18–34 years old; balanced gender split with high engagement across global regions.",""],["Platforms","Twitch, YouTube Gaming, and PC/Mobile for streaming.",""],["Core motivation","Entertainment, community belonging, narrative drama, and rooting for favourite teams or players.","Cited in the original: GWI report"],["Behaviour and habits","Watches live tournaments, championship finals, and streamer watch parties rather than playing competitively. Buys team merchandise, digital battle passes, and in-game cosmetics tied to favourite esports organisations.","Cited in the original: GWI report"],["Pain points","Fragmented broadcast schedules, high cost of merchandise and tickets, and overwhelming paywalls across multiple streaming platforms.",""]],hint:"Look at GWI's esporter type: what are its gender split and its age range? Does the report say anything about buying merchandise? Which lines in the original cite GWI, and does GWI back them up?"},
{id:3,t:"The Casual Social Gamer and Fan",sub:"Plays with friends, watches the big events",ag:"13-30",cfg:{fa:2,sk:1,hr:4,hc:3,ex:0,ac:0,sh:2,bg:2},a:[["Age and gender","13–30 years old; diverse representation.","Cited in the original: GWI report"],["Platforms","Console, PC, and mobile (e.g., PUBG Mobile, Valorant, League of Legends).","Cited in the original: GWI report"],["Core motivation","Staying connected with friends, casual fun, and stress relief.","Cited in the original: MixBright"],["Behaviour and habits","Plays multiplayer games socially a few times a week. Casually tunes into major international events (like Worlds or The International) because friends are talking about it or due to social media hype.",""],["Pain points","Lack of time to keep up with high-skill caps, toxic lobby environments, and feeling left behind by fast-evolving metas.",""]],hint:"MixBright quotes a study that most Gen Z gamers play to stay connected with friends. Does that support the motivation line? Check the age range too: what ages does GWI survey?"},
{id:4,t:"The Content Creator and Influencer",sub:"Clips, reacts and streams",ag:"20-35",cfg:{fa:0,sk:4,hr:2,hc:5,ex:0,ac:1,sh:3,bg:3},a:[["Age and gender","20–35 years old.",""],["Platforms","Twitch, TikTok, YouTube, and X (Twitter).",""],["Core motivation","Audience growth, monetisation, brand partnerships, and community influence.",""],["Behaviour and habits","Clips highlight esports moments, reacts to pro matches, or plays live with and against high-ranking players. Serves as a bridge connecting casual fans to professional esports narratives.","Cited in the original: Persona Studies article"],["Pain points","Burnout from constant content production, platform algorithm shifts, and strict copyright and DMCA rules on game footage.",""]],hint:"The Persona Studies article is about a brand's marketing persona. Does its abstract mention creators bridging fans to pro esports, burnout or copyright? In GWI, what defines the influencer type and how big is it?"}];
function wSrc(){return `<p class="hint">Read in this order: GWI (numbers), MixBright (method), Persona Studies (critical view). <a href="https://www.google.com/search?q=esports+users+research+for+personas" target="_blank" rel="noopener noreferrer" style="color:var(--cy)">Search for more sources</a>.</p>`+SRC.map(r=>`<div class="rd"><a href="${esc(r.u)}" target="_blank" rel="noopener noreferrer">${esc(r.t)}</a><br><small>${esc(r.by)} · ${esc(r.kind)}</small><p><b>Summary:</b> ${esc(r.sum)}</p><p><b>Trust check:</b> ${esc(r.trust)}</p><p><b>Look for:</b> ${esc(r.look)}</p>${r.alt?`<p class="hint"><a href="${esc(r.alt)}" target="_blank" rel="noopener noreferrer" style="color:var(--cy)">Same article on ResearchGate</a></p>`:""}</div>`).join("")}
function wEx(){const C=getChk();return `<p class="hint">For each line choose: supported by a source, assumption (no evidence found) or contradicted by a source. Open a hint if you are stuck. Use the button to start your own persona from an example, then improve it with your evidence.</p>`+EX.map(e=>{const ks=e.a.map((_,i)=>e.id+"."+i),n=k=>ks.filter(x=>C[x]===k).length,done=ks.filter(x=>C[x]).length;
 return `<article class="pcard" style="margin:12px 0"><div class="pch"><div class="pt" style="border-radius:50%;border-color:var(--cy);width:110px;height:110px">${av(Object.assign({},e.cfg))}</div><div><h4 style="font-size:1.25rem;margin:0">${e.id}. ${esc(e.t)}</h4><p>${esc(e.sub)}</p><div class="bar" style="grid-template-columns:1fr"><span>Checked ${done} of 5 · supported ${n(1)} · assumption ${n(2)} · contradicted ${n(3)}</span><span class="tr" aria-hidden="true"><i style="width:${done*20}%"></i></span></div></div></div>`+e.a.map((a,i)=>`<div class="cd" style="width:100%;display:block;margin-top:8px"><b>${esc(a[0])}</b><p style="margin:2px 0">${esc(a[1])}</p>${a[2]?`<p class="hint" style="margin:2px 0">${esc(a[2])}</p>`:""}<div class="sel"><label for="ck${e.id}${i}">Claim check: ${esc(a[0])}</label><select id="ck${e.id}${i}" data-a="ck" data-v="${e.id}.${i}">${CHKN.map((c,j)=>`<option value="${j}"${(C[e.id+"."+i]||0)===j?" selected":""}>${c}</option>`).join("")}</select></div></div>`).join("")+`<details style="margin-top:8px"><summary>Hint from the sources</summary><p>${esc(e.hint)}</p></details><div class="row"><button type="button" class="alt" data-a="seed" data-v="${e.id}">Use as a starting point for my persona</button></div></article>`}).join("")}
function wLearn(){return `${exPersona("lx",1)}
<ul><li><b>Targeted focus:</b> there is no average user. Design something great for some people.</li><li><b>Objective guidance:</b> ask what your persona would want, not what you think.</li><li><b>Empathy:</b> understand their challenges, goals and needs.</li></ul>
<h3 class="wh">Read next (summaries in my own words)</h3>${RD.map(r=>`<div class="rd"><a href="${esc(r[2])}" target="_blank" rel="noopener noreferrer">${esc(r[0])}</a><br><small>${esc(r[1])}</small><p>${esc(r[3])}</p></div>`).join("")}`}
model=function(){const m={title:g("name")||CFG.title,sections:TABS.map(t=>({h:t.title,rows:t.fields.filter(f=>!f.hidden).map(f=>[f.label,g(f.k)||"(empty)"])})).filter(s=>s.rows.length)},B=getBl().filter(b=>b.v.trim());
 if(B.length)m.sections.splice(Math.max(m.sections.length-1,0),0,{h:"Profile elements",rows:B.map(b=>{const x=BL.find(z=>z[0]===b.k);return[x[2],b.v]})});const C=getChk(),ex=EX.map(e=>[e.id+". "+e.t,e.a.map((a,i)=>a[0]+": "+CHKN[C[e.id+"."+i]||0]).join("; ")]);if(Object.keys(C).length)m.sections.splice(Math.max(m.sections.length-1,0),0,{h:"Example persona claim checks",rows:ex});return m};

/* ===== EXAMPLE PERSONA (2x2 grid, modelled on the reference card) =====
   Top left: portrait + name. Top right: Behaviours. Bottom left: Demographics.
   Bottom right: Needs & goals. HTML/CSS (not a fixed SVG) so text wraps, follows
   the A+/A- size, the dyslexic font and all three themes. pfx keeps ids unique
   when the grid is shown in the Learn tab and the tutorial at the same time. */
const SAM={cfg:Object.assign({},DEF,{fa:0,sk:2,hr:1,hc:1,ex:0,ac:2,sh:4,bg:0}),
 beh:["Watches Twitch or YouTube on the bus most days","Plays ranked games with the same four friends, three nights a week","Decides on events the night before, once friends say yes"],
 dem:["Apprentice electrician","19 years old","Lives at home and travels in by train","Mid-range phone, ticket budget under £15"],
 need:["To find the schedule in two taps on their phone","To know where to meet friends before the first match","To feel part of the crowd without being a pro","\u201CDon\u2019t make me hunt for the start time\u201D"]};
function exPersona(pfx,cap){
 const L=a=>`<ul>${a.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`,
  box=(id,t,a)=>`<div role="group" aria-labelledby="${pfx}-${id}"><p class="p4t" id="${pfx}-${id}">${t}</p>${L(a)}</div>`;
 return `<figure class="wp4" style="margin:10px 0"><div class="p4"><div role="group" aria-labelledby="${pfx}-n"><p class="p4t p4n" id="${pfx}-n">\u201CSam\u201D</p><div class="pt">${av(Object.assign({},SAM.cfg))}</div></div>`+
  box("b","Behaviours",SAM.beh)+box("d","Demographics",SAM.dem)+box("g","Needs &amp; goals",SAM.need)+`</div>`+
  (cap?`<figcaption class="hint">Example persona: Sam. Read it as four boxes: who they are, what they do, facts about them, and what they need.</figcaption>`:"")+`</figure>`}

/* ===== TUTORIAL =====
   Each step: t title, p intro paragraphs, ex show the example grid, l bullet list,
   p2 closing paragraphs, tab = tab title the "Go to" button opens. */
const TUT=[
 {t:"Welcome: what you will make",p:["A persona is a made-up person who stands for a group of real esports fans. In this app you research first, build one persona for an esports event app, then check it honestly. It takes about 40 minutes."],
  l:["Work through the tabs from left to right, or jump to any tab you like. Nothing is locked.","Your writing saves on this device as you type. Use Export\u2026 to keep a copy.","A tick appears on a tab once you have started it, and Back and Next buttons at the bottom of every tab move you along.","You can open this tutorial again at any time from the top of the page."]},
 {t:"Learn: read the example persona",tab:"Learn",p:["Start on the Learn tab. This is Sam, an example persona. Every persona card has the same four boxes in a 2 by 2 grid."],ex:1,
  l:["Top left: who they are. A portrait and a name.","Top right: Behaviours. What they actually do, week to week.","Bottom left: Demographics. Plain facts such as age, job and where they live.","Bottom right: Needs and goals. What they want from your event app."],
  p2:["Then write what a persona is in your own words. Stuck? Choose an opener from the starter list above the box."]},
 {t:"Research: sources, examples and evidence",tab:"Read sources",p:["A persona is only as good as the research behind it. Three tabs help you gather it."],
  l:["Read sources: read three sources in order, then record one finding from each and say which one you trust most.","Study examples: four example personas. Treat every line as a claim. For each one choose Supported by a source, Assumption or Contradicted by a source.","Your evidence: write who you learned from, what they said or did, and any numbers. Never use a real person\u2019s details."]},
 {t:"Portrait: give them a face",tab:"Portrait",p:["Choose one of three methods at the top of the tab."],
  l:["Build an avatar: pick face, skin, hair, expression, extra, top colour and background.","Draw one: draw with a mouse, finger or pen. Undo and Clear sit under the pen settings.","Use an image: choose a picture from your device. It is cropped to a square and stays on your device. Do not use a photo of someone you know."],
  p2:["Finish by styling the frame: its shape and colour."]},
 {t:"Profile: fill in the details",tab:"Profile",p:["Fill in the name, age, job and where they live. Then build the rest of the profile from elements."],
  l:["Elements are boxes such as Goals, Frustrations, Motivations, Tech comfort, Quote and Needs from the app.","Drag an element into Your profile, or tap Add if you cannot drag.","Each element tells you what to write, for example: I want to\u2026","Each element says which box of your card it fills: Behaviours, Demographics or Needs & goals.","Open the live preview at the bottom to watch your card build as you type.","Use Move up, Move down or Remove to change the order. Keep to what your research showed."]},
 {t:"Card & Check: test your persona",tab:"Card & Check",p:["Your finished persona card appears here as a 2 by 2 grid, just like Sam, built from your portrait and profile. Print it or export it."],
  l:["Realism: do they sound like a believable person, and not a copy of someone you know?","Utility: pick one design choice and test it on your persona. Would they use it?","Answer both honestly. If the persona needs more work, say so."]},
 {t:"Reflect: What? So What? Now What?",tab:"Reflect",p:["Finish on the Reflect tab. Write one to three sentences for each question."],
  l:["What? Describe what you did, saw and made.","So What? Say why it matters and what you learned.","Now What? Choose one clear next step.","Each box has a starter list. Choosing an opener adds it to your writing and never replaces it."]},
 {t:"Tools that help you",p:["These work on every tab."],
  l:["Accessibility bar at the top: Day, Night and Contrast colour themes, A- and A+ text size, and a Dyslexic font.","Read this card: reads the current tab aloud. You can pause, stop and change the speed.","Starter: under each box, choose an opener to add to your writing. Keyboard: arrows to browse, Enter to add.","Dictate: speak instead of typing, if your browser supports it. The browser may send audio to a speech service, so keep personal details out.","Export\u2026: save as PowerPoint, Word, PDF, CSV or Markdown. You can also Copy text, Print, or save a backup file to move your work to another device.","Clear everything wipes your writing. It always asks first."]}
];
/* ===== PROGRESS TICKS + BACK/NEXT (UX pass) ===== */
function tabDone(t){
 if(t.fields.some(f=>!f.hidden&&g(f.k)))return true;
 if(t.widget==="port")return Object.keys(pj("pp_cfg",{})).length>0||!!data.pp_draw||!!data.pp_up;
 if(t.widget==="prof")return getBl().some(b=>b.v.trim());
 if(t.widget==="ex")return Object.keys(getChk()).length>0;
 return false}
function refreshTicks(){
 let n=0;
 TABS.forEach((t,i)=>{const d=tabDone(t),el=document.querySelector(`[data-tk="${i}"]`);if(d)n++;if(el)el.innerHTML=d?'<span aria-hidden="true"> \u2713</span><span class="sr"> (started)</span>':""});
 const pr=$("prog");if(pr)pr.textContent="Progress: "+n+" of "+TABS.length+" tabs started"}
function drawNav(){
 const p=cur>0?TABS[cur-1]:null,n=cur<TABS.length-1?TABS[cur+1]:null;
 $("panel").insertAdjacentHTML("beforeend",`<div class="row pnav" id="pnav">`+(p?`<button type="button" class="alt" data-nav="-1"><span aria-hidden="true">\u2190</span> Back: ${esc(p.title)}</button>`:"<span></span>")+(n?`<button type="button" data-nav="1">Next: ${esc(n.title)} <span aria-hidden="true">\u2192</span></button>`:`<button type="button" data-nav="x">Done: export your work\u2026</button>`)+`</div>`);
 qa($("pnav"),"button").forEach(b=>b.onclick=()=>{if(b.dataset.nav==="x")return $("xopen").click();stepTab(+b.dataset.nav)})}
function stepTab(d){openTab(cur+d);$("panel").focus({preventScroll:true});$("tabs").scrollIntoView({block:"start"})}

let ti=0,topener=null;
const tabIx=n=>TABS.findIndex(t=>t.title===n);
const tEls=()=>qa($("tdl"),"button").filter(b=>!b.disabled&&!b.hidden);
function tutDraw(){
 const s=TUT[ti],n=TUT.length,P=a=>(a||[]).map(x=>`<p>${esc(x)}</p>`).join("");
 $("tbody").innerHTML=`<p class="tstep">Step ${ti+1} of ${n}</p><div class="tp" aria-hidden="true"><i style="width:${(ti+1)/n*100}%"></i></div><h3>${esc(s.t)}</h3>`+P(s.p)+(s.ex?exPersona("tu"):"")+(s.l?`<ul>${s.l.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`:"")+P(s.p2);
 $("tb").disabled=ti===0; $("tn").textContent=ti===n-1?"Finish":"Next";
 const ix=s.tab?tabIx(s.tab):-1; $("tgo").hidden=ix<0; if(ix>=0)$("tgo").textContent="Go to the "+TABS[ix].title+" tab";
 stopTTS(); $("tdl").querySelector(".dlg").scrollTop=0;
}
function tutOpen(){
 topener=$("tut"); ti=0; tutDraw(); stopMic(); nudgeOff();   /* only this button opens the tutorial, so return focus to it (Safari does not focus buttons on click) */
 $("tdl").hidden=false; BG.forEach(q=>document.querySelector(q).inert=true); $("tbody").focus();
}
function tutClose(){ stopTTS(); $("tdl").hidden=true; BG.forEach(q=>document.querySelector(q).inert=false); if(topener&&topener.focus)topener.focus() }
function tutStep(d){ const n=ti+d; if(n>=TUT.length)return tutClose(); if(n<0)return; ti=n; tutDraw(); $("tbody").focus() }
const nudgeOff=()=>{store("TutSeen","1");$("nudge").hidden=true};
if(!load("TutSeen"))$("nudge").hidden=false;
$("nstart").onclick=()=>tutOpen();
$("nno").onclick=()=>{nudgeOff();$("main").focus();say("Tutorial prompt closed. You can open the tutorial any time from the button under the title.")};
$("td").textContent=TUT.length+" short steps. Use Next and Back, or press Escape to close.";
$("tut").onclick=tutOpen; $("tcl").onclick=tutClose; $("tb").onclick=()=>tutStep(-1); $("tn").onclick=()=>tutStep(1);
$("trd").onclick=()=>speak($("tbody").innerText);
$("tgo").onclick=()=>{const ix=tabIx(TUT[ti].tab); tutClose(); if(ix>=0){openTab(ix,true); say("Opened the "+TABS[ix].title+" tab")}};
$("tdl").onclick=e=>{if(e.target===$("tdl"))tutClose()};
$("tdl").onkeydown=e=>{
 if(e.key==="Escape"){e.preventDefault();tutClose();return}
 if(e.key!=="Tab")return;
 const f=tEls(); if(!f.length)return; const i=f.indexOf(document.activeElement);
 if(e.shiftKey&&i<=0){e.preventDefault();f[f.length-1].focus()}else if(!e.shiftKey&&i===f.length-1){e.preventDefault();f[0].focus()}
};

boot();

return {dispose(){stopMic();stopTTS();scope.dispose();}};
};
