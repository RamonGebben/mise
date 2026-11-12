// Key-union types for DesignSystem's typed accessor methods. These are part
// of the published contract - a project can't invent new members without a
// new version of this package (that's the point: consistent tokens across
// every project that depends on it).

export type SystemBreakpoint =
  'mobile' | 'tablet' | 'tabletLandscape' | 'desktop';

export type SystemBreakpointMap = Record<SystemBreakpoint, string>;

// Steps of the one modular scale both font sizes and spacing follow - `base`
// is step 0, each step up or down multiplies or divides by `type.ratio`.
// Spacing reaches further down than type: the legibility floor that would
// merge type's smaller steps doesn't apply to whitespace.
export type SystemFontSize = 's' | 'base' | 'm' | 'l' | 'xl';

export type SystemSpacing = 'xxs' | 'xs' | 's' | 'base' | 'm' | 'l' | 'xl';

export type SystemFontWeight = 'regular' | 'medium' | 'semibold' | 'bold';

export type SystemLineHeight = 'tight' | 'base' | 'loose';

// Distinct from the `SystemZIndexScale` interface in system.ts (that one is
// the `{ [name: string]: number }` map; this is the union of its keys).
export type SystemZIndex = 'base' | 'dropdown' | 'sticky' | 'modal' | 'toast';

export type SystemBoxShadow = 'base' | 'card' | 'modal';

export type SystemGradient = 'menu' | 'hero';

export type SystemFontFamily = 'base' | 'heading' | 'mono';

export type SystemBorderRadius = 's' | 'base' | 'full';

export type SystemBorderWidth = 's' | 'base';
