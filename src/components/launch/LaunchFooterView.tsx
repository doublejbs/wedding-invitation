import { BRIDE_NAME, FOOTER_NOTE, GROOM_NAME, WEDDING_DATE_TIME } from '../../data/InvitationData';
import LaunchSectionTone from '../../enums/LaunchSectionTone';
import { formatKoreanDateTime } from '../../utils/WeddingDateUtils';
import LaunchSectionView from './LaunchSectionView';

const LaunchFooterView = () => {
  return (
    <footer>
      <LaunchSectionView label="푸터" tone={LaunchSectionTone.GRAY} className="launch-footer">
        <div className="launch-container">
          <p className="launch-footer__note">{FOOTER_NOTE}</p>
          <p className="launch-footer__names">{`${GROOM_NAME} · ${BRIDE_NAME}`}</p>
          <p className="launch-footer__date">{formatKoreanDateTime(WEDDING_DATE_TIME)}</p>
        </div>
      </LaunchSectionView>
    </footer>
  );
};

export default LaunchFooterView;
