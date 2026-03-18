// tests/async.test.js
import { reactive } from '../packages/simplijs/src/reactive.js';
import assert from 'assert';

console.log('Testing Async State...');

const state = reactive.async(async () => {
  return 'Fetched Data';
});

assert.strictEqual(state.loading, true, 'Should be loading initially');

setTimeout(() => {
  assert.strictEqual(state.value, 'Fetched Data', 'Should resolve with data');
  assert.strictEqual(state.loading, false, 'Should stop loading');
  console.log('  - Async State: OK');
}, 10);
