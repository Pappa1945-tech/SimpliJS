# Forms & Validation 📝

Build powerful forms with reactive validation and error handling.

## 1. `s-model`
An advanced two-way binder specifically for forms. It handles checkboxes (booleans), radio buttons, and select lists more intelligently than `s-bind`.

- **Usage**: `<input type="checkbox" s-model="isApproved">`

---

## 2. `s-validate`
Adds reactive validation rules to an input.

- **Usage**: `<input s-bind="email" s-validate="required">`
- **Supported Rules**: Currently supports `required`. Custom rules can be added via the reactive state.

---

## 3. `s-error`
Displays validation errors for a specific field.

- **Usage**: `<span s-error="fieldName"></span>`
- **Example**:
  ```html
  <form s-state="{ email: '' }">
    <input s-bind="email" s-validate="required">
    <span s-error="email" class="text-red"></span>
  </form>
  ```
- **Behavior**: Only shows up when there is an active validation error for the specified field.
