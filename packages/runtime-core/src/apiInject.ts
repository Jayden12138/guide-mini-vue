import { getCurrentInstance } from './component'

export function provide(key, value) {
	const instance: any = getCurrentInstance()

	if (instance) {
		let { provides }: any = instance

		const parentProvides = instance.parent?.provides

		if (provides === parentProvides) {
			// init

			provides = instance.provides = Object.create(parentProvides)
		}

		provides[key] = value
	}
}

export function inject(key, defaultValue) {
	const instance: any = getCurrentInstance()

	if (instance) {
		let { provides } = instance.parent

		if (key in provides) {
			return provides[key]
		} else {
			if (typeof defaultValue === 'function') {
				return defaultValue()
			} else {
				return defaultValue
			}
		}
	}
}
