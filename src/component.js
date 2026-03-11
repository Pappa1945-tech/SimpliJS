import { effect } from './reactive.js';

export function component(name, setup) {
  if (customElements.get(name)) {
    console.warn(`[SimpliJS warn]: Component ${name} already registered.`);
    return;
  }
  
  class SimpliComponent extends HTMLElement {
    constructor() {
      super();
    }
    
    connectedCallback() {
      const renderFn = setup(this);
      if (typeof renderFn === 'function') {
        effect(() => {
          this.innerHTML = renderFn();
        });
      } else if (typeof renderFn === 'string') {
        this.innerHTML = renderFn;
      }
    }
  }
  
  customElements.define(name, SimpliComponent);
}
