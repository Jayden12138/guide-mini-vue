function baseParse(content) {
	const context = createContext(content)
	return createRoot(parseChildren(context, []))
}
function parseInterpolation(context) {
	// {{message}}
	const openDelimiter = '{{'
	const closeDelimiter = '}}'
	let closeIndex = context.source.indexOf(
		closeDelimiter,
		openDelimiter.length
	)
	// {{
	advanceBy(context, openDelimiter.length)
	let rawContentLength = closeIndex - closeDelimiter.length
	let rawContent = parseTextData(context, rawContentLength)
	const content = rawContent.trim()
	advanceBy(context, closeDelimiter.length)
	return {
		type: 0 /* NodeTypes.INTERPOLATION */, // 'interpolation'
		content: {
			type: 1 /* NodeTypes.SIMPLE_EXPRESSION */, // 'simple_expression'
			content: content,
		},
	}
}
function advanceBy(context, numberOfCharacters) {
	context.source = context.source.slice(numberOfCharacters)
}
function parseChildren(context, ancestor) {
	const nodes = []
	while (!isEnd(context, ancestor)) {
		let node
		let s = context.source
		if (s.startsWith('{{')) {
			node = parseInterpolation(context)
		} else if (s.startsWith('<')) {
			if (/[a-z]/.test(s[1])) {
				node = parseElement(context, ancestor)
			}
		} else {
			node = parseText(context)
		}
		nodes.push(node)
	}
	return nodes
}
function isEnd(context, ancestor) {
	const s = context.source
	for (let i = ancestor.length - 1; i >= 0; i--) {
		let tag = ancestor[i].tag
		if (startsWithCloseTagOpen(s, tag)) {
			return true
		}
	}
	return !s
}
function parseText(context) {
	let endToken = ['{{', '<']
	let endIndex = context.source.length
	for (let i = 0; i < endToken.length; i++) {
		let index = context.source.indexOf(endToken[i])
		if (index !== -1 && endIndex > index) {
			endIndex = index
		}
	}
	const content = parseTextData(context, endIndex)
	return {
		type: 3 /* NodeTypes.TEXT */,
		content,
	}
}
function parseTextData(context, length) {
	const content = context.source.slice(0, length)
	advanceBy(context, length)
	return content
}
function createContext(content) {
	return {
		source: content,
	}
}
function createRoot(children) {
	return {
		children,
		type: 4 /* NodeTypes.ROOT */,
	}
}
function parseElement(context, ancestor) {
	const element = parseTag(context, 0 /* TagType.Start */)
	ancestor.push(element)
	element.children = parseChildren(context, ancestor)
	ancestor.pop()
	if (startsWithCloseTagOpen(context.source, element.tag)) {
		parseTag(context, 1 /* TagType.End */)
	} else {
		throw new Error(`缺少结束标签: ${element.tag}`)
	}
	return element
}
function startsWithCloseTagOpen(source, tag) {
	return (
		source.startsWith('</') &&
		source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
	)
}
function parseTag(context, type) {
	const match = /^<\/?([a-z]*)/.exec(context.source)
	const tag = match[1]
	// <div
	advanceBy(context, match[0].length)
	// >
	advanceBy(context, 1)
	if (type === 1 /* TagType.End */) return
	return {
		type: 2 /* NodeTypes.ELEMENT */,
		tag,
	}
}

const TO_DISPLAY_STRING = Symbol('toDisplayString')
const CREATE_ELEMENT_VNODE = Symbol('createElementVNode')
const helperMapName = {
	[TO_DISPLAY_STRING]: 'toDisplayString',
	[CREATE_ELEMENT_VNODE]: 'createElementVNode',
}

