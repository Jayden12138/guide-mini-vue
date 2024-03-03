import { h } from '../../lib/guide-mini-vue.esm.js'
window.self = null
export const App = {
	render() {
		window.self = this
		return h(
			'div',
			{
				id: 'root',
				class: ['red', 'hard'],
			},
			// this
			'hi, ' + this.msg

			// string
			// 'hi jayden',

			// children
			// [
			// 	h('p', { class: 'red' }, 'hi'),
			// 	h('p', { class: 'blue' }, 'jayden'),
			// ]
		)
	},
	setup() {
		return {
			msg: 'jayden',
		}
	},
}
