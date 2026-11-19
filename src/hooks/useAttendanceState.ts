import { useState, type ChangeEvent, type FormEvent } from 'react';
import AttendanceStatus from '../enums/AttendanceStatus';
import MealPreference from '../enums/MealPreference';
import type { AttendanceForm } from '../types/AttendanceForm';
import { createRsvpFieldHandlers } from '../utils/RsvpFormUtils';

const INITIAL_FORM: AttendanceForm = {
  name: '',
  phone: '',
  attendance: AttendanceStatus.ATTEND,
  guestCount: 1,
  meal: MealPreference.YES,
  message: '',
};

// Mock attendance form for the editorial page: nothing is sent or stored; submitting only shows a notice.
const useAttendanceState = () => {
  const [form, setForm] = useState<AttendanceForm>(INITIAL_FORM);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { handleNameChange, handleAttendanceChange, handleGuestCountChange, handleMealChange } =
    createRsvpFieldHandlers(setForm);

  const handlePhoneChange = (event: ChangeEvent<HTMLInputElement>) => {
    const phone = event.target.value;

    setForm((previous) => ({ ...previous, phone }));
  };

  const handleMessageChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const message = event.target.value;

    setForm((previous) => ({ ...previous, message }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitted(true);
  };

  return {
    form,
    isSubmitted,
    handleNameChange,
    handlePhoneChange,
    handleAttendanceChange,
    handleGuestCountChange,
    handleMealChange,
    handleMessageChange,
    handleSubmit,
  };
};

export default useAttendanceState;
