/* Shared content and reading controls; personal sites keep their own visual identity by default. */
(() => {
  const container=document.querySelector('#prototype-blog');
  if(!container)return;
  const ui=(zh,en)=>document.body.dataset.language==='en'?en:zh;
  const text=(zh,en)=>`data-ui-zh="${zh}" data-ui-en="${en}"`;
  const groups=[
    {name:'Learn',zh:'学习与认知',en:'Learning & understanding',intro:['不只是收集更多，而是理解得更深。','Less collecting. More understanding.'],notes:[['how-to-learn','如何学习，从收集知识到建立个人认知结构','2026.08.16','围绕一个真实问题，把知识连接起来，再用行动和反馈修改自己的理解。','中文']]},
    {name:'Build',zh:'工程实践',en:'Engineering practice',intro:['模型走进真实工作流之后，工程问题才刚开始。','What it takes to move an agent into real work.'],notes:[['building-agents-that-actually-work','Building agents that actually work','2026.03.28','','EN'],['post-training-lessons-from-production','Post-training lessons from production','2026.03.15','','EN'],['tool-use-is-a-product-interface','Tool use is a product interface','2026.02.24','','EN'],['memory-is-not-one-feature','Memory is not one feature','2026.02.08','','EN']]},
    {name:'Research',zh:'研究笔记',en:'Research notes',intro:['论文之外，那些值得继续追问的细节。','Questions worth returning to, beyond the paper.'],notes:[['why-agent-evaluation-is-hard','Why agent evaluation is hard','2026.04.10','','EN'],['supchain-bench-notes','Notes on supply-chain benchmarks','2026.01.20','','EN'],['visual-quality-as-preference-signal','Visual quality as a preference signal','2025.12.12','','EN']]},
  ];
  const styles=[['site','跟随本站','Match this site'],['index','纸白','Paper'],['journal','深色','Dark'],['sage','浅绿','Sage']];
  const defaultStyle='site';
  function styleFromUrl(){const value=new URL(location.href).searchParams.get('blog');return styles.some(s=>s[0]===value)?value:defaultStyle;}
  function makeTools(){const tools=document.createElement('div');tools.className='blog-style-tools';tools.innerHTML=`<span ${text('阅读设计','Reading design')}>${ui('阅读设计','Reading design')}</span><div role="group" aria-label="Blog reading style">${styles.map(([key,zh,en])=>`<button type="button" data-blog-style-choice="${key}" aria-pressed="false" ${text(zh,en)}>${ui(zh,en)}</button>`).join('')}</div>`;return tools;}
  container.innerHTML=`<div class="blog-index-shell"><header class="blog-index-heading"><div><a class="blog-home-link" href="?view=home" data-view="home" ${text('← Damon 的个人网站','← Damon’s personal website')}>${ui('← Damon 的个人网站','← Damon’s personal website')}</a><span class="blog-overline">DAMON GUAN / AN OPEN INDEX</span><h1>Blog<span>.</span></h1></div><p ${text('从真实问题出发，把思考留在这里。','Thinking through real questions, in public.')}>${ui('从真实问题出发，把思考留在这里。','Thinking through real questions, in public.')}</p></header><div class="blog-index-groups">${groups.map((group,index)=>`<details class="blog-topic" id="blog-${group.name.toLowerCase()}" ${index===0?'open':''}><summary><span class="blog-topic-number">0${index+1}</span><h2>${group.name}</h2><span class="blog-topic-meta" ${text(group.zh,group.en)}>${ui(group.zh,group.en)}</span><span class="blog-topic-count">0${group.notes.length}</span><i aria-hidden="true"></i></summary><div class="blog-topic-body"><p class="blog-topic-intro" ${text(...group.intro)}>${ui(...group.intro)}</p>${group.notes.map(([slug,title,date,description,lang],n)=>`<a class="blog-entry ${slug==='how-to-learn'?'blog-entry-featured':''}" href="${slug==='how-to-learn'?'?view=article':'/notes/'+slug}" ${slug==='how-to-learn'?'data-view="article"':''}><span class="blog-entry-number">${group.name[0]}.${String(n+1).padStart(2,'0')}</span><div><span class="blog-entry-meta">${date} / ${lang}</span><h3>${title}</h3>${description?`<p lang="zh-CN">${description}</p>`:''}<span class="blog-entry-read" ${text(slug==='how-to-learn'?'阅读全文 ↗':'阅读原文 ↗',slug==='how-to-learn'?'Read article ↗':'Read original ↗')}>${ui(slug==='how-to-learn'?'阅读全文 ↗':'阅读原文 ↗',slug==='how-to-learn'?'Read article ↗':'Read original ↗')}</span></div>${slug==='how-to-learn'?'<figure><img src="/assets/notes/how-to-learn/llm-concept-map.png" alt="Personal learning concept map" width="1428" height="1078"><figcaption>FIG. 01 / MAKING CONNECTIONS</figcaption></figure>':''}</a>`).join('')}</div></details>`).join('')}</div><footer class="blog-index-footer"><span>DAMON GUAN · 08 ARTICLES</span><a href="https://github.com/Damon-GSY/ai-era-growth-guide">AI ERA GROWTH GUIDE ↗</a></footer></div>`;
  container.querySelector('.blog-index-heading').after(makeTools());
  function applyStyle(style,write=false){
    document.body.dataset.blogStyle=style;
    document.querySelectorAll('[data-blog-style-choice]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.blogStyleChoice===style)));
    if(write){const url=new URL(location.href);url.searchParams.set('blog',style);history.replaceState(history.state,'',url);}
    document.dispatchEvent(new CustomEvent('prototype:reading-layout'));
  }
  function mountArticleTools(){const header=document.querySelector('#prototype-article .reading-header');if(header&&!header.querySelector('.blog-style-tools'))header.prepend(makeTools());applyStyle(styleFromUrl());translate();}
  function translate(){document.querySelectorAll('[data-ui-zh]').forEach(el=>{el.textContent=ui(el.dataset.uiZh,el.dataset.uiEn);});}
  document.addEventListener('click',event=>{const button=event.target.closest('[data-blog-style-choice]');if(button)applyStyle(button.dataset.blogStyleChoice,true);});
  document.addEventListener('prototype:article-ready',mountArticleTools);
  document.addEventListener('prototype:view',mountArticleTools);
  document.addEventListener('prototype:language',translate);
  addEventListener('popstate',()=>applyStyle(styleFromUrl()));
  mountArticleTools();
  document.dispatchEvent(new CustomEvent('prototype:blog-ready'));
})();
