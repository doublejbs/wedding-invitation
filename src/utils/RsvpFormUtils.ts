import type { ChangeEvent, Dispatch, SetStateAction } from 'react';
import AttendanceStatus from '../enums/AttendanceStatus';
import MealPreference from '../enums/MealPreference';
import type { RsvpForm } from '../types/RsvpForm';
import { findEnumValue } from './EnumUtils';

// Change handlers for the RSVP fields shared by the launch sheet and the editorial attendance form.
export const createRsvpFieldHandlers = <T extends RsvpForm>(setForm: Dispatch<SetStateAction<T>>) => {
  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value;

    setForm((previous) => ({ ...previous, name }));
  };

  const handleAttendanceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const attendance = findEnumValue(Object.values(AttendanceStatus), event.target.value, AttendanceStatus.ATTEND);

    setForm((previous) => ({ ...previous, attendance }));
  };

  const handleGuestCountChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const guestCount = Number(event.target.value);

    setForm((previous) => ({ ...previous, guestCount }));
  };

  const handleMealChange = (event: ChangeEvent<HTMLInputElement>) => {
    const meal = findEnumValue(Object.values(MealPreference), event.target.value, MealPreference.YES);

    setForm((previous) => ({ ...previous, meal }));
  };

  return { handleNameChange, handleAttendanceChange, handleGuestCountChange, handleMealChange };
};
