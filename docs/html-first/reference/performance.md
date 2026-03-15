# Advanced & Performance 🚀

Optimize your application and handle complex scenarios.

## 1. `s-lazy`
Lazily loads elements (like images or iframes) only when they enter the viewport.

- **Usage**: `<img s-lazy="'image.jpg'">`
- **Behavior**: Uses the `IntersectionObserver` API to trigger the `src` attribute.

---

## 2. `s-memo`
Prevents unnecessary re-renders of a subtree if the memo value hasn't changed.

- **Usage**: `<div s-memo="items.length">...</div>`
- **Purpose**: High-performance lists or complex UI blocks that don't need to re-scan every time other state changes.

---

## 3. `s-ref`
Directly access a DOM element in your reactive state.

- **Usage**: `<input s-ref="myInput">`
- **Result**: `state.myInput` will now be a reference to that DOM node. Perfect for focus management or manual third-party library integration.

---

## 4. `s-once`
Renders an element and its children exactly once and ignores future updates.

- **Usage**: `<div s-once>Started at: {startTime}</div>`
- **Purpose**: Freezing parts of the UI to save memory and CPU.

---

## 5. `s-ignore`
Tells SimpliJS to completely skip this element and all its children.

- **Usage**: `<div s-ignore>...</div>`
- **Purpose**: Useful when embedding other libraries (like Google Maps or Leaflet) that manage their own DOM.
