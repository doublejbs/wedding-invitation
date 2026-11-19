import { BANK_ACCOUNTS, WEDDING_DATE_TIME } from '../../data/InvitationData';
import AccountSide from '../../enums/AccountSide';
import LaunchSectionTone from '../../enums/LaunchSectionTone';
import useClipboardCopy from '../../hooks/useClipboardCopy';
import useRsvpState from '../../hooks/useRsvpState';
import { formatDotDate } from '../../utils/WeddingDateUtils';
import AccountGroupView from './AccountGroupView';
import LaunchSectionView from './LaunchSectionView';
import RevealView from './RevealView';
import RsvpSheetView from './RsvpSheetView';
import SectionHeadingView from './SectionHeadingView';

const GROOM_ACCOUNTS = BANK_ACCOUNTS.filter((account) => account.side === AccountSide.GROOM);

const BRIDE_ACCOUNTS = BANK_ACCOUNTS.filter((account) => account.side === AccountSide.BRIDE);

const RsvpView = () => {
  const {
    isSheetOpen,
    isSubmitted,
    form,
    handleOpenSheet,
    handleCloseSheet,
    handleNameChange,
    handleAttendanceChange,
    handleGuestCountChange,
    handleMealChange,
    handleSubmit,
  } = useRsvpState();
  const { copyFeedback, handleCopy } = useClipboardCopy();

  return (
    <LaunchSectionView id="rsvp" label="참석 예약" tone={LaunchSectionTone.BLACK} className="launch-rsvp">
      <div className="launch-container">
        <SectionHeadingView
          eyebrow="RSVP"
          title="함께해 주시겠어요?"
          description={`${formatDotDate(WEDDING_DATE_TIME)} 귀한 걸음을 미리 알려 주시면 정성껏 준비하겠습니다.`}
        />
        <RevealView className="launch-rsvp__action">
          <button type="button" className="launch-button" onClick={handleOpenSheet}>
            참석 의사 전하기
          </button>
        </RevealView>
        <RevealView className="launch-accounts">
          <h3 className="launch-accounts__title">마음 전하실 곳</h3>
          <AccountGroupView title="신랑측" accounts={GROOM_ACCOUNTS} copyFeedback={copyFeedback} onCopy={handleCopy} />
          <AccountGroupView title="신부측" accounts={BRIDE_ACCOUNTS} copyFeedback={copyFeedback} onCopy={handleCopy} />
          <p className="launch-feedback" role="status">
            {copyFeedback?.message ?? ''}
          </p>
        </RevealView>
      </div>
      {isSheetOpen && (
        <RsvpSheetView
          form={form}
          isSubmitted={isSubmitted}
          onClose={handleCloseSheet}
          onNameChange={handleNameChange}
          onAttendanceChange={handleAttendanceChange}
          onGuestCountChange={handleGuestCountChange}
          onMealChange={handleMealChange}
          onSubmit={handleSubmit}
        />
      )}
    </LaunchSectionView>
  );
};

export default RsvpView;
