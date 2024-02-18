import { ReactiveFlags, reactive, readonly } from './reactive';
import { track, trigger } from './effect';
import { isObject } from './shared';

const get = createGetter(); // 优化点 不需要每次访问都调用createGetter 这里只会在初始化的时候执行一次
const set = createSetter();
const readonlyGet = createGetter(true);

function createGetter(isReadonly: boolean = false) {
  return function get(target: any, key: any) {
    if (key === ReactiveFlags.IS_REACTIVE) { // 在前面优化reactive 和 readonly时，这里的get被抽离出来，通过传入的isReadonly来区分，这里isReactive也可以借用这个值来判断
      return !isReadonly;
    }else if(key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    }
    const res = Reflect.get(target, key);

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