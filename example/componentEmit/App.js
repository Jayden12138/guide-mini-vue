import { h } from '../../lib/mini-vue.esm.js';
import { Foo } from './Foo.js';

export const App = {
  name: 'App',
  render() {
    return h(
      'div',
      {
        
      },
        [
            h('p', {}, 'hi'),
            h(Foo, {
                // on + event name
                onAdd(a, b) {
                    console.log('onAdd', a, b);
                }
            })
        ]
    );
  },
  setup() {
    return {};
  },
};
