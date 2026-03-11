import { domPatch } from './renderer.js';
import { effect } from './reactive.js';
import { warn } from './utils.js';

export function createApp(rootSelector) {
  let viewFn = null;

  return {
    view(fn) {
      viewFn = fn;
      return this;
    },
    mount() {
      const root = document.querySelector(rootSelector);
      if (!root) {
        console.error(`[SimpliJS error]: Root element ${rootSelector} not found.`);
        return;
      }
      
      if (viewFn) {
        effect(() => {
          domPatch(root, viewFn());
        });
      }
    },
    form(options) {
      return async (e) => {
        e.preventDefault();
        const data = {};
        const formData = new FormData(e.target);
        let hasErrors = false;
        
        options.fields.forEach(field => {
          data[field] = formData.get(field);
          if (options.validate && options.validate[field]) {
            const error = options.validate[field](data[field], data);
            if (error) {
              warn(`Validation failed for '${field}'`, error);
              hasErrors = true;
            }
          }
        });

        if (!hasErrors && options.submit) {
          await options.submit(data);
        }
      };
    }
  }
}

export function hydrate(rootElement = document) {
  const elements = rootElement.querySelectorAll('[simpli-island]');
  elements.forEach(el => {
    const componentName = el.getAttribute('simpli-island');
    if (!componentName) return;
    
    // Note: To fully support this, components need to be globally accessible
    // or registered. SimpliJS uses Custom Elements, which handle their own
    // hydration when connected to the DOM, but for explicitly manual hydration 
    // we could dynamically create the custom element tag:
    if (!el.hasAttribute('data-hydrated')) {
      const loadStrategy = 
        el.hasAttribute('data-client:idle') ? 'idle' :
        el.hasAttribute('data-client:visible') ? 'visible' : 'load';
        
      const doHydrate = () => {
        const customElement = document.createElement(componentName);
        // Move children if needed
        while (el.firstChild) customElement.appendChild(el.firstChild);
        el.replaceWith(customElement);
        customElement.setAttribute('data-hydrated', 'true');
      };

      if (loadStrategy === 'idle' && 'requestIdleCallback' in window) {
        requestIdleCallback(doHydrate);
      } else if (loadStrategy === 'visible' && 'IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            doHydrate();
            observer.disconnect();
          }
        });
        observer.observe(el);
      } else {
        doHydrate();
      }
    }
  });
}
