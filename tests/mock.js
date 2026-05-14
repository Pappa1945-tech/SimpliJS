// tests/mock.js
/**
 * SimpliJS Test Mock Environment
 * Provides minimal DOM API for Node.js testing
 */

global.Node = class {
  static ELEMENT_NODE = 1;
  static TEXT_NODE = 3;
};

global.window = {
  location: { hash: '' },
  addEventListener: (name, cb) => {
    window._listeners = window._listeners || {};
    window._listeners[name] = window._listeners[name] || [];
    window._listeners[name].push(cb);
  },
  dispatchEvent: (event) => {
    if (window._listeners && window._listeners[event.type]) {
      window._listeners[event.type].forEach(cb => cb(event));
    }
  },
  CustomEvent: class { constructor(name, detail) { this.type = name; this.detail = detail; } }
};
global.Event = class { constructor(type) { this.type = type; } };

global.document = {
  readyState: 'complete',
  addEventListener: () => {},
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: (tag) => {
    const el = {
      tagName: tag.toUpperCase(),
      attributes: [],
      childNodes: [],
      style: {},
      classList: {
        add: () => {},
        remove: () => {},
        toggle: () => {}
      },
      hasAttribute: () => false,
      getAttribute: () => null,
      setAttribute: () => {},
      removeAttribute: () => {},
      appendChild: function(n) { n.parentNode = this; this.childNodes.push(n); },
      removeChild: function(n) { this.childNodes = this.childNodes.filter(c => c !== n); },
      replaceWith: function(n) { if (this.parentNode) { const idx = this.parentNode.childNodes.indexOf(this); this.parentNode.childNodes[idx] = n; n.parentNode = this.parentNode; } },
      cloneNode: function() { return { ...this, attributes: [...this.attributes], childNodes: [...this.childNodes] }; },
      closest: function(selector) {
        if (selector === '[data-hydrating]' && this.hasAttribute('data-hydrating')) return this;
        return null;
      }
    };
    if (tag.toLowerCase() === 'template') {
      el.content = { childNodes: [] };
      Object.defineProperty(el, 'innerHTML', {
        set(val) {
          // Simple mock: treat as one text node if not empty
          if (val) this.content.childNodes = [{ nodeType: 1, tagName: 'H1', childNodes: [], attributes: [], cloneNode: function() { return this; } }];
        }
      });
    }
    return el;
  },
  createComment: (text) => ({ nodeType: 8, textContent: text })
};

global.HTMLElement = class {};
global.customElements = {
  get: () => false,
  define: () => {}
};

global.EventTarget = class {
  addEventListener() {}
  dispatchEvent() {}
  removeEventListener() {}
};

global.CustomEvent = global.window.CustomEvent;
global.requestAnimationFrame = (callback) => setTimeout(callback, 0);

console.log('✅ DOM Mock Environment Initialized');
