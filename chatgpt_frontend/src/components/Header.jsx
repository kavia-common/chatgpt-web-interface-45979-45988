import React from 'react';

// PUBLIC_INTERFACE
export default function Header() {
  /** Branded header to match design (no subtitle/version, no visible theme toggle) */
  return (
    <header
      className="app-header"
      aria-label="Application header"
      role="banner"
    >
      <div className="brand">
        <div className="logo" aria-hidden="true">
          {/* Simple chat bubble icon */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 5v-5H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"></path>
          </svg>
        </div>
        <div className="titles">
          <h1 className="app-title" style={{ margin: 0 }}>ChatGPT Web</h1>
        </div>
      </div>
      {/* Theme toggle intentionally hidden to match screenshot */}
      <div style={{ width: 1, height: 1, overflow: 'hidden' }} aria-hidden="true" />
    </header>
  );
}
