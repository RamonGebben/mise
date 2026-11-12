// Media-query helpers over the breakpoints, where each breakpoint is the
// width it starts at. Range syntax keeps the edges exact: `lessThan('tablet')`
// stops just before the width `greaterThan('tablet')` - and the tablet root
// font size in `rootCss()` - starts at, so no width ever matches both.

import { css, type Interpolation, type RuleSet } from 'styled-components';
import type { SystemBreakpoint, SystemBreakpointMap } from './tokens.js';

export type MediaTemplate = <Props extends object = object>(
  styles: TemplateStringsArray,
  ...interpolations: Array<Interpolation<Props>>
) => RuleSet<Props>;

export interface MediaGenerator {
  /** Below the width `breakpoint` starts at. */
  lessThan: (breakpoint: SystemBreakpoint) => MediaTemplate;
  /** From the width `breakpoint` starts at, up. */
  greaterThan: (breakpoint: SystemBreakpoint) => MediaTemplate;
  /** From where `from` starts, up to just before where `until` starts. */
  between: (from: SystemBreakpoint, until: SystemBreakpoint) => MediaTemplate;
}

const media =
  (condition: string): MediaTemplate =>
  <Props extends object>(
    styles: TemplateStringsArray,
    ...interpolations: Array<Interpolation<Props>>
  ) => css<Props>`
    @media ${condition} {
      ${css<Props>(styles, ...interpolations)}
    }
  `;

export const generateMedia = (
  breakpoints: SystemBreakpointMap,
): MediaGenerator => ({
  lessThan: breakpoint => media(`(width < ${breakpoints[breakpoint]})`),
  greaterThan: breakpoint => media(`(width >= ${breakpoints[breakpoint]})`),
  between: (from, until) =>
    media(`(${breakpoints[from]} <= width < ${breakpoints[until]})`),
});
