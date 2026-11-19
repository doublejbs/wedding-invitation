import type EditorialPanelId from '../enums/EditorialPanelId';

export interface AccordionPanel {
  id: EditorialPanelId;
  number: string;
  title: string;
  englishTitle: string;
}
