# Routing in HTML 🚀

Build Single Page Applications (SPA) without writing navigation logic.

## 1. `s-route`
Defines a path associated with a piece of content.

- **Usage**: `<div s-route="/home">...</div>`
- **Note**: These templates are hidden by default and used by `s-view`.

---

## 2. `s-link`
A reactive link that updates the URL and triggers the router without a page reload.

- **Usage**: `<a s-link="/about">Go to About</a>`

---

## 3. `s-view`
The "Outlet" where the active route's content will be rendered.

- **Example**:
  ```html
  <nav s-app>
    <a s-link="/home">Home</a>
    <a s-link="/profile">Profile</a>
  </nav>

  <!-- Route Templates -->
  <div s-route="/home"><h1>Welcome Home!</h1></div>
  <div s-route="/profile"><h1>Your Profile</h1></div>

  <!-- Content Outlet -->
  <main s-view></main>
  ```

---

## 4. How it Works
When you click an `s-link`, SimpliJS updates the `pushState` and notifies all `s-view` elements. The `s-view` element then searches for a matching `s-route` template and injects its content.
