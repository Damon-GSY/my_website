import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = fileURLToPath(new URL('../', import.meta.url));
const lab = path.join(root, 'public/design-lab');
const read = name => readFile(path.join(lab, name), 'utf8');
const runtime = [
  'creative.html', 'creative-loader.js', 'shared.js', 'shared.css',
  'creative-reading.css', 'round-two.js', 'round-two.css',
  'blog-system.js', 'blog-system.css', 'prototype-cursor.js', 'prototype-cursor.css',
  'learning-guide.html', 'creative/ah.html', 'creative/ah.css', 'creative/ah.js',
  'creative/ah-reading.css', 'creative/ah-reading.js', 'creative/ah-navigation.js',
  'creative/ah-film.html', 'creative/ah-journey.mjs', 'creative/ah-site-motion.mjs',
  'creative/ah-bridge.mjs', 'storyboard-v3/tools-motion.mjs',
];
const fonts = [
  'fonts/manrope-latin.woff2', 'fonts/instrument-serif-latin.woff2',
  'fonts/instrument-serif-italic-latin.woff2',
];

// Check the published package, not the developer's original workspace: missing
// dynamically loaded modules or images otherwise silently trigger a fallback.
for (const name of [...runtime, ...fonts, 'cursor-lab-LICENSE.txt',
  'fonts/Manrope-OFL.txt', 'fonts/InstrumentSerif-OFL.txt']) {
  assert.ok((await stat(path.join(lab, name))).size > 0, `${name} is packaged`);
}
for (const name of ['public/favicon.svg', 'public/fonts/CartographCF-Regular.woff2']) {
  assert.ok((await stat(path.join(root, name))).size > 0, `${name} is available`);
}

let resourceChecks = 0;
for (const name of runtime) {
  const source = await read(name);
  const references = [
    ...(/\.html$/.test(name) ? source.matchAll(/\b(?:src|href)=["']([^"']+)["']/g) : []),
    ...source.matchAll(/\burl\(\s*["']?([^\s)'";]+)["']?\s*\)/g),
    ...source.matchAll(/\b(?:from\s*|import\(\s*)['"]([^'"]+)['"]/g),
  ].map(match => match[1]);
  for (const reference of references) {
    if (reference.includes('${') || /^(?:[a-z]+:|#|\?)/i.test(reference)) continue;
    const clean = reference.split(/[?#]/)[0];
    if (!/\.(?:css|js|mjs|html|png|woff2|svg)$/.test(clean)) continue;
    const target = clean.startsWith('/')
      ? path.join(root, 'public', clean)
      : path.resolve(lab, path.dirname(name), clean);
    assert.ok((await stat(target)).size > 0, `${name} resolves ${reference}`);
    resourceChecks++;
  }
  if (/\.(?:js|mjs)$/.test(name)) {
    execFileSync(process.execPath, ['--check', path.join(lab, name)], { stdio: 'pipe' });
  }
}
const film = await read('creative/ah-film.html');
const renderer = film.match(/<script\b[^>]*data-film-renderer[^>]*>([\s\S]*?)<\/script>/);
assert.ok(renderer, 'opening renderer remains extractable by ah.js');
new vm.Script(renderer[1], { filename: 'ah-film-renderer' });

const article = await read('learning-guide.html');
const articleImages = new Set([...article.matchAll(/<img[^>]+src="([^"]+)"/g)].map(match => match[1]));
assert.equal(articleImages.size, 4, 'all four learning-guide figures are in the article');
for (const image of articleImages) {
  assert.ok((await stat(path.join(root, 'public', image))).size > 0, `${image} is packaged`);
}

// Seven links intentionally leave AH for the existing site's English notes.
// Check against committed content so unpublished local additions cannot mask 404s.
const committedContent = execFileSync('git', ['show', 'HEAD:lib/content.ts'], { cwd: root, encoding: 'utf8' });
const publishedSlugs = new Set([...committedContent.matchAll(/slug:\s*'([^']+)'/g)].map(match => match[1]));
const blog = await read('blog-system.js');
const groupsSource = blog.match(/const groups=([\s\S]*?);\s*const styles=/);
assert.ok(groupsSource, 'Blog groups are available to check destinations');
const groups = vm.runInNewContext(`(${groupsSource[1]})`);
const baseNotes = groups.flatMap(group => group.notes.map(note => note[0])).filter(slug => slug !== 'how-to-learn');
assert.equal(baseNotes.length, 7);
for (const slug of baseNotes) assert.ok(publishedSlugs.has(slug), `/notes/${slug} exists in committed base content`);
for (const name of ['shared.js', 'creative/ah.html']) {
  for (const match of (await read(name)).matchAll(/(?:href=["']|href:\s*['"])(\/notes\/[^'"\s?#]+)/g)) {
    assert.ok(publishedSlugs.has(match[1].slice('/notes/'.length)), `${name}: ${match[1]} is supported`);
  }
}

// Execute the standalone loader without a browser. Both historical variant=AH
// links and the clean URL must load the same self-contained entry, not a manifest.
const loader = await read('creative-loader.js');
for (const query of ['?view=home', '?variant=AH&view=home']) {
  const requested = [];
  const body = { dataset: {}, append: element => { requested.push(element.src); element.onload(); } };
  const context = {
    URL, location: new URL(`http://localhost/design-lab/creative.html${query}`),
    document: {
      body, head: { append: element => requested.push(element.href) },
      createElement: () => ({}), querySelectorAll: () => [], addEventListener() {}, dispatchEvent() {},
    },
    fetch: async url => { requested.push(url); return { ok: true, text: () => read('creative/ah.html') }; },
    CustomEvent: class { constructor(type) { this.type = type; } },
  };
  await vm.runInNewContext(loader, context, { filename: 'creative-loader.js' });
  assert.deepEqual(requested, ['./creative/ah.css', './creative/ah.html', './shared.js', './creative/ah.js']);
  assert.equal(body.dataset.variant, 'creative-ah');
}

// A manifest or comparison destination would require unpublished prototype files.
for (const name of ['creative.html', 'creative-loader.js', 'shared.js']) {
  assert.doesNotMatch(await read(name), /creative-manifest|creative-index\.html|cycleVariant|visitVariant/,
    `${name} has no unpublished comparison dependency`);
}

console.log(`AH publication passed: ${runtime.length} runtime files, ${resourceChecks} resource references, 4 article images, 7 base-site notes, standalone loader with and without variant=AH.`);
