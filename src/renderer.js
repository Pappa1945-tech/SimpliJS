export function domPatch(container, html) {
  if (typeof container === 'string') {
    container = document.querySelector(container);
  }
  if (!container) {
    console.warn(`[SimpliJS warn]: render container not found`);
    return;
  }

  // First render: just set it
  if (!container.hasChildNodes()) {
    container.innerHTML = html;
    return;
  }

  // Simple patching: parse new HTML and sync it
  const template = document.createElement('template');
  template.innerHTML = html;
  const newNodes = Array.from(template.content.childNodes);
  const oldNodes = Array.from(container.childNodes);

  function patch(oldNode, newNode) {
    if (oldNode.nodeType !== newNode.nodeType || oldNode.nodeName !== newNode.nodeName) {
      oldNode.replaceWith(newNode.cloneNode(true));
      return;
    }

    if (oldNode.nodeType === Node.TEXT_NODE) {
      if (oldNode.textContent !== newNode.textContent) {
        oldNode.textContent = newNode.textContent;
      }
      return;
    }

    // Patch attributes
    const oldAttrs = oldNode.attributes;
    const newAttrs = newNode.attributes;
    
    // Remove deleted attributes
    for (let i = oldAttrs.length - 1; i >= 0; i--) {
      const name = oldAttrs[i].name;
      if (!newNode.hasAttribute(name)) {
        oldNode.removeAttribute(name);
      }
    }
    
    // Update or add attributes (Don't overwrite input values if active)
    for (let i = 0; i < newAttrs.length; i++) {
        const name = newAttrs[i].name;
        const val = newAttrs[i].value;
        if (oldNode.getAttribute(name) !== val) {
            oldNode.setAttribute(name, val);
        }
    }
    
    // Sync special properties
    if (oldNode.tagName === 'INPUT' || oldNode.tagName === 'TEXTAREA') {
        if (oldNode.value !== newNode.value) oldNode.value = newNode.value;
    }

    // Patch children recursively
    const oldChildren = Array.from(oldNode.childNodes);
    const newChildren = Array.from(newNode.childNodes);
    const max = Math.max(oldChildren.length, newChildren.length);
    
    for (let i = 0; i < max; i++) {
      if (!oldChildren[i]) {
        oldNode.appendChild(newChildren[i].cloneNode(true));
      } else if (!newChildren[i]) {
        oldNode.removeChild(oldChildren[i]);
      } else {
        patch(oldChildren[i], newChildren[i]);
      }
    }
  }

  const max = Math.max(oldNodes.length, newNodes.length);
  for (let i = 0; i < max; i++) {
    if (!oldNodes[i]) {
      container.appendChild(newNodes[i].cloneNode(true));
    } else if (!newNodes[i]) {
      container.removeChild(oldNodes[i]);
    } else {
      patch(oldNodes[i], newNodes[i]);
    }
  }
}
