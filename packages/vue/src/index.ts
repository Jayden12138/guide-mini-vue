import { baseCompile } from '@tiny-vue/compiler-core'
import * as runtimeDom from '@tiny-vue/runtime-dom'
import { registerRuntimeCompiler } from '@tiny-vue/runtime-dom'

export function add(a, b) {
	return a + b
}

export * from '@tiny-vue/runtime-dom'

function compileToFunction(tempalte) {
	const { code } = baseCompile(tempalte)
	const render = new Function('Vue', code)(runtimeDom)
	return render
}

registerRuntimeCompiler(compileToFunction)
