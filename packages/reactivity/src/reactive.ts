import {isObject, isReadonly} from "@ls-toy-vue/shared";
import {mutableHandlers, readonlyHandlers, shallowReadonlyHandlers, ReactiveFlags} from "./baseHandler";


export const reactiveMap = new WeakMap(); // key只能是对象
export const shallowReactiveMap = new WeakMap()
export const readonlyMap = new WeakMap()
export const shallowReadonlyMap = new WeakMap()

export function reactive(target) {

    if (isReadonly(target)) {
        return target
    }

    return createReactiveObject(target, false, mutableHandlers)
}

const createReactiveObject = (target, isReadonly, baseHandlers) => {
    if (!isObject(target)) {
        console.warn(`无法生成响应式 ${String(target)}`)
        return
    }
    const targetFlag = target[ReactiveFlags.IS_REACTIVE]
    if (targetFlag) {
        return target
    }

    const existingProxy = reactiveMap.get(target)
    if (existingProxy) return existingProxy

    const proxy = new Proxy(target, baseHandlers)
    reactiveMap.set(target, proxy)
    return proxy
}


export const readonly = (target) => {
    return createReactiveObject(target, true, readonlyHandlers)
}
export const shallowReadonly = (target) => {
    return createReactiveObject(target, true, shallowReadonlyHandlers)
}

