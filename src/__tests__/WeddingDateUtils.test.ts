import {
  calculateDaysTogether,
  calculateDaysUntil,
  calculateSeasonsTogether,
  formatDday,
  formatDotDate,
  formatEnglishDateTime,
  formatEnglishMonthDay,
  formatKoreanDateTime,
  formatLabelDateTime,
  formatShortDotDate,
} from '../utils/WeddingDateUtils';

describe('WeddingDateUtils', () => {
  describe('calculateDaysTogether', () => {
    it('counts the start day as day 1', () => {
      expect(calculateDaysTogether(new Date(2022, 2, 1), new Date(2022, 2, 1))).toBe(1);
      expect(calculateDaysTogether(new Date(2022, 2, 1), new Date(2022, 2, 2))).toBe(2);
    });

    it('counts calendar days across leap years regardless of time of day', () => {
      expect(calculateDaysTogether(new Date(2022, 2, 1), new Date(2026, 10, 19, 23, 59))).toBe(1725);
      expect(calculateDaysTogether(new Date(2022, 2, 1), new Date(2027, 3, 17, 13, 0))).toBe(1874);
    });

    it('returns 0 before the start date', () => {
      expect(calculateDaysTogether(new Date(2022, 2, 1), new Date(2022, 1, 28))).toBe(0);
    });
  });

  describe('calculateDaysUntil', () => {
    const WEDDING = new Date(2027, 3, 17, 13, 0);

    it('returns the calendar-day difference until the wedding', () => {
      expect(calculateDaysUntil(WEDDING, new Date(2026, 10, 19, 23, 0))).toBe(149);
      expect(calculateDaysUntil(WEDDING, new Date(2027, 3, 16, 0, 0))).toBe(1);
    });

    it('returns 0 on the wedding day and negative afterwards', () => {
      expect(calculateDaysUntil(WEDDING, new Date(2027, 3, 17, 20, 0))).toBe(0);
      expect(calculateDaysUntil(WEDDING, new Date(2027, 3, 18, 9, 0))).toBe(-1);
    });
  });

  describe('calculateSeasonsTogether', () => {
    it('counts each meteorological season touched, inclusive', () => {
      expect(calculateSeasonsTogether(new Date(2022, 2, 1), new Date(2022, 4, 31))).toBe(1);
      expect(calculateSeasonsTogether(new Date(2022, 2, 1), new Date(2022, 5, 1))).toBe(2);
      expect(calculateSeasonsTogether(new Date(2022, 10, 30), new Date(2022, 11, 1))).toBe(2);
    });

    it('treats December through February as one winter', () => {
      expect(calculateSeasonsTogether(new Date(2022, 11, 15), new Date(2023, 1, 10))).toBe(1);
    });

    it('returns 0 before the start date', () => {
      expect(calculateSeasonsTogether(new Date(2022, 2, 1), new Date(2022, 1, 1))).toBe(0);
    });
  });

  describe('formatDday', () => {
    it('formats remaining, same-day and past values', () => {
      expect(formatDday(149)).toBe('D-149');
      expect(formatDday(0)).toBe('D-Day');
      expect(formatDday(-3)).toBe('D+3');
    });
  });

  describe('formatKoreanDateTime', () => {
    it('formats date, weekday and 12-hour time in Korean', () => {
      expect(formatKoreanDateTime(new Date(2027, 3, 17, 13, 0))).toBe('2027년 4월 17일 토요일 오후 1시');
      expect(formatKoreanDateTime(new Date(2027, 3, 17, 12, 30))).toBe('2027년 4월 17일 토요일 오후 12시 30분');
      expect(formatKoreanDateTime(new Date(2027, 3, 18, 0, 0))).toBe('2027년 4월 18일 일요일 오전 12시');
    });
  });

  describe('formatDotDate', () => {
    it('zero-pads month and day', () => {
      expect(formatDotDate(new Date(2027, 3, 7))).toBe('2027. 04. 07.');
    });
  });

  describe('formatShortDotDate', () => {
    it('formats a two-digit year, month and day', () => {
      expect(formatShortDotDate(new Date(2027, 3, 17))).toBe('27.04.17');
      expect(formatShortDotDate(new Date(2030, 10, 3))).toBe('30.11.03');
    });
  });

  describe('formatEnglishDateTime', () => {
    it('formats the date with an English weekday and 12-hour time', () => {
      expect(formatEnglishDateTime(new Date(2027, 3, 17, 13, 0))).toBe('2027. 4. 17. SAT 1PM');
      expect(formatEnglishDateTime(new Date(2027, 3, 18, 11, 30))).toBe('2027. 4. 18. SUN 11:30AM');
      expect(formatEnglishDateTime(new Date(2027, 3, 18, 0, 0))).toBe('2027. 4. 18. SUN 12AM');
    });
  });

  describe('formatLabelDateTime', () => {
    it('formats the label-maker date with zero-padded parts, weekday and 12-hour time', () => {
      expect(formatLabelDateTime(new Date(2027, 3, 17, 13, 0))).toBe('2027.04.17 SAT 1PM');
      expect(formatLabelDateTime(new Date(2027, 3, 18, 11, 30))).toBe('2027.04.18 SUN 11:30AM');
    });
  });

  describe('formatEnglishMonthDay', () => {
    it('formats an abbreviated English month and the day', () => {
      expect(formatEnglishMonthDay(new Date(2027, 3, 17))).toBe('APR 17');
      expect(formatEnglishMonthDay(new Date(2027, 11, 1))).toBe('DEC 1');
    });
  });
});
