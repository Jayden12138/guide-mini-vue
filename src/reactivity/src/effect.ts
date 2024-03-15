const targetsMap = new Map()
let activeEffect

class ReactiveEffect {
	private _fn: any
	constructor(_fn, public scheduler?) {
		this._fn = _fn
	}

	run() {
		activeEffect = this
		return this._fn()
	}
}

export function effect(fn, options: any = {}) {
	const _effect: any = new ReactiveEffect(fn, options.scheduler)

	_effect.run()

	return _effect.run.bind(_effect)
}

export function track(target, key) {
	let targetMap = targetsMap.get(target)
	if (!targetMap) {
		targetMap = new Map()
		targetsMap.set(target, targetMap)
	}

	let depsMap = targetMap.get(key)
	if (!depsMap) {
		depsMap = new Set()
		targetMap.set(key, depsMap)
	}

	depsMap.add(activeEffect)
}

export function trigger(target, key, value) {
	let targetMap = targetsMap.get(target)
	let depsMap = targetMap.get(key)
	for (const effect of depsMap) {
		if (effect.scheduler) {
			effect.scheduler()
		} else {
			effect.run()
		}
	}
}
