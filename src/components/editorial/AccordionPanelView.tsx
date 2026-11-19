import { useEffect, useRef, type ReactNode, type TransitionEvent } from 'react';
import type EditorialPanelId from '../../enums/EditorialPanelId';
import usePrefersReducedMotion from '../../hooks/usePrefersReducedMotion';
import type { AccordionPanel } from '../../types/AccordionPanel';
import { joinClassNames } from '../../utils/ClassNameUtils';

interface Props {
  panel: AccordionPanel;
  position: number;
  total: number;
  isOpen: boolean;
  // Decorative extra next to the title (hidden from assistive tech).
  titleAside?: ReactNode;
  onToggle: (panelId: EditorialPanelId) => void;
  onClose: () => void;
  children: ReactNode;
}

const scrollToTop = (element: HTMLElement | null, prefersReducedMotion: boolean) => {
  if (!element || typeof element.scrollIntoView !== 'function') {
    return;
  }

  element.scrollIntoView({ block: 'start', behavior: prefersReducedMotion ? 'auto' : 'smooth' });
};

const AccordionPanelView = ({ panel, position, total, isOpen, titleAside, onToggle, onClose, children }: Props) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const headerId = `editorial-panel-header-${panel.id.toLowerCase()}`;
  const regionId = `editorial-panel-region-${panel.id.toLowerCase()}`;
  const accessibleName = `${panel.number} ${panel.title} ${panel.englishTitle}`;

  // With reduced motion there is no height transition, so the panel can be brought to the top right away.
  useEffect(() => {
    if (isOpen && prefersReducedMotion) {
      scrollToTop(itemRef.current, true);
    }
  }, [isOpen, prefersReducedMotion]);

  const handleToggle = () => {
    onToggle(panel.id);
  };

  const handleClose = () => {
    onClose();
    toggleButtonRef.current?.focus();
  };

  // After the 0fr → 1fr transition (and any other panel collapsing), bring the opened panel to the top.
  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || !isOpen) {
      return;
    }

    scrollToTop(itemRef.current, prefersReducedMotion);
  };

  return (
    <div ref={itemRef} className={joinClassNames('editorial-accordion__item', isOpen && 'is-open')}>
      <h2 className="editorial-accordion__heading">
        <button
          ref={toggleButtonRef}
          id={headerId}
          type="button"
          className="editorial-accordion__toggle"
          aria-expanded={isOpen}
          aria-controls={regionId}
          aria-label={accessibleName}
          onClick={handleToggle}
        >
          <span className="editorial-accordion__number editorial-mono">{panel.number}</span>
          <span className="editorial-accordion__title">{panel.title}</span>
          {titleAside && <span aria-hidden="true">{titleAside}</span>}
          <span className="editorial-accordion__english editorial-mono">{panel.englishTitle}</span>
          <span className="editorial-accordion__sign" aria-hidden="true">
            {isOpen ? '−' : '+'}
          </span>
        </button>
      </h2>
      <div
        id={regionId}
        role="region"
        aria-labelledby={headerId}
        className="editorial-accordion__region"
        inert={!isOpen}
        onTransitionEnd={handleTransitionEnd}
      >
        <div className="editorial-accordion__clip">
          {/* Always rendered so nothing jumps while the panel collapses; inert with the region when closed. */}
          <div className="editorial-accordion__bar">
            <span className="editorial-accordion__bar-title">
              <span className="editorial-mono">{panel.number}</span> {panel.title}
            </span>
            <span className="editorial-accordion__counter editorial-mono">{`${position} / ${total}`}</span>
            <button type="button" className="editorial-accordion__close" onClick={handleClose}>
              닫기 <span aria-hidden="true">×</span>
            </button>
          </div>
          <div className="editorial-accordion__body">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default AccordionPanelView;
