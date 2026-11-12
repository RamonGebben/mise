import {
  SystemBorderRadius,
  SystemBorderWidth,
  SystemBreakpoint,
  SystemFontFamily,
  SystemFontWeight,
  SystemFontSize,
  SystemLineHeight,
  SystemSpacing,
  SystemZIndex,
  SystemBoxShadow,
  type SystemGradient,
} from './tokens.js';
import { BaseColor, BaseColorVariant } from './colorPalette.js';
import type { SystemModeTokens, SystemTokens } from './system.js';
import { path } from 'ramda';
import type { ColorString, CssVar } from './types.js';
import { COLOR_MODE_META, type ColorMode } from './colorMode.js';
import { generateMedia, type MediaGenerator } from './media.js';
import {
  FONT_SIZE_STEPS,
  fontSizeRem,
  rootFontSizePx,
  sortedBreakpoints,
  SPACING_STEPS,
  spacingRem,
} from './scale.js';

/**
 * The minimum interactive target size: WCAG 2.5.8 (AA) for fine pointers, and
 * 2.5.5 (AAA) wherever a touch input is present. In px, never rem - a finger
 * doesn't get smaller with the type.
 */
const MIN_TARGET_FINE = '24px';
const MIN_TARGET_COARSE = '44px';

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

const fontSizeVarName = (size: SystemFontSize): CssVarName =>
  `--ds-font-size-${size}`;

const spacingVarName = (size: SystemSpacing): CssVarName =>
  `--ds-spacing-${size}`;

const MIN_TARGET_VAR: CssVarName = '--ds-target-min';

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
   * `'smallest'`. Doesn't affect `fontSize()` or `spacing()` - those scale
   * in CSS with the root font size (see `rootCss()`), not from this guess,
   * so they can't disagree with the browser's real viewport and never cause
   * a hydration mismatch.
   */
  ssrBreakpoint?: 'smallest' | 'largest';
};

export default class DesignSystem {
  private ds: SystemTokens;
  private ssrBreakpoint: NonNullable<DesignSystemOptions['ssrBreakpoint']>;
  /** The breakpoints narrowest first, sorted once rather than per call. */
  private breakpoints: Array<SystemBreakpoint>;

  /**
   * mq()
   * get media query breakpoint name
   */
  public mq: MediaGenerator;

