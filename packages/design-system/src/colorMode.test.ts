import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  colorModeScript,
  getColorMode,
  setColorMode,
  type ColorModeOptions,
} from './colorMode.js';

// Unit tests run without a DOM: fake just the pieces the helpers touch -
// <head>'s meta tags.
interface FakeMeta {
  name: string;
  content: string;
  remove: () => void;
}

const fakeDocument = () => {
  const metas: Array<FakeMeta> = [];
  return {
    metas,
    createElement: () => {
      const meta: FakeMeta = {
        name: '',
        content: '',
        remove: () => {
          metas.splice(metas.indexOf(meta), 1);
        },
      };
      return meta;
    },
    head: {
      appendChild: (meta: FakeMeta) => {
        metas.push(meta);
      },
      querySelector: (selector: string) =>
        selector === "meta[name='ds-color-mode']"
          ? (metas.find(meta => meta.name === 'ds-color-mode') ?? null)
          : null,
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

let doc: ReturnType<typeof fakeDocument>;
let storage: ReturnType<typeof fakeStorage>;

/** The mode the meta tag forces, if there is one. */
const forcedMode = () =>
  doc.metas.find(meta => meta.name === 'ds-color-mode')?.content;

beforeEach(() => {
  doc = fakeDocument();
  storage = fakeStorage();
  vi.stubGlobal('document', doc);
  vi.stubGlobal('localStorage', storage);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const runScript = (options?: ColorModeOptions) => {
  new Function(colorModeScript(options))();
};

describe('colorModeScript', () => {
  it('applies a saved mode as a meta tag in <head>', () => {
    storage.setItem('ds-color-mode', 'dark');
    runScript();
    expect(forcedMode()).toBe('dark');
  });

  it('adds nothing when nothing is saved', () => {
    runScript();
    expect(forcedMode()).toBeUndefined();
  });

  it('ignores a saved value that is not a mode', () => {
    storage.setItem('ds-color-mode', 'purple');
    runScript();
    expect(forcedMode()).toBeUndefined();
  });

  it('reads the given storage key', () => {
    storage.setItem('my-app-mode', 'light');
    runScript({ storageKey: 'my-app-mode' });
    expect(forcedMode()).toBe('light');
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
    expect(forcedMode()).toBe('dark');
    expect(storage.items.get('ds-color-mode')).toBe('dark');
  });

  it('clears the override for system', () => {
    setColorMode('dark');
    setColorMode('system');
    expect(forcedMode()).toBeUndefined();
    expect(storage.items.has('ds-color-mode')).toBe(false);
  });

  it('updates the existing meta tag instead of adding another', () => {
    setColorMode('dark');
    setColorMode('light');
    expect(doc.metas).toHaveLength(1);
    expect(forcedMode()).toBe('light');
  });

  it('takes over the meta tag the script added', () => {
    storage.setItem('ds-color-mode', 'dark');
    runScript();
    setColorMode('light');
    expect(doc.metas).toHaveLength(1);
    expect(forcedMode()).toBe('light');
  });

  it('saves under the given storage key', () => {
    setColorMode('light', { storageKey: 'my-app-mode' });
    expect(storage.items.get('my-app-mode')).toBe('light');
  });

  it('still applies the mode when storage is blocked', () => {
    vi.stubGlobal('localStorage', throwingStorage);
    setColorMode('dark');
    expect(forcedMode()).toBe('dark');
  });

  it('does nothing without a document (SSR)', () => {
    vi.stubGlobal('document', undefined);
    expect(() => setColorMode('dark')).not.toThrow();
    expect(storage.items.size).toBe(0);
  });
});
