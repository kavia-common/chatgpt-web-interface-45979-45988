import React from 'react';

// PUBLIC_INTERFACE
export default function Header() {
  /** Branded header to match design (title-only), no dev markers or extra controls */
  return (
    <header
      className="app-header"
      aria-label="Application header"
      role="banner"
      data-qa="header"
    >
      <div className="brand" style={{ gap: 12 }}>
        <div className="logo" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 5v-5H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"></path>
          </svg>
        </div>
        <div className="titles">
          <h1 className="app-title" style={{ margin: 0 }}>ChatGPT</h1>
        </div>
      </div>
    </header>
  );
}
