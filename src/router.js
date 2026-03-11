import { render } from './renderer.js';

export function createRouter(routes, rootElement = '#app') {
  function handleRoute() {
    const hash = window.location.hash || '#/';
    const route = routes[hash] || routes['*'];
    if (route) {
      if (typeof route === 'function') {
        const result = route();
        if (typeof result === 'string') {
          render(rootElement, result);
        }
      } else {
        render(rootElement, route);
      }
    } else {
      render(rootElement, '<h1>404 Not Found</h1>');
    }
  }

  window.addEventListener('hashchange', handleRoute);
  window.addEventListener('load', handleRoute); // Initial load
  
  return {
    navigate(hash) {
      window.location.hash = hash;
    }
  };
}
