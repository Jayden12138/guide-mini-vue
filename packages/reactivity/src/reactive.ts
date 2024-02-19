import {
  mutableHandlers,
  readonlyHandlers,
  shallowReadonlyHandlers,
} from './baseHandlers';
import { isObject } from './shared/index';

export const enum ReactiveFlags {
  IS_REACTIVE = "__v_isReactive",
  IS_READONLY = "__v_isReadonly"
}

export function reactive(raw: any) {
    return createActiveObject(raw, mutableHandlers);
}

export function readonly(raw: any) {
  return createActiveObject(raw, readonlyHandlers);
}

export function shallowReadonly(raw: any) {
  return createActiveObject(raw, shallowReadonlyHandlers);
}

function createActiveObject(raw: any, baseHandlers: any) {
  if(isObject(raw)) {
    return new Proxy(raw, baseHandlers)
  } else {
    console.warn(`target ${raw} 必须是一个对象`)
  }
}

export function isReactive(value: any) {
  return !!value[ReactiveFlags.IS_REACTIVE]; // 触发getter 在getter中通过入参isreadonly来判断
}

export function isReadonly(value: any) {
  return !!value[ReactiveFlags.IS_READONLY];
}

export function isProxy(value: any) {
  return isReactive(value) || isReadonly(value);
}

export function isRef(ref: any) {
  return !!ref.__v_isRef
}

export function unRef(ref: any) {
  return isRef(ref) ? ref.value : ref
}

export function proxyRefs(objectWithRefs: any) {
  /**
   * vue3中在 setup return 的对象中，有 ref 类型，但在 template 中访问该变量不需要使用 .value，因为这里 使用了 proxyRefs
   * 
   * 这里需要在 get 的时候，如果访问的是 ref 则返回 ref.value ，否则直接返回
   * 
   * set 时，如果原来是 ref && 现在新值不是 ref，则修改 ref.value
   * 其他情况直接赋值
   */

  // 这里因为要在 get set 时进行处理，所以需要使用到 Proxy
  return new Proxy(objectWithRefs, {
    get(target, key) {
      return unRef(Reflect.get(target, key))
    },
    set(target, key, value) {
      if (isRef(target[key]) && !isRef(value)) {
        return target[key].value = value
      } else {
        return Reflect.set(target, key, value)
      }
    }
  })
}