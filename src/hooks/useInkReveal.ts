import { useEffect, useRef, useState } from 'react';

const REVEAL_THRESHOLD = 0.2;

// Once any part of the element is on screen, it is revealed after this delay even if the threshold is never met.
const FALLBACK_REVEAL_MS = 2500;

// Reveal-once for handwriting and strokes. Observe an element that is NOT clipped itself
// (a clip-path on the target makes its intersection area 0, so the threshold would never be met).
// The observer's first callback covers elements already on screen at mount. Reveals immediately
// without IntersectionObserver, and falls back to a timer once the element is partly visible,
// so ink is never left hidden.
const useInkReveal = <T extends HTMLElement>() => {
  const elementRef = useRef<T>(null);
  const [isRevealed, setIsRevealed] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const element = elementRef.current;

    if (!element || isRevealed) {
      return undefined;
    }

    let fallbackTimeoutId = 0;

    const reveal = () => {
      window.clearTimeout(fallbackTimeoutId);
      setIsRevealed(true);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        if (entry.intersectionRatio >= REVEAL_THRESHOLD) {
          observer.disconnect();
          reveal();

          return;
        }

        if (fallbackTimeoutId === 0) {
          fallbackTimeoutId = window.setTimeout(() => {
            observer.disconnect();
            reveal();
          }, FALLBACK_REVEAL_MS);
        }
      },
      { threshold: [0, REVEAL_THRESHOLD] },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      window.clearTimeout(fallbackTimeoutId);
    };
  }, [isRevealed]);

  return { elementRef, isRevealed };
};

export default useInkReveal;
