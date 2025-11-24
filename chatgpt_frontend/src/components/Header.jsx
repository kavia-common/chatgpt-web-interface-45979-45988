import React from 'react';

// PUBLIC_INTERFACE
export default function Header({
  searchQuery = '',
  setSearchQuery,
  clearSearch,
  nextResult,
  prevResult,
  activeIndex = -1,
  results = [],
}) {
  /** Compact header with brand and inline search bar with navigation and keyboard shortcuts */
  const inputRef = React.useRef(null);

  // Global Cmd/Ctrl+F to focus search
  React.useEffect(() => {
    const onKey = (e) => {
      const meta = e.ctrlKey || e.metaKey;
      if (meta && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Shortcut handling on input
  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      clearSearch && clearSearch();
      inputRef.current?.blur();
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        prevResult && prevResult();
      } else {
        nextResult && nextResult();
      }
    }
  };

  const totalMatches = React.useMemo(
    () => results.reduce((acc, r) => acc + (r.indices?.length || 0), 0),
    [results]
  );

  const counterText =
    totalMatches > 0 && activeIndex >= 0
      ? `${activeIndex + 1}/${totalMatches}`
      : totalMatches > 0
      ? `0/${totalMatches}`
      : '';

  return (
    <header className="app-header" aria-label="Application header" role="banner">
      <div className="brand" style={{ justifyContent: 'space-between', width: '100%' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <div className="logo" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 5v-5H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"></path>
            </svg>
          </div>
          <h1 className="app-title">ChatGPT · Ocean</h1>
        </div>

        <div
          className="search-bar"
          role="search"
          aria-label="Search messages"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            height: 34,
            padding: '0 8px',
            minWidth: 200,
            maxWidth: 360,
            width: '55%',
            borderRadius: 999,
            background: 'var(--surface)',
            border: '1px solid color-mix(in srgb, var(--border), var(--color-primary) 15%)',
            boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.04)',
          }}
        >
          <span aria-hidden="true" style={{ opacity: 0.85, fontSize: 14 }}>🔎</span>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search messages"
            aria-label="Search messages"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              color: 'var(--text)',
              fontSize: '13.5px',
            }}
          />
          <div aria-live="polite" style={{ fontSize: 12, color: 'var(--muted)' }}>
            {counterText}
          </div>
          <div className="search-nav" role="group" aria-label="Search navigation" style={{ display: 'inline-flex', gap: 2 }}>
            <button
              type="button"
              className="btn btn-ghost"
              aria-label="Previous match (Shift+Enter)"
              title="Previous (Shift+Enter)"
              onClick={prevResult}
              style={{ height: 28, minWidth: 34, padding: '0 8px', borderRadius: 10 }}
            >
              ◀
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              aria-label="Next match (Enter)"
              title="Next (Enter)"
              onClick={nextResult}
              style={{ height: 28, minWidth: 34, padding: '0 8px', borderRadius: 10 }}
            >
              ▶
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
