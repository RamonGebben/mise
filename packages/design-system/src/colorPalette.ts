// Palette keys, part of the published contract. system.ts keys
// SystemColorPalette by these.

export type BaseColor =
  | 'error'
  | 'formBackground'
  | 'background'
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'quaternary';

// `emphasis` is the stronger shade of a color (hover, pressed, borders). It's
// named for its role rather than a direction: in a dark palette it's usually
// lighter than `base`, not darker.
export type BaseColorVariant = 'base' | 'text' | 'emphasis';
