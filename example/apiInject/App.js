import { h, provide, inject } from '../../lib/mini-vue.esm.js';

const Provider = {
  name: 'Provider',
  setup() {
    provide('foo', 'fooVal');
    provide('bar', 'barVal');
  },
  render() {
    return h('div', {}, [h('p', {}, 'Provider'), h(ProviderTwo)]);
  },
};

const ProviderTwo = {
  name: 'ProviderTwo',
  setup() {
    provide('foo', 'fooTwo');
    const foo = inject('foo');
    return {
      foo
    }
  },
  render() {
    return h('div', {}, [h('p', {}, 'ProviderTwo: ' + this.foo), h(Consumer)]);
  },
};

const Consumer = {
  name: 'Consumer',
  setup() {
    const foo = inject('foo');
    const bar = inject('bar');
    const baz = inject('baz', 'defaultBaz');
    return {
      foo,
      bar,
      baz
    };
  },
  render() {
    return h('div', {}, [
      h('p', {}, `foo: ${this.foo}`),
      h('p', {}, `bar: ${this.bar}`),
      h('p', {}, `baz: ${this.baz}`),
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
