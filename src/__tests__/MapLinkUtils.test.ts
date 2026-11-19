import MapProvider from '../enums/MapProvider';
import { buildMapAppNoteId, buildMapSearchUrl } from '../utils/MapLinkUtils';

describe('buildMapSearchUrl', () => {
  const VENUE = '더채플웨딩홀';

  it('builds an encoded search URL for each provider', () => {
    const encoded = encodeURIComponent(VENUE);

    expect(buildMapSearchUrl(MapProvider.NAVER, VENUE)).toBe(`https://map.naver.com/p/search/${encoded}`);
    expect(buildMapSearchUrl(MapProvider.KAKAO, VENUE)).toBe(`https://map.kakao.com/link/search/${encoded}`);
    expect(buildMapSearchUrl(MapProvider.TMAP, VENUE)).toBe(`tmap://search?name=${encoded}`);
  });
});

describe('buildMapAppNoteId', () => {
  it('builds a lowercase id with the default or a custom prefix', () => {
    expect(buildMapAppNoteId(MapProvider.TMAP)).toBe('map-app-note-tmap');
    expect(buildMapAppNoteId(MapProvider.TMAP, 'editorial-map-app-note')).toBe('editorial-map-app-note-tmap');
  });
});
