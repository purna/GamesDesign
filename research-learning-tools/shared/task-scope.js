window.RESEARCH_TASK_CONTENT={};
window.RESEARCH_TASKS={};
function createTaskScope(root){
  const page=document,shell=root.querySelector('.studio-shell'),controller=new AbortController();
  const callbacks=new Map(),timeouts=new Set(),intervals=new Set();
  const localDocument=new Proxy(page,{get(target,key){
    if(key==='documentElement'||key==='body')return shell;
    if(key==='activeElement')return root.activeElement||page.activeElement;
    if(key==='getElementById')return id=>root.querySelector('#'+CSS.escape(id))||(['kick','ttl','sub','tut'].includes(id)?page.getElementById(id):null);
    if(key==='querySelector')return selector=>selector==='header'?page.querySelector('.activity-header'):root.querySelector(selector);
    if(key==='querySelectorAll')return root.querySelectorAll.bind(root);
    if(key==='addEventListener')return(type,listener,options={})=>root.addEventListener(type,listener,{...(typeof options==='object'?options:{capture:options}),signal:controller.signal});
    const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value;
  },set(target,key,value){if(key==='title')return true;return Reflect.set(target,key,value,target);}});
  const localWindow=new Proxy(window,{get(target,key){
    if(callbacks.has(key))return callbacks.get(key);
    if(key==='print')return()=>{page.body.dataset.printTask='1';try{target.print();}finally{delete page.body.dataset.printTask;}};
    return Reflect.get(target,key,target);
  },set(target,key,value){callbacks.set(key,value);return true;}});
  const addEventListener=(type,listener,options={})=>window.addEventListener(type,listener,{...(typeof options==='object'?options:{capture:options}),signal:controller.signal});
  root.addEventListener('click',e=>{
    const path=e.composedPath();
    const action=path.find(n=>n instanceof HTMLElement&&n.dataset.taskHandler);
    if(action){
      const handler=callbacks.get(action.dataset.taskHandler),arg=action.dataset.taskArg;
      if(typeof handler==='function'){
        if(arg==='event')handler(e);
        else if(arg==='')handler();
        else if(/^-?\d+$/.test(arg))handler(Number(arg));
      }
    }
    const a=path.find(n=>n instanceof HTMLAnchorElement&&n.getAttribute('href')?.startsWith('#'));
    if(a){const id=a.getAttribute('href').slice(1),target=root.querySelector('#'+CSS.escape(id));if(target){e.preventDefault();target.focus();target.scrollIntoView({block:'start'});}}
  },{signal:controller.signal});
  return {
    notifySaved(){window.dispatchEvent(new Event('research-task-saved'));},document:localDocument,addEventListener,window:localWindow,
    setTimeout(fn,delay,...args){const id=window.setTimeout(()=>{timeouts.delete(id);fn(...args);},delay);timeouts.add(id);return id;},
    clearTimeout(id){window.clearTimeout(id);timeouts.delete(id);},
    setInterval(fn,delay,...args){const id=window.setInterval(fn,delay,...args);intervals.add(id);return id;},
    clearInterval(id){window.clearInterval(id);intervals.delete(id);},
    dispose(){controller.abort();for(const id of timeouts)window.clearTimeout(id);for(const id of intervals)window.clearInterval(id);callbacks.clear();page.querySelector('.activity-header').inert=false;page.getElementById('tut').onclick=null;}
  };
}
