import { CEREMONY_HEADLINE, EDITORIAL_CEREMONY_ROWS } from '../../data/EditorialData';

const CeremonyPanelView = () => {
  return (
    <div className="editorial-panel">
      <p className="editorial-panel__headline">{CEREMONY_HEADLINE}</p>
      <dl className="editorial-list">
        {EDITORIAL_CEREMONY_ROWS.map((row) => (
          <div key={row.label} className="editorial-list__row">
            <dt className="editorial-list__label editorial-mono">{row.label}</dt>
            <dd className="editorial-list__value">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
};

export default CeremonyPanelView;
