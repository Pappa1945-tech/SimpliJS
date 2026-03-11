import { component } from '../src/component.js';
import assert from 'assert';

console.log('Testing Component System...');

const customElements = {};
global.customElements = {
  define: (name, constructor) => {
    customElements[name] = constructor;
  },
  get: (name) => customElements[name]
};

global.HTMLElement = class HTMLElement {};

component('my-comp', () => {
  return 'rendered';
});

assert.ok(customElements['my-comp'], 'Component should be registered in customElements');

console.log('Component tests passed! ✅');
