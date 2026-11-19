import StickerKind from '../../enums/StickerKind';
import type { EditorialPhoto } from '../../types/EditorialPhoto';
import { getSmallPhotoSize } from '../../utils/PhotoSizeUtils';
import StickerView from './StickerView';

interface Props {
  photo: EditorialPhoto;
  isDraggable?: boolean;
  className?: string;
}

// Postage stamp: perforated white edge around a black-and-white photo (decorative).
const StampStickerView = ({ photo, isDraggable, className }: Props) => {
  const { width, height } = getSmallPhotoSize(photo);

  return (
    <StickerView kind={StickerKind.STAMP} isDraggable={isDraggable} isDecorative className={className}>
      <span className="collage-stamp__window">
        <img
          className="collage-stamp__image collage-photo-filter"
          src={photo.smallSrc}
          alt=""
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      </span>
    </StickerView>
  );
};

export default StampStickerView;
