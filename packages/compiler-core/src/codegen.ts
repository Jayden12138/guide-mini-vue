export function generate(ast){
    const context = createCodegenContext()

    const {push} = context

    const VueBinging = "Vue"

    // const helpers = ["toDisplayString"] // ast.helpers

    const aliasHelpers = (s) => `${s}: _${s}`

    push(`const { ${ast.helpers.map(aliasHelpers).join(", ")} } = ${VueBinging}`)

    //  添加个回车
    push("\n")

    // return 
    push("return ")

    const functionName = "render"
    const args = ["_ctx", "_cache"]
    const signature = args.join(", ")

    push(`function ${functionName}(${signature}) {`)

    push(`return `)
    genNode(ast.codegenNode, context)
    push("}")


    return {
        code: context.code
    }
}

function createCodegenContext(): any{
    const context = {
        code: "",
        push(source){
            context.code += source
        }
    }
    return context
}

function genNode(node, context){
    const {push} = context
    push(`'${node.content}'`)
}