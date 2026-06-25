const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--disable-background-timer-throttling'] });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'no-preference' });
  const page = await ctx.newPage();
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const probe = async (label) => {
    await page.waitForTimeout(1000);
    const r = await page.evaluate(() => {
      const el = document.querySelector('.fixed.bottom-4.right-4, [class*="fixed"][class*="bottom-4"][class*="right-4"]');
      const zones = Array.from(document.querySelectorAll('[data-hide-launcher]')).map((e) => e.tagName + (e.id ? '#' + e.id : ''));
      if (!el) return { found: false, zones };
      const s = getComputedStyle(el);
      return {
        found: true,
        opacity: parseFloat(s.opacity).toFixed(3),
        pointerEvents: s.pointerEvents,
        ariaHidden: el.getAttribute('aria-hidden'),
        btnText: (el.innerText || '').replace(/\s+/g, ' ').slice(0, 32),
        zones,
      };
    });
    console.log(label, JSON.stringify(r));
  };
  await probe('TOP    ');
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight }));
  await probe('BOTTOM ');
  await browser.close();
})();
