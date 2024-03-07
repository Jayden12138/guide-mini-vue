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
		patch(null, vnode, container, null, null)
	}

	function patch(n1, n2, container, parentComponent, anchor) {
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
					processElement(n1, n2, container, parentComponent, anchor)
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

	function processElement(n1, n2, container, parentComponent, anchor) {
		if (!n1) {
			// mount
			mountElement(n1, n2, container, parentComponent, anchor)
		} else {
			// update
			patchElement(n1, n2, container, parentComponent, anchor)
		}
	}

	function patchElement(n1, n2, container, parentComponent, anchor) {
		console.log('patchElement')
		console.log('n1: ', n1)
		console.log('n2: ', n2)

		const prevProps = n1.props || EMPTY_OBJ
		const nextProps = n2.props || EMPTY_OBJ

		const el = (n2.el = n1.el)

		patchChildren(n1, n2, el, parentComponent, anchor)
		patchProps(el, prevProps, nextProps)
	}

	function patchChildren(n1, n2, container, parentComponent, parentAnchor) {
		const { shapeFlag: prevShapFlag, children: c1 } = n1
		const { shapeFlag: nextShapFlag, children: c2 } = n2

		if (prevShapFlag & ShapeFlags.ARRAY_CHILDREN) {
			if (nextShapFlag & ShapeFlags.TEXT_CHILDREN) {
				// array -> text
				unmountChildren(c1)

				hostSetElementText(container, c2)
			} else {
				// array -> array
				patchKeyedChildren(
					c1,
					c2,
					container,
					parentComponent,
					parentAnchor
				)
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

	function patchKeyedChildren(
		c1,
		c2,
		container,
		parentComponent,
		parentAnchor
	) {
		let i = 0
		let e1 = c1.length - 1
		let e2 = c2.length - 1

		// 左端对比
		while (i <= e2 && i <= e1) {
			let n1 = c1[i]
			let n2 = c2[i]
			if (isSame(n1, n2)) {
				patch(n1, n2, container, parentComponent, parentAnchor)
				i++
			} else {
				break
			}
		}

		console.log(i, e1, e2)

		// 右端对比
		while (i <= e2 && i <= e1) {
			let n1 = c1[e1]
			let n2 = c2[e2]
			if (isSame(n1, n2)) {
				patch(n1, n2, container, parentComponent, parentAnchor)
				e1--
				e2--
			} else {
				break
			}
		}

		console.log(i, e1, e2)

		if (i > e1) {
			if (i <= e2) {
				// i > e1 && i <= e2
				// 新的比老的长(创建新的)

				for (let j = e2; j >= i; j--) {
					const anchor = c2[e2 + 1].el || null
					patch(null, c2[j], container, parentComponent, anchor)
					e2--
				}
			} else {
				// i > e1 && i > e2
				// 不存在这种情况
			}
		} else {
			if (i > e2) {
				// i > e2 && i <= e1
				// 老的比新的长
				for (let j = i; j <= e1; j++) {
					// c1[j]
					hostRemove(c1[j].el)
				}
			} else {
				// i <= e1 && i <= e2
				// 乱序
			}
		}
	}

	function isSame(n1, n2) {
		return n1.type === n2.type && n1.key === n2.key
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

	function mountElement(n1, n2, container, parentComponent, anchor) {
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

		hostInsert(el, container, anchor)
	}

	function mountChildren(children, container, parentComponent) {
		children.forEach(v => {
			patch(null, v, container, parentComponent, null)
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

				patch(null, subTree, container, instance, null)

				instance.isMounted = true
				// 处理完
				initialVNode.el = subTree.el
			} else {
				console.log('update')

				const subTree = instance.render.call(proxy)
				const prevSubTree = instance.subTree

				patch(prevSubTree, subTree, container, instance, null)

				// update
				instance.subTree = subTree
			}
		})
	}

	return {
		createApp: createAppAPI(render),
	}
}
