# Components & Slots 🧩

Modularize your HTML using SimpliJS components.

## 1. `s-component`
Mounts a registered SimpliJS component onto an element.

- **Usage**: `<div s-component="'my-button'"></div>`
- **Behavior**: Replaces the element with the live SimpliJS component.

---

## 2. `s-prop`
Passes reactive data down to a component as a property.

- **Usage**: `<user-card s-prop:username="currentName">`
- **Reactive**: If `currentName` in the parent state changes, the prop in the child component updates automatically.

---

## 3. `s-slot`
Maps content from your HTML-first template into a specific slot in a component.

- **Usage**:
  ```html
  <layout-component s-component="'my-layout'">
      <h1 s-slot="header">Title</h1>
      <p s-slot="body">Content goes here.</p>
  </layout-component>
  ```
