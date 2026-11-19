import StickerKind from '../../enums/StickerKind';
import type { EditorialPhoto } from '../../types/EditorialPhoto';
import { getSmallPhotoSize } from '../../utils/PhotoSizeUtils';
import StickerView from './StickerView';

interface Props {
  photo: EditorialPhoto;
  frameNumber: string;
}

// A cut piece of film: sprocket holes along both edges, one frame and its number (decorative).
const FilmStickerView = ({ photo, frameNumber }: Props) => {
  const { width, height } = getSmallPhotoSize(photo);

  return (
    <StickerView kind={StickerKind.FILM} isDecorative>
      <span className="collage-film__frame">
        <img
          className="collage-film__image collage-photo-filter"
          src={photo.smallSrc}
          alt=""
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          draggable={false}
        />
      </span>
      <span className="collage-film__number">{frameNumber}</span>
    </StickerView>
  );
};

export default FilmStickerView;
