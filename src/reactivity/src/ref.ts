import { hasChanged, isObject } from '../../shared'
import { isTracking, trackEffect, triggerEffect } from './effect'
import { reactive } from './reactive'

class RefImpl {
	public deps
	private _value
	private _rawValue
	public __v_isRef = true
	constructor(value) {
		this.deps = new Set()
		this._rawValue = value
		this._value = convert(value)
	}

	get value() {
		trackRefValue(this)
		return this._value
	}

	set value(newValue) {
		if (hasChanged(newValue, this._rawValue)) return
		this._rawValue = newValue
		this._value = convert(newValue)
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

export function isRef(value) {
	return !!value['__v_isRef']
}

export function unRef(ref) {
	return isRef(ref) ? ref.value : ref
}
