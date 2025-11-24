import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';

// PUBLIC_INTERFACE
export default function ChatWindow({ messages, onToggleReaction }) {
  /** Scrollable message area that autoscrolls to bottom on updates */
  const endRef = useRef(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <main className="chat-window" role="main" aria-label="Chat messages">
      {messages.length === 0 ? (
        <div className="empty-hero" aria-live="polite" aria-label="Empty chat hero">
          <h2 className="hero-title">What can I help with?</h2>
          <div className="hero-search" role="group" aria-label="Prompt input demo">
            <div className="hero-icon" aria-hidden="true">🔎</div>
            <div className="hero-placeholder">Ask anything</div>
            <div className="hero-shortcut" aria-hidden="true">↵</div>
          </div>
        </div>
      ) : (
        messages.map((m) => (
          <MessageBubble
            key={m.id}
            id={m.id}
            role={m.role}
            content={m.content}
            attachments={m.attachments}
            reactions={m.reactions}
            onToggleReaction={onToggleReaction}
          />
        ))
      )}
      <div ref={endRef} aria-hidden="true" />
    </main>
  );
}
