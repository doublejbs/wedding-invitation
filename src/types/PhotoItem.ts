export interface PhotoItem {
  id: string;
  // Placeholder label shown until a real image is provided, e.g. "사진 1".
  label: string;
  alt: string;
  // Path to the real image. When empty, a gradient placeholder is rendered instead.
  src?: string;
  // Gradient used by the placeholder.
  gradient: string;
}
