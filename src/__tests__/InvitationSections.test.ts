import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// The invitation itself is plain HTML under docs/cover-studies (see docs/SectionsSpec.md).
// These tests read those files, mount one section at a time and run its scripts.
const STUDIES_DIR = resolve(process.cwd(), 'docs/cover-studies');

const BUILD_SCRIPT = resolve(process.cwd(), 'scripts/BuildInvitation.py');

const COPIED_LABEL = '복사했어요';

const COPY_FAILED_LABEL = '복사하지 못했어요';

const ANNOUNCE_DELAY_MS = 50;

// jsdom has no clipboard; whatever the tests put on navigator is put back after each test.
const ORIGINAL_CLIPBOARD = Object.getOwnPropertyDescriptor(navigator, 'clipboard');

const COPY_FEEDBACK_MS = 2000;

const SECTION_ORDER = ['커버', '인사말', '두 사람', '사진', '예식 안내', '오시는 길', '마음 전하실 곳', '참석 여부', '마무리'];

const TITLED_SECTIONS = ['오시는 길', '마음 전하실 곳', '참석 여부'];

const CENTRED_SECTIONS = ['오시는 길', '마음 전하실 곳', '참석 여부', '마무리'];

const DARK_SECTIONS = ['인사말', '마무리'];

const readStudy = (fileName: string) => {
  return readFileSync(resolve(STUDIES_DIR, fileName), 'utf-8');
};

const runScript = (code: string) => {
  // Each script gets its own function scope, so top-level constants never collide between tests.
  new Function(code)();
};

// Mounts a section file into the test document: its <section> markup, then SectionKit.js, then its inline scripts.
const mountSection = (fileName: string) => {
  const source = readStudy(fileName);
  const markup = source.match(/<section[\s\S]*<\/section>/);

  if (!markup) {
    throw new Error(`${fileName} has no <section> element`);
  }

  document.body.innerHTML = markup[0];
  runScript(readStudy('SectionKit.js'));

  const inlineScripts = [...source.matchAll(/<script>([\s\S]*?)<\/script>/g)];

  inlineScripts.forEach((script) => {
    runScript(script[1]);
  });

  return document.body.firstElementChild as HTMLElement;
};

const query = <T extends HTMLElement>(selector: string) => {
  const element = document.querySelector<T>(selector);

  if (!element) {
    throw new Error(`${selector} not found`);
  }

  return element;
};

// The photo sections carry no words at all; only the enlarged-photo dialog may hold a label.
const expectNoTextOutsideViewer = (section: HTMLElement) => {
  const copy = section.cloneNode(true) as HTMLElement;

  copy.querySelectorAll('[role="dialog"]').forEach((dialog) => {
    dialog.remove();
  });

  expect(copy.textContent?.trim()).toBe('');
};

const stubClipboard = () => {
  const writeText = vi.fn(async (_text: string) => {});

  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

  return writeText;
};

const stubFailingClipboard = () => {
  const writeText = vi.fn(async (_text: string) => {
    throw new DOMException('Write permission denied.', 'NotAllowedError');
  });

  Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });

  return writeText;
};

const removeClipboard = () => {
  Object.defineProperty(navigator, 'clipboard', { value: undefined, configurable: true });
};

// The textarea fallback: document.execCommand('copy') answers whether it copied.
const stubExecCommand = (isCopied: boolean) => {
  const execCommand = vi.fn((_command: string) => isCopied);

  Object.defineProperty(document, 'execCommand', { value: execCommand, configurable: true });

  return execCommand;
};

const restoreClipboard = () => {
  if (ORIGINAL_CLIPBOARD) {
    Object.defineProperty(navigator, 'clipboard', ORIGINAL_CLIPBOARD);

    return;
  }

  Reflect.deleteProperty(navigator, 'clipboard');
};

const flushPromises = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  restoreClipboard();
  Reflect.deleteProperty(document, 'execCommand');
  document.body.innerHTML = '';
});

describe('Invitation.html (built)', () => {
  let page = '';

  let builtDocument: Document;

  beforeAll(() => {
    execFileSync('python3', [BUILD_SCRIPT], { cwd: STUDIES_DIR });
    page = readStudy('Invitation.html');
    builtDocument = new DOMParser().parseFromString(page, 'text/html');
  });

  it('holds every section in the agreed order', () => {
    const labels = [...builtDocument.querySelectorAll('main > section')].map((section) => {
      return section.getAttribute('aria-label');
    });

    expect(labels).toEqual(SECTION_ORDER);
  });

  it('titles each detail section with its Korean name and uses no English titles', () => {
    TITLED_SECTIONS.forEach((label) => {
      const section = builtDocument.querySelector(`section[aria-label="${label}"]`);
      const titles = section?.querySelectorAll('h2') ?? [];

      expect(section?.classList.contains('section--detail'), label).toBe(true);
      expect(titles, label).toHaveLength(1);
      expect(titles[0]?.classList.contains('section-title'), label).toBe(true);
      expect(titles[0]?.textContent?.trim(), label).toBe(label);
    });

    const headings = [...builtDocument.querySelectorAll('main > section h2')].map((heading) => heading.textContent?.trim());

    expect(headings).toEqual(TITLED_SECTIONS);
    expect(builtDocument.querySelector('.section-kicker')).toBeNull();
    expect(readStudy('SectionKit.css')).not.toContain('.section-kicker');
  });

  it('has no drawings in the sections', () => {
    const drawings = [...builtDocument.querySelectorAll('main > section svg, main > section .crayon-art')];

    expect(drawings).toHaveLength(0);
    expect(readStudy('SectionKit.css')).not.toContain('.crayon-art');
  });

  it('has no facing pairs in the sections after the ceremony', () => {
    CENTRED_SECTIONS.forEach((label) => {
      const section = builtDocument.querySelector(`section[aria-label="${label}"]`);

      expect(section, label).not.toBeNull();
      expect(section?.querySelector('.pair'), label).toBeNull();
    });
  });

  it('draws actions as pill buttons and keeps the underline for text that copies itself', () => {
    const kit = readStudy('SectionKit.css');
    const readClasses = (selector: string) => {
      return [...builtDocument.querySelectorAll(selector)].map((element) => [...element.classList].sort().join(' '));
    };

    expect(kit).toMatch(/\n\.pill \{[^}]*min-height: 46px;[^}]*background: var\(--ink\);[^}]*color: var\(--pill-text\);/);
    expect(kit).toMatch(/\n\.pill--line \{[^}]*min-height: 44px;[^}]*border: 1px solid var\(--ink\);/);
    expect(kit).toMatch(/\n\.pill:focus-visible \{[^}]*outline: 2px solid var\(--ink\);/);
    expect(kit).toMatch(/\n\.pill:disabled \{[^}]*opacity: 0\.35;/);
    expect(kit.indexOf('\n.pill--line {')).toBeGreaterThan(kit.indexOf('\n.pill {'));
    expect(kit).toMatch(/\n\.section--dark \{[^}]*--pill-text: #161616;/);
    expect(readStudy('Rsvp.html')).toMatch(/\.rsvp \.rsvp__error \{[^}]*color: var\(--bloom\);/);
    expect(readStudy('Closing.html')).toMatch(/\.closing__share \{[^}]*flex-direction: column;[^}]*align-items: center;/);
    expect(readClasses('a[data-add-calendar]')).toEqual(['pill']);
    expect(readClasses('.rsvp button[type="submit"]')).toEqual(['pill']);
    expect(readClasses('button[data-share]')).toEqual(['pill']);
    expect(readClasses('button[data-copy-url]')).toEqual(['pill pill--line']);
    expect(readClasses('a[data-map]')).toEqual(['pill pill--line', 'pill pill--line', 'pill pill--line']);
    builtDocument.querySelectorAll('button[data-copy]').forEach((button) => {
      expect(button.classList.contains('crayon-link'), button.getAttribute('data-copy') ?? '').toBe(true);
    });
  });

  it('lays the photos out on a scrapbook page', () => {
    const photosSection = builtDocument.querySelector('section[aria-label="사진"]');

    expect(photosSection?.querySelector('[data-scrap]')).not.toBeNull();
    expect(photosSection?.querySelectorAll('button[data-photo]')).toHaveLength(14);
  });

  it('opens and closes the letter on black paper', () => {
    const dark = [...builtDocument.querySelectorAll('main > section[data-tone="dark"]')].map((section) => {
      return section.getAttribute('aria-label');
    });

    expect(dark).toEqual(DARK_SECTIONS);
  });

  it('leaves the greeting and photos sections without a title', () => {
    expect(builtDocument.querySelector('section[aria-label="인사말"] .section-title')).toBeNull();
    expect(builtDocument.querySelector('section[aria-label="사진"] .section-title')).toBeNull();
  });

  it('inlines the shared kit exactly once and keeps no external kit references', () => {
    expect(page.split('/* SectionKit */').length - 1).toBe(1);
    expect(page.split('// SectionKit').length - 1).toBe(1);
    expect(page).not.toContain('SectionKit.css');
    expect(page).not.toContain('SectionKit.js');
  });

  it('stays in the cover tone: no tables, shadows or English venue name', () => {
    expect(builtDocument.querySelector('table')).toBeNull();
    expect(page).not.toContain('box-shadow');
    expect(page).not.toMatch(/Sikmulgwan/i);
  });
});

