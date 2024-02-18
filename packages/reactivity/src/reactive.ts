import { mutableHandlers, readonlyHandlers } from "./baseHandlers";

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

function createActiveObject(raw: any, baseHandlers: any) {
  return new Proxy(raw, baseHandlers);
}

export function isReactive(value: any) {
  return !!value[ReactiveFlags.IS_REACTIVE]; // 触发getter 在getter中通过入参isreadonly来判断
}

export function isReadonly(value: any) {
  return !!value[ReactiveFlags.IS_READONLY];
}