function transform(root, options = {}) {
	const context = createTransformContext(root, options)
	traverseNode(root, context)
	createCodegenNode(root)
	root.helpers = [...context.helpers.keys()]
}
function traverseNode(node, context) {
	const { nodeTransforms } = context
	const exitFns = []
	for (let i = 0; i < nodeTransforms.length; i++) {
		const plugin = nodeTransforms[i]
		const onExit = plugin(node, context)
		if (onExit) {
			exitFns.push(onExit)
		}
	}
	switch (node.type) {
		case 0 /* NodeTypes.INTERPOLATION */:
			context.helper(TO_DISPLAY_STRING)
			break
		case 4 /* NodeTypes.ROOT */:
		case 2 /* NodeTypes.ELEMENT */:
			traverseChildren(node, context)
			break
	}
	let i = exitFns.length
	while (i--) {
		exitFns[i]()
	}
}
function traverseChildren(node, context) {
	const children = node.children
	for (let i = 0; i < children.length; i++) {
		const n = children[i]
		traverseNode(n, context)
	}
}
function createTransformContext(root, options) {
	const context = {
		root,
		nodeTransforms: options.nodeTransforms || [],
		helpers: new Map(),
		helper(key) {
			context.helpers.set(key, 1)
		},
	}
	return context
}
function createCodegenNode(root) {
	const child = root.children[0]
	if (child.type === 2 /* NodeTypes.ELEMENT */) {
		root.codegenNode = child.codegenNode
	} else {
		root.codegenNode = root.children[0]
	}
}

function toDisplayString(val) {
	return String(val)
}

const extend = Object.assign
const isObject = val => {
	return val != null && typeof val == 'object'
}
const hasChanged = Object.is
const isOn = val => /^on[A-Z]/.test(val)
const hasOwn = (val, key) => Object.prototype.hasOwnProperty.call(val, key)
const EMPTY_OBJ = {}
const isString = val => typeof val === 'string'

function generate(ast) {
	const context = createCodegenContext()
	const { push } = context
	genFunctionPreamble(ast, context)
	const functionName = 'render'
	const args = ['_ctx', '_cache']
	const signature = args.join(', ')
	push(`function ${functionName}(${signature}) {`)
	push(`return `)
	genNode(ast.codegenNode, context)
	push(`}`)
	return {
		code: context.code,
	}
}
function genFunctionPreamble(ast, context) {
	const { push } = context
	const VueBinging = 'Vue'
	const aliasHelper = s => `${helperMapName[s]}: _${helperMapName[s]}`
	if (ast.helpers.length > 0) {
		push(
			`const { ${ast.helpers
				.map(aliasHelper)
				.join(', ')} } = ${VueBinging}`
		)
	}
	push('\n')
	push('return ')
}
function genNode(node, context) {
	switch (node.type) {
		case 3 /* NodeTypes.TEXT */:
			genText(node, context)
			break
		case 0 /* NodeTypes.INTERPOLATION */:
			genInterpolation(node, context)
			break
		case 1 /* NodeTypes.SIMPLE_EXPRESSION */:
			genExpression(node, context)
			break
		case 2 /* NodeTypes.ELEMENT */:
			genElement(node, context)
			break
		case 5 /* NodeTypes.COMPOUND_EXPRESSION */:
			genCompoundExpression(node, context)
	}
}
function genCompoundExpression(node, context) {
	const { children } = node
	const { push } = context
	for (let i = 0; i < children.length; i++) {
		const child = children[i]
		if (isString(child)) {
			push(child)
		} else {
			genNode(child, context)
		}
	}
}
function genElement(node, context) {
	const { push, helper } = context
	const { tag, children, props } = node
	push(`${helper(CREATE_ELEMENT_VNODE)}(`)
	genNodeList(genNullable([tag, props, children]), context)
	push(')')
}
function genNodeList(nodes, context) {
	const { push } = context
	for (let i = 0; i < nodes.length; i++) {
		const node = nodes[i]
		if (isString(node)) {
			push(node)
		} else {
			genNode(node, context)
		}
		if (i < nodes.length - 1) {
			push(', ')
		}
	}
}
function genNullable(args) {
	return args.map(arg => arg || 'null')
}
function genInterpolation(node, context) {
	const { push, helper } = context
	push(`${helper(TO_DISPLAY_STRING)}(`)
	genNode(node.content, context)
	push(`)`)
}
function genText(node, context) {
	const { push } = context
	push(`'${node.content}'`)
}
function createCodegenContext() {
	const context = {
		code: '',
		push(source) {
			context.code += source
		},
		helper(key) {
			return `_${helperMapName[key]}`
		},
	}
	return context
}
function genExpression(node, context) {
	const { push } = context
	push(`${node.content}`)
}

