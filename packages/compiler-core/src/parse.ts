export function baseParse(content: string){
    const context = createParserContext(content)
    return createRoot(parseChildren(context))
}

function parseChildren(context){
    const nodes: any = []
    const node = parseInterpolation(context)
    nodes.push(node)
    return nodes;
}

function parseInterpolation(context){
    // {{ message }}
    const closeIndex = context.source.indexOf('}}', 2)
    context.source = context.source.slice(2)
    // console.log(context.source)
    const rawContentLength = closeIndex - 2

    const rawContent = context.source.slice(0, rawContentLength)
    // console.log(rawContent)
    const content = rawContent.trim()

    console.log(content)

    context.source = context.source.slice(rawContentLength + 2) // 已经处理了的就从 context 中删除，继续处理后面的内容

    return {
        type: 'interpolation',
        content: {
            type: 'simple_expression',
            content: content
        }
    }
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