/* One shared pill; the existing router still owns navigation and history. */
(() => {
  const nav = document.querySelector('.ah-segments');
  const pill = nav.querySelector('.ah-nav-pill');
  const links = [...nav.querySelectorAll('[data-ah-nav]')];
  let active = links[0];

  function measure() {
    // Keep the indicator in the same offset coordinate space as its links.
    pill.style.left = `${active.offsetLeft}px`;
    pill.style.width = `${active.offsetWidth}px`;
  }

  function select(link, view = document.body.dataset.view) {
    active = link;
    links.forEach(item => {
      if (item === active) item.setAttribute('aria-current', view === 'home' ? 'location' : 'page');
      else item.removeAttribute('aria-current');
    });
    measure();
  }

  function syncRoute() {
    const url = new URL(location.href);
    const view = url.searchParams.get('view') || 'home';
    const key = view === 'blog' || view === 'article' || url.hash.startsWith('#ah-blog')
      ? 'blog' : url.hash === '#ah-research' ? 'research' : 'work';
    select(links.find(link => link.dataset.ahNav === key), view);
  }

  nav.addEventListener('click', event => {
    const target = event.target.closest('[data-ah-nav]');
    if (!target || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    select(target, target.dataset.view);
  });
  nav.addEventListener('keydown', event => {
    if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    const index = links.indexOf(event.target);
    if (index < 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    event.stopPropagation(); // The design-lab shell uses arrows to switch prototypes.
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? links.length - 1
      : (index + (event.key === 'ArrowRight' ? 1 : -1) + links.length) % links.length;
    links[next].focus(); // Enter follows the link; focus alone does not navigate.
  });

  document.addEventListener('prototype:view', syncRoute);
  document.addEventListener('prototype:language', measure);
  addEventListener('hashchange', syncRoute);
  addEventListener('popstate', syncRoute);
  new ResizeObserver(measure).observe(nav);
  document.fonts.ready.then(measure);
  syncRoute();
  requestAnimationFrame(() => { nav.dataset.ready = 'true'; });
})();
