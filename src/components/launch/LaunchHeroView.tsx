import { useRef } from 'react';
import { HERO_PHOTO, HERO_SUBTITLE, HERO_TITLE, WEDDING_DATE_TIME } from '../../data/InvitationData';
import LaunchSectionTone from '../../enums/LaunchSectionTone';
import useScrollProgress from '../../hooks/useScrollProgress';
import { formatDotDate } from '../../utils/WeddingDateUtils';
import LaunchSectionView from './LaunchSectionView';
import PhotoView from './PhotoView';

// Sticky stage: as --hero-progress goes 0 → 1, the photo card grows to fill the screen (see LaunchPage.css).
const LaunchHeroView = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useScrollProgress(sectionRef, '--hero-progress');

  return (
    <LaunchSectionView ref={sectionRef} label="히어로" tone={LaunchSectionTone.BLACK} className="launch-hero">
      <div className="launch-hero__stage">
        <div className="launch-hero__text">
          <h1 className="launch-hero__title">{HERO_TITLE}</h1>
          <p className="launch-hero__subtitle">{HERO_SUBTITLE}</p>
        </div>
        <div className="launch-hero__media">
          <PhotoView photo={HERO_PHOTO} className="launch-hero__photo" />
        </div>
        <p className="launch-hero__caption">{formatDotDate(WEDDING_DATE_TIME)}</p>
      </div>
    </LaunchSectionView>
  );
};

export default LaunchHeroView;