function createVNodeCall(context, tag, props, children) {
	if (context) {
		context.helper(CREATE_ELEMENT_VNODE)
	}
	return {
		type: 2 /* NodeTypes.ELEMENT */,
		tag,
		props,
		children,
	}
}

function transformElement(node, context) {
	if (node.type === 2 /* NodeTypes.ELEMENT */) {
		return () => {
			context.helper(CREATE_ELEMENT_VNODE)
			// 中间处理层
			// tag
			const vnodeTag = `'${node.tag}'`
			// props
			let vnodeProps
			// children
			const children = node.children
			let vnodeChildren = children[0]
			node.codegenNode = createVNodeCall(
				context,
				vnodeTag,
				vnodeProps,
				vnodeChildren
			)
		}
	}
}

function transformExpression(node) {
	if (node.type === 0 /* NodeTypes.INTERPOLATION */) {
		node.content = processExpression(node.content)
	}
}
function processExpression(node) {
	node.content = '_ctx.' + node.content
	return node
}

function isText(node) {
	return (
		node.type == 3 /* NodeTypes.TEXT */ ||
		node.type == 0 /* NodeTypes.INTERPOLATION */
	)
}

function transformText(node) {
	if (node.type === 2 /* NodeTypes.ELEMENT */) {
		return () => {
			const { children } = node
			let currentContianer
			for (let i = 0; i < children.length; i++) {
				const child = children[i]
				if (isText(child)) {
					for (let j = i + 1; j < children.length; j++) {
						const next = children[j]
						if (isText(next)) {
							// 相邻连个child为text | interpolation
							if (!currentContianer) {
								currentContianer = children[i] = {
									type: 5 /* NodeTypes.COMPOUND_EXPRESSION */,
									children: [child],
								}
							}
							currentContianer.children.push(` + `)
							currentContianer.children.push(next)
							children.splice(j, 1)
							j--
						} else {
							currentContianer = undefined
							break
						}
					}
				}
			}
		}
	}
}

function baseCompile(tempalte) {
	const ast = baseParse(tempalte)
	transform(ast, {
		nodeTransforms: [transformExpression, transformElement, transformText],
	})
	return generate(ast)
}

const Fragment = Symbol('Fragment')
const Text = Symbol('text')
function createTextVNode(text) {
	return createVNode(Text, {}, text)
}
function createVNode(type, props, children) {
	const vnode = {
		type,
		props,
		children,
		shapeFlag: getShapeFlag(type),
		el: null,
		key: props && props.key,
	}
	// children
	if (typeof children == 'string') {
		vnode.shapeFlag |= 4 /* ShapeFlags.TEXT_CHILDREN */
	} else if (Array.isArray(children)) {
		vnode.shapeFlag |= 8 /* ShapeFlags.ARRAY_CHILDREN */
	}
	// 组件 + children object
	if (vnode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
		if (typeof children == 'object') {
			vnode.shapeFlag |= 16 /* ShapeFlags.SLOTS_CHILDREN */
		}
	}
	return vnode
}
function getShapeFlag(type) {
	return typeof type == 'string'
		? 1 /* ShapeFlags.ELEMENT */
		: 2 /* ShapeFlags.STATEFUL_COMPONENT */
}

function createAppAPI(render) {
	return function createApp(rootComponent) {
		return {
			mount(rootContainer) {
				const vnode = createVNode(rootComponent)
				render(vnode, rootContainer)
			},
		}
	}
}

