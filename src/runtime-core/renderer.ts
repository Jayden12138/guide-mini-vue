import { effect } from '../reactivity/src/index'
import { ShapeFlags } from '../shared/ShapeFlags'
import { EMPTY_OBJ } from '../shared/index'
import { createComponentInstance, setupComponent } from './component'
import { createAppAPI } from './createApp'
import { Fragment, Text } from './vnode'

export function createRenderer(options) {
	const {
		createElement: hostCreateElement,
		patchProp: hostPatchProp,
		insert: hostInsert,
		remove: hostRemove,
		setElementText: hostSetElementText,
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
		mountChildren(n2.children, container, parentComponent)
	}

	function processElement(n1, n2, container, parentComponent) {
		if (!n1) {
			// mount
			mountElement(n1, n2, container, parentComponent)
		} else {
			// update
			patchElement(n1, n2, container, parentComponent)
		}
	}

	function patchElement(n1, n2, container, parentComponent) {
		console.log('patchElement')
		console.log('n1: ', n1)
		console.log('n2: ', n2)

		const prevProps = n1.props || EMPTY_OBJ
		const nextProps = n2.props || EMPTY_OBJ

		const el = (n2.el = n1.el)

		patchChildren(n1, n2, el, parentComponent)
		patchProps(el, prevProps, nextProps)
	}

	function patchChildren(n1, n2, container, parentComponent) {
		const { shapeFlag: prevShapFlag, children: c1 } = n1
		const { shapeFlag: nextShapFlag, children: c2 } = n2

		if (prevShapFlag & ShapeFlags.ARRAY_CHILDREN) {
			if (nextShapFlag & ShapeFlags.TEXT_CHILDREN) {
				// array -> text
				unmountChildren(c1)

				hostSetElementText(container, c2)
			} else {
				// array -> array
			}
		} else {
			if (nextShapFlag & ShapeFlags.TEXT_CHILDREN) {
				// text -> text
				hostSetElementText(container, c2)
			} else {
				// text -> array
				hostSetElementText(container, '')

				mountChildren(c2, container, parentComponent)
			}
		}
	}

	function unmountChildren(children) {
		children.forEach(v => {
			hostRemove(v.el)
		})
	}

	function patchProps(el, prevProps, nextProps) {
		if (prevProps !== nextProps) {
			for (let key in nextProps) {
				const nextProp = nextProps[key]
				const prevProp = prevProps[key]

				if (nextProp !== prevProp) {
					hostPatchProp(el, key, prevProp, nextProp)
				}
			}

			if (prevProps !== EMPTY_OBJ) {
				for (let key in prevProps) {
					if (!(key in nextProps)) {
						hostPatchProp(el, key, prevProps[key], null)
					}
				}
			}
		}
	}

	function mountElement(n1, n2, container, parentComponent) {
		const el = (n2.el = hostCreateElement(n2.type))

		// string | array
		const { children, shapeFlag } = n2
		if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
			el.textContent = children
		} else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
			mountChildren(n2.children, el, parentComponent)
		}

		// props
		const { props } = n2
		for (const key in props) {
			const val = props[key]

			hostPatchProp(el, key, null, val)
		}

		hostInsert(el, container)
	}

	function mountChildren(children, container, parentComponent) {
		children.forEach(v => {
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
