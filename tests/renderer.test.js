// tests/renderer.test.js
import { domPatch } from '../packages/simplijs/src/renderer.js';
import assert from 'assert';

console.log('Testing Renderer...');

const container = document.createElement('div');
container.id = 'app';

domPatch(container, '<h1>Hello World</h1>');

assert.strictEqual(container.childNodes.length, 1, 'Should have one child');
assert.strictEqual(container.childNodes[0].tagName, 'H1', 'Child should be H1');

console.log('  - Renderer: OK');
