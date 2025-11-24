import React from 'react';
import useSpeech from '../hooks/useSpeech';
import { getFeatureFlags } from '../utils/env';

// PUBLIC_INTERFACE
export default function MessageBubble({ id, role, content, attachments = [], reactions, onToggleReaction }) {
  /**
   * Render a chat message bubble for user or assistant with optional TTS play.
   * Renders image attachments as thumbnails below the text.
   * Also renders an inline reaction bar with accessible buttons.
   */
  const isUser = role === 'user';
  const flags = getFeatureFlags();
  const voiceOutputEnabled = !!flags.voice_output;
  const reactionsEnabled = flags.reactions_enabled !== false; // default true

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

  // reaction helpers
  const counts = reactions?.counts || {};
  const userReacted = reactions?.userReacted || {};
  const likeCount = counts.like || 0;
  const dislikeCount = counts.dislike || 0;
  const likeActive = !!userReacted.like;
  const dislikeActive = !!userReacted.dislike;

  const handleReaction = (name) => {
    if (!reactionsEnabled) return;
    if (typeof onToggleReaction === 'function') {
      onToggleReaction(id, name);
    }
  };

  const btnStyle = {
    height: 28,
    minWidth: 34,
    padding: '0 8px',
    borderRadius: 10,
    border: '1px solid var(--border)',
    background: 'transparent',
    color: 'var(--muted)',
  };
  const btnActiveStyle = {
    ...btnStyle,
    background: 'color-mix(in srgb, var(--surface) 85%, var(--color-primary) 15%)',
    color: 'var(--text)',
    borderColor: 'color-mix(in srgb, var(--border), var(--color-primary) 25%)'
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

        {reactionsEnabled ? (
          <div
            className="reaction-bar"
            role="toolbar"
            aria-label="Message reactions"
            style={{
              display: 'inline-flex',
              gap: 6,
              alignItems: 'center',
              marginTop: 8,
              opacity: 0.95
            }}
          >
            <button
              type="button"
              className="reaction-btn"
              onClick={() => handleReaction('like')}
              aria-pressed={likeActive}
              aria-label={likeActive ? 'Remove thumbs up' : 'Thumbs up'}
              title={likeActive ? 'Remove thumbs up' : 'Thumbs up'}
              style={likeActive ? btnActiveStyle : btnStyle}
            >
              <span aria-hidden="true">👍</span>
              <span style={{ marginLeft: 6, fontSize: '12px', opacity: 0.9 }}>{likeCount}</span>
            </button>
            <button
              type="button"
              className="reaction-btn"
              onClick={() => handleReaction('dislike')}
              aria-pressed={dislikeActive}
              aria-label={dislikeActive ? 'Remove thumbs down' : 'Thumbs down'}
              title={dislikeActive ? 'Remove thumbs down' : 'Thumbs down'}
              style={dislikeActive ? btnActiveStyle : btnStyle}
            >
              <span aria-hidden="true">👎</span>
              <span style={{ marginLeft: 6, fontSize: '12px', opacity: 0.9 }}>{dislikeCount}</span>
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
