import { ShapeFlags } from '../shared/ShapeFlags'
import { createComponentInstance, setupComponent } from './component'
import { createAppAPI } from './createApp'
import { Fragment, Text } from './vnode'

export function createRenderer(options) {
	const {
		createElement: hostCreateElement,
		patchProp: hostPatchProp,
		insert: hostInsert,
	} = options

	function render(vnode, container) {
		patch(vnode, container, null)
	}

	function patch(vnode, container, parentComponent) {
		const { shapeFlag, type } = vnode

		switch (type) {
			case Fragment:
				processFragment(vnode, container, parentComponent)
				break
			case Text:
				processText(vnode, container)
				break
			default:
				if (shapeFlag & ShapeFlags.ELEMENT) {
					processElement(vnode, container, parentComponent)
				} else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
					processComponent(vnode, container, parentComponent)
				}
				break
		}
	}

	function processText(vnode, container) {
		const { children } = vnode
		const textNode = (vnode.el = document.createTextNode(children))
		container.append(textNode)
	}

	function processFragment(vnode, container, parentComponent) {
		mountChildren(vnode, container, parentComponent)
	}

	function processElement(vnode, container, parentComponent) {
		mountElement(vnode, container, parentComponent)
	}

	function mountElement(vnode, container, parentComponent) {
		const el = (vnode.el = hostCreateElement(vnode.type))

		// string | array
		const { children, shapeFlag } = vnode
		if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
			el.textContent = children
		} else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
			mountChildren(vnode, el, parentComponent)
		}

		// props
		const { props } = vnode
		for (const key in props) {
			const val = props[key]

			hostPatchProp(el, key, val)
		}

		hostInsert(el, container)
	}

	function mountChildren(vnode, container, parentComponent) {
		vnode.children.forEach(v => {
			patch(v, container, parentComponent)
		})
	}

	function processComponent(vnode, container, parentComponent) {
		// mount | update
		mountComponent(vnode, container, parentComponent)
	}

	function mountComponent(initialVNode, container, parentComponent) {
		// instance
		// setup
		// setupRenderEffect

		// instance
		const instance = createComponentInstance(initialVNode, parentComponent)

		// setup 去配置 render 以及其他 props 、slots 等
		setupComponent(instance, container)

		// setupRenderEffect 调用 render
		setupRenderEffect(instance, initialVNode, container)
	}

	function setupRenderEffect(instance, initialVNode, container) {
		// 执行 render
		const { proxy } = instance
		const subTree = instance.render.call(proxy)

		patch(subTree, container, instance)

		// 处理完
		initialVNode.el = subTree.el
	}

	return {
		createApp: createAppAPI(render),
	}
}
