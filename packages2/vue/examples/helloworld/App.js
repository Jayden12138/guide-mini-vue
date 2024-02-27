// import { h } from '../../node_modules/vue/dist/vue.esm-browser.js'
import { h } from '../../dist/guide-mini-vue.esm.js'
import { Foo } from './Foo.js'

window.self = null
export const App = {
    name: 'App',
    render() {
        window.self = this
        return h(
            'div',
            {
                id: 'root',
                class: ['red', 'hard'],
                onClick() {
                    console.log('click')
                },
                onMouseDown() {
                    console.log('onMousedown')
                }
            },
            // setupState
            // this.$el
            // 为了实现通过this可以访问到以上内容，通过proxy来实现
            // 'hi ' + this.msg
            // string
            // 'hi hi',
            // // array
            // [
            //     h('p', { class: 'red' }, 'p1'),
            //     h('p', { class: 'blue' }, 'p2')
            // ]

            // props
            [
                h('p', { class: 'red' }, 'hi ' + this.msg),
                h(Foo, {
                    count: 1
                })
            ]
        )
    },
    setup() {

        return {
            msg: 'vue'
        }
    }
}