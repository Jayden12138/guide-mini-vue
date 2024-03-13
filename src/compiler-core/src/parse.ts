import { NodeTypes } from './ast'

const enum TagType {
	Start,
	End,
}

export function baseParse(content: string) {
	const context = createContext(content)
	return createRoot(parseChildren(context))
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

function parseChildren(context) {
	const nodes: any = []

	while (!isEnd(context)) {
		let node
		let s = context.source
		if (s.startsWith('{{')) {
			node = parseInterpolation(context)
		} else if (s.startsWith('<')) {
			if (/[a-z]/.test(s[1])) {
				node = parseElement(context)
			}
		} else {
			node = parseText(context)
		}
		nodes.push(node)
	}

	return nodes
}

function isEnd(context) {
	const s = context.source
	if (s.startsWith('</')) {
		return true
	}

	return !s
}

function parseText(context) {
	let endToken = '{{'
	let endIndex = context.source.indexOf(endToken)
	let length = context.source.length

	if (endIndex !== -1) {
		length = endIndex
	}

	const content = parseTextData(context, length)

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
function parseElement(context: any) {
	const element: any = parseTag(context, TagType.Start)
	element.children = parseChildren(context)
	parseTag(context, TagType.End)

	return element
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
