import { createApp, reactive, component, createRouter, hydrate, warn, error, fadeIn } from '../src/index.js';

// --- 5. Async State Management ---
window.userData = reactive.async(async () => {
  // Simulate network request
  await new Promise(r => setTimeout(r, 1500));
  return { name: "SimpliJS User", role: "Developer" };
});

window.triggerError = () => {
  try {
    const s = reactive({ parent: {} });
    console.log(s.parent.missing.foo); // Should trigger helpful warn/error intercept
  } catch(e) { /* ignored, caught by effect */ }
};

// --- 2. Lifecycle Hooks & Component ---
component('hello-world', (el) => {
  const state = reactive({ clicks: 0 });
  
  return {
    onMount: () => console.log('✅ Component Mounted!'),
    onUpdate: () => {
      console.log('🔄 Component Updated!');
      fadeIn(el.querySelector('span'), 200); // 9. Animation helper
    },
    onDestroy: () => console.log('🗑️ Component Destroyed!'),
    render: () => `
      <div class="box">
        <h3>Component with Lifecycle</h3>
        <p>Clicks: <span>${state.clicks}</span></p>
        <button onclick="this.closest('hello-world').inc()">Increment</button>
      </div>
    `,
    inc: () => state.clicks++
  };
});

// --- 6. Islands Architecture ---
component('lazy-island', () => {
  return `
    <div style="padding: 10px; background: #e0f7fa; border-radius: 4px;">
      🏝️ Successfully Hydrated Island Component!
    </div>
  `;
});

// Manual hydrate call (SimpliJS normally expects user to do this, or via HTMX plugin)
setTimeout(() => hydrate(), 100);

// --- App Setup ---
const app = createApp('#app');

// --- 4. Form Handling ---
window.handleLogin = app.form({
  fields: ['email', 'password'],
  validate: {
    email: (v) => v && v.includes('@') ? null : 'Must be a valid email containing @'
  },
  submit: async (data) => {
    alert('Form submitted successfully!\n' + JSON.stringify(data, null, 2));
  }
});

// --- 8. Routing ---
const routes = {
  '#/home': () => `
    <h2>Home Page</h2>
    <hello-world></hello-world>
    <button onclick="triggerError()">Test Error Intercept (See Console)</button>
  `,
  '#/form': `
    <h2>Form Validation Demo</h2>
    <form onsubmit="handleLogin(event)" class="box">
      <div>
        <label>Email:</label>
        <input name="email" type="text" value="test" />
      </div>
      <br/>
      <div>
        <label>Password:</label>
        <input name="password" type="password" value="pass123" />
      </div>
      <br/>
      <button type="submit">Login</button>
    </form>
  `,
  '#/async': () => `
    <h2>Async State Management Demo</h2>
    <div class="box">
      ${window.userData.loading ? '<p>Loading user data...</p>' : ''}
      ${window.userData.error ? '<p class="error">Error loading data</p>' : ''}
      ${window.userData.value ? `<p>Welcome, <b>${window.userData.value.name}</b> (${window.userData.value.role})!</p>` : ''}
    </div>
  `
};

const router = createRouter(routes, '#app').transition('slide');

app.mount();
