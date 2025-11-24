import React, { useCallback, useEffect, useRef, useState } from 'react';
import useSpeech from '../hooks/useSpeech';
import { getFeatureFlags } from '../utils/env';

// PUBLIC_INTERFACE
export default function MessageInput({ onSend, disabled, onClear }) {
  /**
   * Multiline input with Enter to send, Shift+Enter for newline.
   * Cmd/Ctrl+K to clear chat.
   * Voice input via Web Speech API when available.
   */
  const [value, setValue] = useState('');
  const ref = useRef(null);
  const {
    isSupportedInput,
    isRecording,
    startRecording,
    stopRecording,
    recError,
  } = useSpeech();

  const flags = getFeatureFlags();
  const voiceInputEnabled = !!flags.voice_input;

  const handleSend = useCallback(() => {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue('');
  }, [value, disabled, onSend]);

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    const handler = (e) => {
      const meta = e.ctrlKey || e.metaKey;
      if (meta && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClear && onClear();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClear]);

  const onClickMic = async () => {
    if (!voiceInputEnabled) {
      alert('Voice input is disabled by feature flags.');
      return;
    }
    if (!isSupportedInput) {
      alert('Voice input is not supported in this browser.');
      return;
    }
    try {
      if (!isRecording) {
        const text = await startRecording({ lang: 'en-US' });
        if (text) setValue((v) => (v ? `${v} ${text}` : text));
      } else {
        stopRecording();
      }
    } catch (e) {
      // already handled via recError state; surface minimally
      // eslint-disable-next-line no-alert
      alert(e?.message || 'Voice input error');
    }
  };

  return (
    <div className="message-input" role="form" aria-label="Send a message">
      <textarea
        ref={ref}
        className="input"
        placeholder="Type your message…  Enter to send · Shift+Enter for newline"
        aria-label="Message input"
        value={value}
        disabled={disabled}
        rows={3}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <div className="input-actions">
        {voiceInputEnabled ? (
          <button
            className="btn btn-ghost"
            type="button"
            onClick={onClickMic}
            aria-label={isRecording ? 'Stop voice recording' : 'Start voice recording'}
            title={isRecording ? 'Stop' : (isSupportedInput ? 'Speak' : 'Voice not supported')}
            style={{ height: 'var(--btn-height)', minWidth: 40, padding: '0 10px' }}
          >
            {isRecording ? '⏺️' : '🎤'}
          </button>
        ) : null}

        <button
          className="btn btn-primary"
          type="button"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
          title="Send"
          style={{ minWidth: 92, height: 'var(--btn-height)' }}
        >
          Send
        </button>
      </div>

      {voiceInputEnabled && isRecording ? (
        <div className="status" style={{ marginTop: 6 }}>
          <span className="dot dot-pending" aria-label="Recording" />
          <span className="status-text">Listening… click mic to stop</span>
        </div>
      ) : null}

      {voiceInputEnabled && recError ? (
        <div className="status-error" role="alert" style={{ marginTop: 6 }}>
          {recError}
        </div>
      ) : null}
    </div>
  );
}
