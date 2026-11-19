import {
  WALL_DESIGN_HEIGHT,
  WALL_DESIGN_WIDTH,
  WALL_PHOTO_PLACEMENTS,
  WALL_STICKER_PLACEMENTS,
} from '../../data/CollageData';
import { findEditorialPhoto } from '../../utils/EditorialPhotoUtils';
import CollagePhotoView from './CollagePhotoView';
import CollagePieceView from './CollagePieceView';
import CollageSectionHeadingView from './CollageSectionHeadingView';
import StickerArtView from './StickerArtView';

const HEADING_ID = 'collage-photos-heading';

interface Props {
  onOpenPhoto: (photoId: string, trigger: HTMLElement) => void;
}

const CollagePhotoWallView = ({ onOpenPhoto }: Props) => {
  return (
    <section className="collage-section collage-wall-section" aria-labelledby={HEADING_ID}>
      <CollageSectionHeadingView id={HEADING_ID} number="02" englishTitle="Moments" title="사진 콜라주" />
      <div className="collage-wall">
        {WALL_PHOTO_PLACEMENTS.map((placement) => {
          const photo = findEditorialPhoto(placement.photoId);

          if (!photo) {
            return null;
          }

          return (
            <CollagePieceView
              key={placement.photoId}
              placement={placement}
              designWidth={WALL_DESIGN_WIDTH}
              designHeight={WALL_DESIGN_HEIGHT}
            >
              <CollagePhotoView photo={photo} placement={placement} onOpen={onOpenPhoto} />
            </CollagePieceView>
          );
        })}

        {WALL_STICKER_PLACEMENTS.map((placement) => (
          <CollagePieceView
            key={placement.id}
            placement={placement}
            designWidth={WALL_DESIGN_WIDTH}
            designHeight={WALL_DESIGN_HEIGHT}
            className="collage-piece--sticker"
          >
            <StickerArtView placement={placement} />
          </CollagePieceView>
        ))}
      </div>
    </section>
  );
};

export default CollagePhotoWallView;
