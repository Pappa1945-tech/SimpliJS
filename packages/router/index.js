/**
 * @simplijs/router
 * Professional declarative routing with nested routes, guards, and transitions.
 */

export function createRouter(routes, options = {}) {
  const rootElement = options.root || '#app';
  const mode = options.mode || 'hash';
  let transitionType = options.transition || null;
  let currentLayout = null;

  // Retrieve domPatch from global or import
  const { render } = window.Simpli || {};

  async function matchRoute(path) {
    // 1. Exact match
    if (routes[path]) return routes[path];

    // 2. Dynamic segments match (e.g. /user/:id)
    for (const routePath in routes) {
      if (routePath.includes(':')) {
        const regex = new RegExp('^' + routePath.replace(/:[^\s/]+/g, '([^/]+)') + '$');
        const match = path.match(regex);
        if (match) {
          const params = {};
          const keys = routePath.match(/:[^\s/]+/g);
          keys.forEach((key, i) => {
            params[key.slice(1)] = match[i + 1];
          });
          return { ...routes[routePath], params };
        }
      }
    }

    // 3. Fallback
    return routes['*'] || '<h1>404 Not Found</h1>';
  }

  async function handleRoute() {
    let path;
    if (mode === 'history') {
      path = window.location.pathname || '/';
    } else {
      const hash = window.location.hash || '#/';
      path = hash === '#/' ? '/' : hash.slice(1);
    }

    const route = await matchRoute(path);
    
    // Auth Guard
    if (route.guard) {
      const canProceed = await route.guard(path);
      if (!canProceed) return; // Guard should handle redirection
    }

    const container = typeof rootElement === 'string' ? document.querySelector(rootElement) : rootElement;
    if (!container) return;

    // Transition Out
    if (transitionType) {
      container.style.transition = 'opacity 0.2s ease-out, transform 0.2s ease-out';
      container.style.opacity = '0';
      if (transitionType === 'slide') container.style.transform = 'translateX(-20px)';
      await new Promise(r => setTimeout(r, 200));
    }

    // Handle Layouts
    let content = typeof route.component === 'function' ? await route.component(route.params) : route;
    if (typeof content === 'function') content = await content(route.params);
    
    if (render) {
      render(rootElement, content);
    } else {
      container.innerHTML = content;
    }

    // Scan for directives (HTML-First Reactivity)
    if (window.Simpli && window.Simpli.directives) {
      window.Simpli.directives.scan(container, window.Simpli.state || {});
    }

    // Execute embedded scripts
    const scripts = container.querySelectorAll('script');
    scripts.forEach(oldScript => {
      const newScript = document.createElement('script');
      Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode.replaceChild(newScript, oldScript);
    });

    // Transition In
    if (transitionType) {
      if (transitionType === 'slide') container.style.transform = 'translateX(20px)';
      requestAnimationFrame(() => {
        container.style.opacity = '1';
        container.style.transform = 'translateX(0)';
      });
    }

    // Update Head/SEO if integrated
    if (route.title && window.Simpli && window.Simpli.useHead) {
      window.Simpli.useHead({ title: route.title });
    }
  }

  if (typeof window !== 'undefined') {
    if (mode === 'history') {
      window.addEventListener('popstate', handleRoute);
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
    handleRoute();
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
