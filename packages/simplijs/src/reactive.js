/**
 * SimpliJS - The Python of JavaScript Frameworks
 * Copyright (c) 2026 Subhamoy Bhattacharjee
 * Website: https://www.sbtech.co.in
 * 
 * Licensed under Apache License 2.0
 * See LICENSE file for full terms
 * 
 * @author Subhamoy Bhattacharjee
 * @website https://www.sbtech.co.in
 * @repository https://github.com/Pappa1945-tech/SimpliJS
 */
import { deepClone } from './utils.js';

let activeEffect = null;

export function effect(fn) {
  const effectFn = () => {
    activeEffect = effectFn;
    try {
      fn();
    } catch (err) {
      if (err instanceof TypeError && (err.message.includes('undefined') || err.message.includes('null'))) {
        console.error(`🔍 [SimpliJS Error]: ${err.message}\n💡 Tip: You might be accessing a property on an undefined reactive state. Did you forget to initialize it?`);
      } else {
        console.error(err);
      }
    } finally {
      activeEffect = null;
    }
  };
  effectFn();
}

const proxyCache = new WeakMap();

export function reactive(obj, onSet = null) {
  if (typeof obj !== 'object' || obj === null) return obj;
  if (typeof Node !== 'undefined' && obj instanceof Node) return obj;
  if (proxyCache.has(obj)) return proxyCache.get(obj);
  
  const depsMap = new Map();

  const proxy = new Proxy(obj, {
    get(target, key, receiver) {
      if (activeEffect) {
        let deps = depsMap.get(key);
        if (!deps) {
          deps = new Set();
          depsMap.set(key, deps);
        }
        deps.add(activeEffect);
      }
            const res = Reflect.get(target, key, receiver);
            if (typeof res === 'function') return res.bind(target);
            return (typeof res === 'object' && res !== null) ? reactive(res, onSet) : res;
      
    },
    set(target, key, value) {
      const result = Reflect.set(target, key, value);
      const deps = depsMap.get(key);
      if (deps) {
        deps.forEach(effectFn => effectFn());
      }
      if (onSet) onSet();
      return result;
    }
  });

  proxyCache.set(obj, proxy);
  return proxy;
}

export function ref(value = null) {
  return reactive({ value });
}

export function computed(getter) {
  const result = reactive({ value: null });
  effect(() => {
    result.value = getter();
  });
  return result;
}

export function watch(source, callback) {
  let isFirst = true;
  let oldValue;
  effect(() => {
    const newValue = typeof source === 'function' ? source() : source;
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

  Promise.resolve(fn())
    .then(value => {
      state.value = value;
      state.error = null;
    })
    .catch(error => {
      state.error = error;
      state.value = null;
    })
    .finally(() => {
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
      // Basic check to avoid redundant history entries
      if (JSON.stringify(last) !== JSON.stringify(snapshot)) {
        history = history.slice(Math.max(0, currentIndex + 1 - limit), currentIndex + 1);
        history.push(snapshot);
        currentIndex = history.length - 1;
      }
    });
  });

  function applySnapshot(target, snap) {
    if (typeof snap !== 'object' || snap === null) return;
    
    // Deletion sync
    Object.keys(target).forEach(key => {
      if (key !== 'vault' && !(key in snap)) {
        delete target[key];
      }
    });

    // Update/Add sync
    Object.keys(snap).forEach(key => {
      const value = snap[key];
      if (typeof value === 'object' && value !== null && !(value instanceof Node)) {
        if (typeof target[key] !== 'object' || target[key] === null) {
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
        console.log(`⏪ Transferred to state snapshot ${currentIndex}`);
        setTimeout(() => isTravelling = false, 0);
      }
    },
    forward() {
      if (currentIndex < history.length - 1) {
        isTravelling = true;
        currentIndex++;
        const snapshot = deepClone(history[currentIndex]);
        applySnapshot(state, snapshot);
        console.log(`⏩ Transferred to state snapshot ${currentIndex}`);
        setTimeout(() => isTravelling = false, 0);
      }
    },
    share() {
      // Only share current state and last 10 snapshots to stay within URL limits
      const shareData = history.slice(Math.max(0, currentIndex - 10), currentIndex + 1);
      const dbg = btoa(JSON.stringify(shareData));
      const url = new URL(window.location);
      url.searchParams.set('simpli-debug', dbg);
      return url.toString();
    }
  };

  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const dbg = params.get('simpli-debug');
    if (dbg) {
      try {
         history = JSON.parse(atob(dbg));
         currentIndex = history.length - 1;
         Object.assign(state, JSON.parse(JSON.stringify(history[currentIndex])));
         console.log(`🕰️ [SimpliJS Vault]: Loaded ${history.length} snapshots from shared link.`);
      } catch(e) {}
    }
  }

  return state;
};
