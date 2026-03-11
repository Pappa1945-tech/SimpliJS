# Components

Sensible HTML structure built upon native Web Components. 

## Defining a Component

Use the `component` function to define a new Custom Element.

```javascript
const { component } = SimpliJS;

component('my-button', () => {
    // Return a render function that relies on reactive state
    // OR just return an HTML string if it is static.
    
    return () => `
        <button style="background: blue; color: white;">
            Click Me
        </button>
    `;
});
```

Now you can use `<my-button></my-button>` anywhere in your HTML or other components.

## Reactivity inside Components

By returning a function, SimpliJS registers an `effect` automatically. Whenever reactive state changes, only the rendered content of this component is string-diffed and updated natively by the browser's high-speed innerHTML API.
