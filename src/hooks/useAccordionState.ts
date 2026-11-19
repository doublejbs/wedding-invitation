import { useState } from 'react';
import type EditorialPanelId from '../enums/EditorialPanelId';

// Single-open accordion: opening a panel closes any other one.
const useAccordionState = () => {
  const [openPanelId, setOpenPanelId] = useState<EditorialPanelId | null>(null);

  const handleTogglePanel = (panelId: EditorialPanelId) => {
    setOpenPanelId((previous) => (previous === panelId ? null : panelId));
  };

  const handleClosePanel = () => {
    setOpenPanelId(null);
  };

  return { openPanelId, handleTogglePanel, handleClosePanel };
};

export default useAccordionState;
