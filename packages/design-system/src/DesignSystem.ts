import { generateMedia, MediaGenerator } from 'styled-media-query';
import {
  SystemBorderRadius,
  SystemBorderWidth,
  SystemBreakpoint,
  SystemFontFamily,
  SystemFontWeight,
  SystemLineHeight,
  SystemSize,
  SystemZIndex,
  SystemBreakpointMap,
  SystemBoxShadow,
  type SystemGradient,
} from './tokens.js';
import { BaseColor, BaseColorVariant } from './colorPalette.js';
import type { SystemModeTokens, SystemTokens } from './system.js';
import { path } from 'ramda';
import type { ColorString, CssVar } from './types.js';
import { COLOR_MODE_META, type ColorMode } from './colorMode.js';

/**
 * Whether there's a viewport to measure. False wherever there's no DOM -
 * server rendering, workers, plain Node - so breakpoint-aware accessors can
 * fall back instead of throwing.
 */
const canMatchMedia = (): boolean =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function';

type CssVarName = `--${string}`;

const kebab = (key: string): string =>
  key.replace(/[A-Z]/g, char => `-${char.toLowerCase()}`);

const colorVarName = (hue: BaseColor, variant: BaseColorVariant): CssVarName =>
  `--ds-color-${kebab(hue)}-${kebab(variant)}`;

const gradientVarName = (variant: SystemGradient): CssVarName =>
  `--ds-gradient-${kebab(variant)}`;

const boxShadowVarName = (variant: SystemBoxShadow): CssVarName =>
  `--ds-shadow-${kebab(variant)}`;

const fontSizeVarName = (size: SystemSize): CssVarName =>
  `--ds-font-size-${size}`;

const spacingVarName = (size: SystemSize): CssVarName => `--ds-spacing-${size}`;

const cssVar = (name: CssVarName): CssVar => `var(${name})`;

/** `${selector} { ...declarations }`, one declaration per line. */
const block = (selector: string, declarations: Array<string>): string =>
  [`${selector} {`, ...declarations.map(d => `  ${d}`), '}'].join('\n');

/** `@media ${condition} { ...inner, indented }` */
const mediaBlock = (condition: string, inner: string): string =>
  `@media ${condition} {\n${inner
    .split('\n')
    .map(line => `  ${line}`)
    .join('\n')}\n}`;

/** The smallest value past a CSS length, in its own unit (`'375px'` -> `'376px'`, `'48em'` -> `'48.01em'`). */
const onePast = (length: string): string => {
  const [, number, unit] = /^(-?[\d.]+)([a-z%]*)$/i.exec(length) ?? [];
  const step = unit === 'px' || unit === '' ? 1 : 0.01;

  return `${parseFloat(number) + step}${unit}`;
};

/** One `name: value;` declaration per color-bearing token of a mode. */
const modeDeclarations = (mode: SystemModeTokens): Array<string> => [
  ...Object.entries(mode.colorPalette).flatMap(([hue, variants]) =>
    Object.entries(variants).map(
      ([variant, value]) =>
        `${colorVarName(hue as BaseColor, variant as BaseColorVariant)}: ${value};`,
    ),
  ),
  ...Object.entries(mode.gradient).map(
    ([variant, value]) =>
      `${gradientVarName(variant as SystemGradient)}: ${value};`,
  ),
  ...Object.entries(mode.boxShadow).map(
    ([variant, value]) =>
      `${boxShadowVarName(variant as SystemBoxShadow)}: ${value};`,
  ),
];

const ruleset = (
  selector: string,
  colorScheme: ColorMode,
  mode: SystemModeTokens,
): string =>
  block(selector, [`color-scheme: ${colorScheme};`, ...modeDeclarations(mode)]);

export type DesignSystemOptions = {
  /**
   * Which breakpoint `getCurrentBreakpoint()` resolves to when there's no
   * viewport to measure (e.g. during SSR). Mobile-first apps usually want
   * `'smallest'`. Doesn't affect `fontSize()`, `spacing()` or
   * `spacingBetween()` - those resolve in CSS (see `breakpointCss()`), not
   * from this guess, so they can't disagree with the browser's real
   * viewport and never cause a hydration mismatch.
   */
  ssrBreakpoint?: 'smallest' | 'largest';
};

export default class DesignSystem {
  private ds: SystemTokens;
  private ssrBreakpoint: NonNullable<DesignSystemOptions['ssrBreakpoint']>;

  /**
   * mq()
   * get media query breakpoint name
   */
  public mq: MediaGenerator<SystemBreakpointMap, DesignSystem>;

  constructor(tokens: SystemTokens, options: DesignSystemOptions = {}) {
    this.ds = tokens;
    this.ssrBreakpoint = options.ssrBreakpoint ?? 'largest';
    this.mq = generateMedia(this.ds.breakpoints);
  }

