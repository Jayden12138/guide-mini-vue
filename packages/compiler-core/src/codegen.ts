export function generate(ast){

    // return 
    let code = ''
    code += "return "

    const functionName = "render"
    const args = ["_ctx", "_cache"]
    const signature = args.join(", ")

    code += `function ${functionName}(${signature}) {`
    code +=  "return 'hi'"
    code += "}"


    return {
        code
    }
}