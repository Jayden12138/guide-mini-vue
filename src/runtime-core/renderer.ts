import { createComponentInstance, setupComponent } from './component'

export function render(vnode, container) {
	patch(vnode, container)
}

export function patch(vnode, container) {
	// vnode type: component | element

	processComponent(vnode, container)
}

export function processComponent(vnode, container) {
	// mount | update
	mountComponent(vnode, container)
}

export function mountComponent(vnode, container) {
	// instance
	// setup
	// setupRenderEffect

	// instance
	const instance = createComponentInstance(vnode)

	// setup 去配置 render 以及其他 props 、slots 等
	setupComponent(instance, container)

	// setupRenderEffect 调用 render
	setupRenderEffect(instance, container)
}

export function setupRenderEffect(instance, container) {
	// 执行 render
	const subTree = instance.render()

	patch(subTree, container)
}
