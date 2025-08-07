import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// ✅ Import vite-plugin-pwa's virtual register helper
import { registerSW } from 'virtual:pwa-register';

// This will prompt the user when a new version is available
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('A new version is available. Reload now?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('App is ready to work offline');
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);