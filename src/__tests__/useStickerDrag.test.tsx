import { Profiler } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import useStickerDrag from '../hooks/useStickerDrag';
import { mockAnimationFrames, mockReducedMotion, restoreReducedMotion } from '../test/MotionTestUtils';

const STICKER_TEST_ID = 'sticker';

const RESTING = { x: '0px', y: '0px', tilt: '0deg' };

const UNSET = { x: '', y: '', tilt: '' };

// Minimal host for the hook, wired like DraggableStickerView.
const StickerHarness = () => {
  const { isEnabled, handlePointerDown, handlePointerMove, handlePointerRelease } = useStickerDrag();

  return (
    <div
      data-testid={STICKER_TEST_ID}
      data-enabled={String(isEnabled)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerRelease}
      onPointerCancel={handlePointerRelease}
      onLostPointerCapture={handlePointerRelease}
    />
  );
};

const getOffset = (element: HTMLElement) => {
  return {
    x: element.style.getPropertyValue('--sticker-x'),
    y: element.style.getPropertyValue('--sticker-y'),
    tilt: element.style.getPropertyValue('--sticker-tilt'),
  };
};

describe('useStickerDrag', () => {
  afterEach(() => {
    restoreReducedMotion();
    vi.restoreAllMocks();
  });

  it('moves the sticker with the pointer, once per frame, and springs back to 0 on release', () => {
    const { flushAnimationFrames, countPendingFrames } = mockAnimationFrames();
    // Counts React commits to prove pointermove does not re-render.
    const handleRender = vi.fn();

    render(
      <Profiler id="sticker" onRender={handleRender}>
        <StickerHarness />
      </Profiler>,
    );

    const sticker = screen.getByTestId(STICKER_TEST_ID);

    expect(sticker).toHaveAttribute('data-enabled', 'true');

    fireEvent.pointerDown(sticker, { pointerId: 1, clientX: 100, clientY: 100 });

    expect(sticker).toHaveClass('is-dragging');

    const commitsBeforeMove = handleRender.mock.calls.length;

    fireEvent.pointerMove(sticker, { pointerId: 1, clientX: 140, clientY: 70 });
    fireEvent.pointerMove(sticker, { pointerId: 1, clientX: 116, clientY: 90 });

    expect(countPendingFrames()).toBe(1);
    expect(getOffset(sticker)).toEqual(UNSET);

    flushAnimationFrames();

    expect(getOffset(sticker)).toEqual({ x: '16px', y: '-10px', tilt: '2deg' });

    fireEvent.pointerMove(sticker, { pointerId: 1, clientX: 140, clientY: 70 });
    flushAnimationFrames();

    expect(getOffset(sticker)).toEqual({ x: '40px', y: '-30px', tilt: '5deg' });
    expect(handleRender).toHaveBeenCalledTimes(commitsBeforeMove);

    fireEvent.pointerMove(sticker, { pointerId: 1, clientX: 180, clientY: 70 });
    fireEvent.pointerUp(sticker, { pointerId: 1, clientX: 180, clientY: 70 });

    expect(countPendingFrames()).toBe(0);
    expect(sticker).not.toHaveClass('is-dragging');
    expect(getOffset(sticker)).toEqual(RESTING);
  });

  it('returns to 0 when the pointer is cancelled', () => {
    const { flushAnimationFrames } = mockAnimationFrames();

    render(<StickerHarness />);

    const sticker = screen.getByTestId(STICKER_TEST_ID);

    fireEvent.pointerDown(sticker, { pointerId: 3, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(sticker, { pointerId: 3, clientX: 50, clientY: 30 });
    flushAnimationFrames();
    fireEvent.pointerCancel(sticker, { pointerId: 3 });

    expect(sticker).not.toHaveClass('is-dragging');
    expect(getOffset(sticker)).toEqual(RESTING);
  });

  it('returns to 0 when pointer capture is lost', () => {
    const { flushAnimationFrames, countPendingFrames } = mockAnimationFrames();

    render(<StickerHarness />);

    const sticker = screen.getByTestId(STICKER_TEST_ID);

    fireEvent.pointerDown(sticker, { pointerId: 4, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(sticker, { pointerId: 4, clientX: 60, clientY: 10 });
    flushAnimationFrames();
    fireEvent.pointerMove(sticker, { pointerId: 4, clientX: 70, clientY: 10 });
    fireEvent.lostPointerCapture(sticker, { pointerId: 4 });

    expect(countPendingFrames()).toBe(0);
    expect(sticker).not.toHaveClass('is-dragging');
    expect(getOffset(sticker)).toEqual(RESTING);

    // A later move of the same pointer no longer drags.
    fireEvent.pointerMove(sticker, { pointerId: 4, clientX: 90, clientY: 10 });

    expect(countPendingFrames()).toBe(0);
  });

  it('ignores a second pointerdown and moves from another pointer during a drag', () => {
    const { flushAnimationFrames } = mockAnimationFrames();

    render(<StickerHarness />);

    const sticker = screen.getByTestId(STICKER_TEST_ID);

    fireEvent.pointerDown(sticker, { pointerId: 1, clientX: 0, clientY: 0 });
    fireEvent.pointerDown(sticker, { pointerId: 2, clientX: 200, clientY: 200 });
    fireEvent.pointerMove(sticker, { pointerId: 2, clientX: 80, clientY: 80 });
    flushAnimationFrames();

    expect(getOffset(sticker)).toEqual(UNSET);

    fireEvent.pointerMove(sticker, { pointerId: 1, clientX: 24, clientY: 8 });
    flushAnimationFrames();

    expect(getOffset(sticker)).toEqual({ x: '24px', y: '8px', tilt: '3deg' });

    fireEvent.pointerUp(sticker, { pointerId: 2 });

    expect(sticker).toHaveClass('is-dragging');

    fireEvent.pointerUp(sticker, { pointerId: 1 });

    expect(sticker).not.toHaveClass('is-dragging');
    expect(getOffset(sticker)).toEqual(RESTING);
  });

  it('does not drag with reduced motion', () => {
    mockReducedMotion(true);
    const { countPendingFrames } = mockAnimationFrames();

    render(<StickerHarness />);

    const sticker = screen.getByTestId(STICKER_TEST_ID);

    expect(sticker).toHaveAttribute('data-enabled', 'false');

    fireEvent.pointerDown(sticker, { pointerId: 1, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(sticker, { pointerId: 1, clientX: 140, clientY: 70 });

    expect(sticker).not.toHaveClass('is-dragging');
    expect(countPendingFrames()).toBe(0);
    expect(getOffset(sticker)).toEqual(UNSET);
  });

  it('resets a drag in progress when reduced motion turns on', () => {
    const { setMatches } = mockReducedMotion(false);
    const { flushAnimationFrames, countPendingFrames } = mockAnimationFrames();

    render(<StickerHarness />);

    const sticker = screen.getByTestId(STICKER_TEST_ID);

    fireEvent.pointerDown(sticker, { pointerId: 1, clientX: 0, clientY: 0 });
    fireEvent.pointerMove(sticker, { pointerId: 1, clientX: 40, clientY: 0 });
    flushAnimationFrames();
    fireEvent.pointerMove(sticker, { pointerId: 1, clientX: 60, clientY: 0 });
    setMatches(true);

    expect(sticker).toHaveAttribute('data-enabled', 'false');
    expect(sticker).not.toHaveClass('is-dragging');
    expect(countPendingFrames()).toBe(0);
    expect(getOffset(sticker)).toEqual(RESTING);
  });
});
