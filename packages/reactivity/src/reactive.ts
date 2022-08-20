import {isObject} from "@ls-toy-vue/shared";
import {mutableHandlers, ReactiveFlags} from "./baseHandler";


const reactiveMap =  new WeakMap(); // key只能是对象

export function reactive (target){

    if(!isObject(target)){
        return
    }
    const targetFlag = target[ReactiveFlags.IS_REACTIVE]
    if(targetFlag){
        return target
    }

    const existingProxy = reactiveMap.get(target)
    if(existingProxy) return existingProxy

    const proxy = new Proxy(target,mutableHandlers)
    reactiveMap.set(target,proxy)
    return proxy
}
