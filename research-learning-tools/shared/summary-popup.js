(() => {
 'use strict';
 const catalog=new Map(window.SUMMARY_CATALOG.map(s=>[s.url,s]));
 const dialog=document.createElement('dialog');dialog.className='summary-popup';dialog.setAttribute('aria-labelledby','summary-popup-title');
 dialog.innerHTML='<div class="summary-popup-bar"><h2 id="summary-popup-title">Article summary</h2><button type="button" class="summary-close" autofocus aria-label="Close article summary">Close ×</button></div><div class="summary-document"><p class="summary-by"></p><p class="summary-checked hint"></p><div class="summary-controls"><button data-summary-action="read">Read aloud</button><button data-summary-action="pause">Pause</button><button data-summary-action="stop">Stop</button><label>Speed <select class="summary-speed"><option value="0.8">0.8×</option><option selected value="1">1×</option><option value="1.2">1.2×</option></select></label><button data-summary-action="print">Print / save PDF</button><button data-summary-action="download">Download summary</button></div><article class="summary-content"></article><a class="summary-source" target="_blank" rel="noopener noreferrer">Read original source ↗</a><p class="summary-status" role="status"></p></div>';
 const style=document.createElement('style');style.textContent=`.summary-popup{box-sizing:border-box;width:min(900px,94vw);max-height:90vh;padding:0;border:2px solid var(--cy,#0e7490);border-radius:14px;background:var(--card,#fff);color:var(--tx,#0f172a)}.summary-popup::backdrop{background:#000a}.summary-popup[open]{display:flex;flex-direction:column}.summary-popup-bar{display:flex;gap:16px;align-items:center;justify-content:space-between;padding:12px 18px;border-bottom:1px solid var(--bd,#94a3b8)}.summary-popup-bar h2{font-size:1.15rem;margin:0}.summary-popup button,.summary-open{font:inherit;cursor:pointer;border:1px solid var(--cy,#0e7490);border-radius:6px;padding:8px 12px;color:var(--cy,#0e7490);background:var(--card,#fff)}.summary-open{display:block;margin:10px 0}.summary-document{overflow:auto;padding:20px 24px;line-height:1.65}.summary-controls{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:20px 0}.summary-content h3{color:var(--cy);margin:24px 0 8px}.summary-content li{margin:8px 0}.summary-apply{border-left:4px solid var(--cy);padding:4px 16px}.summary-source{color:var(--cy)}.summary-popup :focus-visible,.summary-open:focus-visible{outline:3px solid var(--am);outline-offset:3px}@media print{body[data-print-summary]>:not(.summary-popup){display:none!important}.summary-popup{display:none!important}body[data-print-summary]>.summary-popup{display:block!important;position:static;width:100%;max-height:none;border:0;background:#fff;color:#000}.summary-popup-bar button,.summary-controls{display:none!important}.summary-document{overflow:visible;padding:0}.summary-content h3{color:#000}.summary-source::after{content:' (' attr(href) ')'}}`;
 document.head.append(style);document.body.append(dialog);
 const q=s=>dialog.querySelector(s),escape=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 let opener,active;
 const text=()=>active.title+'\n'+active.by+'\n\n'+['Overview\n'+active.overview,'Key points\n'+active.points.join('\n'),'Apply it\n'+active.apply,'Limits\n'+active.limit,'Think about it\n'+active.question,'Source\n'+active.url].join('\n\n');
 function stop(){window.speechSynthesis?.cancel();q('[data-summary-action="pause"]').textContent='Pause';}
 function close(){stop();dialog.close();opener?.focus();}
 q('.summary-close').onclick=close;dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
 function open(record,button){
  active=window.RESEARCH_SUMMARIES[record.id];if(!active)return;
  opener=button;stop();q('#summary-popup-title').textContent=active.title;
  q('.summary-by').textContent=active.by;q('.summary-checked').textContent='Source checked '+active.checked+' · Teaching summary in our own words';
  q('.summary-content').innerHTML='<h3>Overview</h3><p>'+escape(active.overview)+'</p><h3>Key points from the source</h3><ul>'+active.points.map(x=>'<li>'+escape(x)+'</li>').join('')+'</ul><section class="summary-apply"><h3>Apply it to your esports task</h3><p>'+escape(active.apply)+'</p></section><h3>Limits and source check</h3><p>'+escape(active.limit)+'</p><h3>Think about it</h3><p>'+escape(active.question)+'</p>';
  q('.summary-source').href=active.url;q('.summary-status').textContent='';dialog.showModal();q('.summary-document').scrollTop=0;
 }
 dialog.addEventListener('click',e=>{
  const action=e.target.closest('[data-summary-action]')?.dataset.summaryAction;if(!action)return;
  if(action==='read'){if(!window.speechSynthesis){q('.summary-status').textContent='Read aloud is unavailable in this browser.';return;}stop();const u=new SpeechSynthesisUtterance(text());u.rate=+q('.summary-speed').value;speechSynthesis.speak(u);}
  if(action==='pause'){if(!window.speechSynthesis)return;if(speechSynthesis.paused){speechSynthesis.resume();e.target.textContent='Pause';}else{speechSynthesis.pause();e.target.textContent='Resume';}}
  if(action==='stop')stop();
  if(action==='print'){document.body.dataset.printSummary='1';try{window.print();}finally{delete document.body.dataset.printSummary;}}
  if(action==='download'){const url=URL.createObjectURL(new Blob([text()],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=active.id+'-summary.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 });
 function scan(root){root.querySelectorAll('a[href]').forEach(a=>{
  if(dialog.contains(a))return;const s=catalog.get(a.href);if(!s)return;
  let button=a.nextElementSibling;if(!button?.classList.contains('summary-open')){button=document.createElement('button');button.type='button';button.className='summary-open';a.after(button);}
  if(button.dataset.summary===s.id)return;button.dataset.summary=s.id;button.textContent='Open detailed summary';button.setAttribute('aria-label','Open summary: '+s.title);button.onclick=()=>open(s,button);
 });}
 function observe(root){let queued=false,live=true;const observer=new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;if(live)scan(root);});});observer.observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['href']});scan(root);return()=>{live=false;observer.disconnect();};}
 window.ResearchSummaries={observe};observe(document.body);
})();
