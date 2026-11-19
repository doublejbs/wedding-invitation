import type { CSSProperties, ReactNode } from 'react';
import type StickerKind from '../enums/StickerKind';

// Props shared by the static and the draggable sticker shells.
export interface StickerShell {
  kind: StickerKind;
  // Purely decorative stickers are hidden from assistive tech.
  isDecorative?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
}
