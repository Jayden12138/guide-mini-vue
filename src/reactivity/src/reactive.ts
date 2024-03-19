import {
	mutableHandlers,
	readonlyHandlers,
	shallowReadonlyHandlers,
} from './baseHandlers'

export enum ReactiveFlags {
	IS_REACTIVE = '__v_isReactive',
	IS_READONLY = '__v_isReadonly',
}

export function reactive(obj) {
	return createActiveObject(obj, mutableHandlers)
}

export function readonly(obj) {
	return createActiveObject(obj, readonlyHandlers)
}

export function shallowReadonly(obj) {
	return createActiveObject(obj, shallowReadonlyHandlers)
}

function createActiveObject(obj, baseHandlers) {
	return new Proxy(obj, baseHandlers)
}

export function isReactive(obj) {
	return !!obj[ReactiveFlags.IS_REACTIVE]
}

export function isReadonly(obj) {
	return !!obj[ReactiveFlags.IS_READONLY]
}

export function isProxy(obj) {
	return isReadonly(obj) || isReactive(obj)
}
