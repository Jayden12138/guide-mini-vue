import { h } from '../../lib/mini-vue.esm.js';
import { Foo } from './Foo.js'

export const App = {
  setup() {},
    render() {
        /**
         * 作用域插槽
         * 
         */
        const app = h('div', {}, 'App')
        const foo = h(
            Foo,
            {},
            // [
            //     h('p', {}, 'fo'),
            //     h('p', {}, 'o'),
            // ]
            // h('p', {}, 'foo00')
            {
                header: ({age}) => h('p', {}, 'header - '+age),
                footer: () => h('p', {}, 'footer'),
            }
        )


        return h('div', {}, [app, foo]);
    },
};
