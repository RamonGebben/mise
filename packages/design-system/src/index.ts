export { default } from './DesignSystem.js';
export type { DesignSystemOptions } from './DesignSystem.js';

export type {
  System,
  SystemTokens,
  SystemFontSizes,
  SystemType,
  SystemBreakpoints,
  SystemColorPaletteColor,
  SystemColorPalette,
  SystemModeTokens,
  SystemModes,
  SystemZIndexScale,
  SystemScale,
  SystemSpacing,
  SystemBorder,
} from './system.js';

export type {
  SystemBreakpoint,
  SystemBreakpointMap,
  SystemSize,
  SystemFontWeight,
  SystemLineHeight,
  SystemZIndex,
  SystemBoxShadow,
  SystemGradient,
} from './tokens.js';

export type { BaseColor, BaseColorVariant } from './colorPalette.js';

export type { ColorString, CssVar } from './types.js';

export {
  COLOR_MODE_META,
  colorModeScript,
  getColorMode,
  setColorMode,
} from './colorMode.js';
export type {
  ColorMode,
  ColorModeOptions,
  ColorModePreference,
} from './colorMode.js';
