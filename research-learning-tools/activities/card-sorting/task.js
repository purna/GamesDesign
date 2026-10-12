// Synced from Activity_10_Card_Sorting_-_Esports_Event_with_Tutorial.html; library scope isolates DOM, callbacks and timers.
window.RESEARCH_TASKS["card-sorting"] = function(scope){
const window=scope.window, document=scope.document;
const addEventListener=scope.addEventListener;
const {setTimeout,clearTimeout,setInterval,clearInterval}=scope;

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
  $("panel").innerHTML = `<h2>${esc(t.title)}</h2><p>${esc(t.intro)}</p>${stageHelp(t)}` + (t.reflect
    ? `<div class="ref reflection-rows">${t.fields.map(f => `<div class="rc ${f.cls}">${field(f)}</div>`).join("")}</div><p class="hint cite">${esc(t.cite)}</p>`   // colour + words, never colour alone
    : t.fields.map(field).join(""));
  qa($("panel"), "[data-k]").forEach(el => { el.oninput = () => { data[el.dataset.k] = el.value; persist(); updateTree() } });
  qa($("panel"), "select[data-s]").forEach(sel => {
    const add = () => { if (sel.value === "") return; insertStarter($("f-" + sel.dataset.s), FIELDS.find(x => x.k === sel.dataset.s).starters[+sel.value]); sel.value = ""; sel._nav = false };
    /* Browsers fire "change" on every arrow press. Ignore those so keyboard users can browse; Enter adds. Mouse/touch picks add on change. */
    sel.onpointerdown = () => { sel._nav = false };
    sel.onkeydown = e => { if (["ArrowUp","ArrowDown","Home","End","PageUp","PageDown"].includes(e.key)) sel._nav = true; else if (e.key === "Enter"){ e.preventDefault(); add() } };
    sel.onchange = () => { if (!sel._nav) add() };
    sel.onblur = () => { sel._nav = false; sel.value = "" };
  });
  widgetHook(); addMics(); if($("stage-tutorial"))$("stage-tutorial").onclick=()=>tutorialAction("tutorial-help"); drawNav();
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
  el.dispatchEvent(new Event("input", {bubbles:true})); say("Added: " + t.replace(/\.+$/, ""));
}

/* =============================================================================
   5. READ ALOUD (VOICE-1)  - add custom speech by extending readText()
   ============================================================================= */
