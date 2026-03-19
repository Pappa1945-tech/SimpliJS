/**
 * SimpliJS - HTML-First Directives Engine v1.0.0
 */
import { reactive, effect, watch } from './reactive.js';
import { hydrate } from './core.js';

const globalState = reactive({});
console.log("🚀 [SimpliJS] HTML-First Engine v1.0.0 Initialized");

export class SimpliDirectives {
  constructor() {
    this.dir = new Map();
    this.reg();
  }

  reg() {
    this.dir.set('s-state', (el, val, state) => {
      const data = this.eval(val, state);
      const childState = reactive(Object.create(state));
      if (data && typeof data === 'object') Object.assign(childState, data);
      el.__simpliState = childState;
      return childState;
    });
    this.dir.set('s-global', (el, val) => {
      const data = this.eval(val, globalState);
      if (data && typeof data === 'object') Object.assign(globalState, data);
    });
    this.dir.set('s-text', (el, val, state) => effect(() => el.textContent = this.eval(val, state, null, true) ?? ''));
    this.dir.set('s-html', (el, val, state) => effect(() => el.innerHTML = this.eval(val, state) ?? ''));
    this.dir.set('s-value', (el, val, state) => effect(() => el.value = this.eval(val, state) ?? ''));
    this.dir.set('s-bind', (el, val, state) => {
      effect(() => el.value = this.eval(val, state) ?? '');
      el.addEventListener('input', () => this.set(state, val, el.value));
    });
    this.dir.set('s-model', (el, val, state) => {
      effect(() => {
        const value = this.eval(val, state);
        if (el.type === 'checkbox') el.checked = !!value;
        else if (el.type === 'radio') el.checked = el.value === value;
        else el.value = value ?? '';
      });
      el.addEventListener('change', () => this.set(state, val, el.type === 'checkbox' ? el.checked : el.value));
    });
    this.dir.set('s-click', (el, val, state) => el.addEventListener('click', () => this.eval(val, state, el)));
    this.dir.set('s-submit', (el, val, state) => el.addEventListener('submit', (e) => { e.preventDefault(); this.eval(val, state, el); }));
    this.dir.set('s-key', (el, val, state, name) => {
      const key = name.split(':')[1];
      if (key) el.addEventListener('keydown', (ev) => { if (ev.key.toLowerCase() === key.toLowerCase()) this.eval(val, state, el); });
    });
    this.dir.set('s-hover', (el, val, state) => el.addEventListener('mouseenter', () => this.eval(val, state, el)));
    this.dir.set('s-class', (el, val, state) => effect(() => {
      const classes = this.eval(val, state);
      if (typeof classes === 'object') for (const k in classes) el.classList.toggle(k, !!classes[k]);
    }));
    this.dir.set('s-style', (el, val, state) => effect(() => {
      const styles = this.eval(val, state);
      if (typeof styles === 'object') for (const k in styles) el.style[k] = styles[k];
    }));
    this.dir.set('s-fetch', (el, val, state) => effect(() => {
      const url = this.eval(val, state);
      if (!url || typeof url !== 'string') return;
      state.loading = true; state.error = null;
      fetch(url).then(r => {
        if (!r.ok) throw Error(`HTTP ${r.status}`);
        const ct = r.headers.get('content-type');
        if (!ct || !ct.includes('application/json')) throw Error('Not JSON');
        return r.json();
      }).then(data => { state.data = data; state.loading = false; })
        .catch(err => { state.error = err.message; state.loading = false; });
    }));
    this.dir.set('s-attr', (el, val, state, name) => {
      const attrName = name.split(':')[1];
      if (attrName) effect(() => el.setAttribute(attrName, this.eval(val, state)));
    });
    this.dir.set('s-hide', (el, val, state) => effect(() => el.style.display = this.eval(val, state) ? 'none' : ''));
    this.dir.set('s-change', (el, val, state) => el.addEventListener('change', (e) => this.eval(val, state, el)));
    this.dir.set('s-input', (el, val, state) => el.addEventListener('input', (e) => this.eval(val, state, el)));
    this.dir.set('s-memo', (el, val) => el.__hasMemo = val);
    this.dir.set('s-ref', (el, val, state) => state[val] = el);
    this.dir.set('s-for', (el, val, state) => {
      const match = val.match(/(.+)\s+in\s+(.+)/);
      if (!match || !el.parentNode) return;
      const [_, itemExp, listVar] = match;
      const template = el.cloneNode(true); template.removeAttribute('s-for');
      const anchor = document.createComment(`s-for: ${val}`);
      el.parentNode.replaceChild(anchor, el);
      let nodesMap = new Map();
      effect(() => {
        const list = this.eval(listVar, state) || [];
        const nextNodesMap = new Map();
        const keyExp = template.getAttribute('s-key');
        list.forEach((item, index) => {
          const itemState = reactive(Object.create(state));
          if (itemExp.includes(',')) {
            const [valVar, idxVar] = itemExp.split(',').map(s => s.trim());
            itemState[valVar] = item; itemState[idxVar] = index;
          } else itemState[itemExp.trim()] = item;
          const key = keyExp ? this.eval(keyExp, itemState) : index;
          let node = nodesMap.get(key);
          if (!node) { node = template.cloneNode(true); this.scan(node, itemState); }
          nextNodesMap.set(key, node); anchor.parentNode?.insertBefore(node, anchor);
        });
        nodesMap.forEach((node, key) => { if (!nextNodesMap.has(key)) node.remove(); });
        nodesMap = nextNodesMap;
      });
    });
    this.dir.set('s-if', (el, val, state) => {
      if (!el.parentNode) return;
      const template = el.cloneNode(true); template.removeAttribute('s-if');
      const anchor = document.createComment(`s-if: ${val}`);
      el.parentNode.replaceChild(anchor, el);
      let current = null;
      effect(() => {
        const result = !!this.eval(val, state);
        anchor.__if = result;
        if (result && !current) { current = template.cloneNode(true); this.scan(current, state); anchor.parentNode?.insertBefore(current, anchor); }
        else if (!result && current) { current.remove(); current = null; }
      });
    });
    this.dir.set('s-else', (el, val, state) => {
      if (!el.parentNode) return;
      const template = el.cloneNode(true); template.removeAttribute('s-else');
      const anchor = document.createComment('s-else');
      el.parentNode.replaceChild(anchor, el);
      let current = null;
      effect(() => {
        let prev = anchor.previousSibling;
        while (prev && prev.__if === undefined) prev = prev.previousSibling;
        const result = prev ? !prev.__if : true;
        if (result && !current) { current = template.cloneNode(true); this.scan(current, state); anchor.parentNode?.insertBefore(current, anchor); }
        else if (!result && current) { current.remove(); current = null; }
      });
    });
    this.dir.set('s-show', (el, val, state) => effect(() => el.style.display = this.eval(val, state) ? '' : 'none'));
    this.dir.set('s-once', (el) => el.__once = true);
    this.dir.set('s-ignore', (el) => el.__ignore = true);
    this.dir.set('s-validate', (el, val, state) => {
      const field = el.getAttribute('s-bind') || el.name;
      if (!field) return;
      state.$errors = state.$errors || reactive({});
      effect(() => {
        const fieldValue = this.eval(field, state);
        const error = val === 'required' ? (!fieldValue ? "Required" : null) : this.eval(val, state);
        state.$errors[field] = error;
        el.classList.toggle('is-invalid', !!error);
      });
    });
    this.dir.set('s-error', (el, val, state) => effect(() => {
      const msg = state.$errors?.[val] || (val === 'fetch' ? state.error : null);
      el.textContent = msg ?? '';
      el.style.display = msg ? '' : 'none';
    }));
    this.dir.set('s-loading', (el, val, state) => effect(() => el.style.display = state.loading ? '' : 'none'));
    
    // Routing
    this.dir.set('s-route', (el, val) => {
      this.routes = this.routes || new Map();
      this.routes.set(val, el.innerHTML);
      el.remove();
    });
    this.dir.set('s-view', (el) => {
      this.view = el;
      const update = () => {
        const hash = window.location.hash.slice(1) || '/';
        const content = this.routes?.get(hash);
        if (content) { el.innerHTML = content; this.scan(el); }
      };
      window.addEventListener('hashchange', update);
      update();
    });
    this.dir.set('s-link', (el, val) => el.addEventListener('click', (e) => {
      e.preventDefault(); window.location.hash = val;
    }));

    this.dir.set('s-component', (el, val, state) => {
      const name = this.eval(val, state);
      if (!name) return;
      const node = document.createElement(name);
      Array.from(el.attributes).forEach(attr => {
        if (attr.name !== 's-component') node.setAttribute(attr.name, attr.value);
      });
      node.innerHTML = el.innerHTML;
      el.replaceWith(node);
    });
    this.dir.set('s-prop', (el, val, state, name) => {
      const prop = name.split(':')[1];
      if (prop) effect(() => {
        const value = this.eval(val, state);
        el.setAttribute(prop, typeof value === 'object' ? JSON.stringify(value) : value);
        if (el._props) {
          el._props[prop] = value;
        } else {
          el[prop] = value;
        }
      });
    });
    this.dir.set('s-slot', (el, val) => el.setAttribute('slot', val));

    this.dir.set('s-lazy', (el, val, state) => {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) { el.src = this.eval(val, state); observer.disconnect(); }
      });
      observer.observe(el);
    });
  }

  /**
   * Evaluates a JavaScript expression within the given state context.
   * 
   * @param {string} exp - The expression to evaluate
   * @param {object} state - The reactive state object
   * @param {HTMLElement} el - Optional reference to the current element ($el)
   * @param {boolean} safe - If true, restricts evaluation to prevent XSS
   */
  eval(exp, state, el = null, safe = false) {
    if (!exp) return;
    const trimmed = exp.trim();
    
    // Safety check: Simple property lookup for common cases
    const isSimpleId = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(trimmed);
    if (isSimpleId && trimmed in state) {
      return state[trimmed];
    }

    const proxy = new Proxy(state, { 
      get: (target, key) => {
        if (key === '$el') return el;
        // Block dangerous globals in safe mode
        if (safe && ['window', 'document', 'eval', 'Function', 'location'].includes(key)) return undefined;
        if (typeof key === 'string' && !(key in target) && typeof window !== 'undefined' && key in window) {
           // In safe mode, we only allow a whitelist of harmless globals
           if (safe) {
             const whitelist = ['Math', 'Date', 'JSON', 'Number', 'String', 'Array', 'Object', 'Boolean'];
             if (!whitelist.includes(key)) return undefined;
           }
           return window[key];
        }
        return target[key];
      },
      has: (target, key) => {
        if (safe && ['window', 'document', 'eval', 'Function', 'location'].includes(key)) return false;
        return key === '$el' || key in target || (typeof window !== 'undefined' && key in window);
      }
    });

    try {
      // Use Function constructor but inject 'state' and '$el'
      // If safe mode is on, we wrap the expression to prevent access to outer scope via 'this'
      const code = safe 
        ? `try { with(state) { return (${trimmed}) } } catch(e) { return undefined; }`
        : `try { with(state) { ${trimmed.includes(';') || trimmed.startsWith('if') ? trimmed : 'return (' + trimmed + ')'} } } catch(e) { return undefined; }`;
        
      const fn = new Function('state', '$el', code);
      return fn(proxy, el);
    } catch (err) {
       if (!trimmed.includes('item.') && !['val', 'url', 'value'].includes(trimmed)) {
         console.warn(`[SimpliJS] Eval Error: ${trimmed}`, err.message);
       }
    }
  }

  set(obj, path, value) {
    const parts = path.split('.');
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
  }

  scan(root, state = globalState) {
    if (!root || root.__ignore || (root.hasAttribute && root.hasAttribute('s-ignore'))) return;
    
    const walk = (node, currentState) => {
      if (node.nodeType !== 1 || node.__ignore || (node.hasAttribute && node.hasAttribute('s-ignore'))) return;
      
      // s-memo check
      const memoAttr = node.getAttribute('s-memo');
      if (memoAttr) {
        const memoVal = this.eval(memoAttr, currentState);
        if (node.__hasMemo && node.__memoVal === memoVal) return;
        node.__memoVal = memoVal; node.__hasMemo = true;
      }

      let activeState = currentState;
      const stateAttr = node.getAttribute('s-state'); 
      if (stateAttr) { 
        const data = this.eval(stateAttr, currentState);
        const childState = reactive(Object.create(currentState));
        if (data && typeof data === 'object') Object.assign(childState, data);
        node.__simpliState = childState;
        activeState = childState;
        node.removeAttribute('s-state'); 
      }
      
      const globalAttr = node.getAttribute('s-global'); 
      if (globalAttr) { 
        const data = this.eval(globalAttr, globalState);
        if (data && typeof data === 'object') Object.assign(globalState, data);
        node.removeAttribute('s-global'); 
      }

      const attrs = Array.from(node.attributes);
      let stopDeepScan = false;
      
      attrs.forEach(attr => {
        if (attr.name.startsWith('s-') && attr.name !== 's-state' && attr.name !== 's-global') {
          const baseName = attr.name.split(':')[0];
          const handler = this.dir.get(baseName);
          if (handler) {
            if (['s-for', 's-if', 's-else'].includes(baseName)) stopDeepScan = true;
            handler(node, attr.value, activeState, attr.name, node);
            node.removeAttribute(attr.name);
          }
        }
      });

      this.interp(node, activeState);
      if (!stopDeepScan) Array.from(node.childNodes).forEach(child => walk(child, activeState));
    };
    walk(root, state);
  }

  interp(node, state) {
    if (['CODE', 'PRE', 'SCRIPT', 'STYLE'].includes(node.tagName)) return;
    node.childNodes.forEach(child => {
      if (child.nodeType === 3 && child.textContent.includes('{')) {
        const originalText = child.textContent;
        const update = () => {
          child.textContent = originalText.replace(/\{(.+?)\}/g, (_, exp) => {
            // Use SAFE eval for interpolation
            const val = this.eval(exp.trim(), state, null, true);
            return val ?? '';
          });
        };
        if (node.__once || (node.hasAttribute && node.hasAttribute('s-once'))) update(); 
        else effect(update);
      }
    });
  }

  init() { document.querySelectorAll('[s-app]').forEach(app => this.scan(app)); }
}

export const directives = new SimpliDirectives();
