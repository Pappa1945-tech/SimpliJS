/**
 * SimpliJS - The Python of JavaScript Frameworks
 * Copyright (c) 2026 Subhamoy Bhattacharjee
 * Website: https://www.sbtech.co.in
 * 
 * Licensed under Apache License 2.0
 * See LICENSE file for full terms
 * 
 * @author Subhamoy Bhattacharjee
 * @website https://www.sbtech.co.in
 * @repository https://github.com/Pappa1945-tech/SimpliJS
 */
import { domPatch } from './renderer.js';
import { effect } from './reactive.js';
import { warn } from './utils.js';

export const bus = (function() {
  const target = new EventTarget();
  const listeners = new WeakMap();
  return {
    on(event, callback) {
      const handler = (e) => callback(e.detail);
      listeners.set(callback, handler);
      target.addEventListener(event, handler);
    },
    emit(event, data) {
      target.dispatchEvent(new CustomEvent(event, { detail: data }));
    },
    off(event, callback) {
      const handler = listeners.get(callback);
      if (handler) target.removeEventListener(event, handler);
    }
  };
})();

export const emit = bus.emit;
export const on = bus.on;

export function createApp(rootSelector) {
  let viewFn = null;

  return {
    bus,
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
        const errors = {};
        
        Array.from(e.target.elements).forEach(el => el.classList.remove('is-invalid'));

        options.fields.forEach(field => {
          data[field] = formData.get(field);
          if (options.validate && options.validate[field]) {
            const error = options.validate[field](data[field], data);
            if (error) {
              warn(`Validation failed for '${field}'`, error);
              hasErrors = true;
              errors[field] = error;
              
              const fieldEl = e.target.elements[field];
              if (fieldEl) fieldEl.classList.add('is-invalid');
            }
          }
        });

        if (hasErrors && options.onError) {
          options.onError(errors);
        }

        if (!hasErrors && options.submit) {
          if (options.onError) options.onError({});
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
