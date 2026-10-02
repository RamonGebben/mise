import { afterEach, describe, expect, it, vi } from 'vitest';
import DesignSystem from './DesignSystem.js';
import type { SystemModeTokens, SystemTokens } from './system.js';

const tokens: SystemTokens = {
  breakpoints: {
    mobile: '375px',
    tablet: '768px',
    tabletLandscape: '1024px',
    desktop: '1440px',
  },
  type: {
    baseFontSize: '16px',
    fontFamily: { base: 'Inter, sans-serif' },
    fontWeight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
    lineHeight: { tight: 1.1, base: 1.5, loose: 1.8 },
    sizes: {
      mobile: {
        xxs: '8px',
        xs: '10px',
        s: '12px',
        base: '14px',
        m: '16px',
        l: '20px',
        xl: 24,
      },
      tablet: {
        xxs: '9px',
        xs: '11px',
        s: '13px',
        base: '15px',
        m: '18px',
        l: '24px',
        xl: 28,
      },
      tabletLandscape: {
        xxs: '10px',
        xs: '12px',
        s: '14px',
        base: '16px',
        m: '20px',
        l: '28px',
        xl: 32,
      },
      desktop: {
        xxs: '10px',
        xs: '12px',
        s: '14px',
        base: '16px',
        m: '24px',
        l: '32px',
        xl: 40,
      },
    },
  },
  spacing: {
    scale: {
      mobile: {
        xxs: '2px',
        xs: '4px',
        s: '8px',
        base: '16px',
        m: '20px',
        l: '24px',
        xl: 32,
      },
      tablet: {
        xxs: '2px',
        xs: '4px',
        s: '8px',
        base: '20px',
        m: '24px',
        l: '32px',
        xl: 40,
      },
      tabletLandscape: {
        xxs: '4px',
        xs: '8px',
        s: '12px',
        base: '24px',
        m: '32px',
        l: '40px',
        xl: 48,
      },
      desktop: {
        xxs: '4px',
        xs: '8px',
        s: '16px',
        base: '32px',
        m: '40px',
        l: '48px',
        xl: 64,
      },
    },
  },
  modes: {
    light: {
      colorPalette: {
        error: { base: '#d32f2f', text: '#ffffff', emphasis: '#9a0007' },
        formBackground: {
          base: '#fafafa',
          text: '#111111',
          emphasis: '#eeeeee',
        },
        background: { base: '#ffffff', text: '#111111', emphasis: '#f0f0f0' },
        primary: { base: '#0055ff', text: '#ffffff', emphasis: '#0033aa' },
        secondary: { base: '#ff5500', text: '#ffffff', emphasis: '#aa3300' },
        tertiary: { base: '#00aa55', text: '#ffffff', emphasis: '#007733' },
        quaternary: { base: '#aa00ff', text: '#ffffff', emphasis: '#7700aa' },
      },
      gradient: {
        menu: 'linear-gradient(#000, #111)',
        hero: 'linear-gradient(#0055ff, #aa00ff)',
      },
      boxShadow: {
        base: '0 1px 2px rgba(0,0,0,0.1)',
        card: '0 2px 8px rgba(0,0,0,0.15)',
        modal: '0 8px 32px rgba(0,0,0,0.3)',
      },
    },
  },
  zIndex: { base: 0, dropdown: 10, sticky: 20, modal: 30, toast: 40 },
};

const dark: SystemModeTokens = {
  colorPalette: {
    error: { base: '#ff6b6b', text: '#111111', emphasis: '#ff9999' },
    formBackground: { base: '#1e1e1e', text: '#eeeeee', emphasis: '#2a2a2a' },
    background: { base: '#121212', text: '#eeeeee', emphasis: '#1e1e1e' },
    primary: { base: '#5c8dff', text: '#111111', emphasis: '#8fb0ff' },
    secondary: { base: '#ff8a4d', text: '#111111', emphasis: '#ffab80' },
    tertiary: { base: '#33cc77', text: '#111111', emphasis: '#66dd99' },
    quaternary: { base: '#cc66ff', text: '#111111', emphasis: '#dd99ff' },
  },
  gradient: {
    menu: 'linear-gradient(#111, #222)',
    hero: 'linear-gradient(#5c8dff, #cc66ff)',
  },
  boxShadow: {
    base: '0 1px 2px rgba(0,0,0,0.5)',
    card: '0 2px 8px rgba(0,0,0,0.6)',
    modal: '0 8px 32px rgba(0,0,0,0.8)',
  },
};