describe('site/ (deploy build)', () => {
  const SITE_URL = 'https://example.test';

  const SITE_DIR = resolve(process.cwd(), 'site');

  const SITE_SCRIPT = resolve(process.cwd(), 'scripts/BuildSite.py');

  let siteDocument: Document;

  // Width and height sit in the IHDR chunk, right after the 8-byte PNG signature.
  const readPngSize = (fileName: string) => {
    const bytes = readFileSync(resolve(SITE_DIR, fileName));

    expect(bytes.subarray(1, 4).toString('ascii')).toBe('PNG');

    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
  };

  const readMeta = (selector: string) => {
    return siteDocument.querySelector(selector)?.getAttribute('content') ?? siteDocument.querySelector(selector)?.getAttribute('href');
  };

  beforeAll(() => {
    execFileSync('python3', [SITE_SCRIPT, SITE_URL], { cwd: process.cwd() });
    siteDocument = new DOMParser().parseFromString(readFileSync(resolve(SITE_DIR, 'index.html'), 'utf-8'), 'text/html');
  });

  it('ships the greenhouse drawing as the favicon in every size browsers ask for', () => {
    expect(readMeta('link[rel="icon"][type="image/svg+xml"]')).toBe('/favicon.svg');
    expect(readMeta('link[rel="icon"][sizes="32x32"]')).toBe('/favicon-32.png');
    expect(readMeta('link[rel="apple-touch-icon"]')).toBe('/apple-touch-icon.png');
    expect(readFileSync(resolve(SITE_DIR, 'favicon.svg'), 'utf-8')).toContain('<svg');
    expect(readPngSize('favicon-32.png')).toEqual({ width: 32, height: 32 });
    expect(readPngSize('apple-touch-icon.png')).toEqual({ width: 180, height: 180 });
  });

  it('shares the greenhouse card as the link preview, with absolute addresses for KakaoTalk', () => {
    expect(readMeta('meta[property="og:image"]')).toBe(`${SITE_URL}/og-image.png`);
    expect(readMeta('meta[property="og:image:width"]')).toBe('1200');
    expect(readMeta('meta[property="og:image:height"]')).toBe('630');
    expect(readMeta('meta[property="og:url"]')).toBe(`${SITE_URL}/`);
    expect(readMeta('meta[name="twitter:image"]')).toBe(`${SITE_URL}/og-image.png`);
    expect(readMeta('meta[property="og:title"]')).toBeTruthy();
    expect(readMeta('meta[property="og:description"]')).toBeTruthy();
    expect(readPngSize('og-image.png')).toEqual({ width: 1200, height: 630 });
  });

  it('ships the cut-out photos the families section shows', () => {
    const page = readFileSync(resolve(SITE_DIR, 'index.html'), 'utf-8');
    const cutNames = [...new Set([...page.matchAll(/photos\/(photo-\d{2}-cut\.webp)/g)].map((match) => match[1]))];

    expect(cutNames.sort()).toEqual(['photo-09-cut.webp', 'photo-10-cut.webp']);

    cutNames.forEach((name) => {
      expect(existsSync(resolve(SITE_DIR, 'photos', name)), name).toBe(true);
    });
  });

  it('ships both sizes of every photo the page shows', () => {
    const page = readFileSync(resolve(SITE_DIR, 'index.html'), 'utf-8');
    const smallNames = [...new Set([...page.matchAll(/photos\/(photo-\d{2})-sm\.jpg/g)].map((match) => match[1]))];

    expect(smallNames.length).toBeGreaterThanOrEqual(14);

    smallNames.forEach((name) => {
      expect(existsSync(resolve(SITE_DIR, 'photos', `${name}-sm.jpg`)), `${name}-sm.jpg`).toBe(true);
      expect(existsSync(resolve(SITE_DIR, 'photos', `${name}.jpg`)), `${name}.jpg`).toBe(true);
    });
  });

  it('shows the scrapbook page on the main page and ships no second page', () => {
    expect(siteDocument.querySelector('[data-scrap]')).not.toBeNull();
    expect(siteDocument.querySelectorAll('button[data-photo]')).toHaveLength(14);
    expect(readFileSync(resolve(SITE_DIR, 'index.html'), 'utf-8')).not.toContain('box-shadow');
    expect(existsSync(resolve(SITE_DIR, 'mosaic.html'))).toBe(false);
  });

  it('ships the calendar event next to the page', () => {
    expect(readFileSync(resolve(SITE_DIR, 'wedding.ics'), 'utf-8')).toContain('BEGIN:VEVENT');
  });

  it('ships the stamp paper the greeting photo sits in', () => {
    expect(readPngSize('textures/stamp-frame.png').width).toBeGreaterThan(400);
  });
});

