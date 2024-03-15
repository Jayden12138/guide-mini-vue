import { h } from '../../lib/guide-mini-vue.esm.js'
window.self = null
export const Foo = {
	setup(props) {
		props.count++
		console.log(props)
	},
	render() {
		window.self = this
		return h('div', {}, 'foo: ' + this.count)
	},
}
