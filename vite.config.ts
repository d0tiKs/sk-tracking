import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/sk-tracking/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate', // auto-update SW
      includeAssets: [
        'favicon.svg',
        'offline.html',
        'icons/icon-192.png',
        'icons/icon-512.png'
      ],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,json}'],
        navigateFallback: 'offline.html',
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pages',
              expiration: { maxEntries: 50 }
            }
          },
          {
            urlPattern: ({ request }) =>
              ['style', 'script', 'worker'].includes(request.destination),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'assets'
            }
          },
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 50 }
            }
          }
        ]
      },
      manifest: {
        name: 'Skull King Scorekeeper',
        short_name: 'SkullKing',
        start_url: '/sk-tracking/',
        scope: '/sk-tracking/',
        display: 'standalone',
        display_override: ['standalone', 'browser'],
        background_color: '#0b132b',
        theme_color: '#1c2541',
        description: 'A PWA for tracking Skull King game scores',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        categories: ['games', 'entertainment'],
        lang: 'en',
        dir: 'ltr',
        orientation: 'any',
        prefer_related_applications: false
      },
      devOptions: {
        enabled: true,
        navigateFallback: 'index.html'
      },
      srcDir: 'src',
      filename: 'serviceWorker.ts'
    })
  ]
});