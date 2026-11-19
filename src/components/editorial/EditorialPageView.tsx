import { EDITORIAL_PHOTOS } from '../../data/EditorialData';
import useLightboxState from '../../hooks/useLightboxState';
import ClosingView from './ClosingView';
import EditorialAccordionView from './EditorialAccordionView';
import InfoTickerView from './InfoTickerView';
import LightboxView from '../shared/LightboxView';
import PosterView from './PosterView';

// The lightbox sits outside <main> so the whole page can be made inert while it is open.
const EditorialPageView = () => {
  const {
    activeIndex,
    handleOpenLightbox,
    handleCloseLightbox,
    handleShowPrevious,
    handleShowNext,
    handleTouchStart,
    handleTouchEnd,
  } = useLightboxState(EDITORIAL_PHOTOS.length);

  const handleOpenPhoto = (photoId: string, trigger: HTMLElement) => {
    const index = EDITORIAL_PHOTOS.findIndex((photo) => photo.id === photoId);

    if (index < 0) {
      return;
    }

    handleOpenLightbox(index, trigger);
  };

  return (
    <div className="editorial">
      <main className="editorial__main">
        <PosterView onOpenPhoto={handleOpenPhoto} />
        <InfoTickerView />
        <EditorialAccordionView />
        <ClosingView />
      </main>
      {activeIndex !== null && (
        <LightboxView
          photos={EDITORIAL_PHOTOS}
          activeIndex={activeIndex}
          onClose={handleCloseLightbox}
          onShowPrevious={handleShowPrevious}
          onShowNext={handleShowNext}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        />
      )}
    </div>
  );
};

export default EditorialPageView;
