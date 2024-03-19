import { extend } from '../../shared'

const targetMap = new Map()
let activeEffect
let shouldTrack

class ReactiveEffect {
	private _fn: any
	public deps: any = []
	private active: boolean = true
	onStop?: () => {}
	constructor(_fn, public scheduler?) {
		this._fn = _fn
	}

	run() {
		if (!this.active) {
			return this._fn()
		}

		shouldTrack = true
		activeEffect = this

		const res = this._fn()

		shouldTrack = false

		return res
	}

	stop() {
		if (this.active) {
			this.active = false
			cleanupEffect(this)
			this.onStop && this.onStop()
		}
	}
}

export function effect(fn, options: any = {}) {
	const _effect: any = new ReactiveEffect(fn, options.scheduler)
	extend(_effect, options)

	_effect.run()

	const runner = _effect.run.bind(_effect)
	runner._effect = _effect

	return runner
}

export function track(target, key) {
	if (!isTracking()) return

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

	trackEffect(dep)
}

export function trackEffect(dep: any) {
	if (dep.has(activeEffect)) return

	dep.add(activeEffect)
	activeEffect.deps.push(dep)
}

export function trigger(target, key, value) {
	let depsMap = targetMap.get(target)
	let dep = depsMap.get(key)
	triggerEffect(dep)
}

export function triggerEffect(dep: any) {
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

export function isTracking() {
	return shouldTrack && activeEffect !== undefined
}
