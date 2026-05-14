/**
 * SimpliJS - The Python of JavaScript Frameworks
 * Copyright (c) 2026 Subhamoy Bhattacharjee
 */

import { reactive, effect, computed, watch, ref } from './reactive.js';
import { domPatch, html } from './renderer.js';
import { component } from './component.js';
import { createRouter } from './router.js';
import { createApp, hydrate, emit, on, bus, use, loadModule } from './core.js';
import { warn, error, fadeIn, fadeOut } from './utils.js';
import { useHead, setSEO, setJsonLd, setThemeColor, setSocialIcons, setBreadcrumbs } from './seo.js';
import { registerPWA } from './pwa.js';
import { registerUI } from './ui/components.js';
import { renderToString, renderToStaticMarkup } from './ssr.js';
import { use as bridge } from './bridge.js';
import { directives } from './directives.js';
import { initDevTools } from './devtools.js';

export const VERSION = 'v3.2.1';

export { reactive, effect, computed, watch, ref };
export { domPatch as render, domPatch, html };
export { component };
export { createRouter };
export { createApp, hydrate, emit, on, bus, use, loadModule };
export { warn, error, fadeIn, fadeOut };
export { useHead, setSEO, setJsonLd, setThemeColor, setSocialIcons, setBreadcrumbs };
export { registerPWA };
export { registerUI };
export { renderToString, renderToStaticMarkup };
export { bridge };
export { directives };
export { initDevTools };

const Simpli = {
    VERSION,
    reactive, effect, computed, watch, ref,
    render: domPatch, domPatch, html,
    component,
    createRouter,
    createApp, hydrate, emit, on, bus, use, loadModule,
    warn, error, fadeIn, fadeOut,
    useHead, setSEO, setJsonLd, setThemeColor, setSocialIcons, setBreadcrumbs,
    registerPWA,
    registerUI,
    renderToString, renderToStaticMarkup,
    bridge,
    directives,
    initDevTools
};

// Auto-initialize HTML-First and Global Object
if (typeof window !== 'undefined') {
  window.Simpli = Simpli;
  window.SimpliJS = Simpli;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => directives.init());
  } else {
    directives.init();
  }

  // Auto-init DevTools on localhost
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    initDevTools(Simpli);
  }

  // HTMX Integration
  if (window.htmx) {
    window.htmx.on('htmx:afterSwap', (event) => {
      hydrate(event.detail.target);
      directives.scan(event.detail.target);
    });
  }
}

export default Simpli;
