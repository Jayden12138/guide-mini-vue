import { extend } from '../../shared'

class ReactiveEffect {
	active = true
	deps = []
	onStop?: () => void
	private _fn: any
	constructor(fn, public scheduler?) {
		this._fn = fn
	}

	run() {
		activeEffect = this
		return this._fn()
	}

	stop() {
		if (this.active) {
			cleanupEffect(this)
			if (this.onStop) {
				this.onStop()
			}
			this.active = false
		}
	}
}

function cleanupEffect(effect) {
	effect.deps.forEach((dep: any) => {
		dep.delete(effect)
	})
}

export function effect(fn, options: any = {}) {
	const _effect = new ReactiveEffect(fn, options.scheduler)

	// _effect.onStop = options.onStop
	// Object.assign(_effect, options)
	extend(_effect, options)

	_effect.run()

	const runner: any = _effect.run.bind(_effect)

	runner._effect = _effect

	return runner
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

	if (!activeEffect) return

	dep.add(activeEffect)
	activeEffect.deps.push(dep)
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

export function stop(runner) {
	runner._effect.stop()
}
