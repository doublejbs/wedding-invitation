import type CornerPosition from '../../enums/CornerPosition';
import StickerKind from '../../enums/StickerKind';
import { toKebabModifier } from '../../utils/ClassNameUtils';
import StickerView from './StickerView';

interface Props {
  corners: CornerPosition[];
}

// Photo-corner mounts (small dark triangles) holding a photo at the given corners (decorative).
const CornerStickersView = ({ corners }: Props) => {
  return (
    <>
      {corners.map((corner) => (
        <StickerView
          key={corner}
          kind={StickerKind.CORNER}
          isDecorative
          className={`collage-sticker--corner-${toKebabModifier(corner)}`}
        />
      ))}
    </>
  );
};

export default CornerStickersView;
