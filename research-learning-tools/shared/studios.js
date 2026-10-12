const STUDIO_IDS=METHODS.filter(m=>m.activity).map(m=>m.id);
const studioKey=id=>'research-v3-'+id+'-Data';
function studioBackups(){const records={};for(const id of STUDIO_IDS){try{const s=JSON.parse(localStorage.getItem(studioKey(id))||'null');if(s?.data){records[id]=s;const report=JSON.parse(localStorage.getItem('research-v3-'+id+'-Report')||'null');if(report)records[id].report=report;}}catch{}}return records;}
function validateStudios(records){if(records===undefined)return undefined;if(!records||typeof records!=='object'||Array.isArray(records))throw Error('Invalid activity backup');const clean={};for(const id of STUDIO_IDS){const s=records[id];if(!s)continue;if(!Number.isInteger(s.v)||s.v<1||s.v>window.RESEARCH_TASK_CONTENT[id]().CFG.version||!s.data||typeof s.data!=='object'||Array.isArray(s.data))throw Error('Invalid activity record');if(!Object.values(s.data).every(v=>typeof v==='string'&&v.length<=1500000))throw Error('Invalid activity answer');clean[id]={v:s.v,data:s.data};const t=s.report;if(t&&typeof t.title==='string'&&Array.isArray(t.sections)&&t.sections.every(x=>x&&typeof x.h==='string'&&Array.isArray(x.rows)&&x.rows.every(row=>Array.isArray(row)&&row.length===2&&row.every(v=>typeof v==='string'))))clean[id].report=t;}return clean;}
function restoreStudios(records){if(records===undefined)return;for(const id of STUDIO_IDS){const reportKey='research-v3-'+id+'-Report';if(records[id]){localStorage.setItem(studioKey(id),JSON.stringify(records[id]));if(records[id].report)localStorage.setItem(reportKey,JSON.stringify(records[id].report));else localStorage.removeItem(reportKey);}else{localStorage.removeItem(studioKey(id));localStorage.removeItem(reportKey);}}}
function studioReport(m){const s=studioBackups()[m.id];if(!s)return '\n## Latest activity\nOpen the activity studio to create your work.\n';if(s.report)return '\n## '+s.report.title+'\n\n'+s.report.sections.map(section=>'### '+section.h+'\n'+section.rows.map(([label,value])=>label+': '+value).join('\n\n')).join('\n\n')+'\n';return '\n## Latest activity studio record\n'+Object.entries(s.data).filter(([,v])=>v.trim()).map(([k,v])=>k+': '+(v.startsWith('data:image')?'[Portrait saved in JSON backup]':v.replace(/data:image\/[^"\s]+/g,'[image saved in backup]'))).join('\n\n')+'\n';}
let mountedStudio=null;
function disposeStudio(){if(mountedStudio){mountedStudio.dispose();mountedStudio=null;}}
function renderStudio(m){
 const host=document.getElementById('latest-studio');disposeStudio();host.innerHTML='';
 if(!m.activity)return;
 host.innerHTML='<div class="activity-studio"></div>';
 const root=host.querySelector('.activity-studio').attachShadow({mode:'open'});
 root.append(document.getElementById('task-view-'+m.id).content.cloneNode(true));
 const scope=createTaskScope(root);
 const task=window.RESEARCH_TASKS[m.id](scope);
 const unobserve=window.ResearchSummaries.observe(root);
 mountedStudio={root,dispose(){unobserve();task.dispose();}};syncStudioAccessibility();
}

function syncStudioAccessibility(){
 const shell=mountedStudio?.root.querySelector('.studio-shell');if(!shell)return;
 shell.dataset.theme=document.body.dataset.theme||'night';
 shell.classList.toggle('dys',document.body.classList.contains('reading'));
 shell.style.setProperty('--task-font-scale','1');
}
function studioHasWork(id){const s=studioBackups()[id];return !!s&&Object.values(s.data).some(v=>typeof v==='string'&&v.trim());}
