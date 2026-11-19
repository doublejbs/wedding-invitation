import type { ReactNode } from 'react';
import type { CollagePiecePlacement } from '../../types/CollagePiecePlacement';
import { joinClassNames } from '../../utils/ClassNameUtils';
import { convertToPercent, createCssVariables } from '../../utils/CssVariableUtils';
import StuckOnView from './StuckOnView';

interface Props {
  placement: CollagePiecePlacement;
  designWidth: number;
  designHeight: number;
  // Parallax drift factor; omitted pieces do not drift.
  speed?: number;
  className?: string;
  children: ReactNode;
}

// Absolutely positioned piece on a design canvas. The outer box carries position and drift,
// the inner StuckOnView carries the resting angle and the landing.
const CollagePieceView = ({ placement, designWidth, designHeight, speed, className, children }: Props) => {
  const style = createCssVariables({
    '--piece-x': convertToPercent(placement.x, designWidth),
    '--piece-y': convertToPercent(placement.y, designHeight),
    '--piece-w': convertToPercent(placement.width, designWidth),
    '--drift-speed': speed ?? 0,
  });

  return (
    <div className={joinClassNames('collage-piece', speed !== undefined && 'collage-drift', className)} style={style}>
      <StuckOnView rotationDeg={placement.rotationDeg} delayMs={placement.delayMs}>
        {children}
      </StuckOnView>
    </div>
  );
};

export default CollagePieceView;
