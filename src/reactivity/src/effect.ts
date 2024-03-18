const targetMap = new Map()
let activeEffect

class ReactiveEffect {
	private _fn: any
	public deps: any = []
	private active: boolean = true
	constructor(_fn, public scheduler?) {
		this._fn = _fn
	}

	run() {
		activeEffect = this
		return this._fn()
	}

	stop() {
		if (this.active) {
			this.active = false
			cleanupEffect(this)
		}
	}
}

export function effect(fn, options: any = {}) {
	const _effect: any = new ReactiveEffect(fn, options.scheduler)

	_effect.run()

	const runner = _effect.run.bind(_effect)
	runner._effect = _effect

	return runner
}

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

	if (!activeEffect) return

	dep.add(activeEffect)
	activeEffect.deps.push(dep)
}

export function trigger(target, key, value) {
	let depsMap = targetMap.get(target)
	let dep = depsMap.get(key)
	for (const effect of dep) {
		if (effect.scheduler) {
			effect.scheduler()
		} else {
			effect.run()
		}
	}
}

export function stop(runner) {
	runner._effect.stop()
}

function cleanupEffect(effect) {
	effect.deps.forEach(dep => {
		dep.delete(effect)
	})
	effect.deps.length = 0
}
