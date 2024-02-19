import { h, renderSlots } from '../../lib/mini-vue.esm.js';


export const Foo = {
    name: 'Foo',
    setup() {
        return {}
    },
    render() {
        const foo = h('div', {}, 'foo')
        console.log(this.$slots);
        // this.$slots array -> vnode
        // return h('div', {}, [foo, h('div', {}, this.$slots)]);
        return h('div', {}, [foo, renderSlots(this.$slots)]);
    }
}