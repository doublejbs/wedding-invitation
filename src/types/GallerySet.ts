import type GalleryCategory from '../enums/GalleryCategory';
import type { PhotoItem } from './PhotoItem';

export interface GallerySet {
  category: GalleryCategory;
  label: string;
  photos: PhotoItem[];
}
