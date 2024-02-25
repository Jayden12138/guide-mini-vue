import { NodeTypes } from "./ast"

export function transform(root, options = {}) {
    // 
    const context = createTransformContext(root, options)


    // 1. 遍历 - 深度优先搜索
    // 2. 修改 text - content

    // 1. 
    traverseNode(root, context)

    // codegen root 不用 generate 需要从 root.children[0] 开始
    createRootCodegen(root)


    root.helpers = [...context.helpers.keys()]
}

function createRootCodegen(root){
    root.codegenNode = root.children[0]
}

function createTransformContext(root: any, options: any){
    const context = {
        root,
        nodeTransforms: options.nodeTransforms || [],
        helpers: new Map(),
        helper(key){
            context.helpers.set(key, 1)
        }
    }
    
    return context
}


function traverseNode(node: any, context){

    const nodeTransforms = context.nodeTransforms;
    for(let i = 0; i < nodeTransforms.length; i++){
        const transform = nodeTransforms[i]
        transform(node)
    }

    const { type } = node
    switch (type) {
        case NodeTypes.INTERPOLATION:
            context.helper("toDisplayString")
            break;
        default:
            break;
    }

    traverseChildren(node, context);
}

function traverseChildren(node: any, context: any) {
    const children = node.children;

    if (children) {
        for (let i = 0; i < children.length; i++) {
            const node = children[i];
            traverseNode(node, context);
        }
    }
}
