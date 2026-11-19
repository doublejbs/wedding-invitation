import {
  GREETING_CARD_PIECE,
  GREETING_PARENT_LINES,
  GREETING_PHOTO_ID,
  GREETING_PHOTO_PIECE,
  GREETING_PHOTO_TAPE,
} from '../../data/CollageData';
import { HANDWRITING_SLOTS } from '../../data/HandwritingSlotData';
import { GREETING_PARAGRAPHS } from '../../data/InvitationData';
import HandwritingSlotId from '../../enums/HandwritingSlotId';
import { findEditorialPhoto } from '../../utils/EditorialPhotoUtils';
import HandwritingView from '../shared/HandwritingView';
import CollageSectionHeadingView from './CollageSectionHeadingView';
import FramedPhotoView from './FramedPhotoView';
import PaperView from './PaperView';
import StuckOnView from './StuckOnView';

const HEADING_ID = 'collage-greeting-heading';

const CollageGreetingView = () => {
  const photo = findEditorialPhoto(GREETING_PHOTO_ID);

  return (
    <section className="collage-section collage-greeting" aria-labelledby={HEADING_ID}>
      <CollageSectionHeadingView id={HEADING_ID} number="01" englishTitle="Greeting" title="인사말" />
      <div className="collage-greeting__board">
        {photo && (
          <StuckOnView {...GREETING_PHOTO_PIECE} className="collage-greeting__photo">
            <FramedPhotoView photo={photo} tape={GREETING_PHOTO_TAPE} />
          </StuckOnView>
        )}
        <p className="collage-greeting__memo">
          <HandwritingView slot={HANDWRITING_SLOTS[HandwritingSlotId.COLLAGE_GREETING_NOTE]} classPrefix="collage" />
        </p>
        <StuckOnView {...GREETING_CARD_PIECE} className="collage-greeting__card">
          <PaperView>
            {GREETING_PARAGRAPHS.map((paragraph) => (
              <p key={paragraph[0].text} className="collage-greeting__paragraph">
                {paragraph.map((line) => (
                  <span key={line.text} className="collage-greeting__line">
                    {line.text}
                  </span>
                ))}
              </p>
            ))}
            <p className="collage-greeting__signature">
              <HandwritingView slot={HANDWRITING_SLOTS[HandwritingSlotId.COLLAGE_SIGNATURE]} classPrefix="collage" />
            </p>
            <ul className="collage-parents">
              {GREETING_PARENT_LINES.map((line) => (
                <li key={line.name} className="collage-parents__line">
                  <span className="collage-parents__names">{line.parents}</span>
                  <span className="collage-parents__relation">{line.relation}</span>
                  <strong className="collage-parents__child">{line.name}</strong>
                </li>
              ))}
            </ul>
          </PaperView>
        </StuckOnView>
      </div>
    </section>
  );
};

export default CollageGreetingView;
