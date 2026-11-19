import { useEffect, useState } from 'react';
import usePrefersReducedMotion from './usePrefersReducedMotion';

const DEFAULT_DURATION_MS = 1600;

const easeOutCubic = (t: number) => {
  return 1 - (1 - t) ** 3;
};

// Counts from `from` to target once active. With reduced motion, the target is shown immediately.
const useCountUp = (target: number, isActive: boolean, from = 0, durationMs = DEFAULT_DURATION_MS) => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [value, setValue] = useState(from);

  useEffect(() => {
    if (!isActive || prefersReducedMotion) {
      return undefined;
    }

    let frameId = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsedRatio = Math.min((now - startTime) / durationMs, 1);

      setValue(Math.round(from + (target - from) * easeOutCubic(elapsedRatio)));

      if (elapsedRatio < 1) {
        frameId = window.requestAnimationFrame(tick);
      }
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [durationMs, from, isActive, prefersReducedMotion, target]);

  if (prefersReducedMotion) {
    return target;
  }

  return value;
};

export default useCountUp;
