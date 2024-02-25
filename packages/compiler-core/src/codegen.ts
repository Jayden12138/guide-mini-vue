export function generate(ast){
    return {
        // https://template-explorer.vuejs.org
        code: `
            return function render(_ctx, _cache, $props, $setup, $data, $options) {
                return "hi"
            }
        `
    }
}