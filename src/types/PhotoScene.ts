import type PhotoOrientation from '../enums/PhotoOrientation';

export interface PhotoScene {
  orientation: PhotoOrientation;
  // Korean scene description, used as alt text.
  alt: string;
}
