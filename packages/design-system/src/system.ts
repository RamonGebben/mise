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
  SystemSize,
  SystemZIndex,
} from './tokens.js';
import type { BaseColor, BaseColorVariant } from './colorPalette.js';
import type { ColorString } from './types.js';

/** A pixel value per size, as `'16px'` or `16`. */
export type SystemFontSizes = Record<SystemSize, string | number>;

export interface SystemType {
  baseFontSize: string | number;
  fontFamily: Record<SystemFontFamily, string>;
  fontWeight: Record<SystemFontWeight, number>;
  sizes: Record<SystemBreakpoint, SystemFontSizes>;
  lineHeight: Record<SystemLineHeight, number>;
}

export type SystemBreakpoints = Record<SystemBreakpoint, string>;

export type SystemColorPaletteColor = Record<BaseColorVariant, ColorString>;

export type SystemColorPalette = Record<BaseColor, SystemColorPaletteColor>;

/**
 * Every token that holds a color, and so changes between color modes.
 * Everything else (type, spacing, breakpoints, …) is the same in every mode.
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

/** A pixel value per size, as `'16px'` or `16`. */
export type SystemScale = Record<SystemSize, string | number>;

export interface SystemSpacing {
  scale: Record<SystemBreakpoint, SystemScale>;
}

export interface SystemBorder {
  radius: Record<SystemBorderRadius, string>;
  width: Record<SystemBorderWidth, string>;
}

export interface System {
  type: SystemType;
  breakpoints: SystemBreakpoints;
  modes: SystemModes;
  zIndex: SystemZIndexScale;
  spacing: SystemSpacing;
  border: SystemBorder;
}

/** SystemTokens is System, under the name DesignSystem's constructor expects. */
export type SystemTokens = System;
