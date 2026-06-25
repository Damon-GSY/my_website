// Full-page motion capture: Playwright records the running site while
// auto-scrolling so every whileInView animation fires, then we hand the
// webm to ffmpeg for a gif/mp4 + a frame sequence we can inspect frame-by-frame.
//
// Run from project root so `require('playwright')` resolves:
//   node tools/record.cjs [url] [outDir]
const { chromium } = require('playwright');

const URL = process.argv[2] || 'http://localhost:3000/';
const OUT = process.argv[3] || './tools/out';

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-features=CalculateNativeWinOcclusion',
      '--force-prefers-reduced-motion=false',
    ],
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    recordVideo: { dir: OUT, size: { width: 1440, height: 900 } },
    reducedMotion: 'no-preference',
  });
  const page = await context.newPage();

  console.log('navigating', URL);
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(1500); // fonts + first paint

  const height = await page.evaluate(() => document.body.scrollHeight);
  console.log('doc height', height);

  // smooth top -> bottom over ~9s so animations play out on screen
  await page.evaluate(async (h) => {
    const start = performance.now();
    const dur = 9000;
    return new Promise((resolve) => {
      function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        window.scrollTo(0, Math.round(eased * (h - 900)));
        if (p < 1) requestAnimationFrame(tick);
        else resolve();
      }
      requestAnimationFrame(tick);
    });
  }, height);

  await page.waitForTimeout(1200);
  // bottom -> top
  await page.evaluate(async () => {
    const start = performance.now();
    const dur = 5000;
    const startY = window.scrollY;
    return new Promise((resolve) => {
      function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        window.scrollTo(0, Math.round(startY * (1 - eased)));
        if (p < 1) requestAnimationFrame(tick);
        else resolve();
      }
      requestAnimationFrame(tick);
    });
  });

  await page.waitForTimeout(1000);
  await page.close();
  await context.close();

  // video() may be gone after close; re-derive from OUT
  const fs = require('fs');
  const webm = fs
    .readdirSync(OUT)
    .filter((f) => f.endsWith('.webm'))
    .map((f) => `${OUT}/${f}`)
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)[0];
  console.log('WEBM', webm);
  await browser.close();
})();
