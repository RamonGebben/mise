import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  colorModeScript,
  getColorMode,
  setColorMode,
  type ColorModeOptions,
} from './colorMode.js';

// Unit tests run without a DOM: fake just the pieces the helpers touch.
const fakeRoot = () => {
  const attributes = new Map<string, string>();
  return {
    attributes,
    setAttribute: (name: string, value: string) => {
      attributes.set(name, value);
    },
    removeAttribute: (name: string) => {
      attributes.delete(name);
    },
  };
};

const fakeStorage = () => {
  const items = new Map<string, string>();
  return {
    items,
    getItem: (key: string) => items.get(key) ?? null,
    setItem: (key: string, value: string) => {
      items.set(key, value);
    },
    removeItem: (key: string) => {
      items.delete(key);
    },
  };
};

const throwingStorage = {
  getItem: () => {
    throw new Error('blocked');
  },
  setItem: () => {
    throw new Error('blocked');
  },
  removeItem: () => {
    throw new Error('blocked');
  },
};

let root: ReturnType<typeof fakeRoot>;
let storage: ReturnType<typeof fakeStorage>;

beforeEach(() => {
  root = fakeRoot();
  storage = fakeStorage();
  vi.stubGlobal('document', { documentElement: root });
  vi.stubGlobal('localStorage', storage);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const runScript = (options?: ColorModeOptions) => {
  new Function(colorModeScript(options))();
};

describe('colorModeScript', () => {
  it('applies a saved mode to <html>', () => {
    storage.setItem('ds-color-mode', 'dark');
    runScript();
    expect(root.attributes.get('data-mode')).toBe('dark');
  });

  it('leaves <html> alone when nothing is saved', () => {
    runScript();
    expect(root.attributes.has('data-mode')).toBe(false);
  });

  it('ignores a saved value that is not a mode', () => {
    storage.setItem('ds-color-mode', 'purple');
    runScript();
    expect(root.attributes.has('data-mode')).toBe(false);
  });

  it('reads the given storage key', () => {
    storage.setItem('my-app-mode', 'light');
    runScript({ storageKey: 'my-app-mode' });
    expect(root.attributes.get('data-mode')).toBe('light');
  });

  it('does not throw when storage is blocked', () => {
    vi.stubGlobal('localStorage', throwingStorage);
    expect(() => runScript()).not.toThrow();
  });
});

describe('getColorMode', () => {
  it('returns the saved mode', () => {
    storage.setItem('ds-color-mode', 'light');
    expect(getColorMode()).toBe('light');
  });

  it('returns system when nothing valid is saved', () => {
    expect(getColorMode()).toBe('system');
    storage.setItem('ds-color-mode', 'purple');
    expect(getColorMode()).toBe('system');
  });

  it('returns system when storage is blocked', () => {
    vi.stubGlobal('localStorage', throwingStorage);
    expect(getColorMode()).toBe('system');
  });

  it('returns system without storage (SSR)', () => {
    vi.stubGlobal('localStorage', undefined);
    expect(getColorMode()).toBe('system');
  });
});

describe('setColorMode', () => {
  it('applies and saves a mode', () => {
    setColorMode('dark');
    expect(root.attributes.get('data-mode')).toBe('dark');
    expect(storage.items.get('ds-color-mode')).toBe('dark');
  });

  it('clears the override for system', () => {
    setColorMode('dark');
    setColorMode('system');
    expect(root.attributes.has('data-mode')).toBe(false);
    expect(storage.items.has('ds-color-mode')).toBe(false);
  });

  it('saves under the given storage key', () => {
    setColorMode('light', { storageKey: 'my-app-mode' });
    expect(storage.items.get('my-app-mode')).toBe('light');
  });

  it('still applies the mode when storage is blocked', () => {
    vi.stubGlobal('localStorage', throwingStorage);
    setColorMode('dark');
    expect(root.attributes.get('data-mode')).toBe('dark');
  });

  it('does nothing without a document (SSR)', () => {
    vi.stubGlobal('document', undefined);
    expect(() => setColorMode('dark')).not.toThrow();
    expect(storage.items.size).toBe(0);
  });
});
