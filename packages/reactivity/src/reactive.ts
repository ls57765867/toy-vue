import {isObject, isReadonly, def, toRawType} from "@ls-toy-vue/shared";
import {
    mutableHandlers,
    readonlyHandlers,
    shallowReactiveHandlers,
    shallowReadonlyHandlers,
    ReactiveFlags
} from "./baseHandler";


export const reactiveMap = new WeakMap(); // key只能是对象
export const shallowReactiveMap = new WeakMap()
export const readonlyMap = new WeakMap()
export const shallowReadonlyMap = new WeakMap()

const enum TargetType {
    INVALID = 0,
    COMMON = 1,
    COLLECTION = 2
}

function targetTypeMap(rawType: string) {
    switch (rawType) {
        case 'Object':
        case 'Array':
            return TargetType.COMMON
        case 'Map':
        case 'Set':
        case 'WeakMap':
        case 'WeakSet':
            return TargetType.COLLECTION
        default:
            return TargetType.INVALID
    }
}

export function reactive(target) {

    if (isReadonly(target)) {
        return target
    }

    return createReactiveObject(target, false, mutableHandlers, reactiveMap)
}

/**
 * 获取 val 类型
 * @param val
 */
const getTargetType = (val) => {
    return val[ReactiveFlags.SKIP] || !Object.isExtensible(val) ? TargetType.INVALID : targetTypeMap(toRawType(val))
}


const createReactiveObject = (target, isReadonly, baseHandlers, proxyMap) => {
    if (!isObject(target)) {
        console.warn(`无法生成响应式 ${String(target)} ,传入参数必须是一个对象`)
        return
    }
    const targetFlag = target[ReactiveFlags.IS_REACTIVE]
    if (targetFlag) {
        return target
    }

    const existingProxy = proxyMap.get(target)
    if (existingProxy) return existingProxy

    // 获取类型，如果类型为 INVALID 不进行proxy代理直接返回原始值
    const targetType = getTargetType(target)
    if (targetType === TargetType.INVALID) {
        return target
    }

    const proxy = new Proxy(target, baseHandlers)
    proxyMap.set(target, proxy)
    return proxy
}

export function isReactive(value) {
    if (isReadonly(value)) {
        return value?.[ReactiveFlags.RAW]
    }
    return !!(value?.[ReactiveFlags.IS_REACTIVE])
}


export const readonly = (target) => {
    return createReactiveObject(target, true, readonlyHandlers, readonlyMap)
}
export const shallowReadonly = (target) => {
    return createReactiveObject(target, true, shallowReadonlyHandlers, shallowReadonlyMap)
}

export const shallowReactive = (target) => {
    return createReactiveObject(target, false, shallowReactiveHandlers, shallowReactiveMap)
}

export const toRaw = (observed) => {
    const raw = observed?.[ReactiveFlags.RAW]
    return raw ? toRaw(raw) : observed
}
/**
 * 将一个对象标记为不可被转为代理。返回该对象本身。
 * @param val
 */
export const markRaw = (val) => {
    def(val, ReactiveFlags.SKIP, true)
    return val
}
