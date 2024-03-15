import { ShapeFlags } from '../shared/ShapeFlags'

export const Fragment = Symbol('Fragment')
export const Text = Symbol('text')

export { createVNode as createElementVNode }

export function createTextVNode(text) {
	return createVNode(Text, {}, text)
}

export function createVNode(type, props?, children?) {
	const vnode = {
		type,
		props,
		children,
		shapeFlag: getShapeFlag(type),
		el: null,
		key: props && props.key,
	}

	// children
	if (typeof children == 'string') {
		vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN
	} else if (Array.isArray(children)) {
		vnode.shapeFlag |= ShapeFlags.ARRAY_CHILDREN
	}

	// 组件 + children object
	if (vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
		if (typeof children == 'object') {
			vnode.shapeFlag |= ShapeFlags.SLOTS_CHILDREN
		}
	}

	return vnode
}

function getShapeFlag(type) {
	return typeof type == 'string'
		? ShapeFlags.ELEMENT
		: ShapeFlags.STATEFUL_COMPONENT
}
