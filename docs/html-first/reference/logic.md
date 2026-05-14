# Logic & Loops 🔄

Control the flow and structure of your UI directly in HTML.

## 1. `s-if` / `s-else`
Conditionally render elements based on an expression.

- **Usage**:
  ```html
  <div s-if="isLoggedIn">Welcome back!</div>
  <div s-else>Please sign in.</div>
  ```
- **Behavior**: `s-if` removes the element from the DOM entirely when the condition is false. `s-else` must immediately follow an element with `s-if`.

---

## 2. `s-show` / `s-hide`
Toggles an element's visibility using CSS `display: none`.

- **Usage**:
  ```html
  <div s-show="isVisible">Visible</div>
  <div s-hide="isLoading">Loaded!</div>
  ```
- **Note**: Unlike `s-if`, these keep the element in the DOM, which is faster for frequent toggling.

---

## 3. `s-for`
Render a list of elements by iterating over an array.

- **Usage**: `<li s-for="item in items">`
- **Advanced Syntax**: `<li s-for="item, index in items" s-key="item.id">`
- **Example**:
  ```html
  <ul s-state="{ tasks: ['Code', 'Eat', 'Sleep'] }">
    <li s-for="task in tasks">{task}</li>
  </ul>
  ```
- **Directives for Loops**:
    - `s-key`: Helps SimpliJS optimize DOM updates by tracking unique IDs.
    - `s-index`: Explicitly define the index variable name if needed.
