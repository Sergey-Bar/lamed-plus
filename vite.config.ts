import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  base: '',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['lamed-icon.svg', 'favicon.svg'],
      manifest: {
        name: 'LAMED+ — לומדים נכון. עוברים בטוח.',
        short_name: 'LAMED+',
        description:
          'הכנה חכמה למבחן התיאוריה: שיעורים, תרגול מותאם, מבחני דמה רשמיים ומעקב מוכנות — בעברית, אנגלית, רוסית וערבית.',
        lang: 'he',
        categories: ['education', 'productivity'],
        display: 'standalone',
        start_url: '.',
        theme_color: '#F7F8FA',
        background_color: '#F7F8FA',
        icons: [
          {
            src: 'lamed-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,woff2,json}'],
        // The official bank and its images are content, not app shell. Keeping
        // them out of the install-time precache makes the first visit much
        // lighter; each topic chunk and image is cached on demand instead.
        globIgnores: [
          '**/laws-*.js',
          '**/signs-*.js',
          '**/safety-*.js',
          '**/vehicle-*.js',
          '**/a3-*.js',
          '**/assets/official/**',
        ],
        runtimeCaching: [
          {
            urlPattern: /\/assets\/(laws|signs|safety|vehicle|a3)-.*\.js$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'lamed-bank',
              expiration: {
                maxEntries: 40,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
            },
          },
          {
            urlPattern: /\/assets\/official\/.*\.(?:png|jpe?g|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'lamed-images',
              expiration: {
                maxEntries: 600,
                maxAgeSeconds: 60 * 60 * 24 * 180,
              },
            },
          },
        ],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: 'index.html',
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['src/test/setup.ts'],
    coverage: {
      // CI reads coverage/coverage-summary.json to enforce the 80% line threshold.
      reporter: ['text', 'json-summary', 'html'],
    },
  },
  build: {
    // The official bank is split into large JSON data chunks by design.
    chunkSizeWarningLimit: 700,
  },
})
