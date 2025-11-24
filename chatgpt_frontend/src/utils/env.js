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

/**
 * Feature flags come from REACT_APP_FEATURE_FLAGS as a JSON object.
 * We expose helpers for specific flags used by voice features.
 */
// PUBLIC_INTERFACE
export function getFeatureFlags() {
  // Defensive: ensure a plain object is always returned
  const parsed = parseJSON(getEnv('REACT_APP_FEATURE_FLAGS'), {});
  return parsed && typeof parsed === 'object' ? parsed : {};
}

// PUBLIC_INTERFACE
export function isVoiceInputEnabled() {
  const flags = getFeatureFlags();
  return !!flags.voice_input;
}

// PUBLIC_INTERFACE
export function isVoiceOutputEnabled() {
  const flags = getFeatureFlags();
  return !!flags.voice_output;
}

// PUBLIC_INTERFACE
export function isAutoTtsEnabled() {
  const flags = getFeatureFlags();
  return !!flags.auto_tts;
}

// PUBLIC_INTERFACE
export function isExperimentsEnabled() {
  return parseBool(getEnv('REACT_APP_EXPERIMENTS_ENABLED'), false);
}

// PUBLIC_INTERFACE
export function getLogLevel() {
  return getEnv('REACT_APP_LOG_LEVEL', 'info');
}
