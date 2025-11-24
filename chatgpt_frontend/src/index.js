import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Global styles: variables, resets, tokens (must load before App)
import App from './App';

// no-op export to force rebuild fingerprint when file changes
export const __build_touch__ = 'v2';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
