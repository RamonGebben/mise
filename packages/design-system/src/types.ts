type HexColor = `#${string}`;
type RgbColor = `rgb(${number},${number},${number})`;
type RgbaColor = `rgba(${number},${number},${number},${number | `${number}%`})`;
type CmykColor = `cmyk(${number}%,${number}%,${number}%,${number}%)`;

export type ColorString = HexColor | RgbColor | RgbaColor | CmykColor;

/** A reference to a CSS custom property, e.g. `var(--ds-color-primary-base)`. */
export type CssVar = `var(--${string})`;
