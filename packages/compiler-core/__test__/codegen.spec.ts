import { baseParse, generate, transform } from '../src/index'
import { transformElement } from '../src/transforms/transformElement'
import { transformExpression } from '../src/transforms/transformExpression'
import { transformText } from '../src/transforms/transformText'

describe('codegen', () => {
	it('string', () => {
		const ast = baseParse('hi')

		transform(ast)

		const { code } = generate(ast)

		expect(code).toMatchSnapshot()
	})

	it('interpolation', () => {
		const ast = baseParse('{{message}}')

		transform(ast, {
			nodeTransforms: [transformExpression],
		})
		const { code } = generate(ast)

		expect(code).toMatchSnapshot()
	})

	it('element', () => {
		const ast = baseParse('<div></div>')

		transform(ast, {
			nodeTransforms: [transformElement],
		})
		const { code } = generate(ast)

		expect(code).toMatchSnapshot()
	})

	it('happy path', () => {
		const ast = baseParse('<div>hi,{{message}}</div>')

		transform(ast, {
			nodeTransforms: [
				transformExpression,
				transformElement,
				transformText,
			],
		})
		const { code } = generate(ast)

		expect(code).toMatchSnapshot()
	})
})
