export interface LaunchStat {
  id: string;
  label: string;
  // Final value the counter animates to (always >= 0).
  value: number;
  // Value the counter starts from before animating to `value`.
  countFrom: number;
  formatValue: (value: number) => string;
  caption: string;
}
