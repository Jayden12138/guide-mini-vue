export function add(a,b){
    return a+b;
}


import * as runtimeDom from '@guide-mini-vue/runtime-dom';

export * from '@guide-mini-vue/runtime-dom';

import { baseCompile } from '@guide-mini-vue/compiler-core';
import { registerRuntimeCompiler } from '@guide-mini-vue/runtime-dom';


function compileToFunction(tempalte) {
    const { code } = baseCompile(tempalte);
    const render = new Function('Vue', code)(runtimeDom);
    return render
}

registerRuntimeCompiler(compileToFunction)