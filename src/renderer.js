export function domPatch(container, html, hostComponent = null) {
  if (typeof container === 'string') {
    container = document.querySelector(container);
  }
  if (!container) {
    console.warn(`[SimpliJS warn]: render container not found`);
    return;
  }

  const template = document.createElement('template');
  template.innerHTML = html;

  function processNode(node) {
    if (node.nodeType !== Node.ELEMENT_NODE) return node;

    if (node.tagName === 'SLOT' && hostComponent && hostComponent._originalNodes) {
      const slotName = node.getAttribute('name');
      node.innerHTML = '';
      hostComponent._originalNodes.forEach(n => {
        if (n.nodeType === Node.ELEMENT_NODE) {
           if ((slotName && n.getAttribute('slot') === slotName) || (!slotName && !n.hasAttribute('slot'))) {
             node.appendChild(n.cloneNode(true));
           }
        } else if (!slotName) {
           node.appendChild(n.cloneNode(true));
        }
      });
    }

    if (hostComponent) {
      Array.from(node.attributes || []).forEach(attr => {
        if (attr.name === 'ref') {
          if (hostComponent._lifecycle && hostComponent._lifecycle[attr.value]) {
            hostComponent._lifecycle[attr.value].value = node;
          } else {
            hostComponent[attr.value] = { value: node };
          }
        } else if (attr.name.startsWith('@') || attr.name.startsWith('on:')) {
          const eventType = attr.name.replace(/^(@|on:)/, '');
          const handlerName = attr.value;
          node.removeAttribute(attr.name);
          node._simpliEvents = node._simpliEvents || {};
          if (!node._simpliEvents[eventType] && hostComponent[handlerName]) {
             const handler = hostComponent[handlerName].bind(hostComponent);
             node.addEventListener(eventType, handler);
             node._simpliEvents[eventType] = handler;
          }
        }
      });
    }

    Array.from(node.childNodes).forEach(processNode);
    return node;
  }

  const newNodes = Array.from(template.content.childNodes).map(n => processNode(n.cloneNode(true)));
  const oldNodes = Array.from(container.childNodes);

  function patch(oldNode, newNode) {
    if (oldNode.nodeType !== newNode.nodeType || oldNode.nodeName !== newNode.nodeName) {
      oldNode.replaceWith(newNode);
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
            if (oldNode._props && name !== 'class' && name !== 'style') {
              let castVal = val;
              if (castVal === '') castVal = true;
              else if (castVal === 'false') castVal = false;
              else if (!isNaN(castVal)) castVal = Number(castVal);
              oldNode._props[name] = castVal;
            }
        }
    }
    
    // Sync events from processed new node
    if (newNode._simpliEvents) {
      oldNode._simpliEvents = oldNode._simpliEvents || {};
      Object.keys(newNode._simpliEvents).forEach(type => {
        if (!oldNode._simpliEvents[type]) {
           oldNode.addEventListener(type, newNode._simpliEvents[type]);
           oldNode._simpliEvents[type] = newNode._simpliEvents[type];
        }
      });
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
        oldNode.appendChild(newChildren[i]);
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
      container.appendChild(newNodes[i]);
    } else if (!newNodes[i]) {
      container.removeChild(oldNodes[i]);
    } else {
      patch(oldNodes[i], newNodes[i]);
    }
  }
}
