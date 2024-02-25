import { NodeTypes } from "./ast";

export function transform(root){
    // 1. 遍历 - 深度优先搜索
    // 2. 修改 text - content

    // 1. 
    traverseNode(root)
}


function traverseNode(node: any){
    console.log(node)

    if(node.type == NodeTypes.TEXT){
        node.content = node.content + " djj"
    }

    const children = node.children;

    if(children){
        for(let i = 0; i < children.length; i++){
            const node = children[i]
            traverseNode(node)
        }
    }
}