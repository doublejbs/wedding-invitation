import type CornerPosition from '../../enums/CornerPosition';
import type { EditorialPhoto } from '../../types/EditorialPhoto';
import type { TapePiece } from '../../types/TapePiece';
import { joinClassNames } from '../../utils/ClassNameUtils';
import { getSmallPhotoSize } from '../../utils/PhotoSizeUtils';
import CornerStickersView from './CornerStickersView';
import TapeStickerView from './TapeStickerView';

interface Props {
  photo: EditorialPhoto;
  tape?: TapePiece;
  corners?: CornerPosition[];
  // Film frame number printed on the bottom border (decorative).
  frameNumber?: string;
  isEager?: boolean;
  // Empty alt when an enclosing button already names the photo.
  isAltOnButton?: boolean;
  className?: string;
}

// Black-and-white print in a white border, held by tape and/or corner mounts.
const FramedPhotoView = ({ photo, tape, corners = [], frameNumber, isEager, isAltOnButton, className }: Props) => {
  const { width, height } = getSmallPhotoSize(photo);

  return (
    <span className={joinClassNames('collage-print', frameNumber && 'collage-print--numbered', className)}>
      <img
        className="collage-print__image collage-photo-filter"
        src={photo.smallSrc}
        alt={isAltOnButton ? '' : photo.alt}
        width={width}
        height={height}
        loading={isEager ? 'eager' : 'lazy'}
        decoding="async"
        draggable={false}
      />
      {frameNumber && (
        <span className="collage-print__frame-number" aria-hidden="true">
          {frameNumber}
        </span>
      )}
      <CornerStickersView corners={corners} />
      {tape && <TapeStickerView tape={tape} />}
    </span>
  );
};

export default FramedPhotoView;
