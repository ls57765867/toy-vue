import {track, trigger} from "./effect";

export const enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive'
}
export const mutableHandlers = {
    get(target,key){
        if(key === ReactiveFlags.IS_REACTIVE){
            return true
        }
        track(target,key)
        return Reflect.get(target,key)
    },
    set(target,key,value) {
        const oldValue = target[key]
        const res = Reflect.set(target,key,value)
        trigger(target,key)
        return res
    }
}
