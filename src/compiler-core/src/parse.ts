import { NodeTypes } from './ast'

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

	// message
	let rawContentLength = closeIndex - closeDelimiter.length
	let rawContent = context.source.slice(0, rawContentLength)
	const content = rawContent.trim()

	// message}}
	advanceBy(context, rawContentLength + closeDelimiter.length)

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

	let node
	let s = context.source
	if (s.startsWith('{{')) {
		node = parseInterpolation(context)
	}
	nodes.push(node)

	return nodes
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