function h(type, props, children) {
	return createVNode(type, props, children)
}

function renderSlots(slots, name, props) {
	const slot = slots[name]
	if (slot) {
		if (typeof slot == 'function') {
			return createVNode(Fragment, {}, slot(props))
		}
	}
}

let activeEffect
let shouldTrack
class ReactiveEffect {
	constructor(fn, scheduler) {
		this.scheduler = scheduler
		this.active = true
		this.deps = []
		this._fn = fn
	}
	run() {
		if (!this.active) {
			return this._fn()
		}
		shouldTrack = true
		activeEffect = this
		const result = this._fn()
		shouldTrack = false
		return result
	}
	stop() {
		if (this.active) {
			cleanupEffect(this)
			if (this.onStop) {
				this.onStop()
			}
			this.active = false
		}
	}
}
function cleanupEffect(effect) {
	effect.deps.forEach(dep => {
		dep.delete(effect)
	})
	effect.deps.length = 0
}
function effect(fn, options = {}) {
	const _effect = new ReactiveEffect(fn, options.scheduler)
	// _effect.onStop = options.onStop
	// Object.assign(_effect, options)
	extend(_effect, options)
	_effect.run()
	const runner = _effect.run.bind(_effect)
	runner._effect = _effect
	return runner
}
const targetMap = new Map()
function track(target, key) {
	if (!isTracking()) return
	let depsMap = targetMap.get(target)
	if (!depsMap) {
		depsMap = new Map()
		targetMap.set(target, depsMap)
	}
	let dep = depsMap.get(key)
	if (!dep) {
		dep = new Set()
		depsMap.set(key, dep)
	}
	trackEffect(dep)
}
function trackEffect(dep) {
	if (dep.has(activeEffect)) return
	dep.add(activeEffect)
	activeEffect.deps.push(dep)
}
function isTracking() {
	return shouldTrack && activeEffect !== undefined
}
function trigger(target, key) {
	let depsMap = targetMap.get(target)
	let dep = depsMap.get(key)
	triggerEffect(dep)
}
function triggerEffect(dep) {
	for (let _effect of dep) {
		if (_effect.scheduler) {
			_effect.scheduler()
		} else {
			_effect.run()
		}
	}
}

const get = createGetter()
const set = createSetter()
const readonlyGet = createGetter(true)
const shallowReadonlyGet = createGetter(true, true)
function createGetter(isReadonly = false, shallow = false) {
	return function getter(target, key) {
		const res = Reflect.get(target, key)
		if (key === ReactiveFlags.IS_REACTIVE) {
			return !isReadonly
		} else if (key == ReactiveFlags.IS_READONLY) {
			return isReadonly
		}
		if (shallow) {
			// 不进行 nested object 处理 ｜ 不进行依赖收集
			return res
		}
		if (isObject(res)) {
			return isReadonly ? readonly(res) : reactive(res)
		}
		if (!isReadonly) {
			// 收集依赖
			track(target, key)
		}
		return res
	}
}
function createSetter() {
	return function setter(target, key, value) {
		const res = Reflect.set(target, key, value)
		// 触发依赖
		trigger(target, key)
		return res
	}
}
const mutableHandlers = {
	get,
	set,
}
const readonlyHandlers = {
	get: readonlyGet,
	set(target, key, value) {
		console.warn(`key:${key} set 失败，因为 target 是 readonly！`, target)
		return true
	},
}
const shallowReadonlyHandlers = extend({}, readonlyHandlers, {
	get: shallowReadonlyGet,
})

var ReactiveFlags
;(function (ReactiveFlags) {
	ReactiveFlags['IS_REACTIVE'] = '__v_isReactive'
	ReactiveFlags['IS_READONLY'] = '__v_isReadonly'
})(ReactiveFlags || (ReactiveFlags = {}))
function reactive(raw) {
	return createActiveObject(raw, mutableHandlers)
}
function readonly(raw) {
	return createActiveObject(raw, readonlyHandlers)
}
function shallowReadonly(raw) {
	return createActiveObject(raw, shallowReadonlyHandlers)
}
function createActiveObject(raw, baseHandlers) {
	return new Proxy(raw, baseHandlers)
}

