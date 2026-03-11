var SimpliJS = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.js
  var index_exports = {};
  __export(index_exports, {
    VERSION: () => VERSION,
    component: () => component,
    createApp: () => createApp,
    createRouter: () => createRouter,
    domPatch: () => domPatch,
    effect: () => effect,
    error: () => error,
    fadeIn: () => fadeIn,
    fadeOut: () => fadeOut,
    hydrate: () => hydrate,
    reactive: () => reactive,
    render: () => domPatch,
    warn: () => warn
  });

  // src/reactive.js
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
  function reactive(obj) {
    if (typeof obj !== "object" || obj === null) return obj;
    const depsMap = /* @__PURE__ */ new Map();
    return new Proxy(obj, {
      get(target, key, receiver) {
        if (activeEffect) {
          let deps = depsMap.get(key);
          if (!deps) {
            deps = /* @__PURE__ */ new Set();
            depsMap.set(key, deps);
          }
          deps.add(activeEffect);
        }
        const res = Reflect.get(target, key, receiver);
        return typeof res === "object" ? reactive(res) : res;
      },
      set(target, key, value, receiver) {
        const result = Reflect.set(target, key, value, receiver);
        const deps = depsMap.get(key);
        if (deps) {
          deps.forEach((effectFn) => effectFn());
        }
        return result;
      }
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

  // src/renderer.js
  function domPatch(container, html) {
    if (typeof container === "string") {
      container = document.querySelector(container);
    }
    if (!container) {
      console.warn(`[SimpliJS warn]: render container not found`);
      return;
    }
    if (!container.hasChildNodes()) {
      container.innerHTML = html;
      return;
    }
    const template = document.createElement("template");
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
      const oldAttrs = oldNode.attributes;
      const newAttrs = newNode.attributes;
      for (let i = oldAttrs.length - 1; i >= 0; i--) {
        const name = oldAttrs[i].name;
        if (!newNode.hasAttribute(name)) {
          oldNode.removeAttribute(name);
        }
      }
      for (let i = 0; i < newAttrs.length; i++) {
        const name = newAttrs[i].name;
        const val = newAttrs[i].value;
        if (oldNode.getAttribute(name) !== val) {
          oldNode.setAttribute(name, val);
        }
      }
      if (oldNode.tagName === "INPUT" || oldNode.tagName === "TEXTAREA") {
        if (oldNode.value !== newNode.value) oldNode.value = newNode.value;
      }
      const oldChildren = Array.from(oldNode.childNodes);
      const newChildren = Array.from(newNode.childNodes);
      const max2 = Math.max(oldChildren.length, newChildren.length);
      for (let i = 0; i < max2; i++) {
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

  // src/component.js
  function component(name, setup) {
    if (typeof customElements === "undefined") return;
    if (customElements.get(name)) {
      console.warn(`[SimpliJS warn]: Component ${name} already registered.`);
      return;
    }
    class SimpliComponent extends HTMLElement {
      constructor() {
        super();
      }
      connectedCallback() {
        const result = setup(this);
        if (typeof result === "function") {
          effect(() => {
            domPatch(this, result());
          });
        } else if (typeof result === "string") {
          this.innerHTML = result;
        } else if (typeof result === "object" && result !== null) {
          this._lifecycle = result;
          Object.keys(result).forEach((key) => {
            if (typeof result[key] === "function" && !["onMount", "onUpdate", "onDestroy", "render"].includes(key)) {
              this[key] = result[key].bind(this);
            }
          });
          if (this._lifecycle.onMount) {
            this._lifecycle.onMount();
          }
          if (this._lifecycle.render) {
            let isFirstUpdate = true;
            effect(() => {
              if (!isFirstUpdate && this._lifecycle.onUpdate) {
                this._lifecycle.onUpdate();
              }
              domPatch(this, this._lifecycle.render());
              isFirstUpdate = false;
            });
          }
        }
      }
      disconnectedCallback() {
        if (this._lifecycle && this._lifecycle.onDestroy) {
          this._lifecycle.onDestroy();
        }
      }
    }
    customElements.define(name, SimpliComponent);
  }

  // src/router.js
  function createRouter(routes, rootElement = "#app") {
    let transitionType = null;
    async function handleRoute() {
      const hash = window.location.hash || "#/";
      let route = routes[hash];
      if (!route && hash.startsWith("#/")) {
        const path = hash === "#/" ? "index" : hash.slice(2);
        try {
          const response = await fetch(`/pages/${path}.html`);
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
    window.addEventListener("hashchange", handleRoute);
    window.addEventListener("load", handleRoute);
    return {
      navigate(hash) {
        window.location.hash = hash;
      },
      transition(type) {
        transitionType = type;
        return this;
      }
    };
  }

  // src/utils.js
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

  // src/core.js
  function createApp(rootSelector) {
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
            domPatch(root, viewFn());
          });
        }
      },
      form(options) {
        return async (e) => {
          e.preventDefault();
          const data = {};
          const formData = new FormData(e.target);
          let hasErrors = false;
          options.fields.forEach((field) => {
            data[field] = formData.get(field);
            if (options.validate && options.validate[field]) {
              const error2 = options.validate[field](data[field], data);
              if (error2) {
                warn(`Validation failed for '${field}'`, error2);
                hasErrors = true;
              }
            }
          });
          if (!hasErrors && options.submit) {
            await options.submit(data);
          }
        };
      }
    };
  }
  function hydrate(rootElement = document) {
    const elements = rootElement.querySelectorAll("[simpli-island]");
    elements.forEach((el) => {
      const componentName = el.getAttribute("simpli-island");
      if (!componentName) return;
      if (!el.hasAttribute("data-hydrated")) {
        const loadStrategy = el.hasAttribute("data-client:idle") ? "idle" : el.hasAttribute("data-client:visible") ? "visible" : "load";
        const doHydrate = () => {
          const customElement = document.createElement(componentName);
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

  // src/index.js
  var VERSION = "0.1.0";
  if (typeof window !== "undefined" && window.htmx) {
    window.htmx.on("htmx:afterSwap", (event) => {
      hydrate(event.detail.target);
    });
  }
  return __toCommonJS(index_exports);
})();
