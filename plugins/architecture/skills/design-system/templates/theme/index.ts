import DesignSystem, { type SystemTokens } from '@pindakaasman/design-system';

const tokens: SystemTokens = {
  breakpoints: {
    mobile: '375px',
    tablet: '768px',
    tabletLandscape: '1024px',
    desktop: '1440px',
  },
  type: {
    baseFontSize: '16px',
    fontFamily: {
      base: 'system-ui, sans-serif',
      heading: 'system-ui, sans-serif',
      mono: 'ui-monospace, monospace',
    },
    fontWeight: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      base: 1.5,
      loose: 1.8,
    },
    sizes: {
      mobile: {
        xxs: '10px',
        xs: '12px',
        s: '14px',
        base: '16px',
        m: '20px',
        l: '24px',
        xl: '32px',
      },
      tablet: {
        xxs: '10px',
        xs: '12px',
        s: '14px',
        base: '16px',
        m: '22px',
        l: '28px',
        xl: '36px',
      },
      tabletLandscape: {
        xxs: '12px',
        xs: '14px',
        s: '16px',
        base: '18px',
        m: '22px',
        l: '28px',
        xl: '40px',
      },
      desktop: {
        xxs: '12px',
        xs: '14px',
        s: '16px',
        base: '18px',
        m: '24px',
        l: '32px',
        xl: '48px',
      },
    },
  },
  modes: {
    light: {
      colorPalette: {
        error: { base: '#e5484d', text: '#ffffff', emphasis: '#b3221f' },
        formBackground: {
          base: '#f5f5f5',
          text: '#1a1a1a',
          emphasis: '#e0e0e0',
        },
        background: { base: '#ffffff', text: '#1a1a1a', emphasis: '#f0f0f0' },
        primary: { base: '#3b82f6', text: '#ffffff', emphasis: '#1d4ed8' },
        secondary: { base: '#6b7280', text: '#ffffff', emphasis: '#374151' },
        tertiary: { base: '#8b5cf6', text: '#ffffff', emphasis: '#5b21b6' },
        quaternary: { base: '#f59e0b', text: '#1a1a1a', emphasis: '#b45309' },
      },
      gradient: {
        menu: 'linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)',
        hero: 'linear-gradient(90deg, #8b5cf6 0%, #3b82f6 100%)',
      },
      boxShadow: {
        base: '0 1px 2px rgba(0, 0, 0, 0.08)',
        card: '0 2px 8px rgba(0, 0, 0, 0.12)',
        modal: '0 8px 24px rgba(0, 0, 0, 0.2)',
      },
    },
    dark: {
      colorPalette: {
        error: { base: '#ff6369', text: '#1a1a1a', emphasis: '#ff9592' },
        formBackground: {
          base: '#1f1f1f',
          text: '#ededed',
          emphasis: '#2e2e2e',
        },
        background: { base: '#111111', text: '#ededed', emphasis: '#1c1c1c' },
        primary: { base: '#60a5fa', text: '#0b1220', emphasis: '#93c5fd' },
        secondary: { base: '#9ca3af', text: '#111111', emphasis: '#d1d5db' },
        tertiary: { base: '#a78bfa', text: '#111111', emphasis: '#c4b5fd' },
        quaternary: { base: '#fbbf24', text: '#1a1a1a', emphasis: '#fcd34d' },
      },
      gradient: {
        menu: 'linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%)',
        hero: 'linear-gradient(90deg, #a78bfa 0%, #60a5fa 100%)',
      },
      boxShadow: {
        base: '0 1px 2px rgba(0, 0, 0, 0.4)',
        card: '0 2px 8px rgba(0, 0, 0, 0.5)',
        modal: '0 8px 24px rgba(0, 0, 0, 0.6)',
      },
    },
  },
  zIndex: {
    base: 0,
    dropdown: 100,
    sticky: 200,
    modal: 300,
    toast: 400,
  },
  spacing: {
    scale: {
      mobile: {
        xxs: '2px',
        xs: '4px',
        s: '8px',
        base: '16px',
        m: '24px',
        l: '32px',
        xl: '48px',
      },
      tablet: {
        xxs: '2px',
        xs: '4px',
        s: '8px',
        base: '16px',
        m: '24px',
        l: '40px',
        xl: '56px',
      },
      tabletLandscape: {
        xxs: '4px',
        xs: '8px',
        s: '12px',
        base: '20px',
        m: '32px',
        l: '40px',
        xl: '56px',
      },
      desktop: {
        xxs: '4px',
        xs: '8px',
        s: '12px',
        base: '20px',
        m: '32px',
        l: '48px',
        xl: '64px',
      },
    },
  },
  border: {
    radius: { s: '4px', base: '8px', full: '9999px' },
    width: { s: '1px', base: '2px' },
  },
};

/** The theme instance passed to styled-components' ThemeProvider. */
const theme = new DesignSystem(tokens);

export default theme;