describe('GreenhouseCover.html', () => {
  const CANVAS_WIDTH = 350;

  const CANVAS_HEIGHT = 357;

  const RESIZE_SETTLE_MS = 400;

  // A 2D context that accepts every call, so the crayon drawing code can run in jsdom.
  const createContextStub = () => {
    const gradient = { addColorStop: () => {} };

    return new Proxy(
      {},
      {
        get: (_target, property) => {
          if (property === 'createLinearGradient' || property === 'createRadialGradient' || property === 'createPattern') {
            return () => gradient;
          }

          if (property === 'measureText') {
            return () => ({ width: 0 });
          }

          return () => {};
        },
        set: () => true,
      },
    );
  };

  const setVisibility = (state: 'visible' | 'hidden') => {
    Object.defineProperty(document, 'visibilityState', { value: state, configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
  };

  // Mounts the cover markup and runs only its first script (the greenhouse); the second one is the weather layer.
  const mountCover = () => {
    const source = readStudy('GreenhouseCover.html');
    const markup = source.match(/<main[\s\S]*<\/main>/);
    const script = source.match(/<script>([\s\S]*?)<\/script>/);

    if (!markup || !script) {
      throw new Error('GreenhouseCover.html has no <main> or <script>');
    }

    document.body.innerHTML = markup[0];
    runScript(script[1]);

    return query<HTMLCanvasElement>('#greenhouse');
  };

  beforeEach(() => {
    vi.useFakeTimers();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => createContextStub() as never);
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(CANVAS_WIDTH);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(CANVAS_HEIGHT);
    vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }));
  });

  afterEach(() => {
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
  });

  it('holds the greenhouse intro until the page is actually on screen', async () => {
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });

    const canvas = mountCover();

    await vi.advanceTimersByTimeAsync(3000);

    expect(canvas.dataset.intro).toBe('waiting');

    setVisibility('visible');
    await vi.advanceTimersByTimeAsync(100);

    expect(canvas.dataset.intro).toBe('playing');
  });

  it('starts the intro on its own once the page is loaded and visible, then finishes', async () => {
    const canvas = mountCover();

    await vi.advanceTimersByTimeAsync(2000);

    expect(['playing', 'done']).toContain(canvas.dataset.intro);

    await vi.advanceTimersByTimeAsync(20000);

    expect(canvas.dataset.intro).toBe('done');
  });

  it('keeps playing when the viewport only changes height, as mobile address bars do', async () => {
    const canvas = mountCover();

    await vi.advanceTimersByTimeAsync(300);

    expect(canvas.dataset.intro).toBe('playing');

    window.dispatchEvent(new Event('resize'));
    await vi.advanceTimersByTimeAsync(RESIZE_SETTLE_MS);

    expect(canvas.dataset.intro).toBe('playing');
  });
});

describe('GreenhouseCover.html weather', () => {
  const WEATHER_KINDS = ['clear', 'cloudy', 'rain', 'snow', 'fog', 'storm', 'night'];

  const SCENE_SIZE = 350;

  const WATCH_MS = 1200;

  // Every scene has to visibly move: something drawn must shift by at least this many pixels within a second.
  const MIN_SHIFT_PX = 6;

  const SHAPE_CALLS = ['arc', 'ellipse', 'moveTo', 'lineTo', 'fillRect', 'rect', 'translate'];

  type Frame = number[][];

  let frames: Frame[] = [];

  // How many times the weather layer painted a line or a fill, to tell outlined shapes from plain ones.
  let paints = { stroke: 0, fill: 0 };

  // Records the geometry the weather layer draws, one list of shapes per frame (a frame starts at clearRect).
  // Each recorder writes to the list it was made with, so a loop left over from an earlier test cannot leak in.
  const createRecorder = (target: Frame[]) => {
    const gradient = { addColorStop: () => {} };

    return new Proxy(
      {},
      {
        get: (_target, property) => {
          if (property === 'clearRect') {
            return () => {
              target.push([]);
            };
          }

          if (typeof property === 'string' && SHAPE_CALLS.includes(property)) {
            return (...values: number[]) => {
              target.at(-1)?.push(values);
            };
          }

          if (property === 'createLinearGradient' || property === 'createRadialGradient') {
            return () => gradient;
          }

          if (property === 'stroke' || property === 'fill') {
            return () => {
              paints[property] += 1;
            };
          }

          return () => {};
        },
        set: () => true,
      },
    );
  };

  const createSilentContext = () => {
    return new Proxy({}, { get: () => () => ({ addColorStop: () => {}, width: 0 }), set: () => true });
  };

  // Largest change of any number between the same shape in two frames.
  const measureShift = (before: Frame, after: Frame) => {
    let shift = 0;

    before.forEach((shape, index) => {
      const later = after[index];

      if (!later) {
        return;
      }

      shape.forEach((value, position) => {
        shift = Math.max(shift, Math.abs(value - (later[position] ?? value)));
      });
    });

    return shift;
  };

  // Both cover scripts share one scope on the real page, so they run here as one script too.
  const mountCoverWithWeather = (kind: string) => {
    const source = readStudy('GreenhouseCover.html');
    const markup = source.match(/<main[\s\S]*<\/main>/);
    const scripts = [...source.matchAll(/<script>([\s\S]*?)<\/script>/g)].map((script) => script[1]);

    if (!markup || scripts.length < 2) {
      throw new Error('GreenhouseCover.html has no <main> or is missing its weather script');
    }

    window.location.hash = `#${kind}`;
    document.body.innerHTML = markup[0];
    runScript(scripts.join('\n'));
  };

  beforeEach(() => {
    const recorded: Frame[] = [];

    frames = recorded;
    paints = { stroke: 0, fill: 0 };
    vi.useFakeTimers();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
      return (this.id === 'weather' ? createRecorder(recorded) : createSilentContext()) as never;
    });
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(SCENE_SIZE);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(SCENE_SIZE);
    vi.stubGlobal('matchMedia', () => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }));
    vi.stubGlobal('fetch', vi.fn(async () => Promise.reject(new Error('offline'))));
  });

  afterEach(() => {
    vi.clearAllTimers();
    window.location.hash = '';
    Reflect.deleteProperty(document, 'readyState');
  });

  const setReadyState = (state: DocumentReadyState) => {
    Object.defineProperty(document, 'readyState', { value: state, configurable: true });
  };

  it('waits for the page to finish loading, then starts the intro and shows the weather together', async () => {
    setReadyState('interactive');
    mountCoverWithWeather('snow');

    const greenhouse = query<HTMLCanvasElement>('#greenhouse');
    const weather = query<HTMLCanvasElement>('#weather');

    await vi.advanceTimersByTimeAsync(1000);

    expect(greenhouse.dataset.intro).toBe('waiting');
    expect(weather.dataset.weather).toBe('waiting');
    expect(frames.filter((frame) => frame.length > 0)).toHaveLength(0);

    setReadyState('complete');
    window.dispatchEvent(new Event('load'));
    await vi.advanceTimersByTimeAsync(200);

    expect(greenhouse.dataset.intro).toBe('playing');
    expect(weather.dataset.weather).toBe('on');
    expect(frames.filter((frame) => frame.length > 0).length).toBeGreaterThan(0);
  });

  it('does not wait forever when the load event is slow to come', async () => {
    setReadyState('interactive');
    mountCoverWithWeather('snow');
    await vi.advanceTimersByTimeAsync(4000);

    expect(['playing', 'done']).toContain(query<HTMLCanvasElement>('#greenhouse').dataset.intro);
    expect(query<HTMLCanvasElement>('#weather').dataset.weather).toBe('on');
  });

  it.each(WEATHER_KINDS)('keeps the %s scene moving', async (kind) => {
    mountCoverWithWeather(kind);
    await vi.advanceTimersByTimeAsync(WATCH_MS);

    const drawn = frames.filter((frame) => frame.length > 0);

    expect(drawn.length).toBeGreaterThan(20);
    expect(measureShift(drawn[5], drawn.at(-1) ?? [])).toBeGreaterThanOrEqual(MIN_SHIFT_PX);
  });

  it('paints the cloudy scene as soft shapes with no outline', async () => {
    mountCoverWithWeather('cloudy');
    await vi.advanceTimersByTimeAsync(WATCH_MS);

    expect(paints.fill).toBeGreaterThan(0);
    expect(paints.stroke).toBe(0);
  });
});

