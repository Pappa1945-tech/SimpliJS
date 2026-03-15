# SimpliJS 🚀

*"The World's Most Frictionless JavaScript Framework."*

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Size](https://img.shields.io/badge/Size-%3C20KB-orange)](dist/simplijs.js)
[![Status](https://img.shields.io/badge/Status-Alpha-orange)](https://github.com/Pappa1945-tech/SimpliJS)

**SimpliJS** is a lightweight, modern JavaScript framework built for the **Anti-Build Movement**. It returns web development to its core principles: **Zero Configuration, Zero Compilers, and Zero Friction.**

---

## 🏔️ The Vision & Motivation

Modern web development has a discovery problem. To build a simple reactive app, we are told we need a compiler (Vite/Webpack), a meta-framework, and a `node_modules` folder larger than the application itself.

**SimpliJS exists to break this cycle.**

Our vision is to provide a framework that is as powerful as React but as accessible as a standard `<script>` tag. We believe the browser is now powerful enough to handle reactivity, routing, and componentization natively. 

### Modern JavaScript Pain Points We Solve:
1.  **Build Fatigue**: Stop spending hours configuring `babel` or `webpack`. Just save your `.html` file and refresh.
2.  **The "Compiler Tax"**: No more waiting for "Hot Module Replacement" or "Cold Starts". SimpliJS is native ESM.
3.  **Ecosystem Lock-in**: Tired of React-only or Vue-only libraries? **The Bridge** lets you import them all.
4.  **Boilerplate Bloat**: Build full SPAs with 80% less code than traditional frameworks.

---

## 🆚 Why SimpliJS? (The Ultimate Framework Comparison)

When choosing a frontend framework, the cognitive load and setup time matter. SimpliJS cuts through the noise.

| Feature / Trait | **SimpliJS** 🚀 | **React** ⚛️ | **Vue** 🟩 | **Svelte** 🟠 | **Angular** 🅰️ | **SolidJS** 🧊 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Philosophy** | "The Python of JS" | Setup Heavy | Flexible but Split | Compiler Required | Enterprise Heavy | Signals First |
| **Build Tools** | **Zero Config (None)** | Webpack/Vite | Vite | Rollup/Vite | Angular CLI | Vite + Babel |
| **Learning Curve**| **Extremely Easy** | Moderate | Easy/Moderate | Easy/Moderate | Very Steep | Moderate |
| **Size (Minified)**| **< 20KB** | ~130KB | ~100KB | ~20KB (compiled) | > 200KB | ~22KB |
| **Component Syntax**| **Native Functions** | JSX | `.vue` files | `.svelte` files | TypeScript Decorators | JSX |
| **Time Travel Debug**| **Built-in `Vault`**| 3rd Party (Redux) | 3rd Party (Pinia) | Manual | 3rd Party (NgRx)| Manual |
| **Universal Imports**| **Built-in `Bridge`**| N/A | N/A | N/A | N/A | N/A |

### Why Developers Choose SimpliJS
1. **No JSX, No Compilation:** You write pure JavaScript Template Literals and Native HTML.
2. **True Modularity without NPM:** You can literally drag and drop the `simplijs.js` CDN tag into a `<script>` and start building enterprise apps in the browser instantly.
3. **Universality via The Bridge:** Want to use a popular React icon Library but hate React's setup? SimpliJS can natively import and mount React, Vue, or Svelte component files over the web via ESM using `The Bridge`!

---

## 🔥 **HTML-First Mode: Build Reactive Apps in Raw HTML**

SimpliJS introduces a revolutionary **HTML-First** mode that allows you to build full reactive applications using only `s-*` attributes. **JavaScript becomes optional.**

```html
<div s-app s-state="{ count: 0 }">
  <h1>Counter: {count}</h1>
  <button s-click="count++">Increment</button>
</div>
```

### Why developers love HTML-First:
- **Zero JS Boilerplate**: No `createElement`, no `render` functions, just HTML.
- **Native Interactivity**: Directives for loops (`s-for`), conditionals (`s-if`), and sync (`s-bind`).
- **Automated Fetching**: Load data from APIs using `s-fetch` without a single line of script.
- **SPA Ready**: Built-in routing with `s-route` and `s-view`.

👉 **[Explore the HTML-First Documentation](./docs/html-first/introduction.md)** | **[Open the Master Demo Playground](./playground/html-first-master.html)**

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

## 🌍 Real-World Usage

SimpliJS is already powering real production websites. The official website is built **entirely using SimpliJS itself**, without any other JavaScript framework.

🔗 https://www.sbtech.co.in

---

## 🛠️ The Feature Guide & "How To"

SimpliJS ships with 13 incredibly powerful native features out of the box.

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
  const submitLogic = createApp().form({
    fields: ['username', 'password'],
    validate: {
      password: (val) => val.length < 8 ? "Pass too short" : null
    },
    onError: (errors) => {
      console.log('Failing fields:', errors);
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
        <react-icon color="green" size="48"></react-icon>
      </div>
    `
  }
});
```

---

### 13. 🕰️ THE TIME VAULT (Universal State Time Travel)
Never lose track of your Global state. `reactive.vault()` generates a magical Proxy that archives every state mutation into a history timeline. You can step Back, step Forward, and even share a Base64 string of the session!

**How to use:**
```javascript
import { reactive, component } from './simplijs.js';

window.appState = reactive.vault({ 
  clicks: 0,
  user: 'Guest' 
});

component('vault-controls', () => {
  return {
    rewind: () => appState.vault.back(),
    fastFwd: () => appState.vault.forward(),
    share: () => {
      const link = appState.vault.share(); 
      prompt("Send this to your friend:", link);
    },
    render: () => `
      <button @click="rewind">Undo everything</button>
      <button @click="fastFwd">Redo</button>
      <button @click="share">Share Bug Link</button>
    `
  }
});
```

---

## 🚀 HTML-First Reference (Features 14-54)

SimpliJS HTML-First empowers you to build fully reactive, interactive, and data-driven applications directly within your HTML. No build tools. No boilerplate. Just pure declarative power.

#### **CORE BOOTSTRAPPING**
14. **`s-app`**: Marks the boundary for SimpliJS. Everything inside this tag is reactive.
    - **How to use:** `<div s-app>...</div>`
15. **`s-state`**: Initializes local reactive state using simple JSON-like syntax.
    - **How to use:** `<div s-state="{ count: 0 }">...</div>`
16. **`s-global`**: Shared data that persists across multiple `s-app` instances.
    - **How to use:** `<div s-global="{ theme: 'dark' }">...</div>`

#### **DATA BINDING**
17. **`s-bind`**: True 2-way binding for text and number inputs.
    - **How to use:** `<input s-bind="name">`
18. **`s-text`**: Reactive element text content.
    - **How to use:** `<span s-text="name"></span>`
19. **`{expression}`**: Native interpolation inside any text node.
    - **How to use:** `<h1>Hello, {user}!</h1>`
20. **`s-html`**: Injects raw HTML reactively into any container.
    - **How to use:** `<div s-html="content"></div>`
21. **`s-value`**: 1-way sync from state to an input's value.
    - **How to use:** `<input s-value="initial">`
22. **`s-attr`**: Bind any attribute (e.g., `src`, `disabled`).
    - **How to use:** `<img s-attr:src="url">`
23. **`s-class`**: Add/remove CSS classes dynamically via objects.
    - **How to use:** `<div s-class="{ active: isActive }"></div>`
24. **`s-style`**: Reactive inline CSS style objects.
    - **How to use:** `<div s-style="{ color: themeColor }"></div>`

#### **LOGIC & CONTROL FLOW**
25. **`s-if`**: Conditionally adds or removes elements from the DOM.
    - **How to use:** `<div s-if="isLogged">Welcome</div>`
26. **`s-else`**: Logical fallback when an `s-if` condition fails.
    - **How to use:** `<div s-if="isLogged">...</div><div s-else>Login</div>`
27. **`s-show`**: Toggles visibility via CSS `display: none` (faster than `s-if`).
    - **How to use:** `<div s-show="isVisible">...</div>`
28. **`s-hide`**: Inverse visibility helper; hides elements when true.
    - **How to use:** `<div s-hide="isLoading">...</div>`
29. **`s-for`**: High-performance list rendering.
    - **How to use:** `<li s-for="item in items">{item}</li>`
30. **`s-key`**: Unique identifiers for loop items to optimize DOM patching.
    - **How to use:** `<li s-for="item in items" s-key="item.id">...</li>`
31. **`s-index`**: Manual access to the current loop iteration index.
    - **How to use:** `<li s-for="item, i in items">Index: {i}</li>`

#### **EVENTS & INTERACTIVITY**
32. **`s-click`**: Native click listener with access to reactive state.
    - **How to use:** `<button s-click="count++">Add</button>`
33. **`s-change`**: Fires on selection, toggle, or file input changes.
    - **How to use:** `<select s-change="update(event)">...</select>`
34. **`s-input`**: Fires on every single keystroke in a text field.
    - **How to use:** `<input s-input="live = event.target.value">`
35. **`s-submit`**: Handles form submission and automatically prevents default.
    - **How to use:** `<form s-submit="save()">...</form>`
36. **`s-hover`**: Logic that triggers on mouse entrance events.
    - **How to use:** `<div s-hover="msg = 'Hover!'">...</div>`
37. **`s-key:[key]`**: Specific keyboard listeners (e.g., `enter`, `escape`).
    - **How to use:** `<input s-key:enter="search()">`

#### **FORMS & VALIDATION**
38. **`s-model`**: Advanced binder for complex types like checkboxes, radios, and selects.
    - **How to use:** `<input type="checkbox" s-model="done">`
39. **`s-validate`**: Built-in reactive validation (e.g., `required`).
    - **How to use:** `<input s-bind="email" s-validate="required">`
40. **`s-error`**: Displays real-time validation error messages for specific fields.
    - **How to use:** `<span s-error="email"></span>`

#### **ASYNC DATA & FETCHING**
41. **`s-fetch`**: Zero-JS automated JSON fetching from any API endpoint.
    - **How to use:** `<div s-fetch="'/api/data'">...</div>`
42. **`s-loading`**: UI blocks that display only during an active network request.
    - **How to use:** `<div s-loading>Loading...</div>`
43. **`s-error` (fetch)**: UI blocks that display if a network request fails.
    - **How to use:** `<div s-error>Fetch failed!</div>`

#### **COMPONENTS & SLOTS**
44. **`s-component`**: Mounts a registered JS component onto a div or custom tag.
    - **How to use:** `<div s-component="'my-button'"></div>`
45. **`s-prop`**: Passes reactive parent data down to child components.
    - **How to use:** `<my-user s-prop:name="user.name"></my-user>`
46. **`s-slot`**: Projects content into named slots within custom components.
    - **How to use:** `<my-card><h1 s-slot="title">Hello</h1></my-card>`

#### **SPA ROUTING**
47. **`s-route`**: Defines a path-based template directly in the DOM.
    - **How to use:** `<div s-route="/home">...</div>`
48. **`s-view`**: The dynamic outlet where active routes are rendered.
    - **How to use:** `<main s-view></main>`
49. **`s-link`**: History-aware links that navigate without page reloads.
    - **How to use:** `<a s-link="/about">About</a>`

#### **PERFORMANCE & OPTIMIZATION**
50. **`s-lazy`**: Deferred loading for images/assets using Intersection Observer.
    - **How to use:** `<img s-lazy="'path/to/img.jpg'">`
51. **`s-memo`**: Skips DOM re-scans if the memo variable hasn't changed.
    - **How to use:** `<div s-memo="items.length">...</div>`
52. **`s-ref`**: Binds a native DOM element directly into your reactive state object.
    - **How to use:** `<input s-ref="myInput">`
53. **`s-once`**: Freezes a UI block after its initial render for maximum speed.
    - **How to use:** `<div s-once>{time}</div>`
54. **`s-ignore`**: Tells the engine to skip a subtree (perfect for 3rd party libs).
    - **How to use:** `<div s-ignore>...</div>`

---

## 🌐 **Industry-Level SSR & SEO (Static Site Generation)**

SimpliJS is built for the modern web where **SEO, Performance, and Security** are non-negotiable. Our built-in **SSG (Static Site Generation)** engine allows you to pre-render your entire application into highly optimized, search-engine-friendly static HTML with **Secure SSR and Auto-Hydration**.

**Perfect for GitHub Pages, Netlify, and Vercel—No Server Required.**

### 1. High-Level SEO Helpers
Manage your document metadata with ease. SimpliJS handles everything from basic titles to complex OpenGraph and Twitter cards.

```javascript
import { setSEO, setJsonLd, setThemeColor, setBreadcrumbs } from 'simplijs';

// 🚀 Set all essential SEO tags in one call
setSEO({
  title: 'SimpliJS | The Frictionless Framework',
  description: 'Built for the Anti-Build Movement.',
  image: 'https://simplijs.org/og-image.png',
  url: 'https://simplijs.org',
  twitterHandle: '@simplijs'
});

// 📱 Mobile & Branding
setThemeColor('#6a0dad');

// 🍞 Automated Breadcrumb Schema (JSON-LD)
setBreadcrumbs([
  { name: 'Home', url: '/' },
  { name: 'Docs', url: '/docs' }
]);

// 🤖 Structured Data (JSON-LD)
setJsonLd({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "SimpliJS"
});
```

### 2. Pro-Grade SSG Engine (`ssg.js`)
The SimpliJS SSG tool isn't just a renderer; it's a full pre-deployment optimization suite.

- **🗺️ Sitemap Generation**: Automatically creates a perfect `sitemap.xml` for Google.
- **🤖 Robots.txt**: Generates a standard `robots.txt` pointing to your sitemap.
- **🔗 Canonical URLs**: Automatically injects `<link rel="canonical">` to prevent duplicate content issues.
- **⚡ Asset Preloading**: Injects `modulepreload` and `preload` tags for lightning-fast LCP.
- **📻 RSS Feed**: Built-in support for generating `rss.xml` for your blogs or news updates.
- 🚀 HTML Minification: Strips whitespace and comments to deliver the smallest possible byte size.
- 🛡️ **XSS-Safe Rendering**: Built-in HTML escaping for all server-side templates.
- 💧 **Smart Hydration**: Automatically resumes state from SSR and attaches event listeners without full re-renders.
- 🔍 Link Validation: Automatically scans for broken internal links during the build.

### 3. Usage Example
Define your routes and metadata in a simple config file:

**`ssg.config.js`**
```javascript
export default {
  baseUrl: 'https://your-site.com',
  outDir: 'dist',
  minify: true,
  preload: ['/src/index.js', '/styles/main.css'],
  rss: {
    title: 'My News',
    description: 'Latest SimpliJS Updates',
    items: [{ title: 'v1.0 Released!', url: '/news/v1', description: '...' }]
  },
  routes: {
    '/': HomeTemplate,
    '/about': AboutTemplate
  }
};
```

**Build Command:**
```bash
node ssg.js ssg.config.js
```

---

## 🔒 Security Precautions

SimpliJS HTML-First mode uses `new Function()` and `with()` to evaluate expressions in your HTML attributes (`s-*` and `{interpolation}`). 

> [!WARNING]
> **Never bind user-controlled data directly to SimpliJS directives.** If you are displaying user-generated content, always sanitize it beforehand. SimpliJS is designed for developer-authored logic, not for executing untrusted strings.

---

## 🤝 Contributing & Community

Join the mission to make web development wonderfully simple again.
- **Goal**: To be the most used "no-build" framework by 2027.
- **Mission**: Empower developers who want to write code, not configurations.

[GitHub Discussions](https://github.com/Pappa1945-tech/SimpliJS/discussions) | [Contribution Guide](./CONTRIBUTING.md)

--- 

**Created & Developed by [Subhamoy Bhattacharjee](https://www.sbtech.co.in/)**

*Built with passion, to rebuild the web with simplicity.*
