export const VERSION = '0.1.0';

export { reactive, effect, computed, watch, ref } from './reactive.js';
export { domPatch as render, domPatch } from './renderer.js';
export { component } from './component.js';
export { createRouter } from './router.js';
export { createApp, hydrate, emit, on, bus } from './core.js';
export { warn, error, fadeIn, fadeOut } from './utils.js';
export { use } from './bridge.js';

import { hydrate } from './core.js';

// HTMX Integration
if (typeof window !== 'undefined' && window.htmx) {
  window.htmx.on('htmx:afterSwap', (event) => {
    hydrate(event.detail.target);
  });
}
