import { chromium } from "playwright";
import sharp from "sharp";

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type WarmFocus = {
  bounds: Rect;
  centroid: { x: number; y: number };
  pixelCount: number;
  strength: number;
};

const url = process.env.JUDGE_URL ?? "http://127.0.0.1:4175/";
const headed = process.env.JUDGE_HEADED === "1";
const stageProgress = [
  { name: "production", progress: 0.31 },
  { name: "research", progress: 0.58 },
  { name: "creator", progress: 0.82 },
] as const;
const viewportCases = [
  {
    name: "tall-desktop",
    viewport: { width: 1333, height: 1453 },
    dynamicScene: true,
  },
  {
    name: "laptop",
    viewport: { width: 1280, height: 900 },
    dynamicScene: true,
  },
  {
    name: "mobile",
    viewport: { width: 390, height: 844 },
    dynamicScene: false,
    hasTouch: true,
    isMobile: true,
  },
] as const;

const overlaps = (left: Rect, right: Rect) => {
  return !(
    left.x + left.width <= right.x ||
    right.x + right.width <= left.x ||
    left.y + left.height <= right.y ||
    right.y + right.height <= left.y
  );
};

const findWarmFocus = async (
  screenshot: Buffer,
  subtlePath: boolean,
): Promise<WarmFocus> => {
  const { data, info } = await sharp(screenshot)
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const mask = new Uint8Array(width * height);
  const energy = new Uint16Array(width * height);
  const integral = new Float64Array((width + 1) * (height + 1));
  const band = {
    left: Math.round(width * 0.34),
    right: Math.round(width * 0.94),
    top: Math.round(height * 0.2),
    bottom: Math.round(height * 0.78),
  };

  for (let y = band.top; y < band.bottom; y += 1) {
    let rowEnergy = 0;

    for (let x = band.left; x < band.right; x += 1) {
      const pixel = y * width + x;
      const offset = pixel * channels;
      const red = data[offset];
      const green = data[offset + 1];
      const blue = data[offset + 2];
      const warm = subtlePath
        ? red > 70 &&
          red > green * 1.05 &&
          green > blue * 1.02 &&
          red + green + blue > 220
        : red > 120 &&
          red >= green * 0.98 &&
          green > blue * 1.03 &&
          red + green + blue > 400;
      const value = warm
        ? red + green + blue - (subtlePath ? 190 : 300)
        : 0;
      mask[pixel] = warm ? 1 : 0;
      energy[pixel] = value;
      rowEnergy += value;
      integral[(y + 1) * (width + 1) + x + 1] =
        integral[y * (width + 1) + x + 1] + rowEnergy;
    }
  }

  const windowSize = Math.max(35, Math.round(Math.min(width, height) * 0.055));
  let peakWindow = { energy: 0, x: 0, y: 0 };

  for (let top = band.top; top <= band.bottom - windowSize; top += 4) {
    for (let left = band.left; left <= band.right - windowSize; left += 4) {
      const right = left + windowSize;
      const bottom = top + windowSize;
      const windowEnergy =
        integral[bottom * (width + 1) + right] -
        integral[top * (width + 1) + right] -
        integral[bottom * (width + 1) + left] +
        integral[top * (width + 1) + left];

      if (windowEnergy > peakWindow.energy) {
        peakWindow = {
          energy: windowEnergy,
          x: left + windowSize / 2,
          y: top + windowSize / 2,
        };
      }
    }
  }

  const searchRadius = Math.round(windowSize * 0.9);
  let seed = { energy: 0, x: 0, y: 0 };

  for (let y = Math.max(band.top, Math.round(peakWindow.y - searchRadius)); y <= Math.min(band.bottom - 1, Math.round(peakWindow.y + searchRadius)); y += 1) {
    for (let x = Math.max(band.left, Math.round(peakWindow.x - searchRadius)); x <= Math.min(band.right - 1, Math.round(peakWindow.x + searchRadius)); x += 1) {
      const value = energy[y * width + x];
      if (value > seed.energy) seed = { energy: value, x, y };
    }
  }

  if (seed.energy === 0) {
    throw new Error("Path-focus judge could not locate a bright warm path region.");
  }

  const visited = new Uint8Array(width * height);
  const queue: number[] = [seed.y * width + seed.x];
  visited[queue[0]] = 1;
  const componentRadius = Math.max(54, Math.round(windowSize * 1.65));
  let cursor = 0;
  let pixelCount = 0;

  while (cursor < queue.length) {
    const pixel = queue[cursor];
    cursor += 1;
    const x = pixel % width;
    const y = Math.floor(pixel / width);
    pixelCount += 1;

    for (let offsetY = -1; offsetY <= 1; offsetY += 1) {
      for (let offsetX = -1; offsetX <= 1; offsetX += 1) {
        if (offsetX === 0 && offsetY === 0) continue;
        const nextX = x + offsetX;
        const nextY = y + offsetY;
        if (
          nextX < band.left ||
          nextX >= band.right ||
          nextY < band.top ||
          nextY >= band.bottom ||
          Math.hypot(nextX - seed.x, nextY - seed.y) > componentRadius
        ) {
          continue;
        }
        const next = nextY * width + nextX;
        if (visited[next] || !mask[next]) continue;
        visited[next] = 1;
        queue.push(next);
      }
    }
  }

  const strength = peakWindow.energy / (windowSize * windowSize);
  if (pixelCount < 12 || strength < 1.5) {
    throw new Error(
      `Path-focus judge found a weak focal region (${pixelCount} pixels, strength ${strength.toFixed(2)}).`,
    );
  }

  const clearance = Math.max(18, Math.round(Math.min(width, height) * 0.022));
  const focusRadius = Math.round(windowSize / 2) + clearance;
  return {
    bounds: {
      x: Math.round(peakWindow.x) - focusRadius,
      y: Math.round(peakWindow.y) - focusRadius,
      width: focusRadius * 2,
      height: focusRadius * 2,
    },
    centroid: {
      x: Math.round(peakWindow.x),
      y: Math.round(peakWindow.y),
    },
    pixelCount,
    strength,
  };
};

