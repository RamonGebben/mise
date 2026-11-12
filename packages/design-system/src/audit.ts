// Checks a tokens object against the WCAG AA rules tokens alone can decide,
// plus the scale's own rules. Meant to run as a test in each project's CI
// (`expect(auditTokens(tokens)).toEqual([])`) rather than at runtime: a
// failing token should block a merge, not crash a page.

import type { BaseColor, BaseColorVariant } from './colorPalette.js';
import type { ColorMode } from './colorMode.js';
import type { SystemModeTokens, SystemTokens } from './system.js';
import {
  BROWSER_DEFAULT_FONT_SIZE,
  rootFontSizePx,
  sortedBreakpoints,
  unflooredFontSizeRem,
} from './scale.js';

/** WCAG 1.4.3: normal-size text against its background. */
export const MIN_TEXT_CONTRAST = 4.5;

/** WCAG 1.4.11: a UI element (button fill, focus ring) against the page. */
export const MIN_UI_CONTRAST = 3;

export type AuditRule =
  | 'text-contrast'
  | 'ui-contrast'
  | 'unparseable-color'
  | 'ratio-not-ascending'
  | 'floor-raises-step'
  | 'input-zoom'
  | 'breakpoint-origin';

export interface AuditFinding {
  rule: AuditRule;
  message: string;
}

type Rgba = [number, number, number, number];

const parseHex = (hex: string): Rgba | undefined => {
  const digits = hex.slice(1);
  const full =
    digits.length <= 4
      ? digits
          .split('')
          .map(d => d + d)
          .join('')
      : digits;

  if (!/^[\da-f]{6}([\da-f]{2})?$/i.test(full)) return undefined;

  const [r, g, b, a = 255] = (full.match(/../g) ?? []).map(pair =>
    parseInt(pair, 16),
  );

  return [r, g, b, a / 255];
};

const parseFunction = (color: string): Rgba | undefined => {
  const match = /^(rgba?|cmyk)\(([^)]*)\)$/i.exec(color.trim());
  if (!match) return undefined;

  const [, rawName, args] = match;
  const name = rawName.toLowerCase();
  const parts = args.split(',').map(arg => arg.trim());
  const arity = name === 'rgb' ? [3] : name === 'rgba' ? [3, 4] : [4];

  if (!arity.includes(parts.length)) return undefined;

  // A percentage is a fraction of the channel's range: 0-255 for an rgb
  // channel, 0-1 for alpha and every cmyk component.
  const values = parts.map((part, index) => {
    const number = Number(part.endsWith('%') ? part.slice(0, -1) : part);
    if (!part.endsWith('%')) return number;
    return name !== 'cmyk' && index < 3 ? (number / 100) * 255 : number / 100;
  });

  if (values.some(value => !Number.isFinite(value))) return undefined;

  if (name === 'cmyk') {
    const [c, m, y, k] = values;
    return [
      255 * (1 - c) * (1 - k),
      255 * (1 - m) * (1 - k),
      255 * (1 - y) * (1 - k),
      1,
    ];
  }

  const [r, g, b, a = 1] = values;
  return [r, g, b, a];
};

export const parseColor = (color: string): Rgba | undefined =>
  color.startsWith('#') ? parseHex(color) : parseFunction(color);

/** A translucent color as it renders on top of an opaque backdrop. */
const composite = ([r, g, b, a]: Rgba, [br, bg, bb]: Rgba): Rgba => [
  r * a + br * (1 - a),
  g * a + bg * (1 - a),
  b * a + bb * (1 - a),
  1,
];

/** A translucent background as it renders on top of an opaque backdrop. */
const opaque = (color: Rgba, backdrop: Rgba | undefined): Rgba | undefined =>
  color[3] >= 1 ? color : backdrop && composite(color, backdrop);

const luminance = ([r, g, b]: Rgba): number => {
  const linear = (channel: number) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
};

/**
 * The WCAG contrast ratio of a foreground on a background, from 1 to 21. A
 * translucent foreground is composited over the background first, and a
 * translucent background over `backdrop` (what shows through it). Undefined
 * when a color can't be parsed, or the background is translucent without a
 * backdrop to composite it over.
 */
export const contrastRatio = (
  foreground: string,
  background: string,
  backdrop?: string,
): number | undefined => {
  const fg = parseColor(foreground);
  const backdropColor =
    backdrop === undefined ? undefined : parseColor(backdrop);
  const parsedBg = parseColor(background);
  const bg = parsedBg && opaque(parsedBg, backdropColor);
  if (!fg || !bg) return undefined;

  const [lighter, darker] = [luminance(composite(fg, bg)), luminance(bg)].sort(
    (a, b) => b - a,
  );

  return (lighter + 0.05) / (darker + 0.05);
};

