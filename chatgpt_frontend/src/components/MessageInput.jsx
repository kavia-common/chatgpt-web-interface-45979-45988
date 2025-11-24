import React, { useCallback, useEffect, useRef, useState } from 'react';

// PUBLIC_INTERFACE
export default function MessageInput({ onSend, disabled, onClear }) {
  /**
   * Multiline input with Enter to send, Shift+Enter for newline.
   * Cmd/Ctrl+K to clear chat.
   */
  const [value, setValue] = useState('');
  const ref = useRef(null);

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
        <button
          className="btn btn-primary"
          type="button"
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
          title="Send"
        >
          Send
        </button>
      </div>
    </div>
  );
}