class RefImpl {
	constructor(value) {
		this.__v_isRef = true
		this.deps = new Set()
		this._rawValue = value
		this._value = convert(value)
	}
	get value() {
		trackRefValue(this)
		return this._value
	}
	set value(newValue) {
		if (hasChanged(newValue, this._rawValue)) return
		this._rawValue = newValue
		this._value = convert(newValue)
		triggerEffect(this.deps)
	}
}
function trackRefValue(ref) {
	if (isTracking()) {
		trackEffect(ref.deps)
	}
}
function ref(value) {
	return new RefImpl(value)
}
function convert(value) {
	return isObject(value) ? reactive(value) : value
}
function isRef(value) {
	return !!value['__v_isRef']
}
function unRef(ref) {
	return isRef(ref) ? ref.value : ref
}
function proxyRefs(objectWithRefs) {
	return new Proxy(objectWithRefs, {
		get(target, key) {
			return unRef(Reflect.get(target, key))
		},
		set(target, key, value) {
			if (isRef(target[key]) && !isRef(value)) {
				return (target[key].value = value)
			} else {
				return Reflect.set(target, key, value)
			}
		},
	})
}

function emit(instance, event, ...args) {
	const { props } = instance
	const handler = props[toHandlerKey(camelize(event))]
	handler && handler(...args)
}
const camelize = str => {
	return str.replace(/-(\w)/g, (_, c) => {
		return c ? c.toUpperCase() : ''
	})
}
const toHandlerKey = str => {
	return str ? 'on' + capitalize(str) : ''
}
const capitalize = str => {
	return str.charAt(0).toUpperCase() + str.slice(1)
}

function initProps(instance, rawProps) {
	instance.props = rawProps || {}
}

const publicPropertiesMap = {
	$el: i => i.vnode.el,
	$slots: i => i.slots,
	$props: i => i.props,
}
const PublicInstanceProxyHanlders = {
	get({ _: instance }, key) {
		const { setupState, props } = instance
		if (hasOwn(setupState, key)) {
			return setupState[key]
		} else if (hasOwn(props, key)) {
			return props[key]
		}
		const publicGetter = publicPropertiesMap[key]
		if (publicGetter) {
			return publicGetter(instance)
		}
	},
}

function initSlots(instance, children) {
	const { vnode } = instance
	if (vnode.shapeFlag & 16 /* ShapeFlags.SLOTS_CHILDREN */) {
		normalizeObjectSlots(instance, children)
	}
}
function normalizeObjectSlots(instance, children) {
	const slots = {}
	for (const key in children) {
		const value = children[key]
		slots[key] = props => normalizeSlotValue(value(props))
	}
	instance.slots = slots
}
function normalizeSlotValue(value) {
	return Array.isArray(value) ? value : [value]
}

