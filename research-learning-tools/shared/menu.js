// Stable presentation destinations: #menu and #<method-id>.
function renderMenu(){
  const icons=['📋','🧭','🧩','👤','✏️','🎤','🔍','💬','🖱️','🗂️','📍','🧪','🎮'];
  $('menu-links').innerHTML=METHODS.map((m,i)=>`<a class="menu-card" href="#${m.id}"><span class="menu-icon" aria-hidden="true">${icons[i]}</span><span class="eyebrow">${String(i+1).padStart(2,'0')} · ${m.time} MIN</span><h3>${escapeHTML(m.title)}</h3><p>${escapeHTML(m.desc)}</p><span class="menu-action">Open activity →</span></a>`).join('');
}
function route(){
  const id=location.hash.slice(1);
  const isMenu=!id||id==='menu';
  $('menu').hidden=!isMenu;$('activity-view').hidden=isMenu;
  document.querySelector('.skip').href=isMenu?'#menu':'#workspace';
  $('menu-nav').setAttribute('aria-current',isMenu?'page':'false');
  if(isMenu){
    if('speechSynthesis' in window)speechSynthesis.cancel();
    disposeStudio();$('latest-studio').innerHTML='';
    document.title='Research menu · Research Lab';
    document.querySelectorAll('#methodnav button').forEach(b=>b.setAttribute('aria-current','false'));
    $('menu-heading').focus();
    return;
  }
  const m=METHODS.find(x=>x.id===id);
  if(m){current=m;step=0;render();renderActivityNavigation(m);$('workspace').focus();$('workspace').scrollIntoView({block:'start'});}
  else if(id!=='workspace'){location.hash='menu';}
}

function renderActivityNavigation(m){
  const index=METHODS.indexOf(m);
  const previous=METHODS[index-1],next=METHODS[index+1];
  const links=[['previous-activity',previous,'←','Previous'],['next-activity',next,'→','Next']];
  for(const [id,method,icon,label] of links){
    const link=$(id);
    link.href=method?'#'+method.id:'#menu';
    link.innerHTML=`<span class="action-icon" aria-hidden="true">${icon}</span><span>${method?label+' activity':'Research menu'}<small>${method?escapeHTML(method.title):(previous?'All 13 research methods':'Choose an activity')}</small></span>`;
  }
}
