export function warn(msg, tip = '') {
  console.warn(`⚠️ [SimpliJS Warn]: ${msg}${tip ? `\n💡 Tip: ${tip}` : ''}`);
}

export function error(msg, tip = '') {
  console.error(`🚨 [SimpliJS Error]: ${msg}${tip ? `\n💡 Tip: ${tip}` : ''}`);
}

export function fadeIn(el, duration = 300) {
  const element = typeof el === 'string' ? document.querySelector(el) : el;
  if (!element) return;
  element.style.opacity = '0';
  element.style.transition = `opacity ${duration}ms ease-in`;
  element.style.display = '';
  requestAnimationFrame(() => element.style.opacity = '1');
}

export function fadeOut(el, duration = 300) {
  const element = typeof el === 'string' ? document.querySelector(el) : el;
  if (!element) return;
  element.style.transition = `opacity ${duration}ms ease-out`;
  element.style.opacity = '0';
  setTimeout(() => element.style.display = 'none', duration);
}
export function deepClone(obj, cache = new WeakMap()) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);
  if (cache.has(obj)) return cache.get(obj);

  const clone = Array.isArray(obj) ? [] : {};
  cache.set(obj, clone);

  if (obj instanceof Map) {
    const result = new Map();
    obj.forEach((value, key) => result.set(deepClone(key, cache), deepClone(value, cache)));
    return result;
  }
  if (obj instanceof Set) {
    const result = new Set();
    obj.forEach(value => result.add(deepClone(value, cache)));
    return result;
  }

  Object.keys(obj).forEach(key => {
    clone[key] = deepClone(obj[key], cache);
  });
  return clone;
}
