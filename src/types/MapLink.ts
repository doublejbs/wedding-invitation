import type MapProvider from '../enums/MapProvider';

export interface MapLink {
  provider: MapProvider;
  label: string;
  // App URL scheme links open in the installed app instead of a new browser tab.
  isAppLink: boolean;
}
