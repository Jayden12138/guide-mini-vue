import { baseParse } from '../src/parse'

describe('parse', () => {
    
    test('simple interpolation', ()=>{
        const ast = baseParse("{{message}}");

        // root
        expect(ast.children[0]).toStrictEqual({
            type: 'interpolation', // 'interpolation'
            content: {
                type: 'simple_expression', // 'simple_expression'
                content: 'message'
            }
        })
    })

})