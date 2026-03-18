export function createRouter(routes, options = {}) {
  const rootElement = options.root || '#app';
  const mode = options.mode || 'hash'; // 'hash' or 'history'
  let transitionType = null;
  
  // Register routes globally for SSG crawler
  if (typeof window !== 'undefined') {
    window._simpliRoutes = routes;
  }

  async function handleRoute() {
    let path;
    if (mode === 'history') {
      path = window.location.pathname || '/';
    } else {
      const hash = window.location.hash || '#/';
      path = hash === '#/' ? '/' : hash.slice(1);
    }
    
    let route = routes[path] || routes['#' + path];
    
    // File-based routing fallback
    if (!route && path.startsWith('/')) {
      const fileName = path === '/' ? 'index' : path.slice(1);
      try {
        const response = await fetch(`/pages/${fileName}.html`);
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
      if (transitionType === 'slide') container.style.transform = 'translateX(20px)';
      requestAnimationFrame(() => {
        container.style.opacity = '1';
        container.style.transform = 'translateX(0)';
      });
    }
  }

  if (typeof window !== 'undefined') {
    if (mode === 'history') {
      window.addEventListener('popstate', handleRoute);
      // Intercept clicks on links for History API
      document.addEventListener('click', e => {
        const link = e.target.closest('a');
        if (link && link.href && link.origin === window.location.origin && 
            link.getAttribute('target') !== '_blank' && !link.hasAttribute('data-native')) {
          e.preventDefault();
          window.history.pushState({}, '', link.pathname);
          handleRoute();
        }
      });
    } else {
      window.addEventListener('hashchange', handleRoute);
    }
    window.addEventListener('load', handleRoute);
  }
  
  return {
    navigate(path) {
      if (mode === 'history') {
        window.history.pushState({}, '', path);
        handleRoute();
      } else {
        window.location.hash = path.startsWith('#') ? path : '#' + path;
      }
    },
    transition(type) {
      transitionType = type;
      return this;
    }
  };
}
