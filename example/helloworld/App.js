import { h } from '../../lib/guide-mini-vue.esm.js'
export const App = {
	render() {
		return h(
			'div',
			{
				id: 'root',
				class: ['red', 'hard'],
			},
			// this
			// 'hi, ' + this.msg

			// string
			// 'hi jayden',

			// children
			[
				h('p', { class: 'red' }, 'hi'),
				h('p', { class: 'blue' }, 'jayden'),
			]
		)
	},
	setup() {
		return {
			msg: 'jayden',
		}
	},
}
