/* Approved AH entry. The main website remains unchanged on this branch. */
(async () => {
  const direction={letter:'AH',key:'creative-ah',name:'行动之间'};
  const stem=direction.letter.toLowerCase();
  const loadScript=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.body.append(s);});
  const style=document.createElement('link');style.rel='stylesheet';style.href=`./creative/${stem}.css`;document.head.append(style);
  try {
    const response=await fetch(`./creative/${stem}.html`);if(!response.ok)throw new Error('Missing direction');
    document.body.innerHTML=await response.text();
    document.body.dataset.variant=direction.key;document.body.dataset.creative=direction.letter;
    document.title=`${direction.letter} ${direction.name} — Damon Guan`;
    function normalizeLinks(){
      document.querySelectorAll('a[data-view]').forEach(a=>{const source=new URL(a.getAttribute('href')||'?view=home',location.href);const url=new URL(location.href);url.searchParams.set('variant',direction.letter);url.searchParams.set('view',a.dataset.view);url.hash=source.hash;a.href=url.pathname+url.search+url.hash;});
      document.querySelectorAll('#prototype-blog .blog-entry[href^="/notes/"] .blog-entry-read').forEach(label=>{label.textContent='原站文章 ↗';label.dataset.uiZh='原站文章 ↗';label.dataset.uiEn='Original website ↗';});
    }
    for(const event of ['prototype:view','prototype:article-ready','prototype:blog-ready'])document.addEventListener(event,normalizeLinks);
    await loadScript('./shared.js');
    await loadScript(`./creative/${stem}.js`);
    normalizeLinks();
    document.dispatchEvent(new CustomEvent('creative:ready'));
  } catch(error) {
    const p=document.createElement('p');p.style.padding='48px';p.textContent='页面暂时未能载入。';const a=document.createElement('a');a.href='mailto:hello@damon.ai';a.textContent='联系 Damon';p.append(' ',a);document.body.replaceChildren(p);
  }
})();
