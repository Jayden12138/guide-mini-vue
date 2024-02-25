import { NodeTypes } from "./ast"


export enum TagType {
    Start,
    End
}

export function baseParse(content: string){
    const context = createParserContext(content)
    return createRoot(parseChildren(context, ""))
}

function parseChildren(context, parentTag){
    const nodes: any = []

    while(!isEnd(context, parentTag)){
        let node;
        const s = context.source;
        if(s.startsWith("{{")){
            node = parseInterpolation(context)
        }else if(s.startsWith("<")){
            if(/[a-z]/i.test(s[1])){
                node = parseElement(context)
            }
        }


        if(!node){
            node = parseText(context)
        }

        nodes.push(node)
    }
    return nodes;
}

function isEnd(context, parentTag){
    // 停止循环标识
    // 1. source 处理完
    // 2. 处理结束标签

    // 2.
    const s = context.source
    if(parentTag && s.startsWith(`</${parentTag}>`)){
        return true
    }

    // 1. 
    return !s
}

function parseText(context){
    // Implement
    // 1. 解析 text
    // 2. 删除处理完成的代码

    // {{
    let endIndex = context.source.length
    let endToken = "{{"

    const index = context.source.indexOf(endToken)
    if(index !== -1){
        endIndex = index
    }

    const content = parseTextData(context, endIndex)

    return { 
        type: NodeTypes.TEXT,
        content
    }
}

function parseTextData(context, length){
    // 1.
    const content = context.source.slice(0, length);
    // 2.
    advanceBy(context, length)

    return content
}

function parseElement(context: any){
    const element: any = parseTag(context, TagType.Start) // <div>

    // 递归处理 children
    element.children = parseChildren(context, element.tag)

    parseTag(context, TagType.End) // </div>

    // console.log(context.source)

    return element
}

function parseTag(context, type: TagType){

    // Implement
    // 1. 解析 tag
    // 2. 删除处理完成的代码

    // 1. 
    const match: any = /^<\/?([a-z]*)/i.exec(context.source);
    const tag = match[1];

    // 2.
    advanceBy(context, match[0].length); // <div
    advanceBy(context, 1); // >

    if(type === TagType.End) return


    return {
        type: NodeTypes.ELEMENT,
        tag
    }
}

function parseInterpolation(context){
    // {{ message }}

    const openDelimiter = "{{"
    const closeDelimiter = "}}"

    const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length)

    advanceBy(context, openDelimiter.length) // 推进代码

    const rawContentLength = closeIndex - openDelimiter.length

    // const rawContent = context.source.slice(0, rawContentLength)

    const rawContent = parseTextData(context, rawContentLength)


    const content = rawContent.trim()


    advanceBy(context, closeDelimiter.length)// 已经处理了的就从 context 中删除，继续处理后面的内容

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