  /**
   * getTokens()
   * get all tokens
   */
  public getTokens(): SystemTokens {
    return this.ds;
  }

  /**
   * fontSize()
   * get a font-size value from the design system object, as a CSS variable
   * that follows the current breakpoint - see `breakpointCss()`
   */
  public fontSize(size: SystemSize): CssVar {
    return cssVar(fontSizeVarName(size));
  }

  /**
   * fs()
   * get a font-size value from the design system object
   * @see fontSize()
   */
  public fs(size: SystemSize): CssVar {
    return this.fontSize(size);
  }

  /**
   * fontFamily()
   * get a font-family value from the design system object
   */
  public fontFamily(family: SystemFontFamily): string {
    return this.ds.type.fontFamily[family];
  }

  /**
   * ff()
   * get a font-family value from the design system object
   * @see fontFamily()
   */
  public ff = this.fontFamily;

  /**
   * fontWeight()
   * get a font-weight value from the design system object
   */
  public fontWeight(weight: SystemFontWeight): number {
    return this.ds.type.fontWeight[weight];
  }

  /**
   * fw()
   * get a font-weight value from the design system object
   * @see fontWeight()
   */
  public fw = this.fontWeight;

  /**
   * lineHeight()
   * get a line-height value from the design system object
   */
  public lineHeight(selector: SystemLineHeight): number {
    return this.ds.type.lineHeight[selector];
  }

  /**
   * lh()
   * get a line-height value from the design system object
   * @see lineHeight()
   */
  public lh = this.lineHeight;

  /**
   * spacing()
   * get a spacing value from the design system object, as a CSS variable
   * that follows the current breakpoint - see `breakpointCss()`
   */
  public spacing(val: SystemSize): CssVar {
    return cssVar(spacingVarName(val));
  }

  /**
   * space()
   * get a spacing value from the design system object
   * @see spacing()
   */
  public space(val: SystemSize): CssVar {
    return this.spacing(val);
  }

  /**
   * spacingBetween()
   *
   * get the absolute spacing between two SystemSizes, as a CSS `calc()`
   * expression over the same variables `spacing()` returns - so it follows
   * the current breakpoint the same way. Requires the CSS `abs()` math
   * function - supported in all major browsers, but only since Safari 18.2
   * (Dec 2024), so this breaks visually (not a hard error) on older Safari.
   */
  public spacingBetween(a: SystemSize, b: SystemSize): string {
    return `calc(abs(${this.spacing(a)} - ${this.spacing(b)}))`;
  }

  /**
   * spaceBetween()
   *
   * get the absolute spacing between two SystemFontSizes
   * @see spacingBetween()
   */
  public spaceBetween(a: SystemSize, b: SystemSize): string {
    return this.spacingBetween(a, b);
  }

  /**
   * color()
   * get a color from your color palette, as a CSS variable that follows the
   * current color mode
   */
  public color(hue: BaseColor, variant: BaseColorVariant = 'base'): CssVar {
    return cssVar(colorVarName(hue, variant));
  }

  /**
   * rawColor()
   * get the literal value of a color in one mode - for JS color math, where
   * a CSS variable can't be used. Falls back to light without dark tokens.
   */
  public rawColor(
    hue: BaseColor,
    variant: BaseColorVariant = 'base',
    mode: ColorMode = 'light',
  ): ColorString {
    return this.modeTokens(mode).colorPalette[hue][variant];
  }

  /**
   * gradient()
   * get a gradient from your gradient palette, as a CSS variable that
   * follows the current color mode
   */
  public gradient(variant: SystemGradient = 'menu'): CssVar {
    return cssVar(gradientVarName(variant));
  }

  /**
   * boxShadow()
   * get a box-shadow from your box-shadow palette, as a CSS variable that
   * follows the current color mode
   */
  public boxShadow(variant: SystemBoxShadow = 'base'): CssVar {
    return cssVar(boxShadowVarName(variant));
  }

  /**
   * hasDarkMode()
   * whether the tokens define a dark mode
   */
  public hasDarkMode(): boolean {
    return this.ds.modes.dark !== undefined;
  }

  /**
   * colorModeCss()
   * the global CSS defining every color variable the accessors return: light
   * on :root, dark when the OS prefers it, and either one forced by
   * the color-mode meta tag (see setColorMode()). Light-only without dark
   * tokens.
   */
  public colorModeCss(): string {
    const { light, dark } = this.ds.modes;
    const lightRules = ruleset(':root', 'light', light);

    if (dark === undefined) return lightRules;

    const forced = (mode: ColorMode) =>
      `:has(meta[name='${COLOR_MODE_META}'][content='${mode}'])`;
    const systemDark = ruleset(`:root:not(${forced('light')})`, 'dark', dark);

    return [
      lightRules,
      mediaBlock('(prefers-color-scheme: dark)', systemDark),
      ruleset(`:root${forced('dark')}`, 'dark', dark),
    ].join('\n');
  }

