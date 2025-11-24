import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Global styles: variables, resets, tokens (must load before App)
import App from './App';

const rootEl = document.documentElement;
if (!rootEl.getAttribute('data-theme')) {
  rootEl.setAttribute('data-theme', 'light');
}
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
