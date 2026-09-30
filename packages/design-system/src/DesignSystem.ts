import { generateMedia, MediaGenerator } from 'styled-media-query';
import {
  SystemBreakpoint,
  SystemFontWeight,
  SystemLineHeight,
  SystemSize,
  SystemZIndex,
  SystemBreakpointMap,
  SystemBoxShadow,
  type SystemGradient,
} from './tokens.js';
import { BaseColor, BaseColorVariant } from './colorPalette.js';
import type { SystemTokens } from './system.js';
import { path } from 'ramda';
import type { ColorString } from './types.js';

/**
 * Whether there's a viewport to measure. False wherever there's no DOM -
 * server rendering, workers, plain Node - so breakpoint-aware accessors can
 * fall back instead of throwing.
 */
const canMatchMedia = (): boolean =>
  typeof window !== 'undefined' && typeof window.matchMedia === 'function';

export type DesignSystemOptions = {
  /**
   * Which breakpoint to resolve to when there's no viewport to measure
   * (e.g. during SSR). Mobile-first apps usually want `'smallest'`.
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
   * get a font-size value from the design system object
   */
  public fontSize(size: SystemSize): string {
    const currentBp = this.getCurrentBreakpoint();
    const parsedValue = parseFloat(`${this.ds.type.sizes[currentBp][size]}`);

    return this.pxToRem(parsedValue);
  }

  /**
   * fs()
   * get a font-size value from the design system object
   * @see fontSize()
   */
  public fs(size: SystemSize): string {
    return this.fontSize(size);
  }

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
   * get a spacing value from the design system object
   */
  public spacing(val: SystemSize): string {
    const currentBp = this.getCurrentBreakpoint();
    const parsedValue = parseFloat(`${this.ds.spacing.scale[currentBp][val]}`);

    return this.pxToRem(parsedValue);
  }

  /**
   * space()
   * get a spacing value from the design system object
   * @see spacing()
   */
  public space(val: SystemSize): string {
    return this.spacing(val);
  }

  /**
   * spacingBetween()
   *
   * get the absolute spacing between two SystemSizes
   */
  public spacingBetween(a: SystemSize, b: SystemSize): string {
    const currentBp = this.getCurrentBreakpoint();

    const aValue = parseFloat(`${this.ds.spacing.scale[currentBp][a]}`);
    const bValue = parseFloat(`${this.ds.spacing.scale[currentBp][b]}`);

    return this.pxToRem(Math.abs(aValue - bValue));
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
   * get a color from your color palette
   */
  public color(
    hue: BaseColor,
    variant: BaseColorVariant = 'base',
  ): ColorString {
    return this.ds.colors.colorPalette[hue][variant];
  }

  /**
   * gradient()
   * get a gradient from your gradient palette
   */
  public gradient(variant: SystemGradient = 'menu'): string {
    return this.ds.colors.gradient[variant];
  }

  /**
   * boxShadow()
   * get a box-shadow from your box-shadow palette
   */
  public boxShadow(variant: SystemBoxShadow = 'base'): string {
    return this.ds.boxShadow[variant];
  }

  /**
   * bp()
   * get a breakpoint value from the design system object
   */
  public bp(breakpoint: SystemBreakpoint): string {
    return this.ds.breakpoints[breakpoint];
  }

  /**
   * z()
   * get a z-index value from the design system object
   */
  public z(z: SystemZIndex): number {
    return this.ds.zIndex[z];
  }

  /**
   * getCurrentBreakpoint()
   * returns the closest matching breakpoint based on viewport size, or the
   * `ssrBreakpoint` option when there is no viewport to measure (e.g. during SSR)
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

  public get(pathToProperty: string): unknown {
    return path(pathToProperty.split('.'), this.ds);
  }
}
