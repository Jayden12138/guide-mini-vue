import { effect } from '../reactivity/src/index'
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
		patch(null, vnode, container, null)
	}

	function patch(n1, n2, container, parentComponent) {
		const { shapeFlag, type } = n2

		switch (type) {
			case Fragment:
				processFragment(n1, n2, container, parentComponent)
				break
			case Text:
				processText(n1, n2, container)
				break
			default:
				if (shapeFlag & ShapeFlags.ELEMENT) {
					processElement(n1, n2, container, parentComponent)
				} else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
					processComponent(n1, n2, container, parentComponent)
				}
				break
		}
	}

	function processText(n1, n2, container) {
		const { children } = n2
		const textNode = (n2.el = document.createTextNode(children))
		container.append(textNode)
	}

	function processFragment(n1, n2, container, parentComponent) {
		mountChildren(n2, container, parentComponent)
	}

	function processElement(n1, n2, container, parentComponent) {
		if (!n1) {
			// mount
			mountElement(n1, n2, container, parentComponent)
		} else {
			// update
			patchElement(n1, n2, container)
		}
	}

	function patchElement(n1, n2, container) {
		console.log('patchElement')
		console.log('n1: ', n1)
		console.log('n2: ', n2)
	}

	function mountElement(n1, n2, container, parentComponent) {
		const el = (n2.el = hostCreateElement(n2.type))

		// string | array
		const { children, shapeFlag } = n2
		if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
			el.textContent = children
		} else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
			mountChildren(n2, el, parentComponent)
		}

		// props
		const { props } = n2
		for (const key in props) {
			const val = props[key]

			hostPatchProp(el, key, val)
		}

		hostInsert(el, container)
	}

	function mountChildren(vnode, container, parentComponent) {
		vnode.children.forEach(v => {
			patch(null, v, container, parentComponent)
		})
	}

	function processComponent(n1, n2, container, parentComponent) {
		// mount | update
		mountComponent(n2, container, parentComponent)
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
		effect(() => {
			const { proxy } = instance
			if (!instance.isMounted) {
				console.log('init')
				// 执行 render
				const subTree = (instance.subTree = instance.render.call(proxy))
				console.log(subTree)

				patch(null, subTree, container, instance)

				instance.isMounted = true
				// 处理完
				initialVNode.el = subTree.el
			} else {
				console.log('update')

				const subTree = instance.render.call(proxy)
				const prevSubTree = instance.subTree

				patch(prevSubTree, subTree, container, instance)

				// update
				instance.subTree = subTree
			}
		})
	}

	return {
		createApp: createAppAPI(render),
	}
}
