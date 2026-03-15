var SimpliJS = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
    get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
  }) : x)(function(x) {
    if (typeof require !== "undefined") return require.apply(this, arguments);
    throw Error('Dynamic require of "' + x + '" is not supported');
  });
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
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.js
  var index_exports = {};
  __export(index_exports, {
    VERSION: () => VERSION,
    bus: () => bus,
    component: () => component,
    computed: () => computed,
    createApp: () => createApp,
    createRouter: () => createRouter,
    directives: () => directives,
    domPatch: () => domPatch,
    effect: () => effect,
    emit: () => emit,
    error: () => error,
    fadeIn: () => fadeIn,
    fadeOut: () => fadeOut,
    hydrate: () => hydrate,
    on: () => on,
    reactive: () => reactive,
    ref: () => ref,
    render: () => domPatch,
    use: () => use,
    warn: () => warn,
    watch: () => watch
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
  var proxyCache = /* @__PURE__ */ new WeakMap();
  function reactive(obj, onSet = null) {
    if (typeof obj !== "object" || obj === null) return obj;
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
        const res = Reflect.get(target, key, receiver);
        return typeof res === "object" ? reactive(res, onSet) : res;
      },
      set(target, key, value, receiver) {
        const result = Reflect.set(target, key, value, receiver);
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
    let history = [JSON.parse(JSON.stringify(obj))];
    let currentIndex = 0;
    let pendingSave = false;
    const state = reactive(obj, () => {
      if (isTravelling || pendingSave) return;
      pendingSave = true;
      Promise.resolve().then(() => {
        pendingSave = false;
        if (isTravelling) return;
        const snapshot = JSON.parse(JSON.stringify(obj));
        const last = history[currentIndex];
        if (JSON.stringify(last) !== JSON.stringify(snapshot)) {
          history = history.slice(Math.max(0, currentIndex + 1 - limit), currentIndex + 1);
          history.push(snapshot);
          currentIndex = history.length - 1;
        }
      });
    });
    function applySnapshot(target, snap) {
      if (typeof snap !== "object" || snap === null) return snap;
      for (const key in snap) {
        if (typeof snap[key] === "object" && snap[key] !== null) {
          if (!target[key]) target[key] = Array.isArray(snap[key]) ? [] : {};
          applySnapshot(target[key], snap[key]);
        } else {
          target[key] = snap[key];
        }
      }
    }
    state.vault = {
      back() {
        if (currentIndex > 0) {
          isTravelling = true;
          currentIndex--;
          const snapshot = JSON.parse(JSON.stringify(history[currentIndex]));
          applySnapshot(state, snapshot);
          console.log(`\u23EA Transferred to state snapshot ${currentIndex}`);
          setTimeout(() => isTravelling = false, 0);
        }
      },
      forward() {
        if (currentIndex < history.length - 1) {
          isTravelling = true;
          currentIndex++;
          const snapshot = JSON.parse(JSON.stringify(history[currentIndex]));
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

  // src/renderer.js
  function domPatch(container, html, hostComponent = null) {
    if (typeof container === "string") {
      container = document.querySelector(container);
    }
    if (!container) {
      console.warn(`[SimpliJS warn]: render container not found`);
      return;
    }
    const template = document.createElement("template");
    template.innerHTML = html;
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
          if (oldNode._props && name !== "class" && name !== "style") {
            let castVal = val;
            if (castVal === "") castVal = true;
            else if (castVal === "false") castVal = false;
            else if (!isNaN(castVal)) castVal = Number(castVal);
            oldNode._props[name] = castVal;
          }
        }
      }
      if (newNode._simpliEvents) {
        oldNode._simpliEvents = oldNode._simpliEvents || {};
        Object.keys(newNode._simpliEvents).forEach((type) => {
          if (!oldNode._simpliEvents[type]) {
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
      const max2 = Math.max(oldChildren.length, newChildren.length);
      for (let i = 0; i < max2; i++) {
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
        this._props = reactive({});
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
                domPatch(this, result(), this);
              } catch (err) {
                this._handleError(err);
              }
            });
          } else if (typeof result === "string") {
            domPatch(this, result, this);
          } else if (typeof result === "object" && result !== null) {
            this._lifecycle = result;
            Object.keys(result).forEach((key) => {
              if (typeof result[key] === "function" && !["onMount", "onUpdate", "onDestroy", "onError", "render"].includes(key)) {
                this[key] = result[key].bind(this);
              }
            });
            if (this._lifecycle.onMount) {
              this._lifecycle.onMount();
            }
            if (this._lifecycle.render) {
              let isFirstUpdate = true;
              effect(() => {
                try {
                  if (!isFirstUpdate && this._lifecycle.onUpdate) {
                    this._lifecycle.onUpdate();
                  }
                  domPatch(this, this._lifecycle.render(), this);
                  isFirstUpdate = false;
                } catch (err) {
                  this._handleError(err);
                }
              });
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

  // src/bridge.js
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

  // src/directives.js
  var __g = reactive({});
  console.log("\u{1F680} [SimpliJS] HTML-First Engine v1.0.0 Initialized");
  var SimpliDirectives = class {
    constructor() {
      this.dir = /* @__PURE__ */ new Map();
      this.reg();
    }
    reg() {
      this.dir.set("s-state", (__el, __v, __s) => {
        const __d = this.eval(__v, __s);
        const __c = reactive(Object.create(__s));
        if (__d && typeof __d === "object") Object.assign(__c, __d);
        __el.__s_st = __c;
        return __c;
      });
      this.dir.set("s-global", (__el, __v) => {
        const __d = this.eval(__v, __g);
        if (__d && typeof __d === "object") Object.assign(__g, __d);
      });
      this.dir.set("s-text", (__el, __v, __s) => effect(() => __el.textContent = this.eval(__v, __s) ?? ""));
      this.dir.set("s-html", (__el, __v, __s) => effect(() => __el.innerHTML = this.eval(__v, __s) ?? ""));
      this.dir.set("s-value", (__el, __v, __s) => effect(() => __el.value = this.eval(__v, __s) ?? ""));
      this.dir.set("s-bind", (__el, __v, __s) => {
        effect(() => __el.value = this.eval(__v, __s) ?? "");
        __el.addEventListener("input", () => this.set(__s, __v, __el.value));
      });
      this.dir.set("s-model", (__el, __v, __s) => {
        effect(() => {
          const __val = this.eval(__v, __s);
          if (__el.type === "checkbox") __el.checked = !!__val;
          else if (__el.type === "radio") __el.checked = __el.value === __val;
          else __el.value = __val ?? "";
        });
        __el.addEventListener("change", () => this.set(__s, __v, __el.type === "checkbox" ? __el.checked : __el.value));
      });
      this.dir.set("s-click", (__el, __v, __s) => __el.addEventListener("click", () => this.eval(__v, __s)));
      this.dir.set("s-submit", (__el, __v, __s) => __el.addEventListener("submit", (__e) => {
        __e.preventDefault();
        this.eval(__v, __s);
      }));
      this.dir.set("s-key", (__el, __v, __s, __n) => {
        const __k = __n.split(":")[1];
        if (__k) __el.addEventListener("keydown", (__ev) => {
          if (__ev.key.toLowerCase() === __k.toLowerCase()) this.eval(__v, __s);
        });
      });
      this.dir.set("s-hover", (__el, __v, __s) => __el.addEventListener("mouseenter", () => this.eval(__v, __s)));
      this.dir.set("s-class", (__el, __v, __s) => effect(() => {
        const __cl = this.eval(__v, __s);
        if (typeof __cl === "object") for (const __k in __cl) __el.classList.toggle(__k, !!__cl[__k]);
      }));
      this.dir.set("s-style", (__el, __v, __s) => effect(() => {
        const __st = this.eval(__v, __s);
        if (typeof __st === "object") for (const __k in __st) __el.style[__k] = __st[__k];
      }));
      this.dir.set("s-fetch", (__el, __v, __s) => effect(() => {
        const __u = this.eval(__v, __s);
        if (!__u || typeof __u !== "string") return;
        __s.loading = true;
        __s.error = null;
        fetch(__u).then((__r) => {
          if (!__r.ok) throw Error(`HTTP ${__r.status}`);
          const __ct = __r.headers.get("content-type");
          if (!__ct || !__ct.includes("application/json")) throw Error("Not JSON");
          return __r.json();
        }).then((__d) => {
          __s.data = __d;
          __s.loading = false;
        }).catch((__err) => {
          __s.error = __err.message;
          __s.loading = false;
        });
      }));
      this.dir.set("s-attr", (__el, __v, __s, __n) => {
        const __at = __n.split(":")[1];
        if (__at) effect(() => __el.setAttribute(__at, this.eval(__v, __s)));
      });
      this.dir.set("s-hide", (__el, __v, __s) => effect(() => __el.style.display = this.eval(__v, __s) ? "none" : ""));
      this.dir.set("s-change", (__el, __v, __s) => __el.addEventListener("change", (__e) => this.eval(__v, __s)));
      this.dir.set("s-input", (__el, __v, __s) => __el.addEventListener("input", (__e) => this.eval(__v, __s)));
      this.dir.set("s-memo", (__el, __v) => __el.__m = __v);
      this.dir.set("s-ref", (__el, __v, __s) => __s[__v] = __el);
      this.dir.set("s-for", (__el, __v, __s) => {
        const __m = __v.match(/(.+)\s+in\s+(.+)/);
        if (!__m || !__el.parentNode) return;
        const [_, __itExp, __lsVar] = __m;
        const __tpl = __el.cloneNode(true);
        __tpl.removeAttribute("s-for");
        const __anc = document.createComment(`s-for: ${__v}`);
        __el.parentNode.replaceChild(__anc, __el);
        let __ns = /* @__PURE__ */ new Map();
        effect(() => {
          const __ls = this.eval(__lsVar, __s) || [];
          const __nxt = /* @__PURE__ */ new Map();
          const __kExp = __tpl.getAttribute("s-key");
          __ls.forEach((__it, __i) => {
            const __ist = reactive(Object.create(__s));
            if (__itExp.includes(",")) {
              const [__vj, __idx] = __itExp.split(",").map((__ss) => __ss.trim());
              __ist[__vj] = __it;
              __ist[__idx] = __i;
            } else __ist[__itExp.trim()] = __it;
            const __key = __kExp ? this.eval(__kExp, __ist) : __i;
            let __c = __ns.get(__key);
            if (!__c) {
              __c = __tpl.cloneNode(true);
              this.scan(__c, __ist);
            }
            __nxt.set(__key, __c);
            __anc.parentNode?.insertBefore(__c, __anc);
          });
          __ns.forEach((__n, __k) => {
            if (!__nxt.has(__k)) __n.remove();
          });
          __ns = __nxt;
        });
      });
      this.dir.set("s-if", (__el, __v, __s) => {
        if (!__el.parentNode) return;
        const __tp = __el.cloneNode(true);
        __tp.removeAttribute("s-if");
        const __an = document.createComment(`s-if: ${__v}`);
        let __cur = null;
        effect(() => {
          const __re = !!this.eval(__v, __s);
          __an.__if = __re;
          if (__re && !__cur) {
            __cur = __tp.cloneNode(true);
            this.scan(__cur, __s);
            __an.parentNode?.insertBefore(__cur, __an);
          } else if (!__re && __cur) {
            __cur.remove();
            __cur = null;
          }
        });
        __el.parentNode.replaceChild(__an, __el);
      });
      this.dir.set("s-else", (__el, __v, __s) => {
        if (!__el.parentNode) return;
        const __tp = __el.cloneNode(true);
        __tp.removeAttribute("s-else");
        const __an = document.createComment("s-else");
        let __cur = null;
        effect(() => {
          let __p = __an.previousSibling;
          while (__p && __p.__if === void 0) __p = __p.previousSibling;
          const __re = __p ? !__p.__if : true;
          if (__re && !__cur) {
            __cur = __tp.cloneNode(true);
            this.scan(__cur, __s);
            __an.parentNode?.insertBefore(__cur, __an);
          } else if (!__re && __cur) {
            __cur.remove();
            __cur = null;
          }
        });
        __el.parentNode.replaceChild(__an, __el);
      });
      this.dir.set("s-show", (__el, __v, __s) => effect(() => __el.style.display = this.eval(__v, __s) ? "" : "none"));
      this.dir.set("s-once", (__el) => __el.__o = true);
      this.dir.set("s-ignore", (__el) => __el.__i = true);
      this.dir.set("s-validate", (__el, __v, __s) => {
        const __field = __el.getAttribute("s-bind") || __el.name;
        if (!__field) return;
        __s.$errors = __s.$errors || reactive({});
        effect(() => {
          const __val = this.eval(__field, __s);
          const __err = __v === "required" ? !__val ? "Required" : null : this.eval(__v, __s);
          __s.$errors[__field] = __err;
          __el.classList.toggle("is-invalid", !!__err);
        });
      });
      this.dir.set("s-error", (__el, __v, __s) => effect(() => {
        const __msg = __s.$errors?.[__v] || (__v === "fetch" ? __s.error : null);
        __el.textContent = __msg ?? "";
        __el.style.display = __msg ? "" : "none";
      }));
      this.dir.set("s-loading", (__el, __v, __s) => effect(() => __el.style.display = __s.loading ? "" : "none"));
      this.dir.set("s-route", (__el, __v) => {
        this.routes = this.routes || /* @__PURE__ */ new Map();
        this.routes.set(__v, __el.innerHTML);
        __el.remove();
      });
      this.dir.set("s-view", (__el) => {
        this.view = __el;
        const __upd = () => {
          const __h = window.location.hash.slice(1) || "/";
          const __c = this.routes?.get(__h);
          if (__c) {
            __el.innerHTML = __c;
            this.scan(__el);
          }
        };
        window.addEventListener("hashchange", __upd);
        __upd();
      });
      this.dir.set("s-link", (__el, __v) => __el.addEventListener("click", (__e) => {
        __e.preventDefault();
        window.location.hash = __v;
      }));
      this.dir.set("s-component", (__el, __v, __s) => {
        const __name = this.eval(__v, __s);
        if (!__name) return;
        const __ne = document.createElement(__name);
        Array.from(__el.attributes).forEach((__a) => __ne.setAttribute(__a.name, __a.value));
        __ne.innerHTML = __el.innerHTML;
        __el.replaceWith(__ne);
      });
      this.dir.set("s-prop", (__el, __v, __s, __n) => {
        const __p = __n.split(":")[1];
        if (__p) effect(() => {
          const __val = this.eval(__v, __s);
          __el.setAttribute(__p, typeof __val === "object" ? JSON.stringify(__val) : __val);
          if (__el._props) __el._props[__p] = __val;
        });
      });
      this.dir.set("s-slot", (__el, __v) => __el.setAttribute("slot", __v));
      this.dir.set("s-lazy", (__el, __v, __s) => {
        const __ob = new IntersectionObserver((__es) => {
          if (__es[0].isIntersecting) {
            __el.src = this.eval(__v, __s);
            __ob.disconnect();
          }
        });
        __ob.observe(__el);
      });
    }
    /**
     * Evaluates a JavaScript expression within the given state context.
     * 
     * @security This uses `new Function` and `with(state)` which can be 
     * dangerous if the expression string comes from an untrusted source.
     * Ensure that attribute values (s-*, {interpolation}) are not user-controlled
     * without proper sanitization.
     */
    eval(__e, __s) {
      if (!__e) return;
      const __t = __e.trim();
      const __p = new Proxy(__s, { get: (target, key) => key in target ? target[key] : void 0 });
      try {
        if (__t.startsWith("if") || __t.includes(";")) {
          return new Function("state", `with(state) { ${__t} }`)(__p);
        }
        try {
          return new Function("state", `with(state) { return (${__t}) }`)(__p);
        } catch {
          return new Function("state", `with(state) { return ${__t} }`)(__p);
        }
      } catch (__err) {
        if (!__t.includes("item.") && !["val", "url", "__v"].includes(__t)) console.warn(`[SimpliJS] Eval Error: ${__t}`, __err.message);
      }
    }
    set(__o, __p, __v) {
      const __pts = __p.split(".");
      let __c = __o;
      for (let __i = 0; __i < __pts.length - 1; __i++) __c = __c[__pts[__i]];
      __c[__pts[__pts.length - 1]] = __v;
    }
    scan(__root, __st = __g) {
      if (!__root || __root.__i || __root.hasAttribute && __root.hasAttribute("s-ignore")) return;
      const __walk = (__n, __s) => {
        if (__n.nodeType !== 1 || __n.__i || __n.hasAttribute && __n.hasAttribute("s-ignore")) return;
        const __mA = __n.getAttribute("s-memo");
        if (__mA) {
          const __mv = this.eval(__mA, __s);
          if (__n.__mv === __mv) return;
          __n.__mv = __mv;
        }
        let __cs = __s;
        const __stA = __n.getAttribute("s-state");
        if (__stA) {
          __cs = this.dir.get("s-state")(__n, __stA, __s);
          __n.removeAttribute("s-state");
        }
        const __glA = __n.getAttribute("s-global");
        if (__glA) {
          this.dir.get("s-global")(__n, __glA, __s);
          __n.removeAttribute("s-global");
        }
        const __as = Array.from(__n.attributes);
        let __stop = false;
        __as.forEach((__a) => {
          if (__a.name.startsWith("s-") && __a.name !== "s-state" && __a.name !== "s-global") {
            const __base = __a.name.split(":")[0];
            const __h = this.dir.get(__base);
            if (__h) {
              if (["s-for", "s-if", "s-else"].includes(__base)) __stop = true;
              __h(__n, __a.value, __cs, __a.name);
              __n.removeAttribute(__a.name);
            }
          }
        });
        this.interp(__n, __cs);
        if (!__stop) Array.from(__n.childNodes).forEach((__c) => __walk(__c, __cs));
      };
      __walk(__root, __st);
    }
    interp(__n, __s) {
      if (["CODE", "PRE", "SCRIPT", "STYLE"].includes(__n.tagName)) return;
      __n.childNodes.forEach((__c) => {
        if (__c.nodeType === 3 && __c.textContent.includes("{")) {
          const __orig = __c.textContent;
          const __upd = () => __c.textContent = __orig.replace(/\{(.+?)\}/g, (_, __e) => this.eval(__e.trim(), __s) ?? "");
          if (__n.__o || __n.hasAttribute && __n.hasAttribute("s-once")) __upd();
          else effect(__upd);
        }
      });
    }
    init() {
      document.querySelectorAll("[s-app]").forEach((__a) => this.scan(__a));
    }
  };
  var directives = new SimpliDirectives();

  // src/index.js
  var VERSION = "1.0.0";
  if (typeof window !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => directives.init());
    } else {
      directives.init();
    }
  }
  if (typeof window !== "undefined" && window.htmx) {
    window.htmx.on("htmx:afterSwap", (event) => {
      hydrate(event.detail.target);
      directives.scan(event.detail.target);
    });
  }
  return __toCommonJS(index_exports);
})();
