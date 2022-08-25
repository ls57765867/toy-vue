import {track, trigger} from "./effect";
import {
    readonlyMap,
    reactiveMap,
    shallowReactiveMap,
    shallowReadonlyMap,
    toRaw,
    readonly,
    reactive,
} from './reactive'
import {extend, isObject, isReadonly, isSymbol, isRef, isShallow, isArray} from "@ls-toy-vue/shared";

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
        } else if (key === ReactiveFlags.RAW && (isReadonly ? shallow ? shallowReadonlyMap : readonlyMap : shallow ? shallowReactiveMap : reactiveMap).get(target)) {
            return target
        }

        const res = Reflect.get(target, key, receiver)
        const targetIsArray = isArray(target) // 判断是否为一个数组

        // #19 如果返回值类型为symbol或值为 __proto__ | __v_isRef | __isVue 则不继续进行proxy代理
        if (isSymbol(res) || ['__proto__', '__v_isRef', '__isVue'].includes(key)) {
            return res
        }

        if (!isReadonly) {
            track(target, key)
        }
        if (shallow) {
            return res
        }
        // #24.1 当返回值类型为ref并且不为数组时，支持脱ref(不需要传入.value)
        if (isRef(res)) {
            return targetIsArray ? res : res.value
        }


        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res)
        }


        return res
    }
}

const set = createSetter()
const shallowSet = createSetter(true)

function createSetter(shallow = false) {
    return function set(target, key, value, receiver) {
        let oldValue = target[key]

        if (isReadonly(oldValue) && isRef(oldValue) && !isRef(value)) {
            return false
        }
        if (!shallow) {
            if (!isShallow(value) && !isReadonly(value)) {
                oldValue = toRaw(oldValue)
                value = toRaw(value)
            }
            // #24.2 当类型不为数组 && 原始值类型为ref && 新值不为ref时直接修改ref值
            if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
                oldValue.value = value
                return true
            }
        }


        const res = Reflect.set(target, key, value)
        if (oldValue !== value) {
            trigger(target, 'set', key, value)
        }
        return res
    }
}

function deleteProperty(target, key) {
    const hadKey = target.hasOwnProperty(key)
    const result = Reflect.deleteProperty(target, key)
    if (result && hadKey) {
        trigger(target, 'delete', key)
    }
    return result
}

export const mutableHandlers = {
    get,
    set,
    deleteProperty
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

export const shallowReadonlyHandlers = extend(
    {},
    readonlyHandlers,
    {
        get: shallowReadonlyGet
    }
)


export const shallowReactiveHandlers = extend(
    {},
    mutableHandlers,
    {
        get: shallowGet,
        set: shallowSet,
    }
)
