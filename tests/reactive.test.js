import { reactive, effect } from '../src/reactive.js';
import assert from 'assert';

console.log('Testing Reactivity Engine...');

const state = reactive({ count: 0 });
let dummy;

effect(() => {
  dummy = state.count;
});

assert.strictEqual(dummy, 0, 'Effect should run initially');

state.count++;
assert.strictEqual(dummy, 1, 'Effect should run when property changes');

state.count = 10;
assert.strictEqual(dummy, 10, 'Effect should run again when property changes');

console.log('Reactivity tests passed! ✅');
