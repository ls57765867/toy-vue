import {track, trigger} from "./effect";
import {
    readonlyMap,
    reactiveMap,
    shallowReactiveMap,
    shallowReadonlyMap, readonly, reactive,
} from './reactive'
import {isObject} from "../../shared";

export const enum ReactiveFlags {
    SKIP = '__v_skip',
    IS_REACTIVE = '__v_isReactive',
    IS_READONLY = '__v_isReadonly',
    IS_SHALLOW = '__v_isShallow',
    RAW = '__v_raw'
}

const get = createGetter()
const readonlyGet = createGetter(true)
const shallowGet = createGetter(false, true)
const shallowReadonlyGet = createGetter(true, true)


function createGetter(isReadonly = false, shallow = false) {
    return function get(target, key, receiver) {
        if (key === ReactiveFlags.IS_REACTIVE) {
            return !isReadonly
        } else if (key === ReactiveFlags.IS_READONLY) {
            return isReadonly
        } else if (key === ReactiveFlags.IS_SHALLOW) {
            return shallow
        }
        const res = Reflect.get(target, key, receiver)
        if (!isReadonly) {
            track(target, key)
        }
        if (shallow) {
            return res
        }

        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res)
        }

        return res
    }
}


export const mutableHandlers = {
    get,
    set(target, key, value) {
        const oldValue = target[key]
        const res = Reflect.set(target, key, value)
        if (oldValue !== value) {
            trigger(target, key)
        }
        return res
    }
}
export const readonlyHandlers = {
    get: readonlyGet,
    set(target, key) {
        console.warn(`此内容为readonly不可以进行修改 "${String(key)}"`)
        return true
    },
    deleteProperty(target, key) {
        console.warn(`此内容为readonly不可以进行删除 "${String(key)}"`)
        return true
    }
}

export const shallowReadonlyHandlers = {
    get:shallowReadonlyGet,
    set(target, key) {
        console.warn(`此内容为readonly不可以进行修改 "${String(key)}"`)
        return true
    },
    deleteProperty(target, key) {
        console.warn(`此内容为readonly不可以进行删除 "${String(key)}"`)
        return true
    }
}
