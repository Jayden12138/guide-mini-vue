export function add(a,b){
    return a+b;
}


import * as runtimeDom from './runtime-dom';

export * from './runtime-dom/index';
export * from './reactivity/src/index';

import { baseCompile } from './compiler-core/src';
import { registerRuntimeCompiler } from './runtime-dom';


function compileToFunction(tempalte) {
    const { code } = baseCompile(tempalte);
    const render = new Function('Vue', code)(runtimeDom);
    return render
}

registerRuntimeCompiler(compileToFunction)