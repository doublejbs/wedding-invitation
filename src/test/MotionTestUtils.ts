import { act } from '@testing-library/react';

type MediaQueryListener = () => void;

// Stubs window.matchMedia for `prefers-reduced-motion`. `setMatches` flips it and notifies subscribers,
// like the user changing the OS setting. Call `restoreReducedMotion` in afterEach.
export const mockReducedMotion = (initialMatches: boolean) => {
  let matches = initialMatches;
  const listeners = new Set<MediaQueryListener>();

  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({
      get matches() {
        return matches;
      },
      media: query,
      addEventListener: (_type: string, listener: MediaQueryListener) => {
        listeners.add(listener);
      },
      removeEventListener: (_type: string, listener: MediaQueryListener) => {
        listeners.delete(listener);
      },
    }),
  });

  const setMatches = (nextMatches: boolean) => {
    act(() => {
      matches = nextMatches;
      listeners.forEach((listener) => {
        listener();
      });
    });
  };

  return { setMatches };
};

export const restoreReducedMotion = () => {
  Reflect.deleteProperty(window, 'matchMedia');
};

// Queues requestAnimationFrame callbacks so a test decides when a frame runs. Restore with vi.restoreAllMocks().
export const mockAnimationFrames = () => {
  const callbacks = new Map<number, FrameRequestCallback>();
  let nextId = 1;

  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    const id = nextId;

    nextId += 1;
    callbacks.set(id, callback);

    return id;
  });
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
    callbacks.delete(id);
  });

  const flushAnimationFrames = () => {
    const pending = Array.from(callbacks.values());

    callbacks.clear();
    pending.forEach((callback) => {
      callback(performance.now());
    });
  };

  const countPendingFrames = () => {
    return callbacks.size;
  };

  return { flushAnimationFrames, countPendingFrames };
};
