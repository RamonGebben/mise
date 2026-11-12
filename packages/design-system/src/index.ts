export { default } from './DesignSystem.js';
export type { DesignSystemOptions } from './DesignSystem.js';

export {
  auditTokens,
  contrastRatio,
  MIN_TEXT_CONTRAST,
  MIN_UI_CONTRAST,
} from './audit.js';
export type { AuditFinding, AuditRule } from './audit.js';

export type {
  System,
  SystemTokens,
  SystemType,
  RootFontSize,
  SystemBreakpoints,
  SystemColorPaletteColor,
  SystemColorPalette,
  SystemModeTokens,
  SystemModes,
  SystemZIndexScale,
  SystemBorder,
} from './system.js';

export type {
  SystemBreakpoint,
  SystemBreakpointMap,
  SystemFontSize,
  SystemSpacing,
  SystemFontFamily,
  SystemFontWeight,
  SystemLineHeight,
  SystemZIndex,
  SystemBoxShadow,
  SystemGradient,
  SystemBorderRadius,
  SystemBorderWidth,
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
