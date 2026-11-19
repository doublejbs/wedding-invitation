import { HIGHLIGHT_CARDS } from '../../data/InvitationData';
import LaunchSectionTone from '../../enums/LaunchSectionTone';
import LaunchSectionView from './LaunchSectionView';
import PhotoView from './PhotoView';
import SectionHeadingView from './SectionHeadingView';

const HighlightsView = () => {
  return (
    <LaunchSectionView label="하이라이트" tone={LaunchSectionTone.GRAY} className="launch-highlights">
      <div className="launch-container">
        <SectionHeadingView eyebrow="Highlights" title="두 사람의 이야기." />
      </div>
      <div className="launch-highlights__track" role="region" aria-label="하이라이트 카드 (옆으로 넘겨 보세요)" tabIndex={0}>
        <ul className="launch-highlights__list">
          {HIGHLIGHT_CARDS.map((card) => (
            <li key={card.id} className="launch-highlights__card">
              <PhotoView photo={card.photo} className="launch-highlights__photo" />
              <div className="launch-highlights__body">
                <h3 className="launch-highlights__title">{card.title}</h3>
                <p className="launch-highlights__description">{card.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </LaunchSectionView>
  );
};

export default HighlightsView;
