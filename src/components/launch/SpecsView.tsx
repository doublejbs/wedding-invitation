import { CEREMONY_SPEC_ROWS } from '../../data/InvitationData';
import LaunchSectionTone from '../../enums/LaunchSectionTone';
import LaunchSectionView from './LaunchSectionView';
import RevealView from './RevealView';
import SectionHeadingView from './SectionHeadingView';

const SpecsView = () => {
  return (
    <LaunchSectionView label="예식 정보" tone={LaunchSectionTone.WHITE} className="launch-specs">
      <div className="launch-container">
        <SectionHeadingView eyebrow="Details" title="예식 정보." />
        <RevealView>
          <dl className="launch-specs__table">
            {CEREMONY_SPEC_ROWS.map((row) => (
              <div key={row.label} className="launch-specs__row">
                <dt className="launch-specs__label">{row.label}</dt>
                <dd className="launch-specs__value">{row.value}</dd>
              </div>
            ))}
          </dl>
        </RevealView>
      </div>
    </LaunchSectionView>
  );
};

export default SpecsView;
