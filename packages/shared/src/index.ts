export const enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive',
    IS_REF = '__v_isRef',
    IS_READONLY = '__v_isReadonly',
    IS_SHALLOW = '__v_isShallow',
}

export const isObject = (val) => {
    return val !== null && typeof val === "object";
};

export const isString = (val) => typeof val === "string";

export const isReactive = val => !!val?.[ReactiveFlags.IS_REACTIVE]

export const isRef = val => !!val?.[ReactiveFlags.IS_REF]

export const isFunction = val => typeof val === 'function'

export const isReadonly = val => !!val[ReactiveFlags.IS_READONLY]

export const isSymbol = val => typeof val === 'symbol'

export function isShallow(value: unknown): boolean {
    return !!(value?.[ReactiveFlags.IS_SHALLOW])
}

export const def = (target, key, val) => {
    Object.defineProperty(target, key, {
        value: val,
        configurable: true, //可以删除
        enumerable: false //不可枚举
    })
}

export const toTypeString = (value): string =>
    Object.prototype.toString.call(value)

export const toRawType = (value): string => {
    // 将 "[object String]" 转化为 String
    return toTypeString(value).slice(8, -1)
}

const camelizeRE = /-(\w)/g;

export const isArray = Array.isArray
/**
 * @private
 * 把烤肉串命名方式转换成驼峰命名方式
 */
export const camelize = (str: string): string => {
    return str.replace(camelizeRE, (_, c) => (c ? c.toUpperCase() : ""));
};

export const extend = Object.assign;

// 必须是 on+一个大写字母的格式开头
export const isOn = (key) => /^on[A-Z]/.test(key);

export function hasChanged(value, oldValue) {
    return !Object.is(value, oldValue);
}

export function hasOwn(val, key) {
    return Object.prototype.hasOwnProperty.call(val, key);
}

/**
 * @private
 * 首字母大写
 */
export const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

/**
 * @private
 * 添加 on 前缀，并且首字母大写
 */
export const toHandlerKey = (str: string) =>
    str ? `on${capitalize(str)}` : ``;

// 用来匹配 kebab-case 的情况
// 比如 onTest-event 可以匹配到 T
// 然后取到 T 在前面加一个 - 就可以
// \BT 就可以匹配到 T 前面是字母的位置
const hyphenateRE = /\B([A-Z])/g;
/**
 * @private
 */
export const hyphenate = (str: string) =>
    str.replace(hyphenateRE, "-$1").toLowerCase();
