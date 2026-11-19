import RevealView from './RevealView';

interface Props {
  eyebrow: string;
  title: string;
  description?: string;
}

const SectionHeadingView = ({ eyebrow, title, description }: Props) => {
  return (
    <RevealView className="launch-heading">
      <p className="launch-heading__eyebrow">{eyebrow}</p>
      <h2 className="launch-heading__title">{title}</h2>
      {description && <p className="launch-heading__description">{description}</p>}
    </RevealView>
  );
};

export default SectionHeadingView;
