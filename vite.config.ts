import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
      manifest: {
        name: 'LocalTutor',
        short_name: 'Tutor',
        description: 'Private, 100% browser-based adaptive AI learning tutor using WebLLM, Transformers.js, and IndexedDB.',
        theme_color: '#863bff',
        background_color: '#f8f9fa',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024, // 15 MiB to allow app bundle with inlined dependencies
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallback: '/index.html',
        // Ensure workbox does not attempt to cache or intercept large model weights or HuggingFace / MLC CDN downloads
        navigateFallbackDenylist: [/^\/api/],
        runtimeCaching: [
          {
            urlPattern: ({ url }) =>
              url.hostname.includes('huggingface.co') ||
              url.hostname.includes('hf.co') ||
              url.hostname.includes('raw.githubusercontent.com') ||
              url.hostname.includes('cdn.jsdelivr.net'),
            handler: 'NetworkOnly'
          }
        ]
      }
    })
  ],
  optimizeDeps: {
    exclude: ['@huggingface/transformers']
  }
})
