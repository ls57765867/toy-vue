let activeEffect = null
const targetMap = new WeakMap()

export class ReactiveEffect {
    public active = true
    public deps = []
    public parent = null

    constructor(public fn, public scheduler) {
    }

    run() {
        if (!this.active) return this.fn()
        try {
            this.parent = activeEffect
            activeEffect = this
            this.fn()
        } finally {
            activeEffect = this.parent
        }

    }
}

export const effect = (fn, options: any = {}) => {
    const _effect = new ReactiveEffect(fn, options.scheduler)
    _effect.run()
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

export const trigger = (target, key) => {
    const depsMap = targetMap.get(target)
    if (!depsMap) return
    const effects = depsMap.get(key)
    triggerEffect(effects)
}
export const triggerEffect = (effects)=>{
    const _effects:any = new Set(effects)
    _effects.forEach(effect => {
        if(effect !== activeEffect){
            effect.run()
        }
    })
}
