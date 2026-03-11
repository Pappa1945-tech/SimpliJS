# SimpliJS 🚀

*"The Python of JavaScript Frameworks."*

SimpliJS is a lightweight, modern JavaScript framework designed for **simplicity**, **performance**, and **zero configuration**. It brings web development back to its core principles by removing unnecessary complexity, allowing developers to focus on building powerful applications instead of managing tools and heavy dependencies.

### Why SimpliJS?
- **Extremely Simple:** A clean, intuitive, and beautiful syntax that feels natural.
- **Extremely Small:** < 20KB minified and compressed.
- **Zero Configuration & No Build Tools:** Just drop it into your HTML via a CDN or local import and start coding.
- **Beginner Friendly:** Flattens the learning curve. If you know HTML and JS, you know SimpliJS.
- **Fast Performance:** Uses a highly efficient internal Virtual DOM patcher (`domPatch`) for reactive updates without destroying state or event listeners.

---

## 📦 Installation & Setup

Unlike complex modern toolchains, setting up SimpliJS takes less than 10 seconds.

**Option 1: Using ES Modules (Recommended)**
```html
<script type="module">
  import { createApp, component, reactive } from './path/to/simplijs/dist/simplijs.js';
  
  // Your code here
</script>
```

**Option 2: Direct Script Tag (Global Namespace)**
```html
<script src="./path/to/simplijs/dist/simplijs.min.js"></script>
<script>
  // All tools are available under the global SimpliJS object
  const { createApp, component, reactive } = SimpliJS;
</script>
```

---

## 🛠️ The Core Concepts

SimpliJS heavily revolves around native **Web Components** and **Reactive state**. It provides wrapper tools that make interacting with the DOM a breeze.

- `reactive(object)`: Creates deeply reactive state. Any component tracking this state updates seamlessly when it changes.
- `component('name', setupFn)`: Registers a Custom HTML Element cleanly.
- `createApp('selector')`: Mounts advanced features like automated Form handling to a parent container.
- `createRouter(routes)`: A fast, integrated Hash Router with File-based routing fallback capabilities.

---

## 🌟 5 Real-World Implementation Examples

SimpliJS is easiest to master through practice. Here are 5 practical, robust examples of how developers can use SimpliJS to build real-world applications.

### Example 1: The Reactive Counter (Basic State & Components)

The quintessential first example. This demonstrates how to define a reusable custom element with scoped reactive state and interaction mapping.

```html
<!-- index.html -->
<my-counter></my-counter>
<my-counter></my-counter> <!-- Reusable! -->

<script type="module">
  import { component, reactive } from './simplijs.js';

  // Define a new component `<my-counter>`
  component('my-counter', (el) => {
    
    // 1. Define Reactive State
    const state = reactive({ clicks: 0 });

    return {
      // 2. Lifecycle Hooks
      onMount: () => console.log('Counter rendered!'),

      // 3. The UI Template (Updates automatically when state changes)
      render: () => `
        <div style="padding: 1rem; border: 1px solid #ccc;">
          <h3>Count: ${state.clicks}</h3>
          <!-- Event handlers can easily call our component methods -->
          <button onclick="this.closest('my-counter').increment()">Add +1</button>
        </div>
      `,

      // 4. Component Methods mapping
      increment: () => {
        state.clicks++;
      }
    };
  });
</script>
```

### Example 2: Interactive To-Do List (Collections & Complex State)

Managing lists of items is notoriously verbose in vanilla JS. SimpliJS's `domPatch` algorithm ensures input focus is preserved gracefully while the list updates reactively.

```html
<todo-app></todo-app>

<script type="module">
  import { component, reactive } from './simplijs.js';

  component('todo-app', (el) => {
    // Deeply reactive state array
    const state = reactive({
      tasks: [
        { id: 1, text: "Learn SimpliJS", done: true },
        { id: 2, text: "Build an app", done: false }
      ]
    });

    return {
      render: () => `
        <div class="todo-wrapper">
          <h2>My Tasks</h2>
          <ul>
            ${state.tasks.map(task => `
              <li style="text-decoration: ${task.done ? 'line-through' : 'none'}">
                <input 
                  type="checkbox" 
                  ${task.done ? 'checked' : ''} 
                  onchange="this.closest('todo-app').toggleTask(${task.id})"
                />
                ${task.text}
                <button onclick="this.closest('todo-app').removeTask(${task.id})">❌</button>
              </li>
            `).join('')}
          </ul>
          
          <input type="text" id="newTask" placeholder="Add a task..." />
          <button onclick="this.closest('todo-app').addTask()">Add</button>
        </div>
      `,

      addTask: () => {
        const input = el.querySelector('#newTask');
        if (input.value.trim() === '') return;
        state.tasks.push({ id: Date.now(), text: input.value, done: false });
        input.value = ''; // clear input
      },

      removeTask: (id) => {
        state.tasks = state.tasks.filter(t => t.id !== id);
      },

      toggleTask: (id) => {
        const task = state.tasks.find(t => t.id === id);
        if (task) task.done = !task.done;
      }
    };
  });
</script>
```

### Example 3: User Authentication (Declarative Form Handling & Validation)

Handling `e.preventDefault()`, extracting `FormData`, and performing custom validation on multiple fields is frustrating. SimpliJS extracts this into a declarative JSON format attached directly to your container wrapper `app`.

