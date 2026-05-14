# Reactivity Engine

The heart of SimpliJS. SimpliJS uses JavaScript `Proxy` objects to magically track dependencies.

## `reactive`

Wrap any JavaScript object with `reactive` to make it trackable.

```javascript
const { reactive, effect } = SimpliJS;

const state = reactive({
    count: 0
});
```

Whenever you update `state.count`, any component utilizing `state.count` will re-render automatically!

## `effect`

If you want to run arbitrary code whenever the state changes, use `effect()`:

```javascript
effect(() => {
    console.log("The current count is: " + state.count);
});

// Changing state later:
state.count = 5; 
// Console logs: "The current count is: 5"
```
