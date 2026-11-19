// Joins truthy class names with single spaces, e.g. ('a', false, 'b') → "a b".
export const joinClassNames = (...classNames: (string | false | null | undefined)[]) => {
  return classNames.filter(Boolean).join(' ');
};

// "TICKET" → "ticket", "DATE_STAMP" → "date-stamp", for BEM modifiers built from enum values.
export const toKebabModifier = (value: string) => {
  return value.toLowerCase().replaceAll('_', '-');
};