const tokensWithDark: SystemTokens = {
  ...tokens,
  modes: { ...tokens.modes, dark },
};

// Unit tests run without a DOM: fake a viewport of the given width by
// answering `(max-width: Npx)` queries the way a browser would.
const setViewportWidth = (width: number) => {
  vi.stubGlobal('window', {
    matchMedia: (query: string) => {
      const maxWidth = parseFloat(query.replace('(max-width:', ''));
      return { matches: width <= maxWidth };
    },
  });
};

// styled-components' `css` returns an array of interpolated chunks.
const cssText = (chunks: unknown): string => {
  return (chunks as Array<unknown>).join('').replace(/\s+/g, ' ').trim();
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('DesignSystem', () => {
  const theme = new DesignSystem(tokens);

  describe('getTokens', () => {
    it('returns the tokens it was constructed with', () => {
      expect(theme.getTokens()).toBe(tokens);
    });
  });

  describe('getCurrentBreakpoint', () => {
    it.each([
      [320, 'mobile'],
      [375, 'mobile'],
      [376, 'tablet'],
      [768, 'tablet'],
      [1000, 'tabletLandscape'],
      [1440, 'desktop'],
    ] as const)('at %ipx returns %s', (width, expected) => {
      setViewportWidth(width);
      expect(theme.getCurrentBreakpoint()).toBe(expected);
    });

    it('falls back to the last breakpoint when the viewport is wider than all of them', () => {
      setViewportWidth(1920);
      expect(theme.getCurrentBreakpoint()).toBe('desktop');
    });

    it('falls back to the last breakpoint by default when there is no window (SSR)', () => {
      vi.stubGlobal('window', undefined);
      expect(theme.getCurrentBreakpoint()).toBe('desktop');
      expect(theme.fontSize('l')).toBe('2rem');
      expect(theme.spacing('base')).toBe('2rem');
    });

    it('falls back to the last breakpoint when window has no matchMedia', () => {
      vi.stubGlobal('window', {});
      expect(theme.getCurrentBreakpoint()).toBe('desktop');
    });

    it('falls back to the first breakpoint without a window when ssrBreakpoint is smallest', () => {
      vi.stubGlobal('window', undefined);
      const mobileFirst = new DesignSystem(tokens, {
        ssrBreakpoint: 'smallest',
      });
      expect(mobileFirst.getCurrentBreakpoint()).toBe('mobile');
      expect(mobileFirst.fontSize('l')).toBe('1.25rem');
    });

    it('ignores ssrBreakpoint when there is a viewport', () => {
      setViewportWidth(1920);
      const mobileFirst = new DesignSystem(tokens, {
        ssrBreakpoint: 'smallest',
      });
      expect(mobileFirst.getCurrentBreakpoint()).toBe('desktop');
    });
  });

  describe('fontSize / fs', () => {
    it('returns the size for the current breakpoint in rem', () => {
      setViewportWidth(320);
      expect(theme.fontSize('l')).toBe('1.25rem');

      setViewportWidth(1920);
      expect(theme.fontSize('l')).toBe('2rem');
    });

    it('accepts sizes given as plain numbers', () => {
      setViewportWidth(1920);
      expect(theme.fontSize('xl')).toBe('2.5rem');
    });

    it('fs is an alias for fontSize', () => {
      setViewportWidth(800);
      expect(theme.fs('m')).toBe(theme.fontSize('m'));
      expect(theme.fs('m')).toBe('1.25rem');
    });
  });

  describe('fontWeight / fw', () => {
    it('returns the font weight', () => {
      expect(theme.fontWeight('regular')).toBe(400);
      expect(theme.fontWeight('bold')).toBe(700);
    });

    it('fw is an alias for fontWeight', () => {
      expect(theme.fw('semibold')).toBe(600);
    });
  });

  describe('lineHeight / lh', () => {
    it('returns the line height', () => {
      expect(theme.lineHeight('tight')).toBe(1.1);
      expect(theme.lineHeight('loose')).toBe(1.8);
    });

    it('lh is an alias for lineHeight', () => {
      expect(theme.lh('base')).toBe(1.5);
    });
  });

  describe('spacing / space', () => {
    it('returns the spacing for the current breakpoint in rem', () => {
      setViewportWidth(320);
      expect(theme.spacing('base')).toBe('1rem');

      setViewportWidth(1920);
      expect(theme.spacing('base')).toBe('2rem');
    });

    it('accepts sizes given as plain numbers', () => {
      setViewportWidth(1920);
      expect(theme.spacing('xl')).toBe('4rem');
      expect(theme.spacingBetween('xl', 'base')).toBe('2rem');
    });

    it('space is an alias for spacing', () => {
      setViewportWidth(768);
      expect(theme.space('l')).toBe(theme.spacing('l'));
      expect(theme.space('l')).toBe('2rem');
    });
  });

  describe('spacingBetween / spaceBetween', () => {
    it('returns the absolute difference between two sizes in rem', () => {
      setViewportWidth(1920);
      expect(theme.spacingBetween('base', 's')).toBe('1rem');
      expect(theme.spacingBetween('s', 'base')).toBe('1rem');
    });

    it('uses the scale of the current breakpoint', () => {
      setViewportWidth(320);
      expect(theme.spacingBetween('l', 'xs')).toBe('1.25rem');
    });

    it('returns 0rem for the same size', () => {
      setViewportWidth(320);
      expect(theme.spacingBetween('s', 's')).toBe('0rem');
    });

    it('spaceBetween is an alias for spacingBetween', () => {
      setViewportWidth(1000);
      expect(theme.spaceBetween('l', 's')).toBe('1.75rem');
    });
  });

  describe('color', () => {
    it('returns the base variant by default, as a CSS variable', () => {
      expect(theme.color('primary')).toBe('var(--ds-color-primary-base)');
    });

    it('returns the requested variant', () => {
      expect(theme.color('error', 'emphasis')).toBe(
        'var(--ds-color-error-emphasis)',
      );
    });

    it('kebab-cases camelCase hues', () => {
      expect(theme.color('formBackground', 'text')).toBe(
        'var(--ds-color-form-background-text)',
      );
    });
  });

  describe('rawColor', () => {
    const themeWithDark = new DesignSystem(tokensWithDark);

    it('returns the light value of the base variant by default', () => {
      expect(themeWithDark.rawColor('primary')).toBe('#0055ff');
    });

    it('returns the value for the requested variant and mode', () => {
      expect(themeWithDark.rawColor('primary', 'emphasis', 'dark')).toBe(
        '#8fb0ff',
      );
    });

    it('falls back to light when there is no dark mode', () => {
      expect(theme.rawColor('primary', 'base', 'dark')).toBe('#0055ff');
    });
  });

  describe('gradient', () => {
    it('returns the menu gradient by default, as a CSS variable', () => {
      expect(theme.gradient()).toBe('var(--ds-gradient-menu)');
    });

    it('returns the requested gradient', () => {
      expect(theme.gradient('hero')).toBe('var(--ds-gradient-hero)');
    });
  });

  describe('boxShadow', () => {
    it('returns the base shadow by default, as a CSS variable', () => {
      expect(theme.boxShadow()).toBe('var(--ds-shadow-base)');
    });

    it('returns the requested shadow', () => {
      expect(theme.boxShadow('modal')).toBe('var(--ds-shadow-modal)');
    });
  });

  describe('hasDarkMode', () => {
    it('is false without dark tokens', () => {
      expect(theme.hasDarkMode()).toBe(false);
    });

    it('is true with dark tokens', () => {
      expect(new DesignSystem(tokensWithDark).hasDarkMode()).toBe(true);
    });
  });

  describe('colorModeCss', () => {
    // Collapse whitespace so assertions don't depend on indentation.
    const css = (system: DesignSystem) =>
      system.colorModeCss().replace(/\s+/g, ' ');

    it('defines every accessor variable on :root with the light values', () => {
      const output = css(theme);

      expect(output).toMatch(/^:root \{ color-scheme: light;/);
      expect(output).toContain('--ds-color-primary-base: #0055ff;');
      expect(output).toContain('--ds-color-form-background-emphasis: #eeeeee;');
      expect(output).toContain(
        '--ds-gradient-hero: linear-gradient(#0055ff, #aa00ff);',
      );
      expect(output).toContain('--ds-shadow-card: 0 2px 8px rgba(0,0,0,0.15);');
    });

    it('defines one variable per palette, gradient and shadow token', () => {
      const count = theme.colorModeCss().match(/--ds-/g)?.length;
      expect(count).toBe(7 * 3 + 2 + 3);
    });

    it('is light-only without dark tokens', () => {
      const output = css(theme);

      expect(output).not.toContain('prefers-color-scheme');
      expect(output).not.toContain('data-mode');
      expect(output).not.toContain('color-scheme: dark');
    });

    it('applies dark when the OS prefers it, unless light is forced', () => {
      expect(css(new DesignSystem(tokensWithDark))).toContain(
        "@media (prefers-color-scheme: dark) { :root:not([data-mode='light']) { color-scheme: dark; --ds-color-error-base: #ff6b6b;",
      );
    });

    it('applies dark when forced, regardless of the OS', () => {
      expect(css(new DesignSystem(tokensWithDark))).toContain(
        ":root[data-mode='dark'] { color-scheme: dark; --ds-color-error-base: #ff6b6b;",
      );
    });

    it('defines the same variables in every mode', () => {
      const names = (block: string) => block.match(/--ds-[\w-]+/g)?.sort();
      const [light, systemDark, forcedDark] = new DesignSystem(tokensWithDark)
        .colorModeCss()
        .split(/(?=@media|:root\[)/);

      expect(names(systemDark)).toEqual(names(light));
      expect(names(forcedDark)).toEqual(names(light));
    });
  });

  describe('bp', () => {
    it('returns the breakpoint value', () => {
      expect(theme.bp('mobile')).toBe('375px');
      expect(theme.bp('desktop')).toBe('1440px');
    });
  });

  describe('z', () => {
    it('returns the z-index value', () => {
      expect(theme.z('base')).toBe(0);
      expect(theme.z('toast')).toBe(40);
    });
  });

  describe('remToPx / remToPxRaw', () => {
    it('converts rem to px against the base font size', () => {
      expect(theme.remToPx(1.5)).toBe('24px');
      expect(theme.remToPx('2rem')).toBe('32px');
    });

    it('remToPxRaw returns only the number', () => {
      expect(theme.remToPxRaw(1.5)).toBe(24);
      expect(theme.remToPxRaw('0.5rem')).toBe(8);
    });

    it('round-trips with the rem values fontSize returns', () => {
      setViewportWidth(320);
      expect(theme.remToPx(theme.fontSize('l'))).toBe('20px');
    });
  });

  describe('get', () => {
    it('returns the value at a dot-separated path', () => {
      expect(theme.get('modes.light.colorPalette.secondary.emphasis')).toBe(
        '#aa3300',
      );
      expect(theme.get('type.fontFamily.base')).toBe('Inter, sans-serif');
    });

    it('returns a whole subtree for a partial path', () => {
      expect(theme.get('zIndex')).toEqual(tokens.zIndex);
    });

    it('returns undefined for a path that does not exist', () => {
      expect(theme.get('modes.nope.base')).toBeUndefined();
    });
  });

  describe('mq', () => {
    it('lessThan wraps styles in a max-width query for the breakpoint', () => {
      expect(cssText(theme.mq.lessThan('tablet')`color: red;`)).toBe(
        '@media (max-width: 768px) { color: red; }',
      );
    });

    it('greaterThan wraps styles in a min-width query for the breakpoint', () => {
      expect(cssText(theme.mq.greaterThan('desktop')`color: red;`)).toBe(
        '@media (min-width: 1440px) { color: red; }',
      );
    });

    it('between wraps styles in a min- and max-width query', () => {
      expect(
        cssText(theme.mq.between('tablet', 'tabletLandscape')`color: red;`),
      ).toBe(
        '@media (min-width: 768px) and (max-width: 1024px) { color: red; }',
      );
    });
  });
});
