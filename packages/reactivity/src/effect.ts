import {isArray} from "../../shared";

let activeEffect = null
const targetMap = new WeakMap()

export const effect = (fn, options: any = {}) => {
    const _effect = new ReactiveEffect(fn, options.scheduler)
    _effect.run()
    const runner = _effect.run.bind(_effect)
    runner.effect = _effect
    return runner
}

export class ReactiveEffect {
    public active = true
    public deps = []
    public parent = null

    constructor(public fn, public scheduler) {
    }

    run() {
        try {
            if (!this.active) return this.fn()
            this.parent = activeEffect
            activeEffect = this
            cleanupEffect(this)
            return this.fn()
        } finally {
            activeEffect = this.parent
        }

    }

    stop() {
        if (this.active) {
            this.active = false
            cleanupEffect(this)
        }

    }
}

export const cleanupEffect = (effect) => {
    effect.deps.forEach(effects => {
        effects.delete(effect)
    })
    effect.deps.length = 0
}


export const track = (target, key) => {
    let depsMap = targetMap.get(target)
    if (!depsMap) {
        targetMap.set(target, depsMap = new Map)
    }
    let deps = depsMap.get(key)
    if (!deps) {
        depsMap.set(key, deps = new Set)
    }
    trackEffect(deps)
}
export const trackEffect = (deps) => {
    if (!activeEffect) return
    if (!deps.has(activeEffect)) {
        deps.add(activeEffect)
        activeEffect.deps.push(deps)
    }
}

export const trigger = (target, type, key, newValue?) => {
    let deps = []
    console.log(target, type, key);
    const depsMap = targetMap.get(target)
    if (!depsMap) return
    const effects = depsMap.get(key)

    // #23 处理直接修改length
    if (key === 'length' && isArray(target)) {
        console.log(depsMap);
        depsMap.forEach((dep, _key) => {
            // _key为下标,newValue为新数组的长度
            // 执行state.length = 1修改长度时，对大于等于新数组长度的下标进行更新
            if (_key === 'length' || _key >= newValue) {
                deps.push(dep)
            }
        })
        triggerEffect(deps[0])
    }

    if (!effects) return;


    triggerEffect(effects)
}
export const triggerEffect = (effects) => {
    const _effects: any = new Set(effects)
    _effects.forEach(effect => {
        if (effect !== activeEffect) {
            const scheduler = effect.scheduler
            if (scheduler) {
                scheduler()
            } else {
                effect.run()
            }
        }
    })
}
