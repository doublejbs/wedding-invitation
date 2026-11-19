import { useRef, useState, type KeyboardEvent, type TouchEvent } from 'react';
import type GalleryCategory from '../enums/GalleryCategory';
import type { GallerySet } from '../types/GallerySet';

const SWIPE_THRESHOLD_PX = 40;

const useGalleryState = (gallerySets: GallerySet[]) => {
  const [selectedCategory, setSelectedCategory] = useState(gallerySets[0].category);
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartXRef = useRef<number | null>(null);

  const selectedSet = gallerySets.find((gallerySet) => gallerySet.category === selectedCategory) ?? gallerySets[0];
  const photoCount = selectedSet.photos.length;

  const showPhoto = (index: number) => {
    setActiveIndex(Math.min(Math.max(index, 0), photoCount - 1));
  };

  const handleSelectCategory = (category: GalleryCategory) => {
    setSelectedCategory(category);
    setActiveIndex(0);
  };

  // Tablist keyboard pattern: Left/Right (wrapping), Home and End move selection and focus between tabs.
  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const currentIndex = gallerySets.findIndex((gallerySet) => gallerySet.category === selectedCategory);
    const lastIndex = gallerySets.length - 1;
    const nextIndexByKey: Record<string, number> = {
      ArrowRight: currentIndex === lastIndex ? 0 : currentIndex + 1,
      ArrowLeft: currentIndex === 0 ? lastIndex : currentIndex - 1,
      Home: 0,
      End: lastIndex,
    };
    const nextIndex = nextIndexByKey[event.key];

    if (nextIndex === undefined) {
      return;
    }

    event.preventDefault();
    handleSelectCategory(gallerySets[nextIndex].category);

    const nextTab = event.currentTarget.parentElement?.children[nextIndex];

    if (nextTab instanceof HTMLElement) {
      nextTab.focus();
    }
  };

  const handleSelectPhoto = (index: number) => {
    showPhoto(index);
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

    showPhoto(activeIndex + (deltaX < 0 ? 1 : -1));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      showPhoto(activeIndex + 1);
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showPhoto(activeIndex - 1);
    }
  };

  return {
    selectedCategory,
    selectedSet,
    activeIndex,
    handleSelectCategory,
    handleTabKeyDown,
    handleSelectPhoto,
    handleTouchStart,
    handleTouchEnd,
    handleKeyDown,
  };
};

export default useGalleryState;
