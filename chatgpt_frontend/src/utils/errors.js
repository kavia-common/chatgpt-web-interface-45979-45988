function toMessage(err) {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  if (err.message) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return 'Unknown error';
  }
}

// PUBLIC_INTERFACE
export function normalizeError(err) {
  /** Normalize various error shapes into a consistent object */
  const message = toMessage(err);
  const code = err?.code || err?.status || 'ERR_UNKNOWN';
  return { message, code };
}
