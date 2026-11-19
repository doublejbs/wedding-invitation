import { useEffect, useRef, type PointerEvent } from 'react';
import type { Point } from '../types/Point';
import { calculateStickerOffset, calculateStickerTilt, RESTING_OFFSET } from '../utils/StickerDragUtils';
import usePrefersReducedMotion from './usePrefersReducedMotion';

const DRAGGING_CLASS = 'is-dragging';

interface StickerDrag {
  element: HTMLElement;
  pointerId: number;
  origin: Point;
  // Latest pointer position; written to the element on the next animation frame.
  pointer: Point;
  // Pending animation frame, 0 when none is scheduled.
  frameId: number;
}

// Writes the offset straight to the sticker's CSS variables, so dragging never re-renders React.
const writeStickerOffset = (sticker: HTMLElement, offset: Point) => {
  sticker.style.setProperty('--sticker-x', `${offset.x}px`);
  sticker.style.setProperty('--sticker-y', `${offset.y}px`);
  sticker.style.setProperty('--sticker-tilt', `${calculateStickerTilt(offset)}deg`);
};

// Ends a drag: drops the pending frame, releases the pointer and lets the sticker spring back (CSS transition).
const finishDrag = (drag: StickerDrag) => {
  const { element, pointerId } = drag;

  window.cancelAnimationFrame(drag.frameId);
  drag.frameId = 0;
  element.classList.remove(DRAGGING_CLASS);

  if (element.hasPointerCapture?.(pointerId)) {
    element.releasePointerCapture(pointerId);
  }

  writeStickerOffset(element, RESTING_OFFSET);
};

// "Peel the sticker" (FFF): the sticker follows the pointer, lifted; on release, cancel or lost capture
// it springs back to its place. One pointer at a time; at most one style write per animation frame.
// Disabled with reduced motion, and a drag in progress is reset if reduced motion turns on.
const useStickerDrag = () => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const dragRef = useRef<StickerDrag | null>(null);

  useEffect(() => {
    const drag = dragRef.current;

    if (!prefersReducedMotion || !drag) {
      return undefined;
    }

    dragRef.current = null;
    finishDrag(drag);

    return undefined;
  }, [prefersReducedMotion]);

  // On unmount only the pending frame is dropped; the element is going away.
  useEffect(() => {
    return () => {
      const drag = dragRef.current;

      if (drag) {
        window.cancelAnimationFrame(drag.frameId);
      }

      dragRef.current = null;
    };
  }, []);

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (prefersReducedMotion || dragRef.current) {
      return;
    }

    const element = event.currentTarget;
    const origin = { x: event.clientX, y: event.clientY };

    event.preventDefault();
    element.setPointerCapture?.(event.pointerId);
    element.classList.add(DRAGGING_CLASS);
    dragRef.current = { element, pointerId: event.pointerId, origin, pointer: origin, frameId: 0 };
  };

  const handlePointerMove = (event: PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    drag.pointer = { x: event.clientX, y: event.clientY };

    if (drag.frameId !== 0) {
      return;
    }

    drag.frameId = window.requestAnimationFrame(() => {
      drag.frameId = 0;
      writeStickerOffset(drag.element, calculateStickerOffset(drag.origin, drag.pointer));
    });
  };

  const handlePointerRelease = (event: PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;

    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    // Cleared first: releasing capture fires lostpointercapture, which must find no drag.
    dragRef.current = null;
    finishDrag(drag);
  };

  return { isEnabled: !prefersReducedMotion, handlePointerDown, handlePointerMove, handlePointerRelease };
};

export default useStickerDrag;
