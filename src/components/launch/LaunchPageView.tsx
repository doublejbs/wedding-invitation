import CompareView from './CompareView';
import GalleryView from './GalleryView';
import HighlightsView from './HighlightsView';
import IntroducingView from './IntroducingView';
import LaunchFooterView from './LaunchFooterView';
import LaunchHeroView from './LaunchHeroView';
import LaunchNavView from './LaunchNavView';
import LocationView from './LocationView';
import NumbersView from './NumbersView';
import RsvpView from './RsvpView';
import SpecsView from './SpecsView';

const LaunchPageView = () => {
  return (
    <div className="launch">
      <LaunchNavView />
      <main>
        <LaunchHeroView />
        <IntroducingView />
        <HighlightsView />
        <NumbersView />
        <GalleryView />
        <SpecsView />
        <CompareView />
        <LocationView />
        <RsvpView />
      </main>
      <LaunchFooterView />
    </div>
  );
};

export default LaunchPageView;
