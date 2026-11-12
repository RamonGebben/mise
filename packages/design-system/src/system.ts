// The type contract every consuming project's tokens object must satisfy.
// Structure only - no values live here. Concrete token values are scaffolded
// per-project (see the architecture plugin's design-system skill).
//
// Every field DesignSystem reads is required and keyed by the unions in
// tokens.ts: a missing token is a type error here rather than a crash at
// runtime.

import type {
  SystemBorderRadius,
  SystemBorderWidth,
  SystemBoxShadow,
  SystemBreakpoint,
  SystemFontFamily,
  SystemFontWeight,
  SystemGradient,
  SystemLineHeight,
  SystemZIndex,
} from './tokens.js';
import type { BaseColor, BaseColorVariant } from './colorPalette.js';
import type { ColorString } from './types.js';

/**
 * The root font size at one breakpoint, as a percentage of the user's own
 * browser setting - never px, which would override that setting (WCAG 1.4.4).
 */
export type RootFontSize = `${number}%`;

export interface SystemType {
  /**
   * The modular-scale ratio every font-size and spacing step is a power of
   * (`base` is 1rem, `m` is `ratio` rem, `s` is `1 / ratio` rem, …). The same
   * at every breakpoint - only `base` changes per breakpoint.
   */
  ratio: number;
  /** The smallest a font size may resolve to, in rem. Doesn't apply to spacing. */
  floor: number;
  /** The root font size per breakpoint, which every rem value scales with. */
  base: Record<SystemBreakpoint, RootFontSize>;
  fontFamily: Record<SystemFontFamily, string>;
  fontWeight: Record<SystemFontWeight, number>;
  lineHeight: Record<SystemLineHeight, number>;
}

/**
 * The width each breakpoint starts at (`min-width`). The smallest should be
 * `'0px'`: it applies everywhere below the next one anyway.
 */
export type SystemBreakpoints = Record<SystemBreakpoint, string>;

export type SystemColorPaletteColor = Record<BaseColorVariant, ColorString>;

export type SystemColorPalette = Record<BaseColor, SystemColorPaletteColor>;

/**
 * Every token that holds a color, and so changes between color modes.
 * Everything else (type, breakpoints, …) is the same in every mode.
 */
export interface SystemModeTokens {
  colorPalette: SystemColorPalette;
  gradient: Record<SystemGradient, string>;
  boxShadow: Record<SystemBoxShadow, string>;
}

/**
 * `dark` is optional: a project without it is intentionally light-only and
 * ignores the OS preference.
 */
export interface SystemModes {
  light: SystemModeTokens;
  dark?: SystemModeTokens;
}

export type SystemZIndexScale = Record<SystemZIndex, number>;

export interface SystemBorder {
  radius: Record<SystemBorderRadius, string>;
  width: Record<SystemBorderWidth, string>;
}

export interface System {
  type: SystemType;
  breakpoints: SystemBreakpoints;
  modes: SystemModes;
  zIndex: SystemZIndexScale;
  border: SystemBorder;
}

/** SystemTokens is System, under the name DesignSystem's constructor expects. */
export type SystemTokens = System;
