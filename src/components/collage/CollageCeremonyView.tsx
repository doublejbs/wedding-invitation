import {
  CEREMONY_STAMP_PHOTO_ID,
  CEREMONY_STAMP_PIECE,
  CEREMONY_TICKET_PIECE,
  COLLAGE_DATE_LABEL,
  TICKET_TITLE,
} from '../../data/CollageData';
import { EDITORIAL_CEREMONY_ROWS } from '../../data/EditorialData';
import { HANDWRITING_SLOTS } from '../../data/HandwritingSlotData';
import { VENUE_HALL, VENUE_NAME } from '../../data/InvitationData';
import HandwritingSlotId from '../../enums/HandwritingSlotId';
import StrokeShape from '../../enums/StrokeShape';
import { findEditorialPhoto } from '../../utils/EditorialPhotoUtils';
import HandDrawnStrokeView from '../shared/HandDrawnStrokeView';
import HandwritingView from '../shared/HandwritingView';
import CollageSectionHeadingView from './CollageSectionHeadingView';
import StampStickerView from './StampStickerView';
import StuckOnView from './StuckOnView';
import TicketStickerView from './TicketStickerView';

const HEADING_ID = 'collage-ceremony-heading';

const TICKET_LINES = [COLLAGE_DATE_LABEL, VENUE_NAME, VENUE_HALL];

const CollageCeremonyView = () => {
  const stampPhoto = findEditorialPhoto(CEREMONY_STAMP_PHOTO_ID);

  return (
    <section className="collage-section collage-ceremony" aria-labelledby={HEADING_ID}>
      <CollageSectionHeadingView id={HEADING_ID} number="03" englishTitle="Ceremony" title="예식 안내" />
      <div className="collage-ceremony__board">
        <StuckOnView {...CEREMONY_TICKET_PIECE} className="collage-ceremony__ticket">
          <TicketStickerView title={TICKET_TITLE} lines={TICKET_LINES} />
        </StuckOnView>
        {stampPhoto && (
          <StuckOnView {...CEREMONY_STAMP_PIECE} className="collage-ceremony__stamp">
            <StampStickerView photo={stampPhoto} />
          </StuckOnView>
        )}
      </div>
      <p className="collage-ceremony__waiting">
        <HandwritingView slot={HANDWRITING_SLOTS[HandwritingSlotId.COLLAGE_WAITING]} classPrefix="collage" />
        <HandDrawnStrokeView
          shape={StrokeShape.UNDERLINE}
          slot={HANDWRITING_SLOTS[HandwritingSlotId.COLLAGE_UNDERLINE]}
          className="collage-stroke--red collage-ceremony__underline"
          classPrefix="collage"
        />
      </p>
      <dl className="collage-list">
        {EDITORIAL_CEREMONY_ROWS.map((row) => (
          <div key={row.label} className="collage-list__row">
            <dt className="collage-list__label collage-mono">{row.label}</dt>
            <dd className="collage-list__value">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
};

export default CollageCeremonyView;
