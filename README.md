<div align="center">
  <img src="https://via.placeholder.com/150x50/0066cc/ffffff?text=SimpliJS" alt="SimpliJS Logo" style="border-radius: 8px;" />
  <h3>The Python of JavaScript frameworks.</h3>
  <p>
    <img alt="NPM Version" src="https://img.shields.io/badge/npm-v0.1.0-blue?style=flat-square">
    <img alt="License" src="https://img.shields.io/badge/license-MIT-green?style=flat-square">
    <img alt="Bundle Size" src="https://img.shields.io/badge/minified-<2_KB-success?style=flat-square">
  </p>
</div>

---

SimpliJS is a remarkably lightweight (< 2KB minified), modern JavaScript framework designed for absolute simplicity, speed, and zero configuration. 

It allows developers to build modern web applications using clean syntax and native browser capabilities without the burden of complex tooling or heavy dependencies.

## Quick Look

Developers judge frameworks within 10 seconds. Here is why SimpliJS wins:

```html
<div id="app"></div>

<script src="https://cdn.jsdelivr.net/gh/yourusername/simplijs/dist/simplijs.min.js"></script>
<script>
    const { createApp, reactive } = SimpliJS;

    const app = createApp("#app");

    const state = reactive({
        count: 0
    });

    app.view(() => `
        <h1>${state.count}</h1>
        <button onclick="state.count++">+</button>
    `);

    app.mount();
</script>
```
*No build steps. No Webpack. No complex boilerplate. Just pure, reactive joy.*

---

## Features

- **Extremely Small**: ~2KB minified bundle.
- **Zero Configuration**: No build tools required (webpack, vite, babel, etc.). Drop it in a `<script>` tag and start building.
- **Reactivity Engine**: Proxy-based seamless state management.
- **Component System**: Based on native Web Components (`customElements`).
- **Simple Router**: Included hash-based router.

## Documentation

See the [`docs/`](./docs) folder for more details:
- [Installation](./docs/installation.md)
- [Quick Start](./docs/quick-start.md)
- [Components](./docs/components.md)
- [Reactivity Engine](./docs/reactivity.md)
- [Routing](./docs/routing.md)

## Try the Playground

Check the `playground/` directory for a functional, interactive environment built using SimpliJS. Open `playground/index.html` directly in your browser.

## License

MIT
