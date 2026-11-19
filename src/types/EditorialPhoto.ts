import type PhotoOrientation from '../enums/PhotoOrientation';

export interface EditorialPhoto {
  id: string;
  orientation: PhotoOrientation;
  alt: string;
  // 1600px long edge, shown in color in the lightbox.
  src: string;
  // 800px long edge, shown in black and white on the poster.
  smallSrc: string;
}
