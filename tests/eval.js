const fs = require('fs');

global.window = {};
global.Node = { TEXT_NODE: 3 };
global.document = {
  querySelector: () => ({}),
  createElement: () => ({ content: { childNodes: [] } })
};
global.HTMLElement = class {};
let ComponentClass = null;
global.customElements = { 
  get: () => false, 
  define: (name, cls) => { ComponentClass = cls; } 
};

const code = fs.readFileSync('dist/simplijs.js', 'utf8');

try {
  eval(code);
  const SimpliJS = global.SimpliJS;
  console.log('SimpliJS loaded:', Object.keys(SimpliJS));
  
  SimpliJS.component('test-comp', () => 'Hello');
  
  // Create instance
  const comp = new ComponentClass();
  comp.connectedCallback();
  
  console.log('Component initialized successfully');
} catch (e) {
  console.error('Error:', e);
}
