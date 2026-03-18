const FEATURES = [
    {
        id: 1,
        cat: 'Standard',
        name: 'Component Registration',
        desc: 'Register native Custom Elements with a setup function.',
        code: `import { component } from './simplijs.js';

component('hello-world', () => {
  return {
    render: () => "<h1>Hello SimpliJS!</h1>"
  }
});`,
        html: `<hello-world></hello-world>`
    },
    {
        id: 2,
        cat: 'Standard',
        name: 'Deeply Reactive State',
        desc: 'Proxies listen to nested data changes. UI updates automatically.',
        code: `import { component, reactive } from './simplijs.js';

component('counter-btn', () => {
  const state = reactive({ count: 0 });
  return {
    render: () => \`<button @click="add">Clicked \${state.count} times</button>\`,
    add: () => { state.count++; }
  }
});`,
        html: `<counter-btn></counter-btn>`
    },
    {
        id: 3,
        cat: 'Standard',
        name: 'Component Props',
        desc: 'Automatically syncs HTML attributes into a reactive props object.',
        code: `import { component } from './simplijs.js';

component('user-badge', (element, props) => {
  return {
    render: () => \`<div class="badge"><strong>\${props.name}</strong> - \${props.role}</div>\`
  }
});`,
        html: `<user-badge name="Alice" role="Admin"></user-badge>`
    },
    {
        id: 4,
        cat: 'Standard',
        name: 'Event Handling',
        desc: 'Bind events using @click or on:event directly in templates.',
        code: `component('magic-button', () => {
  return {
    wave: () => alert('Hello World!'),
    render: () => \`<button @click="wave">Click Me</button>\`
  }
});`,
        html: `<magic-button></magic-button>`
    },
    {
        id: 5,
        cat: 'Standard',
        name: 'Computed Properties',
        desc: 'Lazily evaluated reactive variables based on dependencies.',
        code: `const state = reactive({ num: 5 });
const double = computed(() => state.num * 2);

component('math-box', () => {
  return {
    render: () => \`<p>Base: \${state.num} | Doubled: \${double.value}</p>\`
  }
});`,
        html: `<math-box></math-box>`
    },
    {
        id: 6,
        cat: 'Standard',
        name: 'Watchers',
        desc: 'Execute code when a piece of reactive state mutates.',
        code: `const state = reactive({ query: '' });

watch(() => state.query, (newVal, oldVal) => {
  console.log(\`Changed from \${oldVal} to \${newVal}\`);
});

component('search-bar', () => {
  return {
    render: () => \`<input oninput="this.closest('search-bar').update(event)"/>\`,
    update: (e) => { state.query = e.target.value; }
  }
});`,
        html: `<search-bar></search-bar>`
    },
    {
        id: 7,
        cat: 'Standard',
        name: 'DOM Refs',
        desc: 'Direct JS access to native DOM elements after render.',
        code: `const myInput = ref();

component('auto-focus', () => {
  return {
    onMount: () => { myInput.value.focus(); },
    render: () => \`<input ref="myInput" placeholder="Focused on mount!"/>\`
  }
});`,
        html: `<auto-focus></auto-focus>`
    },
    {
        id: 8,
        cat: 'Standard',
        name: 'Lifecycle Hooks',
        desc: 'Hooks for onMount, onUpdate, onDestroy, and onError.',
        code: `component('lifecycle-demo', () => {
  return {
    onMount: () => console.log('Mounted!'),
    onDestroy: () => console.log('Destroyed!'),
    render: () => \`<div>Check console logs</div>\`
  }
});`,
        html: `<lifecycle-demo></lifecycle-demo>`
    },
    {
        id: 9,
        cat: 'Standard',
        name: 'Slots',
        desc: 'Project content from parent into child components.',
        code: `component('modal-card', () => {
  return {
    render: () => \`
      <div class="modal">
        <header><slot name="title"></slot></header>
        <main><slot></slot></main>
      </div>\`
  }
});`,
        html: `<modal-card>
  <h2 slot="title">Warning!</h2>
  <p>Are you sure you want to proceed?</p>
</modal-card>`
    },
    {
        id: 10,
        cat: 'Standard',
        name: 'Event Bus',
        desc: 'Decoupled cross-component communication using emit/on.',
        code: `// Component A
component('sender-btn', () => ({
  send: () => emit('ping', { time: Date.now() }),
  render: () => \`<button @click="send">Send Ping</button>\`
}));

// Component B
component('receiver-nav', () => {
  on('ping', (data) => alert('Ping received at: ' + data.time));
  return { render: () => \`<div>Awaiting...</div>\` }
});`,
        html: `<sender-btn></sender-btn>\n<receiver-nav></receiver-nav>`
    },
    {
        id: 11,
        cat: 'Standard',
        name: 'Form Validation',
        desc: 'Automated validation with visual feedback classes.',
        code: `const submitLogic = createApp().form({
  fields: ['username', 'password'],
  validate: {
    password: (val) => val.length < 5 ? "Too short" : null
  },
  submit: (data) => alert('Success: ' + JSON.stringify(data))
});

component('login-form', () => ({
  submitLogic,
  render: () => \`
    <form @submit="submitLogic">
      <input name="username" placeholder="Username" />
      <input name="password" type="password" placeholder="Password" />
      <button type="submit">Submit</button>
    </form>\`
}));`,
        html: `<login-form></login-form>`
    },
    {
        id: 12,
        cat: 'Standard',
        name: 'The Bridge',
        desc: 'Natively import React/Vue/Svelte components.',
        code: `// Import a React Icon directly from ESM
const ReactIcon = use.react('https://cdn.jsdelivr.net/npm/lucide-react@0.292.0/+esm', 'react-icon');

component('bridge-demo', () => ({
  render: () => \`
    <div>
      <h3>Imported from React:</h3>
      <react-icon color="blue" size="48"></react-icon>
    </div>\`
}));`,
        html: `<bridge-demo></bridge-demo>`
    },
    {
        id: 13,
        cat: 'Standard',
        name: 'Time Vault',
        desc: 'State time travel and bug sharing.',
        code: `window.appState = reactive.vault({ count: 0 });

component('vault-demo', () => ({
  add: () => appState.count++,
  back: () => appState.vault.back(),
  render: () => \`
    <div>
      <p>Count: \${appState.count}</p>
      <button @click="add">Add</button>
      <button @click="back">Undo</button>
    </div>\`
}));`,
        html: `<vault-demo></vault-demo>`
    },
    {
        id: 14,
        cat: 'HTML-First',
        name: 's-app',
        desc: 'Root directive for SimpliJS reactivity.',
        code: `<div s-app>
  <!-- SimpliJS magic happens here -->
</div>`,
        html: `<div s-app s-state="{ msg: 'Inside s-app' }">
  <p>{msg}</p>
</div>`
    },
    {
        id: 15,
        cat: 'HTML-First',
        name: 's-state',
        desc: 'Initialize local reactive state.',
        code: `<div s-app s-state="{ count: 0, user: 'John' }">
  ...
</div>`,
        html: `<div s-app s-state="{ count: 10 }">
  <p>Count: {count}</p>
  <button s-click="count++">Increment</button>
</div>`
    },
    {
        id: 16,
        cat: 'HTML-First',
        name: 's-global',
        desc: 'Shared data across multiple s-app instances.',
        code: `<div s-global="{ theme: 'dark' }"></div>`,
        html: `<div s-app s-global="{ siteName: 'SimpliJS Playground' }">
  <p>Global Site: {siteName}</p>
</div>`
    },
    {
        id: 17,
        cat: 'HTML-First',
        name: 's-bind',
        desc: '2-way binding for inputs.',
        code: `<input s-bind="username">`,
        html: `<div s-app s-state="{ username: 'dev' }">
  <input s-bind="username" />
  <p>Typed: {username}</p>
</div>`
    },
    {
        id: 18,
        cat: 'HTML-First',
        name: 's-text',
        desc: 'Reactive text content.',
        code: `<span s-text="count"></span>`,
        html: `<div s-app s-state="{ count: 0 }">
  <button s-click="count++">Add</button>
  <p>Text: <span s-text="count"></span></p>
</div>`
    },
    {
        id: 19,
        cat: 'HTML-First',
        name: '{expression}',
        desc: 'Native interpolation in text nodes.',
        code: `<h1>Hello, {user}!</h1>`,
        html: `<div s-app s-state="{ user: 'World' }">
  <h2>Welcome, {user}!</h2>
</div>`
    },
    {
        id: 20,
        cat: 'HTML-First',
        name: 's-html',
        desc: 'Reactive raw HTML injection.',
        code: `<div s-html="content"></div>`,
        html: `<div s-app s-state="{ raw: '<strong>Bold Content</strong>' }">
  <div s-html="raw"></div>
</div>`
    },
    {
        id: 21,
        cat: 'HTML-First',
        name: 's-value',
        desc: '1-way sync to input value.',
        code: `<input s-value="initialValue">`,
        html: `<div s-app s-state="{ val: 'Fixed Value' }">
  <input s-value="val" />
</div>`
    },
    {
        id: 22,
        cat: 'HTML-First',
        name: 's-attr',
        desc: 'Bind any HTML attribute.',
        code: `<img s-attr:src="imagePath">`,
        html: `<div s-app s-state="{ color: 'red' }">
  <p s-attr:style="'color:' + color">Dynamic Color Text</p>
  <button s-click="color='blue'">Change to Blue</button>
</div>`
    },
    {
        id: 23,
        cat: 'HTML-First',
        name: 's-class',
        desc: 'Reactive CSS class binding.',
        code: `<div s-class="{ active: isActive }"></div>`,
        html: `<div s-app s-state="{ active: false }">
  <style>.is-active { color: green; font-weight: bold; }</style>
  <p s-class="{ 'is-active': active }">Conditional Styling</p>
  <button s-click="active = !active">Toggle Class</button>
</div>`
    },
    {
        id: 24,
        cat: 'HTML-First',
        name: 's-style',
        desc: 'Reactive inline style objects.',
        code: `<div s-style="{ fontSize: size + 'px' }"></div>`,
        html: `<div s-app s-state="{ size: 16 }">
  <p s-style="{ fontSize: size + 'px' }">Dynamic Font Size</p>
  <button s-click="size += 2">Grow</button>
</div>`
    },
    {
        id: 25,
        cat: 'HTML-First',
        name: 's-if',
        desc: 'Conditional DOM mounting.',
        code: `<div s-if="show">I am here</div>`,
        html: `<div s-app s-state="{ show: true }">
  <button s-click="show = !show">Toggle</button>
  <div s-if="show">Now you see me</div>
</div>`
    },
    {
        id: 26,
        cat: 'HTML-First',
        name: 's-else',
        desc: 'Fallback for s-if.',
        code: `<div s-if="ok">...</div><div s-else>Else</div>`,
        html: `<div s-app s-state="{ ok: false }">
  <div s-if="ok">Positive</div>
  <div s-else>Negative</div>
  <button s-click="ok = !ok">Flip</button>
</div>`
    },
    {
        id: 27,
        cat: 'HTML-First',
        name: 's-show',
        desc: 'Toggle visibility (display: none).',
        code: `<div s-show="isVisible">Hidden/Visible</div>`,
        html: `<div s-app s-state="{ visible: true }">
  <div s-show="visible">Toggle my visibility</div>
  <button s-click="visible = !visible">Show/Hide</button>
</div>`
    },
    {
        id: 28,
        cat: 'HTML-First',
        name: 's-hide',
        desc: 'Inverse of s-show.',
        code: `<div s-hide="isLoading">Loaded Content</div>`,
        html: `<div s-app s-state="{ loading: false }">
  <div s-hide="loading">Content Ready</div>
  <button s-click="loading = !loading">Toggle Loading</button>
</div>`
    },
    {
        id: 29,
        cat: 'HTML-First',
        name: 's-for',
        desc: 'Reactive list rendering.',
        code: `<li s-for="item in items">{item}</li>`,
        html: `<div s-app s-state="{ items: ['Svelte', 'Vue', 'Simpli'] }">
  <ul>
    <li s-for="item in items">{item}</li>
  </ul>
</div>`
    },
    {
        id: 30,
        cat: 'HTML-First',
        name: 's-key',
        desc: 'Keyed loops for performance.',
        code: `<li s-for="p in people" s-key="p.id">...</li>`,
        html: `<div s-app s-state="{ people: [{id:1, name:'A'}, {id:2, name:'B'}] }">
  <div s-for="p in people" s-key="p.id">{p.name}</div>
</div>`
    },
    {
        id: 31,
        cat: 'HTML-First',
        name: 's-index',
        desc: 'Access loop index.',
        code: `<li s-for="it, i in list"># {i}: {it}</li>`,
        html: `<div s-app s-state="{ list: ['A','B','C'] }">
  <div s-for="it, i in list">{i} - {it}</div>
</div>`
    },
    {
        id: 32,
        cat: 'HTML-First',
        name: 's-click',
        desc: 'Native click listener.',
        code: `<button s-click="count++">Add</button>`,
        html: `<div s-app s-state="{ c: 0 }">
  <p>Count: {c}</p>
  <button s-click="c++">Increment</button>
</div>`
    },
    {
        id: 33,
        cat: 'HTML-First',
        name: 's-change',
        desc: 'Fires on input change.',
        code: `<select s-change="update(event)">...</select>`,
        html: `<div s-app s-state="{ selection: 'None' }">
  <select s-change="selection = event.target.value">
    <option>Option 1</option>
    <option>Option 2</option>
  </select>
  <p>Selected: {selection}</p>
</div>`
    },
    {
        id: 34,
        cat: 'HTML-First',
        name: 's-input',
        desc: 'Fires on every keystroke.',
        code: `<input s-input="liveMsg = event.target.value">`,
        html: `<div s-app s-state="{ live: '' }">
  <input s-input="live = event.target.value" placeholder="Type here..." />
  <p>Live: {live}</p>
</div>`
    },
    {
        id: 35,
        cat: 'HTML-First',
        name: 's-submit',
        desc: 'Form submission handler.',
        code: `<form s-submit="handle()">...</form>`,
        html: `<div s-app s-state="{ sent: false }">
  <form s-submit="sent = true">
    <input name="test" />
    <button type="submit">Submit Form</button>
  </form>
  <p s-if="sent">Form Submitted!</p>
</div>`
    },
    {
        id: 36,
        cat: 'HTML-First',
        name: 's-hover',
        desc: 'Trigger logic on hover.',
        code: `<div s-hover="msg = 'Hovered!'"></div>`,
        html: `<div s-app s-state="{ msg: 'Move mouse over me' }">
  <div s-hover="msg = 'HOVERED!'" style="padding:20px; border:1px solid">
    {msg}
  </div>
</div>`
    },
    {
        id: 37,
        cat: 'HTML-First',
        name: 's-key:[key]',
        desc: 'Listen for specific keys.',
        code: `<input s-key:enter="save()">`,
        html: `<div s-app s-state="{ typed: '' }">
  <input s-key:enter="alert('You pressed Enter!')" placeholder="Press enter here" />
</div>`
    },
    {
        id: 38,
        cat: 'HTML-First',
        name: 's-model',
        desc: 'Advanced type binding (radio, checkbox).',
        code: `<input type="checkbox" s-model="isDone">`,
        html: `<div s-app s-state="{ isChecked: false }">
  <input type="checkbox" s-model="isChecked" />
  <p>Status: {isChecked ? 'On' : 'Off'}</p>
</div>`
    },
    {
        id: 39,
        cat: 'HTML-First',
        name: 's-validate',
        desc: 'Declarative validation.',
        code: `<input s-bind="email" s-validate="required">`,
        html: `<div s-app s-state="{ email: '' }">
  <input s-bind="email" s-validate="required" placeholder="Email (required)" />
  <span s-error="email" style="color:red"></span>
</div>`
    },
    {
        id: 40,
        cat: 'HTML-First',
        name: 's-error',
        desc: 'Display validation errors.',
        code: `<span s-error="fieldName"></span>`,
        html: `<div s-app s-state="{ name: '' }">
  <input s-bind="name" s-validate="required" />
  <p s-error="name" style="color:red"></p>
</div>`
    },
    {
        id: 41,
        cat: 'HTML-First',
        name: 's-fetch',
        desc: 'Automated JSON fetching.',
        code: `<div s-fetch="'/api/data'"></div>`,
        html: `<div s-app s-state="{ url: 'https://jsonplaceholder.typicode.com/todos/1' }">
  <div s-fetch="url">
    <div s-loading>Loading...</div>
    <div s-if="data">
      <p>Fetched Todo: {data.title}</p>
    </div>
  </div>
</div>`
    },
    {
        id: 42,
        cat: 'HTML-First',
        name: 's-loading',
        desc: 'UI for active fetch requests.',
        code: `<div s-loading>Fetching...</div>`,
        html: `<!-- See s-fetch example -->`
    },
    {
        id: 43,
        cat: 'HTML-First',
        name: 's-error (fetch)',
        desc: 'UI for failed fetch requests.',
        code: `<div s-error>Failed to load</div>`,
        html: `<div s-app s-state="{ url: 'invalid-url' }">
  <div s-fetch="url">
    <div s-error>Failed to fetch data</div>
  </div>
</div>`
    },
    {
        id: 44,
        cat: 'HTML-First',
        name: 's-component',
        desc: 'Mount JS components in HTML-First.',
        code: `<div s-component="'my-btn'"></div>`,
        html: `<div s-app>
  <div s-component="'playground-logo'"></div>
</div>`
    },
    {
        id: 45,
        cat: 'HTML-First',
        name: 's-prop',
        desc: 'Pass parent data to components.',
        code: `<my-comp s-prop:name="user.name"></my-comp>`,
        html: `<div s-app s-state="{ userName: 'Bob' }">
  <user-badge s-prop:name="userName"></user-badge>
</div>`
    },
    {
        id: 46,
        cat: 'HTML-First',
        name: 's-slot',
        desc: 'Project content in HTML-First.',
        code: `<my-card><h1 s-slot="title">Hello</h1></my-card>`,
        html: `<div s-app>
  <modal-card>
    <div s-slot="title">HTML-First Slot</div>
    <p>Content projected via s-slot.</p>
  </modal-card>
</div>`
    },
    {
        id: 47,
        cat: 'SPA Routing',
        name: 's-route',
        desc: 'Define path-based templates.',
        code: `<div s-route="/home">Home Page</div>`,
        html: `<div s-app>
  <div s-route="/home"><h2>Welcome Home</h2></div>
  <div s-route="/about"><h2>About Us</h2></div>
  <main s-view></main>
</div>`
    },
    {
        id: 48,
        cat: 'SPA Routing',
        name: 's-view',
        desc: 'Dynamic outlet for routes.',
        code: `<main s-view></main>`,
        html: `<!-- See s-route example -->`
    },
    {
        id: 49,
        cat: 'SPA Routing',
        name: 's-link',
        desc: 'Soft navigation links.',
        code: `<a s-link="/contact">Contact</a>`,
        html: `<div s-app>
  <nav>
    <a s-link="/home">Home</a> | <a s-link="/about">About</a>
  </nav>
  <div s-route="/home">Home View</div>
  <div s-route="/about">About View</div>
  <div s-view></div>
</div>`
    },
    {
        id: 50,
        cat: 'Performance',
        name: 's-lazy',
        desc: 'Deferred loading using Intersection Observer.',
        code: `<img s-lazy="'path/to/img.jpg'">`,
        html: `<div s-app s-state="{ src: 'https://via.placeholder.com/300' }">
  <div style="height: 100vh">Scroll down...</div>
  <img s-lazy="src" style="width:300px; height:300px; border:1px solid" />
</div>`
    },
    {
        id: 51,
        cat: 'Performance',
        name: 's-memo',
        desc: 'Skip re-scans if dependency unchanged.',
        code: `<div s-memo="items.length">...</div>`,
        html: `<div s-app s-state="{ count: 0, other: 0 }">
  <div s-memo="count">Memoized Count: {count}</div>
  <button s-click="count++">Change Count</button>
  <button s-click="other++">Change Other</button>
</div>`
    },
    {
        id: 52,
        cat: 'Performance',
        name: 's-ref',
        desc: 'Bind DOM element to state.',
        code: `<input s-ref="myInput">`,
        html: `<div s-app s-state="{ myRef: null }">
  <input s-ref="myRef" />
  <button s-click="myRef.focus()">Focus Input</button>
</div>`
    },
    {
        id: 53,
        cat: 'Performance',
        name: 's-once',
        desc: 'One-time render for speed.',
        code: `<div s-once>{time}</div>`,
        html: `<div s-app s-state="{ count: 0 }">
  <p s-once>Frozen: {count}</p>
  <p>Reactive: {count}</p>
  <button s-click="count++">Add</button>
</div>`
    },
    {
        id: 54,
        cat: 'Performance',
        name: 's-ignore',
        desc: 'Skip subtree for 3rd party libs.',
        code: `<div s-ignore>...</div>`,
        html: `<div s-app s-state="{ count: 0 }">
  <div s-ignore>
    <p>Ignored: {count}</p>
  </div>
</div>`
    }
];
