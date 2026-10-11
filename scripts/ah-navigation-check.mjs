import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

// Exercise the navigation controller only. The shared router owns real page
// changes; this fake supplies element measurements and the events it receives.
const events = () => {
  const handlers = new Map();
  return {
    addEventListener(type, handler) {
      const list = handlers.get(type) || [];
      list.push(handler);
      handlers.set(type, list);
    },
    emit(type, event = {}) {
      for (const handler of handlers.get(type) || []) handler(event);
    },
  };
};
let focused, resize, observed, fontsReady;
const frames = [];
const links = ['work', 'research', 'blog'].map((key, index) => ({
  dataset: { ahNav: key, view: key === 'blog' ? 'blog' : 'home' },
  offsetLeft: [4, 96, 217][index],
  offsetWidth: [90, 119, 83][index],
  attributes: {},
  setAttribute(name, value) { this.attributes[name] = value; },
  removeAttribute(name) { delete this.attributes[name]; },
  closest(selector) { return selector === '[data-ah-nav]' ? this : null; },
  focus() { focused = this; },
}));
const [work, research, blog] = links;
const pill = { style: {} };
const nav = {
  ...events(), dataset: {},
  querySelector: selector => selector === '.ah-nav-pill' ? pill : null,
  querySelectorAll: selector => selector === '[data-ah-nav]' ? links : [],
};
const document = {
  ...events(), body: { dataset: { view: 'home' } },
  querySelector: selector => selector === '.ah-segments' ? nav : null,
  fonts: { ready: new Promise(resolve => { fontsReady = resolve; }) },
};
const window = events();
const location = { href: 'http://localhost:4175/design-lab/creative.html?variant=AH&view=home' };
const source = await readFile(new URL('../public/design-lab/creative/ah-navigation.js', import.meta.url), 'utf8');
runInNewContext(source, {
  document, location, URL,
  addEventListener: window.addEventListener,
  requestAnimationFrame: callback => frames.push(callback),
  ResizeObserver: class {
    constructor(callback) { resize = callback; }
    observe(element) { observed = element; }
  },
}, { filename: 'ah-navigation.js' });

function selected(link, current = 'location') {
  assert.deepEqual(links.map(item => item.attributes['aria-current']),
    links.map(item => item === link ? current : undefined));
  assert.equal(pill.style.left, `${link.offsetLeft}px`);
  assert.equal(pill.style.width, `${link.offsetWidth}px`);
}
function click(target, overrides = {}) {
  const event = { target, button: 0, ...overrides };
  nav.emit('click', event);
}
function route(view, hash = '', type = 'prototype:view') {
  const url = new URL(location.href);
  url.searchParams.set('view', view);
  url.hash = hash;
  location.href = url.href;
  document.body.dataset.view = view;
  (type === 'prototype:view' ? document : window).emit(type);
}

selected(work);
assert.equal(observed, nav);
assert.equal(nav.dataset.ready, undefined);
frames.splice(0).forEach(callback => callback());
assert.equal(nav.dataset.ready, 'true');

const initialUrl = location.href;
click({ closest: () => research }); // A label or superscript inside the link.
selected(research);
assert.equal(location.href, initialUrl, 'click selection must not own routing');
for (const modifier of ['metaKey', 'ctrlKey', 'altKey', 'shiftKey']) {
  click(blog, { [modifier]: true });
  selected(research);
}
click(blog, { button: 1 });
selected(research);
click({ closest: () => null });
selected(research);
click(blog);
selected(blog, 'page');
assert.equal(location.href, initialUrl);

route('home', '#ah-research'); selected(research);
route('home', '#ah-work'); selected(work);
route('blog'); selected(blog, 'page');
route('article'); selected(blog, 'page');
route('home', '#ah-research', 'popstate'); selected(research);
route('home', '', 'popstate'); selected(work);
route('blog', '', 'popstate'); selected(blog, 'page');
route('home', '#ah-blog', 'hashchange'); selected(blog);

route('home', '#ah-research');
research.offsetLeft = 105;
research.offsetWidth = 128;
resize();
selected(research);
research.offsetLeft = 109;
research.offsetWidth = 132;
fontsReady();
await Promise.resolve();
selected(research);
research.offsetWidth = 137;
document.emit('prototype:language');
selected(research);

const routeBeforeFocus = location.href;
for (const [target, key, expected] of [
  [work, 'ArrowRight', research],
  [work, 'ArrowLeft', blog],
  [blog, 'Home', work],
  [work, 'End', blog],
]) {
  const event = {
    target, key, defaultPrevented: false, propagationStopped: false,
    preventDefault() { this.defaultPrevented = true; },
    stopPropagation() { this.propagationStopped = true; },
  };
  nav.emit('keydown', event);
  assert.equal(focused, expected);
  assert.equal(event.defaultPrevented, true, 'avoid the shell prototype shortcut');
  assert.equal(event.propagationStopped, true);
  selected(research);
  assert.equal(location.href, routeBeforeFocus, 'focus alone must not navigate');
}
const lastFocus = focused;
nav.emit('keydown', { target: work, key: 'ArrowRight', metaKey: true });
assert.equal(focused, lastFocus, 'modified keyboard shortcuts are untouched');

console.log('AH navigation checks passed: measured pill, routes, modifiers, remeasurement, and keyboard focus.');
