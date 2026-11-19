import type { PhotoItem } from './PhotoItem';

export interface HighlightCard {
  id: string;
  title: string;
  description: string;
  photo: PhotoItem;
}
