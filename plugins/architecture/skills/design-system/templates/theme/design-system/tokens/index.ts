// Derived key-union types for DesignSystem's typed accessor methods.
// Placeholder members - replace with your real design tokens; keep these
// in sync with the matching value maps in theme/index.ts.

export type SystemBreakpoint = 'mobile' | 'tablet' | 'tabletLandscape' | 'desktop';

export type SystemBreakpointMap = Record<SystemBreakpoint, string>;

export type SystemSize = 'xxs' | 'xs' | 's' | 'base' | 'm' | 'l' | 'xl';

export type SystemFontWeight = 'regular' | 'medium' | 'semibold' | 'bold';

export type SystemLineHeight = 'tight' | 'base' | 'loose';

// Note: this is a *different* type from the `SystemZIndexScale` interface
// in theme/index.ts (that one is the `{ [name: string]: number }` map;
// this is the union of its keys). Same root name in the pasted source -
// kept distinct names here on purpose to avoid the collision.
export type SystemZIndex = 'base' | 'dropdown' | 'sticky' | 'modal' | 'toast';

export type SystemBoxShadow = 'base' | 'card' | 'modal';

export type SystemGradient = 'menu' | 'hero';
