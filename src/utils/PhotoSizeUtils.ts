import PhotoOrientation from '../enums/PhotoOrientation';
import type { EditorialPhoto } from '../types/EditorialPhoto';

// Intrinsic size of the -sm.jpg files (800px long edge, 3:2 / 2:3).
const SMALL_LONG_EDGE_PX = 800;

const SMALL_SHORT_EDGE_PX = 534;

export const getSmallPhotoSize = (photo: EditorialPhoto) => {
  const isLandscape = photo.orientation === PhotoOrientation.LANDSCAPE;

  return {
    width: isLandscape ? SMALL_LONG_EDGE_PX : SMALL_SHORT_EDGE_PX,
    height: isLandscape ? SMALL_SHORT_EDGE_PX : SMALL_LONG_EDGE_PX,
  };
};
