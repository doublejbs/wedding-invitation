import type { ChangeEvent, FormEvent } from 'react';
import { RSVP_MOCK_NOTICE } from '../../data/InvitationData';
import { ATTENDANCE_OPTIONS, GUEST_COUNT_OPTIONS, MEAL_OPTIONS } from '../../data/RsvpOptionData';
import AttendanceStatus from '../../enums/AttendanceStatus';
import useSheetDismiss from '../../hooks/useSheetDismiss';
import type { RsvpForm } from '../../types/RsvpForm';

const SHEET_TITLE_ID = 'rsvp-sheet-title';

interface Props {
  form: RsvpForm;
  isSubmitted: boolean;
  onClose: () => void;
  onNameChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onAttendanceChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onGuestCountChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  onMealChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

const RsvpSheetView = ({
  form,
  isSubmitted,
  onClose,
  onNameChange,
  onAttendanceChange,
  onGuestCountChange,
  onMealChange,
  onSubmit,
}: Props) => {
  const sheetRef = useSheetDismiss<HTMLDivElement>(onClose);
  const isAbsent = form.attendance === AttendanceStatus.ABSENT;

  return (
    <div ref={sheetRef} className="launch-sheet">
      <div className="launch-sheet__backdrop" aria-hidden="true" onClick={onClose} />
      <div
        className="launch-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={SHEET_TITLE_ID}
        tabIndex={-1}
      >
        <div className="launch-sheet__header">
          <h2 id={SHEET_TITLE_ID} className="launch-sheet__title">
            참석 의사 전하기
          </h2>
          <button type="button" className="launch-sheet__close" aria-label="닫기" onClick={onClose}>
            <span aria-hidden="true">×</span>
          </button>
        </div>
        <form className="launch-form" onSubmit={onSubmit}>
          <div className="launch-form__field">
            <label className="launch-form__label" htmlFor="rsvp-name">
              이름
            </label>
            <input
              id="rsvp-name"
              className="launch-form__input"
              type="text"
              autoComplete="name"
              required
              value={form.name}
              onChange={onNameChange}
              data-autofocus
            />
          </div>
          <fieldset className="launch-form__field">
            <legend className="launch-form__label">참석 여부</legend>
            <div className="launch-choices">
              {ATTENDANCE_OPTIONS.map((option) => (
                <label key={option.value} className="launch-choice">
                  <input
                    type="radio"
                    name="attendance"
                    value={option.value}
                    checked={form.attendance === option.value}
                    onChange={onAttendanceChange}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="launch-form__field">
            <label className="launch-form__label" htmlFor="rsvp-guest-count">
              인원
            </label>
            <select
              id="rsvp-guest-count"
              className="launch-form__input"
              value={form.guestCount}
              disabled={isAbsent}
              onChange={onGuestCountChange}
            >
              {GUEST_COUNT_OPTIONS.map((count) => (
                <option key={count} value={count}>{`${count}명`}</option>
              ))}
            </select>
          </div>
          <fieldset className="launch-form__field" disabled={isAbsent}>
            <legend className="launch-form__label">식사 여부</legend>
            <div className="launch-choices">
              {MEAL_OPTIONS.map((option) => (
                <label key={option.value} className="launch-choice">
                  <input
                    type="radio"
                    name="meal"
                    value={option.value}
                    checked={form.meal === option.value}
                    onChange={onMealChange}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <button type="submit" className="launch-button launch-button--block">
            전달하기
          </button>
          <div className="launch-form__notice" role="status">
            {isSubmitted && (
              <>
                <strong>{RSVP_MOCK_NOTICE}</strong>
                <span> 실제 청첩장에서는 이 내용이 신랑·신부에게 전달됩니다.</span>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default RsvpSheetView;