describe('GreetingCard.html', () => {
  it('sets the two printed-cover photos inside the paper stamp, one above the other, on a black section', () => {
    const section = mountSection('GreetingCard.html');
    const stamps = document.querySelectorAll('[data-stamp]');
    const frame = query<HTMLImageElement>('[data-stamp] img.greeting__frame');
    const photos = [...document.querySelectorAll<HTMLImageElement>('[data-stamp] img.greeting__photo')];
    const note = query('.greeting__note');

    expect(section.dataset.tone).toBe('dark');
    expect(stamps).toHaveLength(1);
    expect(frame.getAttribute('src')).toBe('textures/stamp-frame.png');
    expect(frame.getAttribute('alt')).toBe('');
    expect(photos.map((photo) => photo.getAttribute('src'))).toEqual(['photos/photo-12.jpg', 'photos/photo-04.jpg']);

    photos.forEach((photo) => {
      expect(photo.getAttribute('alt')?.trim()).toBeTruthy();
      expect(photo.compareDocumentPosition(note) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    expect(document.querySelector('[data-stamp-outline]')).toBeNull();
    expect(readStudy('GreetingCard.html')).not.toMatch(/drop-shadow|box-shadow/);
  });

  it('holds only the stamps and the greeting: no title and no signature', () => {
    const section = mountSection('GreetingCard.html');

    expect(section.querySelector('.section-title')).toBeNull();
    expect(section.querySelector('[data-signature]')).toBeNull();
    expect(section.textContent).not.toContain('드림');
    expect(section.lastElementChild).toBe(query('.greeting__note'));
  });
});

describe('PhotosScrapbook.html', () => {
  const PHOTO_COUNT = 14;

  it('puts every photo on the page, each one a button with a description', () => {
    const section = mountSection('PhotosScrapbook.html');
    const cluster = query('[data-scrap]');
    const photos = [...cluster.querySelectorAll<HTMLButtonElement>('button[data-photo]')];
    const sources = photos.map((photo) => photo.querySelector('img')?.getAttribute('src') ?? '');

    expect(section.getAttribute('aria-label')).toBe('사진');
    expect(photos).toHaveLength(PHOTO_COUNT);
    expect(new Set(sources).size).toBe(PHOTO_COUNT);
    expect(sources).not.toContain('photos/photo-06-sm.jpg');

    photos.forEach((photo) => {
      const image = photo.querySelector('img');

      expect(image?.getAttribute('src')).toMatch(/^photos\/photo-\d{2}-sm\.jpg$/);
      expect(image?.getAttribute('alt')?.trim()).toBeTruthy();
      expect(image?.getAttribute('width')).toBeTruthy();
      expect(image?.getAttribute('height')).toBeTruthy();
    });
  });

  it('frames every photo in a crayon outline, landscape photos cropped to the frame', () => {
    mountSection('PhotosScrapbook.html');

    document.querySelectorAll<HTMLButtonElement>('[data-scrap] button[data-photo]').forEach((frame) => {
      const image = frame.querySelector('img');
      const isLandscape = Number(image?.getAttribute('width')) > Number(image?.getAttribute('height'));

      expect(frame.classList.contains('scrap__photo')).toBe(true);

      if (isLandscape) {
        expect(frame.style.getPropertyValue('--pos')).toMatch(/^\d+% \d+%$/);
      }
    });
  });

  it('adds no decorations next to the photos', () => {
    mountSection('PhotosScrapbook.html');

    expect(document.querySelector('[data-scrap] svg, [data-doodle], [data-star]')).toBeNull();
  });

  it('shows photos only: no words on the page', () => {
    expectNoTextOutsideViewer(mountSection('PhotosScrapbook.html'));
    expect(document.querySelector('[data-word]')).toBeNull();
    expect(document.querySelector('.photos .section-title')).toBeNull();
  });

  it('opens a photo large on the paper and closes it again with Escape', () => {
    mountSection('PhotosScrapbook.html');

    const photo = query<HTMLButtonElement>('button[data-photo]');
    const viewer = query('[role="dialog"]');
    const smallSource = photo.querySelector('img')?.getAttribute('src') ?? '';

    expect(viewer.hidden).toBe(true);

    photo.click();

    expect(viewer.hidden).toBe(false);
    expect(viewer.querySelector('img')?.getAttribute('src')).toBe(smallSource.replace('-sm.jpg', '.jpg'));

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(viewer.hidden).toBe(true);
  });
});

describe('Families.html', () => {
  it('gives each family its parents, then the relation and name, then one photo', () => {
    const section = mountSection('Families.html');
    const families = [...section.querySelectorAll('.families__family')].map((family) => {
      return {
        parents: family.querySelector('.families__parents')?.textContent?.trim(),
        name: family.querySelector('.families__name')?.textContent?.trim(),
        photos: [...family.querySelectorAll('img')].map((image) => image.getAttribute('src')),
      };
    });

    expect(families).toEqual([
      { parents: '서재호 & 김선교의', name: '아들 진용', photos: ['photos/photo-10-cut.webp'] },
      { parents: '장영인 & 김혜숙의', name: '딸 하림', photos: ['photos/photo-09-cut.webp'] },
    ]);
  });

  it('shows each person cut out along their outline, described', () => {
    const section = mountSection('Families.html');

    section.querySelectorAll('img').forEach((image) => {
      expect(image.classList.contains('families__cutout')).toBe(true);
      expect(image.getAttribute('alt')).toMatch(/신랑|신부/);
      expect(image.getAttribute('loading')).toBe('lazy');
    });
    expect(section.querySelector('h2, .section-title, svg, .prose')).toBeNull();
  });
});

describe('CeremonyInfo.html', () => {
  it('leaves the families to the section after the greeting', () => {
    const section = mountSection('CeremonyInfo.html');

    expect(section.textContent).not.toMatch(/서재호|장영인|아들|딸/);
  });

  it('follows the reference order: date line, place, month, calendar, countdown, calendar link', () => {
    const section = mountSection('CeremonyInfo.html');
    const order = ['.ceremony__when', '.ceremony__place', '.calendar__month', '.calendar__grid', '.countdown', '.calendar__add'];
    const elements = order.map((selector) => section.querySelector(selector));

    elements.forEach((element, index) => {
      expect(element, order[index]).not.toBeNull();
    });
    elements.slice(1).forEach((element, index) => {
      const previous = elements[index] as Element;

      expect(previous.compareDocumentPosition(element as Element) & Node.DOCUMENT_POSITION_FOLLOWING, order[index + 1]).toBeTruthy();
    });
  });

  it('has no title or drawing, on white paper, with no sentences', () => {
    const section = mountSection('CeremonyInfo.html');

    expect(section.querySelector('h2, .ceremony__title, svg, img, .prose, .section-title')).toBeNull();
    expect(section.textContent).not.toContain('The Wedding Day');
    expect(readStudy('CeremonyInfo.html')).not.toContain('ceremony__title');
    expect(section.classList.contains('section--dark')).toBe(false);
  });

  it('opens with the date line and the place', () => {
    const section = mountSection('CeremonyInfo.html');
    const when = section.querySelector('.ceremony__when');
    const place = section.querySelector('.ceremony__place');

    expect(when?.textContent?.trim()).toBe('2027년 3월 6일 토요일');
    expect(when?.getAttribute('aria-hidden')).toBe('true');
    expect(place?.textContent?.trim()).toBe('오후 5시 · 식물관PH');
    expect(place?.hasAttribute('aria-hidden')).toBe(false);
    expect(place?.querySelector('[aria-hidden="true"]')?.textContent).toBe('오후 5시 · ');
  });

  it('makes the date line larger than the month above the calendar', () => {
    const source = readStudy('CeremonyInfo.html');

    expect(source).toMatch(/\.ceremony \.ceremony__when \{[^}]*font-size: clamp\(21px, 6\.2vw, 24px\)/);
    expect(source).toMatch(/\.ceremony \.calendar__month \{[^}]*font-size: clamp\(19px, 5\.6vw, 21px\)/);
  });

  it('draws one crayon line under the month', () => {
    const section = mountSection('CeremonyInfo.html');

    expect(section.querySelector('.calendar__month')?.textContent?.trim()).toBe('2027.03');
    expect(readStudy('CeremonyInfo.html')).toMatch(/\.calendar__month[^{]*\{[^}]*var\(--crayon-underline-ink\)/);
  });

  it('shows March 2027 from Sunday, with the first on a Monday and the sixth circled', () => {
    const section = mountSection('CeremonyInfo.html');
    const days = [...section.querySelectorAll('.calendar__day')];
    const weekdays = [...section.querySelectorAll('.calendar__weekday')].map((day) => day.textContent?.trim());

    expect(weekdays).toEqual(['S', 'M', 'T', 'W', 'T', 'F', 'S']);
    expect(days.map((day) => day.textContent?.trim())).toEqual(Array.from({ length: 31 }, (_, index) => String(index + 1)));
    expect(days[0].classList.contains('calendar__day--first')).toBe(true);

    // jsdom does not lay out grids, so the first day's column is read from the CSS.
    const firstColumn = new Date('2027-03-01T00:00:00Z').getUTCDay() + 1;

    expect(readStudy('CeremonyInfo.html')).toMatch(new RegExp(`calendar__day--first \\{\\s*grid-column-start: ${firstColumn};`));
    expect([...section.querySelectorAll('.calendar__day--wedding')].map((day) => day.textContent)).toEqual(['6']);
  });

  const CALENDAR_AGENTS = {
    android: 'Mozilla/5.0 (Linux; Android 15; SM-S928N) AppleWebKit/537.36 Chrome/131.0 Mobile Safari/537.36 KAKAOTALK 11.2.0',
    iphoneKakao: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 KAKAOTALK 11.2.0',
    iphoneSafari: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 Version/18.1 Mobile/15E148 Safari/604.1',
    desktop: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131.0 Safari/537.36',
  };

  const mountCalendarLink = (userAgent: string) => {
    const spy = vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(userAgent);

    mountSection('CeremonyInfo.html');
    spy.mockRestore();

    return query<HTMLAnchorElement>('a[data-add-calendar]');
  };

  it('offers a pill button, not an underlined word, to add the day to a calendar', () => {
    const link = mountCalendarLink(CALENDAR_AGENTS.desktop);

    expect(link.textContent?.trim()).toBe('캘린더에 추가');
    expect([...link.classList]).toEqual(['pill']);
    expect(readStudy('CeremonyInfo.html')).not.toContain('.calendar__button');
  });

  it.each(['desktop', 'iphoneSafari'] as const)('gives %s the event file', (device) => {
    const link = mountCalendarLink(CALENDAR_AGENTS[device]);

    expect(link.getAttribute('href')).toBe('wedding.ics');
    expect(link.hasAttribute('target')).toBe(false);
  });

  it('sends an iPhone inside KakaoTalk out to Safari for the file', () => {
    const link = mountCalendarLink(CALENDAR_AGENTS.iphoneKakao);
    const fileUrl = new URL('wedding.ics', window.location.href).href;

    expect(link.getAttribute('href')).toBe(`kakaotalk://web/openExternal?url=${encodeURIComponent(fileUrl)}`);
  });

  it('opens Google Calendar on Android, with the same event as the file', () => {
    const link = mountCalendarLink(CALENDAR_AGENTS.android);
    const url = new URL(link.href);
    const file = readStudy('share/wedding.ics');
    const readField = (name: string) => {
      return file.match(new RegExp(`^${name}:(.+)\\r$`, 'm'))?.[1];
    };

    expect(`${url.origin}${url.pathname}`).toBe('https://calendar.google.com/calendar/render');
    expect(url.searchParams.get('action')).toBe('TEMPLATE');
    expect(url.searchParams.get('dates')).toBe(`${readField('DTSTART')}/${readField('DTEND')}`);
    expect(url.searchParams.get('text')).toBe(readField('SUMMARY'));
    expect(url.searchParams.get('location')).toBe(readField('LOCATION'));
    expect(link.target).toBe('_blank');
    expect(link.rel).toBe('noopener');
  });

  it('keeps the event file at five in the afternoon, Korean time', () => {
    const file = readStudy('share/wedding.ics');

    expect(file).toContain('DTSTART:20270306T080000Z\r\n');
    expect(file).toContain('DTEND:20270306T100000Z\r\n');
    expect(file.split('\r\n').join('')).not.toContain('\n');
  });

  it('reads the date to screen readers as one sentence and hides the visual date', () => {
    const section = mountSection('CeremonyInfo.html');
    const when = section.querySelector('time');

    expect(when?.getAttribute('datetime')).toBe('2027-03-06T17:00:00+09:00');
    expect(when?.textContent).toBe('2027년 3월 6일 토요일 오후 5시');
    ['.ceremony__when', '.calendar__month', '.calendar__grid', '.countdown'].forEach((selector) => {
      expect(section.querySelector(selector)?.getAttribute('aria-hidden'), selector).toBe('true');
    });

    expect(section.querySelector('.calendar__time')).toBeNull();
  });

  describe('countdown', () => {
    const readCountdown = (section: Element) => {
      return [...section.querySelectorAll('.countdown__value')].map((value) => value.textContent?.trim());
    };

    afterEach(() => {
      vi.useRealTimers();
    });

    it('stays hidden without the script', () => {
      const markup = readStudy('CeremonyInfo.html');

      expect(markup).toMatch(/<div class="countdown"[^>]*\shidden[\s>]/);
    });

    it('counts down days, hours, minutes and seconds to five in the afternoon, Korean time', () => {
      vi.useFakeTimers();
      // 466 days, 5 hours, 12 minutes and 40 seconds before 2027-03-06 08:00 UTC.
      vi.setSystemTime(new Date(Date.UTC(2027, 2, 6, 8, 0, 0) - (((466 * 24 + 5) * 60 + 12) * 60 + 40) * 1000));

      const section = mountSection('CeremonyInfo.html');
      const countdown = section.querySelector('.countdown') as HTMLElement;
      const labels = [...section.querySelectorAll('.countdown__label')].map((label) => label.textContent?.trim());

      expect(countdown.hidden).toBe(false);
      expect(labels).toEqual(['DAYS', 'HOURS', 'MINS', 'SECS']);
      expect(readCountdown(section)).toEqual(['466', '05', '12', '40']);

      vi.advanceTimersByTime(1000);

      expect(readCountdown(section)).toEqual(['466', '05', '12', '39']);
    });

    it('hides itself once the ceremony has begun', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(Date.UTC(2027, 2, 6, 8, 0, 1)));

      const section = mountSection('CeremonyInfo.html');

      expect((section.querySelector('.countdown') as HTMLElement).hidden).toBe(true);
    });

    it('hides itself when the ceremony begins and stops ticking', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(Date.UTC(2027, 2, 6, 7, 59, 58)));

      const section = mountSection('CeremonyInfo.html');
      const countdown = section.querySelector('.countdown') as HTMLElement;

      expect(countdown.hidden).toBe(false);

      vi.advanceTimersByTime(2000);

      expect(countdown.hidden).toBe(true);
      expect(vi.getTimerCount()).toBe(0);
    });
  });
});

