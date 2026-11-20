// Builds the favicon PNGs and the link-preview card from the greenhouse drawing.
//
// Usage (from the project root): node scripts/BuildShareImages.mjs [--layout=bare|text] [--out=<dir>]
//
// Rewrites docs/cover-studies/share/favicon-32.png, apple-touch-icon.png and og-image.png:
// - favicon-32.png and apple-touch-icon.png are favicon.svg (hand-written, the source of truth) rendered by Chrome;
//   the touch icon sits on the paper color with a margin, since iOS fills transparent icons with black.
// - og-image.png (1200x630) is the cover's own finished greenhouse canvas (GreenhouseCover.html, seeded, so the same
//   picture every run), laid out on ShareCard.html. --layout=text adds the title, names and date beside it.
// --out writes the three files to another folder instead (for comparing layouts without touching the committed ones).
//
// Needs Google Chrome and Node 22+ (global fetch and WebSocket); no npm packages. Chrome defaults to the macOS app;
// set CHROME_PATH to use another binary. The card's web fonts come from Google Fonts, so run it online.
// scripts/BuildSite.py only copies the results; it never runs this script.
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SHARE_DIR = join(ROOT, 'docs', 'cover-studies', 'share');
const COVER_PAGE = join(ROOT, 'docs', 'cover-studies', 'GreenhouseCover.html');
const CARD_PAGE = join(SHARE_DIR, 'ShareCard.html');
const FAVICON_SVG = join(SHARE_DIR, 'favicon.svg');
const CHROME_PATH = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

// The cover is laid out for a phone; its greenhouse canvas is then 350px wide, as guests see it.
const COVER_WIDTH = 390;
const COVER_HEIGHT = 844;
// Draws the cover canvas this many times sharper than CSS pixels, so the card only ever scales it down.
const COVER_SCALE = 4;
const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;
const LAYOUTS = ['bare', 'text'];
const DEFAULT_LAYOUT = 'bare';
const FAVICON_SIZE = 32;
const TOUCH_ICON_SIZE = 180;
// Paper margin around the greenhouse on the touch icon, as a share of its side.
const TOUCH_ICON_MARGIN = 0.12;
const PAPER = '#fbfbf8';
const STARTUP_TRIES = 60;
const POLL_MS = 200;
const COVER_DONE_TIMEOUT_MS = 20000;

const sleep = (ms) => {
  return new Promise((resolveSleep) => {
    setTimeout(resolveSleep, ms);
  });
};

const readOption = (name, fallback) => {
  const prefix = `--${name}=`;
  const argument = process.argv.slice(2).find((value) => value.startsWith(prefix));

  return argument ? argument.slice(prefix.length) : fallback;
};

const launchChrome = async () => {
  const port = 9400 + Math.floor(Math.random() * 500);
  const profile = mkdtempSync(join(tmpdir(), 'share-images-'));
  // Software rendering only: GPU canvases antialias differently from run to run, so the PNGs would churn.
  const chrome = spawn(
    CHROME_PATH,
    [
      '--headless=new',
      `--remote-debugging-port=${port}`,
      `--user-data-dir=${profile}`,
      '--no-first-run',
      '--hide-scrollbars',
      '--allow-file-access-from-files',
      '--disable-gpu',
      '--disable-accelerated-2d-canvas',
      'about:blank',
    ],
    { stdio: 'ignore' },
  );

  chrome.on('error', (error) => {
    console.error(`BuildShareImages failed: cannot start Chrome at ${CHROME_PATH} (set CHROME_PATH): ${error.message}`);
    process.exit(1);
  });

  for (let attempt = 0; attempt < STARTUP_TRIES; attempt += 1) {
    try {
      const targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      const page = targets.find((target) => target.type === 'page');

      if (page) {
        return { chrome, profile, socketUrl: page.webSocketDebuggerUrl };
      }
    } catch {
      // Chrome is still starting.
    }

    await sleep(POLL_MS);
  }

  chrome.kill();
  throw new Error('Chrome did not open its debugging port');
};

const connect = async (socketUrl) => {
  const socket = new WebSocket(socketUrl);
  const pending = new Map();
  const loadWaiters = [];
  let nextId = 0;

  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data);

    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message);
      pending.delete(message.id);
    }

    if (message.method === 'Page.loadEventFired') {
      loadWaiters.splice(0).forEach((resolveLoad) => resolveLoad());
    }
  });

  await new Promise((resolveOpen) => {
    socket.addEventListener('open', resolveOpen);
  });

  const send = async (method, params = {}) => {
    nextId += 1;

    const id = nextId;
    const message = await new Promise((resolveMessage) => {
      pending.set(id, resolveMessage);
      socket.send(JSON.stringify({ id, method, params }));
    });

    if (message.error) {
      throw new Error(`${method}: ${message.error.message}`);
    }

    return message.result;
  };

  const evaluate = async (expression) => {
    const result = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });

    if (result.exceptionDetails) {
      throw new Error(result.exceptionDetails.exception?.description ?? result.exceptionDetails.text);
    }

    return result.result.value;
  };

  const navigate = async (url) => {
    const loaded = new Promise((resolveLoad) => {
      loadWaiters.push(resolveLoad);
    });

    await send('Page.navigate', { url });
    await loaded;
  };

  return { socket, send, evaluate, navigate };
};

