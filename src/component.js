import { effect } from './reactive.js';
import { domPatch } from './renderer.js';

export function component(name, setup) {
  if (typeof customElements === 'undefined') return;
  if (customElements.get(name)) {
    console.warn(`[SimpliJS warn]: Component ${name} already registered.`);
    return;
  }
  
  class SimpliComponent extends HTMLElement {
    constructor() {
      super();
    }
    
    connectedCallback() {
      const result = setup(this);
      
      if (typeof result === 'function') {
        effect(() => {
          domPatch(this, result());
        });
      } else if (typeof result === 'string') {
        this.innerHTML = result;
      } else if (typeof result === 'object' && result !== null) {
        this._lifecycle = result;
        
        // Expose extra methods to the DOM element for inline handlers
        Object.keys(result).forEach(key => {
          if (typeof result[key] === 'function' && !['onMount', 'onUpdate', 'onDestroy', 'render'].includes(key)) {
            this[key] = result[key].bind(this);
          }
        });

        if (this._lifecycle.onMount) {
          this._lifecycle.onMount();
        }
        if (this._lifecycle.render) {
          let isFirstUpdate = true;
          effect(() => {
            if (!isFirstUpdate && this._lifecycle.onUpdate) {
              this._lifecycle.onUpdate();
            }
            domPatch(this, this._lifecycle.render());
            isFirstUpdate = false;
          });
        }
      }
    }
    
    disconnectedCallback() {
      if (this._lifecycle && this._lifecycle.onDestroy) {
        this._lifecycle.onDestroy();
      }
    }
  }
  
  customElements.define(name, SimpliComponent);
}
