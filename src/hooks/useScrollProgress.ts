import { useEffect, type RefObject } from 'react';
import usePrefersReducedMotion from './usePrefersReducedMotion';

const PROGRESS_PRECISION = 1000;

const clampProgress = (value: number) => {
  return Math.min(Math.max(value, 0), 1);
};

// How far the viewport has scrolled through a tall container that holds a sticky child (0 → 1).
const calculateStickyProgress = (target: HTMLElement) => {
  const rect = target.getBoundingClientRect();
  const scrollableDistance = rect.height - window.innerHeight;

  if (scrollableDistance <= 0) {
    return rect.top <= 0 ? 1 : 0;
  }

  return clampProgress(-rect.top / scrollableDistance);
};

// Writes the scroll progress (0 → 1) to a CSS custom property on the target, without React re-renders.
// Listens to scroll only while the container is near the viewport (IntersectionObserver gate).
// With reduced motion, the property is pinned to the final state (1) and nothing is observed.
const useScrollProgress = (targetRef: RefObject<HTMLElement | null>, propertyName: string) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const target = targetRef.current;

    if (!target) {
      return undefined;
    }

    const writeProgress = (progress: number) => {
      target.style.setProperty(propertyName, String(Math.round(progress * PROGRESS_PRECISION) / PROGRESS_PRECISION));
    };

    if (prefersReducedMotion) {
      writeProgress(1);

      return () => {
        target.style.removeProperty(propertyName);
      };
    }

    let frameId = 0;
    let isListening = false;

    const updateProgress = () => {
      frameId = 0;
      writeProgress(calculateStickyProgress(target));
    };

    const handleScroll = () => {
      if (frameId === 0) {
        frameId = window.requestAnimationFrame(updateProgress);
      }
    };

    const startListening = () => {
      if (isListening) {
        return;
      }

      isListening = true;
      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', handleScroll);
    };

    const stopListening = () => {
      if (!isListening) {
        return;
      }

      isListening = false;
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };

    const cleanUp = () => {
      stopListening();
      window.cancelAnimationFrame(frameId);
    };

    updateProgress();

    if (typeof IntersectionObserver === 'undefined') {
      startListening();

      return cleanUp;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        startListening();
      } else {
        stopListening();
      }

      // Snap to the edge value when the container enters or leaves.
      updateProgress();
    });

    observer.observe(target);

    return () => {
      observer.disconnect();
      cleanUp();
    };
  }, [prefersReducedMotion, propertyName, targetRef]);
};

export default useScrollProgress;
