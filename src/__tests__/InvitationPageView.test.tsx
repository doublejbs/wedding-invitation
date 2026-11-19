import { render, screen } from '@testing-library/react';
import InvitationPageView from '../components/InvitationPageView';
import {
  BRIDE_FATHER,
  BRIDE_MOTHER,
  BRIDE_NAME,
  CLOSING_LINE,
  GREETING_PARAGRAPHS,
  GROOM_FATHER,
  GROOM_MOTHER,
  GROOM_NAME,
  SIGNATURE_LINE,
} from '../data/InvitationData';

describe('InvitationPageView', () => {
  it('renders parents and couple names on the envelope', () => {
    render(<InvitationPageView />);

    const envelope = screen.getByTestId('envelope-cover');

    expect(envelope).toHaveTextContent(`${GROOM_FATHER}·${GROOM_MOTHER}의 아들`);
    expect(envelope).toHaveTextContent(GROOM_NAME);
    expect(envelope).toHaveTextContent(`${BRIDE_FATHER}·${BRIDE_MOTHER}의 딸`);
    expect(envelope).toHaveTextContent(BRIDE_NAME);
  });

  it('renders greeting paragraphs, closing and signature', () => {
    render(<InvitationPageView />);

    const greeting = screen.getByTestId('greeting');

    GREETING_PARAGRAPHS.flat().forEach((line) => {
      expect(greeting).toHaveTextContent(line.text);
    });

    expect(screen.getByText(CLOSING_LINE)).toBeInTheDocument();
    expect(screen.getByText(SIGNATURE_LINE)).toBeInTheDocument();
  });

  it('applies the per-line rotation from data to each greeting line', () => {
    render(<InvitationPageView />);

    GREETING_PARAGRAPHS.flat().forEach((line) => {
      expect(screen.getByText(line.text)).toHaveStyle({ transform: `rotate(${line.rotationDeg}deg)` });
    });
  });

  it('renders two decorative heart stickers hidden from assistive tech', () => {
    render(<InvitationPageView />);

    const hearts = screen.getAllByTestId('heart-sticker');

    expect(hearts).toHaveLength(2);
    hearts.forEach((heart) => {
      expect(heart).toHaveAttribute('aria-hidden', 'true');
    });
  });
});
