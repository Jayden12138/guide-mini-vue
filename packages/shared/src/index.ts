export const extend = Object.assign

export const isObject = val => {
	return val != null && typeof val == 'object'
}

export const hasChanged = Object.is

export const isOn = (val: string) => /^on[A-Z]/.test(val)

export const hasOwn = (val, key) =>
	Object.prototype.hasOwnProperty.call(val, key)

export const EMPTY_OBJ = {}

export const isString = val => typeof val === 'string'

export * from './toDisplayString'
export * from './ShapeFlags'
