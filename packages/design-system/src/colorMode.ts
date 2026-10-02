// Switching between color modes happens in CSS, not by swapping themes: the
// accessors return CSS variables, DesignSystem.colorModeCss() defines them per
// mode, and the `data-mode` attribute on <html> overrides the OS preference.
// These helpers manage that attribute and remember the choice. They only
// touch the DOM, so they work with any framework (or none).

export type ColorMode = 'light' | 'dark';

/** `'system'` follows the OS preference (`prefers-color-scheme`). */
export type ColorModePreference = ColorMode | 'system';

export interface ColorModeOptions {
  /** localStorage key the chosen mode is saved under. */
  storageKey?: string;
}

export const COLOR_MODE_ATTRIBUTE = 'data-mode';

const DEFAULT_STORAGE_KEY = 'ds-color-mode';

const isColorMode = (value: unknown): value is ColorMode =>
  value === 'light' || value === 'dark';

// localStorage can be missing (SSR) or throw (private mode, blocked
// storage). A failed read or write only loses the remembered choice.
const readStorage = (key: string): string | null => {
  try {
    return globalThis.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeStorage = (key: string, value: string | null): void => {
  try {
    if (value === null) {
      globalThis.localStorage.removeItem(key);
    } else {
      globalThis.localStorage.setItem(key, value);
    }
  } catch {
    // Not remembered, but the mode still applies for this page view.
  }
};

/**
 * colorModeScript()
 * Inline script that applies the saved mode before first paint, so a page
 * rendered on the server never flashes the wrong mode. Put it in <head>.
 */
export const colorModeScript = ({
  storageKey = DEFAULT_STORAGE_KEY,
}: ColorModeOptions = {}): string =>
  `(function(){try{var m=localStorage.getItem(${JSON.stringify(storageKey)});` +
  `if(m==='light'||m==='dark')document.documentElement.setAttribute('${COLOR_MODE_ATTRIBUTE}',m);}catch(e){}})();`;

/**
 * getColorMode()
 * The mode the user picked, or `'system'` when they haven't.
 */
export const getColorMode = ({
  storageKey = DEFAULT_STORAGE_KEY,
}: ColorModeOptions = {}): ColorModePreference => {
  const saved = readStorage(storageKey);
  return isColorMode(saved) ? saved : 'system';
};

/**
 * setColorMode()
 * Apply and remember a mode. `'system'` clears the override. In a theme
 * without dark tokens there's no dark CSS to switch to, so `'dark'` changes
 * nothing visible.
 */
export const setColorMode = (
  mode: ColorModePreference,
  { storageKey = DEFAULT_STORAGE_KEY }: ColorModeOptions = {},
): void => {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  if (mode === 'system') {
    root.removeAttribute(COLOR_MODE_ATTRIBUTE);
    writeStorage(storageKey, null);
  } else {
    root.setAttribute(COLOR_MODE_ATTRIBUTE, mode);
    writeStorage(storageKey, mode);
  }
};
