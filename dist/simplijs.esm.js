var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// packages/simplijs/src/index_exports.js
var index_exports_exports = {};
__export(index_exports_exports, {
  VERSION: () => VERSION,
  bus: () => bus,
  component: () => component,
  computed: () => computed,
  createApp: () => createApp,
  createRouter: () => createRouter,
  directives: () => directives,
  domPatch: () => domPatch2,
  effect: () => effect,
  emit: () => emit,
  error: () => error,
  fadeIn: () => fadeIn,
  fadeOut: () => fadeOut,
  html: () => html,
  hydrate: () => hydrate,
  on: () => on,
  reactive: () => reactive,
  ref: () => ref,
  render: () => domPatch2,
  renderToStaticMarkup: () => renderToStaticMarkup,
  renderToString: () => renderToString,
  setBreadcrumbs: () => setBreadcrumbs,
  setJsonLd: () => setJsonLd,
  setSEO: () => setSEO,
  setSocialIcons: () => setSocialIcons,
  setThemeColor: () => setThemeColor,
  use: () => use,
  useHead: () => useHead,
  warn: () => warn,
  watch: () => watch
});

// packages/simplijs/src/utils.js
function warn(msg, tip = "") {
  console.warn(`\u26A0\uFE0F [SimpliJS Warn]: ${msg}${tip ? `
\u{1F4A1} Tip: ${tip}` : ""}`);
}
function error(msg, tip = "") {
  console.error(`\u{1F6A8} [SimpliJS Error]: ${msg}${tip ? `
\u{1F4A1} Tip: ${tip}` : ""}`);
}
function fadeIn(el, duration = 300) {
  const element = typeof el === "string" ? document.querySelector(el) : el;
  if (!element) return;
  element.style.opacity = "0";
  element.style.transition = `opacity ${duration}ms ease-in`;
  element.style.display = "";
  requestAnimationFrame(() => element.style.opacity = "1");
}
function fadeOut(el, duration = 300) {
  const element = typeof el === "string" ? document.querySelector(el) : el;
  if (!element) return;
  element.style.transition = `opacity ${duration}ms ease-out`;
  element.style.opacity = "0";
  setTimeout(() => element.style.display = "none", duration);
}
function deepClone(obj, cache = /* @__PURE__ */ new WeakMap()) {
  if (obj === null || typeof obj !== "object") return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);
  if (cache.has(obj)) return cache.get(obj);
  const clone = Array.isArray(obj) ? [] : {};
  cache.set(obj, clone);
  if (obj instanceof Map) {
    const result = /* @__PURE__ */ new Map();
    obj.forEach((value, key) => result.set(deepClone(key, cache), deepClone(value, cache)));
    return result;
  }
  if (obj instanceof Set) {
    const result = /* @__PURE__ */ new Set();
    obj.forEach((value) => result.add(deepClone(value, cache)));
    return result;
  }
  Object.keys(obj).forEach((key) => {
    clone[key] = deepClone(obj[key], cache);
  });
  return clone;
}

