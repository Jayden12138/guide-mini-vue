import { baseCompile } from './compiler-core/src/index'
import * as runtimeDom from './runtime-dom/index'
import { registerRuntimeCompiler } from './runtime-dom/index'

export function add(a, b) {
	return a + b
}

export * from './runtime-dom/index'

function compileToFunction(tempalte) {
	const { code } = baseCompile(tempalte)
	const render = new Function('Vue', code)(runtimeDom)
	return render
}

registerRuntimeCompiler(compileToFunction)
