import { EDITORIAL_PHOTOS } from '../data/EditorialData';
import type { EditorialPhoto } from '../types/EditorialPhoto';

export const findEditorialPhoto = (photoId: string): EditorialPhoto | undefined => {
  return EDITORIAL_PHOTOS.find((photo) => photo.id === photoId);
};
