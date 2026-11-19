import { CLOSING_PHOTO_ID, CLOSING_PHOTO_PIECE, PAGE_LINK_COPY_KEY } from '../../data/CollageData';
import { HANDWRITING_SLOTS } from '../../data/HandwritingSlotData';
import { FOOTER_NOTE } from '../../data/InvitationData';
import HandwritingSlotId from '../../enums/HandwritingSlotId';
import useClipboardCopy from '../../hooks/useClipboardCopy';
import { findEditorialPhoto } from '../../utils/EditorialPhotoUtils';
import CopyButtonView from '../shared/CopyButtonView';
import HandwritingView from '../shared/HandwritingView';
import FramedPhotoView from './FramedPhotoView';
import StuckOnView from './StuckOnView';

const CollageClosingView = () => {
  const { copyFeedback, handleCopy } = useClipboardCopy();
  const photo = findEditorialPhoto(CLOSING_PHOTO_ID);

  return (
    <section className="collage-section collage-closing" aria-label="마무리">
      <div className="collage-closing__board">
        {photo && (
          <StuckOnView {...CLOSING_PHOTO_PIECE} className="collage-closing__photo">
            <FramedPhotoView photo={photo} className="collage-print--borderless" />
          </StuckOnView>
        )}
        <p className="collage-closing__note">
          <HandwritingView slot={HANDWRITING_SLOTS[HandwritingSlotId.COLLAGE_CLOSING]} classPrefix="collage" />
        </p>
      </div>
      <CopyButtonView
        className="collage-copy-button collage-closing__copy"
        copyKey={PAGE_LINK_COPY_KEY}
        text={window.location.href}
        label="링크 복사"
        accessibleLabel="청첩장 링크 복사"
        copyFeedback={copyFeedback}
        onCopy={handleCopy}
      />
      <p className="collage-feedback" role="status">
        {copyFeedback?.message ?? ''}
      </p>
      <p className="collage-closing__footnote">{FOOTER_NOTE}</p>
    </section>
  );
};

export default CollageClosingView;
