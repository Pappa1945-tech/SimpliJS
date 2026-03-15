# SimpliJS: HTML-First 🚀

## The Goal
In a world of complex build tools and heavy JavaScript frameworks, **SimpliJS HTML-First** returns focus to where applications live: the **DOM**. 

The goal is to allow developers to build **100% reactive applications** directly inside their HTML files, making JavaScript optional for 90% of common UI tasks. No build steps required, no complex state management boilerplate—just standard HTML attributes.

## Why HTML-First?
- **Zero Configuration**: Just include the script and start typing.
- **Extreme Velocity**: Build interactive prototypes in minutes, not hours.
- **Low Cognitive Load**: Uses familiar attribute-based logic similar to HTMX or Alpine.js but with the full power of the SimpliJS reactive engine.
- **Perfect for Multi-Page Apps (MPA)**: Enhance traditional server-rendered templates (PHP, Django, Node) without a full SPA rewrite.

## How it Works
SimpliJS "HTML-First" works through a simple **Scan -> Bind -> React** lifecycle:

1.  **DOM Scan**: When the page loads, SimpliJS scans for the `s-app` attribute.
2.  **Reactive Boundary**: It defines a reactive scope using `s-state` or `s-global`.
3.  **Directive Mapping**: Every `s-*` attribute is mapped to a "Directive" (a piece of logic that handles events, bindings, or rendering).
4.  **Reactive Engine**: SimpliJS wraps your data in a `Proxy`. When you change a value (via input or click), the engine automatically updates only the specific parts of the DOM that depend on that value.

### Example at a Glance
```html
<div s-app s-state="{ count: 0 }">
  <h1>Counter: {count}</h1>
  <button s-click="count++">Increment</button>
</div>
```
That's it. It's truly that simple.
