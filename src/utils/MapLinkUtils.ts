import MapProvider from '../enums/MapProvider';

// Search endpoints per provider. Tmap has no public web search page, so its app URL scheme is used.
const MAP_SEARCH_URL_BUILDERS: Record<MapProvider, (query: string) => string> = {
  [MapProvider.NAVER]: (query) => `https://map.naver.com/p/search/${query}`,
  [MapProvider.KAKAO]: (query) => `https://map.kakao.com/link/search/${query}`,
  [MapProvider.TMAP]: (query) => `tmap://search?name=${query}`,
};

export const buildMapSearchUrl = (provider: MapProvider, venueName: string) => {
  return MAP_SEARCH_URL_BUILDERS[provider](encodeURIComponent(venueName));
};

const DEFAULT_APP_NOTE_ID_PREFIX = 'map-app-note';

// Id of the "opens in the app" note that an app-scheme map link points to via aria-describedby.
export const buildMapAppNoteId = (provider: MapProvider, idPrefix = DEFAULT_APP_NOTE_ID_PREFIX) => {
  return `${idPrefix}-${provider.toLowerCase()}`;
};
