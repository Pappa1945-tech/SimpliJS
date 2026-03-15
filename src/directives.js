/**
 * SimpliJS - HTML-First Directives Engine v1.0.0
 */
import { reactive, effect, watch } from './reactive.js';
import { hydrate } from './core.js';

const __g = reactive({});
console.log("🚀 [SimpliJS] HTML-First Engine v1.0.0 Initialized");

export class SimpliDirectives {
  constructor() {
    this.dir = new Map();
    this.reg();
  }

  reg() {
    this.dir.set('s-state', (__el, __v, __s) => {
      const __d = this.eval(__v, __s);
      const __c = reactive(Object.create(__s));
      if (__d && typeof __d === 'object') Object.assign(__c, __d);
      __el.__s_st = __c;
      return __c;
    });
    this.dir.set('s-global', (__el, __v) => {
      const __d = this.eval(__v, __g);
      if (__d && typeof __d === 'object') Object.assign(__g, __d);
    });
    this.dir.set('s-text', (__el, __v, __s) => effect(() => __el.textContent = this.eval(__v, __s) ?? ''));
    this.dir.set('s-html', (__el, __v, __s) => effect(() => __el.innerHTML = this.eval(__v, __s) ?? ''));
    this.dir.set('s-value', (__el, __v, __s) => effect(() => __el.value = this.eval(__v, __s) ?? ''));
    this.dir.set('s-bind', (__el, __v, __s) => {
      effect(() => __el.value = this.eval(__v, __s) ?? '');
      __el.addEventListener('input', () => this.set(__s, __v, __el.value));
    });
    this.dir.set('s-model', (__el, __v, __s) => {
      effect(() => {
        const __val = this.eval(__v, __s);
        if (__el.type === 'checkbox') __el.checked = !!__val;
        else if (__el.type === 'radio') __el.checked = __el.value === __val;
        else __el.value = __val ?? '';
      });
      __el.addEventListener('change', () => this.set(__s, __v, __el.type === 'checkbox' ? __el.checked : __el.value));
    });
    this.dir.set('s-click', (__el, __v, __s) => __el.addEventListener('click', () => this.eval(__v, __s)));
    this.dir.set('s-submit', (__el, __v, __s) => __el.addEventListener('submit', (__e) => { __e.preventDefault(); this.eval(__v, __s); }));
    this.dir.set('s-key', (__el, __v, __s, __n) => {
      const __k = __n.split(':')[1];
      if (__k) __el.addEventListener('keydown', (__ev) => { if (__ev.key.toLowerCase() === __k.toLowerCase()) this.eval(__v, __s); });
    });
    this.dir.set('s-hover', (__el, __v, __s) => __el.addEventListener('mouseenter', () => this.eval(__v, __s)));
    this.dir.set('s-class', (__el, __v, __s) => effect(() => {
      const __cl = this.eval(__v, __s);
      if (typeof __cl === 'object') for (const __k in __cl) __el.classList.toggle(__k, !!__cl[__k]);
    }));
    this.dir.set('s-style', (__el, __v, __s) => effect(() => {
      const __st = this.eval(__v, __s);
      if (typeof __st === 'object') for (const __k in __st) __el.style[__k] = __st[__k];
    }));
    this.dir.set('s-fetch', (__el, __v, __s) => effect(() => {
      const __u = this.eval(__v, __s);
      if (!__u || typeof __u !== 'string') return;
      __s.loading = true; __s.error = null;
      fetch(__u).then(__r => {
        if (!__r.ok) throw Error(`HTTP ${__r.status}`);
        const __ct = __r.headers.get('content-type');
        if (!__ct || !__ct.includes('application/json')) throw Error('Not JSON');
        return __r.json();
      }).then(__d => { __s.data = __d; __s.loading = false; })
        .catch(__err => { __s.error = __err.message; __s.loading = false; });
    }));
    this.dir.set('s-attr', (__el, __v, __s, __n) => {
      const __at = __n.split(':')[1];
      if (__at) effect(() => __el.setAttribute(__at, this.eval(__v, __s)));
    });
    this.dir.set('s-hide', (__el, __v, __s) => effect(() => __el.style.display = this.eval(__v, __s) ? 'none' : ''));
    this.dir.set('s-change', (__el, __v, __s) => __el.addEventListener('change', (__e) => this.eval(__v, __s)));
    this.dir.set('s-input', (__el, __v, __s) => __el.addEventListener('input', (__e) => this.eval(__v, __s)));
    this.dir.set('s-memo', (__el, __v) => __el.__m = __v);
    this.dir.set('s-ref', (__el, __v, __s) => __s[__v] = __el);
    this.dir.set('s-for', (__el, __v, __s) => {
      const __m = __v.match(/(.+)\s+in\s+(.+)/);
      if (!__m || !__el.parentNode) return;
      const [_, __itExp, __lsVar] = __m;
      const __tpl = __el.cloneNode(true); __tpl.removeAttribute('s-for');
      const __anc = document.createComment(`s-for: ${__v}`);
      __el.parentNode.replaceChild(__anc, __el);
      let __ns = new Map();
      effect(() => {
        const __ls = this.eval(__lsVar, __s) || [];
        const __nxt = new Map();
        const __kExp = __tpl.getAttribute('s-key');
        __ls.forEach((__it, __i) => {
          const __ist = reactive(Object.create(__s));
          if (__itExp.includes(',')) {
            const [__vj, __idx] = __itExp.split(',').map(__ss => __ss.trim());
            __ist[__vj] = __it; __ist[__idx] = __i;
          } else __ist[__itExp.trim()] = __it;
          const __key = __kExp ? this.eval(__kExp, __ist) : __i;
          let __c = __ns.get(__key);
          if (!__c) { __c = __tpl.cloneNode(true); this.scan(__c, __ist); }
          __nxt.set(__key, __c); __anc.parentNode?.insertBefore(__c, __anc);
        });
        __ns.forEach((__n, __k) => { if (!__nxt.has(__k)) __n.remove(); });
        __ns = __nxt;
      });
    });
    this.dir.set('s-if', (__el, __v, __s) => {
      if (!__el.parentNode) return;
      const __tp = __el.cloneNode(true); __tp.removeAttribute('s-if');
      const __an = document.createComment(`s-if: ${__v}`);
      let __cur = null;
      effect(() => {
        const __re = !!this.eval(__v, __s);
        __an.__if = __re;
        if (__re && !__cur) { __cur = __tp.cloneNode(true); this.scan(__cur, __s); __an.parentNode?.insertBefore(__cur, __an); }
        else if (!__re && __cur) { __cur.remove(); __cur = null; }
      });
      __el.parentNode.replaceChild(__an, __el);
    });
    this.dir.set('s-else', (__el, __v, __s) => {
      if (!__el.parentNode) return;
      const __tp = __el.cloneNode(true); __tp.removeAttribute('s-else');
      const __an = document.createComment('s-else');
      let __cur = null;
      effect(() => {
        let __p = __an.previousSibling;
        while (__p && __p.__if === undefined) __p = __p.previousSibling;
        const __re = __p ? !__p.__if : true;
        if (__re && !__cur) { __cur = __tp.cloneNode(true); this.scan(__cur, __s); __an.parentNode?.insertBefore(__cur, __an); }
        else if (!__re && __cur) { __cur.remove(); __cur = null; }
      });
      __el.parentNode.replaceChild(__an, __el);
    });
    this.dir.set('s-show', (__el, __v, __s) => effect(() => __el.style.display = this.eval(__v, __s) ? '' : 'none'));
    this.dir.set('s-once', (__el) => __el.__o = true);
    this.dir.set('s-ignore', (__el) => __el.__i = true);
    this.dir.set('s-validate', (__el, __v, __s) => {
      const __field = __el.getAttribute('s-bind') || __el.name;
      if (!__field) return;
      __s.$errors = __s.$errors || reactive({});
      effect(() => {
        const __val = this.eval(__field, __s);
        const __err = __v === 'required' ? (!__val ? "Required" : null) : this.eval(__v, __s);
        __s.$errors[__field] = __err;
        __el.classList.toggle('is-invalid', !!__err);
      });
    });
    this.dir.set('s-error', (__el, __v, __s) => effect(() => {
      const __msg = __s.$errors?.[__v] || (__v === 'fetch' ? __s.error : null);
      __el.textContent = __msg ?? '';
      __el.style.display = __msg ? '' : 'none';
    }));
    this.dir.set('s-loading', (__el, __v, __s) => effect(() => __el.style.display = __s.loading ? '' : 'none'));
    
    // Routing
    this.dir.set('s-route', (__el, __v) => {
      this.routes = this.routes || new Map();
      this.routes.set(__v, __el.innerHTML);
      __el.remove();
    });
    this.dir.set('s-view', (__el) => {
      this.view = __el;
      const __upd = () => {
        const __h = window.location.hash.slice(1) || '/';
        const __c = this.routes?.get(__h);
        if (__c) { __el.innerHTML = __c; this.scan(__el); }
      };
      window.addEventListener('hashchange', __upd);
      __upd();
    });
    this.dir.set('s-link', (__el, __v) => __el.addEventListener('click', (__e) => {
      __e.preventDefault(); window.location.hash = __v;
    }));

    this.dir.set('s-component', (__el, __v, __s) => {
      const __name = this.eval(__v, __s);
      if (!__name) return;
      const __ne = document.createElement(__name);
      Array.from(__el.attributes).forEach(__a => __ne.setAttribute(__a.name, __a.value));
      __ne.innerHTML = __el.innerHTML;
      __el.replaceWith(__ne);
    });
    this.dir.set('s-prop', (__el, __v, __s, __n) => {
      const __p = __n.split(':')[1];
      if (__p) effect(() => {
        const __val = this.eval(__v, __s);
        __el.setAttribute(__p, typeof __val === 'object' ? JSON.stringify(__val) : __val);
        if (__el._props) __el._props[__p] = __val;
      });
    });
    this.dir.set('s-slot', (__el, __v) => __el.setAttribute('slot', __v));

    this.dir.set('s-lazy', (__el, __v, __s) => {
      const __ob = new IntersectionObserver((__es) => {
        if (__es[0].isIntersecting) { __el.src = this.eval(__v, __s); __ob.disconnect(); }
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
    const __p = new Proxy(__s, { get: (target, key) => key in target ? target[key] : undefined });
    try {
      if (__t.startsWith('if') || __t.includes(';')) {
        return (new Function('state', `with(state) { ${__t} }`))(__p);
      }
      try { return (new Function('state', `with(state) { return (${__t}) }`))(__p); }
      catch { return (new Function('state', `with(state) { return ${__t} }`))(__p); }
    } catch (__err) {
       if (!__t.includes('item.') && !['val', 'url', '__v'].includes(__t)) console.warn(`[SimpliJS] Eval Error: ${__t}`, __err.message);
    }
  }

  set(__o, __p, __v) {
    const __pts = __p.split('.');
    let __c = __o;
    for (let __i = 0; __i < __pts.length - 1; __i++) __c = __c[__pts[__i]];
    __c[__pts[__pts.length - 1]] = __v;
  }

  scan(__root, __st = __g) {
    if (!__root || __root.__i || (__root.hasAttribute && __root.hasAttribute('s-ignore'))) return;
    const __walk = (__n, __s) => {
      if (__n.nodeType !== 1 || __n.__i || (__n.hasAttribute && __n.hasAttribute('s-ignore'))) return;
      
      // s-memo check
      const __mA = __n.getAttribute('s-memo');
      if (__mA) {
        const __mv = this.eval(__mA, __s);
        if (__n.__mv === __mv) return;
        __n.__mv = __mv;
      }

      let __cs = __s;
      const __stA = __n.getAttribute('s-state'); if (__stA) { __cs = this.dir.get('s-state')(__n, __stA, __s); __n.removeAttribute('s-state'); }
      const __glA = __n.getAttribute('s-global'); if (__glA) { this.dir.get('s-global')(__n, __glA, __s); __n.removeAttribute('s-global'); }
      const __as = Array.from(__n.attributes);
      let __stop = false;
      __as.forEach(__a => {
        if (__a.name.startsWith('s-') && __a.name !== 's-state' && __a.name !== 's-global') {
          const __base = __a.name.split(':')[0];
          const __h = this.dir.get(__base);
          if (__h) {
            if (['s-for', 's-if', 's-else'].includes(__base)) __stop = true;
            __h(__n, __a.value, __cs, __a.name);
            __n.removeAttribute(__a.name);
          }
        }
      });
      this.interp(__n, __cs);
      if (!__stop) Array.from(__n.childNodes).forEach(__c => __walk(__c, __cs));
    };
    __walk(__root, __st);
  }

  interp(__n, __s) {
    if (['CODE', 'PRE', 'SCRIPT', 'STYLE'].includes(__n.tagName)) return;
    __n.childNodes.forEach(__c => {
      if (__c.nodeType === 3 && __c.textContent.includes('{')) {
        const __orig = __c.textContent;
        const __upd = () => __c.textContent = __orig.replace(/\{(.+?)\}/g, (_, __e) => this.eval(__e.trim(), __s) ?? '');
        if (__n.__o || (__n.hasAttribute && __n.hasAttribute('s-once'))) __upd(); else effect(__upd);
      }
    });
  }

  init() { document.querySelectorAll('[s-app]').forEach(__a => this.scan(__a)); }
}

export const directives = new SimpliDirectives();
