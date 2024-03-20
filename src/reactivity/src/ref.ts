import { hasChanged, isObject } from '../../shared'
import { isTracking, trackEffect, triggerEffect } from './effect'
import { reactive } from './reactive'

class RefImpl {
	public deps: any
	private _value: any
	private _rawValue: any
	__v_isRef: boolean
	constructor(value) {
		this.deps = new Set()
		this._rawValue = value
		this._value = convert(value)
		this.__v_isRef = true
	}
	get value() {
		trackRefValue(this)
		return this._value
	}
	set value(newVal) {
		if (hasChanged(this._rawValue, newVal)) return
		this._rawValue = newVal
		this._value = convert(newVal)
		triggerEffect(this.deps)
	}
}

function trackRefValue(ref) {
	if (isTracking()) {
		trackEffect(ref.deps)
	}
}

export function ref(value) {
	return new RefImpl(value)
}

function convert(value) {
	return isObject(value) ? reactive(value) : value
}

export function isRef(ref) {
	return !!ref['__v_isRef']
}

export function unRef(ref) {
	return isRef(ref) ? ref.value : ref
}

export function proxyRefs(ref) {
	return new Proxy(ref, {
		get(target, key) {
			return unRef(Reflect.get(target, key))
		},
		set(target, key, value) {
			const oldVal = Reflect.get(target, key)
			if (isRef(oldVal) && !isRef(value)) {
				return (target[key].value = value)
			} else {
				return Reflect.set(target, key, value)
			}
		},
	})
}
