import type { CSSProperties } from 'react';
import type { PhotoItem } from '../../types/PhotoItem';

interface Props {
  photo: PhotoItem;
  className?: string;
}

// Real image when `src` is set; otherwise a gradient placeholder labelled "사진 N".
const PhotoView = ({ photo, className = '' }: Props) => {
  if (photo.src) {
    return <img className={`launch-photo ${className}`} src={photo.src} alt={photo.alt} loading="lazy" />;
  }

  const placeholderStyle = { '--photo-gradient': photo.gradient } as CSSProperties;

  return (
    <div
      className={`launch-photo launch-photo--placeholder ${className}`}
      role="img"
      aria-label={photo.alt}
      style={placeholderStyle}
    >
      <span className="launch-photo__label">{photo.label}</span>
    </div>
  );
};

export default PhotoView;
