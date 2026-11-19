import { useRef } from 'react';
import {
  COLLAGE_DATE_LABEL,
  COVER_DESIGN_HEIGHT,
  COVER_DESIGN_WIDTH,
  COVER_HINT,
  COVER_LABEL_PIECE,
  COVER_PHOTO_PLACEMENTS,
  COVER_STICKER_PLACEMENTS,
} from '../../data/CollageData';
import { BRIDE_ENGLISH_NAME, GROOM_ENGLISH_NAME } from '../../data/EditorialData';
import { HANDWRITING_SLOTS } from '../../data/HandwritingSlotData';
import { VENUE_HALL, VENUE_NAME, WEDDING_DATE_TIME } from '../../data/InvitationData';
import HandwritingSlotId from '../../enums/HandwritingSlotId';
import StrokeShape from '../../enums/StrokeShape';
import useParallaxDrift from '../../hooks/useParallaxDrift';
import { findEditorialPhoto } from '../../utils/EditorialPhotoUtils';
import { formatKoreanDateTime } from '../../utils/WeddingDateUtils';
import HandDrawnStrokeView from '../shared/HandDrawnStrokeView';
import HandwritingView from '../shared/HandwritingView';
import CollagePieceView from './CollagePieceView';
import FramedPhotoView from './FramedPhotoView';
import LabelStickerView from './LabelStickerView';
import StickerArtView from './StickerArtView';
import StuckOnView from './StuckOnView';

const DRIFT_PROPERTY = '--collage-drift';

const CollageCoverView = () => {
  const coverRef = useRef<HTMLElement>(null);

  useParallaxDrift(coverRef, DRIFT_PROPERTY);

  return (
    <section ref={coverRef} className="collage-cover" aria-label="커버">
      <div className="collage-cover__canvas">
        {COVER_PHOTO_PLACEMENTS.map((placement) => {
          const photo = findEditorialPhoto(placement.photoId);

          if (!photo) {
            return null;
          }

          return (
            <CollagePieceView
              key={placement.photoId}
              placement={placement}
              designWidth={COVER_DESIGN_WIDTH}
              designHeight={COVER_DESIGN_HEIGHT}
              speed={placement.speed}
            >
              <FramedPhotoView photo={photo} tape={placement.tape} corners={placement.corners} isEager />
            </CollagePieceView>
          );
        })}

        {COVER_STICKER_PLACEMENTS.map((placement) => (
          <CollagePieceView
            key={placement.id}
            placement={placement}
            designWidth={COVER_DESIGN_WIDTH}
            designHeight={COVER_DESIGN_HEIGHT}
            className="collage-piece--sticker"
          >
            <StickerArtView placement={placement} />
          </CollagePieceView>
        ))}
      </div>

      <div className="collage-cover__text">
        <p className="collage-cover__headline">
          <HandwritingView slot={HANDWRITING_SLOTS[HandwritingSlotId.COLLAGE_HEADLINE]} classPrefix="collage" />
        </p>
        <h1 className="collage-cover__names">
          {GROOM_ENGLISH_NAME} <span className="collage-cover__amp">&amp;</span> {BRIDE_ENGLISH_NAME}
        </h1>
        <StuckOnView {...COVER_LABEL_PIECE} className="collage-cover__label">
          <LabelStickerView
            text={COLLAGE_DATE_LABEL}
            isDraggable
            overlay={
              <HandDrawnStrokeView
                shape={StrokeShape.CIRCLE}
                slot={HANDWRITING_SLOTS[HandwritingSlotId.COLLAGE_DATE_CIRCLE]}
                className="collage-stroke--red collage-cover__circle"
                classPrefix="collage"
              />
            }
          />
        </StuckOnView>
        <p className="collage-cover__when">
          <time dateTime={WEDDING_DATE_TIME.toISOString()}>{formatKoreanDateTime(WEDDING_DATE_TIME)}</time>
          <span className="collage-cover__venue">{`${VENUE_NAME} ${VENUE_HALL}`}</span>
        </p>
        <p className="collage-cover__hint collage-mono">{COVER_HINT}</p>
      </div>
    </section>
  );
};

export default CollageCoverView;
