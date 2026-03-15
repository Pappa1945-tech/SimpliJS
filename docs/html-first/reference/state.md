# State Directives 💎

Manage the reactive scope and data of your application.

## 1. `s-app`
Marks the root of a SimpliJS application. SimpliJS will only scan and manage elements inside an `s-app` boundary.

- **Usage**: `<div s-app>`
- **Behavior**: Initializes the framework and starts the DOM scanner.

---

## 2. `s-state`
Creates a local reactive state for an element and its children.

- **Usage**: `<div s-state="{ key: value }">`
- **Example**:
  ```html
  <div s-state="{ count: 0 }">
    <button s-click="count++">{count}</button>
  </div>
  ```
- **Note**: State is scoped. Child elements can access parent state, but parents cannot see child `s-state` variables.

---

## 3. `s-global`
Defines data that should be accessible globally across all `s-app` instances on the page.

- **Usage**: `<div s-global="{ user: 'Admin' }">`
- **Purpose**: Shared state like themes, user authentication status, or configuration.
- **Example**:
  ```html
  <nav s-global="{ theme: 'dark' }">...</nav>
  <main s-app>
      <div s-class="{ 'bg-dark': theme === 'dark' }">Hello World</div>
  </main>
  ```
