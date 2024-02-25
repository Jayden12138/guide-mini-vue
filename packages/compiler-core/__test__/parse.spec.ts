import { NodeTypes } from '../src/ast';
import { baseParse } from '../src/parse'

describe('parse', () => {
    
    test('simple interpolation', ()=>{
        const ast = baseParse("{{message}}");

        // root
        expect(ast.children[0]).toStrictEqual({
            type: NodeTypes.INTERPOLATION, // 'interpolation'
            content: {
                type: NodeTypes.SIMPLE_EXPRESSION, // 'simple_expression'
                content: 'message'
            }
        })
    })

    describe('should parse element', ()=>{
        test('simple element', ()=>{
            const ast = baseParse("<div></div>");
            expect(ast.children[0]).toStrictEqual({
                type: NodeTypes.ELEMENT,
                tag: 'div',
                children: []
            })
        })
    })

    describe('should parse text', ()=>{
        test('simple text', ()=>{
            const ast = baseParse("some text");
            expect(ast.children[0]).toStrictEqual({
                type: NodeTypes.TEXT,
                content: 'some text'
            })
        })
    })


    test('hello world', ()=>{
        const ast = baseParse("<div>hi,{{message}}</div>");
        expect(ast.children[0]).toStrictEqual({
            type: NodeTypes.ELEMENT,
            tag: 'div',
            children: [
                {
                    type: NodeTypes.TEXT,
                    content: 'hi,'
                },
                {
                    type: NodeTypes.INTERPOLATION,
                    content: {
                        type: NodeTypes.SIMPLE_EXPRESSION,
                        content: 'message'
                    }
                }
            ]
        })
    })

    test('should parse nested element', ()=>{
        const ast = baseParse("<div><p>hi</p>{{message}}</div>");
        expect(ast.children[0]).toStrictEqual({
            type: NodeTypes.ELEMENT,
            tag: 'div',
            children: [
                {
                    type: NodeTypes.ELEMENT,
                    tag: 'p',
                    children: [
                        {
                            type: NodeTypes.TEXT,
                            content: 'hi'
                        }
                    ]
                },
                {
                    type: NodeTypes.INTERPOLATION,
                    content: {
                        type: NodeTypes.SIMPLE_EXPRESSION,
                        content: 'message'
                    }
                }
            ]
        })
    })
})