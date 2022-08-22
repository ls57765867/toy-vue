import {ReactiveEffect} from './effect'
import {isReactive, isObject, isFunction} from "@ls-toy-vue/shared";

const traversal = (source, set = new Set) => {
    if (!isObject(source)) return source
    if (!set.has(source)) {
        for (let key in source) {
            const value = source[key]
            set.add(value)
            traversal(value, set)
        }
    }
    return source
}


export const watch = (source, cb) => {
    let getter
    let oldValue
    let newValue
    let cleanup
    if (isReactive(source)) {
        getter = () => traversal(source)
    } else if (isFunction(source)) {
        getter = source
    } else {
        console.error('watch参数错误')
        return
    }
    const onCleanup = cb => {
        cleanup = cb
    }
    const job = () => {
        if(cleanup) cleanup()
        newValue = effect.run()
        cb(newValue, oldValue , onCleanup)
        oldValue = newValue
    }
    const effect = new ReactiveEffect(getter, job)
    oldValue = effect.run()
}
