import StrokeShape from '../../enums/StrokeShape';
import useInkReveal from '../../hooks/useInkReveal';
import type { HandwritingSlot } from '../../types/HandwritingSlot';
import { joinClassNames } from '../../utils/ClassNameUtils';
import { createCssVariables } from '../../utils/CssVariableUtils';

interface StrokeDrawing {
  viewBoxWidth: number;
  viewBoxHeight: number;
  paths: string[];
}

// Hand-drawn paths: a loose closed ellipse whose end overshoots its start a little, a wavy underline, and a short arrow pointing right.
const STROKE_DRAWINGS: Record<StrokeShape, StrokeDrawing> = {
  [StrokeShape.CIRCLE]: {
    viewBoxWidth: 140,
    viewBoxHeight: 44,
    paths: ['M118 7C96 2 44 2 20 9C4 15 2 29 16 35C34 43 104 43 124 35C138 30 138 14 120 8C112 5 102 3 92 3'],
  },
  [StrokeShape.UNDERLINE]: {
    viewBoxWidth: 200,
    viewBoxHeight: 16,
    paths: ['M3 10C40 4 80 13 120 8S180 5 197 9'],
  },
  [StrokeShape.ARROW]: {
    viewBoxWidth: 48,
    viewBoxHeight: 24,
    paths: ['M2 14C14 8 28 16 42 11', 'M34 4L43 11L35 19'],
  },
};

const DEFAULT_ARROW_WIDTH = 40;

const DEFAULT_CLASS_PREFIX = 'editorial';

interface Props {
  shape: StrokeShape;
  // Optional slot: its width/rotation are used, and its `src` replaces the drawn path with an image.
  slot?: HandwritingSlot;
  rotationDeg?: number;
  className?: string;
  // Page namespace for the BEM classes, e.g. "editorial" → "editorial-stroke", "editorial-ink".
  classPrefix?: string;
}

// Decorative stroke (hidden from assistive tech) that draws itself once via stroke-dashoffset.
// A drawing image from `slot.src` uses the same left-to-right wipe as handwriting instead.
const HandDrawnStrokeView = ({ shape, slot, rotationDeg, className, classPrefix = DEFAULT_CLASS_PREFIX }: Props) => {
  const { elementRef, isRevealed } = useInkReveal<HTMLSpanElement>();
  const drawing = STROKE_DRAWINGS[shape];
  const width = slot?.width ?? DEFAULT_ARROW_WIDTH;
  const height = Math.round((width * drawing.viewBoxHeight) / drawing.viewBoxWidth);
  const style = createCssVariables({
    '--stroke-width': `${width}px`,
    '--stroke-rotation': `${rotationDeg ?? slot?.rotationDeg ?? 0}deg`,
  });

  return (
    <span
      ref={elementRef}
      className={joinClassNames(`${classPrefix}-stroke`, isRevealed && 'is-revealed', className)}
      style={style}
      aria-hidden="true"
    >
      {slot?.src ? (
        <span className={`${classPrefix}-ink`}>
          <img className={`${classPrefix}-stroke__image`} src={slot.src} alt="" width={width} height={height} decoding="async" />
        </span>
      ) : (
        <svg
          className={`${classPrefix}-stroke__svg`}
          viewBox={`0 0 ${drawing.viewBoxWidth} ${drawing.viewBoxHeight}`}
          width={width}
          height={height}
          focusable="false"
        >
          {drawing.paths.map((path, index) => (
            <path
              key={path}
              className={`${classPrefix}-stroke__path`}
              d={path}
              pathLength={1}
              style={createCssVariables({ '--stroke-order': index })}
            />
          ))}
        </svg>
      )}
    </span>
  );
};

export default HandDrawnStrokeView;
