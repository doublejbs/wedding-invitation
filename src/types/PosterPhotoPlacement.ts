export interface PosterPhotoPlacement {
  photoId: string;
  // Position and width in poster design pixels (see POSTER_DESIGN_WIDTH / POSTER_DESIGN_HEIGHT).
  x: number;
  y: number;
  width: number;
  // Parallax drift factor: how many pixels the photo rises per scrolled pixel (0.06–0.22).
  speed: number;
}
