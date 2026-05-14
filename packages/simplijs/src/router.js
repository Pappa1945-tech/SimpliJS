import { domPatch } from './renderer.js';

export function createRouter(routes, options = {}) {
  const rootElement = options.root || '#app';
  const mode = options.mode || 'hash'; // 'hash' or 'history'
  const activeClass = options.activeClass || 'active';
  let transitionType = null;
  let currentPath = '';
  
  // Register routes globally for SSG crawler
  if (typeof window !== 'undefined') {
    window._simpliRoutes = routes;
  }

  function updateActiveLinks(path) {
    document.querySelectorAll('a[s-link], [s-link]').forEach(el => {
      const to = el.getAttribute('s-link') || el.getAttribute('href');
      if (to) el.classList.toggle(activeClass, to === path || (to !== '/' && path.startsWith(to)));
    });
  }

  async function handleRoute() {
    let path;
    if (mode === 'history') {
      path = window.location.pathname || '/';
    } else {
      const hash = window.location.hash || '#/';
      path = hash === '#/' ? '/' : hash.slice(1);
    }
    
    currentPath = path;
    updateActiveLinks(path);

    let route = routes[path] || routes['#' + path];
    
    // Check for dynamic routes /:id
    let params = {};
    if (!route) {
      for (const r in routes) {
        if (r.includes(':')) {
          const regex = new RegExp('^' + r.replace(/:[^\s/]+/g, '([\\w-]+)') + '$');
          const match = path.match(regex);
          if (match) {
            route = routes[r];
            const keys = r.match(/:[^\s/]+/g);
            keys.forEach((key, i) => {
              params[key.slice(1)] = match[i + 1];
            });
            break;
          }
        }
      }
    }

    // File-based routing fallback
    if (!route && path.startsWith('/')) {
      const fileName = path === '/' ? 'index' : path.slice(1);
      try {
        const response = await fetch(`pages/${fileName}.html`);
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
      // Support for Loaders
      if (route.loader && typeof route.loader === 'function') {
         await route.loader();
      }

      const content = typeof route === 'function' ? await route(params) : (route.template || route);
      
      if (typeof content === 'string') {
        domPatch(rootElement, content);
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
      document.addEventListener('click', e => {
        const link = e.target.closest('a[s-link]') || e.target.closest('a');
        if (link && link.href && link.origin === window.location.origin && 
            link.getAttribute('target') !== '_blank' && !link.hasAttribute('data-native')) {
          e.preventDefault();
          const to = link.getAttribute('s-link') || link.pathname;
          window.history.pushState({}, '', to);
          handleRoute();
        }
      });
    } else {
      window.addEventListener('hashchange', handleRoute);
    }
    window.addEventListener('load', handleRoute);
  }
  
  const router = {
    mode,
    currentPath: () => currentPath,
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

  if (typeof window !== 'undefined') window.SimpliRouter = router;
  return router;
}
