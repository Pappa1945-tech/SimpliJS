// tests/form.test.js
import { createApp } from '../packages/simplijs/src/core.js';
import assert from 'assert';

console.log('Testing Forms...');

const app = createApp('#app');
const handler = app.form({
  fields: ['name'],
  submit: (data) => {
    assert.strictEqual(data.name, 'Simpli', 'Form data should be captured');
  }
});

// Mock event
const event = {
  preventDefault: () => {},
  target: {
    elements: { name: { classList: { remove: () => {}, add: () => {} } } }
  }
};

global.FormData = class {
  constructor() { this.data = { name: 'Simpli' }; }
  get(key) { return this.data[key]; }
};

handler(event);
console.log('  - Forms: OK');
