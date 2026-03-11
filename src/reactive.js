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

export function reactive(obj) {
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
      return typeof res === 'object' ? reactive(res) : res;
    },
    set(target, key, value, receiver) {
      const result = Reflect.set(target, key, value, receiver);
      const deps = depsMap.get(key);
      if (deps) {
        deps.forEach(effectFn => effectFn());
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
