export const VERSION = 'v1.0.0-alpha';

export { reactive, effect, computed, watch, ref } from './reactive.js';
export { domPatch as render, domPatch } from './renderer.js';
export { component } from './component.js';
export { createRouter } from './router.js';
export { createApp, hydrate, emit, on, bus } from './core.js';
export { warn, error, fadeIn, fadeOut } from './utils.js';
export { useHead, setSEO, setJsonLd, setThemeColor, setSocialIcons, setBreadcrumbs } from './seo.js';
export { renderToString, renderToStaticMarkup } from './ssr.js';
export { use } from './bridge.js';
export { directives } from './directives.js';

import { hydrate } from './core.js';
import { directives } from './directives.js';

// Auto-initialize HTML-First
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => directives.init());
  } else {
    directives.init();
  }
}

// HTMX Integration
if (typeof window !== 'undefined' && window.htmx) {
  window.htmx.on('htmx:afterSwap', (event) => {
    hydrate(event.detail.target);
    directives.scan(event.detail.target);
  });
}
