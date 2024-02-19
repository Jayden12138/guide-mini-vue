import { h } from '../../lib/mini-vue.esm.js';
// 26 props
/**
 * 1. setup(props)
 * 2. render 中 使用this.xxx 可以访问到props中的属性
 * 3. props 只读 readonly
 */

export const Foo = {
  setup(props) {
    // props.count
    console.log(props);
  },
  render() {
    return h('div', {}, 'foo: ' + this.count);
  },
};
