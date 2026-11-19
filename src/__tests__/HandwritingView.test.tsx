import { act, render, screen } from '@testing-library/react';
import HandwritingView from '../components/shared/HandwritingView';
import HandwritingSlotId from '../enums/HandwritingSlotId';
import type { HandwritingSlot } from '../types/HandwritingSlot';

const TEXT_SLOT: HandwritingSlot = {
  id: HandwritingSlotId.PHOTO_NOTE_1,
  text: '제주, 여름',
  width: 120,
  rotationDeg: -4,
};

// Observer that reports the target as barely visible (below the 0.2 reveal threshold).
class BarelyVisibleObserver {
  private readonly callback: IntersectionObserverCallback;

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
  }

  observe = (target: Element) => {
    const entry = { isIntersecting: true, target, intersectionRatio: 0.05 } as IntersectionObserverEntry;

    this.callback([entry], this as unknown as IntersectionObserver);
  };

  unobserve = () => {};

  disconnect = () => {};

  takeRecords = () => {
    return [];
  };
}

const getSlotRoot = (container: HTMLElement) => {
  return container.querySelector('.editorial-handwriting');
};

describe('HandwritingView', () => {
  const originalObserver = window.IntersectionObserver;

  afterEach(() => {
    window.IntersectionObserver = originalObserver;
    vi.useRealTimers();
  });

  it('reveals the ink once the slot is in view', () => {
    const { container } = render(<HandwritingView slot={TEXT_SLOT} />);

    expect(getSlotRoot(container)).toHaveClass('is-revealed');
  });

  it('reveals immediately when IntersectionObserver is not available', () => {
    Reflect.deleteProperty(window, 'IntersectionObserver');

    const { container } = render(<HandwritingView slot={TEXT_SLOT} />);

    expect(getSlotRoot(container)).toHaveClass('is-revealed');
  });

  it('falls back to revealing after a delay when only partly visible', () => {
    vi.useFakeTimers();
    window.IntersectionObserver = BarelyVisibleObserver as unknown as typeof IntersectionObserver;

    const { container } = render(<HandwritingView slot={TEXT_SLOT} />);

    expect(getSlotRoot(container)).not.toHaveClass('is-revealed');

    act(() => {
      vi.advanceTimersByTime(2500);
    });

    expect(getSlotRoot(container)).toHaveClass('is-revealed');
  });

  it('renders the placeholder text when the slot has no src', () => {
    const { container } = render(<HandwritingView slot={TEXT_SLOT} />);

    expect(screen.getByText('제주, 여름')).toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();
  });

  it('renders an image with the slot text as alt when the slot has a src', () => {
    const slot: HandwritingSlot = { ...TEXT_SLOT, src: '/handwriting/photo-note-1.svg' };

    render(<HandwritingView slot={slot} />);

    const image = screen.getByRole('img', { name: '제주, 여름' });

    expect(image).toHaveAttribute('src', '/handwriting/photo-note-1.svg');
    expect(image).toHaveAttribute('width', '120');
    expect(screen.queryByText('제주, 여름')).not.toBeInTheDocument();
  });
});
