import { useEffect, type RefObject } from 'react';
import usePrefersReducedMotion from './usePrefersReducedMotion';

// Writes how many pixels the target has scrolled past the viewport top to a CSS custom property,
// without React re-renders. Children combine it with their own speed, e.g.
// `translateY(calc(var(--editorial-drift) * var(--drift-speed) * -1px))`.
// Listens to scroll only while the target is on screen. With reduced motion the value stays 0.
const useParallaxDrift = (targetRef: RefObject<HTMLElement | null>, propertyName: string) => {
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const target = targetRef.current;

    if (!target) {
      return undefined;
    }

    const writeDrift = (drift: number) => {
      target.style.setProperty(propertyName, String(Math.round(drift)));
    };

    if (prefersReducedMotion) {
      writeDrift(0);

      return () => {
        target.style.removeProperty(propertyName);
      };
    }

    let frameId = 0;
    let isListening = false;

    const updateDrift = () => {
      frameId = 0;
      writeDrift(Math.max(-target.getBoundingClientRect().top, 0));
    };

    const handleScroll = () => {
      if (frameId === 0) {
        frameId = window.requestAnimationFrame(updateDrift);
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

    updateDrift();

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

      updateDrift();
    });

    observer.observe(target);

    return () => {
      observer.disconnect();
      cleanUp();
    };
  }, [prefersReducedMotion, propertyName, targetRef]);
};

export default useParallaxDrift;
