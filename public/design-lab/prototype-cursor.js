/* Original cursor shapes; event-driven follow motion, shared with each site's reading navigation. */
(() => {
  const shapes={
    'creative-ah':{name:'橙点',en:'Dot',shape:'ring',ink:'#FF5A1F',path:'M29 22A7 7 0 1 1 15 22A7 7 0 1 1 29 22'},
    'creative-ae':{name:'折痕',en:'Fold',shape:'paper',path:'M8 10L18 6L28 11L36 7V34L28 38L18 33L8 37ZM18 6V33M28 11V38'},
    'creative-af':{name:'剪辑点',en:'Cut',shape:'frame',path:'M7 9H17M7 9V35H17M37 9H27M37 9V35H27M23 6L19 38'},
    'creative-ag':{name:'等高线',en:'Contour',shape:'ring',path:'M38 24C38 35 25 40 14 35C2 29 6 15 15 8C26 1 39 11 38 24ZM30 23C30 29 22 33 16 27C10 21 17 14 23 15C28 16 31 19 30 23'},
    'creative-ad':{name:'镜头',en:'Lens',shape:'ring',path:'M37 22A15 15 0 1 1 7 22A15 15 0 1 1 37 22M22 2V9M22 35V42M2 22H9M35 22H42'},
    signal:{name:'准星',en:'Reticle',shape:'reticle',path:'M10 17V10H17M27 10H34V17M34 27V34H27M17 34H10V27M22 6V11M22 33V38'},
    desk:{name:'纸签',en:'Paper',shape:'paper',path:'M11 8H27L34 15V36H11ZM27 8V15H34'},
    canvas:{name:'拖迹',en:'Trail',shape:'trail',path:'M13 9H31V35H13ZM17 13H27'},
    passage:{name:'门框',en:'Frame',shape:'frame',path:'M16 7H9V37H16M28 7H35V37H28'},
    indexed:{name:'索引',en:'Index',shape:'index',path:'M9 12H35V32H9ZM9 37H24'},
    margin:{name:'圆环',en:'Ring',shape:'ring',path:'M39 22A17 17 0 1 1 5 22A17 17 0 1 1 39 22'},
    'creative-t':{name:'排字线',en:'Typesetter',shape:'frame',path:'M7 10H16M7 10V34H16M37 10H28M37 10V34H28'},
    'creative-u':{name:'剖面',en:'Section',shape:'reticle',path:'M22 5L39 15L22 25L5 15ZM5 23L22 33L39 23M5 31L22 41L39 31'},
    'creative-v':{name:'书签',en:'Bookmark',shape:'paper',path:'M12 6H32V38L22 30L12 38Z'},
    'creative-w':{name:'调谐',en:'Tuner',shape:'ring',path:'M37 22A15 15 0 1 1 7 22A15 15 0 1 1 37 22M22 3V10'},
    'creative-x':{name:'路径',en:'Path',shape:'trail',path:'M8 34V22H22V10H36'},
    'creative-y':{name:'页角',en:'Page',shape:'paper',path:'M9 7H35V28L25 38H9ZM25 38V28H35'},
    'creative-z':{name:'光圈',en:'Aperture',shape:'ring',path:'M38 22A16 16 0 1 1 6 22A16 16 0 1 1 38 22M22 2V7M22 37V42M2 22H7M37 22H42'},
    'creative-aa':{name:'取景',en:'Crop',shape:'index',path:'M8 16V8H16M28 8H36V16M36 28V36H28M16 36H8V28'},
    'creative-ab':{name:'双侧',en:'Sides',shape:'frame',path:'M8 9H18V35H8ZM26 9H36V35H26'},
    'creative-ac':{name:'路标',en:'Waypoint',shape:'reticle',path:'M22 4L40 22L22 40L4 22Z'},
  };
  const config=shapes[document.body.dataset.variant];
  if(!config)return;
  const fine=matchMedia('(hover: hover) and (pointer: fine)');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const layer=document.createElement('div');
  layer.className='site-cursor';layer.dataset.shape=config.shape;layer.setAttribute('aria-hidden','true');
  layer.innerHTML=`<div class="site-cursor-body"><svg viewBox="0 0 44 44"><path class="cursor-outline" d="${config.path}"/><path class="cursor-arrow" d="M16 28L28 16M18 16H28V26"/><path class="cursor-drag" d="M22 13V31M13 22H31M18 17L22 13L26 17M18 27L22 31L26 27M17 18L13 22L17 26M27 18L31 22L27 26"/></svg></div><i class="site-cursor-point"></i>`;
  const follower=layer.querySelector('.site-cursor-body'),point=layer.querySelector('.site-cursor-point');
  const trail=config.shape==='trail'?Array.from({length:5},(_,i)=>{const el=document.createElement('i');el.className='site-cursor-tail';el.style.setProperty('--tail-opacity',String(.55-i*.09));layer.append(el);return{el,x:0,y:0};}):[];
  document.body.append(layer);
  const toggle=document.createElement('button');toggle.type='button';toggle.className='site-cursor-toggle';
  document.querySelector('.ah-footer nav').append(toggle);
  let enabled=new URL(location.href).searchParams.get('cursor')!=='native';
  let zone=null,frame=0,mx=0,my=0,x=0,y=0,inside=false;
  const position=(px,py)=>`translate3d(${px}px,${py}px,0)`;
  function updateToggle(){const en=document.body.dataset.language==='en';toggle.textContent=enabled?(en?`Cursor: ${config.en}`:`光标：${config.name}`):(en?'Native cursor':'原生光标');toggle.setAttribute('aria-pressed',String(enabled));toggle.title=en?'Toggle designed / native cursor':'切换设计光标 / 原生光标';document.body.dataset.cursorPreference=enabled?'designed':'native';}
  function hide(){zone?.classList.remove('designed-cursor-target');zone=null;layer.classList.remove('is-visible','is-held');cancelAnimationFrame(frame);frame=0;}
  function targetAtPointer(){
    if(!enabled||!inside||!fine.matches||reduced.matches||document.hidden)return null;
    const target=document.elementFromPoint(mx,my);
    if(!target||target.closest('.study-bar,input,textarea,select,[contenteditable="true"],.reading-prose,[inert]'))return null;
    const drag=target.closest('.materials-board:not(.is-reading):not(.is-list) .drag-handle,.scene-canvas,[data-cursor-action="drag"]');
    if(drag)return{element:drag,action:'drag'};
    if(target.closest('.drag-handle'))return null;
    const control=target.closest('a,button:not(:disabled),summary');
    if(control)return{element:control,action:'link'};
    if(target.closest('p,h1,h2,h3,blockquote,pre'))return null;
    if(document.body.dataset.view!=='home')return null;
    const ambient=target.closest('.signal-scene,.desk-hero,.canvas-intro,.canvas-blank,[data-cursor-zone]');
    return ambient?{element:ambient,action:'ambient'}:null;
  }
  function tick(){
    frame=0;
    const next=targetAtPointer();if(!next){hide();return;}
    if(zone!==next.element){
      zone?.classList.remove('designed-cursor-target');zone=next.element;zone.classList.add('designed-cursor-target');
      x=mx;y=my;trail.forEach(t=>{t.x=mx;t.y=my;});
      const style=getComputedStyle(zone);
      layer.style.setProperty('--cursor-ink',config.ink||(zone.closest('.passage-door')?style.color:style.getPropertyValue('--accent').trim()||style.color));
    }
    layer.dataset.action=next.action;layer.classList.add('is-visible');
    x+=(mx-x)*.28;y+=(my-y)*.28;
    follower.style.transform=position(x,y);point.style.transform=position(mx,my);
    let tx=mx,ty=my;
    for(const t of trail){t.x+=(tx-t.x)*.35;t.y+=(ty-t.y)*.35;t.el.style.transform=position(t.x,t.y);tx=t.x;ty=t.y;}
    const unsettled=Math.hypot(mx-x,my-y)>.12||(trail.length&&Math.hypot(mx-tx,my-ty)>.12);
    if(unsettled)frame=requestAnimationFrame(tick);
  }
  function queue(){if(!frame)frame=requestAnimationFrame(tick);}
  document.addEventListener('pointermove',event=>{if(event.pointerType==='touch'){inside=false;hide();return;}mx=event.clientX;my=event.clientY;inside=true;queue();},{passive:true});
  document.addEventListener('pointerdown',event=>{if(layer.dataset.action==='drag'&&zone?.contains(event.target))layer.classList.add('is-held');else hide();},{passive:true});
  document.addEventListener('pointerup',()=>{layer.classList.remove('is-held');if(inside)queue();},{passive:true});
  document.addEventListener('pointercancel',hide);
  document.documentElement.addEventListener('pointerleave',()=>{inside=false;hide();});
  addEventListener('blur',()=>{inside=false;hide();});
  addEventListener('scroll',()=>{if(inside)queue();},{passive:true});
  addEventListener('resize',hide);
  document.addEventListener('visibilitychange',hide);
  document.addEventListener('prototype:view',hide);
  document.addEventListener('prototype:language',updateToggle);
  document.addEventListener('keydown',event=>{if(event.key==='Tab')hide();});
  reduced.addEventListener('change',hide);fine.addEventListener('change',hide);
  toggle.addEventListener('click',()=>{enabled=!enabled;const url=new URL(location.href);url.searchParams.set('cursor',enabled?'designed':'native');history.replaceState(history.state,'',url);hide();updateToggle();});
  addEventListener('popstate',()=>{enabled=new URL(location.href).searchParams.get('cursor')!=='native';hide();updateToggle();});
  updateToggle();
})();
