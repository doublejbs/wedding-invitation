import {
  BRIDE_NAME,
  COMPARE_CLOSING_LABEL,
  COMPARE_CLOSING_VALUE,
  COMPARE_ROWS,
  GROOM_NAME,
} from '../../data/InvitationData';
import LaunchSectionTone from '../../enums/LaunchSectionTone';
import LaunchSectionView from './LaunchSectionView';
import RevealView from './RevealView';
import SectionHeadingView from './SectionHeadingView';

const CompareView = () => {
  return (
    <LaunchSectionView label="비교하기" tone={LaunchSectionTone.GRAY} className="launch-compare">
      <div className="launch-container">
        <SectionHeadingView eyebrow="Compare" title="서로 다른 두 사람." description="다른 곳에서 자라 같은 곳을 바라봅니다." />
        <RevealView>
          <table className="launch-compare__table">
            <caption className="launch-visually-hidden">신랑과 신부 소개 비교</caption>
            <thead>
              <tr>
                <td />
                <th scope="col" className="launch-compare__person">
                  <span className="launch-compare__role">신랑</span>
                  {GROOM_NAME}
                </th>
                <th scope="col" className="launch-compare__person">
                  <span className="launch-compare__role">신부</span>
                  {BRIDE_NAME}
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARE_ROWS.map((row) => (
                <tr key={row.label}>
                  <th scope="row" className="launch-compare__label">
                    {row.label}
                  </th>
                  <td className="launch-compare__cell">{row.groom}</td>
                  <td className="launch-compare__cell">{row.bride}</td>
                </tr>
              ))}
              <tr className="launch-compare__closing">
                <th scope="row" className="launch-compare__label">
                  {COMPARE_CLOSING_LABEL}
                </th>
                <td className="launch-compare__cell launch-compare__cell--together" colSpan={2}>
                  {COMPARE_CLOSING_VALUE}
                </td>
              </tr>
            </tbody>
          </table>
        </RevealView>
      </div>
    </LaunchSectionView>
  );
};

export default CompareView;
