
export const enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive'
}
export const mutableHandlers = {
    get(target,key){
        if(key === ReactiveFlags.IS_REACTIVE){
            return true
        }
        return Reflect.get(target,key)
    },
    set(target,key,value) {
        const oldValue = target[key]
        const res = Reflect.set(target,key,value)
        return res
    }
}
