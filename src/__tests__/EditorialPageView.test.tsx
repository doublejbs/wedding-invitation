import { fireEvent, render, screen, within } from '@testing-library/react';
import EditorialPageView from '../components/editorial/EditorialPageView';

const EXPECTED_REGION_LABELS = ['포스터', '정보 띠', '안내', '마무리'];

const PANEL_TITLES = ['예식 안내', '오시는 길', '마음 전하실 곳', '참석 여부'];

const getPanelButton = (title: string) => {
  return screen.getByRole('button', { name: new RegExp(title) });
};

describe('EditorialPageView', () => {
  it('renders poster, info ticker, four accordion panels and closing in order', () => {
    const { container } = render(<EditorialPageView />);

    const labels = Array.from(container.querySelectorAll('main > section')).map((section) =>
      section.getAttribute('aria-label'),
    );

    expect(labels).toEqual(EXPECTED_REGION_LABELS);

    const accordion = screen.getByRole('region', { name: '안내' });
    const panelButtons = within(accordion).getAllByRole('button', { expanded: false });

    expect(panelButtons).toHaveLength(4);
    PANEL_TITLES.forEach((title, index) => {
      expect(panelButtons[index]).toHaveTextContent(title);
    });
  });

  it('opens one accordion panel at a time with an "n / 4" counter and closes it', () => {
    render(<EditorialPageView />);

    const ceremonyButton = getPanelButton('예식 안내');
    const directionsButton = getPanelButton('오시는 길');
    const ceremonyRegion = screen.getByRole('region', { name: /예식 안내/ });
    const directionsRegion = screen.getByRole('region', { name: /오시는 길/ });

    expect(ceremonyRegion).toHaveAttribute('inert');

    fireEvent.click(ceremonyButton);

    expect(ceremonyButton).toHaveAttribute('aria-expanded', 'true');
    expect(ceremonyRegion).not.toHaveAttribute('inert');
    expect(within(ceremonyRegion).getByText('1 / 4')).toBeInTheDocument();
    expect(ceremonyRegion).toHaveTextContent('함께해 주시면 큰 기쁨이겠습니다.');

    fireEvent.click(directionsButton);

    expect(directionsButton).toHaveAttribute('aria-expanded', 'true');
    expect(ceremonyButton).toHaveAttribute('aria-expanded', 'false');
    expect(ceremonyRegion).toHaveAttribute('inert');
    expect(directionsRegion).not.toHaveAttribute('inert');
    expect(within(directionsRegion).getByText('2 / 4')).toBeInTheDocument();

    fireEvent.click(within(directionsRegion).getByRole('button', { name: '닫기' }));

    PANEL_TITLES.forEach((title) => {
      expect(getPanelButton(title)).toHaveAttribute('aria-expanded', 'false');
    });
    expect(directionsRegion).toHaveAttribute('inert');
    expect(directionsButton).toHaveFocus();
  });

  it('keeps the toggle names clean of decorative handwriting', () => {
    render(<EditorialPageView />);

    expect(screen.getByRole('button', { name: '04 참석 여부 RSVP' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '01 예식 안내 Ceremony' })).toBeInTheDocument();
  });

  it('shows the mock notice when the attendance form is submitted', () => {
    render(<EditorialPageView />);

    fireEvent.click(getPanelButton('참석 여부'));

    const panel = screen.getByRole('region', { name: /참석 여부/ });

    expect(within(panel).getByText('*4월 1일까지 알려주세요')).toBeInTheDocument();
    expect(within(panel).queryByText('시안에서는 저장되지 않습니다.')).not.toBeInTheDocument();

    fireEvent.change(within(panel).getByLabelText(/이름/), { target: { value: '홍길동' } });
    fireEvent.click(within(panel).getByRole('button', { name: '전달하기' }));

    expect(within(panel).getByText('시안에서는 저장되지 않습니다.')).toBeInTheDocument();
  });

  it('opens the lightbox when a poster photo is tapped and closes it with Escape', () => {
    render(<EditorialPageView />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    const photoButton = screen.getByRole('button', { name: '베일 아래에서 입맞추는 두 사람 크게 보기' });

    fireEvent.click(photoButton);

    const dialog = screen.getByRole('dialog');

    expect(within(dialog).getByRole('img', { name: /베일 아래에서 입맞추는/ })).toHaveAttribute(
      'src',
      expect.stringContaining('photos/photo-07.jpg'),
    );
    expect(within(dialog).getByText('07 / 15')).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: '다음 사진' }));

    expect(within(dialog).getByText('08 / 15')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(photoButton).toHaveFocus();
  });
});
