import type { MouseEvent } from 'react';
import { POSTER_ABOVE_FOLD_Y, POSTER_DESIGN_HEIGHT, POSTER_DESIGN_WIDTH } from '../../data/EditorialData';
import type { EditorialPhoto } from '../../types/EditorialPhoto';
import type { PosterPhotoPlacement } from '../../types/PosterPhotoPlacement';
import { convertToPercent, createCssVariables } from '../../utils/CssVariableUtils';
import { getSmallPhotoSize } from '../../utils/PhotoSizeUtils';

interface Props {
  photo: EditorialPhoto;
  placement: PosterPhotoPlacement;
  onOpen: (photoId: string, trigger: HTMLElement) => void;
}

// One black-and-white poster photo, positioned from design-canvas data and drifting with its own speed.
const ScatteredPhotoView = ({ photo, placement, onOpen }: Props) => {
  const { width, height } = getSmallPhotoSize(photo);
  const isAboveFold = placement.y < POSTER_ABOVE_FOLD_Y;
  const style = createCssVariables({
    '--photo-x': convertToPercent(placement.x, POSTER_DESIGN_WIDTH),
    '--photo-y': convertToPercent(placement.y, POSTER_DESIGN_HEIGHT),
    '--photo-w': convertToPercent(placement.width, POSTER_DESIGN_WIDTH),
    '--drift-speed': placement.speed,
  });

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onOpen(photo.id, event.currentTarget);
  };

  return (
    <button
      type="button"
      className="editorial-photo editorial-drift"
      style={style}
      aria-label={`${photo.alt} 크게 보기`}
      onClick={handleClick}
    >
      <img
        className="editorial-photo__image"
        src={photo.smallSrc}
        alt={photo.alt}
        width={width}
        height={height}
        loading={isAboveFold ? 'eager' : 'lazy'}
        decoding="async"
      />
    </button>
  );
};

export default ScatteredPhotoView;
