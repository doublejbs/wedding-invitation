import AttendanceStatus from '../enums/AttendanceStatus';
import MealPreference from '../enums/MealPreference';
import type { ChoiceOption } from '../types/ChoiceOption';

// Choices shared by the launch RSVP sheet, the editorial attendance panel and the collage attendance form.
export const ATTENDANCE_OPTIONS: ChoiceOption<AttendanceStatus>[] = [
  { value: AttendanceStatus.ATTEND, label: '참석' },
  { value: AttendanceStatus.ABSENT, label: '불참' },
];

export const MEAL_OPTIONS: ChoiceOption<MealPreference>[] = [
  { value: MealPreference.YES, label: '식사 예정' },
  { value: MealPreference.NO, label: '식사 안 함' },
  { value: MealPreference.UNDECIDED, label: '미정' },
];

export const GUEST_COUNT_OPTIONS = [1, 2, 3, 4, 5];
