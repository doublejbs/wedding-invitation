interface Props {
  // Referenced by the section's aria-labelledby.
  id: string;
  number: string;
  englishTitle: string;
  title: string;
}

// "02 — GREETING" DM Mono kicker above the Korean section title.
const CollageSectionHeadingView = ({ id, number, englishTitle, title }: Props) => {
  return (
    <header className="collage-heading">
      <p className="collage-heading__kicker collage-mono" aria-hidden="true">{`${number} — ${englishTitle}`}</p>
      <h2 id={id} className="collage-heading__title">{title}</h2>
    </header>
  );
};

export default CollageSectionHeadingView;
