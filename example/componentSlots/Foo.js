import { h } from '../../lib/mini-vue.esm.js'


export const Foo = {
    name: 'Foo',
    setup() {
        return {}
    },
    render() {
        const foo = h('div', {}, 'foo')
        console.log(this.$slots);
        return h('div', {}, [foo, this.$slots])
    }
}