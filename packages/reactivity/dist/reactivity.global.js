var VueReactive = (() => {
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

  // packages/reactivity/src/index.ts
  var src_exports = {};
  __export(src_exports, {
    effect: () => effect,
    reactive: () => reactive
  });

  // packages/shared/src/index.ts
  var isObject = (val) => {
    return val !== null && typeof val === "object";
  };

  // packages/reactivity/src/effect.ts
  var activeEffect = null;
  var targetMap = /* @__PURE__ */ new WeakMap();
  var ReactiveEffect = class {
    constructor(fn, scheduler) {
      this.fn = fn;
      this.scheduler = scheduler;
      this.active = true;
      this.deps = [];
      this.parent = null;
    }
    run() {
      if (!this.active)
        return this.fn();
      try {
        this.parent = activeEffect;
        activeEffect = this;
        this.fn();
      } finally {
        activeEffect = this.parent;
      }
    }
  };
  var effect = (fn, options = {}) => {
    const _effect = new ReactiveEffect(fn, options.scheduler);
    _effect.run();
  };
  var track = (target, key) => {
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, depsMap = /* @__PURE__ */ new Map());
    }
    let deps = depsMap.get(key);
    if (!deps) {
      depsMap.set(key, deps = /* @__PURE__ */ new Set());
    }
    trackEffect(deps);
  };
  var trackEffect = (deps) => {
    if (!activeEffect)
      return;
    if (!deps.has(activeEffect)) {
      deps.add(activeEffect);
      activeEffect.deps.push(deps);
    }
  };
  var trigger = (target, key) => {
    const depsMap = targetMap.get(target);
    if (!depsMap)
      return;
    const effects = depsMap.get(key);
    triggerEffect(effects);
  };
  var triggerEffect = (effects) => {
    const _effects = new Set(effects);
    _effects.forEach((effect2) => {
      if (effect2 !== activeEffect) {
        effect2.run();
      }
    });
  };

  // packages/reactivity/src/baseHandler.ts
  var mutableHandlers = {
    get(target, key) {
      if (key === "__v_isReactive" /* IS_REACTIVE */) {
        return true;
      }
      track(target, key);
      return Reflect.get(target, key);
    },
    set(target, key, value) {
      const oldValue = target[key];
      const res = Reflect.set(target, key, value);
      trigger(target, key);
      return res;
    }
  };

  // packages/reactivity/src/reactive.ts
  var reactiveMap = /* @__PURE__ */ new WeakMap();
  function reactive(target) {
    if (!isObject(target)) {
      return;
    }
    const targetFlag = target["__v_isReactive" /* IS_REACTIVE */];
    if (targetFlag) {
      return target;
    }
    const existingProxy = reactiveMap.get(target);
    if (existingProxy)
      return existingProxy;
    const proxy = new Proxy(target, mutableHandlers);
    reactiveMap.set(target, proxy);
    return proxy;
  }
  return __toCommonJS(src_exports);
})();
//# sourceMappingURL=reactivity.global.js.map
