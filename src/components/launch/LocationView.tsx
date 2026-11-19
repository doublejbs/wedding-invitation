import { MAP_LINKS, TRANSPORT_GUIDES, VENUE_ADDRESS, VENUE_HALL, VENUE_NAME } from '../../data/InvitationData';
import LaunchSectionTone from '../../enums/LaunchSectionTone';
import useClipboardCopy from '../../hooks/useClipboardCopy';
import { buildMapAppNoteId, buildMapSearchUrl } from '../../utils/MapLinkUtils';
import CopyButtonView from '../shared/CopyButtonView';

import LaunchSectionView from './LaunchSectionView';
import RevealView from './RevealView';
import SectionHeadingView from './SectionHeadingView';

const ADDRESS_COPY_KEY = 'venue-address';

const LocationView = () => {
  const { copyFeedback, handleCopy } = useClipboardCopy();

  return (
    <LaunchSectionView label="오시는 길" tone={LaunchSectionTone.WHITE} className="launch-location">
      <div className="launch-container">
        <SectionHeadingView eyebrow="Location" title="오시는 길." />
        <RevealView>
          <div className="launch-location__map" role="img" aria-label="지도 자리 (시안)">
            <span className="launch-location__map-label">지도</span>
          </div>
          <div className="launch-location__venue">
            <p className="launch-location__name">{`${VENUE_NAME} ${VENUE_HALL}`}</p>
            <div className="launch-location__address-row">
              <p className="launch-location__address">{VENUE_ADDRESS}</p>
              <CopyButtonView
                className="launch-copy-button"
                copyKey={ADDRESS_COPY_KEY}
                text={VENUE_ADDRESS}
                label="주소 복사"
                accessibleLabel="주소 복사"
                copyFeedback={copyFeedback}
                onCopy={handleCopy}
              />
            </div>
            <p className="launch-feedback" role="status">
              {copyFeedback?.message ?? ''}
            </p>
          </div>
          <ul className="launch-location__maps">
            {MAP_LINKS.map((mapLink) => (
              <li key={mapLink.provider} className="launch-location__map-item">
                <a
                  className="launch-pill-link"
                  href={buildMapSearchUrl(mapLink.provider, VENUE_NAME)}
                  target={mapLink.isAppLink ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  aria-describedby={mapLink.isAppLink ? buildMapAppNoteId(mapLink.provider) : undefined}
                >
                  {mapLink.label}
                </a>
                {mapLink.isAppLink && (
                  <span id={buildMapAppNoteId(mapLink.provider)} className="launch-location__map-note">
                    앱에서 열림
                  </span>
                )}
              </li>
            ))}
          </ul>
          <dl className="launch-location__guides">
            {TRANSPORT_GUIDES.map((guide) => (
              <div key={guide.label} className="launch-location__guide">
                <dt className="launch-location__guide-label">{guide.label}</dt>
                <dd className="launch-location__guide-value">{guide.value}</dd>
              </div>
            ))}
          </dl>
        </RevealView>
      </div>
    </LaunchSectionView>
  );
};

export default LocationView;
