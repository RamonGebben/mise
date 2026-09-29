// The type contract every consuming project's tokens object must satisfy.
// Structure only - no values live here. Concrete token values are scaffolded
// per-project (see the architecture plugin's design-system skill).

export interface SystemOptions {
  fontSizeUnit?: string | undefined;
}

export interface SystemOptionalKey {
  [prop: string]: string | number;
}

export interface SystemFontSizes {
  xxs?: string | number;
  xs?: string | number;
  s: string | number;
  base: string | number;
  m: string | number;
  l: string | number;
  xl?: string | number;
}

export interface SystemType {
  baseFontSize?: string | number;
  fontFamily: { [key: string]: string };
  fontWeight: { [key: string]: number };
  sizes?: {
    mobile: SystemFontSizes;
    tablet?: SystemFontSizes;
    tabletLandscape?: SystemFontSizes;
    desktop: SystemFontSizes;
  };
  lineHeight: { [key: string]: string | number };
}

export interface SystemBreakpoints {
  mobile: string;
  tablet?: string;
  tabletLandscape?: string;
  desktop: string;
}

export interface SystemColorPaletteColor {
  base: string;
  text: string;
  darker: string;
}

export interface SystemColorPalette {
  error: SystemColorPaletteColor;
  formBackground: SystemColorPaletteColor;
  background: SystemColorPaletteColor;
  primary: SystemColorPaletteColor;
  secondary: SystemColorPaletteColor;
  tertiary: SystemColorPaletteColor;
  quaternary: SystemColorPaletteColor;
}

export interface SystemColor {
  colorPalette?: SystemColorPalette;
  gradient?: { [variant: string]: string };
}

export interface SystemZIndexScale {
  [name: string]: number;
}

export type SystemScale =
  | Array<number>
  | Array<string>
  | {
      [size: string]: string | number;
    };

export interface SystemSpacing {
  scale?: {
    mobile: SystemScale;
    tablet?: SystemScale;
    tabletLandscape?: SystemScale;
    desktop: SystemScale;
  };
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
  [prop: string]: any;
  type?: SystemType;
  breakpoints: SystemBreakpoints;
  colors?: SystemColor;
  zIndex?: SystemZIndexScale;
  spacing?: SystemSpacing;
  border?: SystemBorder;
  boxShadow?: { [variant: string]: string };
}

/** SystemTokens is System, under the name DesignSystem's constructor expects. */
export type SystemTokens = System;
