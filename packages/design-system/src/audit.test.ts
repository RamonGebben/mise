import { describe, expect, it } from 'vitest';
import { auditTokens, contrastRatio } from './audit.js';
import type { SystemColorPalette, SystemTokens } from './system.js';

const palette: SystemColorPalette = {
  error: { base: '#c62828', text: '#ffffff', emphasis: '#8e1b1b' },
  formBackground: { base: '#f5f5f5', text: '#1a1a1a', emphasis: '#e0e0e0' },
  background: { base: '#ffffff', text: '#1a1a1a', emphasis: '#f0f0f0' },
  primary: { base: '#2563eb', text: '#ffffff', emphasis: '#1d4ed8' },
  secondary: { base: '#6b7280', text: '#ffffff', emphasis: '#374151' },
  tertiary: { base: '#7c3aed', text: '#ffffff', emphasis: '#5b21b6' },
  quaternary: { base: '#b45309', text: '#ffffff', emphasis: '#92400e' },
  focus: { base: '#1d4ed8', text: '#ffffff', emphasis: '#1d4ed8' },
};

const mode = {
  colorPalette: palette,
  gradient: { menu: 'none', hero: 'none' },
  boxShadow: { base: 'none', card: 'none', modal: 'none' },
};

const tokens: SystemTokens = {
  breakpoints: {
    mobile: '0px',
    tablet: '768px',
    tabletLandscape: '1024px',
    desktop: '1440px',
  },
  type: {
    ratio: 1.333,
    floor: 0.75,
    base: {
      mobile: '100%',
      tablet: '100%',
      tabletLandscape: '106.25%',
      desktop: '112.5%',
    },
    fontFamily: { base: 'sans-serif', heading: 'serif', mono: 'monospace' },
    fontWeight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
    lineHeight: { tight: 1.2, base: 1.5, loose: 1.8 },
  },
  modes: { light: mode },
  zIndex: { base: 0, dropdown: 1, sticky: 2, modal: 3, toast: 4 },
  border: {
    radius: { s: '4px', base: '8px', full: '9999px' },
    width: { s: '1px', base: '2px' },
  },
};

const withColor = (
  hue: keyof SystemColorPalette,
  color: Partial<SystemColorPalette[keyof SystemColorPalette]>,
): SystemTokens => ({
  ...tokens,
  modes: {
    light: {
      ...mode,
      colorPalette: { ...palette, [hue]: { ...palette[hue], ...color } },
    },
  },
});

const rules = (input: SystemTokens) => auditTokens(input).map(f => f.rule);

describe('contrastRatio', () => {
  it('is 21 for black on white, either way round', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21);
    expect(contrastRatio('#ffffff', '#000000')).toBeCloseTo(21);
  });

  it('is 1 for a color on itself', () => {
    expect(contrastRatio('#3b82f6', '#3b82f6')).toBeCloseTo(1);
  });

  it('reads shorthand hex, rgb() and cmyk()', () => {
    expect(contrastRatio('#000', 'rgb(255,255,255)')).toBeCloseTo(21);
    expect(contrastRatio('cmyk(0%,0%,0%,100%)', '#fff')).toBeCloseTo(21);
  });

  it('composites a translucent foreground over the background', () => {
    expect(contrastRatio('rgba(0,0,0,0)', '#ffffff')).toBeCloseTo(1);
    expect(contrastRatio('#00000080', '#ffffff')).toBeLessThan(21);
  });

  it('is undefined for a color it cannot parse', () => {
    expect(contrastRatio('papayawhip', '#ffffff')).toBeUndefined();
  });

  it('is undefined for a function with a missing or unreadable channel', () => {
    expect(contrastRatio('rgb(255 255 255)', '#ffffff')).toBeUndefined();
    expect(contrastRatio('rgb(0,0)', '#ffffff')).toBeUndefined();
  });

  it('reads a percentage rgb channel as a fraction of 255', () => {
    expect(contrastRatio('rgb(100%,100%,100%)', '#000')).toBeCloseTo(21);
  });

  it('composites a translucent background over the backdrop', () => {
    expect(
      contrastRatio('#ffffff', 'rgba(0,0,0,0.05)', '#ffffff'),
    ).toBeLessThan(1.2);
    expect(contrastRatio('#ffffff', 'rgba(0,0,0,0.05)')).toBeUndefined();
  });
});

describe('auditTokens', () => {
  it('finds nothing in tokens that comply', () => {
    expect(auditTokens(tokens)).toEqual([]);
  });

  it('flags text below 4.5:1 on its own base', () => {
    const findings = auditTokens(withColor('primary', { base: '#3b82f6' }));

    expect(findings).toContainEqual({
      rule: 'text-contrast',
      message: 'light: primary.text on primary.base is 3.68:1, needs 4.5:1',
    });
  });

  it('flags text below 4.5:1 on its own emphasis', () => {
    expect(rules(withColor('quaternary', { emphasis: '#f59e0b' }))).toContain(
      'text-contrast',
    );
  });

  it('flags an element color below 3:1 on the page background', () => {
    expect(
      rules(
        withColor('focus', {
          base: '#93c5fd',
          text: '#111111',
          emphasis: '#93c5fd',
        }),
      ),
    ).toEqual(['ui-contrast']);
  });

  it('does not hold surface colors to the 3:1 element rule', () => {
    expect(
      auditTokens(withColor('formBackground', { base: '#fafafa' })),
    ).toEqual([]);
  });

  it('checks the dark mode too', () => {
    const findings = auditTokens({
      ...tokens,
      modes: { light: mode, dark: mode },
    });
    expect(findings).toEqual([]);

    const failing = auditTokens({
      ...tokens,
      modes: {
        light: mode,
        dark: {
          ...mode,
          colorPalette: {
            ...palette,
            primary: { ...palette.primary, text: '#2563eb' },
          },
        },
      },
    });
    expect(failing[0].message).toMatch(/^dark: primary.text on primary.base/);
  });

  it('checks a translucent emphasis as it renders on the page', () => {
    expect(
      rules(withColor('background', { emphasis: 'rgba(0,0,0,0.05)' })),
    ).toEqual([]);
    expect(
      rules(
        withColor('primary', {
          text: '#ffffff',
          emphasis: 'rgba(0,0,0,0.05)',
        }),
      ),
    ).toContain('text-contrast');
  });

  it('reports a color it cannot parse instead of passing it', () => {
    expect(rules(withColor('error', { text: 'white' as '#fff' }))).toContain(
      'unparseable-color',
    );
  });

  it.each([1, 0.8])(
    'flags a ratio of %s, where the scale does not grow',
    ratio => {
      expect(rules({ ...tokens, type: { ...tokens.type, ratio } })).toContain(
        'ratio-not-ascending',
      );
    },
  );

  it('flags a ratio steep enough for the floor to raise the s step', () => {
    expect(rules({ ...tokens, type: { ...tokens.type, ratio: 1.5 } })).toEqual([
      'floor-raises-step',
    ]);
  });

  it('flags a root font size under 100%, where iOS zooms in on inputs', () => {
    const findings = auditTokens({
      ...tokens,
      type: { ...tokens.type, base: { ...tokens.type.base, mobile: '87.5%' } },
    });

    expect(findings.map(f => f.rule)).toEqual(['input-zoom']);
    expect(findings[0].message).toContain('type.base.mobile is 87.5%');
  });

  it('flags a smallest breakpoint that does not start at 0', () => {
    expect(
      rules({
        ...tokens,
        breakpoints: { ...tokens.breakpoints, mobile: '375px' },
      }),
    ).toEqual(['breakpoint-origin']);
  });
});
