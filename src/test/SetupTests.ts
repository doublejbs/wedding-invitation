import '@testing-library/jest-dom/vitest';

// jsdom has no IntersectionObserver. This stub reports every observed element as visible right away.
class IntersectionObserverStub implements IntersectionObserver {
  readonly root = null;

  readonly rootMargin = '0px';

  readonly scrollMargin = '0px';

  readonly thresholds = [0];

  private readonly callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  observe = (target: Element) => {
    const entry = { isIntersecting: true, target, intersectionRatio: 1 } as IntersectionObserverEntry;

    this.callback([entry], this);
  };

  unobserve = () => {};

  disconnect = () => {};

  takeRecords = () => {
    return [];
  };
}

if (typeof window.IntersectionObserver === 'undefined') {
  window.IntersectionObserver = IntersectionObserverStub;
  globalThis.IntersectionObserver = IntersectionObserverStub;
}
