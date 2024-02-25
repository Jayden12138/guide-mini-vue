import { generate } from "../src/codegen"
import { baseParse } from "../src/parse"
import { transform } from "../src/transform"

describe('codegen', () => {

    it('string', () => {
        const ast = baseParse('hi')

        transform(ast, {
            nodeTransforms: []
        })
        const { code } = generate(ast)

        // 快照
        // 1. 抓 bug
        // 2. update 快照 有意
        expect(code).toMatchSnapshot()

    })
})