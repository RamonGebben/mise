// The one modular scale font sizes and spacing both follow, as in print:
// spacing derives from the type size, never from a table of its own. Every
// value is `ratio^step` rem, so the only thing that changes per breakpoint is
// the root font size (`type.base`) it all multiplies with.

import type {
  SystemBreakpoint,
  SystemFontSize,
  SystemSpacing,
} from './tokens.js';
import type { SystemTokens } from './system.js';

export const FONT_SIZE_STEPS: Record<SystemFontSize, number> = {
  s: -1,
  base: 0,
  m: 1,
  l: 2,
  xl: 3,
};

export const SPACING_STEPS: Record<SystemSpacing, number> = {
  xxs: -3,
  xs: -2,
  s: -1,
  base: 0,
  m: 1,
  l: 2,
  xl: 3,
};

/** The browser's default root font size - what `100%` resolves to unless the user changed it. */
export const BROWSER_DEFAULT_FONT_SIZE = 16;

/** Rounded so the generated CSS stays readable. */
const round = (value: number): number => Math.round(value * 10000) / 10000;

/** A font size in rem, before the floor is applied. */
export const unflooredFontSizeRem = (
  tokens: SystemTokens,
  size: SystemFontSize,
): number => round(tokens.type.ratio ** FONT_SIZE_STEPS[size]);

/** A font size in rem, never below `type.floor`. */
export const fontSizeRem = (
  tokens: SystemTokens,
  size: SystemFontSize,
): number => Math.max(tokens.type.floor, unflooredFontSizeRem(tokens, size));

export const spacingRem = (tokens: SystemTokens, size: SystemSpacing): number =>
  round(tokens.type.ratio ** SPACING_STEPS[size]);

/** The breakpoints ordered by the width they start at, narrowest first. */
export const sortedBreakpoints = (
  tokens: SystemTokens,
): Array<SystemBreakpoint> =>
  (Object.keys(tokens.breakpoints) as Array<SystemBreakpoint>).sort(
    (a, b) =>
      parseFloat(tokens.breakpoints[a]) - parseFloat(tokens.breakpoints[b]),
  );

/** The root font size at a breakpoint in px, assuming the browser default. */
export const rootFontSizePx = (
  tokens: SystemTokens,
  breakpoint: SystemBreakpoint,
): number =>
  (parseFloat(tokens.type.base[breakpoint]) / 100) * BROWSER_DEFAULT_FONT_SIZE;
