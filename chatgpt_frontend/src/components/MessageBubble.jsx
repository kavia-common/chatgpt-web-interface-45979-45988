import React from 'react';
import useSpeech from '../hooks/useSpeech';
import { getFeatureFlags } from '../utils/env';

// PUBLIC_INTERFACE
export default function MessageBubble({ role, content }) {
  /**
   * Render a chat message bubble for user or assistant with optional TTS play.
   */
  const isUser = role === 'user';
  const flags = getFeatureFlags();
  const voiceOutputEnabled = !!flags.voice_output;

  const { canSpeak, speak, speaking, cancelSpeak } = useSpeech();

  const onPlay = () => {
    if (!voiceOutputEnabled) {
      alert('Voice output is disabled by feature flags.');
      return;
    }
    if (!canSpeak) {
      alert('Voice output is not supported in this browser.');
      return;
    }
    if (!content) return;
    speak(content, { lang: 'en-US' });
  };

  const onStop = () => {
    cancelSpeak();
  };

  return (
    <div className={`bubble-row ${isUser ? 'right' : 'left'}`}>
      <div
        className={`bubble ${isUser ? 'user' : 'assistant'}`}
        role="group"
        aria-label={`${isUser ? 'User' : 'Assistant'} message`}
      >
        {!isUser && voiceOutputEnabled ? (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
            <button
              type="button"
              className="btn btn-ghost"
              aria-label={speaking ? 'Stop speaking' : 'Play message audio'}
              title={speaking ? 'Stop' : (canSpeak ? 'Play' : 'Voice not supported')}
              onClick={speaking ? onStop : onPlay}
              style={{ height: 28, minWidth: 40, padding: '0 8px' }}
            >
              {speaking ? '⏹️' : '🔊'}
            </button>
          </div>
        ) : null}
        <div className="bubble-text">{content}</div>
      </div>
    </div>
  );
}
