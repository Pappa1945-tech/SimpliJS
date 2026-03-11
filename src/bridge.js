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
import { reactive, effect } from './reactive.js';

let bridgeId = 0;

export const use = {
  react: (url, name) => createBridge('react', url, name),
  vue: (url, name) => createBridge('vue', url, name),
  svelte: (url, name) => createBridge('svelte', url, name)
};

function createBridge(type, url, customName) {
  const nameFromUrl = url.split('/').pop().split('.')[0].replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  let tagName = customName || `${type}-${nameFromUrl || 'component'}-${++bridgeId}`;
  if (!tagName.includes('-')) tagName += '-component';
  
  if (customElements.get(tagName)) return tagName;
  
  class BridgeElement extends HTMLElement {
    async connectedCallback() {
      this._props = reactive({});
      Array.from(this.attributes).forEach(attr => {
        let val = attr.value;
        if (val === '') val = true;
        else if (val === 'false') val = false;
        else if (!isNaN(val)) val = Number(val);
        // camelCase conversion for better JS framework compatibility
        const camelName = attr.name.replace(/-([a-z])/g, g => g[1].toUpperCase());
        this._props[camelName] = val;
      });

      this.style.display = 'contents';
      
      try {
        const mod = await import(/* @vite-ignore */ url);
        const ComponentDef = mod.default || mod;

        if (type === 'react') {
           const [{ createElement }, { createRoot }] = await Promise.all([
             import('https://cdn.jsdelivr.net/npm/react@18.2.0/+esm'),
             import('https://cdn.jsdelivr.net/npm/react-dom@18.2.0/client/+esm')
           ]);
           
           if (!this._reactRoot) {
               this._mountPoint = document.createElement('div');
               this._mountPoint.style.display = 'contents';
               this.appendChild(this._mountPoint);
               this._reactRoot = createRoot(this._mountPoint);
           }
           effect(() => {
             this._reactRoot.render(createElement(ComponentDef, { ...this._props }));
           });
           
        } else if (type === 'vue') {
           const { createApp, h } = await import('https://esm.sh/vue@3/dist/vue.esm-browser.prod.js');
           this._mountPoint = document.createElement('div');
           this._mountPoint.style.display = 'contents';
           this.appendChild(this._mountPoint);

           effect(() => {
              if (this._vueApp) {
                 // Vue doesn't easily allow re-rendering with replaced root props efficiently from identical component definition without re-mounting entirely in this standalone approach. 
                 // So we remount for simplicity.
                 this._vueApp.unmount();
              }
              this._vueApp = createApp({
                render: () => h(ComponentDef, { ...this._props })
              });
              this._vueApp.mount(this._mountPoint);
           });
        } else if (type === 'svelte') {
           effect(() => {
              if (this._svelteInst) {
                 this._svelteInst.$set({ ...this._props });
              } else {
                 this._svelteInst = new ComponentDef({
                   target: this,
                   props: { ...this._props }
                 });
              }
           });
        }
      } catch (err) {
        console.error(`🔴 [SimpliJS Bridge] Failed to load ${type} component from ${url}`, err);
        this.innerHTML = `<div style="color:red; border:1px solid red; padding:4px;">Failed to load ${type} component</div>`;
      }
    }
    
    disconnectedCallback() {
       if (this._reactRoot && type === 'react') {
           setTimeout(() => this._reactRoot.unmount(), 0);
       } else if (this._vueApp && type === 'vue') {
           this._vueApp.unmount();
       } else if (this._svelteInst && type === 'svelte') {
           this._svelteInst.$destroy();
       }
    }
  }

  customElements.define(tagName, BridgeElement);
  return tagName;
}
