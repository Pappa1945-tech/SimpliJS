import * as Simpli from './index_exports.js';
export * from './index_exports.js';

// Auto-initialize HTML-First and Global Object
if (typeof window !== 'undefined') {
  window.Simpli = Simpli;
  const { directives } = Simpli;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => directives.init());
  } else {
    directives.init();
  }

  // HTMX Integration
  if (window.htmx) {
    window.htmx.on('htmx:afterSwap', (event) => {
      Simpli.hydrate(event.detail.target);
      directives.scan(event.detail.target);
    });
  }
}
