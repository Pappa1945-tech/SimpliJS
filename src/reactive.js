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

export function reactive(obj, onSet = null) {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  const depsMap = new Map();

  return new Proxy(obj, {
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
      return typeof res === 'object' ? reactive(res, onSet) : res;
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver);
      const deps = depsMap.get(key);
      if (deps) {
        deps.forEach(effectFn => effectFn());
      }
      if (onSet) onSet();
      return result;
    }
  });
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

reactive.vault = function(obj) {
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
        history = history.slice(0, currentIndex + 1);
        history.push(snapshot);
        currentIndex++;
      }
    });
  });

  function applySnapshot(target, snap) {
    if (typeof snap !== 'object' || snap === null) return snap;
    for (const key in snap) {
      if (typeof snap[key] === 'object' && snap[key] !== null) {
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
        console.log(`⏪ Transferred to state snapshot ${currentIndex}`);
        setTimeout(() => isTravelling = false, 0);
      }
    },
    forward() {
      if (currentIndex < history.length - 1) {
        isTravelling = true;
        currentIndex++;
        const snapshot = JSON.parse(JSON.stringify(history[currentIndex]));
        applySnapshot(state, snapshot);
        console.log(`⏩ Transferred to state snapshot ${currentIndex}`);
        setTimeout(() => isTravelling = false, 0);
      }
    },
    share() {
      const dbg = btoa(JSON.stringify(history));
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
         console.log(`🕰️ [SimpliJS Vault]: Loaded ${history.length} states from shared debug link.`);
      } catch(e) {}
    }
  }

  return state;
};
