import { reactive } from '../src/reactive.js';
import assert from 'assert';

console.log('Testing Async State...');

async function runTest() {
  const state = reactive.async(async () => {
    return 'success';
  });

  assert.strictEqual(state.loading, true, 'Should be loading immediately');
  assert.strictEqual(state.value, null, 'Value should be null initially');

  // wait a tick for promise to resolve
  await new Promise(r => setTimeout(r, 10));

  assert.strictEqual(state.loading, false, 'Should finish loading');
  assert.strictEqual(state.value, 'success', 'Value should be present');
  assert.strictEqual(state.error, null, 'Error should be null');
  
  console.log('Async State tests passed! ✅');
}

runTest();