const browser = await chromium.launch({
  headless: !headed,
  args: headed
    ? []
    : ["--enable-webgl", "--ignore-gpu-blocklist", "--use-angle=swiftshader"],
});
const results: string[] = [];
const targetUrl = new URL(url);
if (!headed) targetUrl.searchParams.set("software-rendering", "1");

try {
  for (const viewportCase of viewportCases) {
    const page = await browser.newPage({
      viewport: viewportCase.viewport,
      deviceScaleFactor: 1,
      reducedMotion: "no-preference",
      hasTouch: viewportCase.hasTouch ?? false,
      isMobile: viewportCase.isMobile ?? false,
    });
    const runtimeErrors: string[] = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));

    try {
      await page.goto(targetUrl.toString(), { waitUntil: "domcontentloaded" });
      await page.locator(".hero__journey").first().waitFor({ state: "attached" });
      await page.waitForLoadState("load");
      await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });

      if (viewportCase.dynamicScene) {
        await page
          .locator(".hero__scene-fallback--loading.is-ready")
          .waitFor({ state: "attached", timeout: 20_000 });
        const canvasSize = await page.locator(".hero__scene canvas").evaluate((canvas) => ({
          width: (canvas as HTMLCanvasElement).width,
          height: (canvas as HTMLCanvasElement).height,
        }));
        if (
          canvasSize.width < viewportCase.viewport.width ||
          canvasSize.height < viewportCase.viewport.height
        ) {
          throw new Error(
            `Path-focus judge requires the live 3D canvas at ${viewportCase.name}; received ${canvasSize.width}×${canvasSize.height}.`,
          );
        }
      }

      const heroTravel = await page.locator(".hero").evaluate((hero) => {
        return Math.max(0, hero.getBoundingClientRect().height - window.innerHeight);
      });

      for (const stage of stageProgress) {
        const scrollY = Math.round(heroTravel * stage.progress);
        const currentScrollY = await page.evaluate(() => window.scrollY);
        await page.mouse.move(
          Math.round(viewportCase.viewport.width / 2),
          Math.round(viewportCase.viewport.height / 2),
        );
        await page.mouse.wheel(0, scrollY - currentScrollY);
        await page.waitForFunction(
          (className) => {
            const chapter = document.querySelector(`.${className}`);
            return chapter && Number.parseFloat(getComputedStyle(chapter).opacity) >= 0.9;
          },
          `hero__journey--${stage.name}`,
          { timeout: 5_000 },
        );

        const activeChapter = await page.locator(".hero__journey").evaluateAll((chapters) => {
          return chapters
            .map((chapter) => {
              const rect = chapter.getBoundingClientRect();
              const childRects = Array.from(
                chapter.querySelectorAll(":scope > span, :scope > strong, :scope > p, :scope > div, :scope > small"),
              ).map((child) => {
                const childRect = child.getBoundingClientRect();
                return {
                  x: childRect.x,
                  y: childRect.y,
                  width: childRect.width,
                  height: childRect.height,
                };
              });
              return {
                className: chapter.className,
                opacity: Number.parseFloat(getComputedStyle(chapter).opacity),
                rect: {
                  x: rect.x,
                  y: rect.y,
                  width: rect.width,
                  height: rect.height,
                },
                childRects,
              };
            })
            .sort((a, b) => b.opacity - a.opacity)[0];
        });

        if (!activeChapter || activeChapter.opacity < 0.9) {
          throw new Error(
            `Path-focus judge could not find a fully visible ${stage.name} chapter at ${viewportCase.name} (hero travel ${Math.round(heroTravel)}px, scroll ${scrollY}px, actual ${await page.evaluate(() => Math.round(window.scrollY))}px); strongest was ${activeChapter?.className ?? "none"} at ${activeChapter?.opacity ?? 0}.`,
          );
        }
        if (!activeChapter.className.includes(`hero__journey--${stage.name}`)) {
          throw new Error(
            `Path-focus judge expected ${stage.name} at ${viewportCase.name}, but ${activeChapter.className} was dominant.`,
          );
        }

        let focus: WarmFocus;
        try {
          if (viewportCase.dynamicScene) {
            const canvas = page.locator(".hero__scene canvas");
            const canvasBox = await canvas.boundingBox();
            if (!canvasBox) {
              throw new Error("the live 3D canvas has no visible bounds");
            }
            focus = await findWarmFocus(await canvas.screenshot({ type: "png" }), false);
            focus.bounds.x += canvasBox.x;
            focus.bounds.y += canvasBox.y;
            focus.centroid.x += Math.round(canvasBox.x);
            focus.centroid.y += Math.round(canvasBox.y);
          } else {
            focus = await findWarmFocus(await page.screenshot({ type: "png" }), true);
          }
        } catch (error) {
          throw new Error(
            `${viewportCase.name}/${stage.name}: ${error instanceof Error ? error.message : String(error)}`,
          );
        }
        const collision = activeChapter.childRects.find((rect) =>
          overlaps(focus.bounds, rect),
        );

        if (collision) {
          throw new Error(
            [
              "Path-focus judge: FAIL",
              `${viewportCase.name}/${stage.name}`,
              `focus (${focus.centroid.x}, ${focus.centroid.y})`,
              `overlaps chapter content at`,
              `(${Math.round(collision.x)}, ${Math.round(collision.y)},`,
              `${Math.round(collision.width)}×${Math.round(collision.height)}).`,
            ].join(" "),
          );
        }

        results.push(
          `${viewportCase.name}/${stage.name} ${focus.pixelCount}px @ ${focus.strength.toFixed(1)}`,
        );
      }

      if (runtimeErrors.length > 0) {
        throw new Error(
          `Path-focus judge saw runtime errors at ${viewportCase.name}: ${runtimeErrors.join(" | ")}`,
        );
      }
    } finally {
      await page.close();
    }
  }

  console.log(`Path-focus judge: PASS · ${results.join(" · ")}`);
} finally {
  await browser.close();
}
