import { track, trigger } from './effect'

export function reactive(obj) {
	return new Proxy(obj, {
		get(target, key) {
			// 收集依赖
			track(target, key)

			return Reflect.get(target, key)
		},
		set(target, key, value) {
			// 触发依赖
			const res = Reflect.set(target, key, value)

			trigger(target, key, value)

			return res
		},
	})
}
