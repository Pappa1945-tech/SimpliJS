let activeEffect = null;

export function effect(fn) {
  const effectFn = () => {
    activeEffect = effectFn;
    fn();
    activeEffect = null;
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
