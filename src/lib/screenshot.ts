import "server-only";
import type { Browser } from "puppeteer-core";

const VIEWPORT = { width: 1440, height: 900 };
// Giới hạn chiều cao ảnh để thumbnail không quá nặng (ảnh vẫn đủ dài cho hiệu ứng cuộn khi hover)
const MAX_HEIGHT = 5200;

async function launchBrowser(): Promise<Browser> {
  const puppeteer = await import("puppeteer-core");
  const localPath = process.env.CHROME_EXECUTABLE_PATH;
  if (localPath) {
    return puppeteer.launch({
      executablePath: localPath,
      headless: true,
      args: ["--no-sandbox", "--disable-dev-shm-usage"],
    });
  }
  const chromium = (await import("@sparticuz/chromium")).default;
  return puppeteer.launch({
    executablePath: await chromium.executablePath(),
    args: chromium.args,
    headless: true,
  });
}

/** Render HTML giao diện và chụp ảnh toàn trang (JPEG). */
export async function captureHtml(html: string): Promise<Buffer> {
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    await page.setViewport(VIEWPORT);
    // Font/ảnh bên ngoài tải chậm: hết thời gian chờ vẫn chụp phần đã render
    await page.setContent(html, { waitUntil: "load", timeout: 30_000 }).catch(() => {});
    await page.waitForNetworkIdle({ idleTime: 500, timeout: 10_000 }).catch(() => {});
    // Kích hoạt các hiệu ứng "hiện khi cuộn" (AOS, IntersectionObserver...) trước khi chụp
    await page.evaluate(async () => {
      const step = window.innerHeight;
      for (let y = 0; y < document.body.scrollHeight; y += step) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
    });
    await new Promise((r) => setTimeout(r, 600));

    const fullHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    const height = Math.min(Math.max(fullHeight, VIEWPORT.height), MAX_HEIGHT);
    const shot = await page.screenshot({
      type: "jpeg",
      quality: 72,
      clip: { x: 0, y: 0, width: VIEWPORT.width, height },
      captureBeyondViewport: true,
    });
    return Buffer.from(shot);
  } finally {
    await browser.close();
  }
}
