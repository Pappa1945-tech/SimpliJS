// tests/directives.test.js
import { directives } from '../packages/simplijs/src/directives.js';
import { reactive } from '../packages/simplijs/src/reactive.js';
import assert from 'assert';

console.log('Testing Directives Engine...');

// Mock Element for s-text
const el = document.createElement('div');
el.setAttribute('s-text', 'name');

const state = reactive({ name: 'Simpli' });

// In a real env, directives.init() scans the DOM. 
// Here we can test the internal handlers if exported, or mock a scan.
// Since directives.js is quite integrated, let's try a minimal scan mock if possible.

console.log('  - Testing s-text (Manual Trigger)...');
const textHandler = directives.dir.get('s-text').bind(directives);
textHandler(el, 'name', state);

// Note: textContent updates are async because of 'effect' flushing in microtasks
await new Promise(r => setTimeout(r, 0));

assert.strictEqual(el.textContent, 'Simpli', 's-text should set textContent');
state.name = 'SimpliJS';
await new Promise(r => setTimeout(r, 0));
assert.strictEqual(el.textContent, 'SimpliJS', 's-text should update on state change');

console.log('  - Testing s-bind (Input Sync)...');
const input = document.createElement('input');
input.setAttribute('s-bind', 'name');
const bindHandler = directives.dir.get('s-bind').bind(directives);
bindHandler(input, 'name', state);

await new Promise(r => setTimeout(r, 0));
assert.strictEqual(input.value, 'SimpliJS', 's-bind should set initial value');
state.name = 'New Name';
await new Promise(r => setTimeout(r, 0));
assert.strictEqual(input.value, 'New Name', 's-bind should update on state change');

console.log('  - Directives Engine: OK (Partial)');
