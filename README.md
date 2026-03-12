# SimpliJS 🚀

*"The Python of JavaScript Frameworks."*

SimpliJS is a lightweight, modern JavaScript framework designed for **simplicity**, **performance**, and **zero configuration**. It brings web development back to its core principles by removing unnecessary complexity, allowing developers to focus on building powerful applications without a compiler, build tool, or heavy `node_modules` footprint.

---

## 🆚 Why SimpliJS? (The Ultimate Framework Comparison)

When choosing a frontend framework, the cognitive load and setup time matter. SimpliJS cuts through the noise.

| Feature / Trait | **SimpliJS** 🚀 | **React** ⚛️ | **Vue** 🟩 | **Svelte** 🟠 | **Angular** 🅰️ | **SolidJS** 🧊 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Philosophy** | "The Python of JS" | Setup Heavy | Flexible but Split | Compiler Required | Enterprise Heavy | Signals First |
| **Build Tools** | **Zero Config (None)** | Webpack/Vite | Vite | Rollup/Vite | Angular CLI | Vite + Babel |
| **Learning Curve**| **Extremely Easy** | Moderate | Easy/Moderate | Easy/Moderate | Very Steep | Moderate |
| **Size (Minified)**| **< 10KB** | ~130KB | ~100KB | ~20KB (compiled) | > 200KB | ~22KB |
| **Virtual DOM** | **Smart DOM Patching**| Full VDOM | Full VDOM | None (Compiled) | None (Zone.js) | None (Signals) |
| **Component Syntax**| **Native Functions** | JSX | `.vue` files | `.svelte` files | TypeScript Decorators | JSX |
| **Time Travel Debug**| **Built-in `Vault`**| 3rd Party (Redux) | 3rd Party (Pinia) | Manual | 3rd Party (NgRx)| Manual |
| **Universal Imports**| **Built-in `Bridge`**| N/A | N/A | N/A | N/A | N/A |

### Why Developers Choose SimpliJS
1. **No JSX, No Compilation:** You write pure JavaScript Template Literals and Native HTML.
2. **True Modularity without NPM:** You can literally drag and drop the `simplijs.js` CDN tag into a `<script>` and start building enterprise apps in the browser instantly.
3. **Universality via The Bridge:** Want to use a popular React icon Library but hate React's setup? SimpliJS can natively import and mount React, Vue, or Svelte component files over the web via ESM using `The Bridge`!

---

## 📦 Installation & Setup

**Using ES Modules (Recommended via CDN)**
```html
<script type="module">
  import { createApp, component, reactive } from 'https://cdn.jsdelivr.net/gh/Pappa1945-tech/simplijs@v1.0.0-alpha/dist/simplijs.min.js';
  
  // Start coding immediately!
</script>
```

---

## 🛠️ The Feature Guide & "How To"

SimpliJS ships with 12 incredibly powerful native features out of the box. Here is exactly how to use each and every one of them to build your app.

### 1. Declarative Component Registration
Register Custom Elements instantly natively using a setup function.

**How to use:**
```javascript
import { component } from './simplijs.js';

component('hello-world', () => {
  return {
    render: () => `<h1>Hello SimpliJS!</h1>`
  }
});
```
**In HTML:** `<hello-world></hello-world>`

---

### 2. Deeply Reactive State (`reactive`)
SimpliJS uses Proxies to listen to nested data changes. When data changes, components using that data re-render automatically.

**How to use:**
```javascript
import { component, reactive } from './simplijs.js';

component('counter-btn', () => {
  const state = reactive({ count: 0 }); // Reactive Object

  return {
    render: () => `
      <button onclick="this.closest('counter-btn').add()">
        Clicked ${state.count} times
      </button>
    `,
    add: () => { state.count++; }
  }
});
```

---

### 3. Component Props / Attributes
SimpliJS automatically syncs HTML attributes into a reactive `props` object passed nicely into your setup function.

**How to use:**
```javascript
// Automatically syncs <user-badge name="Alice" role="Admin"></user-badge>
component('user-badge', (element, props) => {
  return {
    render: () => `
      <div class="badge">
        <strong>${props.name}</strong> - <span>${props.role}</span>
      </div>
    `
  }
});
```

---

### 4. Direct Event Handling (`@click` / `on:`)
No more `this.closest()` hacks! Bind events cleanly right on the HTML string that map directly back to your component methods.

**How to use:**
```javascript
component('magic-button', () => {
  return {
    wave: () => alert('Hello World!'),
    render: () => `<button @click="wave">Click Me</button>`
  }
});
```
*Note: You can use `@event` or `on:event` (e.g., `@mouseover`, `on:keyup`).*

---

### 5. Computed Properties (`computed`)
Automatically generate lazily evaluated reactive variables based on other reactive dependencies.

**How to use:**
```javascript
import { computed, reactive } from './simplijs.js';

component('math-box', () => {
  const state = reactive({ num: 5 });
  const double = computed(() => state.num * 2);

  return {
    render: () => `<p>Base: ${state.num} | Doubled: ${double.value}</p>`
  }
});
```

---

### 6. Side Effects and Watchers (`watch`)
Execute code specifically when a piece of reactive state mutates, getting the `new` and `old` values cleanly.

