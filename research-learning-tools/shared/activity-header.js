// Shared Persona-format header; examples contribute their title and subtitle.
function renderActivityHeader(m){
 const content=m.activity?window.RESEARCH_TASK_CONTENT[m.id]():null;
 $('kick').textContent=`ACTIVITY ${METHODS.indexOf(m)+1} / ${METHODS.length} · ${content?.CFG.kicker||'RESEARCH METHODS · '+m.title.toUpperCase()+' · '+m.time+' MIN'}`;
 $('ttl').textContent=content?.CFG.title||m.title;
 $('sub').textContent=content?.CFG.sub||m.desc;
 document.querySelector('.activity-header').inert=false;
 if(m.id==='personas')return; // Persona Maker wires its existing tutorial here.
 $('tut').onclick=()=>{
  if(m.id==='card-sorting'&&mountedStudio){mountedStudio.root.querySelector('#t0').click();mountedStudio.root.querySelector('#panel').focus();return;}
  openActivityGuide(m,content);
 };
}
let activityGuide;
function openActivityGuide(m,content){
 if(!activityGuide){
  activityGuide=document.createElement('dialog');activityGuide.className='activity-guide';activityGuide.setAttribute('aria-labelledby','activity-guide-title');document.body.append(activityGuide);
  activityGuide.addEventListener('close',()=>$('tut').focus());
 }
 const steps=content?content.TABS.filter(t=>!t.reflect).map(t=>({title:t.title,text:t.intro})):m.labels.map((title,i)=>({title,text:m.hints[i]}));
 activityGuide.innerHTML='<h2 id="activity-guide-title">Tutorial: '+escapeHTML(content?.CFG.title||m.title)+'</h2><p>'+escapeHTML(content?.CFG.sub||m.task)+'</p><ol>'+steps.map(s=>'<li><strong>'+escapeHTML(s.title)+'</strong><p>'+escapeHTML(s.text)+'</p></li>').join('')+'</ol><p>Use the sentence starters and worked examples to begin. Write your own responses and label assumptions. Your work saves in this browser; download a backup before changing devices.</p><button type="button" autofocus>Close tutorial</button>';
 activityGuide.querySelector('button').onclick=()=>activityGuide.close();activityGuide.showModal();
}