const hasTTS = "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
function readText(){
  const t = TABS[cur];
  return [t.title, t.intro, ["tutorial","learn","analyse","structure","homepage","labels"].includes(t.widget) && $("wg") ? $("wg").innerText : ""].concat(t.fields.filter(f => !f.hidden).map(f => f.label + ". " + (g(f.k) || "empty"))).filter(Boolean).map(x => /[.?!]$/.test(x) ? x : x + ".").join(" ");   // tidy pauses
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
      data = {}; FIELDS.forEach(fl => { if (typeof d.data[fl.k] === "string") data[fl.k] = d.data[fl.k].slice(0, /^cs_/.test(fl.k) ? 30000 : 5000) });                // only known keys, capped
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
/* ===== CARD SORT WIDGETS (custom, inside drawPanel hook) ===== */
const SUG=[["📅","Match schedule"],["🏆","Tournament bracket"],["👥","Team rosters"],["🎟️","Ticket options"],["🗺️","Venue map"],["🛍️","Merch store"],["📺","Live stream links"],["📊","Player stats"],["🎁","Sponsor giveaways"],["📜","Code of conduct"],["♿","Accessibility info"],["🍔","Food and drink stalls"],["🎭","Cosplay contest"],["📁","Past results"],["🙋","Volunteer sign-up"],["🚌","Parking and travel"],["💰","Prize pool"],["🎙️","Caster profiles"],["❓","FAQ"],["🔎","Lost property"],["🎮","Free-play gaming zone"],["📶","Wi-Fi help"],["🩺","First aid points"],["📸","Photo wall"]];
const GC=["--cy","--pk","--li","--am"],PRE=["Watch","Compete","Visit","Buy","Get help"];
const pj=(k,d)=>{try{const v=JSON.parse(data[k]||"null");return Array.isArray(d)?(Array.isArray(v)?v:d):(v&&typeof v==="object"&&!Array.isArray(v)?v:d)}catch(e){return d}};
const sj=(k,v)=>{data[k]=JSON.stringify(v);persist()};
const getCards=()=>pj("cs_cards",[]).filter(c=>c&&typeof c.t==="string").map(c=>({t:c.t.slice(0,40),e:typeof c.e==="string"?c.e.slice(0,8):"🃏"})).slice(0,40);
const getCur=()=>{const c=pj("cs_cur",{});return {mode:c.mode==="closed"?"closed":"open",groups:Array.isArray(c.groups)?c.groups.filter(x=>typeof x==="string").slice(0,12):[],map:c.map&&typeof c.map==="object"?c.map:{}}};
const getSorts=()=>pj("cs_sorts",[]).filter(s=>s&&typeof s.p==="string"&&s.g&&typeof s.g==="object"&&Object.values(s.g).every(Array.isArray)).slice(0,6);
const blank=m=>({mode:m,groups:m==="closed"?PRE.slice():[],map:{}});
function widgetHook(){if(!TABS[cur].widget)return;($("panel").querySelector(".stage-help")||$("panel").querySelector("p")).insertAdjacentHTML("afterend",'<div id="wg" class="wg"></div>');wgDraw()}
function wgDraw(fid){const el=$("wg");if(!el)return;el.innerHTML=({tutorial:wTutorial,learn:wLearn,cards:wCards,sort:wSort,analyse:wAn,structure:wStructure,homepage:wHome,labels:wLabels})[TABS[cur].widget]();
 el.onclick=e=>{const b=e.target.closest("button[data-a]");if(b)act(b.dataset.a,b.dataset.v)};
 el.onchange=e=>{const b=e.target.closest("select[data-a]");if(b)act(b.dataset.a,b.value,b.dataset.v,b.id)};
 el.oninput=e=>{const t=e.target;if(t.dataset.node){const st=getStructure(),n=st.nodes.find(n=>n.id===t.dataset.node);if(n){n[t.dataset.prop]=t.value.slice(0,t.dataset.prop==='label'?60:1200);sj("cs_structure",st);updateTree()}}};
 el.onkeydown=e=>{if(e.key==="Enter"&&(e.target.id==="ng"||e.target.id==="nc"||e.target.id==="new-section")){e.preventDefault();act(e.target.id==="ng"?"addg":e.target.id==="new-section"?"tree-add":"addc")}};
 el.ondragstart=e=>{const c=e.target.closest("[data-c]");if(c)e.dataTransfer.setData("text/plain",c.dataset.c)};
 el.ondragover=e=>{if(e.target.closest("[data-drop]"))e.preventDefault()};
 el.ondrop=e=>{const d=e.target.closest("[data-drop]");if(!d)return;e.preventDefault();mv(e.dataTransfer.getData("text/plain"),d.dataset.drop)};
 addMics(el);if(fid&&$(fid))$(fid).focus()}
function mv(t,g,id){const c=getCur();if(!getCards().some(x=>x.t===t)||(g&&!c.groups.includes(g)))return;if(g)c.map[t]=g;else delete c.map[t];sj("cs_cur",c);wgDraw(id);say(t+(g?" moved to "+g:" returned to unsorted"))}
function act(a,v,x,id){if(a.startsWith("tutorial-"))return tutorialAction(a,v,x);if(a.startsWith("tree-")||a.startsWith("home-"))return structureAct(a,v,x,id);const cs=getCards(),c=getCur();
 if(a==="mv")return mv(x,v,id);
 if(a==="addc"||a==="sug"){const t=a==="sug"?SUG[+v][1]:($("nc").value||"").trim().slice(0,40);if(!t)return say("Type a card name first.");
  if(cs.length>=40)return say("40 cards is the limit. Remove one first.");if(cs.some(k=>k.t.toLowerCase()===t.toLowerCase()))return say("That card is already in the deck.");
  cs.push({t,e:a==="sug"?SUG[+v][0]:"🃏"});sj("cs_cards",cs);wgDraw(a==="addc"?"nc":"");return say("Added "+t+". "+cs.length+" cards.")}
 if(a==="starter"){SUG.forEach(s=>{if(cs.length<20&&!cs.some(k=>k.t===s[1]))cs.push({t:s[1],e:s[0]})});sj("cs_cards",cs);wgDraw();return say("Deck now has "+cs.length+" cards.")}
 if(a==="delc"){const k=cs.splice(+v,1)[0];delete c.map[k.t];sj("cs_cards",cs);sj("cs_cur",c);wgDraw();return say("Removed "+k.t)}
 if(a==="mode"){if(Object.keys(c.map).length&&!confirm("Changing the sort type clears your current sort. Continue?")){wgDraw();return}sj("cs_cur",blank(v));wgDraw("md");return say(v==="closed"?"Closed sort: groups are given.":"Open sort: make your own groups.")}
 if(a==="addg"){const n=($("ng").value||"").trim().slice(0,30);if(!n)return say("Type a group name first.");if(c.groups.length>=12||c.groups.includes(n))return say(c.groups.includes(n)?"That group exists.":"12 groups is the limit.");c.groups.push(n);sj("cs_cur",c);wgDraw("ng");return say("Group added: "+n)}
 if(a==="delg"){if(!confirm("Remove the group "+v+"? Its cards go back to unsorted."))return;c.groups=c.groups.filter(n=>n!==v);for(const k in c.map)if(c.map[k]===v)delete c.map[k];sj("cs_cur",c);wgDraw();return say("Group removed")}
 if(a==="reset"){if(Object.keys(c.map).length&&!confirm("Clear the current sort?"))return;sj("cs_cur",blank(c.mode));wgDraw();return say("New blank sort")}
 if(a==="save"){const S=getSorts();if(S.length>=6)return say("6 saved sorts is the limit.");if(!cs.every(k=>c.map[k.t]))return say("Sort every card before saving.");
  const g={};c.groups.forEach(n=>{const l=cs.filter(k=>c.map[k.t]===n).map(k=>k.t);if(l.length)g[n]=l});S.push({p:"Participant "+(S.length+1),mode:c.mode,g});sj("cs_sorts",S);sj("cs_cur",blank(c.mode));wgDraw();say("Saved as participant "+S.length)}}
const sel=(c,cur,i)=>`<div class="cd" draggable="true" data-c="${esc(c.t)}"><span class="em" aria-hidden="true">${esc(c.e)}</span><span class="ct">${esc(c.t)}</span><select id="m${i}" data-a="mv" data-v="${esc(c.t)}" aria-label="Move ${esc(c.t)} to"><option value="">Unsorted</option>${cur.groups.map(n=>`<option value="${esc(n)}"${n===(cur.map[c.t]||"")?" selected":""}>${esc(n)}</option>`).join("")}</select></div>`;
function wCards(){const cs=getCards(),have=new Set(cs.map(c=>c.t)),left=SUG.map((s,i)=>[s,i]).filter(p=>!have.has(p[0][1]));
 return `<h3 class="wh">Suggested cards (tap to add)</h3><div class="chips">${left.map(p=>`<button type="button" class="alt" data-a="sug" data-v="${p[1]}"><span aria-hidden="true">${p[0][0]}</span> ${esc(p[0][1])}</button>`).join("")||'<p class="hint">All suggestions added.</p>'}</div>
 <div class="row"><button type="button" data-a="starter">Add 20 starter cards</button></div>
 <label class="f" for="nc">Write your own card<span class="hint">Use words fans use, not insider terms. Example: Where do I park?</span></label><input type="text" id="nc" maxlength="40"><div class="row" style="margin-top:6px"><button type="button" data-a="addc">Add card</button></div>
 <h3 class="wh">Your deck (${cs.length} cards, aim for 20 to 30)</h3><div class="pool">${cs.map((c,i)=>`<div class="cd"><span class="em" aria-hidden="true">${esc(c.e)}</span><span class="ct">${esc(c.t)}</span><button type="button" class="alt" data-a="delc" data-v="${i}" aria-label="Remove ${esc(c.t)}">Remove</button></div>`).join("")||'<p class="hint">No cards yet.</p>'}</div>`}
function wSort(){const cs=getCards(),c=getCur(),S=getSorts();if(cs.length<4)return '<p class="hint">Build at least 4 cards first on the Cards tab.</p>';
 const P=cs.map((x,i)=>[x,i]),un=P.filter(p=>!c.map[p[0].t]);
 return `<div class="sel"><label for="md">Sort type</label><select id="md" data-a="mode"><option value="open"${c.mode==="open"?" selected":""}>Open sort: you make the groups</option><option value="closed"${c.mode==="closed"?" selected":""}>Closed sort: groups are given</option></select></div>`+
 (c.mode==="open"?`<label class="f" for="ng">New group name<span class="hint">Name it for how the cards belong together, then press Add group.</span></label><input type="text" id="ng" maxlength="30"><div class="row" style="margin-top:6px"><button type="button" data-a="addg">Add group</button></div>`:"")+
 `<h3 class="wh">Unsorted (${un.length})</h3><div class="pool" data-drop="">${un.map(p=>sel(p[0],c,p[1])).join("")||'<p class="hint">All cards sorted. Save this sort below.</p>'}</div><div class="gs">`+
 c.groups.map((n,gi)=>`<section class="gp" style="--c:var(${GC[gi%4]})" data-drop="${esc(n)}"><h3>${esc(n)} (${P.filter(p=>c.map[p[0].t]===n).length})</h3>${c.mode==="open"?`<button type="button" class="alt" data-a="delg" data-v="${esc(n)}">Remove group</button>`:""}${P.filter(p=>c.map[p[0].t]===n).map(p=>sel(p[0],c,p[1])).join("")}</section>`).join("")+
 `</div><div class="row"><button type="button" data-a="save">Save as participant ${S.length+1}</button><button type="button" class="alt" data-a="reset">Start a blank sort</button></div><p class="hint">${S.length} sort${S.length===1?"":"s"} saved. Ask two or three friends to sort the same deck, then open Analyse.</p>`}
function wAn(){const S=getSorts();if(!S.length)return '<p class="hint">No saved sorts yet. Sort every card on the Sort tab, then save it.</p>';
 const cs=getCards().map(c=>c.t),pr=[];
 for(let i=0;i<cs.length;i++)for(let j=i+1;j<cs.length;j++){let n=0;S.forEach(s=>{if(Object.values(s.g).some(l=>l.includes(cs[i])&&l.includes(cs[j])))n++});if(n)pr.push([cs[i],cs[j],Math.round(100*n/S.length)])}
 pr.sort((a,b)=>b[2]-a[2]);const names=[...new Set(S.flatMap(s=>Object.keys(s.g)))];
 return `<h3 class="wh">Pairs most often grouped together (${S.length} sort${S.length>1?"s":""})</h3>${S.length<3?'<p class="hint">These classroom practice sorts suggest patterns to investigate, not a validated audience structure.</p>':""}`+(pr.slice(0,10).map(p=>`<div class="bar"><span>${esc(p[0])} + ${esc(p[1])}</span><span class="tr" aria-hidden="true"><i style="width:${p[2]}%"></i></span><b>${p[2]}%</b></div>`).join("")||'<p class="hint">No pairs yet.</p>')+
 `<h3 class="wh">Group names people chose</h3><p>${names.map(esc).join(" · ")}</p>`+S.map(s=>`<h3 class="wh">${esc(s.p)} (${esc(s.mode)} sort)</h3><ul>${Object.keys(s.g).map(k=>`<li><b>${esc(k)}</b>: ${s.g[k].map(esc).join(", ")}</li>`).join("")}</ul>`).join("")}
const RD=[["Card Sorting: Uncover Users' Mental Models","Nielsen Norman Group","https://www.nngroup.com/articles/card-sorting-definition/","Defines card sorting as asking people to group and label topics, which exposes their mental model. Explains open, closed and hybrid sorts and when to run each. Read it to choose the right type for your esports deck."],
["Card Sorting: How Many Users to Test","Nielsen Norman Group (Nielsen, 2004)","https://www.nngroup.com/articles/card-sorting-how-many-users-to-test/","Looks at how many participants a sort needs. The article recommends around 15 participants for most card-sorting projects, based on a study of similarity scores, with diminishing gains from larger samples. Our classroom activity supports up to six practice sorts, so findings are exploratory rather than representative."],
["Card Sorting: A Definitive Guide","Boxes and Arrows (Maurer and Warfel, 2004)","https://boxesandarrows.com/card-sorting-a-definitive-guide/","A practical walk through running a sort: preparing cards, running sessions and analysing agreement between people. Use it for the Analyse step."]];
function wLearn(){return `<svg viewBox="0 0 600 200" role="img" aria-label="Diagram: five loose cards on the left are sorted into three labelled groups on the right: Watch, Compete and Visit"><g font-size="13" fill="var(--tx)" font-family="Calibri,Arial,sans-serif">${[["📺","Stream"],["📅","Schedule"],["🏆","Bracket"],["🗺️","Map"],["🎟️","Tickets"]].map((c,i)=>`<rect x="10" y="${10+i*37}" width="130" height="31" rx="6" fill="var(--bg)" stroke="var(--bd)" stroke-width="1.5"/><text x="20" y="${31+i*37}">${c[0]} ${c[1]}</text>`).join("")}<path d="M155 100H225m-9-7 9 7-9 7" stroke="var(--am)" stroke-width="3" fill="none"/>${[["Watch","--cy",["📺 Stream","📅 Schedule"]],["Compete","--pk",["🏆 Bracket"]],["Visit","--li",["🗺️ Map","🎟️ Tickets"]]].map((g,i)=>`<rect x="${240+i*120}" y="10" width="110" height="180" rx="8" fill="none" stroke="var(${g[1]})" stroke-width="3"/><text x="${250+i*120}" y="32" font-weight="700" font-size="15" fill="var(${g[1]})">${g[0]}</text>${g[2].map((t,j)=>`<rect x="${248+i*120}" y="${44+j*37}" width="94" height="30" rx="5" fill="var(--bg)" stroke="var(--bd)"/><text x="${254+i*120}" y="${64+j*37}" font-size="11">${t}</text>`).join("")}`).join("")}</g></svg>
<div class="ref"><div class="rc"><h3 class="wh">Open sort</h3><p>People make and name their own groups. Use it early to discover structure.</p></div><div class="rc sw"><h3 class="wh">Closed sort</h3><p>People place cards into groups you provide. Use it to check whether content fits given categories. Test whether users can find content with a task-based navigation check.</p></div><div class="rc nw"><h3 class="wh">Hybrid sort</h3><p>Given groups plus the freedom to add their own. Use it to check for gaps.</p></div></div>
<h3 class="wh">What it helps you decide</h3><ul><li><b>Game or site structure:</b> groupings that inform your proposed hierarchy. Build and test the hierarchy on the Structure tab.</li><li><b>Title page content:</b> choose what to put first using audience goals and additional evidence on the Title page tab.</li><li><b>Category labels:</b> the words people expect on menus.</li></ul>
<h3 class="wh">Read next (summaries in my own words)</h3>${RD.map(r=>`<div class="rd"><a href="${esc(r[2])}" target="_blank" rel="noopener noreferrer">${esc(r[0])}</a><br><small>${esc(r[1])}</small><p>${esc(r[3])}</p></div>`).join("")}`}
/* Export model: add the deck and each saved sort (EXP-2). Hidden state fields are not exported as text. */
model=function(){const m={title:g("name")||CFG.title,sections:TABS.map(t=>({h:t.title,rows:t.fields.filter(f=>!f.hidden).map(f=>[f.label,g(f.k)||"(empty)"])})).filter(s=>s.rows.length)},cs=getCards(),ex=[];
 if(cs.length)ex.push({h:"Card deck",rows:[["Cards ("+cs.length+")",cs.map(c=>c.t).join("; ")]]});
 getSorts().forEach(s=>ex.push({h:s.p+" ("+s.mode+" sort)",rows:Object.keys(s.g).map(k=>[k,s.g[k].join("; ")])}));
 const st=getStructure();if(st.nodes.length){ex.push({h:"Overall event hierarchy",rows:[["Hierarchy",treeText(st)]]});ex.push({h:"Category labels and evidence",rows:st.nodes.map(n=>[pathLabel(n.id,st),n.reason||"Evidence or hypothesis not recorded"])});}const home=getHome();if(Object.keys(home).length)ex.push({h:"Title page content priorities",rows:getCards().filter(c=>home[c.t]&&home[c.t]!=="nav").map(c=>[homeLabel(home[c.t]),c.t])});m.sections.splice(Math.max(m.sections.length-1,0),0,...ex);return m};

function getStructure(){const raw=pj('cs_structure',{}),nodes=(Array.isArray(raw.nodes)?raw.nodes:[]).filter(n=>n&&typeof n.id==='string'&&typeof n.label==='string').slice(0,40).map(n=>({id:n.id.slice(0,80),label:n.label.slice(0,60),parent:typeof n.parent==='string'?n.parent:'',reason:typeof n.reason==='string'?n.reason.slice(0,1200):''}));const ids=new Set();const unique=nodes.filter(n=>{if(ids.has(n.id))return false;ids.add(n.id);return true});for(const n of unique){if(!ids.has(n.parent)||n.parent===n.id)n.parent='';let p=n.parent,seen=new Set([n.id]);while(p){if(seen.has(p)){n.parent='';break}seen.add(p);p=unique.find(x=>x.id===p)?.parent||''}}const map=Object.create(null);const cards=new Set(getCards().map(c=>c.t));if(raw.map&&typeof raw.map==='object')for(const [t,id]of Object.entries(raw.map)){if(cards.has(t)&&ids.has(id))map[t]=id}return {nodes:unique,map,source:typeof raw.source==='string'?raw.source:''}}
function getHome(){const raw=pj('cs_home',{}),h=Object.create(null);for(const c of getCards()){const v=Object.hasOwn(raw,c.t)?raw[c.t]:'';if(['1','2','3','support','nav'].includes(v))h[c.t]=v}return h}
const homeLabel=v=>({'1':'Featured 1','2':'Featured 2','3':'Featured 3',support:'Supporting content',nav:'Navigation only'}[v]||'Not yet decided');
function pathLabel(id,st){const names=[];let n=st.nodes.find(n=>n.id===id),count=0;while(n&&count++<40){names.unshift(n.label||'[Unnamed section]');n=st.nodes.find(x=>x.id===n.parent)}return names.join(' / ')}
function descendant(id,parent,st){let p=parent,seen=new Set();while(p&&!seen.has(p)){if(p===id)return true;seen.add(p);p=st.nodes.find(x=>x.id===p)?.parent||''}return false}
function treeText(st=getStructure()){const lines=[(g('name')||'Your esports event')+' — Title page'];function walk(parent,depth){for(const n of st.nodes.filter(n=>n.parent===parent)){lines.push('  '.repeat(depth)+n.label);walk(n.id,depth+1);for(const c of getCards().filter(c=>st.map[c.t]===n.id))lines.push('  '.repeat(depth+1)+c.t)}}walk('',1);const un=getCards().filter(c=>!st.map[c.t]);if(un.length)lines.push('Unplaced: '+un.map(c=>c.t).join(', '));return lines.join('\n')}
function treeHTML(st=getStructure()){function branch(parent){const children=st.nodes.filter(n=>n.parent===parent);return children.length?'<ul class="tree-list">'+children.map(n=>'<li><div class="tree-node"><b>'+esc(n.label||'Unnamed section')+'</b><span class="tree-badge">'+(n.parent?'Subsection':'Main section')+'</span></div>'+branch(n.id)+(getCards().some(c=>st.map[c.t]===n.id)?'<ul class="tree-list">'+getCards().filter(c=>st.map[c.t]===n.id).map(c=>'<li class="tree-leaf">'+esc(c.e)+' '+esc(c.t)+'<span class="tree-badge">Content page</span></li>').join('')+'</ul>':'')+'</li>').join('')+'</ul>':''}const un=getCards().filter(c=>!st.map[c.t]);return '<div class="tree-root"><b>'+esc(g('name')||'Your esports event')+'</b><span class="tree-badge">Root · Title / home page</span></div>'+branch('')+(!st.nodes.length?'<p class="hint">Create a main section or use a saved sort to start your hierarchy.</p>':'')+(un.length?'<p class="alert-note">'+un.length+' content page'+(un.length===1?' is':'s are')+' still unplaced: '+un.map(c=>esc(c.t)).join(', ')+'</p>':'')}
function updateTree(){const st=getStructure();if($("wg"))$("wg").querySelectorAll("select option").forEach(o=>{if(st.nodes.some(n=>n.id===o.value))o.textContent=pathLabel(o.value,st)});if($('hierarchy-live'))$('hierarchy-live').innerHTML=treeHTML();if($('home-live'))$('home-live').innerHTML=homeHTML()}
function structureAct(a,v,x,id){const st=getStructure(),cards=getCards();
 if(a==='tree-seed'){const sorts=getSorts(),i=+$('seed-sort').value,s=sorts[i];if(!s)return say('Save a participant sort on the Sort tab first.');if(st.nodes.length&&!confirm('Replace the proposed hierarchy with this saved sort? Your participant sorts and title-page priorities will remain.'))return;const map=Object.create(null),nodes=Object.keys(s.g).map((label,i)=>{const node={id:'section-'+i,label,parent:'',reason:'Starting label from '+s.p+' ('+s.mode+' sort). Check against other participants.'};s.g[label].forEach(t=>{if(cards.some(c=>c.t===t))map[t]=node.id});return node});sj('cs_structure',{nodes,map,source:s.p});wgDraw();return say('Hierarchy created from '+s.p+'. This is a proposed design, not an agreed structure.')}
 if(a==='tree-add'){const label=($('new-section').value||'').trim().slice(0,60),parent=$('section-parent').value;if(!label)return say('Name the section first.');if(st.nodes.length>=40)return say('This builder supports 40 sections.');if(st.nodes.some(n=>n.parent===parent&&n.label.toLowerCase()===label.toLowerCase()))return say('That label already exists at this level.');st.nodes.push({id:'n'+Date.now().toString(36)+Math.random().toString(36).slice(2,7),label,parent,reason:''});sj('cs_structure',st);wgDraw('new-section');return say('Added '+(parent?'subsection':'main section')+': '+label)}
 if(a==='tree-parent'){const n=st.nodes.find(n=>n.id===x);if(!n||descendant(n.id,v,st))return say('A section cannot sit inside itself or its descendants.');if(v&&!st.nodes.some(n=>n.id===v))return; n.parent=v;sj('cs_structure',st);wgDraw(id);return say('Section moved. Hierarchy updated.')}
 if(a==='tree-page'){if(!cards.some(c=>c.t===x)||(v&&!st.nodes.some(n=>n.id===v)))return;if(v)st.map[x]=v;else delete st.map[x];sj('cs_structure',st);updateTree();return say(x+(v?' placed under '+pathLabel(v,st):' left unplaced'))}
 if(a==='tree-remove'){const n=st.nodes.find(n=>n.id===v);if(!n||!confirm('Remove '+n.label+'? Its subsections move up one level and its content pages become unplaced.'))return;st.nodes=st.nodes.filter(n=>n.id!==v);st.nodes.forEach(k=>{if(k.parent===v)k.parent=n.parent});Object.keys(st.map).forEach(k=>{if(st.map[k]===v)delete st.map[k]});sj('cs_structure',st);wgDraw();return say('Section removed. Check the updated hierarchy.')}
 if(a==='home-priority'){const home=getHome();if(!cards.some(c=>c.t===x))return;if(['1','2','3'].includes(v))for(const t of Object.keys(home))if(t!==x&&home[t]===v)home[t]='nav';if(v)home[x]=v;else delete home[x];sj('cs_home',home);wgDraw(id);return say(x+': '+homeLabel(v)+'. Each featured position holds one item.')}
}
function wStructure(){const st=getStructure(),sorts=getSorts(),cards=getCards();return `<div class="alert-note"><b>Build Game Structure</b><p>Move from an event title page to main categories, optional subsections, and individual content pages. Use audience evidence to explain the organisation.</p></div><div class="design-grid"><section><h3 class="wh">Build your hierarchy</h3><label class="f" for="seed-sort">Start from participant evidence</label><select id="seed-sort">${sorts.map((s,i)=>`<option value="${i}">${esc(s.p)} (${esc(s.mode)} sort)</option>`).join('')||'<option value="">No saved sorts yet</option>'}</select><div class="row"><button data-a="tree-seed" ${sorts.length?'':'disabled'}>Use this sort as a starting point</button></div><p class="hint">A saved sort stays unchanged. Compare it with others before finalising your design.</p><label class="f" for="new-section">New section label</label><input type="text" id="new-section" maxlength="60" aria-describedby="section-help"><span class="hint" id="section-help">Example only: Attend, Watch or Tournament. Use labels your participants understand.</span><label class="f" for="section-parent">Put the new section under</label><select id="section-parent"><option value="">Title page (main section)</option>${st.nodes.map(n=>`<option value="${esc(n.id)}">${esc(pathLabel(n.id,st))}</option>`).join('')}</select><div class="row"><button data-a="tree-add">Add section</button></div><h3 class="wh">Sections and their parents</h3>${st.nodes.map((n,i)=>`<div class="node-editor"><label class="f" for="label${i}">Section label ${i+1}</label><input id="label${i}" type="text" data-node="${esc(n.id)}" data-prop="label" maxlength="60" value="${esc(n.label)}"><label class="f" for="parent${i}">Parent of ${esc(n.label)}</label><select id="parent${i}" data-a="tree-parent" data-v="${esc(n.id)}"><option value="">Title page (main section)</option>${st.nodes.filter(p=>!descendant(n.id,p.id,st)).map(p=>`<option value="${esc(p.id)}"${p.id===n.parent?' selected':''}>${esc(pathLabel(p.id,st))}</option>`).join('')}</select><div class="row"><button class="alt" data-a="tree-remove" data-v="${esc(n.id)}">Remove section</button></div></div>`).join('')}<h3 class="wh">Place each content page</h3>${cards.map((c,i)=>`<div class="builder-line"><label class="f" for="page${i}">${esc(c.e)} ${esc(c.t)}</label><select id="page${i}" data-a="tree-page" data-v="${esc(c.t)}"><option value="">Unplaced</option>${st.nodes.map(n=>`<option value="${esc(n.id)}"${st.map[c.t]===n.id?' selected':''}>${esc(pathLabel(n.id,st))}</option>`).join('')}</select></div>`).join('')||'<p class="hint">Add content on the Cards tab first.</p>'}</section><section class="tree-preview"><h3 class="wh">Overall event hierarchy</h3><p class="hint">Live preview of your proposed structure. ${st.source?'Started from '+esc(st.source)+'.':''}</p><div id="hierarchy-live">${treeHTML(st)}</div></section></div>`}
function homeHTML(){const home=getHome(),cards=getCards(),st=getStructure();const featured=['1','2','3'].map(v=>{const c=cards.find(c=>home[c.t]===v);return c?`<div class="title-feature"><span class="tree-badge">Featured ${v}</span><b>${esc(c.e)} ${esc(c.t)}</b></div>`:''}).join('');const undecided=cards.filter(c=>!home[c.t]).length;return `<div class="tree-root"><b>${esc(g('name')||'Your esports event')}</b><p>${esc(g('event_date')||'Add event date')} · ${esc(g('event_venue')||'Add venue / online location')}</p><span class="tree-badge">Title page essentials · event identity</span></div><h4>Navigation</h4><div class="preview-nav">${st.nodes.filter(n=>!n.parent).map(n=>'<span>'+esc(n.label)+'</span>').join('')||'<span>Build main sections on the Structure tab</span>'}</div><h4>Featured content</h4>${featured||'<p class="hint">Choose up to three featured items to create the title-page layout.</p>'}<h4>Supporting information</h4>${cards.filter(c=>home[c.t]==='support').map(c=>'<div class="title-support">'+esc(c.e)+' '+esc(c.t)+'</div>').join('')||'<p class="hint">No supporting items selected.</p>'}<p class="hint">Navigation-only content remains in the hierarchy and does not need a separate title-page tile.</p>${undecided?'<p class="alert-note">'+undecided+' content priorities still undecided.</p>':''}`}
function wHome(){const home=getHome();return `<div class="alert-note"><b>Title Page Content</b><p>Decide what visitors need first. Card grouping provides structure; priority also needs audience goals, event timing and testing.</p></div><div class="design-grid"><section><h3 class="wh">Choose the order</h3><p class="hint">Featured 1 is the most prominent content item. Assigning an occupied slot moves the previous item to navigation only. Supporting items follow the featured items.</p>${getCards().map((c,i)=>`<div class="priority-row"><label for="priority${i}">${esc(c.e)} ${esc(c.t)}</label><select id="priority${i}" data-a="home-priority" data-v="${esc(c.t)}"><option value="">Not yet decided</option>${['1','2','3','support','nav'].map(v=>`<option value="${v}"${home[c.t]===v?' selected':''}>${homeLabel(v)}</option>`).join('')}</select></div>`).join('')||'<p class="hint">Build a card deck first.</p>'}</section><section class="tree-preview"><h3 class="wh">Title-page wireframe</h3><p class="hint">A content-priority preview, not a finished visual design.</p><div id="home-live">${homeHTML()}</div></section></div>`}
function wLabels(){const st=getStructure(),names=[...new Set(getSorts().flatMap(s=>Object.keys(s.g)))];return `<div class="alert-note"><b>Category Labels</b><p>Choose words people expect, explain what each category contains, and check that someone can choose the right route without coaching.</p></div><h3 class="wh">Participant wording</h3><p>${names.map(esc).join(' · ')||'Save participant sorts to see their original group names here.'}</p><h3 class="wh">Your proposed labels and evidence</h3>${st.nodes.map((n,i)=>`<div class="node-editor"><span class="hint">Current path: ${esc(pathLabel(n.id,st))}</span><label class="f" for="editlabel${i}">Label ${i+1}</label><input id="editlabel${i}" type="text" maxlength="60" data-node="${esc(n.id)}" data-prop="label" value="${esc(n.label)}"><label class="f" for="reason${i}">Audience wording and reason for this label</label><span id="labelhint${i}" class="hint">Which participant used this wording? What task does it describe? If unsupported, label it a hypothesis.</span><textarea id="reason${i}" data-node="${esc(n.id)}" data-prop="reason" aria-describedby="labelhint${i}">${esc(n.reason)}</textarea></div>`).join('')||'<p class="hint">Create sections on the Structure tab first.</p>'}<section class="tree-preview"><h3 class="wh">Updated navigation hierarchy</h3><div id="hierarchy-live">${treeHTML(st)}</div></section>`}

const TUTORIAL=[
 {tab:'Brief',title:'1. Choose your event',why:'You are planning an app or website for an esports event. Visitors need to find information quickly.',todo:['Give your event a name.','Name the people who will use it, such as fans at the venue or viewers watching online.','Write two things they need to do.'],example:'Neon Clash Weekend. Our fans need to find the next match and directions to the venue.',done:'You have an event name, an audience and two visitor goals.'},
 {tab:'Cards',title:'2. Make content cards',why:'A card is one piece of information your event app needs. It is not a finished page design.',todo:['Press “Add 20 starter cards” to begin.','Remove anything your event does not need.','Add missing information using “Write your own card”.'],example:'Venue map, Ticket options and Live stream links are three different content cards.',done:'Your deck contains the information your audience needs, with one idea on each card.'},
 {tab:'Sort',title:'3. Ask someone to group the cards',why:'Find out how another person expects the information to fit together. Their groups can suggest your menu sections.',todo:['Choose Open sort. Let the participant name their own groups using “New group name” and “Add group”.','Ask them to drag each card into a group, or use its Move menu. Ask why they put it there.','When every card has a group, press “Save as participant”. Repeat with another person using the same deck.'],example:'One participant might put Venue map and Ticket options in “Visit”, and Live stream links in “Watch”. Another person may choose different groups.',done:'You have saved participant sorts and noted their explanations. A small class sample gives ideas to investigate.'},
 {tab:'Analyse',title:'4. Compare what people did',why:'Look for repeated groupings and places where people disagreed.',todo:['Read “Pairs most often grouped together”.','Compare the group names chosen by different people.','Write one agreement and one disagreement in “Patterns you spotted”.'],example:'Both participants grouped Venue map with Parking and travel. They disagreed about where Match schedule belongs.',done:'You can explain a pattern using participant evidence rather than just your opinion.'},
 {tab:'Structure',title:'5. Build the event structure',why:'A hierarchy is a set of levels: title page, main sections, smaller sections and content pages.',todo:['Select a saved participant sort and press “Use this sort as a starting point”.','Use “New section label” and “Put the new section under” to add a main section or a smaller subsection.','Under “Place each content page”, choose where each card belongs. Check the live tree.'],example:'Neon Clash → Visit → Travel → Venue map. “Visit” is a main section, “Travel” is a subsection, and “Venue map” is a content page.',done:'Every content card has a place in a clear tree, and you have explained why the structure fits your audience.'},
 {tab:'Title page',title:'6. Choose what visitors see first',why:'The title page is the first screen. It introduces the event and helps visitors reach their most important tasks.',todo:['Choose Featured 1 for the most important content, then Featured 2 or 3 if needed.','Choose Supporting content for useful secondary information, or Navigation only for content reached through the menu.','Add the event date and venue, then explain your priorities. Watch the title-page preview update.'],example:'Before the event: Ticket options might be Featured 1. During the event: Match schedule might be Featured 1. Use audience evidence to justify your choice.',done:'Your preview shows the event details, a menu and a clear order for the important content.'},
 {tab:'Labels',title:'7. Check the menu words',why:'A category label is the name visitors see on the menu. It should help them predict what is inside.',todo:['Compare your labels with the participant group names. Edit unclear words and record your reason.','Give someone a task, such as “Find directions to the venue”. Ask which section they would choose without giving hints.','Record their first choice and explanation. Improve a confusing label and test again.'],example:'A visitor chooses “Visit the event” to find directions. Record the actual choice, even if it differs from your expected route.',done:'Your labels use understandable words, and you have recorded a navigation check or a plan to run one.'},
 {tab:'Reflect',title:'8. Reflect and hand in your work',why:'Explain what you learned and how the evidence changed your design.',todo:['What? Describe what you made or observed.','So What? Explain why a finding matters for your event.','Now What? Name one next action. Then use Export to download your work.'],example:'I noticed that people grouped travel information together. This matters because visitors need one clear route to it. Next I will test the label “Visit”.',done:'Your submission includes participant sorts, a hierarchy, title-page priorities, label evidence and your reflection.'}
];
let tutorialStep=0;const tutorialDemo={};
function wTutorial(){const t=TUTORIAL[tutorialStep];return `<section class="tutorial-card"><span class="tutorial-count">TUTORIAL · STEP ${tutorialStep+1} OF ${TUTORIAL.length}</span><h3>${esc(t.title)}</h3><p>${esc(t.why)}</p><h4>What to do</h4><ol>${t.todo.map(x=>'<li>'+esc(x)+'</li>').join('')}</ol><div class="tutorial-example"><b>Example only</b><p>${esc(t.example)}</p>${tutorialStep===4?'<div class="tutorial-tree"><b>Neon Clash Weekend</b><ul><li>Visit<ul><li>Travel<ul><li>Venue map</li><li>Parking and travel</li></ul></li><li>Ticket options</li></ul></li><li>Watch<ul><li>Live stream links</li></ul></li></ul></div>':''}</div>${tutorialStep===2?`<h4>Try a tiny practice sort</h4><p class="hint">Move these three example cards into groups. This practice does not add cards or results to your own work.</p>${['Venue map','Ticket options','Live stream links'].map((c,i)=>`<div class="priority-row"><label for="demo${i}">${c}</label><select id="demo${i}" data-a="tutorial-demo" data-v="${i}"><option value="">Choose a group</option>${['Visit','Watch'].map(g=>`<option${tutorialDemo[i]===g?' selected':''}>${g}</option>`).join('')}</select></div>`).join('')}<p id="tutorial-feedback" role="status">${Object.keys(tutorialDemo).length===3?'You have grouped the cards. In a real sort, ask the participant to explain their choices. People may organise content differently.':''}</p>`:''}<p class="tutorial-done"><b>You’re ready to move on when:</b> ${esc(t.done)}</p><div class="row"><button type="button" data-a="tutorial-open">Do this in ${esc(t.tab)}</button><button type="button" class="alt" data-a="tutorial-back" ${tutorialStep===0?'disabled':''}>Previous tutorial step</button><button type="button" class="alt" data-a="tutorial-next" ${tutorialStep===TUTORIAL.length-1?'disabled':''}>Next tutorial step</button></div></section><details class="tutorial-glossary"><summary>Words used in this task</summary><dl><dt>Card</dt><dd>One content item, such as Venue map.</dd><dt>Category / group</dt><dd>Related items collected together, such as Visit.</dd><dt>Hierarchy</dt><dd>The levels of your app, from its title page down to individual content pages.</dd><dt>Title page</dt><dd>The first screen, also called the home page.</dd><dt>Navigation</dt><dd>The menu and routes people use to find content.</dd><dt>Participant evidence</dt><dd>What people actually grouped, said or chose during your research.</dd></dl></details>`}
function tutorialAction(a,v,x){if(a==='tutorial-next'||a==='tutorial-back'){tutorialStep=Math.max(0,Math.min(TUTORIAL.length-1,tutorialStep+(a==='tutorial-next'?1:-1)));wgDraw();$('wg').querySelector('h3').setAttribute('tabindex','-1');$('wg').querySelector('h3').focus();say('Tutorial step '+(tutorialStep+1));return}if(a==='tutorial-open'){openTab(TABS.findIndex(t=>t.title===TUTORIAL[tutorialStep].tab));$('panel').focus();return}if(a==='tutorial-demo'){if(v)tutorialDemo[x]=v;else delete tutorialDemo[x];wgDraw('demo'+x);return}if(a==='tutorial-help'){const index=TUTORIAL.findIndex(t=>t.tab===TABS[cur].title);tutorialStep=index<0?0:index;openTab(0);$('panel').focus()}}
function stageHelp(t){const i=TUTORIAL.findIndex(s=>s.tab===t.title);if(i<0)return '';const s=TUTORIAL[i];return `<section class="stage-help"><h3>Your task on this tab</h3><ol>${s.todo.map(x=>'<li>'+esc(x)+'</li>').join('')}</ol><p><b>Finished when:</b> ${esc(s.done)}</p><button type="button" class="alt" id="stage-tutorial">Show this tutorial step</button></section>`}

boot();

return {dispose(){stopMic();stopTTS();scope.dispose();}};
};
