// tests/reactive.test.js
import { reactive, effect } from '../packages/simplijs/src/reactive.js';
import assert from 'assert';

console.log('Testing Reactivity Engine...');

const state = reactive({ count: 0 });
let dummy;

effect(() => {
  dummy = state.count;
});

assert.strictEqual(dummy, 0, 'Effect should run initially');
state.count++;
assert.strictEqual(dummy, 1, 'Effect should update');
console.log('  - Reactivity: OK');

// Test Proxy Caching (Object Identity)
const data = { nested: { a: 1 } };
const s1 = reactive(data);
const s2 = reactive(data);
assert.strictEqual(s1, s2, 'Identical objects should return the same proxy');

const n1 = s1.nested;
const n2 = s1.nested;
assert.strictEqual(n1, n2, 'Nested object access should return the same proxy instance');
console.log('  - Object Identity (Proxy Cache): OK');
