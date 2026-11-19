import { DIRECTIONS_PAPER_PIECE } from '../../data/CollageData';
import { MAP_LINKS, TRANSPORT_GUIDES, VENUE_ADDRESS, VENUE_HALL, VENUE_NAME } from '../../data/InvitationData';
import useClipboardCopy from '../../hooks/useClipboardCopy';
import { buildMapAppNoteId, buildMapSearchUrl } from '../../utils/MapLinkUtils';
import CopyButtonView from '../shared/CopyButtonView';
import CollageSectionHeadingView from './CollageSectionHeadingView';
import PaperView from './PaperView';
import StuckOnView from './StuckOnView';

const ADDRESS_COPY_KEY = 'collage-venue-address';

const APP_NOTE_ID_PREFIX = 'collage-map-app-note';

const HEADING_ID = 'collage-directions-heading';

const CollageDirectionsView = () => {
  const { copyFeedback, handleCopy } = useClipboardCopy();

  return (
    <section className="collage-section collage-directions" aria-labelledby={HEADING_ID}>
      <CollageSectionHeadingView id={HEADING_ID} number="04" englishTitle="Directions" title="오시는 길" />
      <p className="collage-directions__venue">{`${VENUE_NAME} ${VENUE_HALL}`}</p>
      <div className="collage-address">
        <p className="collage-address__text">{VENUE_ADDRESS}</p>
        <CopyButtonView
          className="collage-copy-button"
          copyKey={ADDRESS_COPY_KEY}
          text={VENUE_ADDRESS}
          label="주소 복사"
          accessibleLabel="주소 복사"
          copyFeedback={copyFeedback}
          onCopy={handleCopy}
        />
      </div>
      <p className="collage-feedback" role="status">
        {copyFeedback?.message ?? ''}
      </p>
      <ul className="collage-map-links">
        {MAP_LINKS.map((mapLink) => {
          const appNoteId = buildMapAppNoteId(mapLink.provider, APP_NOTE_ID_PREFIX);

          return (
            <li key={mapLink.provider} className="collage-map-links__item">
              <a
                className="collage-outline-link"
                href={buildMapSearchUrl(mapLink.provider, VENUE_NAME)}
                target={mapLink.isAppLink ? undefined : '_blank'}
                rel="noopener noreferrer"
                aria-describedby={mapLink.isAppLink ? appNoteId : undefined}
              >
                {mapLink.label}
              </a>
              {mapLink.isAppLink && (
                <span id={appNoteId} className="collage-map-links__note">
                  앱에서 열림
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <StuckOnView {...DIRECTIONS_PAPER_PIECE} className="collage-directions__memo">
        <PaperView className="collage-paper--memo">
          <dl className="collage-list">
            {TRANSPORT_GUIDES.map((guide) => (
              <div key={guide.label} className="collage-list__row">
                <dt className="collage-list__label collage-mono">{guide.label}</dt>
                <dd className="collage-list__value">{guide.value}</dd>
              </div>
            ))}
          </dl>
        </PaperView>
      </StuckOnView>
    </section>
  );
};

export default CollageDirectionsView;
