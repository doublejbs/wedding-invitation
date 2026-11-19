import type { ReactNode } from 'react';
import useRevealOnView from '../../hooks/useRevealOnView';

interface Props {
  children: ReactNode;
  className?: string;
}

// Fades and lifts its children (24px) the first time they enter the viewport.
const RevealView = ({ children, className = '' }: Props) => {
  const { elementRef, isRevealed } = useRevealOnView<HTMLDivElement>();
  const stateClassName = isRevealed ? ' is-revealed' : '';

  return (
    <div ref={elementRef} className={`launch-reveal${stateClassName} ${className}`}>
      {children}
    </div>
  );
};

export default RevealView;
