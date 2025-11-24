import React from 'react';
import useSpeech from '../hooks/useSpeech';
import { getFeatureFlags } from '../utils/env';

// PUBLIC_INTERFACE
export default function MessageBubble({ role, content, attachments = [] }) {
  /**
   * Render a chat message bubble for user or assistant with optional TTS play.
   * Renders image attachments as thumbnails below the text.
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

  const imgs = Array.isArray(attachments)
    ? attachments.filter((a) => a && typeof a === 'object' && (a.type?.startsWith('image/') || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(a.name || '')))
    : [];

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
        {imgs.length > 0 ? (
          <div
            className="attachments"
            role="group"
            aria-label="Attached images"
            style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}
          >
            {imgs.map((att) => {
              const src = att.url || att.dataUrl;
              if (!src) return null;
              return (
                <a
                  key={att.id || att.name}
                  href={src}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Open image ${att.name || 'attachment'}`}
                  style={{
                    display: 'inline-block',
                    borderRadius: 8,
                    overflow: 'hidden',
                    border: '1px solid #1f2a3f',
                    background: '#0b1220'
                  }}
                >
                  <img
                    src={src}
                    alt={att.name || 'Image attachment'}
                    style={{ width: 120, height: 120, objectFit: 'cover', display: 'block' }}
                  />
                </a>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
