const safe = {
  get(key, def = null) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return def;
      return JSON.parse(raw);
    } catch {
      return def;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // ignore
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
};

// PUBLIC_INTERFACE
export function persistedState(key, initial) {
  /** Read a persisted state value */
  return safe.get(key, initial);
}

// PUBLIC_INTERFACE
export function saveState(key, value) {
  /** Write a persisted state value */
  safe.set(key, value);
}
