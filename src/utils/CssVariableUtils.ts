import type { CSSProperties } from 'react';

// React's CSSProperties has no index signature for custom properties; this keeps the cast in one place.
export const createCssVariables = (variables: Record<`--${string}`, string | number>) => {
  return variables as CSSProperties;
};

// Converts a design-canvas length to a percentage string, e.g. (39.3, 393) → "10.000%".
export const convertToPercent = (value: number, total: number) => {
  return `${((value / total) * 100).toFixed(3)}%`;
};
