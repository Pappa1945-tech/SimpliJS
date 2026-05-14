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
await Promise.resolve();
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

// Test Vault (Time Travel)
import { reactive as reactiveWithVault } from '../packages/simplijs/src/reactive.js';
const vaultState = reactive.vault({ count: 0 });
vaultState.count = 1;
await new Promise(r => setTimeout(r, 10)); // Wait for snapshot
vaultState.count = 2;
await new Promise(r => setTimeout(r, 10)); // Wait for snapshot
assert.strictEqual(vaultState.count, 2, 'Value should be 2');
vaultState.vault.back();
assert.strictEqual(vaultState.count, 1, 'Value should be 1 after back()');
vaultState.vault.forward();
assert.strictEqual(vaultState.count, 2, 'Value should be 2 after forward()');
console.log('  - Vault (Time Travel): OK');

// Test Computed
import { computed as comp } from '../packages/simplijs/src/reactive.js';
const cState = reactive({ a: 1, b: 2 });
const sum = comp(() => cState.a + cState.b);
await new Promise(r => setTimeout(r, 0)); // Initial run
assert.strictEqual(sum.value, 3, 'Computed should be 3');
cState.a = 10;
await new Promise(r => setTimeout(r, 0)); // Update run
assert.strictEqual(sum.value, 12, 'Computed should update to 12');
console.log('  - Computed Properties: OK');
