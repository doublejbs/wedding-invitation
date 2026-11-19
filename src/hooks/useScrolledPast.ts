import { useEffect, useState } from 'react';

// True once the page has scrolled more than thresholdPx from the top.
const useScrolledPast = (thresholdPx: number) => {
  const [isScrolledPast, setIsScrolledPast] = useState(false);

  useEffect(() => {
    let frameId = 0;

    const updateScrolledPast = () => {
      frameId = 0;
      setIsScrolledPast(window.scrollY > thresholdPx);
    };

    const handleScroll = () => {
      if (frameId === 0) {
        frameId = window.requestAnimationFrame(updateScrolledPast);
      }
    };

    updateScrolledPast();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.cancelAnimationFrame(frameId);
    };
  }, [thresholdPx]);

  return isScrolledPast;
};

export default useScrolledPast;
