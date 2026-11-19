import { useState } from 'react';
import { DATING_START_DATE, WEDDING_DATE_TIME } from '../../data/InvitationData';
import LaunchSectionTone from '../../enums/LaunchSectionTone';
import useRevealOnView from '../../hooks/useRevealOnView';
import type { LaunchStat } from '../../types/LaunchStat';
import {
  calculateDaysTogether,
  calculateDaysUntil,
  calculateSeasonsTogether,
  formatDday,
  formatDotDate,
} from '../../utils/WeddingDateUtils';
import LaunchSectionView from './LaunchSectionView';
import NumberStatView from './NumberStatView';
import SectionHeadingView from './SectionHeadingView';

// The D-day counts down toward the wedding (e.g. D-179 → D-149) instead of passing through "D-Day".
const DDAY_COUNTDOWN_RANGE = 30;

const formatCount = (value: number, unit: string) => {
  return `${value.toLocaleString('ko-KR')}${unit}`;
};

const buildStats = (today: Date): LaunchStat[] => {
  const daysUntil = calculateDaysUntil(WEDDING_DATE_TIME, today);
  const ddaySign = daysUntil < 0 ? -1 : 1;

  return [
    {
      id: 'days-together',
      label: '함께한 날',
      value: calculateDaysTogether(DATING_START_DATE, today),
      countFrom: 0,
      formatValue: (value) => formatCount(value, '일'),
      caption: `${formatDotDate(DATING_START_DATE)}부터 오늘까지`,
    },
    {
      id: 'seasons-together',
      label: '함께 본 계절',
      value: calculateSeasonsTogether(DATING_START_DATE, today),
      countFrom: 0,
      formatValue: (value) => formatCount(value, '번'),
      caption: '봄, 여름, 가을, 그리고 겨울',
    },
    {
      id: 'days-until',
      label: '다가올 날',
      value: Math.abs(daysUntil),
      countFrom: Math.abs(daysUntil) + DDAY_COUNTDOWN_RANGE,
      formatValue: (value) => formatDday(ddaySign * value),
      caption: `${formatDotDate(WEDDING_DATE_TIME)} 예식까지`,
    },
  ];
};

const NumbersView = () => {
  const { elementRef, isRevealed } = useRevealOnView<HTMLUListElement>();
  // Computed once on mount from today's date.
  const [stats] = useState(() => buildStats(new Date()));

  return (
    <LaunchSectionView label="숫자로 보는 우리" tone={LaunchSectionTone.WHITE} className="launch-numbers">
      <div className="launch-container">
        <SectionHeadingView eyebrow="By the numbers" title="숫자로 보는 우리." />
        <ul ref={elementRef} className="launch-numbers__list">
          {stats.map((stat) => (
            <NumberStatView key={stat.id} stat={stat} isActive={isRevealed} />
          ))}
        </ul>
      </div>
    </LaunchSectionView>
  );
};

export default NumbersView;
