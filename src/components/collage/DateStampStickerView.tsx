import { useId } from 'react';
import StickerKind from '../../enums/StickerKind';
import StickerView from './StickerView';

interface Props {
  ringText: string;
  dayText: string;
  yearText: string;
  isDraggable?: boolean;
}

const VIEW_BOX_SIZE = 100;

// Round rubber date stamp drawn as inline SVG. A turbulence filter makes the ink uneven (decorative).
const DateStampStickerView = ({ ringText, dayText, yearText, isDraggable }: Props) => {
  const id = useId();
  const filterId = `${id}-ink`;
  const ringPathId = `${id}-ring`;

  return (
    <StickerView kind={StickerKind.DATE_STAMP} isDraggable={isDraggable} isDecorative>
      <svg
        className="collage-date-stamp__svg"
        viewBox={`0 0 ${VIEW_BOX_SIZE} ${VIEW_BOX_SIZE}`}
        focusable="false"
      >
        <defs>
          <filter id={filterId}>
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.2" result="rough" />
            <feComponentTransfer in="noise" result="speckle">
              <feFuncA type="discrete" tableValues="1 1 0.35 1 0.6 1" />
            </feComponentTransfer>
            <feComposite in="rough" in2="speckle" operator="in" />
          </filter>
          <path id={ringPathId} d="M50 50 m-33 0 a33 33 0 1 1 66 0 a33 33 0 1 1 -66 0" />
        </defs>
        <g filter={`url(#${filterId})`}>
          <circle cx="50" cy="50" r="46" className="collage-date-stamp__ring" />
          <circle cx="50" cy="50" r="40" className="collage-date-stamp__ring collage-date-stamp__ring--thin" />
          <text className="collage-date-stamp__ring-text">
            <textPath href={`#${ringPathId}`}>{ringText}</textPath>
          </text>
          <text x="50" y="52" textAnchor="middle" className="collage-date-stamp__day">
            {dayText}
          </text>
          <text x="50" y="66" textAnchor="middle" className="collage-date-stamp__year">
            {yearText}
          </text>
        </g>
      </svg>
    </StickerView>
  );
};

export default DateStampStickerView;
