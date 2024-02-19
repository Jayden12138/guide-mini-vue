// import { h } from '../../node_modules/vue/dist/vue.esm-browser.js'
import { h } from '../../lib/mini-vue.esm.js'

window.self = null
export const App = {
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
            'hi ' + this.msg
            // string
            // 'hi hi',
            // // array
            // [
            //     h('p', { class: 'red' }, 'p1'),
            //     h('p', { class: 'blue' }, 'p2')
            // ]
        )
    },
    setup() {

        return {
            msg: 'vue'
        }
    }
}