**How to use:**
```javascript
import { watch, reactive } from './simplijs.js';

component('search-bar', () => {
  const state = reactive({ query: '' });

  // Watch for state changes
  watch(() => state.query, (newVal, oldVal) => {
    console.log(`User deleted ${oldVal} and typed ${newVal}. Fetching results...`);
  });

  return {
    render: () => `<input oninput="this.closest('search-bar').update(event)"/>`,
    update: (e) => { state.query = e.target.value; }
  }
});
```

---

### 7. DOM Refs (`ref`)
Grab immediate JS access to native DOM elements as soon as they render.

**How to use:**
```javascript
import { ref } from './simplijs.js';

component('auto-focus', () => {
  const myInput = ref();

  return {
    onMount: () => {
      // Direct access to the DOM node!
      myInput.value.focus();
    },
    render: () => `<input ref="myInput" placeholder="I am auto-focused!"/>`
  }
});
```

---

### 8. Full Component Lifecycle Hooks
SimpliJS provides specific moments to intersect the component's timeline.

**How to use:**
```javascript
component('lifecycle-demo', () => {
  return {
    onMount: () => console.log('I was attached to the DOM!'),
    onUpdate: () => console.log('My state/props changed, I re-rendered!'),
    onDestroy: () => console.log('I was removed from the DOM!'),
    onError: (err) => console.error('Safe crash handler!', err.message),
    
    render: () => `<div>Running smoothly.</div>`
  }
});
```

---

### 9. Content Projection (Slots)
Pass structural HTML from the parent directly *into* your child component natively using `<slot>`.

**How to use:**
**Define the Component:**
```javascript
component('modal-card', () => {
  return {
    render: () => `
      <div class="modal">
        <header><slot name="title"></slot></header>
        <main><slot></slot></main>
      </div>
    `
  }
});
```
**Use it in your App HTML:**
```html
<modal-card>
  <h2 slot="title">Warning!</h2>
  <p>Are you sure you want to delete this file?</p>
</modal-card>
```

---

### 10. The Global Event Bus (`emit` / `on`)
Decouple cross-component communication using the lightning-fast native `EventTarget` bus.

**How to use:**
```javascript
import { emit, on } from './simplijs.js';

// Component A
component('sender-btn', () => ({
  send: () => emit('user_logged_in', { id: 123 }),
  render: () => `<button @click="send">Login</button>`
}));

// Component B
component('receiver-nav', () => {
  on('user_logged_in', (data) => console.log('User id:', data.id));
  return { render: () => `<nav>Awaiting Login...</nav>` }
});
```

---

### 11. Automated Form Validation & UI Feedback
Bind automated validation logics without `e.preventDefault()` boilerplates. Automatically highlights invalid inputs with `.is-invalid` classes!

**How to use:**
```javascript
import { createApp } from './simplijs.js';

component('login-form', (el) => {
  
  // Creates a submit form tracker
  const submitLogic = createApp().form({
    fields: ['username', 'password'],
    validate: {
      password: (val) => val.length < 8 ? "Pass too short" : null
    },
    onError: (errors) => {
      console.log('Failing fields:', errors); // Native classes are auto-injected
    },
    submit: (data) => {
      console.log('Validation passed, proceed to API!', data);
    }
  });

  return {
    submitLogic,
    render: () => `
       <form @submit="submitLogic">
         <input name="username" placeholder="Username" />
         <input name="password" type="password" />
         <button type="submit">Submit</button>
       </form>
    `
  }
});
```

---

### 12. 🌉 THE BRIDGE (Universal Component Importer)
Why limit yourself to a framework's ecosystem? **The Bridge** natively dynamically imports React, Vue, or Svelte components straight from a CDN and renders them effortlessly inside your SimpliJS app.

**How to use:**
```javascript
import { use, component } from './simplijs.js';

// Import a React Icon directly from ESM! No Vite, No Webpack.
const ReactIcon = use.react('https://cdn.jsdelivr.net/npm/lucide-react@0.292.0/+esm', 'react-icon');

component('bridge-demo', () => {
  return {
    render: () => `
      <div>
        <h3>Imported natively from React:</h3>
        <!-- You just use it as a normal SimpliJS component! -->
        <react-icon color="green" size="48"></react-icon>
      </div>
    `
  }
});
```

---

### 13. 🕰️ THE TIME VAULT (Universal State Time Travel)
Never lose track of your Global state. `reactive.vault()` generates a magical Proxy that archives every state mutation into a history timeline. You can step Back, step Forward, and even export a Base64 string of the current debug timeline to a URL so your teammate can open the app in the exact same state array!

**How to use:**
```javascript
import { reactive, component } from './simplijs.js';

// Wrap your global state in the Vault
window.appState = reactive.vault({ 
  clicks: 0,
  user: 'Guest' 
});

component('vault-controls', () => {
  return {
    rewind: () => appState.vault.back(),
    fastFwd: () => appState.vault.forward(),
    share: () => {
      // Automatically generates a ?simpli-debug=BASE_64_STRING URL for you!
      const link = appState.vault.share(); 
      prompt("Send this to your friend:", link);
    },
    render: () => `
      <button @click="rewind">Undo Everything</button>
      <button @click="fastFwd">Redo</button>
      <button @click="share">Share Bug Link</button>
    `
  }
});
```

--- 

**Created & Developed by [Subhamoy Bhattacharjee](https://www.sbtech.co.in/)**

*Built with passion, to make web development wonderfully simple again.*
