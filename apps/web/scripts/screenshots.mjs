// Full-page screenshots of a dev page at mobile and desktop widths.
// Usage: pnpm --filter @repo/web screenshots [path=/dev/ui] [baseUrl=http://localhost:3000] [--sections]
// --click=<button name> clicks the first visible button with that accessible name, then saves the viewport
//   as <name>-<width>-click.png (e.g. --click=Фильтры to see the mobile filter sheet).
// --sections also saves every <section> separately (<name>-<width>-<id>.png) — easier to inspect.
// Requires a running `pnpm dev`. Output: apps/web/.screenshots/<name>-<width>.png
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const args = process.argv.slice(2);
const sections = args.includes("--sections");
const click = args.find((a) => a.startsWith("--click="))?.slice("--click=".length);
const [path = "/dev/ui", baseUrl = "http://localhost:3000"] = args.filter(
  (a) => !a.startsWith("--"),
);
const outDir = join(import.meta.dirname, "..", ".screenshots");
const name = path.replace(/^\/|\/$/g, "").replaceAll("/", "-") || "home";
const widths = [375, 1280];

await mkdir(outDir, { recursive: true });
const browser = await chromium.launch();
const problems = [];
try {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    page.on("console", (m) => {
      if (m.type() === "error") problems.push(`[${width}] console: ${m.text()}`);
    });
    page.on("pageerror", (e) => problems.push(`[${width}] pageerror: ${e.message}`));
    const res = await page.goto(baseUrl + path, { waitUntil: "networkidle" });
    if (!res?.ok()) throw new Error(`${path} → HTTP ${res?.status()}`);
    await page.evaluate(() => document.fonts.ready);
    // Horizontal page scroll is a mobile-first bug.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    if (overflow > 0) problems.push(`[${width}] horizontal overflow: ${overflow}px`);
    const file = join(outDir, `${name}-${width}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.info(file);
    if (click) {
      // Prefix match: accessible names may carry extra text ("Фильтры 3 активно").
      const escaped = click.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const target = page
        .getByRole("button", { name: new RegExp(`^${escaped}`) })
        .filter({ visible: true })
        .first();
      if ((await target.count()) > 0) {
        await target.scrollIntoViewIfNeeded();
        await target.click();
        await page.waitForTimeout(300);
        await page.screenshot({ path: join(outDir, `${name}-${width}-click.png`) });
        await page.keyboard.press("Escape");
      } else {
        console.info(`[${width}] no visible button "${click}"`);
      }
    }
    if (sections) {
      for (const el of await page.locator("main > section").all()) {
        const id = (await el.getAttribute("aria-labelledby")) ?? "section";
        await el.screenshot({ path: join(outDir, `${name}-${width}-${id}.png`) });
      }
    }
    await page.close();
  }
} finally {
  await browser.close();
}
if (problems.length > 0) {
  console.error(problems.join("\n"));
  process.exitCode = 1;
}
