import { createRenderer } from '@tiny-vue/runtime-core'
import { isOn } from '@tiny-vue/shared'

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

const renderer: any = createRenderer({
	createElement,
	patchProp,
	insert,
	remove,
	setElementText,
})

export function createApp(...args) {
	return renderer.createApp(...args)
}

export * from '@tiny-vue/runtime-core'
