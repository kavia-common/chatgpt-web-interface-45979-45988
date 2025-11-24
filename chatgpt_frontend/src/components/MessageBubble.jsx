import React from 'react';

// PUBLIC_INTERFACE
export default function MessageBubble({ role, content }) {
  /** Render a chat message bubble for user or assistant */
  const isUser = role === 'user';
  return (
    <div className={`bubble-row ${isUser ? 'right' : 'left'}`}>
      <div
        className={`bubble ${isUser ? 'user' : 'assistant'}`}
        role="group"
        aria-label={`${isUser ? 'User' : 'Assistant'} message`}
      >
        <pre className="bubble-text">{content}</pre>
      </div>
    </div>
  );
}
