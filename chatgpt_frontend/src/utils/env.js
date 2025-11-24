const getEnv = (name, fallback = undefined) => {
  try {
    const v = process.env[name];
    return v !== undefined ? v : fallback;
  } catch {
    return fallback;
  }
};

const parseBool = (val, def = false) => {
  if (val === undefined || val === null) return def;
  const s = String(val).trim().toLowerCase();
  return ['1', 'true', 'yes', 'on'].includes(s);
};

const parseJSON = (val, def = undefined) => {
  if (!val) return def;
  try {
    return JSON.parse(val);
  } catch {
    return def;
  }
};

// PUBLIC_INTERFACE
export function getApiBase() {
  /** Resolve the API base URL from env vars with fallback. */
  const base = getEnv('REACT_APP_API_BASE') || getEnv('REACT_APP_BACKEND_URL') || '';
  return base.replace(/\/+$/, '');
}

// PUBLIC_INTERFACE
export function getFrontendUrl() {
  const base = getEnv('REACT_APP_FRONTEND_URL') || '';
  return base.replace(/\/+$/, '');
}

// PUBLIC_INTERFACE
export function getFeatureFlags() {
  return parseJSON(getEnv('REACT_APP_FEATURE_FLAGS'), {});
}

// PUBLIC_INTERFACE
export function isExperimentsEnabled() {
  return parseBool(getEnv('REACT_APP_EXPERIMENTS_ENABLED'), false);
}

// PUBLIC_INTERFACE
export function getLogLevel() {
  return getEnv('REACT_APP_LOG_LEVEL', 'info');
}
