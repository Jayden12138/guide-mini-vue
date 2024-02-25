import { NodeTypes } from "./ast"

export function baseParse(content: string){
    const context = createParserContext(content)
    return createRoot(parseChildren(context))
}

function parseChildren(context){
    const nodes: any = []
    let node;
    if(context.source.startsWith("{{")){
        node = parseInterpolation(context)
    }
    nodes.push(node)
    return nodes;
}

function parseInterpolation(context){
    // {{ message }}

    const openDelimiter = "{{"
    const closeDelimiter = "}}"

    const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length)

    advanceBy(context, openDelimiter.length) // 推进代码

    const rawContentLength = closeIndex - openDelimiter.length

    const rawContent = context.source.slice(0, rawContentLength)

    const content = rawContent.trim()


    advanceBy(context, rawContentLength + closeDelimiter.length)// 已经处理了的就从 context 中删除，继续处理后面的内容

    return {
        type: NodeTypes.INTERPOLATION,
        content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: content
        }
    }
}

function advanceBy(context, length: number){
    context.source = context.source.slice(length)
}

function createRoot(children){
    return {
        children
    }
}

export function createParserContext(content: string){
    return {
        source: content
    }
}