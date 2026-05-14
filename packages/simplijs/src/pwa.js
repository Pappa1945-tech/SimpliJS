/**
 * SimpliJS PWA Module
 * Handles Manifest generation and Service Worker registration
 */
export function registerPWA(options = {}) {
  if (typeof window === 'undefined') return;

  const config = {
    name: document.title || 'SimpliJS App',
    short_name: 'Simpli',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [],
    ...options
  };

  // 1. Generate/Update Manifest
  let manifest = document.querySelector('link[rel="manifest"]');
  if (!manifest) {
    manifest = document.createElement('link');
    manifest.rel = 'manifest';
    document.head.appendChild(manifest);
  }
  
  const manifestContent = {
    name: config.name,
    short_name: config.short_name,
    start_url: config.start_url,
    display: config.display,
    background_color: config.background_color,
    theme_color: config.theme_color,
    icons: config.icons.length ? config.icons : [
      { src: '/icon.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
    ]
  };
  
  manifest.href = 'data:application/json;base64,' + btoa(JSON.stringify(manifestContent));

  // 2. Register Service Worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register(options.swPath || '/sw.js').then(reg => {
        // console.log('[SimpliJS PWA] Service Worker registered');
      }).catch(err => {
        // console.warn('[SimpliJS PWA] SW registration failed:', err);
      });
    });
  }
}