// packages/simplijs/src/reactive.js
var activeEffect = null;
function effect(fn) {
  const effectFn = () => {
    activeEffect = effectFn;
    try {
      fn();
    } catch (err) {
      if (err instanceof TypeError && (err.message.includes("undefined") || err.message.includes("null"))) {
        console.error(`\u{1F50D} [SimpliJS Error]: ${err.message}
\u{1F4A1} Tip: You might be accessing a property on an undefined reactive state. Did you forget to initialize it?`);
      } else {
        console.error(err);
      }
    } finally {
      activeEffect = null;
    }
  };
  effectFn();
}
var proxyCache = /* @__PURE__ */ new WeakMap();
function reactive(obj, onSet = null) {
  if (typeof obj !== "object" || obj === null) return obj;
  if (typeof Node !== "undefined" && obj instanceof Node) return obj;
  if (proxyCache.has(obj)) return proxyCache.get(obj);
  const depsMap = /* @__PURE__ */ new Map();
  const proxy = new Proxy(obj, {
    get(target, key, receiver) {
      if (activeEffect) {
        let deps = depsMap.get(key);
        if (!deps) {
          deps = /* @__PURE__ */ new Set();
          depsMap.set(key, deps);
        }
        deps.add(activeEffect);
      }
      const res = Reflect.get(target, key);
      return typeof res === "object" ? reactive(res, onSet) : res;
    },
    set(target, key, value) {
      const result = Reflect.set(target, key, value);
      const deps = depsMap.get(key);
      if (deps) {
        deps.forEach((effectFn) => effectFn());
      }
      if (onSet) onSet();
      return result;
    }
  });
  proxyCache.set(obj, proxy);
  return proxy;
}
function ref(value = null) {
  return reactive({ value });
}
function computed(getter) {
  const result = reactive({ value: null });
  effect(() => {
    result.value = getter();
  });
  return result;
}
function watch(source, callback) {
  let isFirst = true;
  let oldValue;
  effect(() => {
    const newValue = typeof source === "function" ? source() : source;
    if (!isFirst) {
      callback(newValue, oldValue);
    } else {
      isFirst = false;
    }
    oldValue = newValue;
  });
}
reactive.async = function(fn) {
  const state = reactive({
    loading: true,
    error: null,
    value: null
  });
  Promise.resolve(fn()).then((value) => {
    state.value = value;
    state.error = null;
  }).catch((error2) => {
    state.error = error2;
    state.value = null;
  }).finally(() => {
    state.loading = false;
  });
  return state;
};
reactive.vault = function(obj, limit = 50) {
  let isTravelling = false;
  let history = [deepClone(obj)];
  let currentIndex = 0;
  let pendingSave = false;
  const state = reactive(obj, () => {
    if (isTravelling || pendingSave) return;
    pendingSave = true;
    Promise.resolve().then(() => {
      pendingSave = false;
      if (isTravelling) return;
      const snapshot = deepClone(obj);
      const last = history[currentIndex];
      if (JSON.stringify(last) !== JSON.stringify(snapshot)) {
        history = history.slice(Math.max(0, currentIndex + 1 - limit), currentIndex + 1);
        history.push(snapshot);
        currentIndex = history.length - 1;
      }
    });
  });
  function applySnapshot(target, snap) {
    if (typeof snap !== "object" || snap === null) return;
    Object.keys(target).forEach((key) => {
      if (key !== "vault" && !(key in snap)) {
        delete target[key];
      }
    });
    Object.keys(snap).forEach((key) => {
      const value = snap[key];
      if (typeof value === "object" && value !== null && !(value instanceof Node)) {
        if (typeof target[key] !== "object" || target[key] === null) {
          target[key] = Array.isArray(value) ? [] : {};
        }
        applySnapshot(target[key], value);
      } else {
        target[key] = value;
      }
    });
  }
  state.vault = {
    back() {
      if (currentIndex > 0) {
        isTravelling = true;
        currentIndex--;
        const snapshot = deepClone(history[currentIndex]);
        applySnapshot(state, snapshot);
        console.log(`\u23EA Transferred to state snapshot ${currentIndex}`);
        setTimeout(() => isTravelling = false, 0);
      }
    },
    forward() {
      if (currentIndex < history.length - 1) {
        isTravelling = true;
        currentIndex++;
        const snapshot = deepClone(history[currentIndex]);
        applySnapshot(state, snapshot);
        console.log(`\u23E9 Transferred to state snapshot ${currentIndex}`);
        setTimeout(() => isTravelling = false, 0);
      }
    },
    share() {
      const shareData = history.slice(Math.max(0, currentIndex - 10), currentIndex + 1);
      const dbg = btoa(JSON.stringify(shareData));
      const url = new URL(window.location);
      url.searchParams.set("simpli-debug", dbg);
      return url.toString();
    }
  };
  if (typeof window !== "undefined") {
    const params = new URLSearchParams(window.location.search);
    const dbg = params.get("simpli-debug");
    if (dbg) {
      try {
        history = JSON.parse(atob(dbg));
        currentIndex = history.length - 1;
        Object.assign(state, JSON.parse(JSON.stringify(history[currentIndex])));
        console.log(`\u{1F570}\uFE0F [SimpliJS Vault]: Loaded ${history.length} snapshots from shared link.`);
      } catch (e) {
      }
    }
  }
  return state;
};

