import { h } from '../../lib/mini-vue.esm.js';
import { Foo } from './Foo.js'

export const App = {
  setup() {},
    render() {
        const app = h('div', {}, 'App')
        const foo = h(Foo, {}, h('p', {}, 'fo'))


        return h('div', {}, [app, foo]);
    },
};
