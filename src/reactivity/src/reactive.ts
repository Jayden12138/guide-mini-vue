import { mutableHandlers, readonlyHandlers } from './baseHandlers'

export function reactive(obj) {
	return createActiveObject(obj, mutableHandlers)
}

export function readonly(obj) {
	return createActiveObject(obj, readonlyHandlers)
}

function createActiveObject(obj, baseHandlers) {
	return new Proxy(obj, baseHandlers)
}