```html
<div id="auth-app">
  <form onsubmit="handleLogin(event)">
    <label>Email ID:</label>
    <input name="email" type="email" required />
    
    <label>Secure Password:</label>
    <input name="password" type="password" required />
    
    <button type="submit">Sign In</button>
  </form>
</div>

<script type="module">
  import { createApp } from './simplijs.js';

  // Target the container wrapper
  const app = createApp('#auth-app');

  // Create an automated Form handler interceptor and bind it globally for the template
  window.handleLogin = app.form({
    fields: ['email', 'password'],
    
    // Custom Validation Rules
    validate: {
      password: (val) => val.length >= 8 ? null : 'Password must be at least 8 chars',
      email: (val) => val.includes('@corp.com') ? null : 'Must use corporate email address'
    },
    
    // Triggered only if all validations pass
    submit: async (data) => {
      console.log('Valid Submission Payload:', data);
      alert(`Welcome back, ${data.email}!`);
      // Example API call: await fetch('/api/login', { method: 'POST', body: JSON.stringify(data) })
    }
  });

  app.mount();
</script>
```
*Tip: Any validation failures will automatically be elegantly captured and displayed in the Developer tools console as a `[SimpliJS Warn]` intercept.*

### Example 4: The Data Fetching Dashboard (Async Reactive State)

Modern apps rely heavily on REST APIs. SimpliJS provides `reactive.async(fn)` to entirely automate generating `loading`, `error`, and `value` states from any Promise.

```html
<finance-dashboard></finance-dashboard>

<script type="module">
  import { component, reactive } from './simplijs.js';

  component('finance-dashboard', () => {
    
    // SimpliJS automatically creates { loading, error, value } reactive properties
    const marketData = reactive.async(async () => {
      const response = await fetch('https://api.example.com/stocks');
      if (!response.ok) throw new Error("Stocks API is down!");
      return await response.json();
    });

    return {
      render: () => {
        // Handle rendering completely declaratively based on the network state
        if (marketData.loading) {
          return `<div class="spinner">Loading Market Data...</div>`;
        }

        if (marketData.error) {
          return `<div class="error-box">Critical Error: ${marketData.error.message}</div>`;
        }

        // Data retrieved successfully
        const stocks = marketData.value;
        return `
          <div class="dashboard">
            <h2>Live Ticker</h2>
            <ul>
               ${stocks.map(stock => `<li>${stock.symbol}: $${stock.price}</li>`).join('')}
            </ul>
          </div>
        `;
      }
    };
  });
</script>
```

### Example 5: Single Page Applications (Routing & Page Transitions)

No need for external heavy routing libraries like `react-router`. SimpliJS ships with a fully automated hash router that seamlessly patches the DOM and supports **automatic animated transitions**. It *even* automatically falls back to fetching missing raw HTML files from a `/pages/` directory on your server.

```html
<nav>
  <a href="#/home">Home</a>
  <a href="#/dashboard">Dashboard</a>
  <a href="#/about">About Us</a>
</nav>

<!-- The Router Target Container -->
<div id="router-view"></div>

<script type="module">
  import { createRouter } from './simplijs.js';

  const routes = {
    // 1. String-based Route
    '#/home': `<h1>Welcome to the SimpliJS Demo!</h1><p>The Python of JavaScript</p>`,
    
    // 2. Component-based Route
    '#/dashboard': `<finance-dashboard></finance-dashboard>`,
    
    // 3. Dynamic Future Routes
    // If a user navigates to '#/about' but it's not defined here, 
    // SimpliJS will automatically run fetch('/pages/about.html') 
    // and inject its contents without a full page reload!
  };

  // Bind to the #router-view and apply a built-in 'slide' CSS transition animation
  const router = createRouter(routes, '#router-view').transition('slide');
</script>
```

---

## 🏗️ Recommended Project Structure

While SimpliJS doesn't force any strict rules, we highly recommend the following structure for production applications to keep your code scalable and organized.

```text
my-simplijs-app/
├── index.html           # The main entry wrapper containing <div id="app"></div>
├── src/
│   ├── app.js           # Main JS file (initializes Router & createApp)
│   ├── state.js         # Global reactive state (if you need it shared across pages)
│   └── components/      # Reusable Custom Elements
│       ├── NavBar.js
│       └── UserProfile.js
├── pages/               # HTML snippets for file-based routing
│   ├── dashboard.html
│   └── settings.html
└── package.json         # Optional, only if you want to use npm packages
```

**Step-by-step approach for a large app:**
1. Define all your reusable UI parts in `src/components/`, importing SimpliJS in each file.
2. In `index.html`, load your main `app.js` using `<script type="module" src="/src/app.js"></script>`.
3. In `app.js`, import all your components, set up your `createRouter()` logic, and finally call `app.mount()`.

---

## 🏗️ Advanced Principles

#### Islands Architecture (`[simpli-island]`)
If your project is server-side rendered (SSR - PHP, Node, Python, etc.) but you want islands of reactivity, SimpliJS excels.

Place custom attributes directly on static HTML:
```html
<!-- Hydrates upon load -->
<div simpli-island="my-counter"></div>

<!-- Lazy Hydrates only when the browser has idle CPU time -->
<div simpli-island="lazy-widget" data-client:idle></div>

<!-- Hydrates only when the browser user scrolls it into view -->
<div simpli-island="heavy-chart" data-client:visible></div>
```
Call `hydrate()` to attach logic selectively to those islands.

--- 

*Built with passion, to make web development wonderfully simple again.*
