# Binding Directives 🔗

Connect your data to the DOM effortlessly.

## 1. `s-bind` (2-Way Binding)
Synchronizes form inputs with your state in both directions.

- **Usage**: `<input s-bind="variable">`
- **Example**:
  ```html
  <input s-bind="username">
  <p>Live preview: {username}</p>
  ```

---

## 2. `s-text` / `{variable}`
Updates the text content of an element.

- **Usage**: `<span s-text="message"></span>` or `<span>{message}</span>`
- **Recommendation**: Use `{variable}` for readability inside sentences, and `s-text` for dedicated labels.

---

## 3. `s-html`
Injects raw HTML into an element. **Caution: Only use with trusted content.**

- **Usage**: `<div s-html="content"></div>`

---

## 4. `s-value` (1-Way Binding)
Sets the value of an input from the state, but does not update the state when the input changes.

- **Usage**: `<input s-value="initialValue">`

---

## 5. `s-attr`
Dynamically binds any HTML attribute.

- **Usage**: `<tag s-attr:name="expression">`
- **Example**:
  ```html
  <img s-attr:src="imageUrl" s-attr:alt="imageDescription">
  <button s-attr:disabled="isLoading">Submit</button>
  ```
