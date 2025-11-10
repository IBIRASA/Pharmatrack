// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { I18nProvider } from './i18n';
import { ThemeProvider } from './context/ThemeContext';
// Register service worker (simple offline caching for landing page)
if ('serviceWorker' in navigator) {
  // Register in production or when running a file server. This is safe to call during dev but
  // some dev servers (like Vite) may interfere with hot-reload; we still register conditionally
  // so users who open the app locally get offline support after first visit.
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(() => {
        /* registration successful */
      })
      .catch(() => {
        /* registration failed (ignore) */
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <I18nProvider>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </I18nProvider>
    </AuthProvider>
  </React.StrictMode>
);
