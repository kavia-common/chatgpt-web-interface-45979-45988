import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Ensure global CSS is always loaded at the entrypoint
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
