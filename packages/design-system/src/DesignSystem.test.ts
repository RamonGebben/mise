import { afterEach, describe, expect, it, vi } from 'vitest';
import DesignSystem from './DesignSystem.js';
import type { SystemModeTokens, SystemTokens } from './system.js';

const tokens: SystemTokens = {
  breakpoints: {
    mobile: '0px',
    tablet: '768px',
    tabletLandscape: '1024px',
    desktop: '1440px',
  },
  type: {
    ratio: 1.25,
    floor: 0.75,
    base: {
      mobile: '100%',
      tablet: '100%',
      tabletLandscape: '106.25%',
      desktop: '112.5%',
    },
    fontFamily: {
      base: 'Inter, sans-serif',
      heading: 'Fraunces, serif',
      mono: 'JetBrains Mono, monospace',
    },
    fontWeight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
    lineHeight: { tight: 1.1, base: 1.5, loose: 1.8 },
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
        focus: { base: '#0033aa', text: '#ffffff', emphasis: '#0033aa' },
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
  border: {
    radius: { s: '4px', base: '8px', full: '9999px' },
    width: { s: '1px', base: '2px' },
  },
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
    focus: { base: '#8fb0ff', text: '#111111', emphasis: '#8fb0ff' },
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
// answering `(min-width: Npx)` queries the way a browser would.
const setViewportWidth = (width: number) => {
  vi.stubGlobal('window', {
    matchMedia: (query: string) => {
      const minWidth = parseFloat(query.replace('(min-width:', ''));
      return { matches: width >= minWidth };
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
      [767, 'mobile'],
      [768, 'tablet'],
      [1023, 'tablet'],
      [1024, 'tabletLandscape'],
      [1440, 'desktop'],
    ] as const)('at %ipx returns %s', (width, expected) => {
      setViewportWidth(width);
      expect(theme.getCurrentBreakpoint()).toBe(expected);
    });

    it('stays on the widest breakpoint beyond its start width', () => {
      setViewportWidth(1920);
      expect(theme.getCurrentBreakpoint()).toBe('desktop');
    });

    it('falls back to the last breakpoint by default when there is no window (SSR)', () => {
      vi.stubGlobal('window', undefined);
      expect(theme.getCurrentBreakpoint()).toBe('desktop');
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
    it('returns a CSS variable, regardless of viewport', () => {
      expect(theme.fontSize('l')).toBe('var(--ds-font-size-l)');

      setViewportWidth(1920);
      expect(theme.fontSize('l')).toBe('var(--ds-font-size-l)');
    });

    it('fs is an alias for fontSize', () => {
      expect(theme.fs('m')).toBe(theme.fontSize('m'));
      expect(theme.fs('m')).toBe('var(--ds-font-size-m)');
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
    it('returns a CSS variable, regardless of viewport', () => {
      expect(theme.spacing('base')).toBe('var(--ds-spacing-base)');

      setViewportWidth(1920);
      expect(theme.spacing('base')).toBe('var(--ds-spacing-base)');
    });

    it('space is an alias for spacing', () => {
      expect(theme.space('l')).toBe(theme.spacing('l'));
      expect(theme.space('l')).toBe('var(--ds-spacing-l)');
    });
  });

  describe('spacingBetween / spaceBetween', () => {
    it('returns a calc() expression subtracting the smaller step from the larger', () => {
      expect(theme.spacingBetween('base', 's')).toBe(
        'calc(var(--ds-spacing-base) - var(--ds-spacing-s))',
      );
    });

    it('is independent of argument order', () => {
      expect(theme.spacingBetween('s', 'base')).toBe(
        theme.spacingBetween('base', 's'),
      );
    });

    it('spaceBetween is an alias for spacingBetween', () => {
      expect(theme.spaceBetween('l', 's')).toBe(theme.spacingBetween('l', 's'));
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
      expect(count).toBe(8 * 3 + 2 + 3);
    });

    it('is light-only without dark tokens', () => {
      const output = css(theme);

      expect(output).not.toContain('prefers-color-scheme');
      expect(output).not.toContain('ds-color-mode');
      expect(output).not.toContain('color-scheme: dark');
    });

    it('applies dark when the OS prefers it, unless light is forced', () => {
      expect(css(new DesignSystem(tokensWithDark))).toContain(
        "@media (prefers-color-scheme: dark) { :root:not(:has(meta[name='ds-color-mode'][content='light'])) { color-scheme: dark; --ds-color-error-base: #ff6b6b;",
      );
    });

    it('applies dark when forced, regardless of the OS', () => {
      expect(css(new DesignSystem(tokensWithDark))).toContain(
        ":root:has(meta[name='ds-color-mode'][content='dark']) { color-scheme: dark; --ds-color-error-base: #ff6b6b;",
      );
    });

    it('defines the same variables in every mode', () => {
      const names = (block: string) => block.match(/--ds-[\w-]+/g)?.sort();
      const [light, systemDark, forcedDark] = new DesignSystem(tokensWithDark)
        .colorModeCss()
        .split(/(?=@media|:root:has)/);

      expect(names(systemDark)).toEqual(names(light));
      expect(names(forcedDark)).toEqual(names(light));
    });
  });

  describe('minTarget', () => {
    it('returns a CSS variable', () => {
      expect(theme.minTarget()).toBe('var(--ds-target-min)');
    });
  });

  describe('rootCss', () => {
    // Collapse whitespace so assertions don't depend on indentation.
    const css = (system: DesignSystem = theme) =>
      system.rootCss().replace(/\s+/g, ' ');

    it("sets the smallest breakpoint's root font size on :root, without a media query", () => {
      expect(css()).toMatch(/^:root \{ font-size: 100%; \}/);
    });

    it("sets each wider breakpoint's root font size from the width it starts at", () => {
      const output = css();

      expect(output).toContain(
        '@media (min-width: 768px) { :root { font-size: 100%; } }',
      );
      expect(output).toContain(
        '@media (min-width: 1024px) { :root { font-size: 106.25%; } }',
      );
      expect(output).toContain(
        '@media (min-width: 1440px) { :root { font-size: 112.5%; } }',
      );
    });

    it('orders the breakpoints by width, whatever order the tokens list them in', () => {
      const shuffled = new DesignSystem({
        ...tokens,
        breakpoints: {
          desktop: '1440px',
          mobile: '0px',
          tabletLandscape: '1024px',
          tablet: '768px',
        },
      });

      expect(css(shuffled)).toMatch(/^:root \{ font-size: 100%; \}/);
      expect(css(shuffled).indexOf('768px')).toBeLessThan(
        css(shuffled).indexOf('1440px'),
      );
    });

    it('defines every font size as a constant power of the ratio, in rem', () => {
      const output = css();

      expect(output).toContain('--ds-font-size-base: 1rem;');
      expect(output).toContain('--ds-font-size-m: 1.25rem;');
      expect(output).toContain('--ds-font-size-xl: 1.9531rem;');
      expect(output).toContain('--ds-font-size-s: 0.8rem;');
    });

    it('never puts a font size below the floor', () => {
      const steep = new DesignSystem({
        ...tokens,
        type: { ...tokens.type, ratio: 1.5 },
      });

      expect(css(steep)).toContain('--ds-font-size-s: 0.75rem;');
    });

    it('defines spacing on the same ratio, below the floor too', () => {
      const output = css();

      expect(output).toContain('--ds-spacing-base: 1rem;');
      expect(output).toContain('--ds-spacing-l: 1.5625rem;');
      expect(output).toContain('--ds-spacing-xxs: 0.512rem;');
    });

    it('defines the minimum target as 24px, and 44px wherever there is a touch input', () => {
      const output = css();

      expect(output).toContain('--ds-target-min: 24px;');
      expect(output).toContain(
        '@media (any-pointer: coarse) { :root { --ds-target-min: 44px; } }',
      );
    });

    it('defines the scale variables once - only the root font size varies per breakpoint', () => {
      expect(theme.rootCss().match(/--ds-font-size-base:/g)).toHaveLength(1);
      expect(theme.rootCss().match(/--ds-spacing-base:/g)).toHaveLength(1);
    });

    it('does not vary with the actual viewport - resolution happens in the browser, not here', () => {
      const withoutViewport = theme.rootCss();

      setViewportWidth(1920);
      expect(theme.rootCss()).toBe(withoutViewport);
    });
  });

  describe('bp', () => {
    it('returns the breakpoint value', () => {
      expect(theme.bp('mobile')).toBe('0px');
      expect(theme.bp('desktop')).toBe('1440px');
    });
  });

  describe('zIndex / z', () => {
    it('returns the z-index value', () => {
      expect(theme.zIndex('base')).toBe(0);
      expect(theme.zIndex('toast')).toBe(40);
    });

    it('z is an alias of zIndex', () => {
      expect(theme.z('modal')).toBe(theme.zIndex('modal'));
    });
  });

  describe('fontFamily / ff', () => {
    it('returns the font-family value', () => {
      expect(theme.fontFamily('base')).toBe('Inter, sans-serif');
      expect(theme.fontFamily('mono')).toBe('JetBrains Mono, monospace');
    });

    it('ff is an alias of fontFamily', () => {
      expect(theme.ff('heading')).toBe(theme.fontFamily('heading'));
    });
  });

  describe('borderRadius', () => {
    it('returns the border-radius value', () => {
      expect(theme.borderRadius('s')).toBe('4px');
      expect(theme.borderRadius('full')).toBe('9999px');
    });
  });

  describe('borderWidth', () => {
    it('returns the border-width value', () => {
      expect(theme.borderWidth('s')).toBe('1px');
      expect(theme.borderWidth('base')).toBe('2px');
    });
  });

  describe('remToPx / remToPxRaw', () => {
    it("converts rem to px at the smallest breakpoint's root font size by default", () => {
      expect(theme.remToPx(1.5)).toBe('24px');
      expect(theme.remToPx('2rem')).toBe('32px');
    });

    it("converts at the given breakpoint's root font size", () => {
      expect(theme.remToPx(1, 'desktop')).toBe('18px');
    });

    it('remToPxRaw returns only the number', () => {
      expect(theme.remToPxRaw(1.5)).toBe(24);
      expect(theme.remToPxRaw('0.5rem', 'desktop')).toBe(9);
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
