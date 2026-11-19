import useInkReveal from '../../hooks/useInkReveal';
import type { HandwritingSlot } from '../../types/HandwritingSlot';
import { joinClassNames } from '../../utils/ClassNameUtils';
import { createCssVariables } from '../../utils/CssVariableUtils';

const DEFAULT_CLASS_PREFIX = 'editorial';

interface Props {
  slot: HandwritingSlot;
  className?: string;
  // Page namespace for the BEM classes, e.g. "editorial" → "editorial-handwriting", "editorial-ink".
  classPrefix?: string;
}

// Meaningful handwritten note: placeholder font text until `slot.src` is set, then the drawing as <img>.
// Revealed once with a left-to-right wipe when it scrolls into view. The unclipped outer span is observed.
const HandwritingView = ({ slot, className, classPrefix = DEFAULT_CLASS_PREFIX }: Props) => {
  const { elementRef, isRevealed } = useInkReveal<HTMLSpanElement>();
  const style = createCssVariables({
    '--handwriting-width': `${slot.width}px`,
    '--handwriting-rotation': `${slot.rotationDeg}deg`,
  });

  return (
    <span
      ref={elementRef}
      className={joinClassNames(`${classPrefix}-handwriting`, isRevealed && 'is-revealed', className)}
      style={style}
      data-slot={slot.id}
    >
      <span className={`${classPrefix}-ink`}>
        {slot.src ? (
          <img
            className={`${classPrefix}-handwriting__image`}
            src={slot.src}
            alt={slot.text}
            width={slot.width}
            decoding="async"
          />
        ) : (
          slot.text
        )}
      </span>
    </span>
  );
};

export default HandwritingView;
