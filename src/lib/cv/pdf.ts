/**
 * HTML → PDF via headless Chromium.
 *
 * Production (Vercel / Lambda): @sparticuz/chromium supplies a Linux Chromium
 * binary that fits in the serverless bundle. Local dev: we point puppeteer-core
 * at the system Chrome/Chromium/Edge so `npm run dev` works with no extra setup.
 * Override either with the CV_CHROME_PATH env var.
 */

import { existsSync } from "node:fs";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

const isServerless = Boolean(
  process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_VERSION ||
    process.env.AWS_EXECUTION_ENV
);

const LOCAL_CANDIDATES = [
  process.env.CV_CHROME_PATH,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/usr/bin/chromium-browser",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
].filter((p): p is string => Boolean(p));

function localChrome(): string | null {
  for (const p of LOCAL_CANDIDATES) {
    try {
      if (existsSync(p)) return p;
    } catch {
      /* ignore */
    }
  }
  return null;
}

export async function htmlToPdf(html: string): Promise<Buffer> {
  const local = isServerless ? null : localChrome();

  let browser;
  if (local) {
    browser = await puppeteer.launch({
      headless: true,
      executablePath: local,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  } else {
    // PDF-only: disable the graphics/webgl stack to save memory on Lambda.
    chromium.setGraphicsMode = false;
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: "shell",
    });
  }

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load", timeout: 25000 });
    // Wait for any web fonts declared in the document to finish loading.
    try {
      await page.evaluate(async () => {
        await (document as Document).fonts.ready;
      });
    } catch {
      /* fonts.ready unsupported — fall through */
    }
    const pdf = await page.pdf({
      printBackground: true,
      preferCSSPageSize: true,
      format: "A4",
      margin: { top: "0", right: "0", bottom: "0", left: "0" },
    });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
