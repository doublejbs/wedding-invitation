import { useState, type FormEvent } from 'react';
import AttendanceStatus from '../enums/AttendanceStatus';
import MealPreference from '../enums/MealPreference';
import type { RsvpForm } from '../types/RsvpForm';
import { createRsvpFieldHandlers } from '../utils/RsvpFormUtils';

const INITIAL_FORM: RsvpForm = {
  name: '',
  attendance: AttendanceStatus.ATTEND,
  guestCount: 1,
  meal: MealPreference.YES,
};

// Mock RSVP: nothing is sent or stored; submitting only shows a notice.
const useRsvpState = () => {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [form, setForm] = useState<RsvpForm>(INITIAL_FORM);
  const { handleNameChange, handleAttendanceChange, handleGuestCountChange, handleMealChange } =
    createRsvpFieldHandlers(setForm);

  const handleOpenSheet = () => {
    setIsSubmitted(false);
    setIsSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitted(true);
  };

  return {
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
  };
};

export default useRsvpState;
