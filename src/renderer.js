export function render(container, html) {
  if (typeof container === 'string') {
    container = document.querySelector(container);
  }
  if (container) {
    container.innerHTML = html;
  } else {
    console.warn(`[SimpliJS warn]: render container not found`);
  }
}
