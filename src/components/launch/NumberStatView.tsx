import useCountUp from '../../hooks/useCountUp';
import type { LaunchStat } from '../../types/LaunchStat';

interface Props {
  stat: LaunchStat;
  isActive: boolean;
}

const NumberStatView = ({ stat, isActive }: Props) => {
  const countedValue = useCountUp(stat.value, isActive, stat.countFrom);

  return (
    <li className="launch-numbers__item">
      <p className="launch-numbers__label">{stat.label}</p>
      {/* The animated number is hidden from screen readers; the final value is announced instead. */}
      <p className="launch-numbers__value" aria-hidden="true">
        {stat.formatValue(countedValue)}
      </p>
      <p className="launch-visually-hidden">{stat.formatValue(stat.value)}</p>
      <p className="launch-numbers__caption">{stat.caption}</p>
    </li>
  );
};

export default NumberStatView;
