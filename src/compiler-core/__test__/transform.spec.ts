import { NodeTypes } from '../src/ast'
import { baseParse, transform } from '../src/index'

describe('transform', () => {
	it('happy path', () => {
		const ast = baseParse('<div>hi,{{message}}</div>')

		const plugin = node => {
			if (node.type === NodeTypes.TEXT) {
				node.content += ' Jayden'
			}
		}

		transform(ast, {
			nodeTransforms: [plugin],
		})

		const nodeText = ast.children[0].children[0]
		expect(nodeText.content).toBe('hi, Jayden')
	})
})
