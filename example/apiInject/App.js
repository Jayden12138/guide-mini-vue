import { h, provide, inject } from '../../lib/mini-vue.esm.js';

const Provider = {
  name: 'Provider',
  setup() {
    provide('foo', 'fooVal');
    provide('bar', 'barVal');
  },
  render() {
    return h('div', {}, [h('p', {}, 'Provider'), h(Consumer)]);
  },
};

const Consumer = {
  name: 'Consumer',
  setup() {
    const foo = inject('foo');
    const bar = inject('bar');
    return {
      foo,
      bar,
    };
  },
  render() {
    return h('div', {}, [
      h('p', {}, `foo: ${this.foo}`),
      h('p', {}, `bar: ${this.bar}`),
    ]);
  },
};

export const App = {
  name: 'App',
  setup() {},
  render() {
    return h('div', {}, [h('p', {}, 'app'), h(Provider)]);
  },
};
