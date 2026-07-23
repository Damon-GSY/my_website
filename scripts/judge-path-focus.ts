import { chromium } from "playwright";
import sharp from "sharp";

const url = process.env.JUDGE_URL ?? "http://127.0.0.1:4175/";
const chapterOverride = process.env.JUDGE_CHAPTER_CSS;
const viewport = { width: 1333, height: 1453 };
const scrollPositions = process.env.JUDGE_SCROLL_Y
  ? [Number(process.env.JUDGE_SCROLL_Y)]
  : [700, 1_250, 1_800];

const findWarmFocus = async (screenshot: Buffer) => {
  const { data, info } = await sharp(screenshot)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const focusBand = {
    left: Math.round(info.width * 0.45),
    right: Math.round(info.width * 0.82),
    top: Math.round(info.height * 0.42),
    bottom: Math.round(info.height * 0.72),
  };
  let focus = { score: 0, x: 0, y: 0 };

  for (let y = focusBand.top; y < focusBand.bottom; y += 1) {
    for (let x = focusBand.left; x < focusBand.right; x += 1) {
      const offset = (y * info.width + x) * info.channels;
      const red = data[offset];
      const green = data[offset + 1];
      const blue = data[offset + 2];
      const warm =
        red > 80 &&
        red > green * 1.12 &&
        green > blue * 1.08;
      const score = warm ? red + green + blue : 0;

      if (score > focus.score) {
        focus = { score, x, y };
      }
    }
  }

  return focus;
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport,
  deviceScaleFactor: 1,
  reducedMotion: "no-preference",
});

try {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.locator(".hero__journey").first().waitFor({ state: "attached" });
  if (chapterOverride) {
    await page.addStyleTag({ content: chapterOverride });
  }
  const results: string[] = [];

  for (const scrollY of scrollPositions) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), scrollY);
    await page.waitForTimeout(1_400);

    const activeChapter = await page.locator(".hero__journey").evaluateAll((chapters) => {
      return chapters
        .map((chapter) => {
          const rect = chapter.getBoundingClientRect();
          return {
            className: chapter.className,
            opacity: Number.parseFloat(getComputedStyle(chapter).opacity),
            rect: {
              x: rect.x,
              y: rect.y,
              width: rect.width,
              height: rect.height,
            },
          };
        })
        .sort((a, b) => b.opacity - a.opacity)[0];
    });

    if (!activeChapter || activeChapter.opacity < 0.9) {
      throw new Error(
        `Path-focus judge could not find a fully visible chapter at scrollY=${scrollY}; max opacity was ${activeChapter?.opacity ?? "missing"}.`,
      );
    }

    const hideOverlays = await page.addStyleTag({
      content: `
        .hero__copy,
        .hero__journey,
        .hero__hud,
        .site-header,
        .hero__scroll-cue {
          visibility: hidden !important;
        }
      `,
    });
    const screenshot = await page.screenshot({ type: "png" });
    await hideOverlays.evaluate((style) => style.remove());
    const focus = await findWarmFocus(screenshot);

    if (focus.score === 0) {
      throw new Error("Path-focus judge could not locate the warm optimization path.");
    }

    const rect = activeChapter.rect;
    const focusCovered =
      focus.x >= rect.x &&
      focus.x <= rect.x + rect.width &&
      focus.y >= rect.y &&
      focus.y <= rect.y + rect.height;

    if (focusCovered) {
      throw new Error(
        [
          "Path-focus judge: FAIL",
          `warm focus (${focus.x}, ${focus.y}) is covered by`,
          `${activeChapter.className} at`,
          `(${Math.round(rect.x)}, ${Math.round(rect.y)},`,
          `${Math.round(rect.width)}×${Math.round(rect.height)}).`,
        ].join(" "),
      );
    }

    results.push(
      `${activeChapter.className.replace("hero__journey hero__journey--", "")} (${focus.x}, ${focus.y})`,
    );
  }

  console.log(`Path-focus judge: PASS · ${results.join(" · ")}`);
} finally {
  await browser.close();
}