  constructor(tokens: SystemTokens, options: DesignSystemOptions = {}) {
    this.ds = tokens;
    this.ssrBreakpoint = options.ssrBreakpoint ?? 'largest';
    this.mq = generateMedia(this.ds.breakpoints);
    this.breakpoints = sortedBreakpoints(this.ds);
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
   * get a step of the type scale, as a CSS variable in rem - so it follows
   * the root font size `rootCss()` sets per breakpoint
   */
  public fontSize(size: SystemFontSize): CssVar {
    return cssVar(fontSizeVarName(size));
  }

  /**
   * fs()
   * get a font-size value from the design system object
   * @see fontSize()
   */
  public fs(size: SystemFontSize): CssVar {
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
   * get a step of the spacing scale - the same ratio as type, so whitespace
   * keeps its relation to the text - as a CSS variable in rem
   */
  public spacing(val: SystemSpacing): CssVar {
    return cssVar(spacingVarName(val));
  }

  /**
   * space()
   * get a spacing value from the design system object
   * @see spacing()
   */
  public space(val: SystemSpacing): CssVar {
    return this.spacing(val);
  }

  /**
   * spacingBetween()
   *
   * get the absolute difference between two spacing steps, as a CSS `calc()`
   * expression over the same variables `spacing()` returns - the larger step
   * first, so it's never negative
   */
  public spacingBetween(a: SystemSpacing, b: SystemSpacing): string {
    const [larger, smaller] =
      SPACING_STEPS[a] >= SPACING_STEPS[b] ? [a, b] : [b, a];

    return `calc(${this.spacing(larger)} - ${this.spacing(smaller)})`;
  }

  /**
   * spaceBetween()
   *
   * get the absolute difference between two spacing steps
   * @see spacingBetween()
   */
  public spaceBetween(a: SystemSpacing, b: SystemSpacing): string {
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
   * minTarget()
   * the minimum size of an interactive target, as a CSS variable: 24px
   * (WCAG 2.5.8, AA) for a mouse or trackpad, 44px (2.5.5, AAA) wherever a
   * touch input is present. Use it as a floor, never a fixed size:
   * `min-block-size: max(${minTarget()}, …)`
   */
  public minTarget(): CssVar {
    return cssVar(MIN_TARGET_VAR);
  }

  /**
   * rootCss()
   * the global CSS behind `fontSize()`, `spacing()`, `spacingBetween()` and
   * `minTarget()`. The root font size is set per breakpoint, as a percentage
   * of the user's own setting; every font-size and spacing variable is a
   * constant rem value that scales with it. The browser resolves the current
   * breakpoint itself, structurally the same on the server and the client's
   * first render - so there's nothing for a guess to disagree with, and no
   * hydration mismatch.
   */
  public rootCss(): string {
    const [smallest, ...rest] = this.breakpoints;
    const rootSize = (breakpoint: SystemBreakpoint) =>
      block(':root', [`font-size: ${this.ds.type.base[breakpoint]};`]);

    const variables = block(':root', [
      ...this.scaleDeclarations(),
      `${MIN_TARGET_VAR}: ${MIN_TARGET_FINE};`,
    ]);

    return [
      rootSize(smallest),
      ...rest.map(breakpoint =>
        mediaBlock(
          `(min-width: ${this.ds.breakpoints[breakpoint]})`,
          rootSize(breakpoint),
        ),
      ),
      variables,
      mediaBlock(
        '(any-pointer: coarse)',
        block(':root', [`${MIN_TARGET_VAR}: ${MIN_TARGET_COARSE};`]),
      ),
    ].join('\n');
  }

  /** One `name: value;` declaration per font-size and spacing step. */
  private scaleDeclarations(): Array<string> {
    return [
      ...(Object.keys(FONT_SIZE_STEPS) as Array<SystemFontSize>).map(
        size => `${fontSizeVarName(size)}: ${fontSizeRem(this.ds, size)}rem;`,
      ),
      ...(Object.keys(SPACING_STEPS) as Array<SystemSpacing>).map(
        size => `${spacingVarName(size)}: ${spacingRem(this.ds, size)}rem;`,
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
   * returns the widest breakpoint whose start width the viewport has
   * reached, or the `ssrBreakpoint` option when there is no viewport to
   * measure (e.g. during SSR). A one-off synchronous read, not reactive: it
   * doesn't update on resize, and calling it during render produces a
   * different result on the server than on the client's first render
   * whenever the real viewport doesn't match `ssrBreakpoint` - rendering DOM
   * from it (as opposed to CSS) can cause a hydration mismatch.
   */
  public getCurrentBreakpoint(): SystemBreakpoint {
    const sorted = this.breakpoints;
    const [smallest] = sorted;
    const largest = sorted[sorted.length - 1];

    if (!canMatchMedia()) {
      return this.ssrBreakpoint === 'smallest' ? smallest : largest;
    }

    const reached = sorted.filter(
      key =>
        window.matchMedia(`(min-width: ${this.ds.breakpoints[key]})`).matches,
    );

    return reached[reached.length - 1] ?? smallest;
  }

  /**
   * Convert rem to px, including the unit `px`, at a breakpoint's root font
   * size (the smallest breakpoint by default). Assumes the browser's default
   * 16px - the user's own setting can't be known ahead of time.
   */
  public remToPx(
    value: number | string,
    breakpoint?: SystemBreakpoint,
  ): string {
    const rootPx = rootFontSizePx(this.ds, breakpoint ?? this.breakpoints[0]);

    return `${parseFloat(`${value}`) * rootPx}px`;
  }

  /**
   * Convert rem to px, returning only the number part
   * @see remToPx()
   */
  public remToPxRaw(
    value: number | string,
    breakpoint?: SystemBreakpoint,
  ): number {
    return parseFloat(this.remToPx(value, breakpoint));
  }

  private modeTokens(mode: ColorMode): SystemModeTokens {
    return (mode === 'dark' && this.ds.modes.dark) || this.ds.modes.light;
  }

  public get(pathToProperty: string): unknown {
    return path(pathToProperty.split('.'), this.ds);
  }
}