const decodeDataUrl = (dataUrl) => {
  return Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64');
};

// The cover with reduced motion shows its finished picture at once; the canvases are read before any replay.
const captureCover = async ({ send, evaluate, navigate }) => {
  await send('Emulation.setDeviceMetricsOverride', { width: COVER_WIDTH, height: COVER_HEIGHT, deviceScaleFactor: COVER_SCALE, mobile: true });
  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await navigate(pathToFileURL(COVER_PAGE).href);

  const deadline = Date.now() + COVER_DONE_TIMEOUT_MS;

  while ((await evaluate(`document.getElementById('greenhouse').dataset.intro`)) !== 'done') {
    if (Date.now() > deadline) {
      throw new Error('the cover greenhouse never reached data-intro="done"');
    }

    await sleep(POLL_MS);
  }

  return evaluate(`({
    greenhouse: document.getElementById('greenhouse').toDataURL('image/png'),
    rings: document.querySelector('.ring__art').toDataURL('image/png'),
  })`);
};

const renderCard = async ({ send, evaluate, navigate }, drawings, layout) => {
  await send('Emulation.setDeviceMetricsOverride', { width: CARD_WIDTH, height: CARD_HEIGHT, deviceScaleFactor: 1, mobile: false });
  await send('Emulation.setEmulatedMedia', { features: [] });
  await navigate(pathToFileURL(CARD_PAGE).href);

  const box = await evaluate(`window.renderCard(${JSON.stringify({ ...drawings, layout })})`);
  const shot = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: CARD_WIDTH, height: CARD_HEIGHT, scale: 1 } });

  return { png: Buffer.from(shot.data, 'base64'), box };
};

// Chrome rasterizes the SVG on a canvas, so each PNG is exactly its icon size.
const renderIcons = async ({ evaluate, navigate }) => {
  await navigate('about:blank');

  const svgUrl = `data:image/svg+xml;base64,${readFileSync(FAVICON_SVG).toString('base64')}`;
  const icons = await evaluate(`(async () => {
    const image = new Image();

    image.src = ${JSON.stringify(svgUrl)};
    await image.decode();

    const draw = (size, background, margin) => {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const inset = Math.round(size * margin);

      canvas.width = size;
      canvas.height = size;

      if (background) {
        context.fillStyle = background;
        context.fillRect(0, 0, size, size);
      }

      context.drawImage(image, inset, inset, size - inset * 2, size - inset * 2);

      return canvas.toDataURL('image/png');
    };

    return {
      favicon: draw(${FAVICON_SIZE}, '', 0),
      touch: draw(${TOUCH_ICON_SIZE}, ${JSON.stringify(PAPER)}, ${TOUCH_ICON_MARGIN}),
    };
  })()`);

  return { favicon: decodeDataUrl(icons.favicon), touch: decodeDataUrl(icons.touch) };
};

const main = async () => {
  const layout = readOption('layout', DEFAULT_LAYOUT);
  const outDir = resolve(readOption('out', SHARE_DIR));

  if (!LAYOUTS.includes(layout)) {
    throw new Error(`unknown --layout=${layout} (use ${LAYOUTS.join(' or ')})`);
  }

  const { chrome, profile, socketUrl } = await launchChrome();
  const browser = await connect(socketUrl);

  try {
    await browser.send('Page.enable');

    const drawings = await captureCover(browser);
    const card = await renderCard(browser, drawings, layout);
    const icons = await renderIcons(browser);

    mkdirSync(outDir, { recursive: true });
    writeFileSync(join(outDir, 'og-image.png'), card.png);
    writeFileSync(join(outDir, 'favicon-32.png'), icons.favicon);
    writeFileSync(join(outDir, 'apple-touch-icon.png'), icons.touch);

    const box = card.box;

    console.log(`og-image.png (${layout}) ${Math.round(card.png.length / 1024)} KB, greenhouse at ${Math.round(box.left)},${Math.round(box.top)} ${Math.round(box.width)}x${Math.round(box.height)}`);
    console.log(`favicon-32.png ${icons.favicon.length} B, apple-touch-icon.png ${Math.round(icons.touch.length / 1024)} KB -> ${outDir}`);
  } finally {
    browser.socket.close();
    chrome.kill();
    await sleep(POLL_MS);
    rmSync(profile, { recursive: true, force: true });
  }
};

main().catch((error) => {
  console.error(`BuildShareImages failed: ${error.message}`);
  process.exit(1);
});
