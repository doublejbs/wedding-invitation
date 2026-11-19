import { useEffect, useRef, useState, type TouchEvent } from 'react';

const SWIPE_THRESHOLD_PX = 40;

// Lightbox paging over `photoCount` photos. Paging wraps around at both ends.
// Focus returns to the element that opened the lightbox (clicks do not focus buttons in every browser).
const useLightboxState = (photoCount: number) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Runs after the lightbox's own cleanup, so this focus wins.
  useEffect(() => {
    if (activeIndex !== null || !triggerRef.current) {
      return;
    }

    triggerRef.current.focus();
    triggerRef.current = null;
  }, [activeIndex]);

  const showRelativePhoto = (step: number) => {
    setActiveIndex((previous) => {
      if (previous === null) {
        return previous;
      }

      return (previous + step + photoCount) % photoCount;
    });
  };

  const handleOpenLightbox = (index: number, trigger: HTMLElement | null) => {
    triggerRef.current = trigger;
    setActiveIndex(index);
  };

  const handleCloseLightbox = () => {
    setActiveIndex(null);
  };

  const handleShowPrevious = () => {
    showRelativePhoto(-1);
  };

  const handleShowNext = () => {
    showRelativePhoto(1);
  };

  const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
    const startX = touchStartXRef.current;
    const endX = event.changedTouches[0]?.clientX;

    touchStartXRef.current = null;

    if (startX === null || endX === undefined) {
      return;
    }

    const deltaX = endX - startX;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) {
      return;
    }

    showRelativePhoto(deltaX < 0 ? 1 : -1);
  };

  return {
    activeIndex,
    handleOpenLightbox,
    handleCloseLightbox,
    handleShowPrevious,
    handleShowNext,
    handleTouchStart,
    handleTouchEnd,
  };
};

export default useLightboxState;
