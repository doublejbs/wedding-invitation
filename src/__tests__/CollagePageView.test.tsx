import { act, fireEvent, render, screen, within } from '@testing-library/react';
import CollagePageView from '../components/collage/CollagePageView';
import HandwritingSlotId from '../enums/HandwritingSlotId';
import StickerKind from '../enums/StickerKind';
import { mockAnimationFrames, mockReducedMotion, restoreReducedMotion } from '../test/MotionTestUtils';

const EXPECTED_SECTION_LABELS = [
  '커버',
  '인사말',
  '사진 콜라주',
  '예식 안내',
  '오시는 길',
  '마음 전하실 곳',
  '참석 여부',
  '마무리',
];

const COLLAGE_SLOT_IDS = [
  HandwritingSlotId.COLLAGE_HEADLINE,
  HandwritingSlotId.COLLAGE_SIGNATURE,
  HandwritingSlotId.COLLAGE_WAITING,
  HandwritingSlotId.COLLAGE_CLOSING,
];

// Cover: date stamp, then the date label band. Wall: label, stamp, ticket stub.
const EXPECTED_DRAGGABLE_KINDS = [
  StickerKind.DATE_STAMP,
  StickerKind.LABEL,
  StickerKind.LABEL,
  StickerKind.STAMP,
  StickerKind.TICKET,
];

const DECORATIVE_KINDS = [StickerKind.TAPE, StickerKind.FILM, StickerKind.CORNER, StickerKind.DATE_STAMP, StickerKind.STAMP];

// Cover and closing carry an aria-label; the other sections are named by their visible h2.
const getSectionName = (section: Element) => {
  const labelledBy = section.getAttribute('aria-labelledby');

  if (labelledBy) {
    return document.getElementById(labelledBy)?.textContent ?? null;
  }

  return section.getAttribute('aria-label');
};

const getDraggableStickers = (container: HTMLElement) => {
  return Array.from(container.querySelectorAll<HTMLElement>('[data-draggable="true"]'));
};

