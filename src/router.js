import { domPatch } from './renderer.js';

export function createRouter(routes, rootElement = '#app') {
  let transitionType = null;
  
  async function handleRoute() {
    const hash = window.location.hash || '#/';
    let route = routes[hash];
    
    // File-based routing fallback
    if (!route && hash.startsWith('#/')) {
      const path = hash === '#/' ? 'index' : hash.slice(2);
      try {
        const response = await fetch(`/pages/${path}.html`);
        if (response.ok) {
          route = await response.text();
        } else {
          route = routes['*'] || '<h1>404 Not Found</h1>';
        }
      } catch (e) {
        route = routes['*'] || '<h1>404 Not Found</h1>';
      }
    } else if (!route) {
        route = routes['*'] || '<h1>404 Not Found</h1>';
    }

    const container = typeof rootElement === 'string' ? document.querySelector(rootElement) : rootElement;
    
    if (transitionType && container) {
      // Fade/slide out
      container.style.transition = 'opacity 0.2s ease-out, transform 0.2s ease-out';
      container.style.opacity = '0';
      if (transitionType === 'slide') container.style.transform = 'translateX(-20px)';
      await new Promise(r => setTimeout(r, 200));
    }

    if (route) {
      if (typeof route === 'function') {
        const result = await route();
        if (typeof result === 'string') {
          domPatch(rootElement, result);
        }
      } else {
        domPatch(rootElement, route);
      }
    }

    if (transitionType && container) {
      // Fade/slide in
      if (transitionType === 'slide') container.style.transform = 'translateX(20px)';
      
      requestAnimationFrame(() => {
        container.style.opacity = '1';
        container.style.transform = 'translateX(0)';
      });
    }
  }

  window.addEventListener('hashchange', handleRoute);
  window.addEventListener('load', handleRoute); // Initial load
  
  return {
    navigate(hash) {
      window.location.hash = hash;
    },
    transition(type) {
      transitionType = type;
      return this;
    }
  };
}
