// tests/component.test.js
import { component } from '../packages/simplijs/src/component.js';
import assert from 'assert';

console.log('Testing Components...');

let defined = false;
global.customElements.define = (name) => {
  if (name === 'my-test') defined = true;
};

component('my-test', () => {
  return '<div>Component</div>';
});

assert.strictEqual(defined, true, 'Component should be defined in customElements');
console.log('  - Components: OK');