describe('PhotosScrapbook.html frames', () => {
  it('draws every crayon frame in a neutral near-black grey', () => {
    const source = readStudy('PhotosScrapbook.html');
    const strokes = [...source.matchAll(/stroke='%23([0-9a-f]{6})'/g)].map((match) => match[1]);

    expect(strokes).toHaveLength(8);
    expect(new Set(strokes)).toEqual(new Set(['333333']));
  });
});

describe('Directions.html', () => {
  it('lists subway, parking and shuttle bus in the words the couple gave', () => {
    const section = mountSection('Directions.html');
    const items = [...section.querySelectorAll('.directions__item')].map((item) => {
      return {
        label: item.querySelector('.label')?.textContent?.trim(),
        text: item.querySelector('.prose')?.textContent?.trim(),
      };
    });

    expect(items).toEqual([
      { label: '지하철', text: '수서역 하차 후 3호선, 수인분당선 1번 출구앞 셔틀버스 이용' },
      { label: '주차', text: '수서역 1번 출구 공영주차장 이용 후셔틀버스 탑승 (무료 주차권은 축의대에서 수령)' },
      { label: '셔틀버스', text: '수서역 1번 출구 신동아 아파트 앞 탑승' },
    ]);
    expect(section.textContent).not.toContain('○');
  });

  // Every mount may append the Naver map script to <head> and set its auth-failure global.
  afterEach(() => {
    document.querySelectorAll('script[src^="https://oapi.map.naver.com"]').forEach((script) => {
      script.remove();
    });
    Reflect.deleteProperty(window, 'navermap_authFailure');
  });

  it('copies the address and confirms it in place for a moment', async () => {
    vi.useFakeTimers();

    const writeText = stubClipboard();

    mountSection('Directions.html');

    const address = query<HTMLButtonElement>('button[data-copy]');
    const originalText = address.textContent;

    address.click();
    await flushPromises();

    expect(writeText).toHaveBeenCalledWith(address.dataset.copy);
    expect(address.textContent).toContain(COPIED_LABEL);

    vi.advanceTimersByTime(COPY_FEEDBACK_MS);

    expect(address.textContent).toBe(originalText);
  });

  it('says it could not copy when both the clipboard and the fallback fail', async () => {
    vi.useFakeTimers();

    const writeText = stubFailingClipboard();
    const execCommand = stubExecCommand(false);

    mountSection('Directions.html');

    const address = query<HTMLButtonElement>('button[data-copy]');
    const originalText = address.textContent;

    address.click();
    await flushPromises();
    await flushPromises();

    expect(writeText).toHaveBeenCalledWith(address.dataset.copy);
    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(address.textContent).toContain(COPY_FAILED_LABEL);
    expect(address.textContent).not.toContain(COPIED_LABEL);

    vi.advanceTimersByTime(ANNOUNCE_DELAY_MS);

    expect(query('[data-kit-announcer]').textContent).toBe(COPY_FAILED_LABEL);

    vi.advanceTimersByTime(COPY_FEEDBACK_MS);

    expect(address.textContent).toBe(originalText);
  });

  it('copies through the fallback when there is no clipboard API', async () => {
    removeClipboard();

    const execCommand = stubExecCommand(true);

    mountSection('Directions.html');

    const address = query<HTMLButtonElement>('button[data-copy]');

    address.click();
    await flushPromises();
    await flushPromises();

    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(address.textContent).toContain(COPIED_LABEL);
    expect(address.textContent).not.toContain(COPY_FAILED_LABEL);
  });

  it('links to the three map apps as plain words', () => {
    mountSection('Directions.html');

    const links = [...document.querySelectorAll<HTMLAnchorElement>('a[data-map]')];
    const hrefs = links.map((link) => {
      return link.getAttribute('href') ?? '';
    });

    expect(links.map((link) => link.dataset.map)).toEqual(['naver', 'kakao', 'tmap']);
    expect(hrefs[0]).toContain('map.naver.com');
    expect(hrefs[1]).toContain('map.kakao.com');
    expect(hrefs[2]).toContain('tmap');
  });

  describe('Naver map', () => {
    const NAVER_MAP_SCRIPT_URL = 'https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=p3b51v6ck2';

    const VENUE = { lat: 37.4826902, lng: 127.0943672 };

    const findMapScripts = () => {
      return [...document.querySelectorAll<HTMLScriptElement>('script[src^="https://oapi.map.naver.com"]')];
    };

    // A stand-in for IntersectionObserver: the test decides when the box comes near the viewport.
    const stubIntersectionObserver = () => {
      const observers: { callback: IntersectionObserverCallback; options?: IntersectionObserverInit; observe: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }[] = [];

      class FakeIntersectionObserver {
        observe = vi.fn();

        unobserve = vi.fn();

        disconnect = vi.fn();

        constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
          observers.push({ callback, options, observe: this.observe, disconnect: this.disconnect });
        }
      }

      vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);

      return observers;
    };

    // The parts of window.naver.maps the section uses, recording how they were called.
    const stubNaverMaps = () => {
      class LatLng {
        constructor(
          public lat: number,
          public lng: number,
        ) {}
      }

      const Map = vi.fn();
      const Marker = vi.fn();
      const maps = {
        LatLng,
        Map,
        Marker,
        Position: { TOP_RIGHT: 'TOP_RIGHT' },
        ZoomControlStyle: { SMALL: 'SMALL' },
      };

      vi.stubGlobal('naver', { maps });

      return maps;
    };

    it('puts an empty map box under the title instead of a drawing or an embed', () => {
      const section = mountSection('Directions.html');
      const map = section.querySelector<HTMLElement>('.directions__map[data-naver-map]');

      expect(section.querySelector('svg, .crayon-art')).toBeNull();
      expect(section.querySelector('iframe')).toBeNull();
      expect(readStudy('Directions.html')).not.toMatch(/<iframe/i);
      expect(map).not.toBeNull();
      expect(section.querySelector('.section-title')?.nextElementSibling).toBe(map);
      expect(map?.getAttribute('role')).toBe('region');
      expect(map?.getAttribute('aria-label')).toBe('식물관PH 위치 지도');
    });

    it('loads the map script once right away without IntersectionObserver', () => {
      vi.stubGlobal('IntersectionObserver', undefined);

      mountSection('Directions.html');

      const scripts = findMapScripts();

      expect(scripts).toHaveLength(1);
      expect(scripts[0].getAttribute('src')).toBe(NAVER_MAP_SCRIPT_URL);
    });

    it('waits until the map box comes near the viewport, then loads once and stops watching', () => {
      const observers = stubIntersectionObserver();
      const section = mountSection('Directions.html');
      const map = section.querySelector('.directions__map');

      expect(observers).toHaveLength(1);
      expect(observers[0].options?.rootMargin).toBe('600px 0px');
      expect(observers[0].observe).toHaveBeenCalledWith(map);
      expect(findMapScripts()).toHaveLength(0);

      const observer = {} as IntersectionObserver;

      observers[0].callback([{ isIntersecting: false, target: map } as unknown as IntersectionObserverEntry], observer);

      expect(findMapScripts()).toHaveLength(0);

      observers[0].callback([{ isIntersecting: true, target: map } as unknown as IntersectionObserverEntry], observer);
      observers[0].callback([{ isIntersecting: true, target: map } as unknown as IntersectionObserverEntry], observer);

      expect(findMapScripts()).toHaveLength(1);
      expect(findMapScripts()[0].getAttribute('src')).toBe(NAVER_MAP_SCRIPT_URL);
      expect(observers[0].disconnect).toHaveBeenCalled();
    });

    it('draws a still map on the venue with one pin once the script has loaded', () => {
      vi.stubGlobal('IntersectionObserver', undefined);

      const section = mountSection('Directions.html');
      const box = section.querySelector('.directions__map');
      const maps = stubNaverMaps();

      findMapScripts()[0].dispatchEvent(new Event('load'));

      expect(maps.Map).toHaveBeenCalledTimes(1);

      const [target, options] = maps.Map.mock.calls[0];

      expect(target).toBe(box);
      expect(options.center).toMatchObject(VENUE);
      expect(options).toMatchObject({
        zoom: 14,
        draggable: false,
        scrollWheel: false,
        pinchZoom: false,
        keyboardShortcuts: false,
        zoomControl: true,
      });
      expect(maps.Marker).toHaveBeenCalledTimes(1);

      const [marker] = maps.Marker.mock.calls[0];

      expect(marker.position).toMatchObject(VENUE);
      expect(marker.map).toBe(maps.Map.mock.instances[0]);
      expect((box as HTMLElement).hidden).toBe(false);
    });

    it('hides the map box when the script loads without naver.maps', () => {
      vi.stubGlobal('IntersectionObserver', undefined);

      const section = mountSection('Directions.html');

      findMapScripts()[0].dispatchEvent(new Event('load'));

      expect(section.querySelector<HTMLElement>('.directions__map')?.hidden).toBe(true);
    });

    it('hides only the map box when the script fails to load', () => {
      vi.stubGlobal('IntersectionObserver', undefined);

      const section = mountSection('Directions.html');

      findMapScripts()[0].dispatchEvent(new Event('error'));

      expect(section.querySelector<HTMLElement>('.directions__map')?.hidden).toBe(true);
      expect(section.querySelector('.directions__place')?.textContent).toBe('식물관PH');
      expect(section.querySelector('[data-copy]')).not.toBeNull();
      expect(section.querySelectorAll('a[data-map]')).toHaveLength(3);
    });

    it('hides the map box when Naver reports an authentication failure', () => {
      vi.stubGlobal('IntersectionObserver', undefined);

      const section = mountSection('Directions.html');
      const handleAuthFailure = (window as unknown as { navermap_authFailure?: () => void }).navermap_authFailure;

      expect(typeof handleAuthFailure).toBe('function');

      handleAuthFailure?.();

      expect(section.querySelector<HTMLElement>('.directions__map')?.hidden).toBe(true);
    });

    it('keeps the empty box hidden when hidden is set, despite display: block', () => {
      expect(readStudy('Directions.html')).toMatch(/\.directions__map\[hidden\]\s*\{[^}]*display:\s*none/);
    });

    it('builds the map script URL from the client ID alone and never carries a secret', () => {
      const source = readStudy('Directions.html');
      const urls = [...source.matchAll(/'(https:\/\/oapi\.map\.naver\.com[^']*)'/g)].map((match) => match[1]);

      expect(urls).toHaveLength(1);

      const url = new URL(`${urls[0]}p3b51v6ck2`);

      expect([...url.searchParams.keys()]).toEqual(['ncpKeyId']);
      expect(source).not.toMatch(/secret/i);
      expect(readStudy('Invitation.html')).not.toMatch(/secret/i);
    });
  });
});

