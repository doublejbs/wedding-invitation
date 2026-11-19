import type { ReactNode, Ref } from 'react';
import type LaunchSectionTone from '../../enums/LaunchSectionTone';

interface Props {
  label: string;
  tone: LaunchSectionTone;
  className: string;
  children: ReactNode;
  id?: string;
  ref?: Ref<HTMLElement>;
}

const LaunchSectionView = ({ label, tone, className, children, id, ref }: Props) => {
  return (
    <section
      ref={ref}
      id={id}
      className={`launch-section launch-section--${tone} ${className}`}
      aria-label={label}
    >
      {children}
    </section>
  );
};

export default LaunchSectionView;
