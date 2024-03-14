import { baseParse, generate, transform } from '../src/index'

describe('codegen', () => {
	it('string', () => {
		const ast = baseParse('hi')

		transform(ast)

		const { code } = generate(ast)

		expect(code).toMatchSnapshot()
	})
})
