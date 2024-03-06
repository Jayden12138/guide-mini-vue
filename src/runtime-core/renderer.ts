import { ShapeFlags } from '../shared/ShapeFlags'
import { isOn } from '../shared/index'
import { createComponentInstance, setupComponent } from './component'
import { Fragment, Text } from './vnode'

export function render(vnode, container) {
	patch(vnode, container)
}

export function patch(vnode, container) {
	const { shapeFlag, type } = vnode

	switch (type) {
		case Fragment:
			processFragment(vnode, container)
			break
		case Text:
			processText(vnode, container)
			break
		default:
			if (shapeFlag & ShapeFlags.ELEMENT) {
				processElement(vnode, container)
			} else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
				processComponent(vnode, container)
			}
			break
	}
}

function processText(vnode, container) {
	const { children } = vnode
	const textNode = (vnode.el = document.createTextNode(children))
	container.append(textNode)
}

function processFragment(vnode, container) {
	mountChildren(vnode, container)
}

function processElement(vnode, container) {
	mountElement(vnode, container)
}

function mountElement(vnode, container) {
	const el = (vnode.el = document.createElement(vnode.type))

	// string | array
	const { children, shapeFlag } = vnode
	if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
		el.textContent = children
	} else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
		mountChildren(vnode, el)
	}

	// props
	const { props } = vnode
	for (const key in props) {
		const val = props[key]
		if (isOn(key)) {
			const event = key.slice(2).toLowerCase()
			el.addEventListener(event, val)
		} else {
			el.setAttribute(key, val)
		}
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

export function mountComponent(initialVNode, container) {
	// instance
	// setup
	// setupRenderEffect

	// instance
	const instance = createComponentInstance(initialVNode)

	// setup 去配置 render 以及其他 props 、slots 等
	setupComponent(instance, container)

	// setupRenderEffect 调用 render
	setupRenderEffect(instance, initialVNode, container)
}

export function setupRenderEffect(instance, initialVNode, container) {
	// 执行 render
	const { proxy } = instance
	const subTree = instance.render.call(proxy)

	patch(subTree, container)

	// 处理完
	initialVNode.el = subTree.el
}
