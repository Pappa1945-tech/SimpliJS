import { render } from '../src/renderer.js';
import assert from 'assert';

console.log('Testing Renderer...');

// Mock the DOM
global.document = {
  querySelector: (sel) => {
    if (sel === '#app') {
      return global.mockAppDiv;
    }
    return null;
  }
};

global.mockAppDiv = {
  innerHTML: ''
};

render('#app', '<h1>Hello</h1>');
assert.strictEqual(global.mockAppDiv.innerHTML, '<h1>Hello</h1>', 'Renderer should update innerHTML');

console.log('Renderer tests passed! ✅');
