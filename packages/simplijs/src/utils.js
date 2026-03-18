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
