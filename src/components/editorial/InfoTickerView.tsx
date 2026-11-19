import { TICKER_TEXT } from '../../data/EditorialData';

// Endless marquee: the text is rendered twice and the track slides by half its width.
// The second copy is hidden from assistive tech; with reduced motion it is hidden and the text wraps.
const InfoTickerView = () => {
  return (
    <section className="editorial-ticker" aria-label="정보 띠">
      <span className="editorial-ticker__label editorial-mono">INFO</span>
      <div className="editorial-ticker__viewport">
        <div className="editorial-ticker__track">
          <p className="editorial-ticker__text">{TICKER_TEXT}</p>
          <p className="editorial-ticker__text editorial-ticker__text--clone" aria-hidden="true">
            {TICKER_TEXT}
          </p>
        </div>
      </div>
    </section>
  );
};

export default InfoTickerView;
