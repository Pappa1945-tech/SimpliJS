# Async Data & Fetching 🌐

Seamlessly connect your HTML to external APIs.

## 1. `s-fetch`
Automatically fetches JSON data from a URL and populates the local state.

- **Usage**: `<div s-fetch="'https://api.example.com/data'">`
- **Behavior**:
    - Updates `state.data` with the JSON result.
    - Sets `state.loading` to true while fetching.
    - Sets `state.error` to the error message if the fetch fails.

---

## 2. `s-loading` / `s-error`
Helper directives to handle the byproduct of `s-fetch`.

- **Usage**:
  ```html
  <div s-state="{ data: null, loading: false }">
    <button s-click="sFetch('/api/users')">Load Users</button>
    
    <div s-loading>Loading...</div>
    
    <div s-error>Failed to load data.</div>

    <ul s-if="data">
       <li s-for="user in data">{user.name}</li>
    </ul>
  </div>
  ```

---

## 3. Best Practices
- Initialize `data` as `null` and `loading` as `false` in your `s-state` to avoid undefined errors before the first fetch.
- Use `s-fetch` inside an element that also has `s-state` to keep the data scoped.
