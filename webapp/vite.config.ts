import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    VitePWA({
      disable: mode === 'demo',
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'icons/*.png', 'fonts/*.ttf'],
      manifest: {
        id: '/',
        name: 'Gioco degli Aggettivi',
        short_name: 'Aggettivi',
        description: 'Una parola, una lettera e i tuoi cinque aggettivi. Il gioco delle affinità.',
        lang: 'it',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#f8f7f2',
        theme_color: '#f8f7f2',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,ttf}'],
        navigateFallbackDenylist: [/^\/api\//, /^\/auth\//],
        cleanupOutdatedCaches: true,
      },
    }),
  ],
}));
