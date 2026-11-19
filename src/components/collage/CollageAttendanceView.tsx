import { ATTENDANCE_DEADLINE_NOTE } from '../../data/EditorialData';
import { RSVP_MOCK_NOTICE } from '../../data/InvitationData';
import { ATTENDANCE_OPTIONS, GUEST_COUNT_OPTIONS, MEAL_OPTIONS } from '../../data/RsvpOptionData';
import AttendanceStatus from '../../enums/AttendanceStatus';
import useAttendanceState from '../../hooks/useAttendanceState';
import RequiredMarkView from '../shared/RequiredMarkView';
import CollageSectionHeadingView from './CollageSectionHeadingView';

const HEADING_ID = 'collage-attendance-heading';

// Mock form: submitting only shows a notice; nothing is sent or stored.
const CollageAttendanceView = () => {
  const { form, isSubmitted, handleNameChange, handleAttendanceChange, handleGuestCountChange, handleMealChange, handleSubmit } =
    useAttendanceState();
  const isAbsent = form.attendance === AttendanceStatus.ABSENT;

  return (
    <section className="collage-section collage-attendance" aria-labelledby={HEADING_ID}>
      <CollageSectionHeadingView id={HEADING_ID} number="06" englishTitle="RSVP" title="참석 여부" />
      <p className="collage-section__lead">참석 여부를 미리 알려주시면 정성껏 준비하겠습니다.</p>
      <p className="collage-attendance__deadline collage-mono">{ATTENDANCE_DEADLINE_NOTE}</p>
      <form className="collage-form" onSubmit={handleSubmit}>
        <div className="collage-form__field">
          <label className="collage-form__label collage-mono" htmlFor="collage-rsvp-name">
            성함 <RequiredMarkView classPrefix="collage" />
          </label>
          <input
            id="collage-rsvp-name"
            className="collage-form__input"
            type="text"
            autoComplete="name"
            required
            value={form.name}
            onChange={handleNameChange}
          />
        </div>
        <fieldset className="collage-form__field">
          <legend className="collage-form__label collage-mono">
            참석 여부 <RequiredMarkView classPrefix="collage" />
          </legend>
          <div className="collage-form__choices">
            {ATTENDANCE_OPTIONS.map((option) => (
              <label key={option.value} className="collage-choice">
                <input
                  type="radio"
                  name="collage-attendance"
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
        <div className="collage-form__field">
          <label className="collage-form__label collage-mono" htmlFor="collage-rsvp-guest-count">
            인원
          </label>
          <select
            id="collage-rsvp-guest-count"
            className="collage-form__input"
            value={form.guestCount}
            disabled={isAbsent}
            onChange={handleGuestCountChange}
          >
            {GUEST_COUNT_OPTIONS.map((count) => (
              <option key={count} value={count}>{`${count}명`}</option>
            ))}
          </select>
        </div>
        <fieldset className="collage-form__field" disabled={isAbsent}>
          <legend className="collage-form__label collage-mono">
            식사 여부 <RequiredMarkView classPrefix="collage" />
          </legend>
          <div className="collage-form__choices">
            {MEAL_OPTIONS.map((option) => (
              <label key={option.value} className="collage-choice">
                <input
                  type="radio"
                  name="collage-meal"
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
        <button type="submit" className="collage-form__submit">
          전달하기
        </button>
        <p className="collage-form__notice" role="status">
          {isSubmitted ? RSVP_MOCK_NOTICE : ''}
        </p>
      </form>
    </section>
  );
};

export default CollageAttendanceView;
