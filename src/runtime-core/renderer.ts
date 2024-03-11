import { effect } from '../reactivity/src/index'
import { ShapeFlags } from '../shared/ShapeFlags'
import { EMPTY_OBJ } from '../shared/index'
import { createComponentInstance, setupComponent } from './component'
import { shouldUpdateComponent } from './componentUpdateUtils'
import { createAppAPI } from './createApp'
import { queueJobs } from './scheduler'
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
		let l2 = c2.length
		let e2 = l2 - 1

		// 1. sync from start
		// (a b) c
		// (a b)
		while (i <= e1 && i <= e2) {
			const prevChild = c1[i]
			const nextChild = c2[i]

			if (isSame(prevChild, nextChild)) {
				patch(
					prevChild,
					nextChild,
					container,
					parentComponent,
					parentAnchor
				)
			} else {
				break
			}
			i++
		}

		// 2. sync from end
		// a (b c)
		// (b c)
		while (i <= e1 && i <= e2) {
			const prevChild = c1[e1]
			const nextChild = c2[e2]

			if (isSame(prevChild, nextChild)) {
				patch(
					prevChild,
					nextChild,
					container,
					parentComponent,
					parentAnchor
				)
			} else {
				break
			}
			e1--
			e2--
		}

		// 3. common sequence + mount
		// (a b)
		// (a b) c d e
		// i = 2, e1 = 1, e2 = 4
		// (a b)
		// c d e (a b)
		// i = 0, e1 = -1, e2 = 2
		if (i > e1) {
			if (i <= e2) {
				// e1 < i <= e2
				for (let j = e2; j >= i; j--) {
					const nextChild = c2[j]
					const nextAnchor = j + 1 < l2 ? c2[j + 1].el : parentAnchor
					// mount
					patch(
						null,
						nextChild,
						container,
						parentComponent,
						nextAnchor
					)
				}
			}
		}

		// 4. common sequence + unmoun
		// (a b) c d e
		// (a b)
		// i = 2, e1 = 4, e2 = 1
		else if (i > e2) {
			// i <= e1 && i > e2
			for (let j = i; j <= e1; j++) {
				const nextChild = c1[j]
				hostRemove(nextChild.el)
			}
		}

		// TODO: 5. unknown sequence
		// 删除
		// a b (c d) f g
		// a b (e c) f g

		// 删除 patched、toBePatched
		// a b (c e d) f g
		// a b (e c) f g

		// 移动
		// a b (c d e) f g
		// a b (e c d) f g

		// 新增
		// a b (c e) f g
		// a b (e c d) f g

		// 综合
		// a b (c d e z) f g
		// a b (d c y e) f g
		else {
			// i <= e1 && i <= e2
			let s1 = i
			let s2 = i

			// 5.1 keyToNewIndexMap

			const keyToNewIndexMap = new Map()
			for (let j = s2; j <= e2; j++) {
				let nextChild = c2[j]
				if (nextChild.key != null) {
					if (keyToNewIndexMap.has(nextChild.key)) {
						console.warn(
							`Duplicate keys found during update:`,
							JSON.stringify(nextChild.key),
							`Make sure keys are unique.`
						)
					}
					keyToNewIndexMap.set(nextChild.key, j)
				}
			}

			// 5.2 newIndexToOldIndexMap

			let patched = 0
			let toBePatched = e2 - i + 1
			let moved = false
			let maxNewIndexSoFar = 0

			const newIndexToOldIndexMap = new Array(toBePatched)
			newIndexToOldIndexMap.fill(0)

			for (let j = s1; j <= e1; j++) {
				const prevChild = c1[j]
				if (patched >= toBePatched) {
					hostRemove(prevChild.el)
					continue
				}

				let newIndex
				if (prevChild.key != null) {
					newIndex = keyToNewIndexMap.get(prevChild.key)
				} else {
					for (let k = s2; k <= e2; k++) {
						const nextChild = c2[k]
						if (
							newIndexToOldIndexMap[k - s2] === 0 &&
							isSame(nextChild, prevChild)
						) {
							newIndex = k
							break
						}
					}
				}

				if (newIndex != null) {
					newIndexToOldIndexMap[newIndex - s2] = j + 1
					if (newIndex >= maxNewIndexSoFar) {
						maxNewIndexSoFar = newIndex
					} else {
						moved = true
					}
					patch(
						prevChild,
						c2[newIndex],
						container,
						parentComponent,
						parentAnchor
					)
					patched++
				} else {
					hostRemove(prevChild.el)
				}
			}

			// 5.3 increasingNewIndexSequence

			const increasingNewIndexSequence = moved
				? getSequence(newIndexToOldIndexMap)
				: []
			let j = increasingNewIndexSequence.length - 1

			for (let k = toBePatched - 1; k >= 0; k--) {
				let newIndex = k + s2
				const nextChild = c2[newIndex]
				const nextAnchor =
					newIndex + 1 < l2 ? c2[newIndex + 1].el : null

				if (newIndexToOldIndexMap[k] === 0) {
					// 新增
					patch(
						null,
						nextChild,
						container,
						parentComponent,
						nextAnchor
					)
				} else if (moved) {
					if (increasingNewIndexSequence[j] === k) {
						j--
					} else {
						hostInsert(nextChild.el, container, nextAnchor)
					}
				}
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
		if (!n1) {
			mountComponent(n2, container, parentComponent)
		} else {
			updateComponent(n1, n2)
		}
	}

	function updateComponent(n1, n2) {
		const instance = (n2.component = n1.component)
		if (shouldUpdateComponent(n1, n2)) {
			instance.next = n2
			instance.update()
		} else {
			n2.el = n1.el
			instance.vnode = n2
		}
	}

	function mountComponent(initialVNode, container, parentComponent) {
		// instance
		// setup
		// setupRenderEffect

		// instance
		const instance = (initialVNode.component = createComponentInstance(
			initialVNode,
			parentComponent
		))

		// setup 去配置 render 以及其他 props 、slots 等
		setupComponent(instance, container)

		// setupRenderEffect 调用 render
		setupRenderEffect(instance, initialVNode, container)
	}

	function setupRenderEffect(instance, initialVNode, container) {
		instance.update = effect(
			() => {
				const { proxy } = instance
				if (!instance.isMounted) {
					console.log('init')
					// 执行 render
					const subTree = (instance.subTree =
						instance.render.call(proxy))
					console.log(subTree)

					patch(null, subTree, container, instance, null)

					instance.isMounted = true
					// 处理完
					initialVNode.el = subTree.el
				} else {
					console.log('update')

					const { vnode, next } = instance

					if (next) {
						next.el = vnode.el
						updateComponentPreRender(instance, next)
					}

					const subTree = instance.render.call(proxy)
					const prevSubTree = instance.subTree

					patch(prevSubTree, subTree, container, instance, null)

					// update
					instance.subTree = subTree
				}
			},
			{
				scheduler() {
					queueJobs(instance.update)
				},
			}
		)
	}

	return {
		createApp: createAppAPI(render),
	}
}

function updateComponentPreRender(instance, next) {
	instance.props = next.props
	instance.vnode = next
	instance.next = null
}

function getSequence(arr: number[]): number[] {
	const p = arr.slice()
	const result = [0]
	let i, j, u, v, c
	const len = arr.length
	for (i = 0; i < len; i++) {
		const arrI = arr[i]
		if (arrI !== 0) {
			j = result[result.length - 1]
			if (arr[j] < arrI) {
				p[i] = j
				result.push(i)
				continue
			}
			u = 0
			v = result.length - 1
			while (u < v) {
				c = (u + v) >> 1
				if (arr[result[c]] < arrI) {
					u = c + 1
				} else {
					v = c
				}
			}
			if (arrI < arr[result[u]]) {
				if (u > 0) {
					p[i] = result[u - 1]
				}
				result[u] = i
			}
		}
	}
	u = result.length
	v = result[u - 1]
	while (u-- > 0) {
		result[u] = v
		v = p[v]
	}
	return result
}
