import type AttendanceStatus from '../enums/AttendanceStatus';
import type MealPreference from '../enums/MealPreference';

export interface RsvpForm {
  name: string;
  attendance: AttendanceStatus;
  guestCount: number;
  meal: MealPreference;
}
