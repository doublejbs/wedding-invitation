import type { StickerShell } from '../../types/StickerShell';
import { buildStickerClassName } from '../../utils/StickerClassNameUtils';
import DraggableStickerView from './DraggableStickerView';

interface Props extends StickerShell {
  isDraggable?: boolean;
}

// Shell shared by every sticker kind. A <span> (styled display:block), so stickers are valid inside
// phrasing content such as a photo <button>. Only draggable stickers use the drag hook.
const StickerView = ({ isDraggable = false, ...shell }: Props) => {
  if (isDraggable) {
    return <DraggableStickerView {...shell} />;
  }

  const { kind, isDecorative = false, className, style, children } = shell;

  return (
    <span
      className={buildStickerClassName(kind, false, className)}
      style={style}
      data-sticker={kind}
      aria-hidden={isDecorative ? 'true' : undefined}
    >
      {children}
    </span>
  );
};

export default StickerView;
