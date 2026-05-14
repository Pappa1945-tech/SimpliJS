# Event Directives ⚡

Handle user interactions without writing a single line of script.

## 1. Standard Events
Most common events have direct shorthand:

- `s-click`: Triggered on click.
- `s-change`: Triggered on input change (select, checkbox, etc.).
- `s-input`: Triggered on every keystroke in a text field.
- `s-submit`: Triggered on form submission (automatically prevents default).
- `s-hover`: Triggered on mouse enter.

---

## 2. Keyboard Events (`s-key`)
Listen for specific keys with a simple syntax.

- **Usage**: `<input s-key="keyName:expression">`
- **Example**:
  ```html
  <input s-key="enter:sendMsg()" placeholder="Press Enter to send...">
  <input s-key="escape:closeModal()">
  ```

---

## 3. Event Expressions
You can write any valid JavaScript expression inside the event value.

- **Direct Mutation**: `s-click="count++"`
- **Function Call**: `s-click="saveData()"`
- **Logical Toggle**: `s-click="isOpen = !isOpen"`
