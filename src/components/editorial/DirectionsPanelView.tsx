import { MAP_LINKS, TRANSPORT_GUIDES, VENUE_ADDRESS, VENUE_HALL, VENUE_NAME } from '../../data/InvitationData';
import useClipboardCopy from '../../hooks/useClipboardCopy';
import { buildMapAppNoteId, buildMapSearchUrl } from '../../utils/MapLinkUtils';
import CopyButtonView from '../shared/CopyButtonView';


const ADDRESS_COPY_KEY = 'editorial-venue-address';

const APP_NOTE_ID_PREFIX = 'editorial-map-app-note';

const DirectionsPanelView = () => {
  const { copyFeedback, handleCopy } = useClipboardCopy();

  return (
    <div className="editorial-panel">
      <div className="editorial-map" role="img" aria-label="지도 자리 (시안)">
        <span className="editorial-map__label editorial-mono">MAP</span>
      </div>
      <p className="editorial-panel__venue">{`${VENUE_NAME} ${VENUE_HALL}`}</p>
      <div className="editorial-address">
        <p className="editorial-address__text">{VENUE_ADDRESS}</p>
        <CopyButtonView
          className="editorial-copy-button"
          copyKey={ADDRESS_COPY_KEY}
          text={VENUE_ADDRESS}
          label="주소 복사"
          accessibleLabel="주소 복사"
          copyFeedback={copyFeedback}
          onCopy={handleCopy}
        />
      </div>
      <p className="editorial-feedback" role="status">
        {copyFeedback?.message ?? ''}
      </p>
      <ul className="editorial-map-links">
        {MAP_LINKS.map((mapLink) => {
          const appNoteId = buildMapAppNoteId(mapLink.provider, APP_NOTE_ID_PREFIX);

          return (
            <li key={mapLink.provider} className="editorial-map-links__item">
              <a
                className="editorial-outline-link"
                href={buildMapSearchUrl(mapLink.provider, VENUE_NAME)}
                target={mapLink.isAppLink ? undefined : '_blank'}
                rel="noopener noreferrer"
                aria-describedby={mapLink.isAppLink ? appNoteId : undefined}
              >
                {mapLink.label}
              </a>
              {mapLink.isAppLink && (
                <span id={appNoteId} className="editorial-map-links__note">
                  앱에서 열림
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <dl className="editorial-list">
        {TRANSPORT_GUIDES.map((guide) => (
          <div key={guide.label} className="editorial-list__row">
            <dt className="editorial-list__label editorial-mono">{guide.label}</dt>
            <dd className="editorial-list__value">{guide.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default DirectionsPanelView;