let currentInstance = null
let compiler
function registerRuntimeCompiler(_compiler) {
	compiler = _compiler
}
function createComponentInstance(vnode, parent) {
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
	component.emit = emit.bind(null, component)
	return component
}
function setupComponent(instance, container) {
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
function handleSetupResult(instance, setupResult) {
	if (typeof setupResult == 'object') {
		instance.setupState = proxyRefs(setupResult)
	}
	finishComponentSetup(instance)
}
function finishComponentSetup(instance) {
	const Component = instance.type
	if (compiler && !Component.render) {
		if (Component.template) {
			Component.render = compiler(Component.template)
		}
	}
	instance.render = Component.render
}
function getCurrentInstance() {
	return currentInstance
}
function setCurrentInstance(instance) {
	currentInstance = instance
}

function provide(key, value) {
	var _a
	const instance = getCurrentInstance()
	if (instance) {
		let { provides } = instance
		const parentProvides =
			(_a = instance.parent) === null || _a === void 0
				? void 0
				: _a.provides
		if (provides === parentProvides) {
			// init
			provides = instance.provides = Object.create(parentProvides)
		}
		provides[key] = value
	}
}
function inject(key, defaultValue) {
	const instance = getCurrentInstance()
	if (instance) {
		let { provides } = instance.parent
		if (key in provides) {
			return provides[key]
		} else {
			if (typeof defaultValue === 'function') {
				return defaultValue()
			} else {
				return defaultValue
			}
		}
	}
}

function shouldUpdateComponent(n1, n2) {
	// props
	const { props: prevProps } = n1
	const { props: nextProps } = n2
	for (const key in prevProps) {
		if (nextProps[key] !== prevProps[key]) {
			return true
		}
	}
	return false
}

const queue = []
let isFlushPending = false
const p = Promise.resolve()
function nextTick(fn) {
	return fn ? p.then(fn) : p
}
function queueJobs(job) {
	if (!queue.includes(job)) {
		queue.push(job)
	}
	queueFlush()
}
function queueFlush() {
	if (isFlushPending) return
	isFlushPending = true
	nextTick(() => {
		flushJobs()
	})
}
function flushJobs() {
	isFlushPending = false
	let job
	while ((job = queue.shift())) {
		job()
	}
}

function createRenderer(options) {
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
				if (shapeFlag & 1 /* ShapeFlags.ELEMENT */) {
					processElement(n1, n2, container, parentComponent, anchor)
				} else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
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
		if (prevShapFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
			if (nextShapFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
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
			if (nextShapFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
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
		if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
			el.textContent = children
		} else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
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
		setupComponent(instance)
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
					const subTree = (instance.subTree = instance.render.call(
						proxy,
						proxy
					))
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
					const subTree = instance.render.call(proxy, proxy)
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
function getSequence(arr) {
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

function createElement(type) {
	return document.createElement(type)
}
function patchProp(el, key, prevVal, nextVal) {
	if (isOn(key)) {
		const event = key.slice(2).toLowerCase()
		el.addEventListener(event, nextVal)
	} else {
		if (nextVal == null) {
			el.removeAttribute(key)
		} else {
			el.setAttribute(key, nextVal)
		}
	}
}
function insert(el, container, anchor) {
	container.insertBefore(el, anchor || null)
}
function remove(el) {
	const parent = el.parentNode
	if (parent) {
		parent.removeChild(el)
	}
}
function setElementText(container, text) {
	container.textContent = text
}
const renderer = createRenderer({
	createElement,
	patchProp,
	insert,
	remove,
	setElementText,
})
function createApp(...args) {
	return renderer.createApp(...args)
}

var runtimeDom = /*#__PURE__*/ Object.freeze({
	__proto__: null,
	createApp: createApp,
	createAppAPI: createAppAPI,
	createElementVNode: createVNode,
	createRenderer: createRenderer,
	createTextVNode: createTextVNode,
	effect: effect,
	getCurrentInstance: getCurrentInstance,
	h: h,
	inject: inject,
	nextTick: nextTick,
	provide: provide,
	proxyRefs: proxyRefs,
	ref: ref,
	registerRuntimeCompiler: registerRuntimeCompiler,
	renderSlots: renderSlots,
	shallowReadonly: shallowReadonly,
	toDisplayString: toDisplayString,
})

function add(a, b) {
	return a + b
}
function compileToFunction(tempalte) {
	const { code } = baseCompile(tempalte)
	const render = new Function('Vue', code)(runtimeDom)
	return render
}
registerRuntimeCompiler(compileToFunction)

export {
	add,
	createApp,
	createAppAPI,
	createVNode as createElementVNode,
	createRenderer,
	createTextVNode,
	effect,
	getCurrentInstance,
	h,
	inject,
	nextTick,
	provide,
	proxyRefs,
	ref,
	registerRuntimeCompiler,
	renderSlots,
	shallowReadonly,
	toDisplayString,
}
