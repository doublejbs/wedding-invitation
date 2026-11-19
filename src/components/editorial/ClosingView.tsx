import { CLOSING_CAPTION, EDITORIAL_FOOTNOTE } from '../../data/EditorialData';
import { HANDWRITING_SLOTS } from '../../data/HandwritingSlotData';
import HandwritingSlotId from '../../enums/HandwritingSlotId';
import HandwritingView from '../shared/HandwritingView';

const ClosingView = () => {
  return (
    <section className="editorial-closing" aria-label="마무리">
      <p className="editorial-closing__signature">
        <HandwritingView slot={HANDWRITING_SLOTS[HandwritingSlotId.SIGNATURE]} />
      </p>
      <p className="editorial-closing__caption editorial-mono">{CLOSING_CAPTION}</p>
      <p className="editorial-closing__footnote">{EDITORIAL_FOOTNOTE}</p>
    </section>
  );
};

export default ClosingView;
