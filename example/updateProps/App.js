import { h, ref } from '../../lib/mini-vue.esm.js'


/**
 * 1. foo: foo -> foo: new-foo -> 修改
 * 2. foo: foo -> foo: null | undefined -> 删除
 * 3. foo: foo, bar: bar -> foo: foo -> 删除bar
 */

export const App = {
    name: 'App',
    setup() {
        const props = ref({ foo: 'foo', bar: 'bar' })

        const onChangePropsDemo1 = () => {
            props.value.foo = 'new-foo'
        }

        const onChangePropsDemo2 = () => {
            props.value.foo = undefined
        }

        const onChangePropsDemo3 = () => {
            delete props.value.bar
        }

        return {
            props,
            onChangePropsDemo1,
            onChangePropsDemo2,
            onChangePropsDemo3
        }
    },
    render() {
        return h('div', {
            id: 'root',
            ...this.props
        }, [
            h('button', { onClick: this.onChangePropsDemo1 }, 'onChangePropsDemo1'),
            h('button', { onClick: this.onChangePropsDemo2 }, 'onChangePropsDemo2'),
            h('button', { onClick: this.onChangePropsDemo3 }, 'onChangePropsDemo3'),
        ])
    }
}