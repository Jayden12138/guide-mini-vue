export function emit(instance, event, ...args) {
	const { props } = instance

	const handler = props[toHandlerKey(camelize(event))]
	handler && handler(...args)
}

const camelize = (str: string) => {
	return str.replace(/-(\w)/g, (_, c) => {
		return c ? c.toUpperCase() : ''
	})
}

const toHandlerKey = (str: string) => {
	return str ? 'on' + capitalize(str) : ''
}

const capitalize = (str: string) => {
	return str.charAt(0).toUpperCase() + str.slice(1)
}
