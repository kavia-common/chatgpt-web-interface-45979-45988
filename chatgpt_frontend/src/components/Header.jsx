import React from 'react';

// PUBLIC_INTERFACE
export default function Header({ theme, onToggleTheme }) {
  /** Branded header with theme toggle */
  return (
    <header
      className="app-header"
      aria-label="Application Header"
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
          <h1 className="app-title">ChatGPT Web</h1>
          <p className="app-subtitle">Ocean Professional</p>
        </div>
      </div>
      <button
        className="btn btn-secondary"
        type="button"
        onClick={onToggleTheme}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>
    </header>
  );
}