describe('CollagePageView', () => {
  afterEach(() => {
    restoreReducedMotion();
    vi.restoreAllMocks();
    Reflect.deleteProperty(navigator, 'clipboard');
  });

  it('renders the eight sections in order, each with an accessible name', () => {
    const { container } = render(<CollagePageView />);
    const sections = Array.from(container.querySelectorAll('main > section'));

    expect(sections.map(getSectionName)).toEqual(EXPECTED_SECTION_LABELS);
    EXPECTED_SECTION_LABELS.forEach((label) => {
      expect(screen.getByRole('region', { name: label })).toBeInTheDocument();
    });
    expect(sections[0]).toHaveAttribute('aria-label', '커버');
    expect(sections[7]).toHaveAttribute('aria-label', '마무리');
    sections.slice(1, 7).forEach((section) => {
      expect(section).not.toHaveAttribute('aria-label');
      expect(section).toHaveAttribute('aria-labelledby');
    });
  });

  it('shows the names, the label-maker date and the date in body text on the cover', () => {
    render(<CollagePageView />);

    const cover = screen.getByRole('region', { name: '커버' });

    expect(within(cover).getByRole('heading', { level: 1 })).toHaveTextContent('Minjun & Seoyeon');
    expect(within(cover).getByText('2027.04.17 SAT 1PM')).toBeInTheDocument();
    expect(cover).toHaveTextContent('2027년 4월 17일 토요일 오후 1시');
    expect(cover).toHaveTextContent('스티커를 떼어 보세요');
  });

  it('renders the collage handwriting slots with the shared HandwritingView', () => {
    const { container } = render(<CollagePageView />);

    COLLAGE_SLOT_IDS.forEach((slotId) => {
      const slot = container.querySelector(`[data-slot="${slotId}"]`);

      expect(slot).not.toBeNull();
      expect(slot).toHaveClass('collage-handwriting');
    });
  });

  it('keeps decorative stickers hidden from assistive tech and ticket text readable', () => {
    const { container } = render(<CollagePageView />);

    DECORATIVE_KINDS.forEach((kind) => {
      const stickers = container.querySelectorAll(`[data-sticker="${kind}"]`);

      expect(stickers.length).toBeGreaterThan(0);
      stickers.forEach((sticker) => {
        expect(sticker.closest('[aria-hidden="true"]')).not.toBeNull();
      });
    });

    const ceremony = screen.getByRole('region', { name: '예식 안내' });
    const ticket = ceremony.querySelector(`[data-sticker="${StickerKind.TICKET}"]`);

    expect(ticket).not.toBeNull();
    expect(ticket?.closest('[aria-hidden="true"]')).toBeNull();
    expect(ticket).toHaveTextContent('ADMIT TWO');
  });

  it('makes exactly the five peelable stickers draggable', () => {
    const { container } = render(<CollagePageView />);
    const kinds = getDraggableStickers(container).map((sticker) => sticker.dataset.sticker);

    expect(kinds).toEqual(EXPECTED_DRAGGABLE_KINDS);
  });

  it('drags a cover sticker and springs it back on release', () => {
    const { flushAnimationFrames } = mockAnimationFrames();

    render(<CollagePageView />);

    const cover = screen.getByRole('region', { name: '커버' });
    const sticker = getDraggableStickers(cover)[0];

    expect(sticker).toBeDefined();

    fireEvent.pointerDown(sticker, { pointerId: 1, clientX: 50, clientY: 50 });
    fireEvent.pointerMove(sticker, { pointerId: 1, clientX: 74, clientY: 30 });
    flushAnimationFrames();

    expect(sticker.style.getPropertyValue('--sticker-x')).toBe('24px');
    expect(sticker.style.getPropertyValue('--sticker-tilt')).toBe('3deg');

    fireEvent.pointerUp(sticker, { pointerId: 1 });

    expect(sticker.style.getPropertyValue('--sticker-x')).toBe('0px');
    expect(sticker.style.getPropertyValue('--sticker-y')).toBe('0px');
  });

  it('turns sticker dragging off with reduced motion', () => {
    mockReducedMotion(true);

    const { container } = render(<CollagePageView />);

    expect(getDraggableStickers(container)).toHaveLength(0);

    const sticker = container.querySelector<HTMLElement>(`[data-sticker="${StickerKind.LABEL}"]`);

    if (!sticker) {
      throw new Error('label sticker not found');
    }

    fireEvent.pointerDown(sticker, { pointerId: 1, clientX: 50, clientY: 50 });
    fireEvent.pointerMove(sticker, { pointerId: 1, clientX: 90, clientY: 50 });

    expect(sticker.style.getPropertyValue('--sticker-x')).toBe('');
  });

  it('opens a collage photo in the lightbox, pages through the nine wall photos, and closes with Escape', () => {
    render(<CollagePageView />);

    const collage = screen.getByRole('region', { name: '사진 콜라주' });
    const photoButtons = within(collage).getAllByRole('button', { name: /크게 보기$/ });

    expect(photoButtons).toHaveLength(9);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const photoButton = within(collage).getByRole('button', { name: '베일 아래에서 입맞추는 두 사람 크게 보기' });

    fireEvent.click(photoButton);

    const dialog = screen.getByRole('dialog');

    expect(dialog.closest('.collage-lightbox')).not.toBeNull();
    expect(within(dialog).getByRole('img', { name: /베일 아래에서 입맞추는/ })).toHaveAttribute(
      'src',
      expect.stringContaining('photos/photo-07.jpg'),
    );
    expect(within(dialog).getByText('03 / 09')).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: '다음 사진' }));

    expect(within(dialog).getByText('04 / 09')).toBeInTheDocument();
    expect(within(dialog).getByRole('img', { name: /들판 한가운데|마주 보며 웃는/ })).toHaveAttribute(
      'src',
      expect.stringContaining('photos/photo-03.jpg'),
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(photoButton).toHaveFocus();
  });

  it('expands and collapses each account side and copies an account number', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    render(<CollagePageView />);

    const gift = screen.getByRole('region', { name: '마음 전하실 곳' });
    const groomToggle = within(gift).getByRole('button', { name: /신랑측/ });
    const brideToggle = within(gift).getByRole('button', { name: /신부측/ });

    expect(groomToggle).toHaveAttribute('aria-expanded', 'false');
    expect(brideToggle).toHaveAttribute('aria-expanded', 'false');
    expect(within(gift).queryByRole('button', { name: '신랑 김신랑 계좌번호 복사' })).not.toBeInTheDocument();

    fireEvent.click(groomToggle);

    expect(groomToggle).toHaveAttribute('aria-expanded', 'true');
    expect(brideToggle).toHaveAttribute('aria-expanded', 'false');

    await act(async () => {
      fireEvent.click(within(gift).getByRole('button', { name: '신랑 김신랑 계좌번호 복사' }));
    });

    expect(writeText).toHaveBeenCalledWith('○○은행 000-0000-0000-00');
    expect(within(gift).getByRole('status')).toHaveTextContent('복사되었습니다.');

    fireEvent.click(groomToggle);

    expect(groomToggle).toHaveAttribute('aria-expanded', 'false');
    expect(within(gift).queryByRole('button', { name: '신랑 김신랑 계좌번호 복사' })).not.toBeInTheDocument();
  });

  it('copies the venue address', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);

    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } });
    render(<CollagePageView />);

    const directions = screen.getByRole('region', { name: '오시는 길' });

    await act(async () => {
      fireEvent.click(within(directions).getByRole('button', { name: '주소 복사' }));
    });

    expect(writeText).toHaveBeenCalledWith('서울특별시 ○○구 ○○로 123');
    expect(within(directions).getAllByRole('link')).toHaveLength(3);
  });

  it('shows the mock notice when the attendance form is submitted', () => {
    render(<CollagePageView />);

    const attendance = screen.getByRole('region', { name: '참석 여부' });

    expect(within(attendance).getByText('*4월 1일까지 알려주세요')).toBeInTheDocument();
    expect(within(attendance).queryByText('시안에서는 저장되지 않습니다.')).not.toBeInTheDocument();

    fireEvent.change(within(attendance).getByLabelText(/성함/), { target: { value: '홍길동' } });
    fireEvent.click(within(attendance).getByRole('button', { name: '전달하기' }));

    expect(within(attendance).getByText('시안에서는 저장되지 않습니다.')).toBeInTheDocument();
  });

  it('shows the closing note and the draft notice', () => {
    render(<CollagePageView />);

    const closing = screen.getByRole('region', { name: '마무리' });

    expect(within(closing).getByRole('button', { name: '청첩장 링크 복사' })).toBeInTheDocument();
    expect(closing).toHaveTextContent('* 본 청첩장의 사진과 문구는 시안용 예시입니다.');
  });

  it('contains nothing heart-shaped or pink', () => {
    const { container } = render(<CollagePageView />);
    const html = container.innerHTML.toLowerCase();

    expect(html).not.toContain('heart');
    expect(html).not.toContain('pink');
    expect(html).not.toContain('♡');
    expect(html).not.toContain('♥');
  });
});
