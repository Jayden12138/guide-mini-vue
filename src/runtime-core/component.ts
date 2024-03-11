import { shallowReadonly, proxyRefs } from '../reactivity/src/index'
import { emit } from './componentEmit'
import { initProps } from './componentProps'
import { PublicInstanceProxyHanlders } from './componentPublicInstance'
import { initSlots } from './componentSlots'

let currentInstance = null

export function createComponentInstance(vnode, parent) {
	const component = {
		vnode,
		type: vnode.type,
		setupState: {},
		component: null,
		next: null,
		props: {},
		slots: {},
		provides: parent ? parent.provides : {},
		parent: parent,
		isMounted: false,
		emit: () => {},
		update: () => {},
	}
	component.emit = emit.bind(null, component) as any
	return component
}

export function setupComponent(instance, container) {
	// initProps
	// initSlots
	// setupStatefulComponent

	// initProps
	initProps(instance, instance.vnode.props)

	// initSlots
	initSlots(instance, instance.vnode.children)

	// setupStatefulComponet
	setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
	const Component = instance.type

	// ctx
	instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHanlders)

	const { setup } = Component

	if (setup) {
		setCurrentInstance(instance)

		// setupResult: function | object
		const setupResult = setup(shallowReadonly(instance.props), {
			emit: instance.emit,
		})

		setCurrentInstance(null)

		handleSetupResult(instance, setupResult)
	}
}

export function handleSetupResult(instance, setupResult) {
	if (typeof setupResult == 'object') {
		instance.setupState = proxyRefs(setupResult)
	}

	finishComponentSetup(instance)
}

export function finishComponentSetup(instance) {
	const Component = instance.type

	if (Component.render) {
		instance.render = Component.render
	}
}

export function getCurrentInstance() {
	return currentInstance
}

function setCurrentInstance(instance) {
	currentInstance = instance
}
