import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    server: {
    // Add your domain(s) here. You can use strings or RegExp.
    allowedHosts: ["ravens-mac-studio.raven-locrian.ts.net"],

    // Optional: if you're proxying or binding to a specific host/port
    // host: "0.0.0.0",
    port: 5174,
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Skull King Scorekeeper',
        short_name: 'SkullKing',
        start_url: '/',
        display: 'standalone',
        background_color: '#0b132b',
        theme_color: '#1c2541',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
        ]
      }
    })
  ]
});