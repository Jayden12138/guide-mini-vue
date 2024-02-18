import { h } from '../../node_modules/vue/dist/vue.esm-browser.js'
export const App = {
    render() {
        return h('div', 'hi ' + this.msg)
    },
    setup() {

        return {
            msg: 'vue'
        }
    }
}