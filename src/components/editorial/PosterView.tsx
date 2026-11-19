import { useRef } from 'react';
import {
  BRIDE_ENGLISH_NAME,
  EDITORIAL_PHOTOS,
  GROOM_ENGLISH_NAME,
  INVITATION_LINES,
  POSTER_DATE_SPEED,
  POSTER_DESIGN_HEIGHT,
  POSTER_DESIGN_WIDTH,
  POSTER_NOTE_PLACEMENTS,
  POSTER_PHOTO_PLACEMENTS,
} from '../../data/EditorialData';
import { HANDWRITING_SLOTS } from '../../data/HandwritingSlotData';
import { WEDDING_DATE_TIME } from '../../data/InvitationData';
import HandwritingSlotId from '../../enums/HandwritingSlotId';
import StrokeShape from '../../enums/StrokeShape';
import useParallaxDrift from '../../hooks/useParallaxDrift';
import { convertToPercent, createCssVariables } from '../../utils/CssVariableUtils';
import { formatKoreanDateTime, formatShortDotDate } from '../../utils/WeddingDateUtils';
import HandDrawnStrokeView from '../shared/HandDrawnStrokeView';
import HandwritingView from '../shared/HandwritingView';
import ScatteredPhotoView from './ScatteredPhotoView';

const DRIFT_PROPERTY = '--editorial-drift';

const DATE_STYLE = createCssVariables({ '--drift-speed': POSTER_DATE_SPEED });

const getPhotoSpeed = (photoId: string) => {
  return POSTER_PHOTO_PLACEMENTS.find((placement) => placement.photoId === photoId)?.speed ?? 0;
};

interface Props {
  onOpenPhoto: (photoId: string, trigger: HTMLElement) => void;
}

const PosterView = ({ onOpenPhoto }: Props) => {
  const posterRef = useRef<HTMLElement>(null);

  useParallaxDrift(posterRef, DRIFT_PROPERTY);

  return (
    <section ref={posterRef} className="editorial-poster" aria-label="포스터">
      <div className="editorial-poster__canvas">
        {POSTER_PHOTO_PLACEMENTS.map((placement) => {
          const photo = EDITORIAL_PHOTOS.find((candidate) => candidate.id === placement.photoId);

          if (!photo) {
            return null;
          }

          return <ScatteredPhotoView key={placement.photoId} photo={photo} placement={placement} onOpen={onOpenPhoto} />;
        })}

        {POSTER_NOTE_PLACEMENTS.map((note) => {
          const style = createCssVariables({
            '--note-x': convertToPercent(note.x, POSTER_DESIGN_WIDTH),
            '--note-y': convertToPercent(note.y, POSTER_DESIGN_HEIGHT),
            '--drift-speed': getPhotoSpeed(note.photoId),
          });

          return (
            <p key={note.slotId} className="editorial-poster__note editorial-drift" style={style}>
              <HandDrawnStrokeView shape={StrokeShape.ARROW} rotationDeg={note.arrowRotationDeg} />
              <HandwritingView slot={HANDWRITING_SLOTS[note.slotId]} />
            </p>
          );
        })}

        <p className="editorial-poster__date editorial-drift" style={DATE_STYLE}>
          <time dateTime={WEDDING_DATE_TIME.toISOString()} aria-label={formatKoreanDateTime(WEDDING_DATE_TIME)}>
            {formatShortDotDate(WEDDING_DATE_TIME)}
          </time>
          <HandDrawnStrokeView
            shape={StrokeShape.CIRCLE}
            slot={HANDWRITING_SLOTS[HandwritingSlotId.DATE_CIRCLE]}
            className="editorial-poster__date-circle"
          />
        </p>

        <div className="editorial-poster__names">
          <h1 className="editorial-poster__title">
            <span className="editorial-poster__title-line">{GROOM_ENGLISH_NAME}</span>
            <span className="editorial-poster__title-line">&amp;</span>
            <span className="editorial-poster__title-line">{BRIDE_ENGLISH_NAME}</span>
          </h1>
        </div>

        {/* Outside the blended names block, so the ink keeps its own color. */}
        <HandwritingView slot={HANDWRITING_SLOTS[HandwritingSlotId.NAMES]} className="editorial-poster__names-ink" />

        <div className="editorial-poster__invitation">
          <p className="editorial-poster__copy">
            {INVITATION_LINES.map((line) => (
              <span key={line} className="editorial-poster__copy-line">
                {line}
              </span>
            ))}
          </p>
          <HandDrawnStrokeView
            shape={StrokeShape.UNDERLINE}
            slot={HANDWRITING_SLOTS[HandwritingSlotId.UNDERLINE]}
            className="editorial-poster__underline"
          />
        </div>
      </div>
    </section>
  );
};

export default PosterView;
