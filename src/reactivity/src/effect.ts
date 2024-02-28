class ReactiveEffect {
	private _fn: any
	constructor(fn, public scheduler?) {
		this._fn = fn
	}

	run() {
		activeEffect = this
		return this._fn()
	}
}

export function effect(fn, options: any = {}) {
	const _effect = new ReactiveEffect(fn, options.scheduler)

	_effect.run()

	return _effect.run.bind(_effect)
}

const targetMap = new Map()
let activeEffect
export function track(target, key) {
	let depsMap = targetMap.get(target)
	if (!depsMap) {
		depsMap = new Map()
		targetMap.set(target, depsMap)
	}

	let dep = depsMap.get(key)
	if (!dep) {
		dep = new Set()
		depsMap.set(key, dep)
	}

	dep.add(activeEffect)
}

export function trigger(target, key) {
	let depsMap = targetMap.get(target)
	let dep = depsMap.get(key)

	for (let _effect of dep) {
		if (_effect.scheduler) {
			_effect.scheduler()
		} else {
			_effect.run()
		}
	}
}
