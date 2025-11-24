import React from 'react';

// PUBLIC_INTERFACE
export default function StatusBar({ pending, error, onStop, onClear }) {
  /**
   * Display pending status and error messages.
   * Clear/Stop controls hidden by default unless explicitly enabled by design.
   */
  const SHOW_CONTROLS = false;

  return (
    <div className="status-bar" role="contentinfo" aria-live="polite">
      <div className="status">
        {pending ? <span className="dot dot-pending" aria-label="Pending" /> : <span className="dot dot-idle" aria-label="Idle" />}
        {pending ? <span className="status-text">Generating…</span> : null}
        {error ? <span className="status-error" role="alert"> · {error}</span> : null}
      </div>
      {SHOW_CONTROLS ? (
        <div className="status-actions" aria-label="Utility actions">
          <button className="btn btn-ghost" type="button" onClick={onClear} aria-label="Clear chat (Cmd/Ctrl+K)">
            Clear
          </button>
          <button className="btn btn-danger" type="button" onClick={onStop} disabled={!pending} aria-label="Stop generation">
            Stop
          </button>
        </div>
      ) : (
        <div style={{ width: 1, height: 1, overflow: 'hidden' }} aria-hidden="true" />
      )}
    </div>
  );
}
