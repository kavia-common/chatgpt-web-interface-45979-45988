import React, { useEffect, useMemo, useRef } from 'react';
import MessageBubble from './MessageBubble';

// PUBLIC_INTERFACE
export default function ChatWindow({ messages, onToggleReaction, searchQuery = '', results = [], activeIndex = -1 }) {
  /** Scrollable message area with auto-scroll to bottom on new messages and to active search match */
  const endRef = useRef(null);
  const activeTargetRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (endRef.current) {
      endRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Flatten results to compute global index mapping
  const flatMatches = useMemo(() => {
    const arr = [];
    results.forEach((r) => {
      (r.indices || []).forEach((rng, idxInMsg) => {
        arr.push({ messageId: r.messageId, range: rng, idxInMsg, content: r.content, role: r.role });
      });
    });
    return arr;
  }, [results]);

  // Scroll to active match
  useEffect(() => {
    if (activeIndex < 0 || flatMatches.length === 0) return;
    const target = activeTargetRef.current;
    if (target && listRef.current) {
      try {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch {
        // ignore
      }
    }
  }, [activeIndex, flatMatches.length]);

  // Provide a function to know which mark is active
  const getIsActive = (messageId, occurrenceIndex) => {
    if (activeIndex < 0) return false;
    let cursor = 0;
    for (let i = 0; i < results.length; i += 1) {
      const r = results[i];
      const count = r.indices?.length || 0;
      if (r.messageId === messageId) {
        const localStart = cursor;
        const localEnd = cursor + count - 1;
        if (occurrenceIndex >= 0 && activeIndex >= localStart && activeIndex <= localEnd) {
          return activeIndex - localStart === occurrenceIndex;
        }
      }
      cursor += count;
    }
    return false;
  };

  return (
    <main ref={listRef} className="chat-window" role="main" aria-label="Chat messages">
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
        messages.map((m) => {
          const res = results.find((r) => r.messageId === m.id);
          const indices = res?.indices || [];
          return (
            <MessageBubble
              key={m.id}
              id={m.id}
              role={m.role}
              content={m.content}
              attachments={m.attachments}
              reactions={m.reactions}
              onToggleReaction={onToggleReaction}
              searchQuery={searchQuery}
              matchRanges={indices}
              getIsActive={getIsActive}
              activeTargetRef={activeTargetRef}
            />
          );
        })
      )}
      <div ref={endRef} aria-hidden="true" />
    </main>
  );
}
