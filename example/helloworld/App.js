// import { h } from '../../node_modules/vue/dist/vue.esm-browser.js'
import { h } from '../../lib/mini-vue.esm.js'
export const App = {
    render() {
        return h(
            'div',
            {
                id: 'root',
                class: ['red', 'hard']
            },
            // 'hi ' + this.msg
            // string
            // 'hi hi',
            // array
            [
                h('p', { class: 'red' }, 'p1'),
                h('p', { class: 'blue' }, 'p2')
            ]
        )
    },
    setup() {

        return {
            msg: 'vue'
        }
    }
}