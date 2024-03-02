import { isObject } from '../shared/index'
import { createComponentInstance, setupComponent } from './component'

export function render(vnode, container) {
	patch(vnode, container)
}

export function patch(vnode, container) {
	// vnode type: component | element
	if (typeof vnode.type === 'string') {
		processElement(vnode, container)
	} else if (isObject(vnode.type)) {
		processComponent(vnode, container)
	}
}

function processElement(vnode, container) {
	mountElement(vnode, container)
}

function mountElement(vnode, container) {
	const el = document.createElement(vnode.type)

	// string | array
	const { children } = vnode
	if (typeof children == 'string') {
		el.textContent = children
	} else if (Array.isArray(children)) {
		mountChildren(vnode, el)
	}

	// props
	const { props } = vnode
	for (const key in props) {
		const val = props[key]
		el.setAttribute(key, val)
	}

	container.append(el)
}

function mountChildren(vnode, container) {
	vnode.children.forEach(v => {
		patch(v, container)
	})
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
