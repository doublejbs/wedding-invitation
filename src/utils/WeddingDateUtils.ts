const MS_PER_DAY = 24 * 60 * 60 * 1000;

const MONTHS_PER_SEASON = 3;

// Meteorological seasons: spring starts in March (month index 2).
const SPRING_START_MONTH_INDEX = 2;

const WEEKDAY_NAMES = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

const ENGLISH_WEEKDAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

const ENGLISH_MONTH_ABBREVIATIONS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

// 4 → "04", 17 → "17".
const padTwoDigits = (value: number) => {
  return String(value).padStart(2, '0');
};

// Calendar-day ordinal in local time, so time of day and DST shifts do not matter.
const getCalendarDayNumber = (date: Date) => {
  const utcMidnight = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());

  return Math.round(utcMidnight / MS_PER_DAY);
};

const getSeasonOrdinal = (date: Date) => {
  const monthOrdinal = date.getFullYear() * 12 + date.getMonth() - SPRING_START_MONTH_INDEX;

  return Math.floor(monthOrdinal / MONTHS_PER_SEASON);
};

// Days together counting the start day as day 1 (Korean "D+1" convention). 0 before the start.
export const calculateDaysTogether = (startDate: Date, today: Date) => {
  const elapsed = getCalendarDayNumber(today) - getCalendarDayNumber(startDate);

  if (elapsed < 0) {
    return 0;
  }

  return elapsed + 1;
};

// Calendar days until the target date: 0 on the day itself, negative afterwards.
export const calculateDaysUntil = (targetDate: Date, today: Date) => {
  return getCalendarDayNumber(targetDate) - getCalendarDayNumber(today);
};

// Number of distinct seasons (spring/summer/autumn/winter) touched from start to today, inclusive.
export const calculateSeasonsTogether = (startDate: Date, today: Date) => {
  if (getCalendarDayNumber(today) < getCalendarDayNumber(startDate)) {
    return 0;
  }

  return getSeasonOrdinal(today) - getSeasonOrdinal(startDate) + 1;
};

export const formatDday = (daysUntil: number) => {
  if (daysUntil === 0) {
    return 'D-Day';
  }

  if (daysUntil > 0) {
    return `D-${daysUntil}`;
  }

  return `D+${Math.abs(daysUntil)}`;
};

// 12-hour clock parts: 0:00 → 12 AM, 13:05 → 1 PM with 5 minutes.
const getTwelveHourParts = (date: Date) => {
  const hours = date.getHours();

  return {
    isMorning: hours < 12,
    displayHour: hours % 12 === 0 ? 12 : hours % 12,
    minutes: date.getMinutes(),
  };
};

export const formatKoreanDateTime = (date: Date) => {
  const { isMorning, displayHour, minutes } = getTwelveHourParts(date);
  const meridiem = isMorning ? '오전' : '오후';
  const minuteText = minutes === 0 ? '' : ` ${minutes}분`;
  const dateText = `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${WEEKDAY_NAMES[date.getDay()]}`;

  return `${dateText} ${meridiem} ${displayHour}시${minuteText}`;
};

// "2027. 04. 17." style used for captions.
export const formatDotDate = (date: Date) => {
  const month = padTwoDigits(date.getMonth() + 1);
  const day = padTwoDigits(date.getDate());

  return `${date.getFullYear()}. ${month}. ${day}.`;
};

// "27.04.17" style used on the editorial poster.
export const formatShortDotDate = (date: Date) => {
  const year = padTwoDigits(date.getFullYear() % 100);
  const month = padTwoDigits(date.getMonth() + 1);
  const day = padTwoDigits(date.getDate());

  return `${year}.${month}.${day}`;
};

// "2027. 4. 17. SAT 1PM" style used in the editorial info ticker.
// "SAT 1PM" / "SUN 11:30AM": English weekday and 12-hour time without a space before the meridiem.
const formatEnglishTime = (date: Date) => {
  const { isMorning, displayHour, minutes } = getTwelveHourParts(date);
  const meridiem = isMorning ? 'AM' : 'PM';
  const minuteText = minutes === 0 ? '' : `:${padTwoDigits(minutes)}`;

  return `${ENGLISH_WEEKDAY_NAMES[date.getDay()]} ${displayHour}${minuteText}${meridiem}`;
};

export const formatEnglishDateTime = (date: Date) => {
  const dateText = `${date.getFullYear()}. ${date.getMonth() + 1}. ${date.getDate()}.`;

  return `${dateText} ${formatEnglishTime(date)}`;
};

// "2027.04.17 SAT 1PM" style printed on the collage label-maker band.
export const formatLabelDateTime = (date: Date) => {
  const dateText = `${date.getFullYear()}.${padTwoDigits(date.getMonth() + 1)}.${padTwoDigits(date.getDate())}`;

  return `${dateText} ${formatEnglishTime(date)}`;
};

// "APR 17" style printed in the middle of the collage date stamp.
export const formatEnglishMonthDay = (date: Date) => {
  return `${ENGLISH_MONTH_ABBREVIATIONS[date.getMonth()]} ${date.getDate()}`;
};
