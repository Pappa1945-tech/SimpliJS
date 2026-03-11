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
    effect: () => effect,
    error: () => error,
    reactive: () => reactive,
    render: () => render,
    warn: () => warn
  });

  // src/reactive.js
  var activeEffect = null;
  function effect(fn) {
    const effectFn = () => {
      activeEffect = effectFn;
      fn();
      activeEffect = null;
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

  // src/renderer.js
  function render(container, html) {
    if (typeof container === "string") {
      container = document.querySelector(container);
    }
    if (container) {
      container.innerHTML = html;
    } else {
      console.warn(`[SimpliJS warn]: render container not found`);
    }
  }

  // src/component.js
  function component(name, setup) {
    if (customElements.get(name)) {
      console.warn(`[SimpliJS warn]: Component ${name} already registered.`);
      return;
    }
    class SimpliComponent extends HTMLElement {
      constructor() {
        super();
      }
      connectedCallback() {
        const renderFn = setup(this);
        if (typeof renderFn === "function") {
          effect(() => {
            this.innerHTML = renderFn();
          });
        } else if (typeof renderFn === "string") {
          this.innerHTML = renderFn;
        }
      }
    }
    customElements.define(name, SimpliComponent);
  }

  // src/router.js
  function createRouter(routes, rootElement = "#app") {
    function handleRoute() {
      const hash = window.location.hash || "#/";
      const route = routes[hash] || routes["*"];
      if (route) {
        if (typeof route === "function") {
          const result = route();
          if (typeof result === "string") {
            render(rootElement, result);
          }
        } else {
          render(rootElement, route);
        }
      } else {
        render(rootElement, "<h1>404 Not Found</h1>");
      }
    }
    window.addEventListener("hashchange", handleRoute);
    window.addEventListener("load", handleRoute);
    return {
      navigate(hash) {
        window.location.hash = hash;
      }
    };
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
            render(root, viewFn());
          });
        }
      }
    };
  }

  // src/utils.js
  function warn(msg) {
    console.warn(`[SimpliJS warn]: ${msg}`);
  }
  function error(msg) {
    console.error(`[SimpliJS error]: ${msg}`);
  }

  // src/index.js
  var VERSION = "0.1.0";
  return __toCommonJS(index_exports);
})();
