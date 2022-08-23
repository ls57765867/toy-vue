import {isFunction, isObject} from "@ls-toy-vue/shared";
import {ReactiveEffect, trackEffect, triggerEffect} from "./effect";

class ComputedRefImpl {
    public _value = null
    public deps = new Set
    public dirty = true
    public effect
    constructor(public getter,public setter) {
        this.effect = new ReactiveEffect(getter, () => {
            if (!this.dirty) {
                this.dirty = true
                triggerEffect(this.deps)
            }
        })
    }

    get value() {
        if (this.dirty) {
            trackEffect(this.deps)
            this.dirty = false
            this._value = this.effect.run()
        }
        return this._value
    }

    set value(val) {
        this.setter(val)
    }
}
export const computed = (getterOrOptions) => {
    let getter
    let setter
    if (isObject(getterOrOptions)) {
        getter = getterOrOptions.get
        setter = getterOrOptions.set
    } else if (isFunction(getterOrOptions)) {
        getter = getterOrOptions
        setter = () => {
            console.error('没有设置setter值')
        }
    }
    return new ComputedRefImpl(getter, setter)
}
