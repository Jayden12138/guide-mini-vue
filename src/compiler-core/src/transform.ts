export function transform(root, options = {}) {
	const context = createTransformContext(root, options)
	traverseNode(root, context)

	createCodegenNode(root)
}

function traverseNode(node, context) {
	const { nodeTransforms } = context
	for (let i = 0; i < nodeTransforms.length; i++) {
		const plugin = nodeTransforms[i]
		plugin(node)
	}

	traverseChildren(node, context)
}

function traverseChildren(node: any, context: any) {
	const children = node.children
	if (children) {
		for (let i = 0; i < children.length; i++) {
			const n = children[i]
			traverseNode(n, context)
		}
	}
}

function createTransformContext(root: any, options: any) {
	const context = {
		root,
		nodeTransforms: options.nodeTransforms || [],
	}
	return context
}
function createCodegenNode(root: any) {
	root.codegenNode = root.children[0]
}