// packages/simplijs/src/renderer.js
function html(strings, ...values) {
  return strings.reduce((acc, str, i) => acc + str + (values[i] || ""), "");
}
function domPatch2(container, html2, hostComponent = null) {
  if (typeof container === "string") {
    container = document.querySelector(container);
  }
  if (!container) {
    console.warn(`[SimpliJS warn]: render container not found`);
    return;
  }
  const template = document.createElement("template");
  template.innerHTML = html2;
  function processNode(node) {
    if (node.nodeType !== Node.ELEMENT_NODE) return node;
    if (node.tagName === "SLOT" && hostComponent && hostComponent._originalNodes) {
      const slotName = node.getAttribute("name");
      node.innerHTML = "";
      hostComponent._originalNodes.forEach((n) => {
        if (n.nodeType === Node.ELEMENT_NODE) {
          if (slotName && n.getAttribute("slot") === slotName || !slotName && !n.hasAttribute("slot")) {
            node.appendChild(n.cloneNode(true));
          }
        } else if (!slotName) {
          node.appendChild(n.cloneNode(true));
        }
      });
    }
    if (hostComponent) {
      Array.from(node.attributes || []).forEach((attr) => {
        if (attr.name === "ref") {
          if (hostComponent._lifecycle && hostComponent._lifecycle[attr.value]) {
            hostComponent._lifecycle[attr.value].value = node;
          } else {
            hostComponent[attr.value] = { value: node };
          }
        } else if (attr.name.startsWith("@") || attr.name.startsWith("on:")) {
          const eventType = attr.name.replace(/^(@|on:)/, "");
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
  const newNodes = Array.from(template.content.childNodes).map((n) => processNode(n.cloneNode(true)));
  const oldNodes = Array.from(container.childNodes);
  const isHydrating = container.hasAttribute("data-hydrating") || container.closest("[data-hydrating]");
  function patch(oldNode, newNode) {
    if (oldNode.nodeType !== newNode.nodeType || oldNode.nodeName !== newNode.nodeName) {
      if (isHydrating) {
        console.warn(`[SimpliJS Hydration]: Mismatch at ${oldNode.nodeName}. Forcing update.`);
      }
      oldNode.replaceWith(newNode);
      return;
    }
    if (oldNode.nodeType === Node.TEXT_NODE) {
      if (oldNode.textContent !== newNode.textContent) {
        oldNode.textContent = newNode.textContent;
      }
      return;
    }
    const oldAttrs = oldNode.attributes;
    const newAttrs = newNode.attributes;
    if (!isHydrating) {
      for (let i = oldAttrs.length - 1; i >= 0; i--) {
        const name = oldAttrs[i].name;
        if (!newNode.hasAttribute(name)) {
          oldNode.removeAttribute(name);
        }
      }
    }
    for (let i = 0; i < newAttrs.length; i++) {
      const name = newAttrs[i].name;
      const val = newAttrs[i].value;
      if (oldNode.getAttribute(name) !== val) {
        oldNode.setAttribute(name, val);
        if (oldNode._props && !["class", "style", "id"].includes(name)) {
          let castVal = val;
          if (castVal === "") castVal = true;
          else if (castVal === "false") castVal = false;
          else if (castVal === "true") castVal = true;
          else if (val !== "" && !isNaN(val) && !val.includes(" ")) castVal = Number(val);
          oldNode._props[name] = castVal;
        }
      }
    }
    if (newNode._simpliEvents) {
      oldNode._simpliEvents = oldNode._simpliEvents || {};
      Object.keys(newNode._simpliEvents).forEach((type) => {
        if (oldNode._simpliEvents[type] !== newNode._simpliEvents[type]) {
          if (oldNode._simpliEvents[type]) oldNode.removeEventListener(type, oldNode._simpliEvents[type]);
          oldNode.addEventListener(type, newNode._simpliEvents[type]);
          oldNode._simpliEvents[type] = newNode._simpliEvents[type];
        }
      });
    }
    if (oldNode.tagName === "INPUT" || oldNode.tagName === "TEXTAREA") {
      if (oldNode.value !== newNode.value) oldNode.value = newNode.value;
    }
    const oldChildren = Array.from(oldNode.childNodes);
    const newChildren = Array.from(newNode.childNodes);
    const oldKeys = /* @__PURE__ */ new Map();
    oldChildren.forEach((child, index) => {
      const key = child.nodeType === 1 ? child.getAttribute("s-key") : null;
      if (key) oldKeys.set(key, child);
    });
    const max2 = Math.max(oldChildren.length, newChildren.length);
    for (let i = 0; i < max2; i++) {
      const newNodeChild = newChildren[i];
      if (!newNodeChild) {
        if (oldChildren[i]) oldNode.removeChild(oldChildren[i]);
        continue;
      }
      const key = newNodeChild.nodeType === 1 ? newNodeChild.getAttribute("s-key") : null;
      const matchedOldChild = key ? oldKeys.get(key) : oldChildren[i];
      if (!matchedOldChild) {
        oldNode.insertBefore(newNodeChild, oldChildren[i] || null);
      } else if (matchedOldChild !== oldChildren[i] && key) {
        oldNode.insertBefore(matchedOldChild, oldChildren[i]);
        patch(matchedOldChild, newNodeChild);
      } else {
        patch(matchedOldChild, newNodeChild);
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
  if (isHydrating) container.removeAttribute("data-hydrating");
}

// packages/simplijs/src/component.js
function component(name, setup) {
  if (typeof customElements === "undefined") return;
  if (customElements.get(name)) {
    console.warn(`[SimpliJS warn]: Component ${name} already registered.`);
    return;
  }
  class SimpliComponent extends HTMLElement {
    constructor() {
      super();
      this._props = reactive({});
    }
    setAttribute(name2, value) {
      super.setAttribute(name2, value);
      if (this._props) {
        let val = value;
        if (val === "") val = true;
        else if (val === "false") val = false;
        else if (!isNaN(val)) val = Number(val);
        this._props[name2] = val;
      }
    }
    static get observedAttributes() {
      return [];
    }
    attributeChangedCallback(name2, oldVal, newVal) {
      if (oldVal !== newVal && this._props) {
        let val = newVal;
        if (val === "") val = true;
        else if (val === "false") val = false;
        else if (!isNaN(val)) val = Number(val);
        this._props[name2] = val;
      }
    }
    _handleError(err) {
      if (this._lifecycle && this._lifecycle.onError) {
        this._lifecycle.onError(err);
      } else {
        console.error(`\u{1F534} [SimpliJS] ${err.message}`);
        console.debug("Component:", name);
        console.debug("Props/State:", this._props);
      }
    }
    connectedCallback() {
      if (!this._props) this._props = reactive({});
      Array.from(this.attributes).forEach((attr) => {
        let val = attr.value;
        if (val === "") val = true;
        else if (val === "false") val = false;
        else if (!isNaN(val)) val = Number(val);
        this._props[attr.name] = val;
      });
      if (!this._originalNodes && this.hasChildNodes()) {
        this._originalNodes = Array.from(this.childNodes).map((n) => n.cloneNode(true));
      }
      try {
        const result = setup(this, this._props);
        if (typeof result === "function") {
          effect(() => {
            try {
              domPatch2(this, result(), this);
            } catch (err) {
              this._handleError(err);
            }
          });
        } else if (typeof result === "string") {
          domPatch2(this, result, this);
        } else if (typeof result === "object" && result !== null) {
          this._lifecycle = result;
          Object.keys(result).forEach((key) => {
            if (typeof result[key] === "function" && !["onMount", "onUpdate", "onDestroy", "onError", "render"].includes(key)) {
              this[key] = result[key].bind(this);
            }
          });
          if (this._lifecycle.render) {
            let isFirstUpdate = true;
            effect(() => {
              try {
                if (!isFirstUpdate && this._lifecycle.onUpdate) {
                  this._lifecycle.onUpdate();
                }
                domPatch2(this, this._lifecycle.render(), this);
                if (isFirstUpdate && this._lifecycle.onMount) {
                  this._lifecycle.onMount();
                }
                isFirstUpdate = false;
              } catch (err) {
                this._handleError(err);
              }
            });
          } else if (this._lifecycle.onMount) {
            this._lifecycle.onMount();
          }
        }
      } catch (err) {
        this._handleError(err);
      }
    }
    disconnectedCallback() {
      try {
        if (this._lifecycle && this._lifecycle.onDestroy) {
          this._lifecycle.onDestroy();
        }
      } catch (err) {
        this._handleError(err);
      }
    }
  }
  customElements.define(name, SimpliComponent);
}

// packages/simplijs/src/router.js
function createRouter(routes, options = {}) {
  const rootElement = options.root || "#app";
  const mode = options.mode || "hash";
  let transitionType = null;
  if (typeof window !== "undefined") {
    window._simpliRoutes = routes;
  }
  async function handleRoute() {
    let path;
    if (mode === "history") {
      path = window.location.pathname || "/";
    } else {
      const hash = window.location.hash || "#/";
      path = hash === "#/" ? "/" : hash.slice(1);
    }
    let route = routes[path] || routes["#" + path];
    if (!route && path.startsWith("/")) {
      const fileName = path === "/" ? "index" : path.slice(1);
      try {
        const response = await fetch(`/pages/${fileName}.html`);
        if (response.ok) {
          route = await response.text();
        } else {
          route = routes["*"] || "<h1>404 Not Found</h1>";
        }
      } catch (e) {
        route = routes["*"] || "<h1>404 Not Found</h1>";
      }
    } else if (!route) {
      route = routes["*"] || "<h1>404 Not Found</h1>";
    }
    const container = typeof rootElement === "string" ? document.querySelector(rootElement) : rootElement;
    if (transitionType && container) {
      container.style.transition = "opacity 0.2s ease-out, transform 0.2s ease-out";
      container.style.opacity = "0";
      if (transitionType === "slide") container.style.transform = "translateX(-20px)";
      await new Promise((r) => setTimeout(r, 200));
    }
    if (route) {
      if (typeof route === "function") {
        const result = await route();
        if (typeof result === "string") {
          domPatch(rootElement, result);
        }
      } else {
        domPatch(rootElement, route);
      }
    }
    if (transitionType && container) {
      if (transitionType === "slide") container.style.transform = "translateX(20px)";
      requestAnimationFrame(() => {
        container.style.opacity = "1";
        container.style.transform = "translateX(0)";
      });
    }
  }
  if (typeof window !== "undefined") {
    if (mode === "history") {
      window.addEventListener("popstate", handleRoute);
      document.addEventListener("click", (e) => {
        const link = e.target.closest("a");
        if (link && link.href && link.origin === window.location.origin && link.getAttribute("target") !== "_blank" && !link.hasAttribute("data-native")) {
          e.preventDefault();
          window.history.pushState({}, "", link.pathname);
          handleRoute();
        }
      });
    } else {
      window.addEventListener("hashchange", handleRoute);
    }
    window.addEventListener("load", handleRoute);
  }
  return {
    navigate(path) {
      if (mode === "history") {
        window.history.pushState({}, "", path);
        handleRoute();
      } else {
        window.location.hash = path.startsWith("#") ? path : "#" + path;
      }
    },
    transition(type) {
      transitionType = type;
      return this;
    }
  };
}

// packages/simplijs/src/core.js
var bus = (function() {
  const target = new EventTarget();
  const listeners = /* @__PURE__ */ new WeakMap();
  return {
    on(event, callback) {
      const handler = (e) => callback(e.detail);
      listeners.set(callback, handler);
      target.addEventListener(event, handler);
    },
    emit(event, data) {
      target.dispatchEvent(new CustomEvent(event, { detail: data }));
    },
    off(event, callback) {
      const handler = listeners.get(callback);
      if (handler) target.removeEventListener(event, handler);
    }
  };
})();
var emit = bus.emit;
var on = bus.on;
function createApp(rootSelector) {
  let viewFn = null;
  return {
    bus,
    view(fn) {
      viewFn = fn;
      return this;
    },
    mount() {
      if (typeof window === "undefined") return this;
      const root = document.querySelector(rootSelector);
      if (!root) {
        console.error(`[SimpliJS error]: Root element ${rootSelector} not found.`);
        return this;
      }
      if (root.children.length > 0 && !root.hasAttribute("data-hydrated")) {
        hydrate(root);
      }
      if (viewFn) {
        effect(() => {
          domPatch2(root, viewFn());
        });
      }
      return this;
    },
    form(options) {
      return async (e) => {
        e.preventDefault();
        const data = {};
        const formData = new FormData(e.target);
        let hasErrors = false;
        const errors = {};
        Array.from(e.target.elements).forEach((el) => el.classList.remove("is-invalid"));
        options.fields.forEach((field) => {
          data[field] = formData.get(field);
          if (options.validate && options.validate[field]) {
            const error2 = options.validate[field](data[field], data);
            if (error2) {
              warn(`Validation failed for '${field}'`, error2);
              hasErrors = true;
              errors[field] = error2;
              const fieldEl = e.target.elements[field];
              if (fieldEl) fieldEl.classList.add("is-invalid");
            }
          }
        });
        if (hasErrors && options.onError) {
          options.onError(errors);
        }
        if (!hasErrors && options.submit) {
          if (options.onError) options.onError({});
          await options.submit(data);
        }
      };
    }
  };
}
function hydrate(rootElement = document) {
  if (typeof window === "undefined") return;
  const elements = rootElement.querySelectorAll("[simpli-island]");
  elements.forEach((el) => {
    const componentName = el.getAttribute("simpli-island");
    if (!componentName) return;
    if (!el.hasAttribute("data-hydrated")) {
      const loadStrategy = el.hasAttribute("data-client:idle") ? "idle" : el.hasAttribute("data-client:visible") ? "visible" : "load";
      const doHydrate = () => {
        const stateId = el.getAttribute("data-state-id");
        const initialState = window.__SIMPLI_STATE__ && stateId ? window.__SIMPLI_STATE__[stateId] : null;
        const customElement = document.createElement(componentName);
        if (initialState) {
          customElement._initialState = initialState;
        }
        while (el.firstChild) customElement.appendChild(el.firstChild);
        el.replaceWith(customElement);
        customElement.setAttribute("data-hydrated", "true");
      };
      if (loadStrategy === "idle" && "requestIdleCallback" in window) {
        requestIdleCallback(doHydrate);
      } else if (loadStrategy === "visible" && "IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
            doHydrate();
            observer.disconnect();
          }
        });
        observer.observe(el);
      } else {
        doHydrate();
      }
    }
  });
}

// packages/simplijs/src/seo.js
var headConfig = {
  title: "",
  meta: [],
  links: [],
  jsonLd: null
};
var useHead = (config) => {
  const newConfig = typeof config === "function" ? config() : config;
  if (newConfig.meta) {
    headConfig.meta = [...headConfig.meta, ...newConfig.meta];
  }
  if (newConfig.links) {
    headConfig.links = [...headConfig.links, ...newConfig.links];
  }
  if (newConfig.title !== void 0) headConfig.title = newConfig.title;
  if (newConfig.jsonLd !== void 0) headConfig.jsonLd = newConfig.jsonLd;
  if (typeof window !== "undefined") {
    updateHead();
  }
};
var setSEO = (seo) => {
  const { title, description, image, url, type = "website", twitterHandle } = seo;
  const meta = [
    { name: "description", content: description },
    // OpenGraph
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: type },
    { property: "og:url", content: url },
    { property: "og:image", content: image },
    // Twitter
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image }
  ];
  if (twitterHandle) {
    meta.push({ name: "twitter:site", content: twitterHandle });
  }
  useHead({ title, meta });
};
var setJsonLd = (data) => {
  headConfig.jsonLd = data;
  if (typeof window !== "undefined") {
    let script = document.getElementById("simpli-jsonld");
    if (!script) {
      script = document.createElement("script");
      script.id = "simpli-jsonld";
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
  }
};
var setThemeColor = (color) => {
  useHead({
    meta: [{ name: "theme-color", content: color }]
  });
};
var setSocialIcons = (icons = {}) => {
  const links = [];
  if (icons.favicon) links.push({ rel: "icon", href: icons.favicon });
  if (icons.apple) links.push({ rel: "apple-touch-icon", href: icons.apple });
  if (icons.manifest) links.push({ rel: "manifest", href: icons.manifest });
  useHead({ links });
};
var setBreadcrumbs = (items) => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
  setJsonLd(jsonLd);
};
function updateHead() {
  if (headConfig.title) document.title = headConfig.title;
  headConfig.meta.forEach((m) => {
    let el = document.querySelector(`meta[name="${m.name}"]`) || document.querySelector(`meta[property="${m.property}"]`);
    if (!el) {
      el = document.createElement("meta");
      if (m.name) el.setAttribute("name", m.name);
      if (m.property) el.setAttribute("property", m.property);
      document.head.appendChild(el);
    }
    el.setAttribute("content", m.content);
  });
  headConfig.links.forEach((l) => {
    let el = document.querySelector(`link[rel="${l.rel}"][href="${l.href}"]`);
    if (!el) {
      el = document.createElement("link");
      Object.keys(l).forEach((k) => el.setAttribute(k, l[k]));
      document.head.appendChild(el);
    }
  });
}

// packages/simplijs/src/ssr.js
var ESCAPE_MAP = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};
function escapeHTML(str) {
  if (typeof str !== "string") return str;
  return str.replace(/[&<>"']/g, (m) => ESCAPE_MAP[m]);
}
function renderToString(template, options = {}) {
  let html2 = typeof template === "function" ? template() : template;
  if (options.data) {
    html2 = html2.replace(/\{(.+?)\}/g, (_, exp) => {
      const key = exp.trim();
      let value = options.data[key];
      if (value === void 0) return `{${exp}}`;
      return escapeHTML(String(value));
    });
  }
  return html2.trim();
}
function renderToStaticMarkup(content, headHtml = "", template = null) {
  if (template) {
    return template.replace("<!-- simpli-head -->", headHtml).replace("<!-- simpli-app -->", content);
  }
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${headHtml}
</head>
<body>
  <div id="app">${content}</div>
  <script type="module" src="/src/index.js"><\/script>
</body>
</html>
  `.trim();
}

// packages/simplijs/src/bridge.js
var bridgeId = 0;
var use = {
  react: (url, name) => createBridge("react", url, name),
  vue: (url, name) => createBridge("vue", url, name),
  svelte: (url, name) => createBridge("svelte", url, name)
};
function createBridge(type, url, customName) {
  const nameFromUrl = url.split("/").pop().split(".")[0].replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
  let tagName = customName || `${type}-${nameFromUrl || "component"}-${++bridgeId}`;
  if (!tagName.includes("-")) tagName += "-component";
  if (customElements.get(tagName)) return tagName;
  class BridgeElement extends HTMLElement {
    async connectedCallback() {
      this._props = reactive({});
      Array.from(this.attributes).forEach((attr) => {
        let val = attr.value;
        if (val === "") val = true;
        else if (val === "false") val = false;
        else if (!isNaN(val)) val = Number(val);
        const camelName = attr.name.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
        this._props[camelName] = val;
      });
      this.style.display = "contents";
      try {
        const mod = await import(
          /* @vite-ignore */
          url
        );
        const ComponentDef = mod.default || mod;
        if (type === "react") {
          const [{ createElement }, { createRoot }] = await Promise.all([
            import("https://cdn.jsdelivr.net/npm/react@18.2.0/+esm"),
            import("https://cdn.jsdelivr.net/npm/react-dom@18.2.0/client/+esm")
          ]);
          if (!this._reactRoot) {
            this._mountPoint = document.createElement("div");
            this._mountPoint.style.display = "contents";
            this.appendChild(this._mountPoint);
            this._reactRoot = createRoot(this._mountPoint);
          }
          effect(() => {
            this._reactRoot.render(createElement(ComponentDef, { ...this._props }));
          });
        } else if (type === "vue") {
          const { createApp: createApp2, h } = await import("https://esm.sh/vue@3/dist/vue.esm-browser.prod.js");
          this._mountPoint = document.createElement("div");
          this._mountPoint.style.display = "contents";
          this.appendChild(this._mountPoint);
          effect(() => {
            if (this._vueApp) {
              this._vueApp.unmount();
            }
            this._vueApp = createApp2({
              render: () => h(ComponentDef, { ...this._props })
            });
            this._vueApp.mount(this._mountPoint);
          });
        } else if (type === "svelte") {
          effect(() => {
            if (this._svelteInst) {
              this._svelteInst.$set({ ...this._props });
            } else {
              this._svelteInst = new ComponentDef({
                target: this,
                props: { ...this._props }
              });
            }
          });
        }
      } catch (err) {
        console.error(`\u{1F534} [SimpliJS Bridge] Failed to load ${type} component from ${url}`, err);
        this.innerHTML = `<div style="color:red; border:1px solid red; padding:4px;">Failed to load ${type} component</div>`;
      }
    }
    disconnectedCallback() {
      if (this._reactRoot && type === "react") {
        setTimeout(() => this._reactRoot.unmount(), 0);
      } else if (this._vueApp && type === "vue") {
        this._vueApp.unmount();
      } else if (this._svelteInst && type === "svelte") {
        this._svelteInst.$destroy();
      }
    }
  }
  customElements.define(tagName, BridgeElement);
  return tagName;
}

// packages/simplijs/src/directives.js
var globalState = reactive({});
console.log("\u{1F680} [SimpliJS] HTML-First Engine v1.0.0 Initialized");
var SimpliDirectives = class {
  constructor() {
    this.dir = /* @__PURE__ */ new Map();
    this.reg();
  }
  reg() {
    this.dir.set("s-state", (el, val, state) => {
      const data = this.eval(val, state);
      const childState = reactive(Object.create(state));
      if (data && typeof data === "object") Object.assign(childState, data);
      el.__simpliState = childState;
      return childState;
    });
    this.dir.set("s-global", (el, val) => {
      const data = this.eval(val, globalState);
      if (data && typeof data === "object") Object.assign(globalState, data);
    });
    this.dir.set("s-text", (el, val, state) => effect(() => el.textContent = this.eval(val, state, null, true) ?? ""));
    this.dir.set("s-html", (el, val, state) => effect(() => el.innerHTML = this.eval(val, state) ?? ""));
    this.dir.set("s-value", (el, val, state) => effect(() => el.value = this.eval(val, state) ?? ""));
    this.dir.set("s-bind", (el, val, state) => {
      effect(() => el.value = this.eval(val, state) ?? "");
      el.addEventListener("input", () => this.set(state, val, el.value));
    });
    this.dir.set("s-model", (el, val, state) => {
      effect(() => {
        const value = this.eval(val, state);
        if (el.type === "checkbox") el.checked = !!value;
        else if (el.type === "radio") el.checked = el.value === value;
        else el.value = value ?? "";
      });
      el.addEventListener("change", () => this.set(state, val, el.type === "checkbox" ? el.checked : el.value));
    });
    this.dir.set("s-click", (el, val, state) => el.addEventListener("click", () => this.eval(val, state, el)));
    this.dir.set("s-submit", (el, val, state) => el.addEventListener("submit", (e) => {
      e.preventDefault();
      this.eval(val, state, el);
    }));
    this.dir.set("s-key", (el, val, state, name) => {
      const key = name.split(":")[1];
      if (key) el.addEventListener("keydown", (ev) => {
        if (ev.key.toLowerCase() === key.toLowerCase()) this.eval(val, state, el);
      });
    });
    this.dir.set("s-hover", (el, val, state) => el.addEventListener("mouseenter", () => this.eval(val, state, el)));
    this.dir.set("s-class", (el, val, state) => effect(() => {
      const classes = this.eval(val, state);
      if (typeof classes === "object") for (const k in classes) el.classList.toggle(k, !!classes[k]);
    }));
    this.dir.set("s-style", (el, val, state) => effect(() => {
      const styles = this.eval(val, state);
      if (typeof styles === "object") for (const k in styles) el.style[k] = styles[k];
    }));
    this.dir.set("s-fetch", (el, val, state) => effect(() => {
      const url = this.eval(val, state);
      if (!url || typeof url !== "string") return;
      state.loading = true;
      state.error = null;
      fetch(url).then((r) => {
        if (!r.ok) throw Error(`HTTP ${r.status}`);
        const ct = r.headers.get("content-type");
        if (!ct || !ct.includes("application/json")) throw Error("Not JSON");
        return r.json();
      }).then((data) => {
        state.data = data;
        state.loading = false;
      }).catch((err) => {
        state.error = err.message;
        state.loading = false;
      });
    }));
    this.dir.set("s-attr", (el, val, state, name) => {
      const attrName = name.split(":")[1];
      if (attrName) effect(() => el.setAttribute(attrName, this.eval(val, state)));
    });
    this.dir.set("s-hide", (el, val, state) => effect(() => el.style.display = this.eval(val, state) ? "none" : ""));
    this.dir.set("s-change", (el, val, state) => el.addEventListener("change", (e) => this.eval(val, state, el)));
    this.dir.set("s-input", (el, val, state) => el.addEventListener("input", (e) => this.eval(val, state, el)));
    this.dir.set("s-memo", (el, val) => el.__hasMemo = val);
    this.dir.set("s-ref", (el, val, state) => state[val] = el);
    this.dir.set("s-for", (el, val, state) => {
      const match = val.match(/(.+)\s+in\s+(.+)/);
      if (!match || !el.parentNode) return;
      const [_, itemExp, listVar] = match;
      const template = el.cloneNode(true);
      template.removeAttribute("s-for");
      const anchor = document.createComment(`s-for: ${val}`);
      el.parentNode.replaceChild(anchor, el);
      let nodesMap = /* @__PURE__ */ new Map();
      effect(() => {
        const list = this.eval(listVar, state) || [];
        const nextNodesMap = /* @__PURE__ */ new Map();
        const keyExp = template.getAttribute("s-key");
        list.forEach((item, index) => {
          const itemState = reactive(Object.create(state));
          if (itemExp.includes(",")) {
            const [valVar, idxVar] = itemExp.split(",").map((s) => s.trim());
            itemState[valVar] = item;
            itemState[idxVar] = index;
          } else itemState[itemExp.trim()] = item;
          const key = keyExp ? this.eval(keyExp, itemState) : index;
          let node = nodesMap.get(key);
          if (!node) {
            node = template.cloneNode(true);
            this.scan(node, itemState);
          }
          nextNodesMap.set(key, node);
          anchor.parentNode?.insertBefore(node, anchor);
        });
        nodesMap.forEach((node, key) => {
          if (!nextNodesMap.has(key)) node.remove();
        });
        nodesMap = nextNodesMap;
      });
    });
    this.dir.set("s-if", (el, val, state) => {
      if (!el.parentNode) return;
      const template = el.cloneNode(true);
      template.removeAttribute("s-if");
      const anchor = document.createComment(`s-if: ${val}`);
      el.parentNode.replaceChild(anchor, el);
      let current = null;
      effect(() => {
        const result = !!this.eval(val, state);
        anchor.__if = result;
        if (result && !current) {
          current = template.cloneNode(true);
          this.scan(current, state);
          anchor.parentNode?.insertBefore(current, anchor);
        } else if (!result && current) {
          current.remove();
          current = null;
        }
      });
    });
    this.dir.set("s-else", (el, val, state) => {
      if (!el.parentNode) return;
      const template = el.cloneNode(true);
      template.removeAttribute("s-else");
      const anchor = document.createComment("s-else");
      el.parentNode.replaceChild(anchor, el);
      let current = null;
      effect(() => {
        let prev = anchor.previousSibling;
        while (prev && prev.__if === void 0) prev = prev.previousSibling;
        const result = prev ? !prev.__if : true;
        if (result && !current) {
          current = template.cloneNode(true);
          this.scan(current, state);
          anchor.parentNode?.insertBefore(current, anchor);
        } else if (!result && current) {
          current.remove();
          current = null;
        }
      });
    });
    this.dir.set("s-show", (el, val, state) => effect(() => el.style.display = this.eval(val, state) ? "" : "none"));
    this.dir.set("s-once", (el) => el.__once = true);
    this.dir.set("s-ignore", (el) => el.__ignore = true);
    this.dir.set("s-validate", (el, val, state) => {
      const field = el.getAttribute("s-bind") || el.name;
      if (!field) return;
      state.$errors = state.$errors || reactive({});
      effect(() => {
        const fieldValue = this.eval(field, state);
        const error2 = val === "required" ? !fieldValue ? "Required" : null : this.eval(val, state);
        state.$errors[field] = error2;
        el.classList.toggle("is-invalid", !!error2);
      });
    });
    this.dir.set("s-error", (el, val, state) => effect(() => {
      const msg = state.$errors?.[val] || (val === "fetch" ? state.error : null);
      el.textContent = msg ?? "";
      el.style.display = msg ? "" : "none";
    }));
    this.dir.set("s-loading", (el, val, state) => effect(() => el.style.display = state.loading ? "" : "none"));
    this.dir.set("s-route", (el, val) => {
      this.routes = this.routes || /* @__PURE__ */ new Map();
      this.routes.set(val, el.innerHTML);
      el.remove();
    });
    this.dir.set("s-view", (el) => {
      this.view = el;
      const update = () => {
        const hash = window.location.hash.slice(1) || "/";
        const content = this.routes?.get(hash);
        if (content) {
          el.innerHTML = content;
          this.scan(el);
        }
      };
      window.addEventListener("hashchange", update);
      update();
    });
    this.dir.set("s-link", (el, val) => el.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.hash = val;
    }));
    this.dir.set("s-component", (el, val, state) => {
      const name = this.eval(val, state);
      if (!name) return;
      const node = document.createElement(name);
      Array.from(el.attributes).forEach((attr) => {
        if (attr.name !== "s-component") node.setAttribute(attr.name, attr.value);
      });
      node.innerHTML = el.innerHTML;
      el.replaceWith(node);
    });
    this.dir.set("s-prop", (el, val, state, name) => {
      const prop = name.split(":")[1];
      if (prop) effect(() => {
        const value = this.eval(val, state);
        el.setAttribute(prop, typeof value === "object" ? JSON.stringify(value) : value);
        if (el._props) {
          el._props[prop] = value;
        } else {
          el[prop] = value;
        }
      });
    });
    this.dir.set("s-slot", (el, val) => el.setAttribute("slot", val));
    this.dir.set("s-lazy", (el, val, state) => {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          el.src = this.eval(val, state);
          observer.disconnect();
        }
      });
      observer.observe(el);
    });
  }
  /**
   * Evaluates a JavaScript expression within the given state context.
   * 
   * @param {string} exp - The expression to evaluate
   * @param {object} state - The reactive state object
   * @param {HTMLElement} el - Optional reference to the current element ($el)
   * @param {boolean} safe - If true, restricts evaluation to prevent XSS
   */
  eval(exp, state, el = null, safe = false) {
    if (!exp) return;
    const trimmed = exp.trim();
    const isSimpleId = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(trimmed);
    if (isSimpleId && trimmed in state) {
      return state[trimmed];
    }
    const proxy = new Proxy(state, {
      get: (target, key) => {
        if (key === "$el") return el;
        if (safe && ["window", "document", "eval", "Function", "location"].includes(key)) return void 0;
        if (typeof key === "string" && !(key in target) && typeof window !== "undefined" && key in window) {
          if (safe) {
            const whitelist = ["Math", "Date", "JSON", "Number", "String", "Array", "Object", "Boolean"];
            if (!whitelist.includes(key)) return void 0;
          }
          return window[key];
        }
        return target[key];
      },
      has: (target, key) => {
        if (safe && ["window", "document", "eval", "Function", "location"].includes(key)) return false;
        return key === "$el" || key in target || typeof window !== "undefined" && key in window;
      }
    });
    try {
      const code = safe ? `try { with(state) { return (${trimmed}) } } catch(e) { return undefined; }` : `try { with(state) { ${trimmed.includes(";") || trimmed.startsWith("if") ? trimmed : "return (" + trimmed + ")"} } } catch(e) { return undefined; }`;
      const fn = new Function("state", "$el", code);
      return fn(proxy, el);
    } catch (err) {
      if (!trimmed.includes("item.") && !["val", "url", "value"].includes(trimmed)) {
        console.warn(`[SimpliJS] Eval Error: ${trimmed}`, err.message);
      }
    }
  }
  set(obj, path, value) {
    const parts = path.split(".");
    let current = obj;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
  }
  scan(root, state = globalState) {
    if (!root || root.__ignore || root.hasAttribute && root.hasAttribute("s-ignore")) return;
    const walk = (node, currentState) => {
      if (node.nodeType !== 1 || node.__ignore || node.hasAttribute && node.hasAttribute("s-ignore")) return;
      const memoAttr = node.getAttribute("s-memo");
      if (memoAttr) {
        const memoVal = this.eval(memoAttr, currentState);
        if (node.__hasMemo && node.__memoVal === memoVal) return;
        node.__memoVal = memoVal;
        node.__hasMemo = true;
      }
      let activeState = currentState;
      const stateAttr = node.getAttribute("s-state");
      if (stateAttr) {
        const data = this.eval(stateAttr, currentState);
        const childState = reactive(Object.create(currentState));
        if (data && typeof data === "object") Object.assign(childState, data);
        node.__simpliState = childState;
        activeState = childState;
        node.removeAttribute("s-state");
      }
      const globalAttr = node.getAttribute("s-global");
      if (globalAttr) {
        const data = this.eval(globalAttr, globalState);
        if (data && typeof data === "object") Object.assign(globalState, data);
        node.removeAttribute("s-global");
      }
      const attrs = Array.from(node.attributes);
      let stopDeepScan = false;
      attrs.forEach((attr) => {
        if (attr.name.startsWith("s-") && attr.name !== "s-state" && attr.name !== "s-global") {
          const baseName = attr.name.split(":")[0];
          const handler = this.dir.get(baseName);
          if (handler) {
            if (["s-for", "s-if", "s-else"].includes(baseName)) stopDeepScan = true;
            handler(node, attr.value, activeState, attr.name, node);
            node.removeAttribute(attr.name);
          }
        }
      });
      this.interp(node, activeState);
      if (!stopDeepScan) Array.from(node.childNodes).forEach((child) => walk(child, activeState));
    };
    walk(root, state);
  }
  interp(node, state) {
    if (["CODE", "PRE", "SCRIPT", "STYLE"].includes(node.tagName)) return;
    node.childNodes.forEach((child) => {
      if (child.nodeType === 3 && child.textContent.includes("{")) {
        const originalText = child.textContent;
        const update = () => {
          child.textContent = originalText.replace(/\{(.+?)\}/g, (_, exp) => {
            const val = this.eval(exp.trim(), state, null, true);
            return val ?? "";
          });
        };
        if (node.__once || node.hasAttribute && node.hasAttribute("s-once")) update();
        else effect(update);
      }
    });
  }
  init() {
    document.querySelectorAll("[s-app]").forEach((app) => this.scan(app));
  }
};
var directives = new SimpliDirectives();

// packages/simplijs/src/index_exports.js
var VERSION = "v3.2.0";

// packages/simplijs/src/index.js
if (typeof window !== "undefined") {
  window.Simpli = index_exports_exports;
  const { directives: directives2 } = index_exports_exports;
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => directives2.init());
  } else {
    directives2.init();
  }
  if (window.htmx) {
    window.htmx.on("htmx:afterSwap", (event) => {
      hydrate(event.detail.target);
      directives2.scan(event.detail.target);
    });
  }
}
export {
  VERSION,
  bus,
  component,
  computed,
  createApp,
  createRouter,
  directives,
  domPatch2 as domPatch,
  effect,
  emit,
  error,
  fadeIn,
  fadeOut,
  html,
  hydrate,
  on,
  reactive,
  ref,
  domPatch2 as render,
  renderToStaticMarkup,
  renderToString,
  setBreadcrumbs,
  setJsonLd,
  setSEO,
  setSocialIcons,
  setThemeColor,
  use,
  useHead,
  warn,
  watch
};
