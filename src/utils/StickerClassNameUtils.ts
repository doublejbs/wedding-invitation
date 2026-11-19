import type StickerKind from '../enums/StickerKind';
import { joinClassNames, toKebabModifier } from './ClassNameUtils';

// "collage-sticker collage-sticker--date-stamp [collage-sticker--draggable] [extra]".
export const buildStickerClassName = (kind: StickerKind, isDraggable: boolean, className?: string) => {
  return joinClassNames(
    'collage-sticker',
    `collage-sticker--${toKebabModifier(kind)}`,
    isDraggable && 'collage-sticker--draggable',
    className,
  );
};