const colorName = (hue: BaseColor, variant: BaseColorVariant) =>
  `${hue}.${variant}`;

/** Hues that fill a surface the page sits on, rather than an element on it. */
const SURFACES: Array<BaseColor> = ['background', 'formBackground'];

const modeFindings = (
  mode: ColorMode,
  tokens: SystemModeTokens,
): Array<AuditFinding> => {
  const palette = tokens.colorPalette;

  const check = (
    rule: 'text-contrast' | 'ui-contrast',
    minimum: number,
    [fgHue, fgVariant]: [BaseColor, BaseColorVariant],
    [bgHue, bgVariant]: [BaseColor, BaseColorVariant],
  ): Array<AuditFinding> => {
    const fg = palette[fgHue][fgVariant];
    const bg = palette[bgHue][bgVariant];
    // A translucent color sits on the page, so the page shows through it.
    const ratio = contrastRatio(fg, bg, palette.background.base);
    const pair = `${colorName(fgHue, fgVariant)} on ${colorName(bgHue, bgVariant)}`;

    if (ratio === undefined) {
      return [
        {
          rule: 'unparseable-color',
          message: `${mode}: can't check ${pair} - ${fg} or ${bg} isn't a color this audit can parse, or the page background is translucent`,
        },
      ];
    }

    return ratio < minimum
      ? [
          {
            rule,
            message: `${mode}: ${pair} is ${ratio.toFixed(2)}:1, needs ${minimum}:1`,
          },
        ]
      : [];
  };

  return (Object.keys(palette) as Array<BaseColor>).flatMap(hue => [
    ...check('text-contrast', MIN_TEXT_CONTRAST, [hue, 'text'], [hue, 'base']),
    ...check(
      'text-contrast',
      MIN_TEXT_CONTRAST,
      [hue, 'text'],
      [hue, 'emphasis'],
    ),
    ...(SURFACES.includes(hue)
      ? []
      : check(
          'ui-contrast',
          MIN_UI_CONTRAST,
          [hue, 'base'],
          ['background', 'base'],
        )),
  ]);
};

const scaleFindings = (tokens: SystemTokens): Array<AuditFinding> => {
  const breakpoints = sortedBreakpoints(tokens);
  const [smallest] = breakpoints;
  const unflooredS = unflooredFontSizeRem(tokens, 's');
  const belowDefault = breakpoints.filter(
    breakpoint =>
      rootFontSizePx(tokens, breakpoint) < BROWSER_DEFAULT_FONT_SIZE,
  );

  return [
    ...(tokens.type.ratio > 1
      ? []
      : [
          {
            rule: 'ratio-not-ascending' as const,
            message: `type.ratio is ${tokens.type.ratio}, so each step is no larger than the one below it - pick a ratio above 1`,
          },
        ]),
    ...(unflooredS < tokens.type.floor
      ? [
          {
            rule: 'floor-raises-step' as const,
            message: `fontSize('s') would be ${unflooredS}rem at ratio ${tokens.type.ratio}, so the ${tokens.type.floor}rem floor raises it - pick a ratio of at most ${(1 / tokens.type.floor).toFixed(3)} to keep the scale intact`,
          },
        ]
      : []),
    ...belowDefault.map(breakpoint => ({
      rule: 'input-zoom' as const,
      message: `type.base.${breakpoint} is ${tokens.type.base[breakpoint]}, so body text and inputs are under 16px there - iOS Safari zooms in on focusing such an input`,
    })),
    ...(parseFloat(tokens.breakpoints[smallest]) !== 0
      ? [
          {
            rule: 'breakpoint-origin' as const,
            message: `breakpoints.${smallest} is ${tokens.breakpoints[smallest]} - the smallest breakpoint applies from 0, so set it to '0px'`,
          },
        ]
      : []),
  ];
};

/**
 * Every way a tokens object breaks WCAG AA contrast (1.4.3 for each color's
 * `text` on its `base` and `emphasis`, 1.4.11 for each non-surface color's
 * `base` on the page `background`), or the scale's own rules. Empty when
 * the tokens comply.
 */
export const auditTokens = (tokens: SystemTokens): Array<AuditFinding> => [
  ...modeFindings('light', tokens.modes.light),
  ...(tokens.modes.dark ? modeFindings('dark', tokens.modes.dark) : []),
  ...scaleFindings(tokens),
];
