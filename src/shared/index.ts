export const extend = Object.assign

export function isObject(value) {
	return value && typeof value === 'object'
}

export const hasChanged = Object.is
