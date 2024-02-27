import { ReactiveFlags, reactive, readonly } from './reactive';
import { track, trigger } from './effect';
import { extend, isObject } from '@guide-mini-vue/shared';

const get = createGetter(); // 优化点 不需要每次访问都调用createGetter 这里只会在初始化的时候执行一次
const set = createSetter();
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);

function createGetter(isReadonly: boolean = false, shallow: boolean = false) {
  return function get(target: any, key: any) {
    if (key === ReactiveFlags.IS_REACTIVE) { // 在前面优化reactive 和 readonly时，这里的get被抽离出来，通过传入的isReadonly来区分，这里isReactive也可以借用这个值来判断
      return !isReadonly;
    }else if(key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    }
    const res = Reflect.get(target, key);

    if(shallow) {
      return res // 不用处理嵌套对象 也不需要track 直接返回res
    }

    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res);
    }

    if (!isReadonly) {
      track(target, key);
    }
    return res;
  };
}

function createSetter() {
  return function set(target: any, key: any, value: any) {
    Reflect.set(target, key, value);
    trigger(target, key);
    return true;
  };
}

export const mutableHandlers = {
  get,
  set,
};

export const readonlyHandlers = {
  get: readonlyGet,
  set(target: any, key: any, value: any) {
    console.warn(
      `Set operation on key "${key}" failed: target is readonly.`,
      target
    );
    return true;
  },
};

export const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
  get: shallowReadonlyGet,
})