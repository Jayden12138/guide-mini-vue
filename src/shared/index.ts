export const extend = Object.assign

export const isObject = val => {
	return val != null && typeof val == 'object'
}

export const hasChanged = Object.is

export const isOn = (val: string) => /^on[A-Z]/.test(val)
