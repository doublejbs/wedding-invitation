import type { KeyboardEvent, TouchEvent } from 'react';
import PhotoOrientation from '../../enums/PhotoOrientation';
import useSheetDismiss from '../../hooks/useSheetDismiss';
import type { EditorialPhoto } from '../../types/EditorialPhoto';

// Intrinsic size of the full-size photo files (1600px long edge, 3:2 / 2:3).
const FULL_LONG_EDGE_PX = 1600;

const FULL_SHORT_EDGE_PX = 1066;

const DEFAULT_CLASS_PREFIX = 'editorial';

interface Props {
  photos: EditorialPhoto[];
  activeIndex: number;
  onClose: () => void;
  onShowPrevious: () => void;
  onShowNext: () => void;
  onTouchStart: (event: TouchEvent<HTMLElement>) => void;
  onTouchEnd: (event: TouchEvent<HTMLElement>) => void;
  // Page namespace for the BEM classes, e.g. "editorial" → "editorial-lightbox", "editorial-mono".
  classPrefix?: string;
}

const formatCounterNumber = (value: number) => {
  return String(value).padStart(2, '0');
};

// Full-screen photo viewer (each page styles the image: color on editorial, black and white on collage). useSheetDismiss handles Escape, inert background, scroll lock and focus.
const LightboxView = ({
  photos,
  activeIndex,
  onClose,
  onShowPrevious,
  onShowNext,
  onTouchStart,
  onTouchEnd,
  classPrefix = DEFAULT_CLASS_PREFIX,
}: Props) => {
  const blockClass = `${classPrefix}-lightbox`;
  const monoClass = `${classPrefix}-mono`;
  const rootRef = useSheetDismiss<HTMLDivElement>(onClose);
  const photo = photos[activeIndex];
  const isLandscape = photo.orientation === PhotoOrientation.LANDSCAPE;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      onShowNext();
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      onShowPrevious();
    }
  };

  return (
    <div ref={rootRef} className={blockClass}>
      <div
        className={`${blockClass}__dialog`}
        role="dialog"
        aria-modal="true"
        aria-label="사진 크게 보기"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
      >
        <div className={`${blockClass}__top`}>
          <span className={`${blockClass}__counter ${monoClass}`}>
            {`${formatCounterNumber(activeIndex + 1)} / ${formatCounterNumber(photos.length)}`}
          </span>
          <button type="button" className={`${blockClass}__close`} onClick={onClose} data-autofocus>
            닫기 <span aria-hidden="true">×</span>
          </button>
        </div>
        <figure className={`${blockClass}__stage`} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <img
            key={photo.id}
            className={`${blockClass}__image`}
            src={photo.src}
            alt={photo.alt}
            width={isLandscape ? FULL_LONG_EDGE_PX : FULL_SHORT_EDGE_PX}
            height={isLandscape ? FULL_SHORT_EDGE_PX : FULL_LONG_EDGE_PX}
            decoding="async"
          />
        </figure>
        <div className={`${blockClass}__controls`}>
          <button type="button" className={`${blockClass}__nav ${monoClass}`} aria-label="이전 사진" onClick={onShowPrevious}>
            ← PREV
          </button>
          <button type="button" className={`${blockClass}__nav ${monoClass}`} aria-label="다음 사진" onClick={onShowNext}>
            NEXT →
          </button>
        </div>
      </div>
    </div>
  );
};

export default LightboxView;