describe('GiftAccounts.html', () => {
  it('starts folded and opens one side at a time', () => {
    mountSection('GiftAccounts.html');

    const groomToggle = query<HTMLButtonElement>('button[data-side-toggle="groom"]');
    const brideToggle = query<HTMLButtonElement>('button[data-side-toggle="bride"]');
    const groomPanel = query('[data-side-panel="groom"]');
    const bridePanel = query('[data-side-panel="bride"]');

    expect(groomPanel.hidden).toBe(true);
    expect(bridePanel.hidden).toBe(true);
    expect(groomToggle.getAttribute('aria-expanded')).toBe('false');

    groomToggle.click();

    expect(groomPanel.hidden).toBe(false);
    expect(groomToggle.getAttribute('aria-expanded')).toBe('true');

    brideToggle.click();

    expect(groomPanel.hidden).toBe(true);
    expect(bridePanel.hidden).toBe(false);
    expect(groomToggle.getAttribute('aria-expanded')).toBe('false');

    brideToggle.click();

    expect(bridePanel.hidden).toBe(true);
  });

  it('copies an account number when it is tapped', async () => {
    const writeText = stubClipboard();

    mountSection('GiftAccounts.html');
    query<HTMLButtonElement>('button[data-side-toggle="groom"]').click();

    const account = query<HTMLButtonElement>('[data-side-panel="groom"] button[data-copy]');

    account.click();
    await flushPromises();

    expect(writeText).toHaveBeenCalledWith(account.dataset.copy);
    expect(account.textContent).toContain(COPIED_LABEL);
  });
});

