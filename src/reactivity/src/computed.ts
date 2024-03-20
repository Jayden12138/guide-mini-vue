import { ReactiveEffect } from './effect'

class ComputedImpl {
	private _dirty: any = true
	private _cacheValue: any
	private _effect: ReactiveEffect
	constructor(getter) {
		this._effect = new ReactiveEffect(getter, () => {
			if (!this._dirty) {
				this._dirty = true
			}
		})
	}

	get value() {
		if (this._dirty) {
			this._dirty = false
			this._cacheValue = this._effect.run()
		}
		return this._cacheValue
	}
}
export function computed(getter) {
	return new ComputedImpl(getter)
}
