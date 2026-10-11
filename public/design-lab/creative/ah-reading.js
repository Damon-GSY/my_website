/* Progressive AH reading refinements. Routing and article content stay shared. */
(() => {
  if (document.body.dataset.creative !== 'AH') return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const body = document.body;
  let indexNav, indexMarker, topicLinks = [], topics = [], readingFrame = 0;
  let entryFrame = 0, entryAnimations = [];
  let previousView = body.dataset.view;
  const usesSite = () => body.dataset.blogStyle === 'site';
  const usesMotion = () => !reduced.matches && body.dataset.ahMotion !== 'static';

  function stopEntry() {
    cancelAnimationFrame(entryFrame);
    entryFrame = 0;
    entryAnimations.forEach(animation => animation.cancel());
    entryAnimations = [];
  }

  function mountIndex() {
    const heading = document.querySelector('#prototype-blog .blog-index-heading');
    if (!heading || indexNav) return;
    topics = [...document.querySelectorAll('#prototype-blog .blog-topic')];
    indexNav = document.createElement('nav');
    indexNav.className = 'ah-blog-index-nav';
    indexMarker = document.createElement('span');
    indexMarker.className = 'ah-blog-index-marker';
    indexMarker.setAttribute('aria-hidden', 'true');
    indexNav.append(indexMarker);
    topicLinks = topics.map((topic, index) => {
      const link = document.createElement('a');
      const url = new URL(location.href);
      url.searchParams.set('view', 'blog');
      url.hash = topic.id;
      link.href = url.href;
      const number = document.createElement('span');
      number.textContent = String(index + 1).padStart(2, '0');
      link.append(number, topic.querySelector('h2').textContent);
      link.addEventListener('click', () => {
        // Opening occurs before native anchor navigation, so the destination is
        // the real section rather than a second custom navigation system.
        topic.open = true;
        activateTopic(index);
      });
      topic.addEventListener('toggle', queueIndex);
      indexNav.append(link);
      return link;
    });
    heading.append(indexNav);
    translate();
    queueIndex();
  }

  function activateTopic(index) {
    if (!topicLinks[index]) return;
    topicLinks.forEach((link, i) => {
      if (i === index) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    const link = topicLinks[index];
    indexMarker.style.transform = `translateY(${link.offsetTop + (link.offsetHeight - 13) / 2}px)`;
  }

  function updateIndex() {
    readingFrame = 0;
    if (body.dataset.view !== 'blog' || !usesSite() || !topics.length) return;
    let current = 0;
    topics.forEach((topic, index) => {
      if (topic.getBoundingClientRect().top <= innerHeight * .36) current = index;
    });
    activateTopic(current);
  }

  function queueIndex() {
    if (!readingFrame) readingFrame = requestAnimationFrame(updateIndex);
  }

  function translate() {
    indexNav?.setAttribute('aria-label', body.dataset.language === 'en' ? 'Blog categories' : 'Blog 分类');
    // Keep the newly created native links in sync with language/style URL edits.
    topicLinks.forEach((link, index) => {
      const url = new URL(location.href);
      url.searchParams.set('view', 'blog');
      url.hash = topics[index].id;
      link.href = url.href;
    });
  }

  function enterReading(view) {
    stopEntry();
    if (!usesSite() || !usesMotion() || !['blog', 'article'].includes(view)) return;
    // The shared router completes its native scroll/focus work first. A short
    // settling movement keeps the title and index on their actual reading grid.
    entryFrame = requestAnimationFrame(() => {
      entryFrame = 0;
      if (body.dataset.view !== view || !usesSite() || !usesMotion()) return;
      const title = document.querySelector(view === 'blog' ? '.blog-index-heading h1' : '.reading-title');
      const content = document.querySelector(view === 'blog' ? '.blog-index-groups' : '.reading-deck');
      for (const [index, element] of [title, content].entries()) {
        if (!element) continue;
        entryAnimations.push(element.animate([
          {transform:`translateY(${index ? 12 : 20}px)`, opacity:.6},
          {transform:'translateY(0)', opacity:1},
        ], {duration:360, delay:index * 45, easing:'cubic-bezier(.22,1,.36,1)'}));
      }
    });
  }

  function onView() {
    mountIndex();
    translate();
    queueIndex();
    const view = body.dataset.view;
    if (view !== previousView) enterReading(view);
    previousView = view;
  }

  document.addEventListener('prototype:blog-ready', mountIndex);
  document.addEventListener('prototype:article-ready', queueIndex);
  document.addEventListener('prototype:view', onView);
  document.addEventListener('prototype:language', translate);
  document.addEventListener('prototype:reading-layout', () => {
    if (!usesSite()) stopEntry();
    translate();
    queueIndex();
  });
  addEventListener('scroll', queueIndex, {passive:true});
  addEventListener('resize', () => {stopEntry();queueIndex();}, {passive:true});
  addEventListener('popstate', () => {translate();queueIndex();});
  addEventListener('pagehide', () => {stopEntry();cancelAnimationFrame(readingFrame);readingFrame=0;});
  addEventListener('pageshow', queueIndex);
  reduced.addEventListener('change', stopEntry);
  document.fonts.ready.then(queueIndex);
  mountIndex();
})();
