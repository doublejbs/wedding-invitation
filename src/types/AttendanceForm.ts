import type { RsvpForm } from './RsvpForm';

export interface AttendanceForm extends RsvpForm {
  phone: string;
  message: string;
}
