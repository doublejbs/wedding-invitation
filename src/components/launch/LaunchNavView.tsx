import { BRIDE_NAME, GROOM_NAME } from '../../data/InvitationData';
import useScrolledPast from '../../hooks/useScrolledPast';

const NAV_SHOW_AFTER_PX = 48;

const LaunchNavView = () => {
  const isVisible = useScrolledPast(NAV_SHOW_AFTER_PX);
  const stateClassName = isVisible ? ' is-visible' : '';

  return (
    <nav className={`launch-nav${stateClassName}`} aria-label="상단 메뉴">
      <div className="launch-nav__inner">
        <span className="launch-nav__title">{`${GROOM_NAME} & ${BRIDE_NAME}`}</span>
        <a className="launch-button launch-button--small" href="#rsvp">
          참석 예약
        </a>
      </div>
    </nav>
  );
};

export default LaunchNavView;
