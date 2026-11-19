import { WALL_PHOTOS } from '../../data/CollageData';
import useLightboxState from '../../hooks/useLightboxState';
import LightboxView from '../shared/LightboxView';
import CollageAttendanceView from './CollageAttendanceView';
import CollageCeremonyView from './CollageCeremonyView';
import CollageClosingView from './CollageClosingView';
import CollageCoverView from './CollageCoverView';
import CollageDirectionsView from './CollageDirectionsView';
import CollageGiftView from './CollageGiftView';
import CollageGreetingView from './CollageGreetingView';
import CollagePhotoWallView from './CollagePhotoWallView';

// The lightbox pages through the nine wall photos only. It sits outside <main> so the whole page can be made inert while it is open.
const CollagePageView = () => {
  const {
    activeIndex,
    handleOpenLightbox,
    handleCloseLightbox,
    handleShowPrevious,
    handleShowNext,
    handleTouchStart,
    handleTouchEnd,
  } = useLightboxState(WALL_PHOTOS.length);

  const handleOpenPhoto = (photoId: string, trigger: HTMLElement) => {
    const index = WALL_PHOTOS.findIndex((photo) => photo.id === photoId);

    if (index < 0) {
      return;
    }

    handleOpenLightbox(index, trigger);
  };

  return (
    <div className="collage">
      <main className="collage__main">
        <CollageCoverView />
        <CollageGreetingView />
        <CollagePhotoWallView onOpenPhoto={handleOpenPhoto} />
        <CollageCeremonyView />
        <CollageDirectionsView />
        <CollageGiftView />
        <CollageAttendanceView />
        <CollageClosingView />
      </main>
      {activeIndex !== null && (
        <LightboxView
          photos={WALL_PHOTOS}
          activeIndex={activeIndex}
          onClose={handleCloseLightbox}
          onShowPrevious={handleShowPrevious}
          onShowNext={handleShowNext}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          classPrefix="collage"
        />
      )}
    </div>
  );
};

export default CollagePageView;
