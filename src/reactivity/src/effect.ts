const targetsMap = new Map()
let activeEffect

class ReactiveEffect {
	private _fn: any
	constructor(_fn) {
		this._fn = _fn
	}

	run() {
		activeEffect = this
		this._fn()
	}
}

export function effect(fn) {
	const _effect = new ReactiveEffect(fn)

	_effect.run()
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
		effect.run()
	}
}
