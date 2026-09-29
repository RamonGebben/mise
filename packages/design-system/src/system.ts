// The type contract every consuming project's tokens object must satisfy.
// Structure only - no values live here. Concrete token values are scaffolded
// per-project (see the architecture plugin's design-system skill).
//
// Every field DesignSystem reads is required and keyed by the unions in
// tokens.ts: a missing token is a type error here rather than a crash at
// runtime.

import type {
  SystemBoxShadow,
  SystemBreakpoint,
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
  fontFamily: { [key: string]: string };
  fontWeight: Record<SystemFontWeight, number>;
  sizes: Record<SystemBreakpoint, SystemFontSizes>;
  lineHeight: Record<SystemLineHeight, number>;
}

export type SystemBreakpoints = Record<SystemBreakpoint, string>;

export type SystemColorPaletteColor = Record<BaseColorVariant, ColorString>;

export type SystemColorPalette = Record<BaseColor, SystemColorPaletteColor>;

export interface SystemColor {
  colorPalette: SystemColorPalette;
  gradient: Record<SystemGradient, string>;
}

export type SystemZIndexScale = Record<SystemZIndex, number>;

/** A pixel value per size, as `'16px'` or `16`. */
export type SystemScale = Record<SystemSize, string | number>;

export interface SystemSpacing {
  scale: Record<SystemBreakpoint, SystemScale>;
}

export interface SystemBorder {
  radius: {
    s: string;
    base: string;
    full: string;
  };
  width: {
    s: string;
    base: string;
  };
}

export interface System {
  type: SystemType;
  breakpoints: SystemBreakpoints;
  colors: SystemColor;
  zIndex: SystemZIndexScale;
  spacing: SystemSpacing;
  border?: SystemBorder;
  boxShadow: Record<SystemBoxShadow, string>;
}

/** SystemTokens is System, under the name DesignSystem's constructor expects. */
export type SystemTokens = System;
