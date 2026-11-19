import type { CSSProperties } from 'react';
import HeartPosition from '../enums/HeartPosition';
import HeartShape from '../enums/HeartShape';
import {
  BRIDE_FATHER,
  BRIDE_MOTHER,
  BRIDE_NAME,
  COUPLE_IMAGE_ALT,
  COUPLE_IMAGE_SRC,
  GROOM_FATHER,
  GROOM_MOTHER,
  GROOM_NAME,
} from '../data/InvitationData';
import HeartStickerView from './HeartStickerView';

// Whole envelope (open flap, inner card, front pocket) on a transparent canvas.
const ENVELOPE_FULL_SRC = `${import.meta.env.BASE_URL}images/envelope-full.png`;

// Same canvas with only the front pocket opaque; drawn over the photo so it looks tucked in.
const ENVELOPE_POCKET_SRC = `${import.meta.env.BASE_URL}images/envelope-pocket.png`;

const ENVELOPE_IMAGE_WIDTH = 696;

const ENVELOPE_IMAGE_HEIGHT = 864;

// Feeds the box aspect ratio in CSS from the image size.
const ENVELOPE_BOX_STYLE = {
  '--envelope-image-width': ENVELOPE_IMAGE_WIDTH,
  '--envelope-image-height': ENVELOPE_IMAGE_HEIGHT,
} as CSSProperties;

const EnvelopeCoverView = () => {
  return (
    <section className="envelope" data-testid="envelope-cover" aria-label="청첩장 봉투">
      <div className="envelope__box" style={ENVELOPE_BOX_STYLE}>
        <img
          className="envelope__layer"
          src={ENVELOPE_FULL_SRC}
          alt=""
          aria-hidden="true"
          width={ENVELOPE_IMAGE_WIDTH}
          height={ENVELOPE_IMAGE_HEIGHT}
        />
        <img className="envelope__photo" src={COUPLE_IMAGE_SRC} alt={COUPLE_IMAGE_ALT} />
        <img
          className="envelope__layer"
          src={ENVELOPE_POCKET_SRC}
          alt=""
          aria-hidden="true"
          width={ENVELOPE_IMAGE_WIDTH}
          height={ENVELOPE_IMAGE_HEIGHT}
        />
        <p className="envelope__names">
          <span className="envelope__name-line envelope__name-line--groom-parents">{`${GROOM_FATHER}·${GROOM_MOTHER}의 아들`}</span>
          <span className="envelope__name-line envelope__name-line--groom">{GROOM_NAME}</span>
          <span className="envelope__name-line envelope__name-line--bride-parents">{`${BRIDE_FATHER}·${BRIDE_MOTHER}의 딸`}</span>
          <span className="envelope__name-line envelope__name-line--bride">{BRIDE_NAME}</span>
        </p>
        <HeartStickerView position={HeartPosition.ENVELOPE_TOP} shape={HeartShape.DOUBLE} />
      </div>
    </section>
  );
};

export default EnvelopeCoverView;
