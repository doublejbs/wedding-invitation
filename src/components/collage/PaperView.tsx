import type { ReactNode } from 'react';
import StickerKind from '../../enums/StickerKind';
import { buildStickerClassName } from '../../utils/StickerClassNameUtils';

interface Props {
  className?: string;
  children: ReactNode;
}

// Torn paper scrap (irregular clip-path edge) that carries readable block content,
// so it is a <div> rather than the span-based sticker shell, and it is not hidden.
const PaperView = ({ className, children }: Props) => {
  return (
    <div className={buildStickerClassName(StickerKind.PAPER, false, className)} data-sticker={StickerKind.PAPER}>
      <div className="collage-paper__sheet">{children}</div>
    </div>
  );
};

export default PaperView;