  /**
   * breakpointCss()
   * the global CSS defining every variable `fontSize()`/`spacing()`/
   * `spacingBetween()` return: the smallest breakpoint's values on `:root`,
   * overridden by each wider breakpoint's own `@media (min-width: …)` rule.
   * The browser resolves the current value directly, structurally the same
   * on the server and the client's first render (both just reference the
   * variable) - so there's nothing for a breakpoint guess to disagree with,
   * and no hydration mismatch.
   */
  public breakpointCss(): string {
    const { breakpoints } = this.ds;
    const sorted = (Object.keys(breakpoints) as Array<SystemBreakpoint>).sort(
      (a, b) => parseFloat(breakpoints[a]) - parseFloat(breakpoints[b]),
    );
    const [smallest, ...rest] = sorted;

    const base = block(':root', this.sizeDeclarations(smallest));

    const overrides = rest.map((breakpoint, index) => {
      const minWidth = onePast(breakpoints[sorted[index]]);
      const nested = block(':root', this.sizeDeclarations(breakpoint));

      return mediaBlock(`(min-width: ${minWidth})`, nested);
    });

    return [base, ...overrides].join('\n');
  }

  /** One `name: value;` declaration per font-size and spacing token of a breakpoint. */
  private sizeDeclarations(breakpoint: SystemBreakpoint): Array<string> {
    return [
      ...Object.entries(this.ds.type.sizes[breakpoint]).map(
        ([size, value]) =>
          `${fontSizeVarName(size as SystemSize)}: ${this.pxToRem(parseFloat(`${value}`))};`,
      ),
      ...Object.entries(this.ds.spacing.scale[breakpoint]).map(
        ([size, value]) =>
          `${spacingVarName(size as SystemSize)}: ${this.pxToRem(parseFloat(`${value}`))};`,
      ),
    ];
  }

  /**
   * bp()
   * get a breakpoint value from the design system object
   */
  public bp(breakpoint: SystemBreakpoint): string {
    return this.ds.breakpoints[breakpoint];
  }

  /**
   * zIndex()
   * get a z-index value from the design system object
   */
  public zIndex(z: SystemZIndex): number {
    return this.ds.zIndex[z];
  }

  /**
   * z()
   * get a z-index value from the design system object
   * @see zIndex()
   */
  public z = this.zIndex;

  /**
   * borderRadius()
   * get a border-radius value from the design system object
   */
  public borderRadius(size: SystemBorderRadius): string {
    return this.ds.border.radius[size];
  }

  /**
   * borderWidth()
   * get a border-width value from the design system object
   */
  public borderWidth(size: SystemBorderWidth): string {
    return this.ds.border.width[size];
  }

  /**
   * getCurrentBreakpoint()
   * returns the closest matching breakpoint based on viewport size, or the
   * `ssrBreakpoint` option when there is no viewport to measure (e.g. during
   * SSR). A one-off synchronous read, not reactive: it doesn't update on
   * resize, and calling it during render produces a different result on the
   * server than on the client's first render whenever the real viewport
   * doesn't match `ssrBreakpoint` - rendering DOM from it (as opposed to
   * CSS) can cause a hydration mismatch. `fontSize()`, `spacing()` and
   * `spacingBetween()` no longer use it for exactly that reason - they
   * resolve in CSS instead, via `breakpointCss()`.
   */
  public getCurrentBreakpoint(): SystemBreakpoint {
    const breakpoints = this.ds.breakpoints;
    const keys = Object.keys(breakpoints) as Array<SystemBreakpoint>;
    const largest = keys[keys.length - 1];

    if (!canMatchMedia()) {
      return this.ssrBreakpoint === 'smallest' ? keys[0] : largest;
    }

    const currentBp = keys.filter(
      key => window.matchMedia(`(max-width: ${breakpoints[key]})`).matches,
    );

    return currentBp[0] || largest;
  }

  /**
   * By default we assume all values to come in pixels
   *
   * @param value
   */
  private pxToRem(value: number) {
    const baseFontSize = parseFloat(`${this.ds.type.baseFontSize}`);
    return `${parseFloat(`${value}`) / baseFontSize}rem`;
  }

  /**
   * Convert rem to px, including the unit `px`
   */
  public remToPx(value: number | string): string {
    const baseFontSize = parseFloat(`${this.ds.type.baseFontSize}`);
    return `${parseFloat(`${value}`) * baseFontSize}px`;
  }

  /**
   * Convert rem to px, returning only the number part
   */
  public remToPxRaw(value: number | string): number {
    return parseFloat(this.remToPx(value));
  }

  private modeTokens(mode: ColorMode): SystemModeTokens {
    return (mode === 'dark' && this.ds.modes.dark) || this.ds.modes.light;
  }

  public get(pathToProperty: string): unknown {
    return path(pathToProperty.split('.'), this.ds);
  }
}
