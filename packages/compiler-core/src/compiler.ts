import {
	baseParse,
	generate,
	transform,
	transformElement,
	transformExpression,
	transformText,
} from './index'

export function baseCompile(tempalte) {
	const ast = baseParse(tempalte)

	transform(ast, {
		nodeTransforms: [transformExpression, transformElement, transformText],
	})

	return generate(ast)
}
