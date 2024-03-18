import { track, trigger } from './effect'
import { ReactiveFlags } from './reactive'

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)

function createGetter(isReadonly: boolean = false) {
	return (target, key) => {
		if (key === ReactiveFlags.IS_REACTIVE) {
			return !isReadonly
		} else if (key === ReactiveFlags.IS_READONLY) {
			return isReadonly
		}

		!isReadonly && track(target, key)
		return Reflect.get(target, key)
	}
}

function createSetter() {
	return (target, key, value) => {
		// 触发依赖
		const res = Reflect.set(target, key, value)

		trigger(target, key, value)

		return res
	}
}

export const mutableHandlers = {
	get,
	set,
}

export const readonlyHandlers = {
	get: readonlyGet,
	set: (target, key, value) => {
		console.warn(
			`key:${String(key)} set 失败，因为 target 是 readonly！`,
			target
		)
		return true
	},
}
