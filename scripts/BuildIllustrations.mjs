// Saves the section illustrations as transparent PNGs.
//
// Usage (from the project root): node scripts/BuildIllustrations.mjs
//
// Opens docs/cover-studies/illustrations/Illustrations.html?n=<name> for each picture below and saves the 240x150
// canvas at 3x (720x450) as docs/cover-studies/illustrations/<name>.png. The drawings are seeded, so every run gives
// the same pictures. Run it only after changing Illustrations.html, then commit the PNGs.
// scripts/BuildSite.py only copies the results; it never runs this script.
//
// Needs Playwright with its Chromium (npx playwright install chromium); it is not a project dependency.
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ILLUSTRATIONS_DIR = join(ROOT, 'docs', 'cover-studies', 'illustrations');
const SOURCE_PAGE = join(ILLUSTRATIONS_DIR, 'Illustrations.html');

// docs/SectionsSpec.md 3: ceremony, directions, gift, RSVP (top) and RSVP (bottom).
const NAMES = ['arch', 'greenhouse', 'envelope', 'reply-card', 'chairs'];

const CANVAS_WIDTH = 240;
const CANVAS_HEIGHT = 150;
const SCALE = 3;

const loadPlaywright = async () => {
  try {
    return await import('playwright');
  } catch {
    // A global install (found through NODE_PATH) is visible to require but not to import.
  }

  try {
    return createRequire(import.meta.url)('playwright');
  } catch {
    console.error('BuildIllustrations needs Playwright: npm install --no-save playwright && npx playwright install chromium');
    process.exit(1);
  }
};

const { chromium } = await loadPlaywright();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: CANVAS_WIDTH, height: CANVAS_HEIGHT }, deviceScaleFactor: SCALE });

for (const name of NAMES) {
  const url = new URL(pathToFileURL(SOURCE_PAGE));
  url.searchParams.set('n', name);
  await page.goto(url.href);
  await page.waitForSelector('html[data-ready="true"]');

  const target = join(ILLUSTRATIONS_DIR, `${name}.png`);
  await page.screenshot({ path: target, omitBackground: true });
  console.log(`illustrations/${name}.png`);
}

await browser.close();
