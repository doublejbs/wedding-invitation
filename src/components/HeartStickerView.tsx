import { useId } from 'react';
import HeartPosition from '../enums/HeartPosition';
import HeartShape from '../enums/HeartShape';

interface Props {
  position: HeartPosition;
  shape: HeartShape;
}

interface HeartPart {
  key: string;
  transform: string;
}

const POSITION_CLASS_NAMES: Record<HeartPosition, string> = {
  [HeartPosition.ENVELOPE_TOP]: 'heart-sticker--envelope-top',
  [HeartPosition.GREETING_LEFT]: 'heart-sticker--greeting-left',
};

// Heart drawn in a 64 x 60 box.
const HEART_PATH =
  'M32 56 C14 43 4 33 4 21 C4 12 11 6 19 6 C25 6 29.5 9.5 32 14 C34.5 9.5 39 6 45 6 C53 6 60 12 60 21 C60 33 50 43 32 56 Z';

// View boxes are cropped to the visible bounds (heart shape + 4-unit white outline), so the sticker's
// CSS width equals its visible width. Keep in sync with --heart-greeting-aspect (SINGLE height / width = 58 / 64).
const SHAPE_VIEW_BOXES: Record<HeartShape, string> = {
  [HeartShape.SINGLE]: '0 2 64 58',
  [HeartShape.DOUBLE]: '24.2 2 79.8 64.8',
};

// Double sticker: big heart upper-right, small heart (55%) lower-left overlapping it.
const SHAPE_PARTS: Record<HeartShape, HeartPart[]> = {
  [HeartShape.SINGLE]: [{ key: 'main', transform: '' }],
  [HeartShape.DOUBLE]: [
    { key: 'big', transform: 'translate(40 0)' },
    { key: 'small', transform: 'translate(26 32) scale(0.55)' },
  ],
};

const HeartStickerView = ({ position, shape }: Props) => {
  const crayonId = `${useId()}crayon`;

  const className = `heart-sticker ${POSITION_CLASS_NAMES[position]}`;

  const parts = SHAPE_PARTS[shape];

  return (
    <span className={className} aria-hidden="true" data-testid="heart-sticker">
      <svg className="heart-sticker__svg" viewBox={SHAPE_VIEW_BOXES[shape]} focusable="false">
        <defs>
          {/* Crayon look: slightly wobbly edges plus a speckled, uneven fill. */}
          <filter id={crayonId} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="2" seed="3" result="wobble" />
            <feDisplacementMap in="SourceGraphic" in2="wobble" scale="1.6" xChannelSelector="R" yChannelSelector="G" result="rough" />
            <feTurbulence type="fractalNoise" baseFrequency="1.8" numOctaves="2" seed="11" result="grain" />
            <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.9 0 0 0 0.45" result="grainAlpha" />
            <feComposite in="rough" in2="grainAlpha" operator="in" />
          </filter>
        </defs>
        {parts.map((part) => (
          <path key={`outline-${part.key}`} className="heart-sticker__outline" d={HEART_PATH} transform={part.transform} />
        ))}
        <g filter={`url(#${crayonId})`}>
          {parts.map((part) => (
            <path key={`fill-${part.key}`} className="heart-sticker__fill" d={HEART_PATH} transform={part.transform} />
          ))}
        </g>
      </svg>
    </span>
  );
};

export default HeartStickerView;
