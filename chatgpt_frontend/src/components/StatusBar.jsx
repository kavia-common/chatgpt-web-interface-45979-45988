import React, { useEffect, useMemo, useState } from 'react';
import useSpeech from '../hooks/useSpeech';
import { getFeatureFlags } from '../utils/env';

// PUBLIC_INTERFACE
export default function StatusBar({ pending, error, onStop, onClear }) {
  /**
   * Display pending status and error messages.
   * Optional: Auto TTS toggle for new assistant messages.
   */
  const SHOW_CONTROLS = false;

  const flags = useMemo(() => getFeatureFlags() || {}, []);
  const voiceOutputEnabled = !!flags.voice_output;

  const { canSpeak, autoTts, setAutoTts, ttsError } = useSpeech();
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    // Persist auto TTS choice
    try {
      const key = 'app.voice.autoTts';
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        setAutoTts(String(saved) === 'true');
      } else if (typeof flags.auto_tts === 'boolean') {
        setAutoTts(!!flags.auto_tts);
      }
    } catch {
      // ignore
    }
  }, [flags.auto_tts, setAutoTts]);

  useEffect(() => {
    try {
      localStorage.setItem('app.voice.autoTts', String(autoTts));
    } catch {
      // ignore
    }
  }, [autoTts]);

  useEffect(() => {
    if (!voiceOutputEnabled) return;
    if (!canSpeak) setNotice('Voice output not supported in this browser.');
    else setNotice(null);
  }, [voiceOutputEnabled, canSpeak]);

  return (
    <div className="status-bar" role="contentinfo" aria-live="polite">
      <div className="status">
        {pending ? <span className="dot dot-pending" aria-label="Pending" /> : <span className="dot dot-idle" aria-label="Idle" />}
        {pending ? <span className="status-text">Generating…</span> : null}
        {error ? <span className="status-error" role="alert"> · {error}</span> : null}
        {voiceOutputEnabled ? (
          <span className="status-text" style={{ marginLeft: 8 }}>
            {notice ? ` · ${notice}` : null}
            {ttsError ? ` · ${ttsError}` : null}
          </span>
        ) : null}
      </div>
      <div className="status-actions" aria-label="Utility actions">
        {voiceOutputEnabled ? (
          <label className="btn btn-ghost" style={{ minWidth: 0, padding: '0 10px', height: 32 }}>
            <input
              type="checkbox"
              checked={!!autoTts}
              onChange={(e) => setAutoTts(!!e.target.checked)}
              aria-label="Auto-play assistant messages"
              style={{ marginRight: 8 }}
            />
            Auto TTS
          </label>
        ) : null}
        {SHOW_CONTROLS ? (
          <>
            <button className="btn btn-ghost" type="button" onClick={onClear} aria-label="Clear chat (Cmd/Ctrl+K)">
              Clear
            </button>
            <button className="btn btn-danger" type="button" onClick={onStop} disabled={!pending} aria-label="Stop generation">
              Stop
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
