import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Vyloc is a money-transfer wallet. The service worker is deliberately
// conservative: it makes the app installable and lets the static shell load
// offline, but it must NEVER serve financial data (wallet balance,
// transactions, M-Pesa status) from cache. Every /api/* call is NetworkOnly,
// so an offline or degraded network surfaces as an explicit error in the UI
// instead of a stale-but-plausible number.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'autoUpdate': a new deployment's service worker installs and activates
      // as soon as it is detected, so users are never stuck behind a stale SW.
      registerType: 'autoUpdate',
      injectRegister: 'auto',

      // Service workers do not register in `vite` dev mode here; test with a
      // production build (`npm run build && npm run preview`).
      devOptions: {
        enabled: false,
      },

      includeAssets: ['favicon.ico', 'favicon.svg', 'apple-touch-icon.png'],

      manifest: {
        name: 'Vyloc — Money Transfer & Wallet',
        short_name: 'Vyloc',
        description:
          'Send money, top up with M-Pesa, and manage your Vyloc wallet.',
        // Brand palette from src/index.css:
        //   --emerald-500 #00C896 (primary action colour)
        //   --navy-950    #0A0F24 (Splash background)
        theme_color: '#00C896',
        background_color: '#0A0F24',
        display: 'standalone',
        orientation: 'portrait',
        // The app is served from the domain root on Vercel (see vercel.json).
        id: '/',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'pwa-maskable-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'pwa-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },

      workbox: {
        // Precache the built app shell. Vite fingerprints these filenames, so
        // caching them aggressively is safe — a new build produces new names.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,

        // Offline SPA navigation falls back to the cached index.html, but the
        // API is never treated as a navigation.
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/^\/api\//],

        runtimeCaching: [
          {
            // FINANCIAL DATA — wallet, transactions, M-Pesa, everything under
            // /api/*. NetworkOnly: no response is ever read from or written to
            // the cache, so a cached balance or transaction list can never be
            // shown as current. Offline => the request rejects => the screen
            // shows its error / offline state.
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkOnly',
            method: 'GET',
          },
          {
            // Non-GET API calls (transfers, STK push, reconcile) — also never
            // cached or replayed.
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkOnly',
            method: 'POST',
          },
          {
            // Google Fonts stylesheet — refresh in the background, usable
            // offline once fetched.
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
            },
          },
          {
            // Google Fonts webfont files — immutable, cache-first for a year.
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Same-origin build assets (scripts, styles, fonts, images). These
            // are content-hashed by Vite, so cache-first is safe and fast.
            urlPattern: ({ url, sameOrigin }) =>
              sameOrigin &&
              !url.pathname.startsWith('/api/') &&
              /\.(?:js|css|woff2?|png|svg|ico|jpg|jpeg|webp|gif)$/.test(url.pathname),
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: {
                maxEntries: 80,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
    css: true,
  },
});
