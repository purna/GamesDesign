"""Refresh embedded activities from the local standalone HTML files."""
from pathlib import Path
import hashlib,json,re,subprocess
ROOT=Path(__file__).resolve().parents[1]
SOURCE=ROOT
IDS=['surveys','task-analysis','prototyping','personas','parallel-design','interviews','expert-review','focus-groups','first-click','card-sorting','contextual-interviews','usability-testing','use-cases']
index=(ROOT/'index.html').read_text()
index=re.sub(r'\s*<template id="task-view-[^"]+">[\s\S]*?</template>\s*','',index)
index=re.sub(r'<script defer src="activities/[^"]+/(?:content|task)\.js"></script>','',index)
templates=[];scripts=[];manifest=[]
for n,id in enumerate(IDS,1):
 source=next(SOURCE.glob(f'Activity_{n:02}_*.html'))
 html=source.read_text()
 js=re.findall(r'<script\b[^>]*>([\s\S]*?)</script>',html)[-1]
 split=js.index('const $')
 content=js[:split]
 task=js[split:]
 # Newer sources place their tab configuration after the DOM helpers.
 if 'const APP_TABS' not in content:
  tabs_start=task.index('const APP_TABS')
  tabs_end=task.index('const TABS = APP_TABS.concat(REFLECT);')+len('const TABS = APP_TABS.concat(REFLECT);')
  content+='\n'+task[tabs_start:tabs_end]+'\n'
  task=task[:tabs_start]+task[tabs_end:]
 content=re.sub(r'pfx\s*:\s*"[^"]+"',f'pfx:"research-v3-{id}-"',content,count=1)
 content=content.replace(f'ACTIVITY {n} / 13 · ','')
 folder=ROOT/'activities'/id;folder.mkdir(exist_ok=True)
 (folder/'content.js').write_text(f'// Synced from {source.name}; run tools/sync-research.py to refresh.\nwindow.RESEARCH_TASK_CONTENT[{json.dumps(id)}] = function(){{\n'+content+'\nreturn {CFG,APP_TABS,REFLECT,TABS};\n};\n')
 # The library owns display preferences; tasks retain their speech and dictation controls.
 task=re.sub(r'  THEMES\.forEach\(t => \$\("th-" \+ t\)\.onclick = \(\) => setTheme\(t\)\);','',task)
 task=re.sub(r'  \$\("fm"\)\.onclick[^\n]*','',task)
 task=re.sub(r'  setTheme\(theme \|\|[^\n]*','',task)
 task=task.replace('applyFont(); setDys(dys);','')
 task=task.replace('const BG = ["#a11y", "header", "main"];','const BG = ["header", "main"];')
 task=task.replace('document.title = CFG.title;','')
 # Keep structured widget state as well as field answers on remount.
 restore='''  try {const saved=JSON.parse(load("Data")||"null");if(saved?.data && saved.v<=CFG.version){data=Object.fromEntries(Object.entries(saved.data).filter(([,value])=>typeof value==="string"&&value.length<=1500000));}} catch {}\n'''
 task=task.replace('function boot(){','function boot(){\n'+restore,1)
 task=re.sub(r'const persist = \(\) => [^\n]+', '''const persist = () => { store("Data", JSON.stringify({v: CFG.version, data})); try { store("Report", JSON.stringify(model())); } catch {} if (typeof updXP === "function") updXP(); scope.notifySaved(); };''',task,count=1)
 # Replace expert-inspector inline handlers with scoped delegated actions.
 def handler(m):
  name,arg=m.group(1),m.group(2)
  return f'data-task-handler="{name}" data-task-arg="{arg}"'
 task=re.sub(r'onclick="(\w+)\(([^"()]*)\)"',handler,task)
 task=f'''// Synced from {source.name}; library scope isolates DOM, callbacks and timers.
window.RESEARCH_TASKS[{json.dumps(id)}] = function(scope){{
const window=scope.window, document=scope.document;
const addEventListener=scope.addEventListener;
const {{setTimeout,clearTimeout,setInterval,clearInterval}}=scope;
'''+content+'\n'+task+'''\nreturn {dispose(){stopMic();stopTTS();scope.dispose();}};\n};\n'''
 (folder/'task.js').write_text(task)
 css='\n'.join(re.findall(r'<style[^>]*>([\s\S]*?)</style>',html))
 css=css.replace(':root','.studio-shell')
 css=re.sub(r'\b(?:html|body)\b','.studio-shell',css)
 css+='\n:host{display:block} [hidden]{display:none!important}.summary-open{display:block;margin:10px 0}.studio-shell main{padding-top:0}.panel>.ref{grid-template-columns:1fr}\n'
 (folder/'style.css').write_text(css)
 body=re.search(r'<body[^>]*>([\s\S]*?)</body>',html).group(1)
 body=re.sub(r'<script\b[^>]*>[\s\S]*?</script>','',body)
 # The source toolbar ends immediately before the common header.
 body=re.sub(r'<div class="a11y"[^>]*>[\s\S]*?</div>\s*</div>\s*(?=<header>)','',body,count=1)
 body=re.sub(r'<header>[\s\S]*?</header>','',body,count=1)
 body=re.sub(r'onclick="(\w+)\(([^"()]*)\)"',handler,body)
 templates.append(f'<template id="task-view-{id}"><link rel="stylesheet" href="activities/{id}/style.css"><div class="studio-shell" lang="en-GB">\n{body}\n</div></template>')
 scripts.extend([f'<script defer src="activities/{id}/{part}.js"></script>' for part in ['content','task']])
 p=ROOT/'data'/'methods'/(id+'.js')
 record=json.loads(p.read_text().strip().removeprefix('METHODS.push(').removesuffix(');'))
 record['activity']=id
 p.write_text('METHODS.push('+json.dumps(record,ensure_ascii=False,indent=2)+');\n')
 manifest.append({'method':id,'source':str(source.relative_to(ROOT.parent)),'sha256':hashlib.sha256(source.read_bytes()).hexdigest()})
