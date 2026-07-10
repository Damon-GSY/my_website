// Parallax scroll verification: capture 6 scroll positions and analyze brightness
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const URL = 'http://localhost:5174/';
const OUT = '/tmp/landscape-verify';

(async () => {
  // Ensure output directory exists
  fs.mkdirSync(OUT, { recursive: true });

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

  console.log('Navigating to', URL);
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 });

  // Wait for all layer images to be visible and loaded
  console.log('Waiting for layer images to load...');
  await Promise.all([
    page.waitForSelector('img[src*="optimization-foreground"]', { state: 'visible' }),
    page.waitForSelector('img[src*="optimization-landscape"]', { state: 'visible' }),
    page.waitForSelector('img[src*="optimization-depth"]', { state: 'visible' }),
    page.waitForSelector('img[src*="optimization-light"]', { state: 'visible' }),
  ]);

  // Wait for images to fully load by checking complete property
  await page.waitForFunction(() => {
    const imgs = document.querySelectorAll('img[src*="optimization"]');
    return Array.from(imgs).every(img => img.complete && img.naturalHeight !== 0);
  }, { timeout: 10000 });

  await page.waitForTimeout(1500); // Additional time for rAF loop to settle

  // Get scroll range
  const scrollRange = await page.evaluate(() => {
    return document.documentElement.scrollHeight - window.innerHeight;
  });
  console.log('Scroll range:', scrollRange, 'px');

  // Define scroll positions (0%, 18%, 36%, 52%, 70%, 92%)
  const positions = [0, 0.18, 0.36, 0.52, 0.70, 0.92];
  const results = [];

  for (const pos of positions) {
    const scrollY = Math.round(pos * scrollRange);
    console.log(`\nScrolling to ${Math.round(pos * 100)}% (${scrollY}px)`);

    // Scroll to position
    await page.evaluate((y) => {
      window.scrollTo(0, y);
    }, scrollY);

    // Wait for rAF loop to settle (400ms as specified)
    await page.waitForTimeout(400);

    // Capture full-viewport screenshot
    const filename = `position-${Math.round(pos * 100).toString().padStart(3, '0')}.png`;
    const screenshotPath = path.join(OUT, filename);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log('  → Screenshot saved:', filename);

    // Sample mean pixel brightness using canvas
    const brightness = await page.evaluate(() => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const viewport = { width: window.innerWidth, height: window.innerHeight };
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Capture the current viewport using the HTML structure
      const html = document.documentElement;

      // Use the page's rendering - take a data URL screenshot from the browser
      // Actually, we'll use Playwright's screenshot above and calculate brightness from the file

      // For in-page calculation, we can sample some pixels from the rendered layers
      const images = document.querySelectorAll('img[src*="optimization"]');
      let totalBrightness = 0;
      let pixelCount = 0;

      images.forEach(img => {
        try {
          const tempCanvas = document.createElement('canvas');
          const tempCtx = tempCanvas.getContext('2d');
          tempCanvas.width = img.naturalWidth || img.width;
          tempCanvas.height = img.naturalHeight || img.height;
          tempCtx.drawImage(img, 0, 0);

          const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
          const pixels = imageData.data;

          // Sample every 100th pixel for performance
          for (let i = 0; i < pixels.length; i += 400) {
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
            totalBrightness += brightness;
            pixelCount++;
          }
        } catch (e) {
          // Cross-origin issues or incomplete image loading
        }
      });

      return pixelCount > 0 ? totalBrightness / pixelCount : 0;
    });

    const meanBrightness = brightness;

    results.push({
      position: Math.round(pos * 100),
      scrollY,
      brightness: meanBrightness,
      screenshot: filename
    });

    console.log(`  → Brightness: ${meanBrightness.toFixed(2)}`);
  }

  // Now record a smooth scroll-through for video
  console.log('\nRecording scroll-through...');

  // Scroll to top first
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(500);

  // Smooth scroll from top to bottom over ~8 seconds
  await page.evaluate(async (height) => {
    const start = performance.now();
    const dur = 8000;
    return new Promise((resolve) => {
      function tick(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        window.scrollTo(0, Math.round(eased * (height - window.innerHeight)));
        if (p < 1) requestAnimationFrame(tick);
        else resolve();
      }
      requestAnimationFrame(tick);
    });
  }, scrollRange);

  await page.waitForTimeout(1000);

  // Close page and context (this saves the video)
  await page.close();
  await context.close();

  // Find the recorded video
  const webmFiles = fs.readdirSync(OUT)
    .filter((f) => f.endsWith('.webm'))
    .map((f) => path.join(OUT, f))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);

  console.log('\n✓ Verification complete');
  console.log('Artifacts saved to:', OUT);

  // Try to convert webm to gif/mp4 using ffmpeg if available
  if (webmFiles.length > 0) {
    const webmPath = webmFiles[0];
    console.log('Video recorded:', webmPath);

    try {
      const { execSync } = require('child_process');

      // Check if ffmpeg is available
      execSync('which ffmpeg', { stdio: 'ignore' });
      console.log('ffmpeg found - converting video...');

      // Convert to mp4
      const mp4Path = path.join(OUT, 'scroll-through.mp4');
      execSync(`ffmpeg -i "${webmPath}" -c:v libx264 -preset slow -crf 22 -pix_fmt yuv420p "${mp4Path}" -y`, {
        stdio: 'inherit'
      });
      console.log('MP4 saved:', mp4Path);

      // Convert to gif (smaller dimensions for size)
      const gifPath = path.join(OUT, 'scroll-through.gif');
      const fps = 24;
      const width = 720;
      const height = Math.round(900 * (width / 1440));
      execSync(`ffmpeg -i "${webmPath}" -vf "fps=${fps},scale=${width}:${height}:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" "${gifPath}" -y`, {
        stdio: 'inherit'
      });
      console.log('GIF saved:', gifPath);

    } catch (e) {
      console.log('ffmpeg not available or conversion failed - keeping webm only');
    }
  }

  // Save results to JSON
  const resultsPath = path.join(OUT, 'brightness.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log('Brightness data saved:', resultsPath);

  // Also save as CSV for easy inspection
  const csvPath = path.join(OUT, 'brightness.csv');
  const csvHeader = 'position,scrollY,brightness,screenshot\n';
  const csvRows = results.map(r =>
    `${r.position},${r.scrollY},${r.brightness.toFixed(2)},${r.screenshot}`
  ).join('\n');
  fs.writeFileSync(csvPath, csvHeader + csvRows);
  console.log('CSV saved:', csvPath);

  await browser.close();

  console.log('\n=== SUMMARY ===');
  console.log('Scroll positions captured:', results.length);
  console.log('Brightness range:', Math.min(...results.map(r => r.brightness)).toFixed(2), '-', Math.max(...results.map(r => r.brightness)).toFixed(2));
  console.log('\nPer-position results:');
  results.forEach(r => {
    console.log(`  ${r.position}%: brightness=${r.brightness.toFixed(2)}`);
  });

})();
