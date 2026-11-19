import StickerKind from '../../enums/StickerKind';
import type { TapePiece } from '../../types/TapePiece';
import { toKebabModifier } from '../../utils/ClassNameUtils';
import { createCssVariables } from '../../utils/CssVariableUtils';
import StickerView from './StickerView';

interface Props {
  tape: TapePiece;
}

// Masking tape across the top edge of a photo (decorative).
const TapeStickerView = ({ tape }: Props) => {
  const style = createCssVariables({
    '--tape-center': `${tape.centerRatio * 100}%`,
    '--tape-rotation': `${tape.rotationDeg}deg`,
  });

  return (
    <StickerView
      kind={StickerKind.TAPE}
      isDecorative
      className={`collage-sticker--tape-${toKebabModifier(tape.tone)}`}
      style={style}
    />
  );
};

export default TapeStickerView;
