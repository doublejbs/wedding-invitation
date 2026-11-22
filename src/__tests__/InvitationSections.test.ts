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

const SECTION_ORDER = ['커버', '인사말', '사진', '예식 안내', '오시는 길', '마음 전하실 곳', '참석 여부', '마무리'];

const TITLED_SECTIONS = ['예식 안내', '오시는 길', '마음 전하실 곳', '참석 여부', '마무리'];

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

  it('gives each titled section one big Korean title and one crayon illustration', () => {
    TITLED_SECTIONS.forEach((label) => {
      const section = builtDocument.querySelector(`section[aria-label="${label}"]`);
      const titles = section?.querySelectorAll('.section-title') ?? [];
      const text = titles[0]?.textContent?.trim() ?? '';
      const illustrations = section?.querySelectorAll('svg[data-illustration]') ?? [];

      expect(section?.classList.contains('section--detail'), label).toBe(true);
      expect(titles, label).toHaveLength(1);
      expect(text, label).toMatch(/[가-힣]/);
      expect(text, label).not.toMatch(/[A-Za-z]/);
      expect(section?.querySelector('.section-title__glyph'), label).toBeNull();
      expect(illustrations, label).toHaveLength(1);
      expect(illustrations[0]?.getAttribute('aria-hidden'), label).toBe('true');
    });

    expect(builtDocument.querySelector('section[aria-label="예식 안내"] .section-title')?.textContent?.trim()).toBe('예식 안내');
  });

  it('lays the photos out on a scrapbook page', () => {
    const photosSection = builtDocument.querySelector('section[aria-label="사진"]');

    expect(photosSection?.querySelector('[data-scrap]')).not.toBeNull();
    expect(photosSection?.querySelectorAll('button[data-photo]')).toHaveLength(14);
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

describe('CeremonyInfo.html', () => {
  it('names both families\' parents and keeps the title free of drawings', () => {
    const section = mountSection('CeremonyInfo.html');
    const parents = [...section.querySelectorAll('[data-parents]')].map((line) => line.textContent?.trim());

    expect(parents).toEqual(['서재호 · 김선교', '장영인 · 김혜숙']);
    expect(section.querySelector('.section-title svg, .section-title__glyph')).toBeNull();
  });

  it('counts the days left until the wedding', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-11-19T09:00:00+09:00'));
    mountSection('CeremonyInfo.html');

    expect(query('[data-dday]').textContent?.trim()).toBe('D-107');
  });

  it('still counts one day just before midnight in Korea', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2027-03-05T23:30:00+09:00'));
    mountSection('CeremonyInfo.html');

    expect(query('[data-dday]').textContent?.trim()).toBe('D-1');
  });

  it('says TODAY on the wedding day', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2027-03-06T00:30:00+09:00'));
    mountSection('CeremonyInfo.html');

    expect(query('[data-dday]').textContent?.trim()).toBe('TODAY');
  });

  it('hides the count once the wedding day has passed', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2027-03-07T00:01:00+09:00'));
    mountSection('CeremonyInfo.html');

    expect(query('[data-dday]').hidden).toBe(true);
  });

  it('stacks the groom\'s family above the bride\'s', () => {
    const section = mountSection('CeremonyInfo.html');
    const names = [...section.querySelectorAll('.ceremony__name')].map((name) => name.textContent?.trim());

    expect(names).toEqual(['진용', '하림']);
  });

  it('labels the date and time', () => {
    const section = mountSection('CeremonyInfo.html');

    expect(section.querySelector('.ceremony__label')?.textContent?.trim()).toBe('일시');
    expect(section.textContent).toContain('2027년 3월 6일 토요일');
    expect(section.textContent).toContain('오후 5시');
  });

  it('runs a live countdown to the start of the ceremony', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2027-03-05T16:59:50+09:00'));
    mountSection('CeremonyInfo.html');

    const timer = query('[data-countdown]');

    expect(timer.hidden).toBe(false);
    expect(timer.getAttribute('aria-hidden')).toBe('true');
    expect(timer.textContent?.replace(/\s+/g, ' ').trim()).toBe('1일 00시간 00분 10초');

    vi.advanceTimersByTime(1000);

    expect(timer.textContent?.replace(/\s+/g, ' ').trim()).toBe('1일 00시간 00분 09초');
  });

  it('hides the live countdown once the ceremony has started', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2027-03-06T16:59:59+09:00'));
    mountSection('CeremonyInfo.html');

    const timer = query('[data-countdown]');

    expect(timer.hidden).toBe(false);

    vi.advanceTimersByTime(1000);

    expect(timer.hidden).toBe(true);
    expect(query('[data-dday]').textContent?.trim()).toBe('TODAY');
  });

  it('keeps the live countdown hidden after the start', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2027-03-06T17:30:00+09:00'));
    mountSection('CeremonyInfo.html');

    expect(query('[data-countdown]').hidden).toBe(true);
  });
});

describe('Directions.html', () => {
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
    expect(document.querySelector('iframe')).toBeNull();
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

  it('offers a share action and does not repeat the names', () => {
    const section = mountSection('Closing.html');

    expect(document.querySelector('button[data-share]')).not.toBeNull();
    expect(section.textContent).not.toMatch(/Jinyong|Harim|진용|하림/);
  });
});
