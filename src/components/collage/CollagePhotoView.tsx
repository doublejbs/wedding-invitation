import type { MouseEvent } from 'react';
import { HANDWRITING_SLOTS } from '../../data/HandwritingSlotData';
import CollageCaptionKind from '../../enums/CollageCaptionKind';
import type { CollagePhotoPlacement } from '../../types/CollagePhotoPlacement';
import type { EditorialPhoto } from '../../types/EditorialPhoto';
import HandwritingView from '../shared/HandwritingView';
import FramedPhotoView from './FramedPhotoView';
import LabelStickerView from './LabelStickerView';

interface Props {
  photo: EditorialPhoto;
  placement: CollagePhotoPlacement;
  onOpen: (photoId: string, trigger: HTMLElement) => void;
}

// One collage print: a button that opens the lightbox, with a handwritten caption or a label band below.
const CollagePhotoView = ({ photo, placement, onOpen }: Props) => {
  const { caption } = placement;

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onOpen(photo.id, event.currentTarget);
  };

  return (
    <figure className="collage-wall__item">
      <button type="button" className="collage-wall__button" aria-label={`${photo.alt} 크게 보기`} onClick={handleClick}>
        <FramedPhotoView
          photo={photo}
          tape={placement.tape}
          corners={placement.corners}
          frameNumber={placement.frameNumber}
          isAltOnButton
        />
      </button>
      <figcaption className="collage-wall__caption">
        {caption.kind === CollageCaptionKind.HANDWRITING ? (
          <HandwritingView slot={HANDWRITING_SLOTS[caption.slotId]} classPrefix="collage" />
        ) : (
          <LabelStickerView text={caption.text} className="collage-sticker--small" />
        )}
      </figcaption>
    </figure>
  );
};

export default CollagePhotoView;
