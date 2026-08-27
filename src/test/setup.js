import '@testing-library/jest-dom';
import { vi } from 'vitest';

// jsdom provides localStorage, but guard it so module-load code in slices
// (authSlice reads localStorage at import time) never crashes under any runner.
if (typeof globalThis.localStorage === 'undefined') {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    clear: () => store.clear(),
    key: (i) => Array.from(store.keys())[i] ?? null,
    get length() {
      return store.size;
    },
  };
}

// Silence expected navigation side-effects from the api interceptor in tests.
if (!globalThis.window?.location?.assign) {
  globalThis.window = globalThis.window || {};
  globalThis.window.location = globalThis.window.location || { assign: vi.fn() };
}
