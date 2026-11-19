const DEFAULT_CLASS_PREFIX = 'editorial';

interface Props {
  // Page namespace for the BEM class, e.g. "editorial" → "editorial-form__required".
  classPrefix?: string;
}

// Visual "*" after a required field label; the input's `required` attribute carries the meaning.
const RequiredMarkView = ({ classPrefix = DEFAULT_CLASS_PREFIX }: Props) => {
  return (
    <span className={`${classPrefix}-form__required`} aria-hidden="true">
      *
    </span>
  );
};

export default RequiredMarkView;
