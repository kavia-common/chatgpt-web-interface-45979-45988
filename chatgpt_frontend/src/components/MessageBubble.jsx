import React from 'react';

// PUBLIC_INTERFACE
export default function MessageBubble({ role, content }) {
  /**
   * Render a chat message bubble for user or assistant.
   * Matches the Ocean Professional design with precise paddings and colors.
   */
  const isUser = role === 'user';
  return (
    <div className={`bubble-row ${isUser ? 'right' : 'left'}`}>
      <div
        className={`bubble ${isUser ? 'user' : 'assistant'}`}
        role="group"
        aria-label={`${isUser ? 'User' : 'Assistant'} message`}
        style={{ maxWidth: 'min(740px, 92%)' }}
      >
        <div className="bubble-text">{content}</div>
      </div>
    </div>
  );
}
