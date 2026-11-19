import type { CSSProperties } from 'react';
import { GALLERY_SETS } from '../../data/InvitationData';
import LaunchSectionTone from '../../enums/LaunchSectionTone';
import useGalleryState from '../../hooks/useGalleryState';
import LaunchSectionView from './LaunchSectionView';
import PhotoView from './PhotoView';
import SectionHeadingView from './SectionHeadingView';

const getTabId = (category: string) => {
  return `gallery-tab-${category.toLowerCase()}`;
};

const GALLERY_PANEL_ID = 'gallery-panel';

const GalleryView = () => {
  const {
    selectedCategory,
    selectedSet,
    activeIndex,
    handleSelectCategory,
    handleTabKeyDown,
    handleSelectPhoto,
    handleTouchStart,
    handleTouchEnd,
    handleKeyDown,
  } = useGalleryState(GALLERY_SETS);
  const trackStyle = { '--gallery-index': activeIndex } as CSSProperties;
  const photoCount = selectedSet.photos.length;

  return (
    <LaunchSectionView label="갤러리" tone={LaunchSectionTone.BLACK} className="launch-gallery">
      <div className="launch-container">
        <SectionHeadingView eyebrow="Gallery" title="함께 남긴 순간들." />
        <div className="launch-segment" role="tablist" aria-label="사진 분류">
          {GALLERY_SETS.map((gallerySet) => {
            const isSelected = gallerySet.category === selectedCategory;

            return (
              <button
                key={gallerySet.category}
                id={getTabId(gallerySet.category)}
                type="button"
                role="tab"
                className="launch-segment__button"
                aria-selected={isSelected}
                tabIndex={isSelected ? 0 : -1}
                aria-controls={GALLERY_PANEL_ID}
                onClick={() => handleSelectCategory(gallerySet.category)}
                onKeyDown={handleTabKeyDown}
              >
                {gallerySet.label}
              </button>
            );
          })}
        </div>
        {/* Keyed by category so the panel remounts and replays the fade-in. */}
        <div
          key={selectedCategory}
          id={GALLERY_PANEL_ID}
          className="launch-gallery__panel"
          role="tabpanel"
          aria-labelledby={getTabId(selectedCategory)}
        >
          <div
            className="launch-gallery__viewport"
            role="region"
            aria-roledescription="carousel"
            tabIndex={0}
            aria-label={`${selectedSet.label} 사진 ${activeIndex + 1} / ${photoCount} (좌우로 넘겨 보세요)`}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onKeyDown={handleKeyDown}
          >
            <ul className="launch-gallery__track" style={trackStyle}>
              {selectedSet.photos.map((photo, index) => (
                <li key={photo.id} className="launch-gallery__slide" aria-hidden={index !== activeIndex}>
                  <PhotoView photo={photo} className="launch-gallery__photo" />
                </li>
              ))}
            </ul>
          </div>
          <div className="launch-gallery__dots">
            {selectedSet.photos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                className="launch-gallery__dot"
                aria-label={`${index + 1}번째 사진 보기`}
                aria-current={index === activeIndex}
                onClick={() => handleSelectPhoto(index)}
              />
            ))}
          </div>
        </div>
      </div>
    </LaunchSectionView>
  );
};

export default GalleryView;
