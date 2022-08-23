import {trackEffect, triggerEffect} from "./effect";
import {isObject} from "@ls-toy-vue/shared";
import {reactive} from "./reactive";

const toReactive = (val) => {
    return isObject(val) ? reactive(val) : val
}

class RefImpl {
    public _value
    public deps = new Set

    constructor(public rowValue) {
        this._value = toReactive(this.rowValue)
    }

    get value() {
        trackEffect(this.deps)
        return this._value
    }

    set value(newValue) {
        if (newValue !== this.rowValue) {
            this._value = toReactive(newValue)
            this.rowValue = newValue
            triggerEffect(this.deps)
        }
    }
}

export const ref = (val) => {
    return new RefImpl(val)
}

