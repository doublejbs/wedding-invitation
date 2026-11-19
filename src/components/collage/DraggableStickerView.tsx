import useStickerDrag from '../../hooks/useStickerDrag';
import type { StickerShell } from '../../types/StickerShell';
import { buildStickerClassName } from '../../utils/StickerClassNameUtils';

// Peelable sticker shell (never a keyboard target; the same info is in the body text).
// The drag offset is written to CSS variables on this element only, so nothing re-renders per pointermove.
// With reduced motion it renders like a static sticker.
const DraggableStickerView = ({ kind, isDecorative = false, className, style, children }: StickerShell) => {
  const { isEnabled, handlePointerDown, handlePointerMove, handlePointerRelease } = useStickerDrag();

  return (
    <span
      className={buildStickerClassName(kind, isEnabled, className)}
      style={style}
      data-sticker={kind}
      data-draggable={isEnabled ? 'true' : undefined}
      aria-hidden={isDecorative ? 'true' : undefined}
      onPointerDown={isEnabled ? handlePointerDown : undefined}
      onPointerMove={isEnabled ? handlePointerMove : undefined}
      onPointerUp={isEnabled ? handlePointerRelease : undefined}
      onPointerCancel={isEnabled ? handlePointerRelease : undefined}
      onLostPointerCapture={isEnabled ? handlePointerRelease : undefined}
    >
      {children}
    </span>
  );
};

export default DraggableStickerView;
