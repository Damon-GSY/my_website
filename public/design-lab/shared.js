/* AH home, Blog and article navigation. No prototype comparison controls. */
(() => {
  const current = document.body.dataset.variant;
  if (!current) return;
  {
    document.body.dataset.edition='2';
    document.body.dataset.cursorEngine='designed';
    for(const file of ['round-two.css','blog-system.css','prototype-cursor.css'])if(!document.querySelector(`link[href="./${file}"]`)){const link=document.createElement('link');link.rel='stylesheet';link.href='./'+file;document.head.append(link);}
    for(const file of ['round-two.js','blog-system.js','prototype-cursor.js'])if(!document.querySelector(`script[src="./${file}"]`)){const script=document.createElement('script');script.src='./'+file;script.defer=true;document.head.append(script);}
  }
  const ui=(zh,en)=>document.body.dataset.language==='en'?en:zh;
  function translateInterface(){document.querySelectorAll('[data-ui-zh]').forEach(el=>{el.textContent=ui(el.dataset.uiZh,el.dataset.uiEn);});document.querySelector('.study-bar')?.setAttribute('aria-label',ui('设计原型比较','Compare design prototypes'));document.querySelector('.reading-toc nav')?.setAttribute('aria-label',ui('章节目录','Article sections'));}
  const icon = document.createElement('link');
  icon.rel = 'icon'; icon.href = '/favicon.svg'; document.head.append(icon);
  const home = document.querySelector('#prototype-home');
  const article = document.querySelector('#prototype-article');
  const blog = document.createElement('main');blog.id='prototype-blog';blog.hidden=true;
  article.before(blog);
  // A navigation-level Blog entry opens the index; a feature/article link opens its story.
  document.querySelectorAll('header [data-view="article"],nav [data-view="article"],aside [data-view="article"]').forEach(link=>{link.dataset.view='blog';link.setAttribute('href','?view=blog');});
  let articleReady = false;
  let pending;
  let observer;
  document.documentElement.style.setProperty('--study-bar-height','0px');
  const initialTitle = document.title;
  async function loadArticle() {
    if (articleReady) return;
    if (pending) return pending;
    pending = (async () => {
      const response = await fetch('./learning-guide.html');
      if (!response.ok) throw new Error('正文加载失败');
      const html = await response.text();
      article.setAttribute('lang','zh-CN');
      article.innerHTML = `<header class="reading-header"><a class="reading-back" href="?view=home" data-view="home">← Damon 的手记</a><div class="reading-meta"><span>Learning / 认知与学习</span><time datetime="2026-08-16">2026.08.16</time><span>16 分钟阅读</span></div><h1 class="reading-title">如何学习，从收集知识到建立个人认知结构</h1><p class="reading-deck">学习，是围绕真实问题选择值得掌握的内容，画出自己的认知结构，再用行动和反馈不断修改它。</p></header><div class="reading-layout"><details class="reading-toc" ${innerWidth>760?'open':''}><summary>文章目录</summary><nav aria-label="章节目录"></nav><p class="reading-author">Damon Guan<br>LLM Algorithm Engineer<br><a href="https://github.com/Damon-GSY/ai-era-growth-guide">AI 时代的个人成长指南 ↗</a></p></details><article class="reading-prose">${html}<footer class="reading-end"><a href="?view=home" data-view="home">← 回到首页</a><a href="https://github.com/Damon-GSY/ai-era-growth-guide">查看源文档 ↗</a></footer></article></div>`;
      const headings = [...article.querySelectorAll('.reading-prose > h2')];
      const toc = article.querySelector('.reading-toc nav');
      headings.forEach(h => { const a=document.createElement('a');a.href=`#${h.id}`;a.textContent=h.textContent;toc.append(a); });
      if(document.body.dataset.edition!=='2'){
        observer = new IntersectionObserver(entries=>{entries.forEach(entry=>{if(!entry.isIntersecting)return;toc.querySelectorAll('a').forEach(a=>{if(a.hash===`#${entry.target.id}`)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});});},{rootMargin:'-10% 0px -60% 0px'});
        headings.forEach(h=>observer.observe(h));
      }
      articleReady = true;
      const back=article.querySelector('.reading-back');back.dataset.view='blog';back.href='?view=blog';back.dataset.uiZh='← Blog 目录';back.dataset.uiEn='← Blog index';
      const end=article.querySelector('.reading-end [data-view="home"]');end.dataset.view='blog';end.href=back.href;end.dataset.uiZh=back.dataset.uiZh;end.dataset.uiEn=back.dataset.uiEn;
      const summary=article.querySelector('.reading-toc summary');summary.dataset.uiZh='文章目录';summary.dataset.uiEn='Contents';
      const source=article.querySelector('.reading-end a:last-child');source.href='https://github.com/Damon-GSY/ai-era-growth-guide';source.dataset.uiZh='查看源文档 ↗';source.dataset.uiEn='Source notes ↗';
      const category=article.querySelector('.reading-meta span:first-child');category.dataset.uiZh='Learning / 认知与学习';category.dataset.uiEn='Learning / Cognition';
      const duration=article.querySelector('.reading-meta span:last-child');duration.dataset.uiZh='16 分钟阅读';duration.dataset.uiEn='16 min read';
      const guide=article.querySelector('.reading-author a');guide.dataset.uiZh='AI 时代的个人成长指南 ↗';guide.dataset.uiEn='Growth in the AI era ↗';
      const lang=document.createElement('span');lang.dataset.uiZh='中文原文';lang.dataset.uiEn='Original language: Chinese';article.querySelector('.reading-meta').append(lang);
      translateInterface();
      document.dispatchEvent(new CustomEvent('prototype:article-ready'));
    })();
    try {await pending;} catch(error) {pending=null;article.innerHTML='<p style="padding:80px 24px">正文暂时无法加载。<a href="https://github.com/Damon-GSY/ai-era-growth-guide">查看源文档</a></p>';}
  }
  async function renderView(view, push=false, hash='') {
    view = ['article','blog'].includes(view)?view:'home';
    if(push){const url=new URL(location.href);url.searchParams.set('view',view);url.hash=hash;history.pushState({view},'',url);}
    home.hidden=view!=='home';article.hidden=view!=='article';blog.hidden=view!=='blog';
    document.body.dataset.view=view;
    document.title=view==='article'?'如何学习 — Damon Guan':view==='blog'?'Blog — Damon Guan':initialTitle;
    if(view==='article')await loadArticle();
    document.dispatchEvent(new CustomEvent('prototype:view',{detail:{view}}));
    if(hash){document.getElementById(hash.replace(/^#/,''))?.scrollIntoView();} else if(push){window.scrollTo({top:0,behavior:'instant'});}
  }
  document.addEventListener('click',event=>{
    const control=event.target.closest('[data-view]');
    if(control && (control.tagName==='A'||control.tagName==='BUTTON')){
      if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
      event.preventDefault();
      const hash=control.tagName==='A'?new URL(control.href,location.href).hash:'';
      renderView(control.dataset.view,true,hash);
    }
  });
  window.addEventListener('popstate',()=>renderView(new URL(location.href).searchParams.get('view'),false,location.hash));
  document.addEventListener('prototype:language',translateInterface);
  translateInterface();
  renderView(new URL(location.href).searchParams.get('view'),false,location.hash);
})();
