import React from 'react';

// PUBLIC_INTERFACE
export default function Header({ theme, onToggleTheme }) {
  /** Branded header with theme toggle */
  return (
    <header
      className="app-header"
      aria-label="Application Header"
    >
      <div className="brand">
        <div className="logo" aria-hidden="true">💬</div>
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
      >
        {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
      </button>
    </header>
  );
}
