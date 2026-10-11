/* Design study. Reading UI inspired by Rare UI; cursor math adapted from
 * Cursor Lab, Copyright (c) 2026 Oleksandr Yeromin, MIT. See cursor-lab-LICENSE.txt.
 * Effects are confined to marked media regions; the text cursor remains native.
 */
(() => {
  if (document.body.dataset.edition !== '2') return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  const ui=(zh,en)=>document.body.dataset.language==='en'?en:zh;
  let pilot, nav, marker, sectionLinks=[], headings=[], current=-1, scrollFrame=0;
  let hideCursor=()=>{};

  function mountReading() {
    if (pilot) return;
    const article=document.querySelector('#prototype-article');
    const prose=article.querySelector('.reading-prose');
    if (!prose) return;
    const title=article.querySelector('.reading-title');
    title.id='article-start';
    headings=[title,...prose.querySelectorAll(':scope > h2'),...prose.querySelectorAll('[data-footnotes] > h2')];
    nav=article.querySelector('.reading-toc nav');
    article.querySelector('.reading-toc').addEventListener('toggle',queueReading);
    nav.replaceChildren();
    marker=document.createElement('span');marker.className='reading-active-dot';marker.setAttribute('aria-hidden','true');nav.append(marker);
    pilot=document.createElement('aside');pilot.className='reading-pilot';pilot.setAttribute('aria-label','阅读位置与章节');
    pilot.innerHTML='<button class="pilot-trigger" type="button" aria-expanded="false" aria-controls="reading-jump-list"><svg class="pilot-ring" viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="11"/><circle class="pilot-ring-fill" cx="14" cy="14" r="11" pathLength="100"/></svg><span class="pilot-current">开始阅读</span><span class="pilot-percent">0%</span><span class="pilot-chevron" aria-hidden="true">⌃</span></button><div class="pilot-panel"><div><div class="pilot-panel-label">CONTENTS / 文章目录</div><nav class="pilot-nav" id="reading-jump-list" aria-label="跳转章节" inert></nav></div></div>';
    const jumpList=pilot.querySelector('.pilot-nav');
    sectionLinks=headings.map((heading,index)=>{
      const label=index===0?ui('开始阅读','Start reading'):heading.textContent.replace(/^\d+[.、\s]+/,'');
      const sidebar=document.createElement('a');sidebar.href='#'+heading.id;sidebar.textContent=label;nav.append(sidebar);
      const jump=document.createElement('a');jump.href=sidebar.href;
      const number=document.createElement('span');number.textContent=String(index+1).padStart(2,'0');
      const text=document.createElement('span');text.textContent=label;jump.append(number,text);jumpList.append(jump);
      for(const link of [sidebar,jump])link.addEventListener('click',event=>{
        if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
        event.preventDefault();history.pushState({},'',link.hash);
        closePilot();heading.scrollIntoView({behavior:reduced.matches||document.body.dataset.ahMotion==='static'?'instant':'smooth',block:'start'});
        heading.setAttribute('tabindex','-1');heading.focus({preventScroll:true});activate(index);
      });
      return {sidebar,jump,label};
    });
    document.body.append(pilot);
    pilot.querySelector('.pilot-trigger').addEventListener('click',()=>{
      const open=!pilot.classList.contains('is-open');pilot.classList.toggle('is-open',open);
      pilot.querySelector('.pilot-trigger').setAttribute('aria-expanded',String(open));jumpList.inert=!open;
    });
    document.addEventListener('pointerdown',event=>{if(!pilot.contains(event.target))closePilot();});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&pilot.classList.contains('is-open')){closePilot();pilot.querySelector('.pilot-trigger').focus();event.preventDefault();}});
    new ResizeObserver(queueReading).observe(prose);
    translateReading();
    updateReading();
  }
  function closePilot(){if(!pilot)return;pilot.classList.remove('is-open');pilot.querySelector('.pilot-trigger').setAttribute('aria-expanded','false');pilot.querySelector('.pilot-nav').inert=true;}
  function activate(index){
    if(!sectionLinks[index])return;
    for(const [i,links] of sectionLinks.entries())for(const a of [links.sidebar,links.jump]){if(i===index)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');}
    const link=sectionLinks[index].sidebar;
    marker.style.transform=`translateY(${link.offsetTop+link.offsetHeight/2-3}px)`;
    if(current!==index){pilot.querySelector('.pilot-current').textContent=sectionLinks[index].label;current=index;}
  }
  function updateReading(){
    scrollFrame=0;if(!pilot)return;
    pilot.hidden=document.body.dataset.view!=='article';if(pilot.hidden)return;
    const article=document.querySelector('#prototype-article');
    const start=article.getBoundingClientRect().top+scrollY;
    const progress=Math.min(1,Math.max(0,(scrollY-start)/Math.max(1,article.offsetHeight-innerHeight)));
    pilot.querySelector('.pilot-ring-fill').style.strokeDashoffset=String(100-progress*100);
    const percent=Math.round(progress*100);pilot.querySelector('.pilot-percent').textContent=percent+'%';
    let active=0;headings.forEach((heading,index)=>{if(heading.getBoundingClientRect().top<=155)active=index;});
    activate(active);pilot.querySelector('.pilot-trigger').setAttribute('aria-label',ui(`阅读进度 ${percent}%，${sectionLinks[active].label}，展开或收起目录`,`Reading progress ${percent}%, ${sectionLinks[active].label}, toggle contents`));
  }
  function queueReading(){if(pilot&&!scrollFrame)scrollFrame=requestAnimationFrame(updateReading);}
  addEventListener('scroll',queueReading,{passive:true});addEventListener('resize',queueReading,{passive:true});
  document.addEventListener('prototype:article-ready',mountReading);
  document.addEventListener('prototype:view',()=>{mountReading();closePilot();queueReading();hideCursor();});
  function translateReading(){if(!pilot)return;const label=ui('开始阅读','Start reading');sectionLinks[0].label=label;sectionLinks[0].sidebar.textContent=label;sectionLinks[0].jump.lastElementChild.textContent=label;pilot.setAttribute('aria-label',ui('阅读位置与章节','Reading progress and contents'));pilot.querySelector('.pilot-panel-label').textContent=ui('CONTENTS / 文章目录','CONTENTS');pilot.querySelector('.pilot-nav').setAttribute('aria-label',ui('跳转章节','Jump to section'));current=-1;queueReading();}
  document.addEventListener('prototype:language',translateReading);
  document.addEventListener('prototype:reading-layout',()=>{translateReading();queueReading();});
  mountReading();

  // Retained directions use the contextual cursor; archived studies keep their original effect.
  if(document.body.dataset.cursorEngine==='designed')return;
  const mode=document.body.dataset.cursor||'ring';
  const layer=document.createElement('div');layer.className='fx-layer';layer.dataset.effect=mode;layer.setAttribute('aria-hidden','true');document.body.append(layer);
  if(mode==='ring')layer.innerHTML='<i class="fx-ring"></i><i class="fx-dot"></i>';
  else if(mode==='squish')layer.innerHTML='<i class="fx-shape"></i><span class="fx-label">View</span>';
  else if(mode==='crosshair')layer.innerHTML='<i class="fx-cross-x"></i><i class="fx-cross-y"></i><i class="fx-cross-box"></i><span class="fx-coordinate"></span>';
  const trail=mode==='trail'?Array.from({length:7},(_,i)=>{const el=document.createElement('i');el.className='fx-trail-dot';const size=10-i;el.style.cssText=`width:${size}px;height:${size}px;margin:${-size/2}px;opacity:${1-i*.11}`;layer.append(el);return{el,x:0,y:0};}):[];
  let zone=null,frame=0,mx=0,my=0,x=0,y=0,scale=1,wanted=1,sx=1,sy=1,angle=0;
  const translate=(px,py)=>`translate3d(${px}px,${py}px,0)`;
  hideCursor=()=>{zone?.classList.remove('cursor-is-active');zone=null;layer.classList.remove('is-visible');cancelAnimationFrame(frame);frame=0;};
  function tick(){
    frame=0;if(!zone)return;
    const dx=mx-x,dy=my-y;x+=dx*.18;y+=dy*.18;scale+=(wanted-scale)*.18;
    if(mode==='ring'){
      layer.querySelector('.fx-dot').style.transform=translate(mx,my);
      layer.querySelector('.fx-ring').style.transform=translate(x,y)+` scale(${scale})`;
    }else if(mode==='squish'){
      const speed=Math.min(Math.hypot(dx,dy)/44,.7);if(speed>.02)angle=Math.atan2(dy,dx)*180/Math.PI;
      sx+=(1+speed-sx)*.18;sy+=(1-speed*.78-sy)*.18;
      layer.querySelector('.fx-shape').style.transform=translate(x,y)+` rotate(${angle}deg) scale(${sx},${sy})`;
      layer.querySelector('.fx-label').style.transform=translate(x,y);
    }else if(mode==='crosshair'){
      const r=zone.getBoundingClientRect();
      layer.querySelector('.fx-cross-x').style.transform=translate(mx,0);
      layer.querySelector('.fx-cross-y').style.transform=translate(0,my);
      layer.querySelector('.fx-cross-box').style.transform=translate(mx,my);
      const tag=layer.querySelector('.fx-coordinate');tag.style.transform=translate(Math.min(mx+15,r.right-105),Math.min(my+15,r.bottom-30));
      tag.textContent=`${Math.round(mx-r.left)} / ${Math.round(my-r.top)}`;
    }else if(mode==='trail'){
      let px=mx,py=my;for(const point of trail){point.x+=(px-point.x)*.34;point.y+=(py-point.y)*.34;point.el.style.transform=translate(point.x,point.y);px=point.x;py=point.y;}
    }
    const tail=trail.at(-1);const unsettled=tail?Math.hypot(mx-tail.x,my-tail.y)>.15:Math.hypot(dx,dy)>.15||Math.abs(scale-wanted)>.005||Math.abs(sx-1)>.005;
    if(unsettled&&mode!=='crosshair')frame=requestAnimationFrame(tick);
  }
  document.addEventListener('pointermove',event=>{
    if(!fine.matches||reduced.matches||document.hidden||document.body.dataset.view!=='home'||event.pointerType==='touch'){hideCursor();return;}
    const next=event.target.closest('[data-cursor-zone]');
    if(!next||(mode==='trail'&&event.target.closest('a,button,input,textarea,article,[data-drag-handle]'))){hideCursor();return;}
    mx=event.clientX;my=event.clientY;
    if(zone!==next){hideCursor();zone=next;x=mx;y=my;sx=sy=scale=1;trail.forEach(n=>{n.x=mx;n.y=my;});if(mode!=='trail')zone.classList.add('cursor-is-active');layer.classList.add('is-visible');}
    const r=zone.getBoundingClientRect();layer.style.clipPath=`inset(${Math.max(0,r.top)}px ${Math.max(0,innerWidth-r.right)}px ${Math.max(0,innerHeight-r.bottom)}px ${Math.max(0,r.left)}px)`;
    const paint=zone.dataset.cursorColor;if(paint)layer.style.color=paint;else layer.style.removeProperty('color');
    wanted=event.target.closest('a,button,[data-cursor-label]')?1.65:1;
    if(mode==='squish')layer.querySelector('.fx-label').textContent=event.target.closest('[data-cursor-label]')?.dataset.cursorLabel||zone.dataset.cursorLabel||'View';
    if(!frame)frame=requestAnimationFrame(tick);
  },{passive:true});
  document.documentElement.addEventListener('pointerleave',hideCursor);
  addEventListener('scroll',hideCursor,{passive:true});addEventListener('resize',hideCursor,{passive:true});
  document.addEventListener('visibilitychange',hideCursor);reduced.addEventListener('change',hideCursor);fine.addEventListener('change',hideCursor);
})();
