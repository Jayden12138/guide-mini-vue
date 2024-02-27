import { h, getCurrentInstance } from '../../lib/mini-vue.esm.js';

export const Foo = {
    setup() {
        const instance = getCurrentInstance();
        console.log('foo: ', instance);
    },
    render() {
        const foo = h('div', {}, 'foo');
        return h('div', {}, [foo]);
    },
};
