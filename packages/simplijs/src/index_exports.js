export const VERSION = 'v3.2.0';

export { reactive, effect, computed, watch, ref } from './reactive.js';
export { domPatch as render, domPatch, html } from './renderer.js';
export { component } from './component.js';
export { createRouter } from './router.js';
export { createApp, hydrate, emit, on, bus } from './core.js';
export { warn, error, fadeIn, fadeOut } from './utils.js';
export { useHead, setSEO, setJsonLd, setThemeColor, setSocialIcons, setBreadcrumbs } from './seo.js';
export { renderToString, renderToStaticMarkup } from './ssr.js';
export { use } from './bridge.js';
export { directives } from './directives.js';
