import { render } from './renderer.js';
import { effect } from './reactive.js';

export function createApp(rootSelector) {
  let viewFn = null;

  return {
    view(fn) {
      viewFn = fn;
      return this;
    },
    mount() {
      const root = document.querySelector(rootSelector);
      if (!root) {
        console.error(`[SimpliJS error]: Root element ${rootSelector} not found.`);
        return;
      }
      
      if (viewFn) {
        effect(() => {
          render(root, viewFn());
        });
      }
    }
  }
}
