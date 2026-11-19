import { useSyncExternalStore } from 'react';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const getMediaQueryList = () => {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return null;
  }

  return window.matchMedia(REDUCED_MOTION_QUERY);
};

const subscribeToReducedMotion = (onChange: () => void) => {
  const mediaQueryList = getMediaQueryList();

  mediaQueryList?.addEventListener('change', onChange);

  return () => {
    mediaQueryList?.removeEventListener('change', onChange);
  };
};

const getReducedMotionSnapshot = () => {
  return getMediaQueryList()?.matches ?? false;
};

const usePrefersReducedMotion = () => {
  return useSyncExternalStore(subscribeToReducedMotion, getReducedMotionSnapshot, () => false);
};

export default usePrefersReducedMotion;
