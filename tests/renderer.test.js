import { domPatch } from '../src/renderer.js';
import assert from 'assert';

console.log('Testing Renderer...');

// Mock the DOM
global.Node = { TEXT_NODE: 3 };

global.mockAppDiv = {
  innerHTML: '',
  childNodes: [],
  hasChildNodes: () => false,
  appendChild: function(node) { this.childNodes.push(node); this.innerHTML = node.outerHTML || node.textContent; }
};

global.document = {
  querySelector: (sel) => {
    if (sel === '#app') return global.mockAppDiv;
    return null;
  },
  createElement: () => ({
    content: { childNodes: [{ outerHTML: '<h1>Hello</h1>', cloneNode: function() { return this; } }] },
    set innerHTML(val) { }
  })
};

domPatch('#app', '<h1>Hello</h1>');
assert.strictEqual(global.mockAppDiv.innerHTML, '<h1>Hello</h1>', 'Renderer should update innerHTML');

console.log('Renderer tests passed! ✅');
