// Returns the enum value equal to `candidate`, or `fallback` when none matches (e.g. for form input values).
export const findEnumValue = <T extends string>(values: T[], candidate: string, fallback: T) => {
  return values.find((value) => value === candidate) ?? fallback;
};