index=index.replace('<script defer src="shared/studios.js"></script>',''.join(scripts)+'<script defer src="shared/studios.js"></script>')
index=re.sub(r'\s*</body>', '</body>', index)
index=index.replace('</body>','\n'+'\n'.join(templates)+'\n</body>')
# Keep menu descriptions and durations aligned with the source activity configs.
metadata_js="""
const fs=require('fs'),vm=require('vm');
let context={window:{RESEARCH_TASK_CONTENT:{}}};vm.createContext(context);
const root=process.argv[1],ids=JSON.parse(process.argv[2]);const result={};
for(const id of ids){vm.runInContext(fs.readFileSync(root+'/activities/'+id+'/content.js','utf8'),context);result[id]=context.window.RESEARCH_TASK_CONTENT[id]().CFG;}
process.stdout.write(JSON.stringify(result));
"""
metadata=json.loads(subprocess.check_output(['node','-e',metadata_js,str(ROOT),json.dumps(IDS)],text=True))
for id,cfg in metadata.items():
 p=ROOT/'data'/'methods'/(id+'.js')
 record=json.loads(p.read_text().strip().removeprefix('METHODS.push(').removesuffix(');'))
 record['desc']=record['task']=cfg['sub']
 time=re.search(r'(\d+)(?:[-–](\d+))?\s*MIN',cfg['kicker'],re.I)
 if time:record['time']=time[1]+'–'+time[2] if time[2] else int(time[1])
 p.write_text('METHODS.push('+json.dumps(record,ensure_ascii=False,indent=2)+');\n')
(ROOT/'index.html').write_text(index)
(ROOT/'data'/'research-sources.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(f'Synced {len(IDS)} activities from {SOURCE}.')
