import StickerKind from '../../enums/StickerKind';
import StickerView from './StickerView';

interface Props {
  title: string;
  lines?: string[];
  isDraggable?: boolean;
  className?: string;
}

// Half a ticket with a toothed edge. Its text is meaningful, so it is not hidden.
// Spans only, so the sticker stays valid phrasing content.
const TicketStickerView = ({ title, lines = [], isDraggable, className }: Props) => {
  return (
    <StickerView kind={StickerKind.TICKET} isDraggable={isDraggable} className={className}>
      <span className="collage-ticket__title">{title}</span>
      {lines.map((line) => (
        <span key={line} className="collage-ticket__line">
          {line}
        </span>
      ))}
    </StickerView>
  );
};

export default TicketStickerView;
