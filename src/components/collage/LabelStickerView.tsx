import type { ReactNode } from 'react';
import StickerKind from '../../enums/StickerKind';
import StickerView from './StickerView';

interface Props {
  text: string;
  isDraggable?: boolean;
  className?: string;
  // Extra decoration drawn over the band, e.g. a pen circle (should be aria-hidden itself).
  overlay?: ReactNode;
}

// Label-maker band: white DM Mono capitals embossed on black tape. The text stays readable.
const LabelStickerView = ({ text, isDraggable, className, overlay }: Props) => {
  return (
    <StickerView kind={StickerKind.LABEL} isDraggable={isDraggable} className={className}>
      <span className="collage-label">{text}</span>
      {overlay}
    </StickerView>
  );
};

export default LabelStickerView;
