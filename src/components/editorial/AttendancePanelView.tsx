import { ATTENDANCE_DEADLINE_NOTE } from '../../data/EditorialData';
import { RSVP_MOCK_NOTICE } from '../../data/InvitationData';
import { ATTENDANCE_OPTIONS, GUEST_COUNT_OPTIONS, MEAL_OPTIONS } from '../../data/RsvpOptionData';
import AttendanceStatus from '../../enums/AttendanceStatus';
import useAttendanceState from '../../hooks/useAttendanceState';
import RequiredMarkView from '../shared/RequiredMarkView';

// Mock form: submitting only shows a notice; nothing is sent or stored.
const AttendancePanelView = () => {
  const {
    form,
    isSubmitted,
    handleNameChange,
    handlePhoneChange,
    handleAttendanceChange,
    handleGuestCountChange,
    handleMealChange,
    handleMessageChange,
    handleSubmit,
  } = useAttendanceState();
  const isAbsent = form.attendance === AttendanceStatus.ABSENT;

  return (
    <div className="editorial-panel">
      <p className="editorial-panel__lead">참석 여부를 미리 알려주시면 정성껏 준비하겠습니다.</p>
      <p className="editorial-panel__deadline">{ATTENDANCE_DEADLINE_NOTE}</p>
      <form className="editorial-form" onSubmit={handleSubmit}>
        <div className="editorial-form__field">
          <label className="editorial-form__label editorial-mono" htmlFor="editorial-rsvp-name">
            이름 <RequiredMarkView />
          </label>
          <input
            id="editorial-rsvp-name"
            className="editorial-form__input"
            type="text"
            autoComplete="name"
            required
            value={form.name}
            onChange={handleNameChange}
          />
        </div>
        <div className="editorial-form__field">
          <label className="editorial-form__label editorial-mono" htmlFor="editorial-rsvp-phone">
            연락처
          </label>
          <input
            id="editorial-rsvp-phone"
            className="editorial-form__input"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={handlePhoneChange}
          />
        </div>
        <fieldset className="editorial-form__field">
          <legend className="editorial-form__label editorial-mono">
            참석 여부 <RequiredMarkView />
          </legend>
          <div className="editorial-form__choices">
            {ATTENDANCE_OPTIONS.map((option) => (
              <label key={option.value} className="editorial-choice">
                <input
                  type="radio"
                  name="editorial-attendance"
                  value={option.value}
                  required
                  checked={form.attendance === option.value}
                  onChange={handleAttendanceChange}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="editorial-form__field">
          <label className="editorial-form__label editorial-mono" htmlFor="editorial-rsvp-guest-count">
            인원
          </label>
          <select
            id="editorial-rsvp-guest-count"
            className="editorial-form__input"
            value={form.guestCount}
            disabled={isAbsent}
            onChange={handleGuestCountChange}
          >
            {GUEST_COUNT_OPTIONS.map((count) => (
              <option key={count} value={count}>{`${count}명`}</option>
            ))}
          </select>
        </div>
        <fieldset className="editorial-form__field" disabled={isAbsent}>
          <legend className="editorial-form__label editorial-mono">
            식사 여부 <RequiredMarkView />
          </legend>
          <div className="editorial-form__choices">
            {MEAL_OPTIONS.map((option) => (
              <label key={option.value} className="editorial-choice">
                <input
                  type="radio"
                  name="editorial-meal"
                  value={option.value}
                  required
                  checked={form.meal === option.value}
                  onChange={handleMealChange}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <div className="editorial-form__field">
          <label className="editorial-form__label editorial-mono" htmlFor="editorial-rsvp-message">
            남기실 말씀
          </label>
          <textarea
            id="editorial-rsvp-message"
            className="editorial-form__input editorial-form__textarea"
            rows={3}
            value={form.message}
            onChange={handleMessageChange}
          />
        </div>
        <button type="submit" className="editorial-form__submit">
          전달하기
        </button>
        <p className="editorial-form__notice" role="status">
          {isSubmitted ? RSVP_MOCK_NOTICE : ''}
        </p>
      </form>
    </div>
  );
};

export default AttendancePanelView;
