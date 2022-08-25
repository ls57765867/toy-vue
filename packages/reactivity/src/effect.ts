import {isArray, isIntegerKey} from "@ls-toy-vue/shared";

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
        let lastShouldTrack = shouldTrack
        while (this.parent) {
            if (this.parent === this) {
                return
            }
            parent = parent.parent
        }
        try {
            if (!this.active) return this.fn()
            this.parent = activeEffect
            activeEffect = this
            shouldTrack = true
            cleanupEffect(this)
            return this.fn()
        } finally {
            activeEffect = this.parent
            shouldTrack = lastShouldTrack
            this.parent = undefined
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

export let shouldTrack = true
const trackStack: boolean[] = []

export function pauseTracking() {
    trackStack.push(shouldTrack)
    shouldTrack = false
}

export function resetTracking() {
    const last = trackStack.pop()
    shouldTrack = last === undefined ? true : last
}


export const track = (target, key) => {
    if (shouldTrack && activeEffect) {
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
}
export const trackEffect = (deps) => {
    if (!deps.has(activeEffect)) {
        deps.add(activeEffect)
        activeEffect.deps.push(deps)
    }
}

export const trigger = (target, type, key, newValue?) => {
    let deps = []
    const depsMap = targetMap.get(target)
    if (!depsMap) return
    let effects = depsMap.get(key) || new Set
    // #21
    if (isIntegerKey(key)) {
        deps.push(depsMap.get('length'))
    }
    // #23 处理直接修改length
    if (key === 'length' && isArray(target)) {
        depsMap.forEach((dep, _key) => {
            // _key为下标,newValue为新数组的长度
            // 执行state.length = 1修改长度时，对大于等于新数组长度的下标进行更新
            if (_key === 'length' || _key >= newValue) {
                deps.push(dep)
            }
        })
        triggerEffect(deps[0])
    }
    for (const dep of deps) {
        if (dep) {
            effects.add(...dep)
        }
    }
    triggerEffect(effects)
}
export const triggerEffect = (effects) => {
    const _effects: any = new Set(effects)
    _effects.forEach(effect => {
        if (effect !== activeEffect && effect) {
            const scheduler = effect.scheduler
            if (scheduler) {
                scheduler()
            } else {
                effect.run()
            }
        }
    })
}
