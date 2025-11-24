import React from 'react';

// PUBLIC_INTERFACE
export default function Header() {
  /** Title-only header per reference screenshot */
  return (
    <header className="app-header" aria-label="Application header" role="banner">
      <div className="brand">
        <div className="logo" aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M4 4h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H9l-5 5v-5H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"></path>
          </svg>
        </div>
        <h1 className="app-title">ChatGPT · Ocean</h1>
      </div>
    </header>
  );
}
