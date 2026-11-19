import { act, fireEvent, render, screen, within } from '@testing-library/react';
import LaunchPageView from '../components/launch/LaunchPageView';
import { BRIDE_NAME, GROOM_NAME } from '../data/InvitationData';

const EXPECTED_SECTION_LABELS = [
  '히어로',
  '소개',
  '하이라이트',
  '숫자로 보는 우리',
  '갤러리',
  '예식 정보',
  '비교하기',
  '오시는 길',
  '참석 예약',
  '푸터',
];

describe('LaunchPageView', () => {
  it('renders the ten sections in order, each with an aria-label', () => {
    const { container } = render(<LaunchPageView />);

    const labels = Array.from(container.querySelectorAll('section')).map((section) =>
      section.getAttribute('aria-label'),
    );

    expect(labels).toEqual(EXPECTED_SECTION_LABELS);
  });

  it('shows the couple names in the navigation bar', () => {
    render(<LaunchPageView />);

    const nav = screen.getByRole('navigation');

    expect(nav).toHaveTextContent(`${GROOM_NAME} & ${BRIDE_NAME}`);
    expect(within(nav).getByRole('link', { name: '참석 예약' })).toHaveAttribute('href', '#rsvp');
  });

  it('switches the gallery photo set when a segment button is clicked', () => {
    render(<LaunchPageView />);

    const gallery = screen.getByRole('region', { name: '갤러리' });
    const studioTab = within(gallery).getByRole('tab', { name: '스튜디오' });
    const snapTab = within(gallery).getByRole('tab', { name: '스냅' });
    const dailyTab = within(gallery).getByRole('tab', { name: '일상' });

    expect(studioTab).toHaveAttribute('aria-selected', 'true');
    expect(within(gallery).getByRole('tabpanel')).toHaveTextContent('사진 1');

    fireEvent.click(snapTab);

    const snapPanel = within(gallery).getByRole('tabpanel');

    expect(snapTab).toHaveAttribute('aria-selected', 'true');
    expect(studioTab).toHaveAttribute('aria-selected', 'false');
    expect(snapPanel).toHaveTextContent('사진 5');
    expect(snapPanel).not.toHaveTextContent('사진 1');

    fireEvent.click(dailyTab);

    expect(within(gallery).getByRole('tabpanel')).toHaveTextContent('사진 9');
    expect(within(gallery).getByRole('tabpanel')).not.toHaveTextContent('사진 5');
  });

  it('opens the RSVP sheet and shows the mock notice on submit', () => {
    render(<LaunchPageView />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '참석 의사 전하기' }));

    const dialog = screen.getByRole('dialog');

    expect(within(dialog).getByLabelText('이름')).toBeInTheDocument();
    expect(within(dialog).getByRole('radio', { name: '참석' })).toBeInTheDocument();
    expect(within(dialog).getByLabelText('인원')).toBeInTheDocument();
    expect(within(dialog).getByRole('group', { name: '식사 여부' })).toBeInTheDocument();
    expect(screen.queryByText('시안에서는 저장되지 않습니다.')).not.toBeInTheDocument();

    fireEvent.change(within(dialog).getByLabelText('이름'), { target: { value: '홍길동' } });
    fireEvent.click(within(dialog).getByRole('button', { name: '전달하기' }));

    expect(within(dialog).getByRole('status')).toHaveTextContent('시안에서는 저장되지 않습니다.');
  });

  it('closes the RSVP sheet with the close button', () => {
    render(<LaunchPageView />);

    fireEvent.click(screen.getByRole('button', { name: '참석 의사 전하기' }));
    fireEvent.click(screen.getByRole('button', { name: '닫기' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('moves between gallery tabs with arrow keys using a roving tabindex', () => {
    render(<LaunchPageView />);

    const gallery = screen.getByRole('region', { name: '갤러리' });
    const studioTab = within(gallery).getByRole('tab', { name: '스튜디오' });
    const snapTab = within(gallery).getByRole('tab', { name: '스냅' });
    const dailyTab = within(gallery).getByRole('tab', { name: '일상' });

    expect(studioTab).toHaveAttribute('tabindex', '0');
    expect(snapTab).toHaveAttribute('tabindex', '-1');

    studioTab.focus();
    fireEvent.keyDown(studioTab, { key: 'ArrowRight' });

    expect(snapTab).toHaveAttribute('aria-selected', 'true');
    expect(snapTab).toHaveAttribute('tabindex', '0');
    expect(studioTab).toHaveAttribute('tabindex', '-1');
    expect(snapTab).toHaveFocus();
    expect(within(gallery).getByRole('tabpanel')).toHaveTextContent('사진 5');

    fireEvent.keyDown(snapTab, { key: 'ArrowLeft' });
    fireEvent.keyDown(studioTab, { key: 'ArrowLeft' });

    expect(dailyTab).toHaveAttribute('aria-selected', 'true');
    expect(dailyTab).toHaveFocus();
  });

  it('makes the rest of the page inert while the RSVP sheet is open and restores it on close', () => {
    render(<LaunchPageView />);

    const nav = screen.getByRole('navigation');
    const trigger = screen.getByRole('button', { name: '참석 의사 전하기' });

    // A real click focuses the button; fireEvent.click does not.
    trigger.focus();
    fireEvent.click(trigger);

    const dialog = screen.getByRole('dialog');

    expect(nav.closest('[inert]')).not.toBeNull();
    expect(trigger.closest('[inert]')).not.toBeNull();
    expect(dialog.closest('[inert]')).toBeNull();
    expect(within(dialog).getByLabelText('이름')).toHaveFocus();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.querySelector('[inert]')).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it('pins the hero scroll progress as a CSS variable on the section', () => {
    render(<LaunchPageView />);

    const hero = screen.getByRole('region', { name: '히어로' });

    expect(hero.style.getPropertyValue('--hero-progress')).not.toBe('');
  });

  it('opens web map services in a new tab and the Tmap app link in place', () => {
    render(<LaunchPageView />);

    const location = screen.getByRole('region', { name: '오시는 길' });

    ['네이버 지도', '카카오맵'].forEach((name) => {
      const link = within(location).getByRole('link', { name });

      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    const tmapLink = within(location).getByRole('link', { name: '티맵' });

    expect(tmapLink).not.toHaveAttribute('target');
    expect(tmapLink).toHaveAttribute('rel', 'noopener noreferrer');
    expect(tmapLink).toHaveAccessibleDescription('앱에서 열림');
  });

  describe('address copy button', () => {
    const originalClipboard = Object.getOwnPropertyDescriptor(navigator, 'clipboard');

    const mockClipboard = (writeText: () => Promise<void>) => {
      Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true });
    };

    afterEach(() => {
      if (originalClipboard) {
        Object.defineProperty(navigator, 'clipboard', originalClipboard);
      } else {
        Reflect.deleteProperty(navigator, 'clipboard');
      }
    });

    const clickCopyAddress = async () => {
      const location = screen.getByRole('region', { name: '오시는 길' });
      const button = within(location).getByRole('button', { name: '주소 복사' });

      await act(async () => {
        fireEvent.click(button);
      });

      return { location, button };
    };

    it('shows "완료" after a successful copy', async () => {
      mockClipboard(vi.fn().mockResolvedValue(undefined));
      render(<LaunchPageView />);

      const { location, button } = await clickCopyAddress();

      expect(button).toHaveTextContent('완료');
      expect(within(location).getByRole('status')).toHaveTextContent('복사되었습니다.');
    });

    it('keeps the original label and shows a failure message when copying fails', async () => {
      mockClipboard(vi.fn().mockRejectedValue(new Error('denied')));
      render(<LaunchPageView />);

      const { location, button } = await clickCopyAddress();

      expect(button).toHaveTextContent('주소 복사');
      expect(button).not.toHaveTextContent('완료');
      expect(within(location).getByRole('status')).toHaveTextContent('복사하지 못했습니다.');
    });
  });
});
