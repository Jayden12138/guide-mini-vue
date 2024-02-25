export function generate(ast){

    // return 
    let code = ''
    code += "return "

    const functionName = "render"
    const args = ["_ctx", "_cache"]
    const signature = args.join(", ")

    code += `function ${functionName}(${signature}) {`

    const node = ast.codegenNode

    code +=  `return '${node.content}'`
    code += "}"


    return {
        code
    }
}