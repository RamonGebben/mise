// Key-union types for DesignSystem's typed accessor methods. These are part
// of the published contract - a project can't invent new members without a
// new version of this package (that's the point: consistent tokens across
// every project that depends on it).

export type SystemBreakpoint =
  'mobile' | 'tablet' | 'tabletLandscape' | 'desktop';

export type SystemBreakpointMap = Record<SystemBreakpoint, string>;

export type SystemSize = 'xxs' | 'xs' | 's' | 'base' | 'm' | 'l' | 'xl';

export type SystemFontWeight = 'regular' | 'medium' | 'semibold' | 'bold';

export type SystemLineHeight = 'tight' | 'base' | 'loose';

// Distinct from the `SystemZIndexScale` interface in system.ts (that one is
// the `{ [name: string]: number }` map; this is the union of its keys).
export type SystemZIndex = 'base' | 'dropdown' | 'sticky' | 'modal' | 'toast';

export type SystemBoxShadow = 'base' | 'card' | 'modal';

export type SystemGradient = 'menu' | 'hero';
