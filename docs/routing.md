# Routing

SimpliJS comes with a tiny, hash-based router built-in, perfect for Single Page Applications (SPAs).

## Setting up a Router

```javascript
const { createRouter } = SimpliJS;

const router = createRouter({
    '#/': '<h1>Home Page</h1>',
    '#/about': '<h1>About Us</h1>',
    '*': '<h1>404 Not Found</h1>' // Fallback
}, '#app');
```

## Dynamic Routes

Routes can return string literals or functions holding complex logic.

```javascript
const router = createRouter({
    '#/': () => {
        // execute logic before rendering
        return '<home-page></home-page>';
    }
}, '#app');
```
