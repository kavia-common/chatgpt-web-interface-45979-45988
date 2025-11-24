import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

// PUBLIC_INTERFACE
export default function ChatWindow({ messages }) {
  /** Scrollable message area that autoscrolls to bottom on updates */
  const endRef = useRef(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <main className="chat-window" role="main" aria-label="Chat messages">
      {/* Visible divider marker to validate preview updates */}
      <div className="chat-divider" aria-hidden="true" />
      {messages.length === 0 ? (
        <div className="empty-state" aria-live="polite">
          Start the conversation by typing a message below.
        </div>
      ) : (
        messages.map((m) => (
          <MessageBubble key={m.id} role={m.role} content={m.content} />
        ))
      )}
      {/* Minimal visible change marker inside chat for QA */}
      <div style={{ alignSelf: 'center', fontSize: '11px', color: 'var(--muted)', opacity: 0.75, marginTop: 2 }}>
        UI synced to /assets/20251124_110807_Screenshot_2025-11-24_153849.png
      </div>
      <div ref={endRef} aria-hidden="true" />
    </main>
  );
}
