import { getApiBase, getLogLevel } from '../utils/env';
import { normalizeError } from '../utils/errors';

const DEFAULT_TIMEOUT = 60000;

function log(level, ...args) {
  const current = getLogLevel();
  const order = ['error', 'warn', 'info', 'debug'];
  if (order.indexOf(level) <= order.indexOf(current)) {
    // eslint-disable-next-line no-console
    console[level === 'debug' ? 'log' : level](...args);
  }
}

// PUBLIC_INTERFACE
export async function apiFetch(path, { method = 'GET', headers = {}, body, signal, timeout = DEFAULT_TIMEOUT } = {}) {
  /**
   * Fetch wrapper that applies base URL, timeout and JSON serialization.
   * Throws normalized errors on non-OK responses.
   */
  const base = getApiBase();
  const url = `${base}${path.startsWith('/') ? '' : '/'}${path}`;
  const controller = new AbortController();
  const signals = [controller.signal].concat(signal ? [signal] : []);

  let timeoutId;
  if (timeout) {
    timeoutId = setTimeout(() => controller.abort('Request timeout'), timeout);
  }

  try {
    const finalHeaders = {
      'Accept': 'application/json',
      ...(body && typeof body === 'object' && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    };

    const res = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body && typeof body === 'object' && !(body instanceof FormData) ? JSON.stringify(body) : body,
      signal: signals.length === 1 ? signals[0] : mergeSignals(signals),
    });

    const contentType = res.headers.get('content-type') || '';
    let data = null;
    if (contentType.includes('application/json')) {
      data = await res.json().catch(() => null);
    } else {
      data = await res.text().catch(() => null);
    }

    if (!res.ok) {
      const err = normalizeError(data || { message: res.statusText, code: res.status });
      err.status = res.status;
      throw err;
    }

    return data;
  } catch (err) {
    log('warn', 'apiFetch error:', err);
    throw normalizeError(err);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

function mergeSignals(signals) {
  const controller = new AbortController();
  const onAbort = () => controller.abort('Composite abort');
  signals.forEach((s) => {
    if (s) {
      if (s.aborted) controller.abort('Composite abort');
      else s.addEventListener('abort', onAbort);
    }
  });
  return controller.signal;
}
