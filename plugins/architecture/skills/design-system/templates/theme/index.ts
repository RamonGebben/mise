import DesignSystem, { type SystemTokens } from '@pindakaasman/design-system';

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
  },
  modes: {
    light: {
      colorPalette: {
        error: { base: '#c62828', text: '#ffffff', emphasis: '#8e1b1b' },
        formBackground: {
          base: '#f5f5f5',
          text: '#1a1a1a',
          emphasis: '#e0e0e0',
        },
        background: { base: '#ffffff', text: '#1a1a1a', emphasis: '#f0f0f0' },
        primary: { base: '#2563eb', text: '#ffffff', emphasis: '#1d4ed8' },
        secondary: { base: '#6b7280', text: '#ffffff', emphasis: '#374151' },
        tertiary: { base: '#7c3aed', text: '#ffffff', emphasis: '#5b21b6' },
        quaternary: { base: '#b45309', text: '#ffffff', emphasis: '#92400e' },
        focus: { base: '#1d4ed8', text: '#ffffff', emphasis: '#1d4ed8' },
      },
      gradient: {
        menu: 'linear-gradient(180deg, #2563eb 0%, #1d4ed8 100%)',
        hero: 'linear-gradient(90deg, #7c3aed 0%, #2563eb 100%)',
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
        focus: { base: '#93c5fd', text: '#0b1220', emphasis: '#93c5fd' },
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
  border: {
    radius: { s: '4px', base: '8px', full: '9999px' },
    width: { s: '1px', base: '2px' },
  },
};

/** The theme instance passed to styled-components' ThemeProvider. */
const theme = new DesignSystem(tokens);

export default theme;
