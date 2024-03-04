import { shallowReadonly } from '../reactivity/src/reactive'
import { initProps } from './componentProps'
import { PublicInstanceProxyHanlders } from './componentPublicInstance'

export function createComponentInstance(vnode) {
	const component = {
		vnode,
		type: vnode.type,
		setupState: {},
		props: {},
	}
	return component
}

export function setupComponent(instance, container) {
	// initProps
	// initSlots
	// setupStatefulComponent

	// initProps
	initProps(instance, instance.vnode.props)

	// initSlots

	// setupStatefulComponet
	setupStatefulComponent(instance)
}

function setupStatefulComponent(instance) {
	const Component = instance.type

	// ctx
	instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHanlders)

	const { setup } = Component

	if (setup) {
		// setupResult: function | object
		const setupResult = setup(shallowReadonly(instance.props))

		handleSetupResult(instance, setupResult)
	}
}

export function handleSetupResult(instance, setupResult) {
	if (typeof setupResult == 'object') {
		instance.setupState = setupResult
	}

	finishComponentSetup(instance)
}

export function finishComponentSetup(instance) {
	const Component = instance.type

	if (Component.render) {
		instance.render = Component.render
	}
}
