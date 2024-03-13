import { NodeTypes } from './ast'

const enum TagType {
	Start,
	End,
}

export function baseParse(content: string) {
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
		type: NodeTypes.INTERPOLATION, // 'interpolation'
		content: {
			type: NodeTypes.SIMPLE_EXPRESSION, // 'simple_expression'
			content: content,
		},
	}
}

function advanceBy(context, numberOfCharacters) {
	context.source = context.source.slice(numberOfCharacters)
}

function parseChildren(context, ancestor) {
	const nodes: any = []

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
		type: NodeTypes.TEXT,
		content,
	}
}

function parseTextData(context, length) {
	const content = context.source.slice(0, length)
	advanceBy(context, length)
	return content
}

function createContext(content: string) {
	return {
		source: content,
	}
}

function createRoot(children) {
	return {
		children,
	}
}
function parseElement(context: any, ancestor) {
	const element: any = parseTag(context, TagType.Start)
	ancestor.push(element)
	element.children = parseChildren(context, ancestor)
	ancestor.pop()

	if (startsWithCloseTagOpen(context.source, element.tag)) {
		parseTag(context, TagType.End)
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
function parseTag(context: any, type: TagType) {
	const match: any = /^<\/?([a-z]*)/.exec(context.source)
	const tag = match[1]

	// <div
	advanceBy(context, match[0].length)

	// >
	advanceBy(context, 1)

	if (type === TagType.End) return

	return {
		type: NodeTypes.ELEMENT,
		tag,
	}
}
