import { createApp } from '../src/core.js';
import assert from 'assert';

console.log('Testing Forms...');

const app = createApp('#app');

const testForm = app.form({
  fields: ['username'],
  validate: {
    username: (v) => v === 'admin' ? null : 'error'
  },
  submit: (data) => {
    assert.strictEqual(data.username, 'admin', 'Submit should pass admin');
  }
});

// Mock FormData
global.FormData = class {
  constructor(target) {
    this.target = target;
  }
  get(key) {
    return this.target.elements[key];
  }
};

let preventDefaultCalled = false;
testForm({
  preventDefault: () => preventDefaultCalled = true,
  target: {
    tagName: 'FORM',
    elements: { 'username': 'admin' }
  }
});

assert.ok(preventDefaultCalled, 'preventDefault should be called');

console.log('Form tests passed! ✅');
