import { chromium } from 'playwright';
import { copyFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const outDir = path.join(root, 'motion-audit');
const auditUrl = process.env.AUDIT_URL ?? 'http://127.0.0.1:5173/';
await mkdir(outDir, { recursive: true });

let browser;
let context;
let mobileContext;

try {
  browser = await chromium.launch({ headless: true });
  context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: outDir,
      size: { width: 1440, height: 900 },
    },
  });

  const page = await context.newPage();
  await page.goto(auditUrl, { waitUntil: 'networkidle' });

  const captureSection = async (locator, filename, pause = 900) => {
    await locator.scrollIntoViewIfNeeded();
    await page.waitForTimeout(pause);
    await page.screenshot({
      path: path.join(outDir, filename),
      fullPage: false,
    });
  };

  await page.waitForTimeout(4800);

  const capabilitiesHeading = page.getByRole('heading', {
    name: /Agent cockpit/i,
  });
  await captureSection(
    capabilitiesHeading,
    'desktop-capabilities.png',
    1800,
  );

  await page.getByRole('button', { name: 'Train', exact: true }).click();
  await page.waitForTimeout(1400);
  await page.getByRole('button', { name: 'Deploy', exact: true }).click();
  await page.waitForTimeout(900);

  const controlHeading = page.getByRole('heading', {
    name: /Runtime state/i,
  });
  await controlHeading.scrollIntoViewIfNeeded();
  await page.waitForTimeout(350);
  await page.screenshot({
    path: path.join(outDir, 'desktop-control-tilted.png'),
    fullPage: false,
  });
  const controlTransformBefore = await page
    .locator('[data-agent-os-console]')
    .evaluate((element) => getComputedStyle(element).transform);
  await page.mouse.wheel(0, 360);
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(outDir, 'desktop-control-flat.png'),
    fullPage: false,
  });
  const controlTransformAfter = await page
    .locator('[data-agent-os-console]')
    .evaluate((element) => getComputedStyle(element).transform);
  await page.mouse.move(980, 540);
  await page.waitForTimeout(700);
  await page.mouse.move(1160, 660);
  await page.waitForTimeout(700);

  const workHeading = page.getByRole('heading', { name: /Cases from/i });
  await captureSection(workHeading, 'desktop-work.png', 1000);
  await page.getByRole('button', { name: /Next project/i }).click();
  await page.waitForTimeout(900);
  const caseButton = page.getByRole('button', { name: /Open case/i }).first();
  await caseButton.click();
  await page.waitForTimeout(1800);
  await page.getByRole('button', { name: /Close project details/i }).click();
  await page.waitForTimeout(700);

  const journalHeading = page.getByRole('heading', {
    name: /Field notes|Notes & articles/i,
  });
  await captureSection(journalHeading, 'desktop-journal.png', 900);

  const video = page.video();
  await context.close();
  context = undefined;

  const videoPath = await video.path();
  const finalPath = path.join(outDir, 'home-motion-audit.webm');
  await copyFile(videoPath, finalPath);

  mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto(auditUrl, {
    waitUntil: 'networkidle',
  });
  await mobilePage.waitForTimeout(1200);

  const mobileSections = [
    ['capabilities', /Agent cockpit/i],
    ['control', /Runtime state/i],
    ['work', /Cases from/i],
    ['journal', /Field notes|Notes & articles/i],
  ];

  for (const [name, heading] of mobileSections) {
    const target = mobilePage.getByRole('heading', { name: heading });
    await target.scrollIntoViewIfNeeded();
    await mobilePage.waitForTimeout(700);
    await mobilePage.screenshot({
      path: path.join(outDir, `mobile-${name}.png`),
      fullPage: false,
    });
  }

  await mobileContext.close();
  mobileContext = undefined;

  const files = await readdir(outDir);
  console.log(JSON.stringify({
    finalPath,
    controlTransformBefore,
    controlTransformAfter,
    files,
  }, null, 2));
} finally {
  await mobileContext?.close().catch(() => {});
  await context?.close().catch(() => {});
  await browser?.close().catch(() => {});
}
