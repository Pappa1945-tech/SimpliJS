import { effect, reactive } from './reactive.js';
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
      this._props = reactive({});
    }

    setAttribute(name, value) {
      super.setAttribute(name, value);
      if (this._props) {
        let val = value;
        if (val === '') val = true;
        else if (val === 'false') val = false;
        else if (!isNaN(val)) val = Number(val);
        this._props[name] = val;
      }
    }
    static get observedAttributes() {
      return []; // We will handle all attributes dynamically if possible, or we need to know them
    }

    attributeChangedCallback(name, oldVal, newVal) {
      if (oldVal !== newVal && this._props) {
        let val = newVal;
        if (val === '') val = true;
        else if (val === 'false') val = false;
        else if (!isNaN(val)) val = Number(val);
        this._props[name] = val;
      }
    }

    _handleError(err) {
      if (this._lifecycle && this._lifecycle.onError) {
        this._lifecycle.onError(err);
      } else {
        console.error(`🔴 [SimpliJS] ${err.message}`);
        console.debug('Component:', name);
        console.debug('Props/State:', this._props);
      }
    }

    connectedCallback() {
      if (!this._props) this._props = reactive({});
      Array.from(this.attributes).forEach(attr => {
        let val = attr.value;
        if (val === '') val = true;
        else if (val === 'false') val = false;
        else if (!isNaN(val)) val = Number(val);
        this._props[attr.name] = val;
      });

      if (!this._originalNodes && this.hasChildNodes()) {
         this._originalNodes = Array.from(this.childNodes).map(n => n.cloneNode(true));
      }

      try {
        const result = setup(this, this._props);
        
        if (typeof result === 'function') {
          effect(() => {
            try {
              domPatch(this, result(), this);
            } catch (err) { this._handleError(err); }
          });
        } else if (typeof result === 'string') {
          domPatch(this, result, this);
        } else if (typeof result === 'object' && result !== null) {
          this._lifecycle = result;
          
          Object.keys(result).forEach(key => {
            if (typeof result[key] === 'function' && !['onMount', 'onUpdate', 'onDestroy', 'onError', 'render'].includes(key)) {
              this[key] = result[key].bind(this);
            }
          });

          if (this._lifecycle.render) {
            let isFirstUpdate = true;
            effect(() => {
              try {
                if (!isFirstUpdate && this._lifecycle.onUpdate) {
                  this._lifecycle.onUpdate();
                }
                domPatch(this, this._lifecycle.render(), this);
                if (isFirstUpdate && this._lifecycle.onMount) {
                  this._lifecycle.onMount();
                }
                isFirstUpdate = false;
              } catch (err) {
                this._handleError(err);
              }
            });
          } else if (this._lifecycle.onMount) {
            this._lifecycle.onMount();
          }
        }
      } catch (err) {
        this._handleError(err);
      }
    }
    
    disconnectedCallback() {
      try {
        if (this._lifecycle && this._lifecycle.onDestroy) {
          this._lifecycle.onDestroy();
        }
      } catch (err) {
        this._handleError(err);
      }
    }
  }
  
  customElements.define(name, SimpliComponent);
}
