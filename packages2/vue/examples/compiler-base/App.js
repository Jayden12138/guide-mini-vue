import { ref } from '../../dist/guide-mini-vue.esm.js';

export const App = {
  name: 'App',
  template: `<div>hi, {{ msg }}, {{ count }}</div>`,
  setup() {
    const count = (window.count = ref(0));
      return {
        count,
      msg: 'hello world',
    };
  },
};