describe('Rsvp.html', () => {
  const choose = (name: string, value: string) => {
    const radio = query<HTMLInputElement>(`input[type="radio"][name="${name}"][value="${value}"]`);

    radio.click();
  };

  const submit = async () => {
    const form = query<HTMLFormElement>('form[data-rsvp]');

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await flushPromises();
  };

  it('asks for head count and meal only from guests who attend', () => {
    mountSection('Rsvp.html');

    const attendingOnly = query('[data-when-attending]');

    expect(attendingOnly.hidden).toBe(true);

    choose('attendance', 'attend');

    expect(attendingOnly.hidden).toBe(false);

    choose('attendance', 'absent');

    expect(attendingOnly.hidden).toBe(true);
  });

  it('steps the head count between 1 and 9', () => {
    mountSection('Rsvp.html');
    choose('attendance', 'attend');

    const value = query('[data-guests-value]');
    const minus = query<HTMLButtonElement>('button[data-guests-minus]');
    const plus = query<HTMLButtonElement>('button[data-guests-plus]');

    expect(value.textContent?.trim()).toBe('1');

    minus.click();

    expect(value.textContent?.trim()).toBe('1');

    for (let step = 0; step < 12; step += 1) {
      plus.click();
    }

    expect(value.textContent?.trim()).toBe('9');
  });

  it('marks the name line instead of sending when the name is empty', async () => {
    mountSection('Rsvp.html');
    choose('side', 'groom');
    choose('attendance', 'absent');
    await submit();

    expect(query<HTMLInputElement>('input[name="name"]').getAttribute('aria-invalid')).toBe('true');
    expect(query('[data-rsvp-result]').hidden).toBe(true);
  });

  it('replaces the form with one sentence after sending, without a network call while no endpoint is set', async () => {
    const fetchSpy = vi.fn();

    vi.stubGlobal('fetch', fetchSpy);
    mountSection('Rsvp.html');
    choose('side', 'bride');
    choose('attendance', 'attend');
    choose('meal', 'yes');
    query<HTMLInputElement>('input[name="name"]').value = '홍길동';
    await submit();

    const result = query('[data-rsvp-result]');

    expect(result.hidden).toBe(false);
    expect(result.textContent?.trim()).not.toBe('');
    expect(query<HTMLFormElement>('form[data-rsvp]').hidden).toBe(true);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('does not send when an attending guest has not chosen the meal', async () => {
    const fetchSpy = vi.fn();

    vi.stubGlobal('fetch', fetchSpy);
    mountSection('Rsvp.html');
    choose('side', 'groom');
    choose('attendance', 'attend');
    query<HTMLInputElement>('input[name="name"]').value = '홍길동';
    await submit();

    expect(query('[data-rsvp-result]').hidden).toBe(true);
    expect(query<HTMLFormElement>('form[data-rsvp]').hidden).toBe(false);
    expect(query('[data-rsvp-row="meal"]').hasAttribute('data-missing')).toBe(true);
    expect(query('[data-rsvp-hint]').textContent).toContain('식사');
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});

describe('Closing.html', () => {
  it('copies the invitation address', async () => {
    const writeText = stubClipboard();

    mountSection('Closing.html');

    const copyLink = query<HTMLButtonElement>('button[data-copy-url]');

    copyLink.click();
    await flushPromises();

    expect(writeText).toHaveBeenCalledWith(window.location.href);
    expect(copyLink.textContent).toContain(COPIED_LABEL);
  });

  it('closes on one stamp with photo 06, without a title or a drawing', () => {
    const section = mountSection('Closing.html');
    const images = [...section.querySelectorAll('[data-stamp] img')].map((image) => image.getAttribute('src'));

    expect(images).toEqual(['textures/stamp-frame.png', 'photos/photo-06-sm.jpg']);
    expect(section.querySelector('.section-title, [data-illustration]')).toBeNull();
  });

  it('offers a share action and does not repeat the names', () => {
    const section = mountSection('Closing.html');

    expect(document.querySelector('button[data-share]')).not.toBeNull();
    expect(section.textContent).not.toMatch(/Jinyong|Harim|진용|하림/);
  });
});
