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
      {messages.length === 0 ? (
        <div className="empty-state" aria-live="polite">
          Start the conversation by typing a message below.
        </div>
      ) : (
        messages.map((m) => (
          <MessageBubble key={m.id} role={m.role} content={m.content} />
        ))
      )}
      <div ref={endRef} />
    </main>
  );
}
