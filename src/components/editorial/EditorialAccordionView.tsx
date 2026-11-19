import type { ReactNode } from 'react';
import { ACCORDION_PANELS } from '../../data/EditorialData';
import { HANDWRITING_SLOTS } from '../../data/HandwritingSlotData';
import EditorialPanelId from '../../enums/EditorialPanelId';
import HandwritingSlotId from '../../enums/HandwritingSlotId';
import useAccordionState from '../../hooks/useAccordionState';
import AccordionPanelView from './AccordionPanelView';
import AttendancePanelView from './AttendancePanelView';
import CeremonyPanelView from './CeremonyPanelView';
import DirectionsPanelView from './DirectionsPanelView';
import GiftPanelView from './GiftPanelView';
import HandwritingView from '../shared/HandwritingView';

const PANEL_CONTENTS: Record<EditorialPanelId, ReactNode> = {
  [EditorialPanelId.CEREMONY]: <CeremonyPanelView />,
  [EditorialPanelId.DIRECTIONS]: <DirectionsPanelView />,
  [EditorialPanelId.GIFT]: <GiftPanelView />,
  [EditorialPanelId.ATTENDANCE]: <AttendancePanelView />,
};

const getTitleAside = (panelId: EditorialPanelId) => {
  if (panelId !== EditorialPanelId.ATTENDANCE) {
    return undefined;
  }

  return (
    <HandwritingView slot={HANDWRITING_SLOTS[HandwritingSlotId.SECTION_NOTE]} className="editorial-accordion__note" />
  );
};

const EditorialAccordionView = () => {
  const { openPanelId, handleTogglePanel, handleClosePanel } = useAccordionState();

  return (
    <section className="editorial-accordion" aria-label="안내">
      {ACCORDION_PANELS.map((panel, index) => (
        <AccordionPanelView
          key={panel.id}
          panel={panel}
          position={index + 1}
          total={ACCORDION_PANELS.length}
          isOpen={openPanelId === panel.id}
          titleAside={getTitleAside(panel.id)}
          onToggle={handleTogglePanel}
          onClose={handleClosePanel}
        >
          {PANEL_CONTENTS[panel.id]}
        </AccordionPanelView>
      ))}
    </section>
  );
};

export default EditorialAccordionView;
