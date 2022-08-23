import {trackEffect, triggerEffect} from "./effect";
import {isObject, isArray} from "@ls-toy-vue/shared";
import {reactive} from "./reactive";

const toReactive = (val) => {
    return isObject(val) ? reactive(val) : val
}

class RefImpl {
    public _value
    public deps = new Set
    public __v_isRef = true

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

class ObjectRefImpl {
    public readonly __v_isRef = true
    constructor(public object, public key) {
    }

    get value() {
        return this.object[this.key]
    }

    set value(newValue) {
        this.object[this.key] = newValue
    }
}

export const toRef = (object, key) => {
    return new ObjectRefImpl(object, key)
}

export const toRefs = (object) => {
    if (!isObject(object) && !Array.isArray(object)) {
        throw 'toRefs必须传入一个对象'
    }

    let result = isArray(object) ? new Array(object.length) : {}

    for (let key in object) {
        result[key] = toRef(object, key)
    }

    return result
}

