import { useEffect, useRef, useState } from 'react';

const REVEAL_THRESHOLD = 0.2;

// Flips to true once the element first enters the viewport, then stops observing.
const useRevealOnView = <T extends HTMLElement>() => {
  const elementRef = useRef<T>(null);
  const [isRevealed, setIsRevealed] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const element = elementRef.current;

    if (!element || isRevealed) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          observer.disconnect();
        }
      },
      { threshold: REVEAL_THRESHOLD },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [isRevealed]);

  return { elementRef, isRevealed };
};

export default useRevealOnView;
