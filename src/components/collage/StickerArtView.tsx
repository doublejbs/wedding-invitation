import { DATE_STAMP_RING_TEXT } from '../../data/CollageData';
import { WEDDING_DATE_TIME } from '../../data/InvitationData';
import StickerKind from '../../enums/StickerKind';
import type { StickerPlacement } from '../../types/StickerPlacement';
import { findEditorialPhoto } from '../../utils/EditorialPhotoUtils';
import { formatEnglishMonthDay } from '../../utils/WeddingDateUtils';
import DateStampStickerView from './DateStampStickerView';
import FilmStickerView from './FilmStickerView';
import LabelStickerView from './LabelStickerView';
import StampStickerView from './StampStickerView';
import TicketStickerView from './TicketStickerView';

interface Props {
  placement: StickerPlacement;
}

// Renders the art of a free canvas sticker from its placement data.
const StickerArtView = ({ placement }: Props) => {
  if (placement.kind === StickerKind.DATE_STAMP) {
    return (
      <DateStampStickerView
        ringText={DATE_STAMP_RING_TEXT}
        dayText={formatEnglishMonthDay(WEDDING_DATE_TIME)}
        yearText={String(WEDDING_DATE_TIME.getFullYear())}
        isDraggable={placement.isDraggable}
      />
    );
  }

  if (placement.kind === StickerKind.LABEL) {
    return <LabelStickerView text={placement.text} isDraggable={placement.isDraggable} />;
  }

  if (placement.kind === StickerKind.TICKET) {
    return <TicketStickerView title={placement.text} isDraggable={placement.isDraggable} className="collage-ticket--stub" />;
  }

  const photo = findEditorialPhoto(placement.photoId);

  if (!photo) {
    return null;
  }

  if (placement.kind === StickerKind.STAMP) {
    return <StampStickerView photo={photo} isDraggable={placement.isDraggable} />;
  }

  return <FilmStickerView photo={photo} frameNumber={placement.frameNumber} />;
};

export default StickerArtView;
