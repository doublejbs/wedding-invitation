import type { ReactNode } from 'react';
import useRevealOnView from '../../hooks/useRevealOnView';
import { joinClassNames } from '../../utils/ClassNameUtils';
import { createCssVariables } from '../../utils/CssVariableUtils';

interface Props {
  rotationDeg: number;
  delayMs: number;
  className?: string;
  children: ReactNode;
}

// "Stick on" landing: once on screen, the piece settles from scale(1.06) and +3deg to its final angle (CSS), once.
const StuckOnView = ({ rotationDeg, delayMs, className, children }: Props) => {
  const { elementRef, isRevealed } = useRevealOnView<HTMLDivElement>();
  const style = createCssVariables({
    '--stuck-rotation': `${rotationDeg}deg`,
    '--stuck-delay': `${delayMs}ms`,
  });

  return (
    <div ref={elementRef} className={joinClassNames('collage-stuck', isRevealed && 'is-stuck', className)} style={style}>
      {children}
    </div>
  );
};

export default StuckOnView;
